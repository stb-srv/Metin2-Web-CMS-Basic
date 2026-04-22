const path = require('path');
const fs = require('fs');
const db = require('../config/database');

let cachedTheme = 'classic';
let lastFetch = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

async function refreshThemeCache() {
    try {
        const { s } = db;
        const [rows] = await db.query(
            `SELECT setting_value FROM ${s('website')}.site_settings WHERE setting_key = 'active_theme' LIMIT 1`
        );
        if (rows.length > 0) {
            cachedTheme = rows[0].setting_value || 'classic';
        }
    } catch (e) {
        // Fallback to classic on DB error
        console.error('[ThemeMiddleware] Error refreshing theme cache:', e);
    }
    lastFetch = Date.now();
}

async function themeMiddleware(req, res, next) {
    if (Date.now() - lastFetch > CACHE_TTL) {
        await refreshThemeCache();
    }
    req.activeTheme = cachedTheme;
    next();
}

function serveThemedFile(filename) {
    return async (req, res) => {
        if (Date.now() - lastFetch > CACHE_TTL) {
            await refreshThemeCache();
        }

        const themedPath = path.join(__dirname, '../../public/themes', cachedTheme, filename);
        const classicPath = path.join(__dirname, '../../public', filename);

        if (cachedTheme !== 'classic' && fs.existsSync(themedPath)) {
            return res.sendFile(themedPath);
        }
        return res.sendFile(classicPath);
    };
}

module.exports = { themeMiddleware, serveThemedFile, refreshThemeCache };
