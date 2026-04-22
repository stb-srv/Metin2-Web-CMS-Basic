const express = require('express');
const router = express.Router();
const controller = require('./controller');

// Import Middlewares
const authUser = require('../../middleware/auth');
const isAdmin = require('../../middleware/adminCheck');

// PUBLIC ROUTES (Requires User Login)
// Usually Votes should be for logged in users to credit coins
router.get('/public', authUser, controller.getPublicLinks.bind(controller));
router.post('/public/vote', authUser, controller.processVote.bind(controller));

// ADMIN ROUTES (Requires Admin Permission)
router.get('/admin', isAdmin, (req, res, next) => {
    // Check specific permission
    if (req.adminPermissions && req.adminPermissions.can_manage_votes) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Zugriff verweigert. Dir fehlt das Recht "Votes verwalten".' });
    }
}, controller.getAllLinks.bind(controller));

router.post('/admin', isAdmin, (req, res, next) => {
    if (req.adminPermissions && req.adminPermissions.can_manage_votes) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Zugriff verweigert.' });
    }
}, controller.createLink.bind(controller));

router.put('/admin/:id', isAdmin, (req, res, next) => {
    if (req.adminPermissions && req.adminPermissions.can_manage_votes) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Zugriff verweigert.' });
    }
}, controller.updateLink.bind(controller));

router.delete('/admin/:id', isAdmin, (req, res, next) => {
    if (req.adminPermissions && req.adminPermissions.can_manage_votes) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Zugriff verweigert.' });
    }
}, controller.deleteLink.bind(controller));

module.exports = router;
