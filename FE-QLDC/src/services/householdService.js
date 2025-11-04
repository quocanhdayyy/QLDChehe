import api from "../lib/api";

export const householdService = {
  // Get all households
  getAll: async (params = {}) => {
    const { data } = await api.get("/households", { params });
    return data;
  },

  // Get household by ID
  getById: async (id) => {
    const { data } = await api.get(`/households/${id}`);
    return data;
  },

  // Create household
  create: async (householdData) => {
    const { data } = await api.post("/households", householdData);
    return data;
  },

  // Update household
  update: async (id, householdData) => {
    const { data } = await api.patch(`/households/${id}`, householdData);
    return data;
  },

  // Delete household
  delete: async (id) => {
    const { data } = await api.delete(`/households/${id}`);
    return data;
  },

  // Get statistics
  getStats: async () => {
    const { data } = await api.get("/households/stats");
    return data;
  },
};
