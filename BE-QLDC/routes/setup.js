const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

const router = express.Router();

// POST /setup/create-admin - Tạo admin đầu tiên (chỉ cho development)
router.post("/create-admin", async (req, res, next) => {
  try {
    // Kiểm tra xem đã có admin chưa
    const adminCount = await User.countDocuments({ role: "TO_TRUONG" });

    if (adminCount > 0) {
      return res.status(400).json({
        message:
          "Hệ thống đã có tài khoản tổ trưởng. Không thể tạo admin mới qua endpoint này.",
        hint: "Sử dụng script: npm run create-admin để reset password",
      });
    }

    // Tạo admin
    const passwordHash = await bcrypt.hash("123456", 10);
    const admin = await User.create({
      username: "admin",
      passwordHash,
      role: "TO_TRUONG",
      fullName: "Quản trị viên",
      email: "admin@qldc.vn",
      phone: "0123456789",
      isActive: true,
      note: "Tài khoản quản trị hệ thống",
    });

    res.status(201).json({
      message: "Tạo tài khoản admin thành công!",
      admin: {
        username: admin.username,
        role: admin.role,
        fullName: admin.fullName,
        email: admin.email,
      },
      credentials: {
        username: "admin",
        password: "123456",
        note: "Hãy đổi mật khẩu sau khi đăng nhập!",
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /setup/status - Kiểm tra trạng thái hệ thống
router.get("/status", async (req, res, next) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalLeaders: await User.countDocuments({ role: "TO_TRUONG" }),
      totalCitizens: await User.countDocuments({ role: "CONG_DAN" }),
      hasAdmin: (await User.countDocuments({ role: "TO_TRUONG" })) > 0,
    };

    res.json({
      message: "Trạng thái hệ thống",
      stats,
      needSetup: !stats.hasAdmin,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
