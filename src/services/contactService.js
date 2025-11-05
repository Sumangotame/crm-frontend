import API from "./api";

export const getContacts = () => API.get("/contacts");
export const addContact = (contact) => API.post("/contacts", contact);
export const updateContact = (id, contact) => API.put(`/contacts/${id}`, contact);
export const deleteContact = (id) => API.delete(`/contacts/${id}`);

export const getLeads = () => API.get("/leads"); // for dropdown
export const getAccounts = () => API.get("/accounts"); // for dropdown