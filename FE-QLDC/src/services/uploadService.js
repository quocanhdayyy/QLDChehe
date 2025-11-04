import api from "../lib/api";

const uploadService = {
  // Upload avatar
  async uploadAvatar(file) {
    console.log("📤 uploadService: Preparing upload...");
    console.log("   File:", file.name, file.size, "bytes");
    console.log("   API Base URL:", api.defaults.baseURL);

    const formData = new FormData();
    formData.append("avatar", file);

    console.log("📤 Sending POST to:", `${api.defaults.baseURL}/upload/avatar`);

    const response = await api.post("/upload/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Upload success:", response.data);
    return response.data;
  },

  // Delete avatar
  async deleteAvatar() {
    const response = await api.delete("/upload/avatar");
    return response.data;
  },

  // Get avatar URL (để hiển thị từ server)
  getAvatarUrl(path) {
    if (!path) return null;
    // Nếu đã là URL đầy đủ thì return luôn
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    // Nếu là path local thì thêm base URL (lấy từ api instance)
    const baseURL = api.defaults.baseURL;
    return `${baseURL}${path}`;
  },
};

export default uploadService;
