const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const authMiddleware = require('../utils/auth.middleware');
const { uploadImage } = require('../utils/upload');

// Public/Protected routes
// Create prescription with image
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.pharmacist,
  uploadImage,
  prescriptionController.createPrescription
);

// Get user's prescriptions
router.get('/my-prescriptions', authMiddleware.protect, prescriptionController.getMyPrescriptions);

// Get single prescription
router.get('/:id', authMiddleware.protect, prescriptionController.getPrescriptionById);

// Check prescription validity
router.get('/:id/validity', authMiddleware.protect, prescriptionController.checkPrescriptionValidity);

// Add items to prescription
router.post(
  '/:id/items',
  authMiddleware.protect,
  authMiddleware.pharmacist,
  prescriptionController.addPrescriptionItems
);

// Update prescription status
router.put(
  '/:id/status',
  authMiddleware.protect,
  authMiddleware.pharmacist,
  prescriptionController.updatePrescriptionStatus
);

// Update prescription item
router.put(
  '/items/:itemId',
  authMiddleware.protect,
  authMiddleware.pharmacist,
  prescriptionController.updatePrescriptionItem
);

// Delete prescription
router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.pharmacist,
  prescriptionController.deletePrescription
);

// Admin/Pharmacist routes
// Get all prescriptions
router.get(
  '/admin/all',
  authMiddleware.protect,
  authMiddleware.pharmacist,
  prescriptionController.getAllPrescriptions
);

// Get pending prescriptions
router.get(
  '/pending/list',
  authMiddleware.protect,
  authMiddleware.pharmacist,
  prescriptionController.getPendingPrescriptions
);

module.exports = router;
