const db = require('./config/database');

async function migrate() {
    try {
        const { s } = db;
        const tableName = 'shop_payments';
        const dbName = s('website');

        console.log(`Checking table ${dbName}.${tableName}...`);
        const [rows] = await db.query(`SHOW TABLES IN ${dbName} LIKE '${tableName}'`);
        
        if (rows.length === 0) {
            console.log(`Creating table ${dbName}.${tableName}...`);
            await db.query(`
                CREATE TABLE ${dbName}.${tableName} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    account_id INT NOT NULL,
                    package_id INT NOT NULL,
                    method ENUM('paypal', 'paysafecard') NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    coins INT NOT NULL,
                    details TEXT,
                    status ENUM('pending', 'approved', 'declined') DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_account (account_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log('✓ Table created successfully.');
        } else {
            console.log('✓ Table already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
