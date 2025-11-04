const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const giftRegistrationSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: "GiftEvent", required: true, index: true },
    citizen: { type: Schema.Types.ObjectId, ref: "Citizen", required: true, index: true },

    qrCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["REGISTERED", "RECEIVED", "CANCELLED"],
      default: "REGISTERED",
      index: true,
    },

    registeredAt: { type: Date, default: Date.now },
    receivedAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

giftRegistrationSchema.index({ event: 1, citizen: 1 }, { unique: true });

module.exports = model("GiftRegistration", giftRegistrationSchema);
