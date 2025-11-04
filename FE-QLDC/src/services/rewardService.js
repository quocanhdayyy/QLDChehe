import api from "../lib/api";

export const rewardService = {
  // Reward Proposals
  proposals: {
    getAll: async (params = {}) => {
      const { data } = await api.get("/rewards", { params });
      return data;
    },

    getById: async (id) => {
      const { data } = await api.get(`/rewards/${id}`);
      return data;
    },

    create: async (proposalData) => {
      const { data } = await api.post("/rewards", proposalData);
      return data;
    },

    approve: async (id, reviewData) => {
      const { data } = await api.post(`/rewards/${id}/approve`, reviewData);
      return data;
    },

    reject: async (id, reviewData) => {
      const { data } = await api.post(`/rewards/${id}/reject`, reviewData);
      return data;
    },

    getMyProposals: async () => {
      const { data } = await api.get("/rewards/my");
      return data;
    },

    getStats: async () => {
      const { data } = await api.get("/rewards/stats");
      return data;
    },

    // Cancel proposal (by citizen) - only for PENDING proposals
    cancel: async (id) => {
      const { data } = await api.post(`/rewards/${id}/cancel`);
      return data;
    },
  },

  // Reward Events
  events: {
    getAll: async (params = {}) => {
      const { data } = await api.get("/reward-events", { params });
      return data;
    },

    getById: async (id) => {
      const { data } = await api.get(`/reward-events/${id}`);
      return data;
    },

    create: async (eventData) => {
      const { data } = await api.post("/reward-events", eventData);
      return data;
    },

    update: async (id, eventData) => {
      const { data } = await api.patch(`/reward-events/${id}`, eventData);
      return data;
    },

    delete: async (id) => {
      const { data } = await api.delete(`/reward-events/${id}`);
      return data;
    },
  },

  // Reward Distributions
  distributions: {
    getAll: async (params = {}) => {
      const { data } = await api.get("/reward-distributions", { params });
      return data;
    },

    getById: async (id) => {
      const { data } = await api.get(`/reward-distributions/${id}`);
      return data;
    },

    create: async (distributionData) => {
      const { data } = await api.post(
        "/reward-distributions",
        distributionData
      );
      return data;
    },

    bulkCreate: async (distributionsData) => {
      const { data } = await api.post(
        "/reward-distributions/bulk",
        distributionsData
      );
      return data;
    },

    getSummary: async (eventId) => {
      const { data } = await api.get(
        `/reward-distributions/summary/${eventId}`
      );
      return data;
    },

    getMyRewards: async () => {
      const { data } = await api.get("/reward-distributions/my");
      return data;
    },
  },

  // Student Achievements
  achievements: {
    getAll: async (params = {}) => {
      const { data } = await api.get("/student-achievements", { params });
      return data;
    },

    getById: async (id) => {
      const { data } = await api.get(`/student-achievements/${id}`);
      return data;
    },

    create: async (achievementData) => {
      const { data } = await api.post("/student-achievements", achievementData);
      return data;
    },

    update: async (id, achievementData) => {
      const { data } = await api.patch(
        `/student-achievements/${id}`,
        achievementData
      );
      return data;
    },

    delete: async (id) => {
      const { data } = await api.delete(`/student-achievements/${id}`);
      return data;
    },
  },
};
