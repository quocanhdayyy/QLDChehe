import axios from "axios";
import { message } from "antd";

// Tạo axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Xử lý các lỗi phổ biến
      switch (status) {
        case 401:
          message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          break;
        case 403:
          message.error("Bạn không có quyền truy cập");
          break;
        case 404:
          message.error(data.message || "Không tìm thấy dữ liệu");
          break;
        case 409:
          message.error(data.message || "Dữ liệu đã tồn tại");
          break;
        case 500:
          message.error("Lỗi server. Vui lòng thử lại sau");
          break;
        default:
          message.error(data.message || "Có lỗi xảy ra");
      }
    } else if (error.request) {
      message.error("Không thể kết nối đến server");
    } else {
      message.error("Có lỗi xảy ra");
    }

    return Promise.reject(error);
  }
);

export default api;
