const { Household, Citizen, User } = require("../models");
const bcrypt = require("bcryptjs");

module.exports = {
  async create(data) {
    // Lấy thông tin chủ hộ để lấy phone
    const headCitizen = await Citizen.findById(data.head);

    // Tự động lấy phone từ chủ hộ
    const householdData = {
      ...data,
      phone: headCitizen?.phone || data.phone, // Ưu tiên phone từ chủ hộ
      members: [data.head], // Tự động thêm chủ hộ vào members
    };
    const household = await Household.create(householdData);

    // Cập nhật citizen để link với household
    await Citizen.findByIdAndUpdate(data.head, {
      household: household._id,
      isHead: true,
      relationshipToHead: "Chủ hộ",
    });

    // Tự động tạo User account cho chủ hộ
    try {
      if (headCitizen && headCitizen.phone) {
        // Check xem đã có user với phone này chưa
        const existingUser = await User.findOne({
          username: headCitizen.phone,
        });

        if (!existingUser) {
          // Tạo user mới
          const hashedPassword = await bcrypt.hash("123456", 10);
          const newUser = await User.create({
            username: headCitizen.phone,
            email: headCitizen.email || `${headCitizen.phone}@example.com`,
            passwordHash: hashedPassword,
            fullName: headCitizen.fullName,
            role: "CONG_DAN",
            phone: headCitizen.phone,
          });

          // Link user với citizen
          headCitizen.user = newUser._id;
          await headCitizen.save();

          console.log(`✅ Created user account for head: ${headCitizen.phone}`);
        } else {
          // User đã tồn tại, link với citizen nếu chưa có
          if (!headCitizen.user) {
            headCitizen.user = existingUser._id;
            await headCitizen.save();
            console.log(
              `🔗 Linked existing user to citizen: ${headCitizen.phone}`
            );
          } else {
            console.log(
              `ℹ️ User already exists and linked: ${headCitizen.phone}`
            );
          }
        }
      }
    } catch (error) {
      console.error("⚠️ Error creating user for head:", error.message);
      // Không throw error, household đã được tạo thành công
    }

    return household;
  },
  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;
    const docs = await Household.find(filter)
      .populate("head")
      .populate("members")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await Household.countDocuments(filter);
    return { docs, total, page, limit };
  },
  async getById(id) {
    return Household.findById(id).populate("head").populate("members");
  },
  async update(id, data) {
    // Nếu thay đổi chủ hộ, tự động cập nhật phone từ chủ hộ mới
    if (data.head) {
      const headCitizen = await Citizen.findById(data.head);
      if (headCitizen?.phone) {
        data.phone = headCitizen.phone;
      }
    }

    return Household.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("head")
      .populate("members");
  },
  async delete(id) {
    // Lấy thông tin household trước khi xóa
    const household = await Household.findById(id);
    if (!household) {
      return null;
    }

    // Cập nhật tất cả citizens thuộc household này - xóa reference
    await Citizen.updateMany(
      { household: id },
      {
        $unset: { household: "" }, // Xóa trường household
        relationshipToHead: null,
        isHead: false,
      }
    );

    // Xóa household khỏi database (HARD DELETE)
    const deletedHousehold = await Household.findByIdAndDelete(id);

    console.log(
      `🗑️ Đã xóa hộ khẩu ${household.code} và cập nhật ${
        household.members?.length || 0
      } thành viên`
    );

    return deletedHousehold;
  },
  async getStats() {
    const total = await Household.countDocuments();
    return { total };
  },
};
