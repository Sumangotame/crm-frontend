import API from "./api";

// CRUD for Activities
export const getActivities = () => API.get("/activities");

export const addActivity = (activity) => {
  const ownerId = localStorage.getItem("userid");
  const activityData = {
    ...activity,
    owner: { id: ownerId }
  };
  return API.post("/activities", activityData);
};

export const updateActivity = (id, activity) => {
  const ownerId = localStorage.getItem("userid");
  const activityData = {
    ...activity,
    owner: { id: ownerId }
  };
  return API.put(`/activities/${id}`, activityData);
};

export const deleteActivity = (id) => API.delete(`/activities/${id}`);

// Fetch all entities for dropdown
export const getLeads = () => API.get("/leads");
export const getContacts = () => API.get("/contacts");
export const getAccounts = () => API.get("/accounts");
export const getOpportunities = () => API.get("/opportunities");
