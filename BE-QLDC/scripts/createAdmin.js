const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import User model
const User = require("../models/User");

const createAdminUser = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_ATLAS);
    console.log("✅ Đã kết nối MongoDB");

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("⚠️  Tài khoản admin đã tồn tại!");
      console.log("Username:", existingAdmin.username);
      console.log("Role:", existingAdmin.role);
      console.log("Full Name:", existingAdmin.fullName);

      // Hỏi có muốn reset password không
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      readline.question(
        "Bạn có muốn reset mật khẩu thành 123456? (y/n): ",
        async (answer) => {
          if (answer.toLowerCase() === "y") {
            const passwordHash = await bcrypt.hash("123456", 10);
            existingAdmin.passwordHash = passwordHash;
            await existingAdmin.save();
            console.log("✅ Đã reset mật khẩu thành công!");
          }
          readline.close();
          mongoose.connection.close();
          process.exit(0);
        }
      );
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash("123456", 10);

    // Tạo tài khoản admin
    const admin = await User.create({
      username: "admin",
      passwordHash: passwordHash,
      role: "TO_TRUONG",
      fullName: "Quản trị viên",
      email: "admin@qldc.vn",
      phone: "0123456789",
      isActive: true,
      note: "Tài khoản quản trị hệ thống",
    });

    console.log("\n✅ Tạo tài khoản admin thành công!");
    console.log("================================");
    console.log("Username:  admin");
    console.log("Password:  123456");
    console.log("Role:      TO_TRUONG (Tổ trưởng)");
    console.log("Full Name:", admin.fullName);
    console.log("Email:    ", admin.email);
    console.log("================================");
    console.log("\n🔐 Hãy đổi mật khẩu sau khi đăng nhập lần đầu!");

    // Đóng kết nối
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo admin:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Chạy script
createAdminUser();
