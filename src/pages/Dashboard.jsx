import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { getLeadsByStatus, getAccountsByIndustry } from "../services/dashboardService";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState([]);
  const [accountData, setAccountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const COLORS = ["#007bff", "#17a2b8", "#28a745", "#ffc107", "#dc3545"];

  const modules = [
    { name: "Leads", path: "/leads", color: "primary" },
    { name: "Accounts", path: "/accounts", color: "info" },
    { name: "Contacts", path: "/contacts", color: "success" },
    { name: "Opportunities", path: "/opportunities", color: "warning" },
    { name: "Activities", path: "/activities", color: "secondary" },
    { name: "Notes", path: "/notes", color: "dark" },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [leadsRes, accountsRes] = await Promise.all([
        getLeadsByStatus(),
        getAccountsByIndustry(),
      ]);

      // Convert map response into chart-friendly array
      const leadsArray = Object.entries(leadsRes.data).map(([name, value]) => ({ name, value }));
      const accountsArray = Object.entries(accountsRes.data).map(([name, count]) => ({ name, count }));

      setLeadData(leadsArray);
      setAccountData(accountsArray);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <h2 className="mb-3 text-center">CRM Dashboard</h2>
        <p className="text-center">Visualize your business performance in real-time.</p>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* ==== Charts Section ==== */}
            <div className="row mt-4">
              {/* Pie Chart */}
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm p-3">
                  <h5 className="text-center mb-3">Leads by Status</h5>
                  {leadData.length === 0 ? (
                    <p className="text-center text-muted">No data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={leadData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                          dataKey="value"
                        >
                          {leadData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm p-3">
                  <h5 className="text-center mb-3">Accounts by Industry</h5>
                  {accountData.length === 0 ? (
                    <p className="text-center text-muted">No data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={accountData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#17a2b8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* ==== Modules Section ==== */}
            <div className="row g-3 mt-4">
              {modules.map((mod) => (
                <div key={mod.name} className="col-md-4">
                  <div
                    className={`card dashboard-card text-white bg-${mod.color} mb-3`}
                    onClick={() => navigate(mod.path)}
                  >
                    <div className="card-body text-center">
                      <h5 className="card-title">{mod.name}</h5>
                      <p className="card-text">
                        Click to manage {mod.name.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
