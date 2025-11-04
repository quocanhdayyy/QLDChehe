const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const rewardProposalSchema = new Schema(
  {
    citizen: { type: Schema.Types.ObjectId, ref: 'Citizen', required: true }, // người được đề xuất
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // người gửi đề xuất

    title: { type: String, required: true, trim: true },
    description: { type: String },
    criteria: { type: String },
    evidenceImages: [{ type: String }],

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

rewardProposalSchema.index({ citizen: 1, status: 1 });

module.exports = model('RewardProposal', rewardProposalSchema);

