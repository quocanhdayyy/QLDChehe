const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const studentAchievementSchema = new Schema(
  {
    citizen: {
      type: Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
      index: true,
    },
    schoolYear: { type: String, required: true },
    schoolName: { type: String },
    className: { type: String },
    achievement: {
      type: String,
      enum: ["GIOI", "TIEN_TIEN", "KHAC"],
      required: true,
    },
    evidenceImages: [{ type: String }],
    notebooksRewarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

studentAchievementSchema.index(
  { citizen: 1, schoolYear: 1 },
  { unique: false }
);

module.exports = model("StudentAchievement", studentAchievementSchema);
