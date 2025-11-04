const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      // ví dụ: 'CITIZEN_UPDATE_REQUESTED', 'CITIZEN_UPDATE_APPROVED', 'REWARD_PROPOSED', 'REWARD_APPROVED'
    },
    entityType: {
      type: String,
      enum: ['Citizen', 'Household', 'RewardProposal', 'EditRequest', 'User', 'Notification', 'GiftEvent', 'GiftRegistration'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },

    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
    evidenceImages: [{ type: String }],

    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },

    ipAddress: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = model('AuditLog', auditLogSchema);

