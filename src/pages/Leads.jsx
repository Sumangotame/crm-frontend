import React, { useEffect, useState } from "react";
import { getLeads, addLead, updateLead, deleteLead } from "../services/leadService";
import NavBar from "../components/NavBar";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [editingLead, setEditingLead] = useState(null);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [newLead, setNewLead] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    status: "NEW",
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await getLeads();
      setLeads(response.data);
    } catch (err) {
      console.error("Error fetching leads:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ownerId = localStorage.getItem("userid");
      if (!ownerId) {
        alert("User ID not found. Please log in again.");
        return;
      }

      const leadData = { ...newLead, owner: { id: ownerId } };

      if (editingLead) await updateLead(editingLead.id, leadData);
      else await addLead(leadData);

      setNewLead({ firstName: "", lastName: "", email: "", phone: "", company: "", source: "", status: "NEW" });
      setEditingLead(null);
      loadLeads();
    } catch (err) {
      console.error("Error saving lead:", err);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setNewLead(lead);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLead(id);
      loadLeads();
    } catch (err) {
      console.error("Error deleting lead:", err);
    }
  };

  // Filtered & paginated leads
  const filteredLeads = leads.filter(l =>
    l.firstName.toLowerCase().includes(search.toLowerCase()) ||
    l.lastName.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CSV Export
  const csvHeaders = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Company", key: "company" },
    { label: "Source", key: "source" },
    { label: "Status", key: "status" },
  ];

  // Excel Export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLeads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "leads.xlsx");
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Leads Report", 14, 20);
    autoTable(doc, {
      head: [["#", "First Name", "Last Name", "Email", "Phone", "Company", "Source", "Status"]],
      body: filteredLeads.map((lead, index) => [
        index + 1,
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phone,
        lead.company,
        lead.source,
        lead.status
      ]),
      startY: 25,
    });
    doc.save("leads.pdf");
  };

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Leads Management</h3>

        {/* Search & Export */}
        <div className="d-flex justify-content-between mb-3">
          <input
            type="text"
            className="form-control w-25"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div>
            <button className="btn btn-primary me-2" onClick={exportExcel}>Export Excel</button>
            <CSVLink data={filteredLeads} headers={csvHeaders} filename="leads.csv" className="btn btn-success me-2">
              Export CSV
            </CSVLink>
            <button className="btn btn-danger" onClick={exportPDF}>Export PDF</button>
          </div>
        </div>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row g-2">
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="First Name" value={newLead.firstName} onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Last Name" value={newLead.lastName} onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input type="email" className="form-control" placeholder="Email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Phone" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Company" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Source" value={newLead.source} onChange={(e) => setNewLead({ ...newLead, source: e.target.value })} />
            </div>
          </div>
          <div className="row g-2 mt-2 align-items-center">
            <div className="col-md-3">
              <select className="form-select" value={newLead.status} onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}>
                <option>NEW</option>
                <option>CONTACTED</option>
                <option>QUALIFIED</option>
                <option>CONVERTED</option>
                <option>LOST</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" type="submit">{editingLead ? "Update" : "Add"}</button>
            </div>
          </div>
        </form>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead, index) => (
                  <tr key={lead.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{lead.firstName}</td>
                    <td>{lead.lastName}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.company}</td>
                    <td>{lead.source}</td>
                    <td>{lead.status}</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(lead)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(lead.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}

export default Leads;
