/**
 * Script để đồng bộ members của Household với Citizens
 * Chạy script này để fix dữ liệu cũ
 */

const mongoose = require("mongoose");
const config = require("../configs");
const { Household, Citizen } = require("../models");

async function syncHouseholdMembers() {
  try {
    console.log("🔄 Bắt đầu đồng bộ household members...");

    // 1. Lấy tất cả households
    const households = await Household.find();
    console.log(`📊 Tìm thấy ${households.length} hộ khẩu`);

    // 2. Với mỗi household, tìm tất cả citizens thuộc household đó
    for (const household of households) {
      const citizens = await Citizen.find({ household: household._id });

      // Tạo mảng members mới từ các citizens
      const memberIds = citizens.map((c) => c._id);

      // Cập nhật household với members đầy đủ
      await Household.findByIdAndUpdate(household._id, {
        members: memberIds,
      });

      console.log(
        `✅ Household ${household.code}: Đã cập nhật ${memberIds.length} thành viên`
      );
    }

    // 3. Lấy tất cả citizens có household nhưng không có relationshipToHead
    const citizensWithoutRelationship = await Citizen.find({
      household: { $exists: true, $ne: null },
      relationshipToHead: { $exists: false },
    });

    console.log(
      `\n📊 Tìm thấy ${citizensWithoutRelationship.length} nhân khẩu chưa có quan hệ với chủ hộ`
    );

    // 4. Với mỗi household, set relationshipToHead cho head
    for (const household of households) {
      await Citizen.findByIdAndUpdate(household.head, {
        relationshipToHead: "Chủ hộ",
        isHead: true,
      });
    }

    console.log("\n✅ Hoàn thành đồng bộ!");
    console.log(
      "💡 Lưu ý: Các nhân khẩu không phải chủ hộ cần được cập nhật quan hệ thủ công"
    );
  } catch (error) {
    console.error("❌ Lỗi khi đồng bộ:", error);
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
    return syncHouseholdMembers();
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });
