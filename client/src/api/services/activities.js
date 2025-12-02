import api from "../axios";

// GET ALL activities
export const getActivities = () => api.get("/activities");

// GET activity by ID
export const getActivityById = (id) =>
  api.get(`/activities/${id}`);

// CREATE
export const createActivity = (payload) =>
  api.post("/activities", payload);

// JOIN
export const joinActivity = (id, userId) =>
  api.patch(`/activities/${id}/join`, { userId });

// LEAVE
export const leaveActivity = (id, userId) =>
  api.patch(`/activities/${id}/leave`, { userId });

// UPDATE STATUS
export const updateStatus = (id, userId, status) =>
  api.patch(`/activities/${id}/status`, { userId, status });

// UPDATE AVAILABILITY
export const updateAvailability = (id, userId, availableTimes) =>
  api.patch(`/activities/${id}/availability`, {
    userId,
    availableTimes,
  });
  
// FINALIZE
export const finalizeActivity = (id, userId) =>
  api.patch(`/activities/${id}/finalize`, { userId });

// CANCEL
export const cancelActivity = (id, userId) =>
  api.patch(`/activities/${id}/cancel`, { userId });

// EDIT / PUT
export const editActivity = (id, payload) =>
  api.put(`/activities/${id}`, payload);

// DELETE
export const deleteActivity = (id, userId) =>
  api.delete(`/activities/${id}`, {
    data: { userId },
  });
