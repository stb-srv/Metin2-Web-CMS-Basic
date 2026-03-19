const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Robust Admin Check Middleware
 * Verifies JWT token and checks for GMPrivileges in common.gmlist
 */
async function isAdmin(req, res, next) {
    let accountId = null;

    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const potentialToken = authHeader.split(' ')[1];
        if (potentialToken && potentialToken !== 'null' && potentialToken !== 'undefined') {
            token = potentialToken;
        }
    }
    
    // Cookie Fallback (if no valid bearer token)
    if (!token) {
        if (req.cookies && req.cookies.m2token) {
            token = req.cookies.m2token;
        } else if (req.headers.cookie) {
            token = req.headers.cookie.split(';').find(row => row.trim().startsWith('m2token='))?.split('=')[1];
        }
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            accountId = decoded.id;
        } catch (err) {
            // Token invalid - we just continue and let it fail at !accountId
        }
    }

    if (!accountId) {
        return res.status(401).json({ success: false, message: 'Nicht authentifiziert.' });
    }

    try {
        const { s } = db;
        const [users] = await db.query(`SELECT login FROM ${s('account')}.account WHERE id = ?`, [accountId]);
        if (users.length === 0) return res.status(401).json({ success: false, message: 'Account nicht gefunden.' });

        const username = users[0].login;
        const [gms] = await db.query(`SELECT mAccount, mAuthority FROM ${s('common')}.gmlist WHERE mAccount = ?`, [username]);

        if (gms.length === 0) {
            return res.status(403).json({ success: false, message: 'Zugriff verweigert. Nur für Teammitglieder.' });
        }

        const role = gms[0].mAuthority;
        const [perms] = await db.query(`SELECT * FROM ${s('website')}.admin_permissions WHERE role_name = ?`, [role]);
        
        const gmRanks = (process.env.GM_RANKS || 'IMPLEMENTOR,HIGH_WIZARD,GOD').split(',');

        let permissions;
        if (perms.length > 0) {
            permissions = perms[0];
        } else if (gmRanks.includes(role)) {
            // SuperAdmin fallback
            permissions = {
                can_manage_shop: 1,
                can_give_gifts: 1,
                can_manage_players: 1,
                can_manage_team: 1,
                can_edit_rules: 1,
                can_manage_votes: 1,
                role_name: role
            };
        } else {
            // Default (no permissions)
            permissions = {
                can_manage_shop: 0,
                can_give_gifts: 0,
                can_manage_players: 0,
                can_manage_team: 0,
                can_edit_rules: 0,
                role_name: role
            };
        }

        // Attach to request
        req.accountId = accountId;
        req.adminUsername = username;
        req.adminRole = role;
        req.adminPermissions = permissions;

        next();
    } catch (err) {
        console.error('Admin Check Error:', err);
        res.status(500).json({ success: false, message: 'Fehler bei der Berechtigungsprüfung.' });
    }
}

module.exports = isAdmin;
