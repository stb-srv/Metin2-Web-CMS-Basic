const repository = require('./repository');

class ItemsController {
    /**
     * GET /api/items/search?q=<query>&limit=<n>
     * Searches player.item_proto by locale_name (LIKE) or exact vnum.
     * Returns: { success, items: [{ vnum, name, type, subtype, size }] }
     */
    async search(req, res) {
        const query = (req.query.q || '').trim();
        const limit = Math.min(parseInt(req.query.limit) || 30, 100);

        if (query.length < 2) {
            return res.json({ success: true, items: [] });
        }

        const isNumericQuery = /^\d+$/.test(query);

        const rows = await repository.searchItems(query, limit, isNumericQuery);

        // Decode locale_name buffer if needed
        const items = rows.map(row => ({
            vnum: row.vnum,
            name: row.name ? (Buffer.isBuffer(row.name) ? row.name.toString('utf8') : String(row.name)) : 'Unbekanntes Item',
            type: row.type || 0,
            subtype: row.subtype || 0,
            size: row.size || 1
        }));

        res.json({ success: true, items });
    }
}

module.exports = new ItemsController();
