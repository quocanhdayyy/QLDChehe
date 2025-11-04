const express = require("express");
const { rewardProposalController } = require("../controllers");
const { authenticate, isLeader, isCitizen } = require("../middleware/auth");

const router = express.Router();

// Stats route must come before /:id
router.get("/stats", authenticate, rewardProposalController.getStats);
router.get(
  "/my",
  authenticate,
  isCitizen,
  rewardProposalController.getMyProposals
);
router.get("/", authenticate, isLeader, rewardProposalController.getAll);
router.get("/:id", authenticate, rewardProposalController.getById);
router.post("/", authenticate, isCitizen, rewardProposalController.create);
router.patch("/:id", authenticate, isLeader, rewardProposalController.update);
router.delete("/:id", authenticate, isLeader, rewardProposalController.delete);

// Special actions
router.post(
  "/:id/approve",
  authenticate,
  isLeader,
  rewardProposalController.approve
);
router.post(
  "/:id/reject",
  authenticate,
  isLeader,
  rewardProposalController.reject
);

// Citizen can cancel their own pending proposal
router.post(
  "/:id/cancel",
  authenticate,
  rewardProposalController.cancel
);

module.exports = router;
