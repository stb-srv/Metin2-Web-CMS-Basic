const path = require('path');
const db = require('../server/config/database');
const { initDb } = require('../server/config/setup');
const logger = require('../server/utils/logger');

async function verify() {
    try {
        console.log('Starting verification of database setup...');
        await initDb();
        console.log('Verification complete. Check logs above for details.');
        
        // Verify specifically the new tables
        const { s } = db;
        const tablesToVerify = [
            [s('website'), 'shop_coin_packages'],
            [s('website'), 'shop_coin_settings'],
            [s('website'), 'shop_payments']
        ];
        
        for (const [dbName, tableName] of tablesToVerify) {
            const [rows] = await db.query(`SHOW TABLES IN ${dbName} LIKE '${tableName}'`);
            if (rows.length > 0) {
                console.log(`✓ Table confirmed: ${dbName}.${tableName}`);
                
                // Show a sample row count
                const [countRows] = await db.query(`SELECT COUNT(*) as count FROM ${dbName}.${tableName}`);
                console.log(`  Rows: ${countRows[0].count}`);
            } else {
                console.error(`✗ Table missing: ${dbName}.${tableName}`);
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
}

verify();
