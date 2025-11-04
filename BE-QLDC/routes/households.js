const express = require('express');
const { householdController } = require('../controllers');
const { authenticate, isLeader } = require('../middleware/auth');

const router = express.Router();

// Stats route must come before /:id
router.get('/stats', authenticate, householdController.getStats);
router.get('/', authenticate, householdController.getAll);
router.get('/:id', authenticate, householdController.getById);
router.post('/', authenticate, isLeader, householdController.create);
router.patch('/:id', authenticate, isLeader, householdController.update);
router.delete('/:id', authenticate, isLeader, householdController.delete);

module.exports = router;

