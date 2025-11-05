import API from "./api";

// Fetch all users
export const getUsers = async () => {
  return API.get("/users"); // GET http://localhost:8080/api/users
};

// Create a new user
export const createUser = async (user) => {
  /*
    user = {
      first_name: string,
      last_name: string,
      username: string,
      email: string,
      password: string,
      role: string ("ROLE_ADMIN", "ROLE_USER", etc.)
    }
  */
  return API.post("/users", user);
};

// Update user details (excluding role)
export const updateUser = async (userId, user) => {
  /*
    user = {
      first_name, last_name, username, email, password (optional)
    }
  */
  return API.put(`/users/${userId}`, user);
};

// userService.js
export const updateUserRole = (id, role) => {
  return API.patch(
    `/users/${id}/role`,
    { role }, // send as JSON object
    { headers: { "Content-Type": "application/json" } } // ensure JSON
  );
};


// Delete a user
export const deleteUser = async (userId) => {
  return API.delete(`/users/${userId}`);
};

// Fetch a single user (optional)
export const getUserById = async (userId) => {
  return API.get(`/users/${userId}`);
};
