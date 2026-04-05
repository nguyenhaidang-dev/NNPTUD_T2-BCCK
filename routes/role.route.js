const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { protect, authorize } = require('../utils/auth.middleware');

router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(roleController.getRoles)
  .post(roleController.createRole);

router.route('/:id')
  .put(roleController.updateRole)
  .delete(roleController.deleteRole);

module.exports = router;
