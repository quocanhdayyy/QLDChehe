const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const rewardEventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["SPECIAL_OCCASION", "SCHOOL_YEAR"],
      required: true,
      index: true,
    },
    description: { type: String },
    date: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number },
    status: {
      type: String,
      enum: ["PLANNED", "ONGOING", "COMPLETED"],
      default: "PLANNED",
      index: true,
    },
  },
  { timestamps: true }
);

rewardEventSchema.index({ type: 1, status: 1, date: 1 });

module.exports = model("RewardEvent", rewardEventSchema);
