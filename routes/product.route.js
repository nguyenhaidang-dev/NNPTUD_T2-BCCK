const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../utils/auth.middleware');
const { uploadImage } = require('../utils/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search/:query', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/prescription/required', productController.getPrescriptionRequiredProducts);
router.get('/:id', productController.getProductById);

// Protected routes (Customer can review)
router.post('/:id/reviews', authMiddleware.protect, productController.createProductReview);

// Protected routes (Admin/Manager only)
router.post('/', authMiddleware.protect, authMiddleware.admin, uploadImage, productController.createProduct);
router.put('/:id', authMiddleware.protect, authMiddleware.admin, uploadImage, productController.updateProduct);
router.delete('/:id', authMiddleware.protect, authMiddleware.admin, productController.deleteProduct);

module.exports = router;
