const db = require('./server/config/database');

async function run() {
    try {
        const { s } = db;
        await db.query(`
            INSERT IGNORE INTO ${s('website')}.shop_coin_settings (setting_key, setting_value)
            VALUES ('paypal_email', 'deine@email.de')
        `);
        console.log('✓ paypal_email setting initialized.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
