const rewardProposalService = require("../services/rewardProposalService");

module.exports = {
  async create(req, res, next) {
    try {
      const payload = { ...req.body, proposedBy: req.user && req.user._id };
      const doc = await rewardProposalService.create(payload);

      // Tạo notification cho leaders
      try {
        const { User, Notification } = require("../models");
        const leaders = await User.find({ role: "TO_TRUONG", isActive: true });

        if (leaders.length > 0) {
          const notifications = leaders.map((leader) => ({
            toUser: leader._id,
            fromUser: req.user._id,
            title: "Đề Xuất Khen Thưởng Mới",
            message: `${
              req.user.fullName || req.user.username
            } đã gửi đề xuất khen thưởng${
              payload.reason ? `: ${payload.reason}` : ""
            }`,
            type: "REWARD",
            entityType: "RewardProposal",
            entityId: doc._id,
            priority: "NORMAL",
          }));

          await Notification.insertMany(notifications);
          console.log(
            `📬 Created ${notifications.length} notifications for leaders (reward proposal)`
          );
        }
      } catch (notifError) {
        console.error("❌ Error creating notifications:", notifError);
      }

      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  },
  async getAll(req, res, next) {
    try {
      const { page, limit, sort, ...filter } = req.query;
      const data = await rewardProposalService.getAll(filter, {
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
      const doc = await rewardProposalService.getById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const doc = await rewardProposalService.update(req.params.id, req.body);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (err) {
      next(err);
    }
  },
  async delete(req, res, next) {
    try {
      const doc = await rewardProposalService.delete(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },

  async approve(req, res, next) {
    try {
      if (!req.user || req.user.role !== "TO_TRUONG") {
        return res
          .status(403)
          .json({ message: "Forbidden: requires TO_TRUONG role" });
      }
      const result = await rewardProposalService.approveRewardProposal({
        id: req.params.id,
        reviewerUserId: req.user._id,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async reject(req, res, next) {
    try {
      if (!req.user || req.user.role !== "TO_TRUONG") {
        return res
          .status(403)
          .json({ message: "Forbidden: requires TO_TRUONG role" });
      }
      const { reason } = req.body;
      const result = await rewardProposalService.rejectRewardProposal({
        id: req.params.id,
        reviewerUserId: req.user._id,
        rejectionReason: reason,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
  async getStats(req, res, next) {
    try {
      const stats = await rewardProposalService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getMyProposals(req, res, next) {
    try {
      const userId = req.user._id;
      const data = await rewardProposalService.getMyProposals(userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // Citizen can cancel their own pending proposal
  async cancel(req, res, next) {
    try {
      const { RewardProposal } = require("../models");
      const proposal = await RewardProposal.findById(req.params.id);

      if (!proposal) {
        return res.status(404).json({ message: "Đề xuất không tồn tại" });
      }

      // Check if the proposal belongs to the current user
      if (proposal.proposedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Bạn không có quyền hủy đề xuất này",
        });
      }

      // Only allow cancelling pending proposals
      if (proposal.status !== "PENDING") {
        return res.status(400).json({
          message: "Chỉ có thể hủy đề xuất đang chờ duyệt",
        });
      }

      // Delete related notifications before deleting the proposal
      try {
        const { Notification } = require("../models");

        // Xóa tất cả thông báo liên quan đến đề xuất này
        const deleteResult = await Notification.deleteMany({
          entityType: "RewardProposal",
          entityId: req.params.id,
        });

        console.log(
          `🗑️ Deleted ${deleteResult.deletedCount} notifications related to proposal ${req.params.id}`
        );
      } catch (notifError) {
        console.error("❌ Error deleting notifications:", notifError);
        // Continue to delete proposal even if notification deletion fails
      }

      // Delete the proposal
      await RewardProposal.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Đã hủy đề xuất thành công",
      });
    } catch (err) {
      next(err);
    }
  },
};
