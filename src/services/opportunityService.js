import API from "./api";

// CRUD operations for Opportunities
export const getOpportunities = () => API.get("/opportunities");

export const addOpportunity = (opp) => {
  const ownerId = localStorage.getItem("userid"); // logged-in user
  const oppData = {
    ...opp,
    owner: { id: ownerId },
    account: opp.account ? { id: opp.account } : null,
    contact: opp.contact ? { id: opp.contact } : null,
  };
  return API.post("/opportunities", oppData);
};

export const updateOpportunity = (id, opp) => {
  const ownerId = localStorage.getItem("userid");
  const oppData = {
    ...opp,
    owner: { id: ownerId },
    account: opp.account ? { id: opp.account } : null,
    contact: opp.contact ? { id: opp.contact } : null,
  };
  return API.put(`/opportunities/${id}`, oppData);
};

export const deleteOpportunity = (id) => API.delete(`/opportunities/${id}`);

// For dropdowns
export const getAccounts = () => API.get("/accounts");
export const getContacts = () => API.get("/contacts");
