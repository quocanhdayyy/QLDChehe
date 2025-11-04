const auditLogService = require("../services/auditLogService");

module.exports = {
  async getAll(req, res, next) {
    try {
      const { page, limit, sort, ...filter } = req.query;
      const data = await auditLogService.getAll(filter, {
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
      const doc = await auditLogService.getById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  // No create/update/delete by controller; audit logs are system-generated in services
};
