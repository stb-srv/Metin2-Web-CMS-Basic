const express = require('express');
const router = express.Router();
const controller = require('./controller');
const isAuth = require('../../middleware/auth');
const isAdmin = require('../../middleware/adminCheck');
const asyncHandler = require('../../utils/asyncHandler');

// PUBLIC WEB-SHOP ROUTES
router.get('/items', asyncHandler(controller.getItems));
router.get('/categories', asyncHandler(controller.getCategories));

// PLAYER ACTIONS
router.post('/buy', isAuth, asyncHandler(controller.buyItem));

// ADMIN WEB-SHOP MANAGEMENT
router.get('/admin/items', isAdmin, asyncHandler(controller.getAdminItems));
router.post('/admin/items', isAdmin, asyncHandler(controller.saveItem));
router.put('/admin/items/:id', isAdmin, asyncHandler(controller.saveItem));
router.delete('/admin/items/:id', isAdmin, asyncHandler(controller.deleteItem));

// ADMIN CATEGORY MANAGEMENT
router.post('/admin/categories', isAdmin, asyncHandler(controller.saveCategory));
router.delete('/admin/categories/:id', isAdmin, asyncHandler(controller.deleteCategory));

// ADMIN CURRENCY MANAGEMENT
router.get('/admin/accounts', isAdmin, asyncHandler(controller.getAccounts));
router.post('/admin/give-dr', isAdmin, asyncHandler(controller.giveDr));
router.post('/admin/give-dm', isAdmin, asyncHandler(controller.giveDm));

// ADMIN CREATOR HISTORY
router.get('/admin/creator-history', isAdmin, asyncHandler(controller.getCreatorHistory));
router.post('/admin/creator-history', isAdmin, asyncHandler(controller.addCreatorHistory));
router.delete('/admin/creator-history/:id', isAdmin, asyncHandler(controller.deleteCreatorHistory));

module.exports = router;
