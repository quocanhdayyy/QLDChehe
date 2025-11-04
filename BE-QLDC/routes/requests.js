const express = require("express");
const { editRequestController } = require("../controllers");
const { authenticate, isLeader, isCitizen } = require("../middleware/auth");

const router = express.Router();

// Citizen endpoints (must come before /:id)
router.get("/me", authenticate, editRequestController.getMyRequests);

// Stats route must come before /:id
router.get("/stats", authenticate, editRequestController.getStats);
router.get("/", authenticate, isLeader, editRequestController.getAll);
router.get("/:id", authenticate, editRequestController.getById);
// Allow both citizen and leader to create requests
router.post("/", authenticate, editRequestController.create);
router.patch("/:id", authenticate, isLeader, editRequestController.update);
router.delete("/:id", authenticate, isLeader, editRequestController.delete);

// Special actions
router.post(
  "/:id/approve",
  authenticate,
  isLeader,
  editRequestController.approve
);
router.post(
  "/:id/reject",
  authenticate,
  isLeader,
  editRequestController.reject
);

// Citizen can cancel their own pending request
router.post("/:id/cancel", authenticate, editRequestController.cancel);

module.exports = router;
