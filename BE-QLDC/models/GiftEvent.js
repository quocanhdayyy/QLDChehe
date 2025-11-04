const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const giftEventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, trim: true }, // e.g., TET, TRUNG_THU, OTHER

    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },

    slotsTotal: { type: Number, required: true, default: 0 },
    slotsRemaining: { type: Number, required: true, default: 0, index: true },

    conditions: {
      minAge: { type: Number },
      maxAge: { type: Number },
      areaIds: [{ type: String }],
      povertyStatus: { type: String },
      minPoints: { type: Number },
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "EXPIRED", "CANCELLED"],
      default: "OPEN",
      index: true,
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    extra: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

giftEventSchema.index({ title: 1 });

module.exports = model("GiftEvent", giftEventSchema);
