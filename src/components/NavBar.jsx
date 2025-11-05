import React from "react";
import { Link, useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();
  const storedUsername = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role"); // get current user role
  const isAdmin = role === "ROLE_ADMIN";      // check if admin

  const handleLogout = () => {
    localStorage.removeItem("token");   
    localStorage.removeItem("userid");  
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");                  
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">CRM</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/leads">Leads</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/accounts">Accounts</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/contacts">Contacts</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/opportunities">Opportunities</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/activities">Activities</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/notes">Notes</Link>
          </li>

          {/* Only show Users link if admin */}
          {isAdmin && (
            <li className="nav-item">
              <Link className="nav-link" to="/users">Users</Link>
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
