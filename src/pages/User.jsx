import React, { useState, useEffect } from "react";
import { getUsers, createUser, updateUserRole, updateUser } from "../services/userService";
import NavBar from "../components/NavBar";

function Users() {
    const currentUserRole = localStorage.getItem("role");
    const isAdmin = currentUserRole === "ROLE_ADMIN";
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null); // for showing role selector
    const [newUser, setNewUser] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        role: "ROLE_USER",
    });

    // Load all users
    const loadUsers = async () => {
        try {
            const res = await getUsers();
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Create or update user
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await updateUser(editingUser.id, newUser);
                setEditingUser(null);
            } else {
                await createUser(newUser);
            }
            setNewUser({
                first_name: "",
                last_name: "",
                username: "",
                email: "",
                password: "",
                role: "ROLE_USER",
            });
            loadUsers();
        } catch (err) {
            console.error(err);
            alert("Error creating/updating user.");
        }
    };

    // Edit user
    const handleEdit = (user) => {
        setEditingUser(user);
        setNewUser({
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            password: "",
            role: user.role,
        });
    };

    // Update role
    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setSelectedUserId(null); // hide after update
            loadUsers();
        } catch (err) {
            console.error(err);
            alert("Error updating role.");
        }
    };

    return (<>
        <NavBar />
        <div className="container mt-4">
            <h3 className="mb-4 text-center">User Management</h3>

            {/* ===== User Form ===== */}
            <form onSubmit={handleSubmit} className="mb-4 row g-2">
                <div className="col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="First Name"
                        value={newUser.first_name}
                        onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Last Name"
                        value={newUser.last_name}
                        onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="password"
                        className="form-control"
                        placeholder={editingUser ? "Leave blank if unchanged" : "Password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required={!editingUser}
                    />
                </div>
                <div className="col-md-2">
                    <select
                        className="form-select"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                        <option value="ROLE_USER">User</option>
                        <option value="ROLE_ADMIN">Admin</option>
                        <option value="ROLE_SALES">Sales</option>
                        <option value="ROLE_SUPPORT">Support</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-success w-100">{editingUser ? "Update" : "Create"}</button>
                </div>
            </form>

            {/* ===== Users Table ===== */}
            <div className="table-responsive">
                <table className="table table-striped table-hover text-center">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user, i) => (
                                <tr
                                    key={user.id}
                                    onClick={() => {
                                        if (isAdmin) setSelectedUserId(selectedUserId === user.id ? null : user.id);
                                    }}
                                    style={{ cursor: isAdmin ? "pointer" : "default" }}
                                >

                                    <td>{i + 1}</td>
                                    <td>{user.first_name}</td>
                                    <td>{user.last_name}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {selectedUserId === user.id ? (
                                            <select
                                                className="form-select form-select-sm"
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            >
                                                <option value="ROLE_USER">User</option>
                                                <option value="ROLE_ADMIN">Admin</option>
                                                <option value="ROLE_SALES">Sales</option>
                                                <option value="ROLE_SUPPORT">Support</option>
                                            </select>
                                        ) : (
                                            user.role
                                        )}
                                    </td>
                                    <td>
                                        {isAdmin && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-primary me-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(user);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(user.id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}


                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center text-muted">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </>
    );
}

export default Users;
