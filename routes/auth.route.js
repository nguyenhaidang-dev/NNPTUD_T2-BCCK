const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../utils/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware.protect, authController.getMe);
router.post('/logout', authMiddleware.protect, authController.logout);
router.put('/change-password', authMiddleware.protect, authController.changePassword);

module.exports = router;
