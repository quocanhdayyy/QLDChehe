import api from "../lib/api";

export const editRequestService = {
  // Get all edit requests
  getAll: async (params = {}) => {
    const { data } = await api.get("/requests", { params });
    return data;
  },

  // Get edit request by ID
  getById: async (id) => {
    const { data } = await api.get(`/requests/${id}`);
    return data;
  },

  // Create edit request
  create: async (requestData) => {
    const { data } = await api.post("/requests", requestData);
    return data;
  },

  // Update edit request
  update: async (id, requestData) => {
    const { data } = await api.patch(`/requests/${id}`, requestData);
    return data;
  },

  // Approve edit request
  approve: async (id, reviewData) => {
    const { data } = await api.post(`/requests/${id}/approve`, reviewData);
    return data;
  },

  // Reject edit request
  reject: async (id, reviewData) => {
    const { data } = await api.post(`/requests/${id}/reject`, reviewData);
    return data;
  },

  // Get my requests (for citizen)
  getMyRequests: async () => {
    const { data } = await api.get("/requests/me");
    return data;
  },

  // Get statistics
  getStats: async () => {
    const { data } = await api.get("/requests/stats");
    return data;
  },

  // Cancel edit request (by citizen) - only for PENDING requests
  cancelRequest: async (id) => {
    const { data } = await api.post(`/requests/${id}/cancel`);
    return data;
  },
};
