const db = require('../../config/database');

class AdminRepository {
    async getAllRoles() {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.roles ORDER BY id ASC`);
        return rows;
    }

    async getPermissions() {
        // Fetch all permissions for all roles
        const { s } = db;
        const [rows] = await db.query(`
            SELECT r.id, r.name as role_name, rp.permission_key 
            FROM ${s('website')}.roles r
            LEFT JOIN ${s('website')}.role_permissions rp ON r.id = rp.role_id
        `);
        return rows;
    }

    async updatePermissions(roleId, permissions) {
        const connection = await db.getConnection();
        const { s } = db;
        try {
            await connection.beginTransaction();
            await connection.query(`DELETE FROM ${s('website')}.role_permissions WHERE role_id = ?`, [roleId]);
            if (permissions && permissions.length > 0) {
                for (const key of permissions) {
                    await connection.query(`INSERT INTO ${s('website')}.role_permissions (role_id, permission_key) VALUES (?, ?)`, [roleId, key]);
                }
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    async getAdmins() {
        const { s } = db;
        const [rows] = await db.query(`
            SELECT a.id, a.login, r.name as role_name, ar.role_id
            FROM ${s('website')}.account_roles ar
            JOIN ${s('account')}.account a ON ar.account_id = a.id
            JOIN ${s('website')}.roles r ON ar.role_id = r.id
        `);
        return rows;
    }

    async setAdminRole(accountId, roleId) {
        // For now we only support one role per account in this simple UI, 
        // so we delete existing first
        const { s } = db;
        await db.query(`DELETE FROM ${s('website')}.account_roles WHERE account_id = ?`, [accountId]);
        if (roleId) {
            await db.query(`INSERT INTO ${s('website')}.account_roles (account_id, role_id) VALUES (?, ?)`, [accountId, roleId]);
        }
    }

    async getRecentActivity() {
        const { s } = db;
        const [accounts] = await db.query(`SELECT id, login as username, create_time as timestamp, "account" as type FROM ${s('account')}.account ORDER BY create_time DESC LIMIT 5`);
        const [bans] = await db.query(`SELECT id, account_id, admin_username, reason, created_at as timestamp, "ban" as type FROM ${s('website')}.ban_history ORDER BY created_at DESC LIMIT 5`);
        
        // Combine and sort by timestamp
        return [...accounts, ...bans].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
    }

    async getStats() {
        const { s } = db;
        let shopItems = 0;
        let totalAccounts = 0;
        let totalBans = 0;
        let totalDownloads = 0;

        try {
            const [shopRows] = await db.query(`SELECT COUNT(*) as c FROM ${s('website')}.shop_items`);
            shopItems = shopRows[0].c;

            const [accRows] = await db.query(`SELECT COUNT(*) as c FROM ${s('account')}.account`);
            totalAccounts = accRows[0].c;

            // Check if ban_history exists, otherwise default to 0
            try {
                const [banRows] = await db.query(`SELECT COUNT(*) as c FROM ${s('website')}.ban_history`);
                totalBans = banRows[0].c;
            } catch (banErr) {
                console.warn('[AdminRepo] ban_history table might be missing, defaulting to 0.');
            }

            const [dlRows] = await db.query(`SELECT COUNT(*) as c FROM ${s('website')}.downloads`);
            totalDownloads = dlRows[0].c;
        } catch(e) {
            console.error('[AdminRepo] Error fetching dashboard stats:', e.message);
        }

        return {
            accounts: totalAccounts,
            active_bans: totalBans,
            downloads: totalDownloads,
            shop_items: shopItems
        };
    }
}

module.exports = new AdminRepository();
