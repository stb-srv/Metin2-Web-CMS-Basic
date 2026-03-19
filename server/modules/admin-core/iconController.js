const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const logger = require('../../utils/logger');

const ITEMS_DIR = path.join(__dirname, '..', '..', '..', 'public', 'images', 'items');
const SCRIPT_PATH = path.join(__dirname, '..', '..', 'scripts', 'convert_tga.py');

/**
 * GET /api/admin/icons/stats
 * Returns info about existing icons.
 */
async function getIconStats(req, res) {
    try {
        if (!fs.existsSync(ITEMS_DIR)) {
            return res.json({ success: true, count: 0 });
        }
        const files = fs.readdirSync(ITEMS_DIR).filter(f => /\.(png|jpg)$/i.test(f));
        res.json({ success: true, count: files.length });
    } catch (err) {
        logger.error('[IconController] getIconStats error:', err.message);
        res.status(500).json({ success: false, message: 'Fehler beim Lesen der Icons.' });
    }
}

/**
 * POST /api/admin/icons/convert
 * Accepts uploaded TGA files, runs conversion, returns results.
 * Files are uploaded via multer to a temp folder, then converted.
 */
async function convertIcons(req, res) {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Keine Dateien hochgeladen.' });
        }

        // req.files are saved by multer to a temp dir
        const tempDir = path.dirname(req.files[0].path);

        // Ensure output dir exists
        fs.mkdirSync(ITEMS_DIR, { recursive: true });

        // Run Python conversion script
        const result = await new Promise((resolve, reject) => {
            execFile('python', [SCRIPT_PATH, tempDir, ITEMS_DIR], { timeout: 120000 }, (err, stdout, stderr) => {
                if (err) {
                    logger.error('[IconController] Python error:', stderr || err.message);
                    return reject(new Error(stderr || err.message));
                }
                try {
                    resolve(JSON.parse(stdout));
                } catch (parseErr) {
                    logger.error('[IconController] JSON parse error:', stdout);
                    reject(new Error('Konvertierungsergebnis konnte nicht gelesen werden.'));
                }
            });
        });

        // Cleanup temp files (wait a bit to ensure handles are released)
        setTimeout(() => {
            try {
                for (const file of req.files) {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                }
                // Try to remove temp dir if empty
                if (fs.existsSync(tempDir)) {
                    const remaining = fs.readdirSync(tempDir);
                    if (remaining.length === 0) fs.rm(tempDir, { recursive: true, force: true }, () => { });
                }
            } catch (cleanErr) {
                logger.warn('[IconController] Cleanup warning:', cleanErr.message);
            }
        }, 500);

        // Rebuild icon map (trigger server.js rebuild)
        if (typeof global.rebuildIconMap === 'function') {
            global.rebuildIconMap();
        }

        res.json({
            success: true,
            message: `${result.converted?.length || 0} Icons verarbeitet.`,
            converted: result.converted || [],
            errors: result.errors || []
        });
    } catch (err) {
        logger.error('[IconController] convertIcons error:', err.message);
        res.status(500).json({ success: false, message: err.message || 'Konvertierung fehlgeschlagen.' });
    }
}

module.exports = { getIconStats, convertIcons };
