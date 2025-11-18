import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function NavBar() {
  const [open, setOpen] = useState(false); // added state to control collapse
  const navigate = useNavigate();
  const storedUsername = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role"); // get current user role
  const isAdmin = role === "ROLE_ADMIN";      // check if admin

  const handleLogout = () => {
    localStorage.removeItem("token");   
    localStorage.removeItem("userid");  
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setOpen(false); // close menu on logout
    navigate("/login");                  
  };

  const toggle = () => setOpen(o => !o);
  const closeMenu = () => setOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">CRM</Link>

      {/* navbar toggler for small screens - controlled by React state */}
      <button
        className="navbar-toggler"
        type="button"
        onClick={toggle}
        aria-controls="navbarNav"
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`collapse navbar-collapse ${open ? "show" : ""}`} id="navbarNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/leads" onClick={closeMenu}>Leads</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/accounts" onClick={closeMenu}>Accounts</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/contacts" onClick={closeMenu}>Contacts</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/opportunities" onClick={closeMenu}>Opportunities</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/activities" onClick={closeMenu}>Activities</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/notes" onClick={closeMenu}>Notes</Link>
          </li>

          {/* Only show Users link if admin */}
          {isAdmin && (
            <li className="nav-item">
              <Link className="nav-link" to="/users" onClick={closeMenu}>Users</Link>
            </li>
          )}
        </ul>

        <div className="d-flex align-items-center">
          <span className="text-light me-3">Hello, {storedUsername}</span>
          <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;