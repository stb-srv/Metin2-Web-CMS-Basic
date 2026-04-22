const express = require('express');
const router = express.Router();
const controller = require('./controller');
const asyncHandler = require('../../utils/asyncHandler');

// Autologin route
router.get('/', asyncHandler(controller.autologin));

// API for items (compatible with simpler frontend)
router.get('/api/items', asyncHandler(controller.getItems));

// Simplified buy route (form-friendly)
router.post('/buy', require('../../middleware/auth'), asyncHandler(controller.buyItem));

module.exports = router;
