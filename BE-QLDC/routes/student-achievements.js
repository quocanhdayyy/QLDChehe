const express = require("express");
const { studentAchievementController } = require("../controllers");
const { authenticate, isLeader } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, isLeader, studentAchievementController.getAll);
router.get(
  "/:id",
  authenticate,
  isLeader,
  studentAchievementController.getById
);
router.post("/", authenticate, isLeader, studentAchievementController.create);
router.patch(
  "/:id",
  authenticate,
  isLeader,
  studentAchievementController.update
);
router.delete(
  "/:id",
  authenticate,
  isLeader,
  studentAchievementController.delete
);

module.exports = router;
