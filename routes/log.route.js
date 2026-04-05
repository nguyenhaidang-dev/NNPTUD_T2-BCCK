const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const { protect, authorize } = require('../utils/auth.middleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/', logController.getLogs);

module.exports = router;
