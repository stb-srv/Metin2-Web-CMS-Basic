const db = require('../../config/database');

class VoteRepository {
    // Admin: Get all vote links
    async getAllLinks() {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.vote_links ORDER BY created_at ASC`);
        return rows;
    }

    // Admin: Create vote link
    async createLink(data) {
        const { title, url, image_url, reward, cooldown_hours, is_active } = data;
        const [result] = await db.query(
            `INSERT INTO ${s('website')}.vote_links (title, url, image_url, reward, cooldown_hours, is_active) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, url, image_url, reward, cooldown_hours, is_active]
        );
        return result.insertId;
    }

    // Admin: Update vote link
    async updateLink(id, data) {
        const { title, url, image_url, reward, cooldown_hours, is_active } = data;
        const [result] = await db.query(
            `UPDATE ${s('website')}.vote_links 
             SET title = ?, url = ?, image_url = ?, reward = ?, cooldown_hours = ?, is_active = ?
             WHERE id = ?`,
            [title, url, image_url, reward, cooldown_hours, is_active, id]
        );
        return result.affectedRows > 0;
    }

    // Admin: Delete vote link
    async deleteLink(id) {
        const [result] = await db.query(`DELETE FROM ${s('website')}.vote_links WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    // Public: Get active vote links with user's specific cooldowns based on IP or AccountID
    async getPublicLinks(accountId, ipAddress) {
        // Query to get active links and checking if user has voted recently
        const [rows] = await db.query(`
            SELECT vl.id, vl.title, vl.url, vl.image_url, vl.reward, vl.cooldown_hours,
                   (SELECT voted_at FROM ${s('website')}.vote_logs 
                    WHERE vote_link_id = vl.id AND (account_id = ? OR ip_address = ?) 
                    ORDER BY voted_at DESC LIMIT 1) as last_vote_time
            FROM ${s('website')}.vote_links vl
            WHERE vl.is_active = 1
        `, [accountId, ipAddress]);
        
        return rows;
    }

    // Public: Log vote and grant reward
    async processVote(accountId, linkId, ipAddress) {
        const [linkRows] = await db.query(`SELECT reward, cooldown_hours, is_active FROM ${s('website')}.vote_links WHERE id = ?`, [linkId]);
        
        if (linkRows.length === 0 || linkRows[0].is_active === 0) {
            throw new Error('Vote-Link nicht gefunden oder inaktiv.');
        }

        const link = linkRows[0];

        // Ensure user hasn't voted within cooldown period
        const [logRows] = await db.query(`
            SELECT voted_at FROM ${s('website')}.vote_logs 
            WHERE vote_link_id = ? AND (account_id = ? OR ip_address = ?) 
            ORDER BY voted_at DESC LIMIT 1
        `, [linkId, accountId, ipAddress]);

        if (logRows.length > 0) {
            const lastVote = new Date(logRows[0].voted_at);
            const now = new Date();
            const diffHours = (now - lastVote) / (1000 * 60 * 60);

            if (diffHours < link.cooldown_hours) {
                const remainingHours = Math.ceil(link.cooldown_hours - diffHours);
                throw new Error(`Du hast bereits abgestimmt. Bitte warte noch ${remainingHours} Stunden.`);
            }
        }

        // Needs Transaction
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Insert Log
            await conn.query(
                `INSERT INTO ${s('website')}.vote_logs (account_id, vote_link_id, ip_address) VALUES (?, ?, ?)`,
                [accountId, linkId, ipAddress]
            );

            // Grant Reward (using configurable DR column as default for voting)
            const colDR = process.env.DB_COLUMN_DR || 'coins';
            await conn.query(`UPDATE ${s('account')}.account SET ${colDR} = ${colDR} + ? WHERE id = ?`, [link.reward, accountId]);

            await conn.commit();
            return link.reward;
        } catch (err) {
            if (conn) await conn.rollback();
            console.error('[Votes] processing error:', err);
            throw new Error('Fehler beim Gewähren der Belohnung.');
        } finally {
            conn.release();
        }
    }
}

module.exports = new VoteRepository();
