const express = require('express');
const router = express.Router();
const manufacturerController = require('../controllers/manufacturer.controller');

router.get('/', manufacturerController.getAllManufacturers);

module.exports = router;
