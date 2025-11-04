const express = require('express');
const { auditLogController } = require('../controllers');
const { authenticate, isLeader } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, isLeader, auditLogController.getAll);
router.get('/:id', authenticate, isLeader, auditLogController.getById);

module.exports = router;

