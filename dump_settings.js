const db = require('./server/config/database');
const fs = require('fs');

async function run() {
    try {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.site_settings`);
        fs.writeFileSync('settings.json', JSON.stringify(rows, null, 2), 'utf8');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
