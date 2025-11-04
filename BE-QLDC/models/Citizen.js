const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const citizenSchema = new Schema(
  {
    code: { type: String, unique: true, trim: true }, // Mã nhân khẩu: NK1, NK2, NK3...
    household: { type: Schema.Types.ObjectId, ref: "Household", index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },

    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "UNKNOWN"],
      default: "UNKNOWN",
    },

    nationalId: { type: String, trim: true }, // CMND/CCCD
    relationshipToHead: { type: String, trim: true }, // Quan hệ với chủ hộ
    isHead: { type: Boolean, default: false },

    occupation: { type: String, trim: true },
    educationLevel: { type: String, trim: true },

    residenceStatus: {
      type: String,
      enum: ["THUONG_TRU", "TAM_TRU", "TAM_VANG"],
      default: "THUONG_TRU",
      index: true,
    },
    temporaryResidenceAddress: { type: String, trim: true },
    hometown: { type: String, trim: true },
    ethnicity: { type: String, trim: true },
    religion: { type: String, trim: true },
    maritalStatus: {
      type: String,
      enum: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "UNKNOWN"],
      default: "UNKNOWN",
    },

    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    avatarUrl: { type: String },

    status: {
      type: String,
      enum: ["ALIVE", "DECEASED", "MOVED_OUT"],
      default: "ALIVE",
      index: true,
    },
    deathDate: { type: Date },
    movedOutDate: { type: Date },

    note: { type: String },
  },
  { timestamps: true }
);

citizenSchema.index({ nationalId: 1 }, { unique: true, sparse: true });

module.exports = model("Citizen", citizenSchema);
