const express = require('express');
const router = express.Router();
const controller = require('./controller');
const isAuth = require('../../middleware/auth');
const isAdmin = require('../../middleware/adminCheck');

const { safeboxLimiter } = require('../../config/rateLimiters');

router.get('/', isAuth, controller.getStash.bind(controller));
router.get('/trash', isAuth, controller.getTrash.bind(controller));
router.post('/claim/:id', isAuth, controller.claimItem.bind(controller));
router.delete('/:id', isAuth, controller.moveToTrash.bind(controller));
router.post('/restore/:id', isAuth, controller.restoreFromTrash.bind(controller));
router.delete('/permanent/:id', isAuth, controller.permanentDelete.bind(controller));
router.post('/bulk-delete', isAuth, controller.bulkMoveToTrash.bind(controller));
router.post('/bulk-permanent', isAuth, controller.bulkPermanentDelete.bind(controller));

// Admin Routes
router.post('/admin/gift', isAdmin, controller.adminGift.bind(controller));

// Storage Password
router.post('/change-password', isAuth, safeboxLimiter, controller.changeStoragePassword.bind(controller));

module.exports = router;
