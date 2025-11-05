import React, { useState, useEffect } from "react";
import { getOpportunities, addOpportunity, updateOpportunity, deleteOpportunity, getAccounts, getContacts } from "../services/opportunityService";
import NavBar from "../components/NavBar";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Opportunities() {
  const [opps, setOpps] = useState([]);
  const [editingOpp, setEditingOpp] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");

  const [newOpp, setNewOpp] = useState({
    name: "",
    stage: "PROSPECTING",
    amount: "",
    closeDate: "",
    account: null,
    contact: null
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadOpportunities();
    loadDropdowns();
  }, []);

  const loadOpportunities = async () => {
    try { const res = await getOpportunities(); setOpps(res.data); } catch (err) { console.error(err); }
  };

  const loadDropdowns = async () => {
    try {
      setAccounts((await getAccounts()).data);
      setContacts((await getContacts()).data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOpp) await updateOpportunity(editingOpp.id, newOpp);
      else await addOpportunity(newOpp);

      setNewOpp({ name: "", stage: "PROSPECTING", amount: "", closeDate: "", account: null, contact: null });
      setEditingOpp(null);
      loadOpportunities();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (opp) => {
    setEditingOpp(opp);
    setNewOpp({
      name: opp.name,
      stage: opp.stage,
      amount: opp.amount,
      closeDate: opp.closeDate,
      account: opp.account?.id || null,
      contact: opp.contact?.id || null
    });
  };

  const handleDelete = async (id) => { 
    if (!window.confirm("Delete this opportunity?")) return; 
    await deleteOpportunity(id); 
    loadOpportunities(); 
  };

  // Filtered & paginated data
  const filteredOpps = opps.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.stage.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOpps.length / itemsPerPage);
  const paginatedOpps = filteredOpps.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  // Export
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredOpps.map(o => ({
      Name: o.name,
      Stage: o.stage,
      Amount: o.amount,
      CloseDate: o.closeDate,
      Account: o.account?.name || "-",
      Contact: o.contact ? `${o.contact.firstName} ${o.contact.lastName}` : "-"
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Opportunities");
    XLSX.writeFile(wb, "opportunities.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Opportunities Report", 14, 15);
    autoTable(doc, {
      head: [["Name", "Stage", "Amount", "Close Date", "Account", "Contact"]],
      body: filteredOpps.map(o => [
        o.name,
        o.stage,
        o.amount,
        o.closeDate,
        o.account?.name || "-",
        o.contact ? `${o.contact.firstName} ${o.contact.lastName}` : "-"
      ]),
      startY: 20
    });
    doc.save("opportunities.pdf");
  };

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Opportunities Management</h3>

        {/* Search & Export */}
        <div className="d-flex justify-content-between mb-2">
          <input type="text" className="form-control w-25" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
          <div>
            <button className="btn btn-primary me-2" onClick={exportExcel}>Export Excel</button>
            <CSVLink data={filteredOpps} filename="opportunities.csv" className="btn btn-success me-2">Export CSV</CSVLink>
            <button className="btn btn-danger" onClick={exportPDF}>Export PDF</button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-4 row g-2">
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Name" value={newOpp.name} onChange={e => setNewOpp({...newOpp, name: e.target.value})} required />
          </div>
          <div className="col-md-2">
            <select className="form-select" value={newOpp.stage} onChange={e => setNewOpp({...newOpp, stage: e.target.value})}>
              <option>PROSPECTING</option>
              <option>NEGOTIATION</option>
              <option>CLOSED_WON</option>
              <option>CLOSED_LOST</option>
            </select>
          </div>
          <div className="col-md-2">
            <input type="number" className="form-control" placeholder="Amount" value={newOpp.amount} onChange={e => setNewOpp({...newOpp, amount: e.target.value})} />
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" value={newOpp.closeDate} onChange={e => setNewOpp({...newOpp, closeDate: e.target.value})} />
          </div>
          <div className="col-md-2">
            <select className="form-select" value={newOpp.account || ""} onChange={e => setNewOpp({...newOpp, account: e.target.value})}>
              <option value="">Select Account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={newOpp.contact || ""} onChange={e => setNewOpp({...newOpp, contact: e.target.value})}>
              <option value="">Select Contact</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </div>
          <div className="col-md-1">
            <button className="btn btn-success w-100">{editingOpp ? "Update" : "Add"}</button>
          </div>
        </form>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th><th>Name</th><th>Stage</th><th>Amount</th><th>Close Date</th><th>Account</th><th>Contact</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOpps.length > 0 ? paginatedOpps.map((o,i)=>(
                <tr key={o.id}>
                  <td>{(currentPage-1)*itemsPerPage + i+1}</td>
                  <td>{o.name}</td>
                  <td>{o.stage}</td>
                  <td>{o.amount}</td>
                  <td>{o.closeDate}</td>
                  <td>{o.account?.name || "-"}</td>
                  <td>{o.contact ? `${o.contact.firstName} ${o.contact.lastName}` : "-"}</td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2" onClick={()=>handleEdit(o)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(o.id)}>Delete</button>
                  </td>
                </tr>
              )) : <tr><td colSpan="8" className="text-center text-muted">No opportunities found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination">
              <li className={`page-item ${currentPage===1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={()=>setCurrentPage(prev=>prev-1)}>Previous</button>
              </li>
              {Array.from({length: totalPages}, (_,i)=>(
                <li key={i} className={`page-item ${currentPage===i+1 ? "active" : ""}`}>
                  <button className="page-link" onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage===totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={()=>setCurrentPage(prev=>prev+1)}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}

export default Opportunities;
