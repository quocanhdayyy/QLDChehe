const citizenService = require("../services/citizenService");
const { Citizen, Household } = require("../models");

module.exports = {
  // Get current citizen info
  async getMe(req, res, next) {
    try {
      console.log("📥 getMe request for user:", req.user._id);
      // req.user._id là user ID, cần tìm citizen có user này
      const citizen = await Citizen.findOne({ user: req.user._id })
        .populate("household")
        .populate("user");

      if (!citizen) {
        return res.status(404).json({ message: "Citizen profile not found" });
      }

      console.log("👤 Sending citizen:", citizen._id);
      console.log("🖼️ avatarUrl:", citizen.avatarUrl);
      res.json(citizen);
    } catch (err) {
      console.error("❌ Error in getMe:", err);
      next(err);
    }
  },

  // Update current citizen info
  async updateMe(req, res, next) {
    try {
      console.log("📤 updateMe request body:", req.body);
      console.log("🖼️ avatarUrl in request:", req.body.avatarUrl);

      // Find citizen by user ID
      let citizen = await Citizen.findOne({ user: req.user._id });
      console.log("👤 Found citizen:", citizen?._id);

      // Only allow updating certain fields
      const allowedFields = [
        "fullName",
        "avatarUrl",
        "email",
        "phone",
        "dateOfBirth",
        "gender",
        "nationalId",
        "ethnicity",
        "nationality",
        "educationLevel",
        "occupation",
      ];

      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      console.log("📝 Update data:", updateData);

      // If citizen doesn't exist, create new one
      if (!citizen) {
        const newCitizenData = {
          ...updateData,
          user: req.user._id,
        };
        citizen = await Citizen.create(newCitizenData);
      } else {
        // Update existing citizen
        citizen = await Citizen.findByIdAndUpdate(citizen._id, updateData, {
          new: true,
          runValidators: true,
        });
      }

      // Populate user and household
      citizen = await Citizen.findById(citizen._id)
        .populate("household")
        .populate("user");

      console.log("📥 Sending updated citizen:", citizen._id);
      console.log("🖼️ avatarUrl in response:", citizen.avatarUrl);
      res.json(citizen);
    } catch (err) {
      console.error("❌ Error in updateMe:", err);
      next(err);
    }
  },

  // Get current citizen's household with all members
  async getMyHousehold(req, res, next) {
    try {
      console.log("🏠 Getting household for user:", req.user._id);

      // Tìm citizen của user hiện tại
      const citizen = await Citizen.findOne({ user: req.user._id });
      console.log("👤 Found citizen:", citizen?._id, citizen?.fullName);

      if (!citizen || !citizen.household) {
        console.log("❌ Citizen not found or no household");
        return res.status(404).json({
          message: "Household not found",
          error: !citizen
            ? "Citizen profile not found"
            : "Citizen not assigned to any household",
        });
      }

      // Lấy household với tất cả members
      const household = await Household.findById(citizen.household)
        .populate("head")
        .populate("members");

      if (!household) {
        console.log("❌ Household not found in DB");
        return res.status(404).json({ message: "Household not found" });
      }

      console.log(
        "✅ Found household:",
        household.code,
        "with",
        household.members?.length,
        "members"
      );

      // Format response để match frontend expectation
      const response = {
        household: {
          _id: household._id,
          code: household.code,
          headName: household.head?.fullName,
          headId: household.head?._id,
          address: household.address,
          phone: household.phone,
          status: household.status,
          establishedAt: household.establishedAt,
        },
        members: household.members || [],
      };

      res.json(response);
    } catch (err) {
      console.error("❌ Error in getMyHousehold:", err);
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const doc = await citizenService.create(req.body);
      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  },
  async getAll(req, res, next) {
    try {
      const { page, limit, sort, ...filter } = req.query;
      const data = await citizenService.getAll(filter, {
        page: Number(page) || 1,
        limit: Number(limit) || 50,
        sort,
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
  async getById(req, res, next) {
    try {
      const doc = await citizenService.getById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const doc = await citizenService.update(req.params.id, req.body);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async delete(req, res, next) {
    try {
      const doc = await citizenService.delete(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },
  async getStats(req, res, next) {
    try {
      const stats = await citizenService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },
};
