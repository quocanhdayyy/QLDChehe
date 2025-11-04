const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fromUser: { type: Schema.Types.ObjectId, ref: 'User' },

    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['GENERAL', 'EDIT_REQUEST', 'REWARD', 'SYSTEM'], default: 'GENERAL' },

    entityType: { type: String, enum: ['EditRequest', 'RewardProposal', 'Citizen', 'Household', 'User'], default: undefined },
    entityId: { type: Schema.Types.ObjectId },

    priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH'], default: 'NORMAL' },

    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

notificationSchema.index({ toUser: 1, isRead: 1 });

module.exports = model('Notification', notificationSchema);

