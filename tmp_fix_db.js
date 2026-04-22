require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const db = require('./server/config/database');
(async () => {
    try {
        const s = db.s;
        await db.query(`ALTER TABLE ${s('website')}.site_pages DROP INDEX slug`);
        console.log('Dropped unique slug index.');
    } catch (e) {
        console.log('Ignore drop error:', e.message);
    }
    try {
        await db.query(`ALTER TABLE ${s('website')}.site_pages ADD UNIQUE INDEX idx_slug_lang (slug, lang)`);
        console.log('Added composite unique index on slug+lang.');
    } catch (e) {
        console.log('Ignore add error:', e.message);
    }
    process.exit(0);
})();
