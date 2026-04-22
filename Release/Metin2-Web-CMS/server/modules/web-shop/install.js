module.exports = async function(db, ensureTable) {
    const { s } = db;
    // 1. shop_items
    await ensureTable(s('website'), 'shop_items', `
        CREATE TABLE ${s('website')}.shop_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vnum INT NOT NULL COMMENT 'Die Item-Vnum aus der item_proto',
            price_coins INT DEFAULT 0 COMMENT 'Preis in Drachenmunzen',
            count INT NOT NULL DEFAULT 1 COMMENT 'Anzahl des Items',
            category VARCHAR(50) DEFAULT 'Sonstiges' COMMENT 'Kategorie im Shop',
            is_active TINYINT(1) DEFAULT 1 COMMENT '1 = Im Shop sichtbar, 0 = Versteckt'
        );
    `);

    // Migration logic for shop_items
    try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN price_marken INT DEFAULT NULL;`); } catch (e) { }
    try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN marken_reward INT DEFAULT NULL;`); } catch (e) { }
    try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN description TEXT DEFAULT NULL;`); } catch (e) { }
    for (let i = 0; i < 3; i++) {
        try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN socket${i} INT NOT NULL DEFAULT 0;`); } catch (e) { }
    }
    for (let i = 0; i < 7; i++) {
        try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN attrtype${i} TINYINT(4) NOT NULL DEFAULT 0;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN attrvalue${i} SMALLINT(6) NOT NULL DEFAULT 0;`); } catch (e) { }
    }

    // 2. shop_categories
    await ensureTable(s('website'), 'shop_categories', `
        CREATE TABLE ${s('website')}.shop_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE
        );
    `);
};
