const { StudentAchievement } = require("../models");

module.exports = {
  async create(data) {
    return StudentAchievement.create(data);
  },
  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;
    const docs = await StudentAchievement.find(filter)
      .populate("citizen")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await StudentAchievement.countDocuments(filter);
    return { docs, total, page, limit };
  },
  async getById(id) {
    return StudentAchievement.findById(id).populate("citizen");
  },
  async update(id, data) {
    return StudentAchievement.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return StudentAchievement.findByIdAndDelete(id);
  },
};
