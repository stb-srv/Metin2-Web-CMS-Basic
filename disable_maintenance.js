const db = require('./server/config/database');

async function run() {
    try {
        const { s } = db;
        await db.query(`UPDATE ${s('website')}.site_settings SET setting_value = 'false' WHERE setting_key = 'module_maintenance'`);
        console.log("Maintenance mode disabled.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
