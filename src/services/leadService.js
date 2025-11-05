import API from "./api";

export const getLeads = () => API.get("/leads");
export const getLead = () => API.get(`/leads/${id}`);
export const addLead = (lead) => API.post("/leads", lead);
export const updateLead = (id, lead) => API.put(`/leads/${id}`, lead);
export const deleteLead = (id) => API.delete(`/leads/${id}`);
