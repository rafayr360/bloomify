const express = require('express');
const router = express.Router();
const plantsController = require('../controllers/plants.controller');

router.get('/', plantsController.getAllPlants);
router.get('/:slug', plantsController.getPlantBySlug);

module.exports = router;