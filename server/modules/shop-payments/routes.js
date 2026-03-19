const express = require('express');
const router = express.Router();
const controller = require('./controller');
const isAdmin = require('../../middleware/adminCheck');
const isAuth = require('../../middleware/auth'); 
const asyncHandler = require('../../utils/asyncHandler');

// USER: Submit payment & Personal history
router.post('/submit', isAuth, asyncHandler(controller.submitPayment));
router.get('/me', isAuth, asyncHandler(controller.getOwnPayments));

// ADMIN: All payments & Management
router.get('/admin/all', isAdmin, asyncHandler(controller.getAllPayments));
router.post('/admin/approve/:id', isAdmin, asyncHandler(controller.approvePayment));
router.post('/admin/decline/:id', isAdmin, asyncHandler(controller.declinePayment));

module.exports = router;
