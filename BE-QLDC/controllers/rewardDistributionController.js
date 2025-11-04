const rewardDistributionService = require("../services/rewardDistributionService");
const auditLogService = require("../services/auditLogService");

module.exports = {
  async create(req, res, next) {
    try {
      const doc = await rewardDistributionService.create(req.body);
      await auditLogService.create({
        action: "REWARD_DISTRIBUTION_CREATE",
        entityType: "RewardDistribution",
        entityId: doc._id,
        performedBy: req.user?._id,
      });
      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  },
  async bulkCreate(req, res, next) {
    try {
      const docs = await rewardDistributionService.bulkCreate(
        req.body?.items || []
      );
      await auditLogService.create({
        action: "REWARD_DISTRIBUTION_BULK_CREATE",
        entityType: "RewardDistribution",
        performedBy: req.user?._id,
      });
      res.status(201).json({ inserted: docs.length, docs });
    } catch (err) {
      next(err);
    }
  },
  async getAll(req, res, next) {
    try {
      const { page, limit, sort, ...filter } = req.query;
      const data = await rewardDistributionService.getAll(filter, {
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
      const doc = await rewardDistributionService.getById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const doc = await rewardDistributionService.update(
        req.params.id,
        req.body
      );
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "REWARD_DISTRIBUTION_UPDATE",
        entityType: "RewardDistribution",
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
      const doc = await rewardDistributionService.delete(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "REWARD_DISTRIBUTION_DELETE",
        entityType: "RewardDistribution",
        entityId: req.params.id,
        performedBy: req.user?._id,
      });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },
  async summarizeByEvent(req, res, next) {
    try {
      const summary = await rewardDistributionService.summarizeByEvent(
        req.params.eventId
      );
      res.json(summary);
    } catch (err) {
      next(err);
    }
  },
};
