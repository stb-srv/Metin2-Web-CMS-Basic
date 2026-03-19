const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * SuperAdmin Check Middleware
 * Verifies JWT token and checks for 'IMPLEMENTOR' authority.
 */
async function isSuperAdmin(req, res, next) {
    let accountId = null;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
            accountId = decoded.id;
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Token ungültig oder abgelaufen.' });
        }
    }

    if (!accountId) {
        return res.status(401).json({ success: false, message: 'Nicht authentifiziert.' });
    }

    try {
        const { s } = db;
        const [users] = await db.query(`SELECT login FROM ${s('account')}.account WHERE id = ?`, [accountId]);
        if (users.length === 0) return res.status(401).json({ success: false, message: 'Account nicht gefunden.' });

        const loginName = users[0].login;

        // Check for IMPLEMENTOR rights
        const [gmRows] = await db.query(`SELECT mAuthority FROM ${s('common')}.gmlist WHERE mAccount = ? AND mAuthority = "IMPLEMENTOR"`, [loginName]);

        if (gmRows.length === 0) {
            return res.status(403).json({ success: false, message: 'Zugriff verweigert! Du benötigst die Rolle "IMPLEMENTOR".' });
        }

        req.accountId = accountId;
        req.adminUsername = loginName;
        next();
    } catch (err) {
        console.error('SuperAdmin Check Error:', err);
        return res.status(500).json({ success: false, message: 'Serverfehler bei der Rechteprüfung.' });
    }
}

module.exports = isSuperAdmin;
