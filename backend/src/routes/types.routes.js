// backend/src/routes/types.routes.js
const express = require('express');
const router = express.Router();
const typesController = require('../controllers/types.controller');

router.get('/', typesController.getAllTypes);

module.exports = router;