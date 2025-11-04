/**
 * Script để dọn dẹp dữ liệu orphan (dữ liệu không còn reference hợp lệ)
 * và kiểm tra tính toàn vẹn dữ liệu
 */

const mongoose = require("mongoose");
const config = require("../configs");
const { Citizen, Household } = require("../models");

async function cleanupOrphanData() {
  try {
    console.log("🔍 Bắt đầu kiểm tra và dọn dẹp dữ liệu...\n");

    // 1. Tìm citizens có household không tồn tại
    console.log("📋 Kiểm tra citizens có household không hợp lệ...");
    const allCitizens = await Citizen.find({
      household: { $exists: true, $ne: null },
    });
    let orphanCitizens = 0;

    for (const citizen of allCitizens) {
      const household = await Household.findById(citizen.household);
      if (!household) {
        console.log(
          `⚠️  Citizen ${citizen.code || citizen._id} (${
            citizen.fullName
          }) có household không tồn tại`
        );
        await Citizen.findByIdAndUpdate(citizen._id, {
          $unset: { household: "" },
          relationshipToHead: null,
          isHead: false,
        });
        orphanCitizens++;
      }
    }

    if (orphanCitizens > 0) {
      console.log(
        `✅ Đã dọn dẹp ${orphanCitizens} citizens có household không hợp lệ\n`
      );
    } else {
      console.log(`✅ Không có citizens có household không hợp lệ\n`);
    }

    // 2. Tìm households có head không tồn tại
    console.log("📋 Kiểm tra households có head không hợp lệ...");
    const allHouseholds = await Household.find();
    let orphanHouseholds = 0;

    for (const household of allHouseholds) {
      const head = await Citizen.findById(household.head);
      if (!head) {
        console.log(
          `⚠️  Household ${household.code} có head không tồn tại - CẦN XÓA THỦ CÔNG`
        );
        orphanHouseholds++;
        // Không tự động xóa household, để admin quyết định
      }
    }

    if (orphanHouseholds > 0) {
      console.log(
        `⚠️  Tìm thấy ${orphanHouseholds} households có head không hợp lệ - Cần xử lý thủ công\n`
      );
    } else {
      console.log(`✅ Tất cả households đều có head hợp lệ\n`);
    }

    // 3. Đồng bộ members của households
    console.log("📋 Đồng bộ members của households...");
    let syncedHouseholds = 0;

    for (const household of allHouseholds) {
      const actualMembers = await Citizen.find({ household: household._id });
      const actualMemberIds = actualMembers.map((m) => m._id.toString());
      const currentMemberIds = (household.members || []).map((m) =>
        m.toString()
      );

      // So sánh và cập nhật nếu khác
      const needUpdate =
        actualMemberIds.length !== currentMemberIds.length ||
        actualMemberIds.some((id) => !currentMemberIds.includes(id));

      if (needUpdate) {
        await Household.findByIdAndUpdate(household._id, {
          members: actualMembers.map((m) => m._id),
        });
        console.log(
          `🔄 Đồng bộ household ${household.code}: ${currentMemberIds.length} → ${actualMemberIds.length} members`
        );
        syncedHouseholds++;
      }
    }

    if (syncedHouseholds > 0) {
      console.log(`✅ Đã đồng bộ ${syncedHouseholds} households\n`);
    } else {
      console.log(`✅ Tất cả households đã được đồng bộ\n`);
    }

    // 4. Thống kê
    console.log("📊 THỐNG KÊ:");
    const totalCitizens = await Citizen.countDocuments();
    const totalHouseholds = await Household.countDocuments();
    const citizensWithHousehold = await Citizen.countDocuments({
      household: { $exists: true, $ne: null },
    });
    const citizensWithoutHousehold = totalCitizens - citizensWithHousehold;

    console.log(`   👥 Tổng số nhân khẩu: ${totalCitizens}`);
    console.log(`   🏠 Tổng số hộ khẩu: ${totalHouseholds}`);
    console.log(`   ✅ Nhân khẩu có hộ khẩu: ${citizensWithHousehold}`);
    console.log(
      `   ⚠️  Nhân khẩu chưa có hộ khẩu: ${citizensWithoutHousehold}`
    );

    console.log("\n✅ Hoàn thành dọn dẹp!");
  } catch (error) {
    console.error("❌ Lỗi khi dọn dẹp:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Đóng kết nối database");
  }
}

// Kết nối database và chạy script
mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log("✅ Kết nối MongoDB thành công\n");
    return cleanupOrphanData();
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });
