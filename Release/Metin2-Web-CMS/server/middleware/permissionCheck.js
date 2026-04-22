const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware to check if the user has a specific permission via their roles
 * @param {string} permissionKey The permission key to check (e.g., 'news.delete')
 */
const hasPermission = (permissionKey) => {
    return async (req, res, next) => {
        // req.accountId should be set by the preceding auth middleware
        if (!req.accountId) {
            return res.status(401).json({ success: false, message: 'Nicht autorisiert.' });
        }

        try {
            // Optimization: We could cache this in a session or Redis
            // But for now, we query the DB
            const { s } = db;
            const [perms] = await db.query(`
                SELECT rp.permission_key 
                FROM ${s('website')}.account_roles ar
                JOIN ${s('website')}.role_permissions rp ON ar.role_id = rp.role_id
                WHERE ar.account_id = ?
            `, [req.accountId]);

            // Check if the specific permissionKey exists in the fetched permissions
            const hasSpecificPermission = perms.some(p => p.permission_key === permissionKey);

            if (hasSpecificPermission) {
                return next();
            }

            // Fallback: Check if user is a legacy SuperAdmin (via gmlist)
            // This ensures we dont lock the user out during transition
            const [user] = await db.query(`SELECT login FROM ${s('account')}.account WHERE id = ?`, [req.accountId]);
            if (user.length > 0) {
                const [gms] = await db.query(`SELECT mAuthority FROM ${s('common')}.gmlist WHERE mAccount = ?`, [user[0].login]);
                if (gms.length > 0) {
                    const authority = gms[0].mAuthority;
                    const gmRanks = (process.env.GM_RANKS || 'IMPLEMENTOR,HIGH_WIZARD,GOD').split(',');
                    if (gmRanks.includes(authority)) {
                        return next();
                    }
                }
            }

            return res.status(403).json({ 
                success: false, 
                message: `Fehlende Berechtigung: ${permissionKey}` 
            });
        } catch (err) {
            logger.error(`[PermissionCheck] Error checking "${permissionKey}" for UID ${req.accountId}:`, err);
            return res.status(500).json({ success: false, message: 'Interner Berechtigungsfehler.' });
        }
    };
};

module.exports = hasPermission;
