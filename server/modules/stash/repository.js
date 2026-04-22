const db = require('../../config/database');

class StashRepository {
    static _lastCleanup = 0;
    async getStash(accountId) {
        const { s } = db;
        const [rows] = await db.query(`
            SELECT 
                s.*,
                COALESCE(NULLIF(i.locale_name, ''), i.name, 'Unbekanntes Item') as name,
                i.size
            FROM ${s('website')}.web_stash s
            LEFT JOIN ${s('player')}.item_proto i ON s.vnum = i.vnum
            WHERE s.account_id = ? AND s.is_deleted = 0
            ORDER BY s.id DESC
        `, [accountId]);
        return rows.map(item => {
            if (Buffer.isBuffer(item.name)) item.name = item.name.toString('utf8');
            if (item.description && Buffer.isBuffer(item.description)) item.description = item.description.toString('utf8');
            return item;
        });
    }

    async cleanupOldDeleted() {
        const { s } = db;
        await db.query(`DELETE FROM ${s('website')}.web_stash WHERE is_deleted = 1 AND deleted_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    }

    async getTrash(accountId) {
        // Auto-cleanup items older than 7 days
        const now = Date.now();
        if (now - StashRepository._lastCleanup > 10 * 60 * 1000) { // alle 10 Minuten
            StashRepository._lastCleanup = now;
            this.cleanupOldDeleted().catch(e =>
                console.error('[Stash] Cleanup error:', e)
            );
        }

        const { s } = db;
        const [rows] = await db.query(`
            SELECT 
                s.*,
                COALESCE(NULLIF(i.locale_name, ''), i.name, 'Unbekanntes Item') as name,
                i.size
            FROM ${s('website')}.web_stash s
            LEFT JOIN ${s('player')}.item_proto i ON s.vnum = i.vnum
            WHERE s.account_id = ? AND s.is_deleted = 1
            ORDER BY s.deleted_at DESC
        `, [accountId]);
        return rows.map(item => {
            if (Buffer.isBuffer(item.name)) item.name = item.name.toString('utf8');
            if (item.description && Buffer.isBuffer(item.description)) item.description = item.description.toString('utf8');
            return item;
        });
    }

    async getById(id, accountId, forUpdate = false) {
        const { s } = db;
        const query = `SELECT * FROM ${s('website')}.web_stash WHERE id = ? AND account_id = ? ${forUpdate ? 'FOR UPDATE' : ''}`;
        const [rows] = await db.query(query, [id, accountId]);
        return rows[0];
    }

    async getMallItems(accountId) {
        const { s } = db;
        const [rows] = await db.query(`
            SELECT i.pos, IFNULL(p.size, 1) as size 
            FROM ${s('player')}.item i 
            LEFT JOIN ${s('player')}.item_proto p ON i.vnum = p.vnum 
            WHERE i.owner_id = ? AND i.window = "MALL"
        `, [accountId]);
        return rows;
    }

    async getItemSize(vnum) {
        const { s } = db;
        const [rows] = await db.query(`SELECT size FROM ${s('player')}.item_proto WHERE vnum = ?`, [vnum]);
        return rows.length > 0 ? (rows[0].size || 1) : 1;
    }

    async getItemProto(vnum) {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('player')}.item_proto WHERE vnum = ?`, [vnum]);
        return rows[0];
    }

    async moveToMall(connection, accountId, pos, item) {
        const { s } = db;
        const insertQuery = `
            INSERT INTO ${s('player')}.item (
                owner_id, window, pos, count, vnum,
                socket0, socket1, socket2,
                attrtype0, attrvalue0, attrtype1, attrvalue1, attrtype2, attrvalue2,
                attrtype3, attrvalue3, attrtype4, attrvalue4, attrtype5, attrvalue5, attrtype6, attrvalue6
            ) VALUES (?, 'MALL', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const clamp = (val) => Math.max(-32768, Math.min(32767, parseInt(val) || 0));
        const params = [
            accountId, pos, item.count, item.vnum,
            item.socket0, item.socket1, item.socket2,
            item.attrtype0, clamp(item.attrvalue0), item.attrtype1, clamp(item.attrvalue1), item.attrtype2, clamp(item.attrvalue2),
            item.attrtype3, clamp(item.attrvalue3), item.attrtype4, clamp(item.attrvalue4), item.attrtype5, clamp(item.attrvalue5), item.attrtype6, clamp(item.attrvalue6)
        ];
        return connection.query(insertQuery, params);
    }

    async deletePermanent(id) {
        const { s } = db;
        return db.query(`DELETE FROM ${s('website')}.web_stash WHERE id = ?`, [id]);
    }

    async removeFromStash(connection, id) {
        const { s } = db;
        return connection.query(`DELETE FROM ${s('website')}.web_stash WHERE id = ?`, [id]);
    }

    async getTrashCount(accountId) {
        const { s } = db;
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.web_stash WHERE account_id = ? AND is_deleted = 1`, [accountId]);
        return rows[0].count;
    }

    async getStashCount(accountId) {
        const { s } = db;
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.web_stash WHERE account_id = ? AND is_deleted = 0`, [accountId]);
        return rows[0].count;
    }

    async moveToTrash(id, accountId) {
        const { s } = db;
        return db.query(`UPDATE ${s('website')}.web_stash SET is_deleted = 1, deleted_at = NOW() WHERE id = ? AND account_id = ? AND is_deleted = 0`, [id, accountId]);
    }

    async restoreFromTrash(id, accountId) {
        const { s } = db;
        return db.query(`UPDATE ${s('website')}.web_stash SET is_deleted = 0, deleted_at = NULL WHERE id = ? AND account_id = ? AND is_deleted = 1`, [id, accountId]);
    }

    async permanentDelete(id, accountId) {
        const { s } = db;
        return db.query(`DELETE FROM ${s('website')}.web_stash WHERE id = ? AND account_id = ? AND is_deleted = 1`, [id, accountId]);
    }

    async bulkMoveToTrash(ids, accountId) {
        const { s } = db;
        return db.query(`UPDATE ${s('website')}.web_stash SET is_deleted = 1, deleted_at = NOW() WHERE id IN (?) AND account_id = ? AND is_deleted = 0`, [ids, accountId]);
    }

    async bulkPermanentDelete(ids, accountId) {
        const { s } = db;
        return db.query(`DELETE FROM ${s('website')}.web_stash WHERE id IN (?) AND account_id = ? AND is_deleted = 1`, [ids, accountId]);
    }

    async addToWebStash(data) {
        const { s } = db;
        const query = `
            INSERT INTO ${s('website')}.web_stash (
                account_id, vnum, count,
                socket0, socket1, socket2,
                attrtype0, attrvalue0, attrtype1, attrvalue1, attrtype2, attrvalue2,
                attrtype3, attrvalue3, attrtype4, attrvalue4, attrtype5, attrvalue5,
                attrtype6, attrvalue6
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.account_id, data.vnum, data.count || 1,
            data.socket0 || 0, data.socket1 || 0, data.socket2 || 0,
            data.attrtype0 || 0, data.attrvalue0 || 0, data.attrtype1 || 0, data.attrvalue1 || 0,
            data.attrtype2 || 0, data.attrvalue2 || 0, data.attrtype3 || 0, data.attrvalue3 || 0,
            data.attrtype4 || 0, data.attrvalue4 || 0, data.attrtype5 || 0, data.attrvalue5 || 0,
            data.attrtype6 || 0, data.attrvalue6 || 0
        ];
        return db.query(query, values);
    }

    async getAccountIdByPlayerName(playerName) {
        const { s } = db;
        const [rows] = await db.query(`SELECT account_id FROM ${s('player')}.player WHERE name = ?`, [playerName]);
        return rows.length > 0 ? rows[0].account_id : null;
    }

    async getSafebox(accountId) {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('player')}.safebox WHERE account_id = ?`, [accountId]);
        return rows[0];
    }

    /**
     * HINWEIS: Das Safebox-Passwort wird absichtlich im Klartext gespeichert.
     * Der Metin2-Gameserver liest und vergleicht dieses Passwort direkt aus der DB.
     * Eine Verschlüsselung würde den Gameserver-Login für die Safebox brechen.
     */
    async updateSafeboxPassword(accountId, newPassword) {
        const { s } = db;
        const [result] = await db.query(
            `UPDATE ${s('player')}.safebox SET password = ? WHERE account_id = ?`,
            [newPassword, accountId]
        );
        return result.affectedRows > 0;
    }

    /**
     * HINWEIS: Das Safebox-Passwort wird absichtlich im Klartext gespeichert.
     * Der Metin2-Gameserver liest und vergleicht dieses Passwort direkt aus der DB.
     * Eine Verschlüsselung würde den Gameserver-Login für die Safebox brechen.
     */
    async ensureSafeboxExists(accountId) {
        const { s } = db;
        // Check if exists
        const [rows] = await db.query(`SELECT account_id FROM ${s('player')}.safebox WHERE account_id = ?`, [accountId]);
        if (rows.length === 0) {
            // Create default safebox (password 000000, 1 page)
            await db.query(
                `INSERT INTO ${s('player')}.safebox (account_id, password, size) VALUES (?, '000000', 1)`,
                [accountId]
            );
        }
    }

    async getConnection() {
        return db.getConnection();
    }
}

module.exports = new StashRepository();
