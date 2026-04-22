module.exports = async function(db, ensureTable) {
    const { s } = db;

    // 10. item_creator_history
    await ensureTable(s('website'), 'item_creator_history', `
        CREATE TABLE ${s('website')}.item_creator_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            vnum INT,
            payload JSON,
            mode VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
};
