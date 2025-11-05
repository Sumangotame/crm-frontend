import API from "./api";

export const getAccounts = () => API.get("/accounts");

export const addAccount = (account) => {
  const ownerId = localStorage.getItem("userid");
  const accountData = { ...account, owner: { id: ownerId } };
  return API.post("/accounts", accountData);
};

export const updateAccount = (id, account) => {
  const ownerId = localStorage.getItem("userid");
  const accountData = { ...account, owner: { id: ownerId } };
  return API.put(`/accounts/${id}`, accountData);
};

export const deleteAccount = (id) => API.delete(`/accounts/${id}`);
