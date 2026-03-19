const db = require('../../config/database');

class PlayerRepository {
    async searchPlayer(query) {
        const { s } = db;
        const [rows] = await db.query(`SELECT id, name, account_id FROM ${s('player')}.player WHERE name LIKE ? LIMIT 20`, [`%${query}%`]);
        return rows;
    }

    async getBanHistory() {
        const { s } = db;
        const query = `
            SELECT b.*, a.login as account_name 
            FROM ${s('website')}.ban_history b
            LEFT JOIN ${s('account')}.account a ON b.account_id = a.id
            ORDER BY b.id DESC LIMIT 50
        `;
        const [history] = await db.query(query);
        return history;
    }

    async banAccount(accountId, data) {
        const { s } = db;
        const { reason, bannedUntil, adminUsername, isPermanent } = data;
        if (isPermanent) {
            await db.query(`UPDATE ${s('account')}.account SET status = 'BLOCK' WHERE id = ?`, [accountId]);
        } else {
            await db.query(`UPDATE ${s('account')}.account SET availDt = ? WHERE id = ?`, [bannedUntil, accountId]);
        }
        return db.query(
            `INSERT INTO ${s('website')}.ban_history (account_id, admin_username, reason, banned_until) VALUES (?, ?, ?, ?)`,
            [accountId, adminUsername, reason, bannedUntil]
        );
    }

    async unbanAccount(accountId, adminUsername) {
        const { s } = db;
        await db.query(`UPDATE ${s('account')}.account SET status = 'OK', availDt = '2000-01-01 00:00:00' WHERE id = ?`, [accountId]);
        return db.query(
            `INSERT INTO ${s('website')}.ban_history (account_id, admin_username, reason) VALUES (?, ?, ?)`,
            [accountId, adminUsername, 'Account Entbannung.']
        );
    }
}

module.exports = new PlayerRepository();
