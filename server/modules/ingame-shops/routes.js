const express = require('express');
const router = express.Router();
const controller = require('./controller');
const isAdmin = require('../../middleware/adminCheck');
const isSuperAdmin = require('../../middleware/isSuperAdmin');

// ADMIN ROUTES ONLY (Since these manage core game databases)
router.get('/shops', isAdmin, controller.getShops.bind(controller));
router.post('/shops', isAdmin, controller.createShop.bind(controller));
router.delete('/shops/:vnum', isAdmin, controller.deleteShop.bind(controller));
router.put('/shops/:vnum/items', isAdmin, controller.updateShopItems.bind(controller));
router.get('/items/search', isAdmin, controller.searchItems.bind(controller));

// GM MANAGEMENT
router.get('/gmlist', isAdmin, controller.getGmList.bind(controller));
router.post('/gmlist', isAdmin, controller.saveGm.bind(controller));
router.delete('/gmlist/:id', isAdmin, controller.deleteGm.bind(controller));

// Compatibility check for frontend
router.get('/check-access', isSuperAdmin, (req, res) => {
    res.json({ success: true, isSuperAdmin: true });
});

module.exports = router;
