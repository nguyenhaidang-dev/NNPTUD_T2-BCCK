const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../utils/auth.middleware');

router.use(protect);
router.use(authorize('Admin', 'Manager'));

router.get('/export/excel', reportController.exportOrdersExcel);

module.exports = router;
