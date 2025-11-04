import api from "../lib/api";

const notificationService = {
  // Lấy tất cả thông báo của user hiện tại
  getAll: async (params = {}) => {
    const { data } = await api.get("/notifications", { params });
    return data;
  },

  // Lấy chi tiết một thông báo
  getById: async (id) => {
    const { data } = await api.get(`/notifications/${id}`);
    return data;
  },

  // Đánh dấu đã đọc
  markAsRead: async (id) => {
    const { data } = await api.post(`/notifications/${id}/read`);
    return data;
  },

  // Đánh dấu tất cả đã đọc (call từng cái)
  markAllAsRead: async (notificationIds) => {
    const promises = notificationIds.map((id) =>
      api.post(`/notifications/${id}/read`).catch((err) => {
        console.error(`Failed to mark notification ${id} as read:`, err);
        return null;
      })
    );
    return Promise.all(promises);
  },
};

export default notificationService;
