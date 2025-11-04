const { GiftEvent, GiftRegistration } = require("../models");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async create(data) {
    data.slotsRemaining = data.slotsTotal || 0;
    return GiftEvent.create(data);
  },

  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;
    const docs = await GiftEvent.find(filter)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await GiftEvent.countDocuments(filter);
    return { docs, total, page, limit };
  },

  async getById(id) {
    return GiftEvent.findById(id);
  },

  async update(id, data) {
    // Prevent direct manipulation of slotsRemaining here in service
    if (data.slotsTotal != null) {
      // adjust slotsRemaining relative to new total (simple approach)
      const ev = await GiftEvent.findById(id);
      if (ev) {
        const diff = (data.slotsTotal || 0) - (ev.slotsTotal || 0);
        data.slotsRemaining = (ev.slotsRemaining || 0) + diff;
      }
    }
    return GiftEvent.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return GiftEvent.findByIdAndDelete(id);
  },

  async close(id) {
    return GiftEvent.findByIdAndUpdate(id, { status: "CLOSED" }, { new: true });
  },

  async open(id) {
    return GiftEvent.findByIdAndUpdate(id, { status: "OPEN" }, { new: true });
  },

  // Create a registration atomically by decrementing slotsRemaining
  async createRegistration({ eventId, citizenId }) {
    // Prevent duplicate registration
    const existing = await GiftRegistration.findOne({ event: eventId, citizen: citizenId });
    if (existing) return { success: false, reason: "ALREADY_REGISTERED", registration: existing };

    // Load event and citizen to validate conditions
    const [ev, citizen] = await Promise.all([
      GiftEvent.findById(eventId),
      require("../models").Citizen.findById(citizenId).populate("household"),
    ]);

    if (!ev) return { success: false, reason: "EVENT_NOT_FOUND" };
    const now = new Date();
    if (ev.status !== "OPEN" || ev.startDate > now || ev.endDate < now) {
      return { success: false, reason: "EVENT_CLOSED_OR_OUT_OF_TIME" };
    }

    // Basic condition checks
    const cond = ev.conditions || {};
    if (cond.minAge || cond.maxAge) {
      if (!citizen || !citizen.dateOfBirth) return { success: false, reason: "AGE_INFO_MISSING" };
      const age = Math.floor((now - new Date(citizen.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25));
      if (cond.minAge && age < cond.minAge) return { success: false, reason: "AGE_TOO_YOUNG" };
      if (cond.maxAge && age > cond.maxAge) return { success: false, reason: "AGE_TOO_OLD" };
    }
    if (cond.areaIds && cond.areaIds.length > 0) {
      const addr = (citizen && citizen.household && citizen.household.address) || {};
      const matched = cond.areaIds.some((a) => {
        return [addr.ward, addr.district, addr.city, addr.street].some((v) => v && v.includes(a));
      });
      if (!matched) return { success: false, reason: "NOT_IN_AREA" };
    }

    // try to decrement slotsRemaining atomically
    const updatedEvent = await GiftEvent.findOneAndUpdate(
      {
        _id: eventId,
        slotsRemaining: { $gt: 0 },
        status: "OPEN",
      },
      { $inc: { slotsRemaining: -1 } },
      { new: true }
    );

    if (!updatedEvent) return { success: false, reason: "EVENT_FULL_OR_CLOSED" };

    // create registration with uuid qrCode
    const qrCode = uuidv4();
    let reg;
    try {
      reg = await GiftRegistration.create({ event: eventId, citizen: citizenId, qrCode });
    } catch (err) {
      // rollback slot decrement if registration creation failed (e.g., unique constraint race)
      await GiftEvent.findByIdAndUpdate(eventId, { $inc: { slotsRemaining: 1 } });
      if (err.code === 11000) {
        return { success: false, reason: "ALREADY_REGISTERED" };
      }
      throw err;
    }
    return { success: true, registration: reg, event: updatedEvent };
  },

  async getRegistrations(eventId, filter = {}, options = {}) {
    const { limit = 100, page = 1, sort = "-registeredAt" } = options;
    const query = { event: eventId, ...filter };
    const docs = await GiftRegistration.find(query)
      .populate("citizen", "fullName household")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await GiftRegistration.countDocuments(query);
    return { docs, total, page, limit };
  },

  async getRegistrationsForCitizen(citizenId, filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-registeredAt" } = options;
    const query = { citizen: citizenId, ...filter };
    const docs = await GiftRegistration.find(query)
      .populate("event", "title startDate endDate status")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await GiftRegistration.countDocuments(query);
    return { docs, total, page, limit };
  },

  async markReceivedByQr(qrCode, performedBy) {
    const reg = await GiftRegistration.findOne({ qrCode }).populate("event citizen");
    if (!reg) return { success: false, reason: "NOT_FOUND" };
    if (reg.status === "RECEIVED") return { success: false, reason: "ALREADY_RECEIVED" };
    reg.status = "RECEIVED";
    reg.receivedAt = new Date();
    await reg.save();
    return { success: true, registration: reg };
  },
};
