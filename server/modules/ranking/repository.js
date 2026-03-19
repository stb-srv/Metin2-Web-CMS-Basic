const db = require('../../config/database');

class RankingRepository {
    async getPlayerRanking({ page = 1, limit = 10, search = '' }) {
        const { s } = db;
        const offset = (page - 1) * limit;
        
        // We limit the total ranking to the top 200 players as requested
        const maxRankingLimit = 200;
        const actualLimit = Math.min(limit, maxRankingLimit - offset);
        
        if (actualLimit <= 0) return [];

        let query = `
            SELECT 
                p.name, p.job, p.level, p.exp, p.playtime,
                pi.empire,
                g.name as guild_name
            FROM ${s('player')}.player p
            LEFT JOIN ${s('player')}.player_index pi ON p.account_id = pi.id
            LEFT JOIN ${s('player')}.guild_member gm ON p.id = gm.pid
            LEFT JOIN ${s('player')}.guild g ON gm.guild_id = g.id
            WHERE p.name NOT LIKE '[%]%'
        `;
        
        const params = [];
        if (search) {
            query += ` AND p.name LIKE ?`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY p.level DESC, p.exp DESC, p.playtime DESC LIMIT ? OFFSET ?`;
        params.push(actualLimit, offset);

        const [rows] = await db.query(query, params);
        return rows;
    }

    async getTotalPlayerCount(search = '') {
        const { s } = db;
        let query = `SELECT COUNT(*) as count FROM ${s('player')}.player WHERE name NOT LIKE '[%]%'`;
        const params = [];
        
        if (search) {
            query += ` AND name LIKE ?`;
            params.push(`%${search}%`);
        }

        const [rows] = await db.query(query, params);
        // Cap total count at 200 for ranking purposes
        return Math.min(rows[0].count, 200);
    }

    async getGuildRanking({ page = 1, limit = 10, search = '' }) {
        const { s } = db;
        const offset = (page - 1) * limit;
        const maxRankingLimit = 200;
        const actualLimit = Math.min(limit, maxRankingLimit - offset);

        if (actualLimit <= 0) return [];

        let query = `
            SELECT 
                g.name, g.level, g.ladder_point, g.win, g.draw, g.loss, 
                p.name as master_name,
                pi.empire
            FROM ${s('player')}.guild g
            LEFT JOIN ${s('player')}.player p ON g.master = p.id
            LEFT JOIN ${s('player')}.player_index pi ON p.account_id = pi.id
            WHERE 1=1
        `;

        const params = [];
        if (search) {
            query += ` AND g.name LIKE ?`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY g.ladder_point DESC, g.level DESC, g.exp DESC LIMIT ? OFFSET ?`;
        params.push(actualLimit, offset);

        const [rows] = await db.query(query, params);
        return rows;
    }

    async getTotalGuildCount(search = '') {
        const { s } = db;
        let query = `SELECT COUNT(*) as count FROM ${s('player')}.guild WHERE 1=1`;
        const params = [];
        
        if (search) {
            query += ` AND name LIKE ?`;
            params.push(`%${search}%`);
        }

        const [rows] = await db.query(query, params);
        return Math.min(rows[0].count, 200);
    }
}

module.exports = new RankingRepository();
