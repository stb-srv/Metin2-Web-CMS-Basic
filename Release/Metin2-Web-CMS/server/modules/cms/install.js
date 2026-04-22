module.exports = async function(db, ensureTable) {
    const { s } = db;
    
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
            slug VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content MEDIUMTEXT,
            lang VARCHAR(5) DEFAULT 'de',
            UNIQUE KEY idx_slug_lang (slug, lang)
        );
    `);
    try { await db.query(`ALTER TABLE ${s('website')}.site_pages ADD COLUMN lang VARCHAR(5) DEFAULT 'de';`); } catch (e) { }
    const [pagesRows] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.site_pages`);
    if (pagesRows[0].count === 0) {
        await db.query(`INSERT INTO ${s('website')}.site_pages (slug, title, content) VALUES ('agb', 'AGB', 'Allgemeine Geschäftsbedingungen...'), ('datenschutz', 'Datenschutz', 'Datenschutzerklärung...'), ('impressum', 'Impressum', 'Impressum...'), ('bann-richtlinien', 'Bann-Richtlinien', '<h1>Bann-Richtlinien</h1><p>Verstöße gegen die Serverregeln führen zu Accountstrafen.</p>'), ('serverregeln', 'Serverregeln', '<h1>Serverregeln</h1><p>1. Kein Bugusing.<br>2. Kein Beleidigen.</p>')`);
    }

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
};
