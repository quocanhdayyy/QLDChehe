import api from "../lib/api";

export const authService = {
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },
};
