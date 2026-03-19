const express = require('express');
const router = express.Router();
const controller = require('./controller');
const isAdmin = require('../../middleware/adminCheck');

// Public: Get translations
router.get('/:lang', controller.getTranslations);
router.get('/list/all', controller.getLanguages);

// Admin: Save translations
router.post('/:lang', isAdmin, controller.saveTranslations);

module.exports = router;
