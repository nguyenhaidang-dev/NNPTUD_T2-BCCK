const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../utils/auth.middleware');

// Protected routes
// Create order
router.post('/', authMiddleware.protect, orderController.createOrder);

// Get user's orders
router.get('/my-orders', authMiddleware.protect, orderController.getMyOrders);

// Get single order
router.get('/:id', authMiddleware.protect, orderController.getOrderById);

// Cancel order
router.put('/:id/cancel', authMiddleware.protect, orderController.cancelOrder);

// Admin routes
// Get all orders
router.get(
  '/admin/all',
  authMiddleware.protect,
  authMiddleware.admin,
  orderController.getAllOrders
);

// Update order status
router.put(
  '/:id/status',
  authMiddleware.protect,
  authMiddleware.admin,
  orderController.updateOrderStatus
);

// Update payment status
router.put(
  '/:id/payment',
  authMiddleware.protect,
  authMiddleware.admin,
  orderController.updatePaymentStatus
);

// Get order statistics
router.get(
  '/stats/summary',
  authMiddleware.protect,
  authMiddleware.admin,
  orderController.getOrderStats
);

module.exports = router;
