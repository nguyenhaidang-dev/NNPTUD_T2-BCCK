const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketing.controller');
const authMiddleware = require('../utils/auth.middleware');

// Public routes
router.get('/banners', marketingController.getBanners);

// Protected (Customer & Admin)
router.post('/promotions/validate', authMiddleware.protect, marketingController.validatePromotion);

// Admin / Manager routes
router.post('/banners', authMiddleware.protect, authMiddleware.authorize('Admin', 'Manager'), marketingController.createBanner);
router.put('/banners/:id', authMiddleware.protect, authMiddleware.authorize('Admin', 'Manager'), marketingController.updateBanner);
router.delete('/banners/:id', authMiddleware.protect, authMiddleware.authorize('Admin', 'Manager'), marketingController.deleteBanner);

router.get('/promotions', authMiddleware.protect, authMiddleware.authorize('Admin', 'Manager'), marketingController.getPromotions);
router.post('/promotions', authMiddleware.protect, authMiddleware.authorize('Admin', 'Manager'), marketingController.createPromotion);
router.put('/promotions/:id', authMiddleware.protect, authMiddleware.authorize('Admin', 'Manager'), marketingController.updatePromotion);
router.delete('/promotions/:id', authMiddleware.protect, authMiddleware.authorize('Admin', 'Manager'), marketingController.deletePromotion);

module.exports = router;
