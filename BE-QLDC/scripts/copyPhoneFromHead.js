/**
 * Script để tự động copy số điện thoại từ chủ hộ sang household
 * Chạy script này để fix dữ liệu cũ
 */

const mongoose = require("mongoose");
const config = require("../configs");
const { Household, Citizen } = require("../models");

async function copyPhoneFromHead() {
  try {
    console.log("🔄 Bắt đầu copy số điện thoại từ chủ hộ...");

    // Lấy tất cả households không có phone hoặc phone rỗng
    const households = await Household.find({
      $or: [{ phone: { $exists: false } }, { phone: null }, { phone: "" }],
    }).populate("head");

    console.log(
      `📊 Tìm thấy ${households.length} hộ khẩu chưa có số điện thoại`
    );

    let updated = 0;
    let skipped = 0;

    for (const household of households) {
      if (household.head && household.head.phone) {
        // Copy phone từ chủ hộ
        await Household.findByIdAndUpdate(household._id, {
          phone: household.head.phone,
        });

        console.log(
          `✅ ${household.code}: Đã copy phone ${household.head.phone} từ chủ hộ ${household.head.fullName}`
        );
        updated++;
      } else {
        console.log(
          `⚠️ ${household.code}: Chủ hộ không có số điện thoại, bỏ qua`
        );
        skipped++;
      }
    }

    console.log(`\n📊 Tổng kết:`);
    console.log(`   ✅ Đã cập nhật: ${updated} hộ khẩu`);
    console.log(`   ⚠️ Bỏ qua: ${skipped} hộ khẩu`);
  } catch (error) {
    console.error("❌ Lỗi khi copy phone:", error);
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
    return copyPhoneFromHead();
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });
