const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { protect, authorize } = require('../utils/auth.middleware');

router.get('/', settingController.getSettings); // Public or private depending on your need, maybe some UI configs need to be public

router.use(protect);
router.use(authorize('Admin'));
router.post('/bulk-update', settingController.updateSettings);

module.exports = router;
