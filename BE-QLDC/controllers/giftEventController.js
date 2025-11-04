const giftEventService = require("../services/giftEventService");
const auditLogService = require("../services/auditLogService");
const notificationService = require("../services/notificationService");
const notificationBroadcastService = require("../services/notificationBroadcastService");

module.exports = {
  async create(req, res, next) {
    try {
      const payload = { ...req.body, createdBy: req.user?._id };
      const doc = await giftEventService.create(payload);
      await auditLogService.create({
        action: "GIFT_EVENT_CREATE",
        entityType: "GiftEvent",
        entityId: doc._id,
        performedBy: req.user?._id,
        after: doc,
      });

      // broadcast notification to all citizens (runs in-process; for large datasets consider queue)
      notificationBroadcastService
        .broadcastToCitizens({
          title: `Sự kiện mới: ${doc.title}`,
          message: doc.description || "Có sự kiện phát quà mới",
          entityType: "GiftEvent",
          entityId: doc._id,
        })
        .catch((err) => console.error("Broadcast notification failed:", err));

      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const { page, limit, sort, ...filter } = req.query;
      const data = await giftEventService.getAll(filter, {
        page: Number(page) || 1,
        limit: Number(limit) || 50,
        sort,
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const doc = await giftEventService.getById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const doc = await giftEventService.update(req.params.id, req.body);
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "GIFT_EVENT_UPDATE",
        entityType: "GiftEvent",
        entityId: doc._id,
        performedBy: req.user?._id,
        after: doc,
      });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      // could validate there are no registrations in service layer
      const doc = await giftEventService.delete(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "GIFT_EVENT_DELETE",
        entityType: "GiftEvent",
        entityId: req.params.id,
        performedBy: req.user?._id,
        before: doc,
      });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },

  async close(req, res, next) {
    try {
      const doc = await giftEventService.close(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "GIFT_EVENT_CLOSE",
        entityType: "GiftEvent",
        entityId: doc._id,
        performedBy: req.user?._id,
        after: doc,
      });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },

  async open(req, res, next) {
    try {
      const doc = await giftEventService.open(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "GIFT_EVENT_OPEN",
        entityType: "GiftEvent",
        entityId: doc._id,
        performedBy: req.user?._id,
        after: doc,
      });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },

  // Citizen registers for an event
  async register(req, res, next) {
    try {
      const eventId = req.params.id;
      const citizenId = req.user?.citizen; // assume authenticated user has linked citizen id
      if (!citizenId) return res.status(400).json({ message: "Citizen linkage required" });

      const result = await giftEventService.createRegistration({ eventId, citizenId });
      if (!result.success) {
        return res.status(400).json({ message: result.reason || "Cannot register" });
      }

      await auditLogService.create({
        action: "GIFT_REGISTRATION_CREATE",
        entityType: "GiftRegistration",
        entityId: result.registration._id,
        performedBy: req.user?._id,
        after: result.registration,
      });

      // send notification to citizen
      await notificationService.create({
        toUser: req.user?._id,
        title: `Đăng ký thành công: ${result.event.title}`,
        message: `Bạn đã đăng ký sự kiện ${result.event.title}. Mã QR sẽ được lưu trong lịch sử.`,
        type: "SYSTEM",
      });

      res.status(201).json({ registration: result.registration });
    } catch (err) {
      // if registration unique constraint fails, restore slot? service handles atomic decrement before create
      next(err);
    }
  },

  async getRegistrations(req, res, next) {
    try {
      const eventId = req.params.id;
      const { page, limit, status } = req.query;
      const filter = {};
      if (status) filter.status = status;
      const data = await giftEventService.getRegistrations(eventId, filter, {
        page: Number(page) || 1,
        limit: Number(limit) || 100,
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getMyRegistrations(req, res, next) {
    try {
      const citizenId = req.user?.citizen;
      if (!citizenId) return res.status(400).json({ message: "Citizen linkage required" });
      const { page, limit, status } = req.query;
      const filter = {};
      if (status) filter.status = status;
      const data = await giftEventService.getRegistrationsForCitizen(citizenId, filter, {
        page: Number(page) || 1,
        limit: Number(limit) || 50,
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async exportRegistrationsCsv(req, res, next) {
    try {
      const eventId = req.params.id;
      const { status } = req.query;
      const filter = {};
      if (status) filter.status = status;

      // fetch all registrations (no pagination) -- be cautious for very large sets
      const data = await giftEventService.getRegistrations(eventId, filter, { page: 1, limit: 10000 });
      const rows = data.docs || [];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="registrations_${eventId}.csv"`);

      // CSV header
      const header = ['fullName', 'address', 'registeredAt', 'status', 'qrCode'];
      const lines = [header.join(',')];

      for (const r of rows) {
        const citizen = r.citizen || {};
        let addr = '';
        try {
          const hh = citizen.household || {};
          const a = hh.address || {};
          addr = [a.street, a.ward, a.district, a.city].filter(Boolean).join(' - ');
        } catch (e) {
          addr = '';
        }
        const fullName = (citizen.fullName || '').replace(/\n|\r|,/g, ' ');
        const registeredAt = r.registeredAt ? new Date(r.registeredAt).toISOString() : '';
        const statusVal = r.status || '';
        const qr = r.qrCode || '';
        const line = [fullName, `"${addr.replace(/\"/g, '"')}"`, registeredAt, statusVal, qr].join(',');
        lines.push(line);
      }

      res.send(lines.join('\n'));
    } catch (err) {
      next(err);
    }
  },

  async markReceivedByQr(req, res, next) {
    try {
      const { qrCode } = req.body;
      if (!qrCode) return res.status(400).json({ message: "qrCode required" });
      const result = await giftEventService.markReceivedByQr(qrCode, req.user?._id);
      if (!result.success) return res.status(400).json({ message: result.reason });

      await auditLogService.create({
        action: "GIFT_REGISTRATION_RECEIVE",
        entityType: "GiftRegistration",
        entityId: result.registration._id,
        performedBy: req.user?._id,
        after: result.registration,
      });

      // notify user if linked
      const toUserId = result.registration.citizen && result.registration.citizen.user;
      if (toUserId) {
        await notificationService.create({
          toUser: toUserId,
          title: `Bạn đã nhận quà: ${result.registration.event.title}`,
          message: `Cảm ơn bạn đã đến nhận quà. Chúc mừng!`,
          type: "SYSTEM",
        });
      }

      res.json({ registration: result.registration });
    } catch (err) {
      next(err);
    }
  },
};
