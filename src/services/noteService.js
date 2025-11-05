import API from "./api";

// CRUD for Notes
export const getNotes = () => API.get("/notes");

export const addNote = (note) => {
  const ownerId = localStorage.getItem("userid");
  const noteData = { ...note, owner: { id: ownerId } };
  return API.post("/notes", noteData);
};

export const updateNote = (id, note) => {
  const ownerId = localStorage.getItem("userid");
  const noteData = { ...note, owner: { id: ownerId } };
  return API.put(`/notes/${id}`, noteData);
};

export const deleteNote = (id) => API.delete(`/notes/${id}`);

// Fetch entities for dropdown
export const getLeads = () => API.get("/leads");
export const getContacts = () => API.get("/contacts");
export const getAccounts = () => API.get("/accounts");
export const getOpportunities = () => API.get("/opportunities");
