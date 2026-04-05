// Example: How to use authentication middleware in routes

const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth.middleware');

// Example protected route - requires authentication
router.get('/protected-route', authMiddleware.protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This is a protected route',
    userId: req.user.id,
  });
});

// Example admin-only route
router.get('/admin-only', authMiddleware.protect, authMiddleware.admin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This route is accessible only to Admin and Manager roles',
  });
});

// Example pharmacist-only route
router.get('/pharmacist-only', authMiddleware.protect, authMiddleware.pharmacist, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This route is accessible only to Admin and Pharmacist roles',
  });
});

// Example authorize specific roles
router.get('/specific-roles', authMiddleware.protect, authMiddleware.authorize('Admin', 'Pharmacist'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This route is accessible only to Admin or Pharmacist roles',
  });
});

module.exports = router;

// Usage in server.js:
// app.use('/api/example', require('./routes/example.route'));

// Frontend/API Client Usage:
// 1. Register: POST /api/auth/register
//    Body: { firstName, lastName, email, phone, password, passwordConfirm }
//
// 2. Login: POST /api/auth/login
//    Body: { email, password }
//    Response: { success, token, user }
//
// 3. Get Current User: GET /api/auth/me
//    Headers: Authorization: Bearer <token>
//
// 4. Change Password: PUT /api/auth/change-password
//    Headers: Authorization: Bearer <token>
//    Body: { currentPassword, newPassword, newPasswordConfirm }
//
// 5. Logout: POST /api/auth/logout
//    Headers: Authorization: Bearer <token>
//
// Protected Route Request:
//    Headers: Authorization: Bearer <token>
