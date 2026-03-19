const express = require('express');
const router = express.Router();
const controller = require('./controller');
const isAdmin = require('../../middleware/adminCheck');

router.get('/search', isAdmin, controller.searchPlayer.bind(controller));
router.get('/bans/history', isAdmin, controller.getHistory.bind(controller));
router.post('/bans/account', isAdmin, controller.ban.bind(controller));
router.post('/bans/unban', isAdmin, controller.unban.bind(controller));

module.exports = router;
