const { Citizen, Household } = require("../models");

module.exports = {
  // Helper function để generate mã nhân khẩu tự động
  async generateCitizenCode() {
    // Lấy tất cả citizens có code dạng NK + số
    const citizens = await Citizen.find({ code: /^NK\d+$/ }).select("code");

    if (!citizens || citizens.length === 0) {
      return "NK1"; // Citizen đầu tiên
    }

    // Extract tất cả các số và tìm số lớn nhất
    const numbers = citizens.map((c) => parseInt(c.code.replace("NK", ""), 10));
    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;

    return `NK${nextNumber}`;
  },

  async create(data) {
    // Tự động generate code nếu chưa có
    if (!data.code) {
      data.code = await this.generateCitizenCode();
    }

    const citizen = await Citizen.create(data);

    // Nếu citizen có household, tự động thêm citizen vào mảng members của household
    if (data.household) {
      await Household.findByIdAndUpdate(
        data.household,
        { $addToSet: { members: citizen._id } }, // $addToSet tránh duplicate
        { new: true }
      );
    }

    return citizen;
  },
  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;
    const docs = await Citizen.find(filter)
      .populate("household")
      .populate("user")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await Citizen.countDocuments(filter);
    return { docs, total, page, limit };
  },
  async getById(id) {
    return Citizen.findById(id).populate("household").populate("user");
  },
  async update(id, data) {
    // Lấy thông tin citizen cũ để biết household trước đó
    const oldCitizen = await Citizen.findById(id);

    const citizen = await Citizen.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("household")
      .populate("user");

    // Xử lý thay đổi household
    if (data.household !== undefined) {
      const oldHouseholdId = oldCitizen?.household?.toString();
      const newHouseholdId = data.household?.toString();

      // Nếu household thay đổi
      if (oldHouseholdId !== newHouseholdId) {
        // Xóa citizen khỏi household cũ
        if (oldHouseholdId) {
          await Household.findByIdAndUpdate(
            oldHouseholdId,
            { $pull: { members: id } },
            { new: true }
          );
        }

        // Thêm citizen vào household mới
        if (newHouseholdId) {
          await Household.findByIdAndUpdate(
            newHouseholdId,
            { $addToSet: { members: id } },
            { new: true }
          );
        }
      }
    }

    return citizen;
  },
  async delete(id) {
    // Lấy thông tin citizen trước khi xóa
    const citizen = await Citizen.findById(id);
    if (!citizen) {
      return null;
    }

    // Xóa citizen khỏi mảng members của household
    if (citizen.household) {
      await Household.findByIdAndUpdate(
        citizen.household,
        { $pull: { members: id } },
        { new: true }
      );
      console.log(`🔗 Đã xóa ${citizen.fullName} khỏi household`);
    }

    // Xóa citizen khỏi database (HARD DELETE - xóa vĩnh viễn)
    const deletedCitizen = await Citizen.findByIdAndDelete(id);

    console.log(
      `🗑️ Đã XÓA VĨNH VIỄN nhân khẩu: ${citizen.code || citizen._id} - ${
        citizen.fullName
      }`
    );

    return deletedCitizen;
  },
  async getStats() {
    const total = await Citizen.countDocuments();
    return { total };
  },
};
