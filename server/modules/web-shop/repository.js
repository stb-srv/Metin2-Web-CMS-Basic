const db = require('../../config/database');

class WebShopRepository {
    async getAllItems(activeOnly = true) {
        const { s } = db;
        const query = `
            SELECT s.*, COALESCE(i.locale_name, 'Unbekanntes Item') as name
            FROM ${s('website')}.shop_items s
            LEFT JOIN ${s('player')}.item_proto i ON s.vnum = i.vnum
            ${activeOnly ? 'WHERE s.is_active = 1' : ''}
            ORDER BY s.id DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    async getById(id) {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.shop_items WHERE id = ?`, [id]);
        return rows[0];
    }

    async getCategories() {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.shop_categories ORDER BY name ASC`);
        return rows;
    }


    async addToMALL(data) {
        const { s } = db;
        const query = `
            INSERT INTO ${s('player')}.item (
                owner_id, window, pos, count, vnum,
                socket0, socket1, socket2,
                attrtype0, attrvalue0, attrtype1, attrvalue1, attrtype2, attrvalue2,
                attrtype3, attrvalue3, attrtype4, attrvalue4, attrtype5, attrvalue5, attrtype6, attrvalue6
            ) VALUES (?, 'MALL', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return db.query(query, data);
    }

    async addToWebStash(data) {
        const { s } = db;
        const query = `
            INSERT INTO ${s('website')}.web_stash (
                account_id, vnum, count,
                socket0, socket1, socket2,
                attrtype0, attrvalue0, attrtype1, attrvalue1, attrtype2, attrvalue2,
                attrtype3, attrvalue3, attrtype4, attrvalue4, attrtype5, attrvalue5, attrtype6, attrvalue6
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return db.query(query, data);
    }

    // Admin Features
    async create(data) {
        const { s } = db;
        const query = `INSERT INTO ${s('website')}.shop_items SET ?`;
        return db.query(query, [data]);
    }

    async delete(id) {
        const { s } = db;
        return db.query(`DELETE FROM ${s('website')}.shop_items WHERE id = ?`, [id]);
    }

    async update(id, data) {
        const { s } = db;
        return db.query(`UPDATE ${s('website')}.shop_items SET ? WHERE id = ?`, [data, id]);
    }
}

module.exports = new WebShopRepository();
