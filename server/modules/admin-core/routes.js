const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controller = require('./controller');
const iconController = require('./iconController');
const isAdmin = require('../../middleware/adminCheck');
const isSuperAdmin = require('../../middleware/isSuperAdmin');
const asyncHandler = require('../../utils/asyncHandler');

// Multer config for TGA uploads (temp directory)
const tgaUploadDir = path.join(__dirname, '..', '..', '..', 'uploads', 'tga-temp');
fs.mkdirSync(tgaUploadDir, { recursive: true });

const tgaStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create unique folder per upload batch (only once per request)
        if (!req._tgaBatchDir) {
            const batchId = `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const batchDir = path.join(tgaUploadDir, batchId);
            fs.mkdirSync(batchDir, { recursive: true });
            req._tgaBatchDir = batchDir;
        }
        cb(null, req._tgaBatchDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const tgaUpload = multer({
    storage: tgaStorage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.tga' || ext === '.png') {
            cb(null, true);
        } else {
            cb(new Error('Nur .tga und .png Dateien sind erlaubt.'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

// ADMIN CORE MANAGEMENT
router.get('/permissions', isAdmin, asyncHandler(controller.getPermissions));
router.post('/role-permissions', isSuperAdmin, asyncHandler(controller.saveRolePermissions));
router.post('/account-role', isSuperAdmin, asyncHandler(controller.assignAccountRole));

// Compatibility check for frontend
router.get('/check', isAdmin, (req, res) => {
    res.json({ success: true, isAdmin: true, role: req.adminRole, permissions: req.adminPermissions });
});

// ICON MANAGEMENT
router.get('/icons/stats', isAdmin, iconController.getIconStats);
router.post('/icons/convert', isAdmin, tgaUpload.array('tga_files', 500), iconController.convertIcons);

// ACTIVITY
router.get('/activity', isAdmin, asyncHandler(controller.getActivity));
router.get('/stats', isAdmin, asyncHandler(controller.getDashboardStats));

module.exports = router;
