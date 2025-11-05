import React, { useState, useEffect } from "react";
import {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} from "../services/accountService";
import NavBar from "../components/NavBar";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [newAccount, setNewAccount] = useState({
    name: "",
    industry: "",
    website: "",
    phone: "",
    address: "",
  });

  const industries = [
    "TECHNOLOGY",
    "FINANCE",
    "HEALTHCARE",
    "EDUCATION",
    "MANUFACTURING",
    "RETAIL",
    "REAL_ESTATE",
    "TELECOMMUNICATIONS",
    "TRANSPORTATION",
    "OTHER",
  ];

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const res = await getAccounts();
      setAccounts(res.data);
    } catch (err) {
      console.error("Error loading accounts:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) await updateAccount(editingAccount.id, newAccount);
      else await addAccount(newAccount);

      setNewAccount({ name: "", industry: "", website: "", phone: "", address: "" });
      setEditingAccount(null);
      loadAccounts();
    } catch (err) {
      console.error("Error saving account:", err);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setNewAccount(account);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      await deleteAccount(id);
      loadAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      const warningDiv = document.createElement("div");
      warningDiv.className = "alert alert-warning mt-3";
      warningDiv.textContent = "⚠️ Cannot delete this account. Please delete linked contacts first.";
      document.body.appendChild(warningDiv);
      setTimeout(() => warningDiv.remove(), 4000);
    }
  };

  // Filtered & paginated accounts
  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.industry.toLowerCase().includes(search.toLowerCase()) ||
      acc.website?.toLowerCase().includes(search.toLowerCase()) ||
      acc.phone?.toLowerCase().includes(search.toLowerCase()) ||
      acc.address?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CSV Export
  const csvHeaders = [
    { label: "Name", key: "name" },
    { label: "Industry", key: "industry" },
    { label: "Website", key: "website" },
    { label: "Phone", key: "phone" },
    { label: "Address", key: "address" },
  ];

  // Excel Export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredAccounts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");
    XLSX.writeFile(workbook, "accounts.xlsx");
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Accounts Report", 14, 20);
    autoTable(doc, {
      head: [["#", "Name", "Industry", "Website", "Phone", "Address"]],
      body: filteredAccounts.map((acc, index) => [
        index + 1,
        acc.name,
        acc.industry,
        acc.website,
        acc.phone,
        acc.address,
      ]),
      startY: 25,
    });
    doc.save("accounts.pdf");
  };

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Accounts Management</h3>

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
            <CSVLink data={filteredAccounts} headers={csvHeaders} filename="accounts.csv" className="btn btn-success me-2">
              Export CSV
            </CSVLink>
            <button className="btn btn-danger" onClick={exportPDF}>Export PDF</button>
          </div>
        </div>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="mb-4 row g-2">
          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={newAccount.industry}
              onChange={(e) => setNewAccount({ ...newAccount, industry: e.target.value })}
              required
            >
              <option value="">Select Industry</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind.charAt(0) + ind.slice(1).toLowerCase().replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Website" value={newAccount.website} onChange={(e) => setNewAccount({ ...newAccount, website: e.target.value })} />
          </div>
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Phone" value={newAccount.phone} onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })} />
          </div>
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Address" value={newAccount.address} onChange={(e) => setNewAccount({ ...newAccount, address: e.target.value })} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" type="submit">{editingAccount ? "Update" : "Add"}</button>
          </div>
        </form>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Industry</th>
                <th>Website</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.length > 0 ? (
                paginatedAccounts.map((acc, i) => (
                  <tr key={acc.id}>
                    <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td>{acc.name}</td>
                    <td>{acc.industry}</td>
                    <td>{acc.website}</td>
                    <td>{acc.phone}</td>
                    <td>{acc.address}</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(acc)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(acc.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">No accounts found.</td>
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

export default Accounts;
