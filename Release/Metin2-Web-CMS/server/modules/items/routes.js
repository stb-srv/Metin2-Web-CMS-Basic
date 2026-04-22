/**
 * Items Module — Central item_proto search
 * Provides a reusable API for searching items by name or VNUM.
 * Mount: /api/items
 */
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const isAdmin = require('../../middleware/adminCheck');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * GET /api/items/search?q=<query>&limit=<n>
 * Searches player.item_proto by locale_name (LIKE) or exact vnum.
 */
router.get('/search', isAdmin, asyncHandler(controller.search.bind(controller)));

module.exports = router;
