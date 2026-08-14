const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommend.controller');

router.post('/', recommendController.getRecommendations);

module.exports = router;