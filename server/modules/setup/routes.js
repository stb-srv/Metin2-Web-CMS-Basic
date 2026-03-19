const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

const ENV_PATH = path.join(__dirname, '..', '..', '..', '.env');

// Check if setup is needed (no .env or setup_done flag missing)
function isSetupNeeded() {
    if (!fs.existsSync(ENV_PATH)) return true;
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    return !content.includes('SETUP_DONE=true');
}

// GET /api/setup/status — Check if setup is required
router.get('/status', (req, res) => {
    res.json({ setupNeeded: isSetupNeeded() });
});

// GET /api/setup/check-env — Check system environment
router.get('/check-env', (req, res) => {
    const checks = {};

    // Node.js version
    checks.node = { installed: true, version: process.version };

    // npm
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        checks.npm = { installed: true, version: npmVersion };
    } catch (e) {
        checks.npm = { installed: false, version: null };
    }

    // Check if node_modules exists
    const nmPath = path.join(__dirname, '..', '..', '..', 'node_modules');
    checks.node_modules = { installed: fs.existsSync(nmPath) };

    // Check required packages
    const requiredPkgs = ['mysql2', 'express', 'cors', 'helmet', 'express-rate-limit', 'jsonwebtoken', 'dotenv'];
    checks.packages = {};
    for (const pkg of requiredPkgs) {
        try {
            const pkgPath = path.join(nmPath, pkg, 'package.json');
            if (fs.existsSync(pkgPath)) {
                const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                checks.packages[pkg] = { installed: true, version: pkgJson.version };
            } else {
                checks.packages[pkg] = { installed: false };
            }
        } catch (e) {
            checks.packages[pkg] = { installed: false };
        }
    }

    // OS info
    checks.os = {
        platform: process.platform,
        arch: process.arch,
        type: process.platform === 'win32' ? 'Windows' : (process.platform === 'darwin' ? 'macOS' : 'Linux')
    };

    // Python check
    try {
        const pythonVer = execSync('python --version', { encoding: 'utf8' }).trim();
        checks.python = { installed: true, version: pythonVer };
    } catch (e) {
        try {
            const pythonVer = execSync('python3 --version', { encoding: 'utf8' }).trim();
            checks.python = { installed: true, version: pythonVer };
        } catch (e2) {
            checks.python = { installed: false, version: null };
        }
    }

    // Pillow check (via pip list)
    if (checks.python.installed) {
        try {
            const pipList = execSync('pip list', { encoding: 'utf8' });
            checks.pillow = { installed: pipList.toLowerCase().includes('pillow') };
        } catch (e) {
            checks.pillow = { installed: false };
        }
    } else {
        checks.pillow = { installed: false };
    }

    // .env exists?
    checks.envExists = fs.existsSync(ENV_PATH);

    res.json({ success: true, checks });
});

// POST /api/setup/install-python-deps — Install Pillow for icon conversion
router.post('/install-python-deps', (req, res) => {
    try {
        // Try pip or pip3
        let cmd = 'pip install Pillow';
        try {
            execSync('pip --version');
        } catch (e) {
            cmd = 'pip3 install Pillow';
        }

        execSync(cmd, {
            encoding: 'utf8',
            timeout: 60000
        });
        res.json({ success: true, message: 'Pillow erfolgreich installiert!' });
    } catch (e) {
        res.json({ success: false, message: `Installation fehlgeschlagen: ${e.message}. Bitte manuell installieren: pip install Pillow` });
    }
});

// POST /api/setup/test-db — Test database connection
router.post('/test-db', async (req, res) => {
    const { db_host, db_user, db_password, db_port } = req.body;

    if (!db_host || !db_user) {
        return res.status(400).json({ success: false, message: 'Host und Benutzer sind erforderlich.' });
    }

    let connection;
    try {
        const mysql = require('mysql2/promise');
        connection = await mysql.createConnection({
            host: db_host,
            port: parseInt(db_port) || 3306,
            user: db_user,
            password: db_password || '',
            connectTimeout: 5000
        });

        const { s } = db;
        // Check which databases exist
        const [dbs] = await connection.query('SHOW DATABASES');
        const dbNames = dbs.map(d => Object.values(d)[0]);

        const dbStatus = {
            account: dbNames.includes(process.env.DB_SCHEMA_ACCOUNT || 'account'),
            player: dbNames.includes(process.env.DB_SCHEMA_PLAYER || 'player'),
            common: dbNames.includes(process.env.DB_SCHEMA_COMMON || 'common'),
            website: dbNames.includes(process.env.DB_SCHEMA_WEBSITE || 'website')
        };

        // Check if item_proto exists in player DB
        let hasItemProto = false;
        if (dbStatus.player) {
            try {
                const [tables] = await connection.query(`SHOW TABLES IN ${s('player')} LIKE 'item_proto'`);
                hasItemProto = tables.length > 0;
            } catch (e) { }
        }

        // Check if gmlist exists in common DB
        let hasGmList = false;
        if (dbStatus.common) {
            try {
                const [tables] = await connection.query(`SHOW TABLES IN ${s('common')} LIKE 'gmlist'`);
                hasGmList = tables.length > 0;
            } catch (e) { }
        }

        res.json({
            success: true,
            message: 'Verbindung erfolgreich!',
            databases: dbStatus,
            hasItemProto,
            hasGmList
        });

    } catch (e) {
        let msg = 'Verbindung fehlgeschlagen.';
        if (e.code === 'ECONNREFUSED') msg = 'Verbindung abgelehnt — läuft MySQL/MariaDB auf diesem Host?';
        else if (e.code === 'ER_ACCESS_DENIED_ERROR') msg = 'Zugriff verweigert — Benutzername oder Passwort falsch.';
        else if (e.code === 'ETIMEDOUT' || e.code === 'ENOTFOUND') msg = 'Server nicht erreichbar — Host korrekt?';
        else msg = e.message;

        res.json({ success: false, message: msg });
    } finally {
        if (connection) await connection.end();
    }
});

// POST /api/setup/save-config — Save .env file
router.post('/save-config', (req, res) => {
    const { db_host, db_user, db_password, db_port, jwt_secret, port } = req.body;

    const envContent = [
        `# Metin2 Web-Panel Konfiguration`,
        `# Erstellt am ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`,
        ``,
        `# Datenbank`,
        `DB_HOST=${db_host || '127.0.0.1'}`,
        `DB_USER=${db_user || 'root'}`,
        `DB_PASSWORD=${db_password || ''}`,
        `DB_PORT=${db_port || '3306'}`,
        ``,
        `# Server`,
        `PORT=${port || '3000'}`,
        `SITE_NAME=${req.body.site_name || 'Metin2 Web'}`,
        ``,
        `# Sicherheit`,
        `JWT_SECRET=${jwt_secret || generateSecret()}`,
        `JWT_EXPIRES=7d`,
        ``,
        `# Setup abgeschlossen`,
        `SETUP_DONE=true`,
    ].join('\n');

    try {
        fs.writeFileSync(ENV_PATH, envContent, 'utf8');
        res.json({ success: true, message: '.env Datei gespeichert!' });
    } catch (e) {
        res.json({ success: false, message: `Fehler beim Speichern: ${e.message}` });
    }
});

// POST /api/setup/install-db — Run database installation
router.post('/install-db', async (req, res) => {
    try {
        const { initDb } = require('../../config/setup');
        await initDb();
        res.json({ success: true, message: 'Datenbank-Schema wurde erfolgreich initialisiert!' });
    } catch (e) {
        res.json({ success: false, message: `Fehler bei der Initialisierung: ${e.message}` });
    }
});

// POST /api/setup/create-admin — Create the first administrator
router.post('/create-admin', async (req, res) => {
    const { username, password, email } = req.body;
    const db = require('../../config/database');
    const bcrypt = require('bcrypt');

    try {
        const { s } = db;
        // Fix: Ensure password column is long enough for bcrypt
        try { await db.query(`ALTER TABLE ${s('account')}.account MODIFY COLUMN password VARCHAR(255) NOT NULL;`); } catch (e) { }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 1. Create account
        const [result] = await db.query(
            `INSERT INTO ${s('account')}.account (login, password, email, social_id, status) VALUES (?, ?, ?, ?, ?)`,
            [username, hashedPassword, email, '1234567', 'OK']
        );
        
        const accountId = result.insertId;

        // 2. Set as Admin (IMPLEMENTOR)
        await db.query(
            `REPLACE INTO ${s('common')}.gmlist (mAccount, mName, mContactIP, mServerIP, mAuthority) VALUES (?, ?, 'ANY', 'ANY', 'IMPLEMENTOR')`,
            [username, username]
        );

        res.json({ success: true, message: 'Administrator-Konto erfolgreich erstellt!' });
    } catch (e) {
        res.json({ success: false, message: `Fehler: ${e.message}` });
    }
});

// POST /api/setup/install-packages — Install npm packages
router.post('/install-packages', (req, res) => {
    try {
        execSync('npm install', {
            cwd: path.join(__dirname, '..', '..', '..'),
            encoding: 'utf8',
            timeout: 120000
        });
        res.json({ success: true, message: 'Pakete installiert!' });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

function generateSecret() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 48; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

module.exports = router;
module.exports.isSetupNeeded = isSetupNeeded;
