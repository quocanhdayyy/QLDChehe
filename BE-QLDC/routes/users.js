const express = require('express');
const { userController } = require('../controllers');
const { authenticate, isLeader } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, isLeader, userController.getAll);
router.get('/:id', authenticate, userController.getById);
router.post('/', authenticate, isLeader, userController.create);
router.patch('/:id', authenticate, isLeader, userController.update);
router.delete('/:id', authenticate, isLeader, userController.delete);

module.exports = router;

