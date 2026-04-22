const db = require('../config/database');
const logger = require('./logger');

/**
 * Admin Audit Logger
 * Records administrative actions for security and transparency.
 */
class AuditLogger {
    /**
     * Log an admin action
     * @param {Object} data - Audit data
     * @param {number} data.account_id - Admin account ID
     * @param {string} data.username - Admin username
     * @param {string} data.action - Action performed (e.g. 'update_settings', 'delete_page')
     * @param {string} data.target_type - Type of object affected (e.g. 'news', 'shop_item')
     * @param {string} data.target_id - ID of the affected object
     * @param {Object|string} data.details - Additional details/payload
     * @param {string} data.ip - IP address of the admin
     */
    async log(data) {
        try {
            const { account_id, username, action, target_type, target_id, details, ip } = data;
            const detailStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');
            const { s } = db;
            
            // 1. Log to Database
            await db.query(`
                INSERT INTO ${s('website')}.admin_audit_logs 
                (account_id, admin_username, action, target_type, target_id, details, ip_address)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [account_id, username, action, target_type, target_id, detailStr, ip || null]);

            // 2. Log to Winston (Security auditing)
            logger.info(`[Audit] ${username} performed ${action} on ${target_type} (${target_id})`, { 
                adminId: account_id, 
                details: detailStr,
                ip: ip
            });
        } catch (err) {
            logger.error('[AuditLogger] Failed to save log:', err);
        }
    }

    async getLogs(limit = 100) {
        const { s } = db;
        const [rows] = await db.query(`
            SELECT * FROM ${s('website')}.admin_audit_logs 
            ORDER BY created_at DESC 
            LIMIT ?
        `, [limit]);
        return rows;
    }
}

module.exports = new AuditLogger();
