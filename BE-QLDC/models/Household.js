const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const addressSchema = new Schema(
  {
    street: { type: String, trim: true },
    ward: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
  },
  { _id: false }
);

const householdSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true }, // Mã số hộ khẩu
    address: addressSchema,
    head: { type: Schema.Types.ObjectId, ref: "Citizen", required: true }, // Chủ hộ
    members: [{ type: Schema.Types.ObjectId, ref: "Citizen" }],
    phone: { type: String, trim: true }, // Số điện thoại hộ khẩu
    status: {
      type: String,
      enum: ["ACTIVE", "MOVED", "SPLIT", "MERGED", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    establishedAt: { type: Date },
    movedOutAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

// index for `code` is declared on the field itself (unique: true)

module.exports = model("Household", householdSchema);
