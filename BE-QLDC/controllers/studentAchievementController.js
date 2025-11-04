const studentAchievementService = require("../services/studentAchievementService");
const auditLogService = require("../services/auditLogService");

module.exports = {
  async create(req, res, next) {
    try {
      const doc = await studentAchievementService.create(req.body);
      await auditLogService.create({
        action: "STUDENT_ACHIEVEMENT_CREATE",
        entityType: "StudentAchievement",
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
      const data = await studentAchievementService.getAll(filter, {
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
      const doc = await studentAchievementService.getById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const doc = await studentAchievementService.update(
        req.params.id,
        req.body
      );
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "STUDENT_ACHIEVEMENT_UPDATE",
        entityType: "StudentAchievement",
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
      const doc = await studentAchievementService.delete(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      await auditLogService.create({
        action: "STUDENT_ACHIEVEMENT_DELETE",
        entityType: "StudentAchievement",
        entityId: req.params.id,
        performedBy: req.user?._id,
      });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },
};
