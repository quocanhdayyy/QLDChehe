const express = require("express");
const { authenticate, isLeader, isCitizen } = require("../middleware/auth");
const { giftEventController } = require("../controllers");

const router = express.Router();

// Admin (leader) routes
router.post("/", authenticate, isLeader, giftEventController.create);
router.get("/", authenticate, giftEventController.getAll);
router.get("/:id", authenticate, giftEventController.getById);
router.patch("/:id", authenticate, isLeader, giftEventController.update);
router.delete("/:id", authenticate, isLeader, giftEventController.delete);
router.post("/:id/close", authenticate, isLeader, giftEventController.close);
router.post("/:id/open", authenticate, isLeader, giftEventController.open);

// Registrations
router.post("/:id/register", authenticate, isCitizen, giftEventController.register);
router.get("/:id/registrations", authenticate, isLeader, giftEventController.getRegistrations);
router.get("/registrations/mine", authenticate, isCitizen, giftEventController.getMyRegistrations);
router.get("/:id/registrations/export", authenticate, isLeader, giftEventController.exportRegistrationsCsv);
router.post("/registrations/scan", authenticate, isLeader, giftEventController.markReceivedByQr);

module.exports = router;
