const { RewardEvent } = require("../models");

module.exports = {
  async create(data) {
    return RewardEvent.create(data);
  },
  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;
    const docs = await RewardEvent.find(filter)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await RewardEvent.countDocuments(filter);
    return { docs, total, page, limit };
  },
  async getById(id) {
    return RewardEvent.findById(id);
  },
  async update(id, data) {
    return RewardEvent.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return RewardEvent.findByIdAndDelete(id);
  },
};
