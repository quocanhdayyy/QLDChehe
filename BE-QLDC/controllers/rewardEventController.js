const rewardEventService = require("../services/rewardEventService");
const auditLogService = require("../services/auditLogService");

module.exports = {
  async create(req, res, next) {
    try {
      const doc = await rewardEventService.create(req.body);
      await auditLogService.create({
        action: "REWARD_EVENT_CREATE",
        entityType: "RewardEvent",
        entityId: doc._id,
        performedBy: req.user?._id,
      });
      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  },
  async getAll(req, res, next) {
    try {
      const { page, limit, sort, ...filter } = req.query;
      const data = await rewardEventService.getAll(filter, {
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
      const doc = await rewardEventService.getById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const doc = await rewardEventService.update(req.params.id, req.body);
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "REWARD_EVENT_UPDATE",
        entityType: "RewardEvent",
        entityId: doc._id,
        performedBy: req.user?._id,
      });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async delete(req, res, next) {
    try {
      const doc = await rewardEventService.delete(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "REWARD_EVENT_DELETE",
        entityType: "RewardEvent",
        entityId: req.params.id,
        performedBy: req.user?._id,
      });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },
};
