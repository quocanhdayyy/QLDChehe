const { User } = require("../models");
const bcrypt = require("bcryptjs");

module.exports = {
  async create(data) {
    const payload = { ...data };
    if (payload.password) {
      payload.passwordHash = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }
    const user = await User.create(payload);
    return user;
  },
  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;
    const docs = await User.find(filter)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await User.countDocuments(filter);
    return { docs, total, page, limit };
  },
  async getById(id) {
    return User.findById(id);
  },
  async update(id, data) {
    const payload = { ...data };
    if (payload.password) {
      payload.passwordHash = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }
    return User.findByIdAndUpdate(id, payload, { new: true });
  },
  async delete(id) {
    return User.findByIdAndDelete(id);
  },
};
