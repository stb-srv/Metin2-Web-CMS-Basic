const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/players', controller.getPlayers.bind(controller));
router.get('/guilds', controller.getGuilds.bind(controller));

module.exports = router;
