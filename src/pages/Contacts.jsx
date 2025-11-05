import React, { useEffect, useState } from "react";
import { getContacts, addContact, updateContact, deleteContact, getLeads, getAccounts } from "../services/contactService";
import NavBar from "../components/NavBar";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [leads, setLeads] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    lead: null,
    account: null,
  });

  useEffect(() => {
    loadContacts();
    loadLeads();
    loadAccounts();
  }, []);

  const loadContacts = async () => {
    try { const res = await getContacts(); setContacts(res.data); } 
    catch (err) { console.error(err); }
  };

  const loadLeads = async () => {
    try { const res = await getLeads(); setLeads(res.data); } 
    catch (err) { console.error(err); }
  };

  const loadAccounts = async () => {
    try { const res = await getAccounts(); setAccounts(res.data); } 
    catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ownerId = localStorage.getItem("userid");
      if (!ownerId) return alert("User not found!");

      const contactData = {
        ...newContact,
        owner: { id: ownerId },
        lead: newContact.lead ? { id: newContact.lead } : null,
        account: newContact.account ? { id: newContact.account } : null,
      };

      if (editingContact) await updateContact(editingContact.id, contactData);
      else await addContact(contactData);

      setNewContact({ firstName: "", lastName: "", email: "", phone: "", lead: null, account: null });
      setEditingContact(null);
      loadContacts();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setNewContact({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      lead: contact.lead?.id || null,
      account: contact.account?.id || null,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contact?")) return;
    try { await deleteContact(id); loadContacts(); } 
    catch (err) { alert("Cannot delete. Please delete linked opportunities first."); }
  };

  // Filter & paginate
  const filteredContacts = contacts.filter(
    (c) =>
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase()) ||
      c.lead?.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.account?.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CSV Export
  const csvHeaders = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Lead", key: "lead" },
    { label: "Account", key: "account" },
  ];

  // Excel Export
  const exportExcel = () => {
    const data = filteredContacts.map(c => ({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      lead: c.lead ? `${c.lead.firstName} ${c.lead.lastName}` : "-",
      account: c.account ? c.account.name : "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    XLSX.writeFile(workbook, "contacts.xlsx");
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Contacts Report", 14, 20);
    autoTable(doc, {
      head: [["#", "First Name", "Last Name", "Email", "Phone", "Lead", "Account"]],
      body: filteredContacts.map((c, index) => [
        index + 1,
        c.firstName,
        c.lastName,
        c.email,
        c.phone,
        c.lead ? `${c.lead.firstName} ${c.lead.lastName}` : "-",
        c.account ? c.account.name : "-",
      ]),
      startY: 25,
    });
    doc.save("contacts.pdf");
  };

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Contacts Management</h3>

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
            <CSVLink data={filteredContacts.map(c => ({
              firstName: c.firstName,
              lastName: c.lastName,
              email: c.email,
              phone: c.phone,
              lead: c.lead ? `${c.lead.firstName} ${c.lead.lastName}` : "-",
              account: c.account ? c.account.name : "-",
            }))} headers={csvHeaders} filename="contacts.csv" className="btn btn-success me-2">
              Export CSV
            </CSVLink>
            <button className="btn btn-danger" onClick={exportPDF}>Export PDF</button>
          </div>
        </div>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="mb-4 row g-2">
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="First Name" value={newContact.firstName} onChange={e => setNewContact({ ...newContact, firstName: e.target.value })} required />
          </div>
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Last Name" value={newContact.lastName} onChange={e => setNewContact({ ...newContact, lastName: e.target.value })} required />
          </div>
          <div className="col-md-2">
            <input type="email" className="form-control" placeholder="Email" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} />
          </div>
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} />
          </div>
          <div className="col-md-2">
            <select className="form-select" value={newContact.lead || ""} onChange={e => setNewContact({ ...newContact, lead: e.target.value })}>
              <option value="">Select Lead</option>
              {leads.map(lead => <option key={lead.id} value={lead.id}>{lead.firstName} {lead.lastName}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={newContact.account || ""} onChange={e => setNewContact({ ...newContact, account: e.target.value })}>
              <option value="">Select Account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
          <div className="col-md-2 mt-2">
            <button className="btn btn-success w-100" type="submit">{editingContact ? "Update" : "Add"}</button>
          </div>
        </form>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Lead</th>
                <th>Account</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.length > 0 ? paginatedContacts.map((c, i) => (
                <tr key={c.id}>
                  <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td>{c.firstName}</td>
                  <td>{c.lastName}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.lead ? `${c.lead.firstName} ${c.lead.lastName}` : "-"}</td>
                  <td>{c.account ? c.account.name : "-"}</td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(c)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">No contacts found.</td>
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

export default Contacts;
