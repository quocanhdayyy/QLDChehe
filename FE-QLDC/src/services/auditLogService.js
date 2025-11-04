import api from "../lib/api";
import { AUDIT_LOG_ENDPOINTS } from "../constants/apiEndpoints";

export const auditLogService = {
  // Lấy tất cả audit logs
  async getAll(params = {}) {
    const response = await api.get(AUDIT_LOG_ENDPOINTS.GET_ALL, { params });
    return response.data;
  },

  // Lấy audit log theo ID
  async getById(id) {
    const response = await api.get(AUDIT_LOG_ENDPOINTS.GET_BY_ID(id));
    return response.data;
  },
};

export default auditLogService;
