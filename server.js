require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const setup = require('./server/config/setup');
const { initDb } = setup;
const logger = require('./server/utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Check: JWT Secret
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret') {
    if (process.env.NODE_ENV === 'production') {
        logger.error('FATAL: JWT_SECRET is not set or uses default value. Exiting for security.');
        process.exit(1);
    } else {
        logger.warn('⚠️  JWT_SECRET is either not set or using the default "secret". This is unsafe for production!');
    }
}

// Trust proxy for reverse proxies (e.g. Nginx, Cloudflare) - Required for express-rate-limit
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"],
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://kit.fontawesome.com"],
            "font-src": ["'self'", "data:", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com", "https://ka-f.fontawesome.com"],
            "img-src": ["'self'", "data:", "https://flagcdn.com", "https://*.googleapis.com"],
            "connect-src": ["'self'"],
            "frame-src": ["'none'"],
            "object-src": ["'none'"],
            "upgrade-insecure-requests": process.env.NODE_ENV === 'production' ? [] : null
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
    origin: allowedOrigin === '*' ? '*' : allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-account-id']
}));

// Rate Limiters
const { apiLimiter } = require('./server/config/rateLimiters');
app.use('/api', apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Setup Guard ---
const setupGuard = (req, res, next) => {
    if (typeof setup.isSetupNeeded === 'function' && setup.isSetupNeeded()) {
        const exemptPaths = ['/api/setup', '/setup.html', '/css', '/js', '/images', '/favicon.ico', '/uploads', '/metin2_maintenance_bg'];
        if (exemptPaths.some(p => req.path.startsWith(p) || req.path === p)) {
            return next();
        }
        if (req.method === 'GET' && !req.path.startsWith('/api/')) {
            return res.redirect('/setup.html');
        }
        if (req.path.startsWith('/api/')) {
            return res.status(503).json({ success: false, message: 'Installation erforderlich / Setup required' });
        }
    }
    next();
};
app.use(setupGuard);

// --- Database Health Guard ---
const db = require('./server/config/database');
let lastDbCheck = 0;
let dbIsOnline = true;

const dbGuard = async (req, res, next) => {
    // Bypass DB check if setup is needed
    if (typeof setup.isSetupNeeded === 'function' && setup.isSetupNeeded()) return next();

    // Exempt static assets and the error page itself
    const exemptPaths = ['/api/setup', '/db-error.html', '/css', '/js', '/images', '/favicon.ico', '/uploads', '/metin2_maintenance_bg'];
    if (exemptPaths.some(p => req.path.startsWith(p) || req.path === p)) return next();

    // Cache health check for 30 seconds
    const now = Date.now();
    if (now - lastDbCheck > 30000) {
        const health = await db.checkConnection();
        dbIsOnline = health.online;
        lastDbCheck = now;
        if (!dbIsOnline) console.error('[DBGuard] Database is OFFLINE:', health.error);
    }

    if (!dbIsOnline) {
        // If it's an API request, return JSON
        if (req.path.startsWith('/api/')) {
            return res.status(503).json({ success: false, message: 'Datenbankverbindung fehlgeschlagen. Seite im Wartungsmodus.' });
        }
        // Otherwise redirect to beautiful error page
        return res.redirect('/db-error.html');
    }
    next();
};
app.use(dbGuard);

// --- Maintenance Mode Middleware ---
const cmsRepo = require('./server/modules/cms/repository');
const jwt = require('jsonwebtoken');

const maintenanceGuard = async (req, res, next) => {
    // Bypass maintenance check if setup is needed
    if (typeof setup.isSetupNeeded === 'function' && setup.isSetupNeeded()) return next();

    // 1. Exempt static assets and necessary pages
    const exemptPaths = ['/api', '/admin', '/setup', '/maintenance.html', '/css', '/js', '/images', '/favicon.ico', '/uploads', '/metin2_maintenance_bg'];
    if (exemptPaths.some(p => req.path.startsWith(p) || req.path === p)) return next();

    try {
        const { s } = db;
        const settings = await cmsRepo.getSettings();
        if (settings.module_maintenance === 'true') {
            const token = req.cookies?.m2token || req.headers.authorization?.split(' ')[1];
            
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
                    
                    // Multifactor GM Recognition (Senior Developer Quality)
                    // 1. Check for standard GM ranks. Admins can extend this list via .env
                    const gmRanks = (process.env.GM_RANKS || 'IMPLEMENTOR,HIGH_WIZARD,GOD').split(',');
                    // 2. Query common.gmlist or similar (using s helper)
                    const [gms] = await db.query(`SELECT mAuthority FROM ${s('common')}.gmlist WHERE mAccount = ?`, [decoded.username]);
                    
                    if (gms.length > 0) {
                        const authority = gms[0].mAuthority;
                        // Recognition by Rank
                        if (gmRanks.includes(authority)) {
                            return next();
                        }
                    }
                } catch (e) {}
            }
            
            // 3. Prevent redirect loop if already on maintenance.html (redundant but safe)
            if (req.path === '/maintenance.html') return next();
            
            return res.redirect('/maintenance.html');
        }
    } catch (e) {
        console.error('[MaintenanceGuard] Error:', e);
    }
    next();
};

app.use(maintenanceGuard);

// Serve static files (Frontend)
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// --- Icon Lookup Map ---
const iconDir = path.join(__dirname, 'public', 'images', 'items');
let iconMap = {};
function buildIconMap() {
    try {
        if (!fs.existsSync(iconDir)) return;
        const files = fs.readdirSync(iconDir);
        iconMap = {};
        for (const file of files) {
            const match = file.match(/^(\d+)\.(png|jpg)$/i);
            if (match) { iconMap[parseInt(match[1], 10)] = file; }
        }
        logger.info(`[IconMap] Loaded ${Object.keys(iconMap).length} icon mappings.`);
    } catch (e) {
        logger.error('[IconMap] Error building map:', e.message);
    }
}
buildIconMap();
global.rebuildIconMap = buildIconMap;
app.get('/api/icons/map', (req, res) => res.json(iconMap));

// --- Dynamic Module System (Senior Developer CMS Architecture) ---
const moduleManager = require('./server/utils/moduleManager');

async function startServer() {
    try {
        // 1. Initialize all modules (dynamic discovery)
        await moduleManager.loadModules(app);
        logger.info('[CMS] All modules initialized and routes mounted.');

        // 2. Setup Guard Redirect (moved to top of file)

        // 3. Dedicated News Article Page
        app.get('/news/:id', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'news.html'));
        });

        // 4. Catch-all for Frontend Routing (MUST be after module routes)
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        // 5. Global Express Error Handler
        app.use((err, req, res, next) => {
            logger.error(`[Express Error] ${req.method} ${req.originalUrl}:`, err);
            res.status(500).json({ success: false, message: 'Ein unerwarteter interner Serverfehler ist aufgetreten.' });
        });

        // 6. Start listening
        app.listen(PORT, async () => {
            const setupDone = process.env.SETUP_DONE === 'true';
            if (setupDone) {
                try {
                    await initDb();
                } catch (err) {
                    logger.error('Database migration failed on startup.');
                }
            } else {
                logger.info('⚠️  Setup not completed. Redirecting to /setup.html');
            }
            logger.info(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        logger.error('[CMS] Critical error during server startup:', err);
        process.exit(1);
    }
}

startServer();
