const db = require('../server/config/database');

async function run() {
    try {
        const { s } = db;
        await db.query(`UPDATE ${s('website')}.navbar_links SET url = '#' WHERE title_key = 'navbar.info' AND parent_id IS NULL`);
        console.log('Successfully updated navbar.info link to #');
    } catch (err) {
        console.error('Error updating DB:', err);
    } finally {
        process.exit(0);
    }
}
run();
