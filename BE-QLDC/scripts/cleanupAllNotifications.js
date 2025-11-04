// Load environment variables
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");

async function cleanupAllNotifications() {
  try {
    if (!process.env.MONGODB_ATLAS) {
      console.error("❌ ERROR: MONGODB_ATLAS not found in .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_ATLAS);
    console.log("📊 Connected to MongoDB\n");

    const { Notification } = require("../models");

    // Đếm tổng số notification
    const totalCount = await Notification.countDocuments();
    console.log(`📬 Total notifications in database: ${totalCount}`);

    if (totalCount === 0) {
      console.log("✅ Database is already clean!");
      process.exit(0);
    }

    console.log("\n⚠️  WARNING: This will delete ALL notifications!");
    console.log(
      "This is recommended to start fresh with correct notification logic.\n"
    );

    // Xóa TẤT CẢ notification
    const result = await Notification.deleteMany({});

    console.log(`✅ Deleted ${result.deletedCount} notifications`);
    console.log("\n🎉 Database cleaned successfully!");
    console.log("📝 From now on:");
    console.log(
      "   - Each user will only receive notifications meant for them"
    );
    console.log("   - No more duplicate or wrong notifications\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

cleanupAllNotifications();
