const { Notification, User } = require("../models");
const emailService = require("./emailService");

module.exports = {
  async create(data) {
    const doc = await Notification.create(data);
    // send email asynchronously if toUser has email
    if (doc.toUser) {
      (async () => {
        try {
          // load user email
          const user = await User.findById(doc.toUser).lean();
          if (user && user.email) {
            await emailService.sendMail({
              to: user.email,
              subject: doc.title,
              text: doc.message,
              html: `<p>${doc.message}</p>`,
            });
          }
        } catch (err) {
          console.error('notificationService: failed sending email', err);
        }
      })();
    }
    return doc;
  },
  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;
    const docs = await Notification.find(filter)
      .populate("toUser fromUser")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await Notification.countDocuments(filter);
    return { docs, total, page, limit };
  },
  async getById(id) {
    return Notification.findById(id).populate("toUser fromUser");
  },
  async update(id, data) {
    return Notification.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return Notification.findByIdAndDelete(id);
  },
  async markAsRead(id, userId) {
    return Notification.findOneAndUpdate(
      { _id: id, toUser: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  },
};
