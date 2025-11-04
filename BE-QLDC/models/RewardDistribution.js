const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const rewardDistributionSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "RewardEvent",
      required: true,
      index: true,
    },
    household: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    citizen: { type: Schema.Types.ObjectId, ref: "Citizen" },
    quantity: { type: Number, required: true, default: 1 },
    unitValue: { type: Number, required: true, default: 0 },
    totalValue: { type: Number, required: true, default: 0 },
    note: { type: String },
  },
  { timestamps: true }
);

rewardDistributionSchema.pre("save", function (next) {
  this.totalValue = (this.quantity || 0) * (this.unitValue || 0);
  next();
});

rewardDistributionSchema.index({ event: 1, household: 1 });

module.exports = model("RewardDistribution", rewardDistributionSchema);
