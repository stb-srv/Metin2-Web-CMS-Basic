const db = require('../../config/database');

class IngameShopsRepository {
    async getAllShops() {
        const { s } = db;
        const [shops] = await db.query(`SELECT vnum, name, npc_vnum FROM ${s('player')}.shop ORDER BY vnum ASC`);
        return shops;
    }

    async getShopItems(shopVnum) {
        const { s } = db;
        const [items] = await db.query(`
            SELECT s.*, p.locale_name as name, p.size 
            FROM ${s('player')}.shop_item s 
            LEFT JOIN ${s('player')}.item_proto p ON s.item_vnum = p.vnum 
            WHERE s.shop_vnum = ?
        `, [shopVnum]);
        return items;
    }

    async createShop(vnum, name, npc_vnum) {
        const { s } = db;
        return db.query(`INSERT INTO ${s('player')}.shop (vnum, name, npc_vnum) VALUES (?, ?, ?)`, [vnum, name, npc_vnum]);
    }

    async deleteShop(vnum) {
        const { s } = db;
        await db.query(`DELETE FROM ${s('player')}.shop_item WHERE shop_vnum = ?`, [vnum]);
        return db.query(`DELETE FROM ${s('player')}.shop WHERE vnum = ?`, [vnum]);
    }

    async updateShopItems(vnum, items) {
        const { s } = db;
        await db.query(`DELETE FROM ${s('player')}.shop_item WHERE shop_vnum = ?`, [vnum]);
        if (items && items.length > 0) {
            const values = items.map(item => [vnum, item.vnum, item.count]);
            return db.query(`INSERT INTO ${s('player')}.shop_item (shop_vnum, item_vnum, count) VALUES ?`, [values]);
        }
    }

    async searchItem(query) {
        const { s } = db;
        const vnum = parseInt(query) || 0;
        const sql = `SELECT vnum, locale_name as name FROM ${s('player')}.item_proto WHERE locale_name LIKE ? OR vnum = ? LIMIT 50`;
        const [rows] = await db.query(sql, [`%${query}%`, vnum]);
        return rows;
    }

    // GM Management
    async getAllGMs() {
        const { s } = db;
        const [rows] = await db.query(`SELECT mID, mAccount, mName, mContactIP, mServerIP, mAuthority FROM ${s('common')}.gmlist ORDER BY mID ASC`);
        return rows;
    }

    async saveGM(mAccount, charName, mContactIP, mAuthority) {
        const { s } = db;
        const [existing] = await db.query(`SELECT mID FROM ${s('common')}.gmlist WHERE mAccount = ? AND mName = ?`, [mAccount, charName]);
        if (existing.length > 0) {
            return db.query(`UPDATE ${s('common')}.gmlist SET mContactIP = ?, mAuthority = ? WHERE mID = ?`, [mContactIP || 'ALL', mAuthority, existing[0].mID]);
        } else {
            return db.query(`INSERT INTO ${s('common')}.gmlist (mAccount, mName, mContactIP, mServerIP, mAuthority) VALUES (?, ?, ?, ?, ?)`,
                [mAccount, charName, mContactIP || 'ALL', 'ANY', mAuthority]);
        }
    }

    async deleteGM(id) {
        const { s } = db;
        return db.query(`DELETE FROM ${s('common')}.gmlist WHERE mID = ?`, [id]);
    }
}

module.exports = new IngameShopsRepository();
