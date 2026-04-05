const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../utils/auth.middleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/', userController.getUsers);
router.post('/force-reset-password', userController.forceResetPassword);
router.put('/:id/role', userController.changeUserRole);

module.exports = router;
