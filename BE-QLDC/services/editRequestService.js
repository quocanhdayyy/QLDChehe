const { EditRequest, Citizen } = require("../models");
const auditLogService = require("./auditLogService");
const notificationService = require("./notificationService");

module.exports = {
  async create(data) {
    const doc = await EditRequest.create(data);

    // Tạo audit log cho việc tạo yêu cầu
    if (data.requestedBy) {
      await auditLogService.create({
        action: "EDIT_REQUEST_CREATED",
        entityType: "EditRequest",
        entityId: doc._id,
        performedBy: data.requestedBy,
        reason: data.reason || "Tạo yêu cầu chỉnh sửa thông tin",
        before: {
          title: data.title,
          requestType: data.requestType,
          description: data.description,
          details: data.proposedChanges?.details,
          proposedChanges: data.proposedChanges,
        },
      });
    }

    return doc;
  },
  async getAll(filter = {}, options = {}) {
    const { limit = 50, page = 1, sort = "-createdAt" } = options;
    const docs = await EditRequest.find(filter)
      .populate({
        path: "citizen",
        populate: { path: "household", select: "code address" },
      })
      .populate("requestedBy", "fullName username")
      .populate("reviewedBy", "fullName username")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await EditRequest.countDocuments(filter);
    return { docs, total, page, limit };
  },
  async getById(id) {
    return EditRequest.findById(id)
      .populate({
        path: "citizen",
        populate: { path: "household", select: "code address" },
      })
      .populate("requestedBy", "fullName username")
      .populate("reviewedBy", "fullName username");
  },
  async update(id, data) {
    return EditRequest.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return EditRequest.findByIdAndDelete(id);
  },

  // Approve an edit request: apply changes to Citizen, log, notify
  async approveEditRequest({ id, reviewerUserId }) {
    const reqDoc = await EditRequest.findById(id).populate(
      "citizen requestedBy"
    );
    if (!reqDoc) throw new Error("EditRequest not found");
    if (reqDoc.status !== "PENDING")
      throw new Error("EditRequest is not pending");

    const citizen = await Citizen.findById(reqDoc.citizen._id);
    if (!citizen) throw new Error("Citizen not found");

    const before = citizen.toObject();
    const updates = reqDoc.proposedChanges || {};
    Object.entries(updates).forEach(([k, v]) => {
      citizen.set(k, v);
    });
    const saved = await citizen.save();

    reqDoc.status = "APPROVED";
    reqDoc.reviewedBy = reviewerUserId;
    reqDoc.reviewedAt = new Date();
    reqDoc.resolvedAt = new Date();
    await reqDoc.save();

    await auditLogService.create({
      action: "CITIZEN_UPDATE_APPROVED",
      entityType: "Citizen",
      entityId: citizen._id,
      performedBy: reviewerUserId,
      before,
      after: saved.toObject(),
      reason: `Approve EditRequest ${reqDoc._id}`,
    });

    await notificationService.create({
      toUser: reqDoc.requestedBy._id || reqDoc.requestedBy, // requester
      fromUser: reviewerUserId,
      title: "Yêu cầu chỉnh sửa đã được duyệt",
      message: "Yêu cầu chỉnh sửa thông tin nhân khẩu của bạn đã được duyệt.",
      type: "EDIT_REQUEST",
      entityType: "EditRequest",
      entityId: reqDoc._id,
      priority: "NORMAL",
    });

    return { request: reqDoc, citizen: saved };
  },

  // Reject an edit request: mark rejected, log, notify with reason
  async rejectEditRequest({ id, reviewerUserId, rejectionReason }) {
    const reqDoc = await EditRequest.findById(id).populate(
      "citizen requestedBy"
    );
    if (!reqDoc) throw new Error("EditRequest not found");
    if (reqDoc.status !== "PENDING")
      throw new Error("EditRequest is not pending");

    reqDoc.status = "REJECTED";
    reqDoc.reviewedBy = reviewerUserId;
    reqDoc.reviewedAt = new Date();
    reqDoc.rejectionReason = rejectionReason || "Không có lý do";
    reqDoc.resolvedAt = new Date();
    await reqDoc.save();

    await auditLogService.create({
      action: "CITIZEN_UPDATE_REJECTED",
      entityType: "EditRequest",
      entityId: reqDoc._id,
      performedBy: reviewerUserId,
      reason: reqDoc.rejectionReason,
      before: {
        title: reqDoc.title,
        requestType: reqDoc.requestType,
        description: reqDoc.description,
        proposedChanges: reqDoc.proposedChanges,
      },
      after: null,
    });

    await notificationService.create({
      toUser: reqDoc.requestedBy._id || reqDoc.requestedBy,
      fromUser: reviewerUserId,
      title: "Yêu cầu chỉnh sửa bị từ chối",
      message: `Yêu cầu chỉnh sửa bị từ chối. Lý do: ${reqDoc.rejectionReason}`,
      type: "EDIT_REQUEST",
      entityType: "EditRequest",
      entityId: reqDoc._id,
      priority: "NORMAL",
    });

    return { request: reqDoc };
  },
  async getStats() {
    const total = await EditRequest.countDocuments();
    const pending = await EditRequest.countDocuments({ status: "PENDING" });
    const approved = await EditRequest.countDocuments({ status: "APPROVED" });
    const rejected = await EditRequest.countDocuments({ status: "REJECTED" });
    return { total, pending, approved, rejected };
  },
};
