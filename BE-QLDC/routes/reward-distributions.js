const express = require("express");
const { rewardDistributionController } = require("../controllers");
const { authenticate, isLeader } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, isLeader, rewardDistributionController.getAll);
router.get(
  "/:id",
  authenticate,
  isLeader,
  rewardDistributionController.getById
);
router.post("/", authenticate, isLeader, rewardDistributionController.create);
router.post(
  "/bulk",
  authenticate,
  isLeader,
  rewardDistributionController.bulkCreate
);
router.patch(
  "/:id",
  authenticate,
  isLeader,
  rewardDistributionController.update
);
router.delete(
  "/:id",
  authenticate,
  isLeader,
  rewardDistributionController.delete
);

router.get(
  "/summary/event/:eventId",
  authenticate,
  isLeader,
  rewardDistributionController.summarizeByEvent
);

module.exports = router;
