const express = require('express');
const { notificationController } = require('../controllers');
const { authenticate, isLeader } = require('../middleware/auth');

const router = express.Router();

// Restrict listing to own notifications for ALL users
router.get('/', authenticate, (req, res, next) => {
  // Mỗi user chỉ nhận thông báo gửi cho chính họ
  if (req.user) {
    req.query.toUser = req.user._id; // enforce filter for ALL roles
  }
  return notificationController.getAll(req, res, next);
});

router.get('/:id', authenticate, notificationController.getById);

// Only leader can create/update/delete notifications manually
router.post('/', authenticate, isLeader, notificationController.create);
router.patch('/:id', authenticate, isLeader, notificationController.update);
router.delete('/:id', authenticate, isLeader, notificationController.delete);

router.post('/:id/read', authenticate, notificationController.markAsRead);

module.exports = router;

