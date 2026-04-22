module.exports = async function(db, ensureTable) {
    const { s } = db;

    // 14. vouchers
    await ensureTable(s('website'), 'vouchers', `
        CREATE TABLE ${s('website')}.vouchers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(50) NOT NULL UNIQUE,
            reward_type ENUM('DR', 'DM') NOT NULL,
            reward_amount INT NOT NULL,
            is_used BOOLEAN DEFAULT 0,
            used_by_id INT DEFAULT NULL,
            used_at DATETIME DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 14.1 shop_coin_packages
    await ensureTable(s('website'), 'shop_coin_packages', `
        CREATE TABLE ${s('website')}.shop_coin_packages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            dr_amount INT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            is_active TINYINT(1) DEFAULT 1,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [pkgCount] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.shop_coin_packages`);
    if (pkgCount[0].count === 0) {
        await db.query(`INSERT INTO ${s('website')}.shop_coin_packages (name, dr_amount, price, is_active, sort_order) VALUES 
            ('Small Pack', 500, 10.00, 1, 1),
            ('Medium Pack', 1200, 20.00, 1, 2),
            ('Large Pack', 3500, 50.00, 1, 3),
            ('Ultimate Pack', 8000, 100.00, 1, 4)
        `);
    }

    // 14.2 shop_coin_settings
    await ensureTable(s('website'), 'shop_coin_settings', `
        CREATE TABLE ${s('website')}.shop_coin_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value TEXT,
            expires_at DATETIME DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const defaultSettings = [
        ['bonus_percentage', '0'],
        ['paypal_email', 'billing@yourserver.com']
    ];
    for (const [key, val] of defaultSettings) {
        try {
            await db.query(`INSERT IGNORE INTO ${s('website')}.shop_coin_settings (setting_key, setting_value) VALUES (?, ?)`, [key, val]);
        } catch (e) {}
    }
};
