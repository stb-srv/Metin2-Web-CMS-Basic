const express = require('express');
const router = express.Router();
const controller = require('./controller');
const isAdmin = require('../../middleware/adminCheck');
const asyncHandler = require('../../utils/asyncHandler');

// PUBLIC
router.get('/public', asyncHandler(controller.getPublicData));

// ADMIN
router.get('/admin/packages', isAdmin, asyncHandler(controller.getAllPackages));
router.post('/admin/packages', isAdmin, asyncHandler(controller.createPackage));
router.put('/admin/packages/:id', isAdmin, asyncHandler(controller.updatePackage));
router.delete('/admin/packages/:id', isAdmin, asyncHandler(controller.deletePackage));
router.post('/admin/bonus', isAdmin, asyncHandler(controller.updateBonus));
router.post('/admin/settings', isAdmin, asyncHandler(controller.updateSetting));

module.exports = router;
