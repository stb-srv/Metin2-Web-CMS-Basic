module.exports = async function(db, ensureTable) {
    const { s } = db;

    // 18. Vote4Coins System
    await ensureTable(s('website'), 'vote_links', `
        CREATE TABLE ${s('website')}.vote_links (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            url VARCHAR(255) NOT NULL,
            image_url VARCHAR(255) DEFAULT '',
            reward INT NOT NULL DEFAULT 10,
            cooldown_hours INT NOT NULL DEFAULT 12,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await ensureTable(s('website'), 'vote_logs', `
        CREATE TABLE ${s('website')}.vote_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            account_id INT NOT NULL,
            vote_link_id INT NOT NULL,
            ip_address VARCHAR(50) DEFAULT NULL,
            voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_account_id (account_id),
            INDEX idx_vote_link_id (vote_link_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
};
