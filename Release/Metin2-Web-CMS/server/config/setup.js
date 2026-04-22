const db = require('./database');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

/**
 * Ensures all required database tables exist.
 * This logic was extracted from server.js as part of the modular refactor.
 */
async function initDb() {
    try {
        const { s } = db;
        await db.query(`CREATE DATABASE IF NOT EXISTS ${s('website')};`);

        // Database Fix: Ensure standard currency columns exist if someone uses a fresh/clean account.sql
        try { await db.query(`ALTER TABLE ${s('account')}.account ADD COLUMN coins INT(11) DEFAULT 0;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('account')}.account ADD COLUMN cash INT(11) DEFAULT 0;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('account')}.account MODIFY COLUMN password VARCHAR(255) NOT NULL;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('account')}.account ADD COLUMN web_pass_hash VARCHAR(255) DEFAULT NULL;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('account')}.account ADD COLUMN real_name VARCHAR(255) DEFAULT NULL;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('account')}.account ADD COLUMN question1 TINYINT DEFAULT NULL;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('account')}.account ADD COLUMN answer1 VARCHAR(255) DEFAULT NULL;`); } catch (e) { }

        let createdTables = [];

        async function ensureTable(dbName, tableName, createSql) {
            const [rows] = await db.query(`SHOW TABLES IN ${dbName} LIKE '${tableName}'`);
            if (rows.length === 0) {
                await db.query(createSql);
                createdTables.push(`${dbName}.${tableName}`);
                return true;
            }
            return false;
        }

        // Dynamically load and execute database schemas from modules
        const modulesDir = path.join(__dirname, '../modules');
        if (fs.existsSync(modulesDir)) {
            const moduleDirs = fs.readdirSync(modulesDir);
            for (const dir of moduleDirs) {
                const installFilePath = path.join(modulesDir, dir, 'install.js');
                if (fs.existsSync(installFilePath)) {
                    try {
                        const installFn = require(installFilePath);
                        if (typeof installFn === 'function') {
                            await installFn(db, ensureTable);
                            logger.info(`✓ Installed database schema for module: ${dir}`);
                        }
                    } catch (e) {
                        logger.error(`Error running install.js for module ${dir}:`, e);
                    }
                }
            }
        }

        if (createdTables.length > 0) {
            logger.info(`✓ New tables/columns created: ${createdTables.join(', ')}`);
        } else {
            logger.info(`✓ Database schema is up to date.`);
        }

    } catch (err) {
        logger.error("Error during database initialization:", err);
        throw err;
    }
}

function isSetupNeeded() {
    return process.env.SETUP_DONE !== 'true';
}

module.exports = { initDb, isSetupNeeded };
