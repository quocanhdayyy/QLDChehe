const { RewardDistribution } = require("../models");

module.exports = {
  async create(data) {
    return RewardDistribution.create(data);
  },
  async bulkCreate(items = []) {
    if (!Array.isArray(items) || items.length === 0) return [];
    return RewardDistribution.insertMany(
      items.map((i) => ({
        ...i,
        totalValue: (i.quantity || 0) * (i.unitValue || 0),
      }))
    );
  },
  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;
    const docs = await RewardDistribution.find(filter)
      .populate("event household citizen")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await RewardDistribution.countDocuments(filter);
    return { docs, total, page, limit };
  },
  async getById(id) {
    return RewardDistribution.findById(id).populate("event household citizen");
  },
  async update(id, data) {
    return RewardDistribution.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return RewardDistribution.findByIdAndDelete(id);
  },
  async summarizeByEvent(eventId) {
    const agg = await RewardDistribution.aggregate([
      {
        $match: {
          event: require("mongoose").Types.ObjectId.createFromHexString(
            String(eventId)
          ),
        },
      },
      {
        $group: {
          _id: "$event",
          totalHouseholds: { $addToSet: "$household" },
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: "$totalValue" },
        },
      },
      {
        $project: {
          _id: 0,
          totalHouseholds: { $size: "$totalHouseholds" },
          totalQuantity: 1,
          totalValue: 1,
        },
      },
    ]);
    return agg[0] || { totalHouseholds: 0, totalQuantity: 0, totalValue: 0 };
  },
};
