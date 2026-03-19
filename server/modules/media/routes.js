const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const isAdmin = require('../../middleware/adminCheck');

const MEDIA_DIR = path.join(__dirname, '../../../public/uploads/media');
fs.mkdirSync(MEDIA_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, MEDIA_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .toLowerCase();
        cb(null, `${base}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        
        const ext = path.extname(file.originalname).toLowerCase();
        const mime = file.mimetype;

        if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mime)) {
            cb(null, true);
        } else {
            cb(new Error('Nur Bilder sind erlaubt (jpg, png, gif, webp, svg).'));
        }
    }
});

// List all media files
router.get('/', isAdmin, (req, res) => {
    try {
        const files = fs.readdirSync(MEDIA_DIR)
            .filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
            .map(filename => {
                const stat = fs.statSync(path.join(MEDIA_DIR, filename));
                return {
                    filename,
                    url: `/uploads/media/${filename}`,
                    size: stat.size,
                    created: stat.birthtimeMs || stat.ctimeMs
                };
            })
            .sort((a, b) => b.created - a.created);

        res.json({ success: true, files });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fehler beim Laden der Medienbibliothek.' });
    }
});

// Upload one or multiple files
router.post('/upload', isAdmin, upload.array('files', 20), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Keine Dateien hochgeladen.' });
    }

    const uploaded = req.files.map(f => ({
        filename: f.filename,
        url: `/uploads/media/${f.filename}`,
        size: f.size
    }));

    res.json({ success: true, message: `${uploaded.length} Datei(en) hochgeladen.`, files: uploaded });
});

// Delete a file
router.delete('/:filename', isAdmin, (req, res) => {
    try {
        const filename = path.basename(req.params.filename); // prevent path traversal
        const filepath = path.join(MEDIA_DIR, filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ success: false, message: 'Datei nicht gefunden.' });
        }

        fs.unlinkSync(filepath);
        res.json({ success: true, message: 'Datei gelöscht.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fehler beim Löschen.' });
    }
});

module.exports = router;
