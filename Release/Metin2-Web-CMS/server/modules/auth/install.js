module.exports = async function(db, ensureTable) {
    const { s } = db;

    // 19. Account Security
    await ensureTable(s('website'), 'password_reset_tokens', `
        CREATE TABLE ${s('website')}.password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            account_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_token (token),
            INDEX idx_account_id (account_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
};
