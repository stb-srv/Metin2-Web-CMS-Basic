module.exports = async function(db, ensureTable) {
    const { s } = db;

    // 9. web_stash
    await ensureTable(s('website'), 'web_stash', `
        CREATE TABLE ${s('website')}.web_stash (
            id INT AUTO_INCREMENT PRIMARY KEY,
            account_id INT NOT NULL,
            vnum INT NOT NULL,
            count INT DEFAULT 1,
            socket0 INT DEFAULT 0,
            socket1 INT DEFAULT 0,
            socket2 INT DEFAULT 0,
            attrtype0 INT DEFAULT 0, attrvalue0 INT DEFAULT 0,
            attrtype1 INT DEFAULT 0, attrvalue1 INT DEFAULT 0,
            attrtype2 INT DEFAULT 0, attrvalue2 INT DEFAULT 0,
            attrtype3 INT DEFAULT 0, attrvalue3 INT DEFAULT 0,
            attrtype4 INT DEFAULT 0, attrvalue4 INT DEFAULT 0,
            attrtype5 INT DEFAULT 0, attrvalue5 INT DEFAULT 0,
            attrtype6 INT DEFAULT 0, attrvalue6 INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at TIMESTAMP NULL DEFAULT NULL,
            INDEX idx_account_id (account_id),
            INDEX idx_is_deleted (is_deleted)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    try { await db.query(`ALTER TABLE ${s('website')}.web_stash ADD COLUMN is_deleted BOOLEAN DEFAULT 0;`); } catch (e) { }
    try { await db.query(`ALTER TABLE ${s('website')}.web_stash ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;`); } catch (e) { }
    try { await db.query(`ALTER TABLE ${s('website')}.web_stash ADD INDEX idx_is_deleted (is_deleted);`); } catch (e) { }
};
