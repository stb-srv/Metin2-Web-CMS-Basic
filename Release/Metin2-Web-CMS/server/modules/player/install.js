module.exports = async function(db, ensureTable) {
    const { s } = db;

    // 6. ban_history
    await ensureTable(s('website'), 'ban_history', `
        CREATE TABLE ${s('website')}.ban_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            account_id INT NOT NULL,
            admin_username VARCHAR(255) NOT NULL,
            reason TEXT,
            banned_until DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};
