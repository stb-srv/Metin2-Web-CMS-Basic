const db = require('./database');
const logger = require('../utils/logger');

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

        // 1. shop_items
        await ensureTable(s('website'), 'shop_items', `
            CREATE TABLE ${s('website')}.shop_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vnum INT NOT NULL COMMENT 'Die Item-Vnum aus der item_proto',
                price_coins INT DEFAULT 0 COMMENT 'Preis in Drachenmunzen',
                count INT NOT NULL DEFAULT 1 COMMENT 'Anzahl des Items',
                category VARCHAR(50) DEFAULT 'Sonstiges' COMMENT 'Kategorie im Shop',
                is_active TINYINT(1) DEFAULT 1 COMMENT '1 = Im Shop sichtbar, 0 = Versteckt'
            );
        `);

        // Migration logic for shop_items
        try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN price_marken INT DEFAULT NULL;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN marken_reward INT DEFAULT NULL;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN description TEXT DEFAULT NULL;`); } catch (e) { }
        for (let i = 0; i < 3; i++) {
            try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN socket${i} INT NOT NULL DEFAULT 0;`); } catch (e) { }
        }
        for (let i = 0; i < 7; i++) {
            try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN attrtype${i} TINYINT(4) NOT NULL DEFAULT 0;`); } catch (e) { }
            try { await db.query(`ALTER TABLE ${s('website')}.shop_items ADD COLUMN attrvalue${i} SMALLINT(6) NOT NULL DEFAULT 0;`); } catch (e) { }
        }

        // 2. shop_categories
        await ensureTable(s('website'), 'shop_categories', `
            CREATE TABLE ${s('website')}.shop_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            );
        `);

        // 3. site_settings
        await ensureTable(s('website'), 'site_settings', `
            CREATE TABLE ${s('website')}.site_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT
            );
        `);
        const defaultSettings = [
            ['site_name', 'Metin2 Web'],
            ['site_logo', ''],
            ['site_description', 'Das nächste Kapitel deines Metin2 Abenteuers. Erlebe eine neue Ära von Action, Handel und PvP.'],
            ['site_keywords', 'Metin2, Private Server, P-Server, MMORPG, Gaming, Action'],
            ['discord_url', 'https://discord.gg/metin2'],
            ['facebook_url', ''],
            ['twitter_url', ''],
            ['instagram_url', ''],
            ['footer_text', 'Alle Rechte vorbehalten.'],
            ['maintenance_mode', 'false'],
            ['theme_primary', '#cc0000'],
            ['theme_accent', '#ff4d4d'],
            ['module_vouchers', 'true'],
            ['module_logs', 'true'],
            ['module_events', 'true'],
            ['module_discord', 'true'],
            ['module_maintenance', 'true'],
            ['module_stash', 'true']
        ];
        for (const [key, val] of defaultSettings) {
            try {
                await db.query(`INSERT IGNORE INTO ${s('website')}.site_settings (setting_key, setting_value) VALUES (?, ?)`, [key, val]);
            } catch (e) { }
        }

        // 3.1 cms_news
        await ensureTable(s('website'), 'cms_news', `
            CREATE TABLE ${s('website')}.cms_news (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content MEDIUMTEXT NOT NULL,
                image_url VARCHAR(255),
                category VARCHAR(50) DEFAULT 'Update',
                author VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_published TINYINT(1) DEFAULT 1,
                lang VARCHAR(5) DEFAULT 'de'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        try { await db.query(`ALTER TABLE ${s('website')}.cms_news ADD COLUMN lang VARCHAR(5) DEFAULT 'de';`); } catch (e) { }

        // 4. site_pages
        await ensureTable(s('website'), 'site_pages', `
            CREATE TABLE ${s('website')}.site_pages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(100) NOT NULL UNIQUE,
                title VARCHAR(255) NOT NULL,
                content MEDIUMTEXT,
                lang VARCHAR(5) DEFAULT 'de'
            );
        `);
        try { await db.query(`ALTER TABLE ${s('website')}.site_pages ADD COLUMN lang VARCHAR(5) DEFAULT 'de';`); } catch (e) { }
        const [pagesRows] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.site_pages`);
        if (pagesRows[0].count === 0) {
            await db.query(`INSERT INTO ${s('website')}.site_pages (slug, title, content) VALUES ('agb', 'AGB', 'Allgemeine Geschäftsbedingungen...'), ('datenschutz', 'Datenschutz', 'Datenschutzerklärung...'), ('impressum', 'Impressum', 'Impressum...'), ('bann-richtlinien', 'Bann-Richtlinien', '<h1>Bann-Richtlinien</h1><p>Verstöße gegen die Serverregeln führen zu Accountstrafen.</p>'), ('serverregeln', 'Serverregeln', '<h1>Serverregeln</h1><p>1. Kein Bugusing.<br>2. Kein Beleidigen.</p>')`);
        }

        // 5. admin_permissions
        await ensureTable(s('website'), 'admin_permissions', `
            CREATE TABLE ${s('website')}.admin_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_name VARCHAR(50) NOT NULL UNIQUE,
                can_manage_shop BOOLEAN DEFAULT 0,
                can_give_gifts BOOLEAN DEFAULT 0,
                can_manage_players BOOLEAN DEFAULT 0,
                can_manage_team BOOLEAN DEFAULT 0,
                can_edit_rules BOOLEAN DEFAULT 0
            );
        `);
        try { await db.query(`ALTER TABLE ${s('website')}.admin_permissions ADD COLUMN can_edit_rules BOOLEAN DEFAULT 0 AFTER can_manage_team`); } catch (e) { }
        const [permsRows] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.admin_permissions`);
        if (permsRows[0].count === 0) {
            await db.query(`
                INSERT INTO ${s('website')}.admin_permissions (role_name, can_manage_shop, can_give_gifts, can_manage_players, can_manage_team, can_edit_rules) 
                VALUES ('IMPLEMENTOR', 1, 1, 1, 1, 1), ('HIGH_WIZARD', 1, 0, 1, 0, 1), ('GOD', 0, 0, 1, 0, 1), ('LOW_WIZARD', 0, 0, 0, 0, 0)
            `);
        }

        // 6. ban_history
        await ensureTable(s('website'), 'ban_history', `
            CREATE TABLE ${s('website')}.ban_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                account_id INT NOT NULL,
                admin_username VARCHAR(255) NOT NULL,
                reason TEXT,
                banned_until DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 9. web_stash
        await ensureTable(s('website'), 'web_stash', `
            CREATE TABLE ${s('website')}.web_stash (
                id INT AUTO_INCREMENT PRIMARY KEY,
                account_id INT NOT NULL,
                vnum INT NOT NULL,
                count INT DEFAULT 1,
                socket0 INT DEFAULT 0,
                socket1 INT DEFAULT 0,
                socket2 INT DEFAULT 0,
                attrtype0 INT DEFAULT 0, attrvalue0 INT DEFAULT 0,
                attrtype1 INT DEFAULT 0, attrvalue1 INT DEFAULT 0,
                attrtype2 INT DEFAULT 0, attrvalue2 INT DEFAULT 0,
                attrtype3 INT DEFAULT 0, attrvalue3 INT DEFAULT 0,
                attrtype4 INT DEFAULT 0, attrvalue4 INT DEFAULT 0,
                attrtype5 INT DEFAULT 0, attrvalue5 INT DEFAULT 0,
                attrtype6 INT DEFAULT 0, attrvalue6 INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT 0,
                deleted_at TIMESTAMP NULL DEFAULT NULL,
                INDEX idx_account_id (account_id),
                INDEX idx_is_deleted (is_deleted)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        try { await db.query(`ALTER TABLE ${s('website')}.web_stash ADD COLUMN is_deleted BOOLEAN DEFAULT 0;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('website')}.web_stash ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;`); } catch (e) { }
        try { await db.query(`ALTER TABLE ${s('website')}.web_stash ADD INDEX idx_is_deleted (is_deleted);`); } catch (e) { }

        // 10. item_creator_history
        await ensureTable(s('website'), 'item_creator_history', `
            CREATE TABLE ${s('website')}.item_creator_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                vnum INT,
                payload JSON,
                mode VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 11. downloads
        await ensureTable(s('website'), 'downloads', `
            CREATE TABLE ${s('website')}.downloads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                url VARCHAR(255) NOT NULL,
                icon VARCHAR(100) DEFAULT 'fas fa-download',
                bg_color VARCHAR(50) DEFAULT 'rgba(0,0,0,0.2)',
                icon_color VARCHAR(50) DEFAULT 'var(--primary)',
                display_order INT DEFAULT 0
            );
        `);

        // 12. navbar_links
        await ensureTable(s('website'), 'navbar_links', `
            CREATE TABLE ${s('website')}.navbar_links (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title_key VARCHAR(100) NOT NULL COMMENT 'Translation key (e.g. navbar.home)',
                url VARCHAR(255) NOT NULL,
                icon VARCHAR(100) DEFAULT 'fas fa-link',
                is_external BOOLEAN DEFAULT 0,
                parent_id INT DEFAULT NULL,
                display_order INT DEFAULT 0,
                is_active BOOLEAN DEFAULT 1
            );
        `);
        const [navRows] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.navbar_links`);
        if (navRows[0].count === 0) {
            await db.query(`
                INSERT INTO ${s('website')}.navbar_links (title_key, url, icon, display_order) VALUES 
                ('navbar.home', 'index', 'fas fa-home', 1),
                ('navbar.shop', 'shop', 'fas fa-store', 2),
                ('navbar.ranking', 'ranking', 'fas fa-trophy', 3),
                ('navbar.downloads', 'downloads', 'fas fa-download', 4),
                ('navbar.vote', 'vote', 'fas fa-thumbs-up', 5),
                ('navbar.info', '#', 'fas fa-info-circle', 6)
            `);
            // Add sub-links for Info
            const [infoRow] = await db.query(`SELECT id FROM ${s('website')}.navbar_links WHERE title_key = 'navbar.info'`);
            if (infoRow.length > 0) {
                const infoId = infoRow[0].id;
                await db.query(`
                    INSERT INTO ${s('website')}.navbar_links (title_key, url, icon, parent_id, display_order) VALUES 
                    ('navbar.rules', 'page?slug=serverregeln', 'fas fa-gavel', ${infoId}, 1),
                    ('navbar.bans', 'page?slug=bann-richtlinien', 'fas fa-ban', ${infoId}, 2)
                `);
            }
        }

        // 13. admin_audit_logs
        await ensureTable(s('website'), 'admin_audit_logs', `
            CREATE TABLE ${s('website')}.admin_audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                account_id INT NOT NULL,
                admin_username VARCHAR(255) NOT NULL,
                action VARCHAR(100) NOT NULL,
                target_type VARCHAR(50),
                target_id VARCHAR(100),
                details TEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

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

        // 15. cms_events
        await ensureTable(s('website'), 'cms_events', `
            CREATE TABLE ${s('website')}.cms_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_date DATETIME NOT NULL,
                end_date DATETIME NOT NULL,
                icon VARCHAR(100) DEFAULT 'fas fa-calendar-alt',
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
 
        // 16. cms_themes
        await ensureTable(s('website'), 'cms_themes', `
            CREATE TABLE ${s('website')}.cms_themes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                primary_color VARCHAR(20) DEFAULT '#cc0000',
                accent_color VARCHAR(20) DEFAULT '#ff4d4d',
                bg_color VARCHAR(20) DEFAULT '#0a0000',
                border_radius VARCHAR(20) DEFAULT '12px',
                bg_image VARCHAR(255) DEFAULT '',
                is_active BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
 
        const [themeCount] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.cms_themes`);
        if (themeCount[0].count === 0) {
            await db.query(`
                INSERT INTO ${s('website')}.cms_themes (name, primary_color, accent_color, bg_color, is_active) VALUES 
                ('Classic Red', '#cc0000', '#ff4d4d', '#1a0000', 1),
                ('Deep Blue', '#0044cc', '#3399ff', '#000d1a', 0),
                ('Golden Empire', '#d4af37', '#ffd700', '#1a1a00', 0)
            `);
        }


        // 18. Vote4Coins System
        await ensureTable(s('website'), 'vote_links', `
            CREATE TABLE ${s('website')}.vote_links (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                url VARCHAR(255) NOT NULL,
                image_url VARCHAR(255) DEFAULT '',
                reward INT NOT NULL DEFAULT 10,
                cooldown_hours INT NOT NULL DEFAULT 12,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await ensureTable(s('website'), 'vote_logs', `
            CREATE TABLE ${s('website')}.vote_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                account_id INT NOT NULL,
                vote_link_id INT NOT NULL,
                ip_address VARCHAR(50) DEFAULT NULL,
                voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_account_id (account_id),
                INDEX idx_vote_link_id (vote_link_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Add vote management permission to admin_permissions if missing
        try { await db.query(`ALTER TABLE ${s('website')}.admin_permissions ADD COLUMN can_manage_votes BOOLEAN DEFAULT 0;`); } catch (e) { }

        // 19. Account Security
        await ensureTable(s('website'), 'password_reset_tokens', `
            CREATE TABLE ${s('website')}.password_reset_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                account_id INT NOT NULL,
                token VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_token (token),
                INDEX idx_account_id (account_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

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
