const mysql = require('mysql2/promise');
require('dotenv').config();

// Schema Configuration (Modular with Defaults)
const schemas = {
    account: process.env.DB_SCHEMA_ACCOUNT || 'account',
    player: process.env.DB_SCHEMA_PLAYER || 'player',
    common: process.env.DB_SCHEMA_COMMON || 'common',
    website: process.env.DB_SCHEMA_WEBSITE || 'website'
};

// Create the connection pool
let pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: schemas.account, // Default to account
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 2000 
});

const dbWrapper = {
    query: (...args) => pool.query(...args),
    execute: (...args) => pool.execute(...args),
    getConnection: () => pool.getConnection(),
    end: () => pool.end(),
    escape: (val) => mysql.escape(val),
    escapeId: (val) => mysql.escapeId(val),
    format: (...args) => mysql.format(...args),
    recreatePool: () => {
        try { pool.end(); } catch (e) {}
        schemas.account = process.env.DB_SCHEMA_ACCOUNT || 'account';
        schemas.player = process.env.DB_SCHEMA_PLAYER || 'player';
        schemas.common = process.env.DB_SCHEMA_COMMON || 'common';
        schemas.website = process.env.DB_SCHEMA_WEBSITE || 'website';
        pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: schemas.account,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 2000 
        });
    }
};

dbWrapper.schemas = schemas; // Export for global access via db object
dbWrapper.s = (key) => schemas[key] || key; // Helper for shorthand usage: db.s('account')

// Health check helper
dbWrapper.checkConnection = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        connection.release();
        return { online: true };
    } catch (err) {
        return { online: false, error: err.message };
    }
};

module.exports = dbWrapper;
