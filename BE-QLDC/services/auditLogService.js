const { AuditLog } = require("../models");

module.exports = {
  async create(data) {
    return AuditLog.create(data);
  },
  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;

    // Build query từ filter
    const query = { ...filter };

    // Xử lý date range filter
    if (filter.startDate || filter.endDate) {
      query.createdAt = {};
      if (filter.startDate) {
        query.createdAt.$gte = new Date(filter.startDate);
        delete query.startDate;
      }
      if (filter.endDate) {
        query.createdAt.$lte = new Date(filter.endDate);
        delete query.endDate;
      }
    }

    // Xử lý action pattern matching (chứa từ khóa)
    if (filter.action && !filter.action.startsWith("$")) {
      query.action = { $regex: filter.action, $options: "i" };
    }

    const docs = await AuditLog.find(query)
      .populate("performedBy", "username fullName email")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(query);
    return { docs, total, page, limit };
  },
  async getById(id) {
    return AuditLog.findById(id).populate(
      "performedBy",
      "username fullName email"
    );
  },
  // No delete by design for audit logs.
};
