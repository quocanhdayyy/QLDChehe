const notificationService = require("../services/notificationService");

module.exports = {
  async create(req, res, next) {
    try {
      const doc = await notificationService.create(req.body);
      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  },
  async getAll(req, res, next) {
    try {
      const { page, limit, sort, ...filter } = req.query;
      const data = await notificationService.getAll(filter, {
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
      const doc = await notificationService.getById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const doc = await notificationService.update(req.params.id, req.body);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async delete(req, res, next) {
    try {
      const doc = await notificationService.delete(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },
  async markAsRead(req, res, next) {
    try {
      const doc = await notificationService.markAsRead(
        req.params.id,
        req.user && req.user._id
      );
      if (!doc)
        return res.status(404).json({ message: "Not found or not authorized" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
};
