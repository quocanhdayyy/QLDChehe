const { User, Notification } = require("../models");

module.exports = {
  // Create notifications for all citizens (batch insert)
  async broadcastToCitizens({ title, message, entityType, entityId, priority = "NORMAL" }) {
    // Find all users with role CONG_DAN
    const cursor = User.find({ role: "CONG_DAN", isActive: true }).cursor();
    const batch = [];
    for await (const user of cursor) {
      batch.push({
        toUser: user._id,
        title,
        message,
        type: "SYSTEM",
        entityType,
        entityId,
        priority,
      });
      if (batch.length >= 500) {
        await Notification.insertMany(batch);
        batch.length = 0;
      }
    }
    if (batch.length > 0) await Notification.insertMany(batch);
    return { success: true };
  },
};
