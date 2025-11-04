const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['TO_TRUONG', 'CONG_DAN'],
      required: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    citizen: { type: Schema.Types.ObjectId, ref: 'Citizen' },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { sparse: true, unique: false });

module.exports = model('User', userSchema);

