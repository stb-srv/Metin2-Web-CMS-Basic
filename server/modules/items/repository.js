const db = require('../../config/database');

class ItemsRepository {
    async searchItems(query, limit, isNumericQuery) {
        const { s } = db; // Declare s helper once at the beginning of the method
        let sql, params;

        if (isNumericQuery) {
            // Search by exact VNUM or VNUM prefix
            sql = `
                SELECT vnum, locale_name AS name, type, subtype, size
                FROM ${s('player')}.item_proto
                WHERE vnum = ? OR CAST(vnum AS CHAR) LIKE ?
                ORDER BY
                    CASE WHEN vnum = ? THEN 0 ELSE 1 END,
                    vnum ASC
                LIMIT ?
            `;
            const numQuery = parseInt(query);
            params = [numQuery, `${query}%`, numQuery, limit];
        } else {
            // Search by name (case-insensitive LIKE)
            sql = `
                SELECT vnum, locale_name AS name, type, subtype, size
                FROM ${s('player')}.item_proto
                WHERE locale_name LIKE ?
                ORDER BY
                    CASE WHEN locale_name LIKE ? THEN 0 ELSE 1 END,
                    LENGTH(locale_name) ASC,
                    vnum ASC
                LIMIT ?
            `;
            params = [`%${query}%`, `${query}%`, limit];
        }

        const [rows] = await db.query(sql, params);
        return rows;
    }
}

module.exports = new ItemsRepository();
