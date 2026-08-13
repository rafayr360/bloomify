// backend/src/routes/features.routes.js
const express = require('express');
const router = express.Router();
const featuresController = require('../controllers/features.controller');

router.get('/', featuresController.getAllFeatures);

module.exports = router;