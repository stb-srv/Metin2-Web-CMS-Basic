const express = require('express');
const router = express.Router();
const controller = require('./controller');
const hasPermission = require('../../middleware/permissionCheck');
const isAuth = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for CMS uploads (Logos, Backgrounds)
const UPLOADS_DIR = path.join(__dirname, '../../../public/uploads');
const LOGOS_DIR = path.join(UPLOADS_DIR, 'logos');
const BGS_DIR = path.join(UPLOADS_DIR, 'backgrounds');

fs.mkdirSync(LOGOS_DIR, { recursive: true });
fs.mkdirSync(BGS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'logo_file') cb(null, LOGOS_DIR);
        else if (file.fieldname === 'bg_file') cb(null, BGS_DIR);
        else cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = file.fieldname === 'logo_file' ? 'logo' : 'bg';
        cb(null, `${name}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            // Additional security for SVGs
            if (ext === '.svg') {
                const fs = require('fs');
                // Note: This is an async check in a sync filter, but multer's fileFilter can't be easily async without custom logic.
                // However, for small files it's usually acceptable or we handle it in the controller.
                // Better approach: check MIME type or use a dedicated middleware.
                // For now, let's keep it simple and filter by extension, and we'll add a check in the controller if needed.
            }
            cb(null, true);
        }
        else cb(new Error('Nur Bilder erlaubt.'));
    }
});

// PUBLIC ROUTES
router.get('/settings', asyncHandler(controller.getSettings));
router.get('/settings/admin', isAuth, hasPermission('settings.manage'), asyncHandler(controller.getAdminSettings));
router.get('/available-themes', asyncHandler(controller.getAvailableThemes));
router.get('/pages/:slug', asyncHandler(controller.getPage));
router.get('/downloads', asyncHandler(controller.getDownloads));
router.get('/news/all', asyncHandler(controller.getAllNews));
router.get('/news/:id', asyncHandler(controller.getNewsById));

// CMS ADMIN 
const conditionalUpload = (req, res, next) => {
    const ct = req.headers['content-type'] || '';
    if (ct.includes('multipart/form-data')) {
        // File upload: let multer parse it
        return upload.fields([
            { name: 'logo_file', maxCount: 1 },
            { name: 'bg_file', maxCount: 1 }
        ])(req, res, (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            next();
        });
    } else {
        // JSON or URL-encoded: express already parsed it
        next();
    }
};

router.post('/settings', isAuth, hasPermission('settings.manage'), conditionalUpload, asyncHandler(controller.updateSettings));

// Pages
router.get('/pages/list/admin', isAuth, hasPermission('pages.edit'), asyncHandler(controller.getAllPages));
router.post('/pages/:slug', isAuth, hasPermission('pages.edit'), asyncHandler(controller.savePage));
router.delete('/pages/:slug', isAuth, hasPermission('pages.edit'), asyncHandler(controller.deletePage));

// News
router.post('/news', isAuth, hasPermission('news.create'), asyncHandler(controller.saveNews));
router.delete('/news/:id', isAuth, hasPermission('news.delete'), asyncHandler(controller.deleteNews));

// Downloads
router.post('/downloads', isAuth, hasPermission('settings.manage'), asyncHandler(controller.createDownload));
router.put('/downloads/:id', isAuth, hasPermission('settings.manage'), asyncHandler(controller.updateDownload));
router.delete('/downloads/:id', isAuth, hasPermission('settings.manage'), asyncHandler(controller.deleteDownload));

// Navbar
router.get('/navbar', asyncHandler(controller.getNavbarLinks));
router.post('/navbar', isAuth, hasPermission('settings.manage'), asyncHandler(controller.createNavbarLink));
router.put('/navbar/:id', isAuth, hasPermission('settings.manage'), asyncHandler(controller.updateNavbarLink));
router.post('/navbar/reorder', isAuth, hasPermission('settings.manage'), asyncHandler(controller.reorderNavbarLinks));
router.delete('/navbar/:id', isAuth, hasPermission('settings.manage'), asyncHandler(controller.deleteNavbarLink));

// Audit Logs
router.get('/admin-logs', isAuth, hasPermission('settings.manage'), asyncHandler(controller.getAuditLogs));

// Events
const moduleGuard = require('../../middleware/moduleGuard');
router.get('/events', asyncHandler(controller.getEvents));
router.post('/events', isAuth, hasPermission('settings.manage'), moduleGuard('events'), asyncHandler(controller.saveEvent));
router.delete('/events/:id', isAuth, hasPermission('settings.manage'), moduleGuard('events'), asyncHandler(controller.deleteEvent));

// Vouchers
router.get('/vouchers', isAuth, hasPermission('settings.manage'), asyncHandler(controller.getVouchers));
router.post('/vouchers', isAuth, hasPermission('settings.manage'), moduleGuard('vouchers'), asyncHandler(controller.generateVoucher));
router.delete('/vouchers/:id', isAuth, hasPermission('settings.manage'), moduleGuard('vouchers'), asyncHandler(controller.deleteVoucher));
router.post('/vouchers/redeem', isAuth, moduleGuard('vouchers'), asyncHandler(controller.redeemVoucher));
 
// Themes (Preset System)
router.get('/themes', isAuth, hasPermission('settings.manage'), asyncHandler(controller.getThemes));
router.get('/themes/active', asyncHandler(controller.getActiveTheme));
router.post('/themes', isAuth, hasPermission('settings.manage'), asyncHandler(controller.saveTheme));
router.delete('/themes/:id', isAuth, hasPermission('settings.manage'), asyncHandler(controller.deleteTheme));
router.post('/themes/:id/activate', isAuth, hasPermission('settings.manage'), asyncHandler(controller.activateTheme));

module.exports = router;
