const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const editRequestSchema = new Schema(
  {
    citizen: { type: Schema.Types.ObjectId, ref: "Citizen", required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Các trường dự kiến thay đổi (object linh hoạt theo nhu cầu)
    proposedChanges: { type: Schema.Types.Mixed, required: true },
    targetFieldPaths: [{ type: String }], // ví dụ: ['occupation', 'phone']
    reason: { type: String, required: true },
    evidenceImages: [{ type: String }],

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

editRequestSchema.index({ citizen: 1, status: 1 });

module.exports = model("EditRequest", editRequestSchema);
