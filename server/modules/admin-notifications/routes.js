const express = require('express');
const router = express.Router();
const controller = require('./controller');
const isAdmin = require('../../middleware/adminCheck');

router.get('/stream', isAdmin, controller.streamNotifications);

module.exports = router;
