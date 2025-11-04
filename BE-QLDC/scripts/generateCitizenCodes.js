/**
 * Script để tự động tạo mã nhân khẩu cho các citizen chưa có code
 * Chạy script này để fix dữ liệu cũ
 */

const mongoose = require("mongoose");
const config = require("../configs");
const { Citizen } = require("../models");

async function generateCitizenCodes() {
  try {
    console.log("🔄 Bắt đầu tạo mã nhân khẩu...");

    // Lấy tất cả citizens chưa có code
    const citizensWithoutCode = await Citizen.find({
      $or: [{ code: { $exists: false } }, { code: null }, { code: "" }],
    }).sort({ createdAt: 1 }); // Sort theo thời gian tạo, cũ nhất đầu tiên

    console.log(
      `📊 Tìm thấy ${citizensWithoutCode.length} nhân khẩu chưa có mã`
    );

    if (citizensWithoutCode.length === 0) {
      console.log("✅ Tất cả nhân khẩu đã có mã!");
      return;
    }

    // Tìm mã lớn nhất hiện có
    const citizensWithCode = await Citizen.find({
      code: /^NK\d+$/,
    }).select("code");

    let startNumber = 1;
    if (citizensWithCode.length > 0) {
      const numbers = citizensWithCode.map((c) =>
        parseInt(c.code.replace("NK", ""), 10)
      );
      startNumber = Math.max(...numbers) + 1;
      console.log(`📍 Bắt đầu từ mã: NK${startNumber}`);
    }

    // Generate code cho từng citizen
    let currentNumber = startNumber;
    for (const citizen of citizensWithoutCode) {
      const newCode = `NK${currentNumber}`;
      await Citizen.findByIdAndUpdate(citizen._id, { code: newCode });
      console.log(
        `✅ ${newCode}: ${citizen.fullName} (ID: ${citizen._id
          .toString()
          .substring(0, 8)}...)`
      );
      currentNumber++;
    }

    console.log(
      `\n✅ Hoàn thành! Đã tạo ${citizensWithoutCode.length} mã nhân khẩu`
    );
    console.log(`📝 Mã cuối cùng: NK${currentNumber - 1}`);
  } catch (error) {
    console.error("❌ Lỗi khi tạo mã:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Đóng kết nối database");
  }
}

// Kết nối database và chạy script
mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log("✅ Kết nối MongoDB thành công");
    return generateCitizenCodes();
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });
