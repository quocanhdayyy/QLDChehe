import api from "../lib/api";
import { GIFT_EVENT_ENDPOINTS } from "../constants/apiEndpoints";

const giftEventService = {
  async getAll(params = {}) {
    const res = await api.get(GIFT_EVENT_ENDPOINTS.GET_ALL, { params });
    return res.data;
  },
  async getById(id) {
    const res = await api.get(GIFT_EVENT_ENDPOINTS.GET_BY_ID(id));
    return res.data;
  },
  async create(payload) {
    const res = await api.post(GIFT_EVENT_ENDPOINTS.CREATE, payload);
    return res.data;
  },
  async update(id, payload) {
    const res = await api.patch(GIFT_EVENT_ENDPOINTS.UPDATE(id), payload);
    return res.data;
  },
  async delete(id) {
    const res = await api.delete(GIFT_EVENT_ENDPOINTS.DELETE(id));
    return res.data;
  },
  async close(id) {
    const res = await api.post(GIFT_EVENT_ENDPOINTS.CLOSE(id));
    return res.data;
  },
  async open(id) {
    const res = await api.post(GIFT_EVENT_ENDPOINTS.OPEN(id));
    return res.data;
  },
  async register(id) {
    const res = await api.post(GIFT_EVENT_ENDPOINTS.REGISTER(id));
    return res.data;
  },
  async getRegistrations(id, params = {}) {
    const res = await api.get(GIFT_EVENT_ENDPOINTS.REGISTRATIONS(id), { params });
    return res.data;
  },
  async getMyRegistrations(params = {}) {
    const res = await api.get(GIFT_EVENT_ENDPOINTS.REGISTRATIONS_MINE, { params });
    return res.data;
  },
  async exportRegistrationsCsv(id, params = {}) {
    const res = await api.get(GIFT_EVENT_ENDPOINTS.REGISTRATIONS_EXPORT(id), {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
  async markReceivedByQr(qrCode) {
    const res = await api.post(GIFT_EVENT_ENDPOINTS.REGISTRATION_SCAN, { qrCode });
    return res.data;
  },
};

export default giftEventService;
