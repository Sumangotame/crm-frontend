import React, { useEffect, useState } from "react";
import {
  getActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  getLeads,
  getContacts,
  getAccounts,
  getOpportunities,
} from "../services/activityService";
import NavBar from "../components/NavBar";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Activities() {
  const [activities, setActivities] = useState([]);
  const [editingAct, setEditingAct] = useState(null);
  const [newAct, setNewAct] = useState({
    type: "CALL",
    subject: "",
    notes: "",
    relatedType: "",
    relatedTo: "",
    dueDate: "",
  });

  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadActivities();
    loadDropdowns();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await getActivities();
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDropdowns = async () => {
    try {
      setLeads((await getLeads()).data);
      setContacts((await getContacts()).data);
      setAccounts((await getAccounts()).data);
      setOpportunities((await getOpportunities()).data);
    } catch (err) {
      console.error(err);
    }
  };

  const getRelatedOptions = () => {
    switch (newAct.relatedType) {
      case "LEAD":
        return leads;
      case "CONTACT":
        return contacts;
      case "ACCOUNT":
        return accounts;
      case "OPPORTUNITY":
        return opportunities;
      default:
        return [];
    }
  };

  const getRelatedName = (relatedType, relatedTo) => {
    let list = [];
    switch (relatedType) {
      case "LEAD": list = leads; break;
      case "CONTACT": list = contacts; break;
      case "ACCOUNT": list = accounts; break;
      case "OPPORTUNITY": list = opportunities; break;
      default: return "";
    }
    const item = list.find((r) => String(r.id) === String(relatedTo));
    return item ? item.name || `${item.firstName || ""} ${item.lastName || ""}`.trim() : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAct) await updateActivity(editingAct.id, newAct);
      else await addActivity(newAct);

      setNewAct({ type: "CALL", subject: "", notes: "", relatedType: "", relatedTo: "", dueDate: "" });
      setEditingAct(null);
      loadActivities();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (act) => {
    setEditingAct(act);
    setNewAct({
      type: act.type,
      subject: act.subject,
      notes: act.notes,
      relatedType: act.relatedType,
      relatedTo: act.relatedTo,
      dueDate: act.dueDate,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this activity?")) return;
    await deleteActivity(id);
    loadActivities();
  };

  // Filter & paginate
  const filteredActivities = activities.filter(
    (a) =>
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase()) ||
      a.relatedType.toLowerCase().includes(search.toLowerCase()) ||
      getRelatedName(a.relatedType, a.relatedTo).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Export helpers
  const csvHeaders = [
    { label: "Type", key: "type" },
    { label: "Subject", key: "subject" },
    { label: "Due Date", key: "dueDate" },
    { label: "Related Type", key: "relatedType" },
    { label: "Related Name", key: "relatedName" },
  ];

  const exportExcel = () => {
    const data = filteredActivities.map((a) => ({
      type: a.type,
      subject: a.subject,
      dueDate: a.dueDate,
      relatedType: a.relatedType,
      relatedName: getRelatedName(a.relatedType, a.relatedTo),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activities");
    XLSX.writeFile(workbook, "activities.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Activities Report", 14, 20);
    autoTable(doc, {
      head: [["#", "Type", "Subject", "Due Date", "Related Type", "Related Name"]],
      body: filteredActivities.map((a, i) => [
        i + 1,
        a.type,
        a.subject,
        a.dueDate,
        a.relatedType,
        getRelatedName(a.relatedType, a.relatedTo),
      ]),
      startY: 25,
    });
    doc.save("activities.pdf");
  };

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Activities Management</h3>

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
            <CSVLink
              data={filteredActivities.map(a => ({
                type: a.type,
                subject: a.subject,
                dueDate: a.dueDate,
                relatedType: a.relatedType,
                relatedName: getRelatedName(a.relatedType, a.relatedTo),
              }))}
              headers={csvHeaders}
              filename="activities.csv"
              className="btn btn-success me-2"
            >
              Export CSV
            </CSVLink>
            <button className="btn btn-danger" onClick={exportPDF}>Export PDF</button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-4 row g-2">
          <div className="col-md-2">
            <select className="form-select" value={newAct.type} onChange={(e) => setNewAct({ ...newAct, type: e.target.value })}>
              <option>CALL</option>
              <option>EMAIL</option>
              <option>MEETING</option>
              <option>TASK</option>
            </select>
          </div>

          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Subject" value={newAct.subject} onChange={(e) => setNewAct({ ...newAct, subject: e.target.value })} required />
          </div>

          <div className="col-md-2">
            <input type="date" className="form-control" value={newAct.dueDate} onChange={(e) => setNewAct({ ...newAct, dueDate: e.target.value })} />
          </div>

          <div className="col-md-2">
            <select className="form-select" value={newAct.relatedType} onChange={(e) => setNewAct({ ...newAct, relatedType: e.target.value, relatedTo: "" })}>
              <option value="">Select Related Type</option>
              <option value="LEAD">Lead</option>
              <option value="CONTACT">Contact</option>
              <option value="ACCOUNT">Account</option>
              <option value="OPPORTUNITY">Opportunity</option>
            </select>
          </div>

          <div className="col-md-2">
            <select className="form-select" value={newAct.relatedTo} onChange={(e) => setNewAct({ ...newAct, relatedTo: e.target.value })}>
              <option value="">Select Related Entity</option>
              {getRelatedOptions().map(r => (
                <option key={r.id} value={r.id}>{r.name || `${r.firstName || ""} ${r.lastName || ""}`}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <button className="btn btn-success w-100">{editingAct ? "Update" : "Add"}</button>
          </div>
        </form>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Related Type</th>
                <th>Related Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedActivities.length > 0 ? paginatedActivities.map((a, i) => (
                <tr key={a.id}>
                  <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td>{a.type}</td>
                  <td>{a.subject}</td>
                  <td>{a.dueDate}</td>
                  <td>{a.relatedType}</td>
                  <td>{getRelatedName(a.relatedType, a.relatedTo)}</td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(a)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">No activities found.</td>
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

export default Activities;
