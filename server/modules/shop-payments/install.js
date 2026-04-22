module.exports = async function(db, ensureTable) {
    const { s } = db;

    // 14.3 shop_payments
    await ensureTable(s('website'), 'shop_payments', `
        CREATE TABLE ${s('website')}.shop_payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            account_id INT NOT NULL,
            package_id INT NOT NULL,
            method VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            coins INT NOT NULL,
            details TEXT,
            status ENUM('pending', 'approved', 'declined') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_account_id (account_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
};
