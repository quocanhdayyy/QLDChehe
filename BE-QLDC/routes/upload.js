const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { authenticate } = require("../middleware/auth");
const { Citizen } = require("../models");
const fs = require("fs");
const path = require("path");

// Upload avatar
router.post(
  "/avatar",
  authenticate,
  upload.single("avatar"),
  async (req, res) => {
    console.log("📥 POST /upload/avatar - Request received");
    console.log("   User:", req.user?._id);
    console.log("   File:", req.file?.filename);

    try {
      if (!req.file) {
        console.log("❌ No file in request");
        return res
          .status(400)
          .json({ message: "Không có file nào được upload" });
      }

      // Tạo URL của ảnh
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      console.log("📤 Uploaded file:", req.file.filename);
      console.log("🖼️ Avatar URL:", avatarUrl);

      // Tìm và cập nhật avatar URL cho citizen
      const citizen = await Citizen.findOne({ user: req.user._id });

      if (citizen) {
        // Xóa ảnh cũ nếu có (nếu không phải URL bên ngoài)
        if (citizen.avatarUrl && citizen.avatarUrl.startsWith("/uploads/")) {
          const oldImagePath = path.join(__dirname, "..", citizen.avatarUrl);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("🗑️ Deleted old avatar:", citizen.avatarUrl);
          }
        }

        // Cập nhật URL mới
        citizen.avatarUrl = avatarUrl;
        await citizen.save();

        const updatedCitizen = await Citizen.findById(citizen._id)
          .populate("household")
          .populate("user");

        console.log("✅ Updated citizen avatar:", updatedCitizen._id);
        res.json({
          message: "Upload ảnh thành công",
          avatarUrl: avatarUrl,
          citizen: updatedCitizen,
        });
      } else {
        // Nếu chưa có citizen, chỉ trả về URL
        res.json({
          message: "Upload ảnh thành công",
          avatarUrl: avatarUrl,
        });
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      // Xóa file nếu có lỗi
      if (req.file) {
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.status(500).json({
        message: error.message || "Lỗi khi upload ảnh",
      });
    }
  }
);

// Xóa avatar
router.delete("/avatar", authenticate, async (req, res) => {
  try {
    const citizen = await Citizen.findOne({ user: req.user._id });

    if (!citizen) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin citizen" });
    }

    // Xóa file ảnh nếu có
    if (citizen.avatarUrl && citizen.avatarUrl.startsWith("/uploads/")) {
      const imagePath = path.join(__dirname, "..", citizen.avatarUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("🗑️ Deleted avatar:", citizen.avatarUrl);
      }
    }

    // Xóa URL trong database
    citizen.avatarUrl = null;
    await citizen.save();

    const updatedCitizen = await Citizen.findById(citizen._id)
      .populate("household")
      .populate("user");

    res.json({
      message: "Đã xóa ảnh đại diện",
      citizen: updatedCitizen,
    });
  } catch (error) {
    console.error("❌ Delete avatar error:", error);
    res.status(500).json({
      message: error.message || "Lỗi khi xóa ảnh",
    });
  }
});

module.exports = router;
