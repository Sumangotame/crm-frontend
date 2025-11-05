import API from "./api";
export const getAccountsByIndustry = () => API.get("/accounts/industry-count");
export const getLeadsByStatus = () => API.get("/leads/status-count");
