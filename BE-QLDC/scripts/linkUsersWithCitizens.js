/**
 * Script để link User accounts với Citizen profiles
 * Dựa vào phone number để match User với Citizen
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { User, Citizen } = require("../models");

async function linkUsersWithCitizens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Tìm tất cả users có role CONG_DAN
    const users = await User.find({ role: "CONG_DAN" });
    console.log(`📊 Found ${users.length} citizen users`);

    let linked = 0;
    let alreadyLinked = 0;
    let notFound = 0;

    for (const user of users) {
      // Tìm citizen có phone number trùng với username của user
      // CHỈ LINK VỚI CITIZEN LÀ CHỦ HỘ (isHead: true)
      const citizen = await Citizen.findOne({
        phone: user.username,
        isHead: true,
      });

      if (!citizen) {
        console.log(`⚠️  No head citizen found for user: ${user.username}`);
        console.log(`   (Chỉ chủ hộ mới có tài khoản đăng nhập)`);
        notFound++;
        continue;
      }

      if (citizen.user && citizen.user.toString() === user._id.toString()) {
        console.log(
          `✓  Already linked: ${user.username} → ${citizen.fullName} (Chủ hộ)`
        );
        alreadyLinked++;
        continue;
      }

      // Link user với citizen (chỉ chủ hộ)
      citizen.user = user._id;
      await citizen.save();

      console.log(`🔗 Linked: ${user.username} → ${citizen.fullName} (Chủ hộ)`);
      linked++;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary:");
    console.log(`   ✅ Newly linked: ${linked}`);
    console.log(`   ✓  Already linked: ${alreadyLinked}`);
    console.log(`   ⚠️  Not found: ${notFound}`);
    console.log("=".repeat(60));

    await mongoose.connection.close();
    console.log("\n✅ Script completed successfully");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run script
linkUsersWithCitizens();
