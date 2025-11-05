import React, { useState, useEffect } from "react";
import {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
  getLeads,
  getContacts,
  getAccounts,
  getOpportunities,
} from "../services/noteService";
import NavBar from "../components/NavBar";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  const [newNote, setNewNote] = useState({
    content: "",
    entityType: "",
    entityId: "",
  });

  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadNotes();
    loadDropdowns();
  }, []);

  const loadNotes = async () => {
    try {
      setNotes((await getNotes()).data);
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

  const getEntityOptions = () => {
    switch (newNote.entityType) {
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

  const getEntityName = (entityType, entityId) => {
    let list = [];
    switch (entityType) {
      case "LEAD":
        list = leads;
        break;
      case "CONTACT":
        list = contacts;
        break;
      case "ACCOUNT":
        list = accounts;
        break;
      case "OPPORTUNITY":
        list = opportunities;
        break;
      default:
        return "";
    }
    const found = list.find((e) => String(e.id) === String(entityId));
    return found
      ? found.name || `${found.firstName || ""} ${found.lastName || ""}`.trim()
      : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) await updateNote(editingNote.id, newNote);
      else await addNote(newNote);

      setNewNote({ content: "", entityType: "", entityId: "" });
      setEditingNote(null);
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setNewNote({
      content: note.content,
      entityType: note.entityType,
      entityId: note.entityId,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    await deleteNote(id);
    loadNotes();
  };

  const filteredNotes = notes.filter((n) => {
    const entityName = getEntityName(n.entityType, n.entityId);
    return (
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entityName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportCSV = () =>
    filteredNotes.map((n, i) => ({
      "#": i + 1,
      Content: n.content,
      Entity: `${n.entityType} - ${getEntityName(n.entityType, n.entityId)}`,
    }));

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportCSV());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notes");
    XLSX.writeFile(workbook, "notes.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["#", "Content", "Entity"];
    const tableRows = filteredNotes.map((n, i) => [
      i + 1,
      n.content,
      `${n.entityType} - ${getEntityName(n.entityType, n.entityId)}`,
    ]);
    doc.text("Notes Report", 14, 15);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("notes.pdf");
  };

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Notes Management</h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-4 row g-2">
          <div className="col-md-4">
            <textarea
              className="form-control"
              placeholder="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              required
              rows={3}
              style={{ color: "#000" }} // black text
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={newNote.entityType}
              onChange={(e) => setNewNote({ ...newNote, entityType: e.target.value, entityId: "" })}
            >
              <option value="">Select Type</option>
              <option value="LEAD">Lead</option>
              <option value="CONTACT">Contact</option>
              <option value="ACCOUNT">Account</option>
              <option value="OPPORTUNITY">Opportunity</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={newNote.entityId}
              onChange={(e) => setNewNote({ ...newNote, entityId: e.target.value })}
            >
              <option value="">Select Entity</option>
              {getEntityOptions().map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name || `${e.firstName || ""} ${e.lastName || ""}`}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <button className="btn btn-success w-100">{editingNote ? "Update" : "Add"}</button>
          </div>
        </form>

        {/* Search & Export */}
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search content or entity..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div>
            <button className="btn btn-success me-2" onClick={exportExcel}>
              Export Excel
            </button>
            <CSVLink className="btn btn-primary me-2" data={exportCSV()} filename={"notes.csv"}>
              Export CSV
            </CSVLink>
            <button className="btn btn-danger" onClick={exportPDF}>
              Export PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Content</th>
                <th>Entity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentNotes.length > 0 ? (
                currentNotes.map((n, i) => (
                  <tr key={n.id}>
                    <td>{indexOfFirstNote + i + 1}</td>
                    <td style={{ color: "#000" }}>{n.content}</td>
                    <td>
                      <span
                        className={`badge entity-${n.entityType.toLowerCase()}`}
                        style={{
                          color: "#000",
                          backgroundColor:
                            n.entityType === "LEAD"
                              ? "#f0ad4e"
                              : n.entityType === "CONTACT"
                              ? "#5bc0de"
                              : n.entityType === "ACCOUNT"
                              ? "#5cb85c"
                              : "#d9534f",
                        }}
                      >
                        {n.entityType}: {getEntityName(n.entityType, n.entityId)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(n)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No notes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => paginate(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

export default Notes;
