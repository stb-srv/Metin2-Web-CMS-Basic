const db = require('../../config/database');

class CmsRepository {
    async getSettings() {
        const { s } = db;
        const [rows] = await db.query(`SELECT setting_key, setting_value FROM ${s('website')}.site_settings`);
        const config = {};
        rows.forEach(s => config[s.setting_key] = s.setting_value);
        return config;
    }

    async getPage(slug, lang = 'de') {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.site_pages WHERE slug = ? AND lang = ?`, [slug, lang]);
        return rows[0];
    }

    async savePage(slug, title, content, lang = 'de') {
        const { s } = db;
        const [exists] = await db.query(`SELECT id FROM ${s('website')}.site_pages WHERE slug = ? AND lang = ?`, [slug, lang]);
        if (exists.length > 0) {
            return db.query(`UPDATE ${s('website')}.site_pages SET title = ?, content = ? WHERE slug = ? AND lang = ?`, [title, content, slug, lang]);
        } else {
            return db.query(`INSERT INTO ${s('website')}.site_pages (slug, title, content, lang) VALUES (?, ?, ?, ?)`, [slug, title, content, lang]);
        }
    }

    async deletePage(slug, lang = 'de') {
        const { s } = db;
        return db.query(`DELETE FROM ${s('website')}.site_pages WHERE slug = ? AND lang = ?`, [slug, lang]);
    }

    async getAllPages(lang = 'de') {
        const { s } = db;
        const [rows] = await db.query(`SELECT id, slug, title FROM ${s('website')}.site_pages WHERE lang = ?`, [lang]);
        return rows;
    }

    async getAllNews(lang = 'de') {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.cms_news WHERE lang = ? ORDER BY created_at DESC`, [lang]);
        return rows;
    }

    async getNewsById(id) {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.cms_news WHERE id = ?`, [id]);
        return rows[0];
    }

    async saveNews(data) {
        const { s } = db;
        const { id, title, content, image_url, category, author, is_published, lang } = data;
        const currentLang = lang || 'de';
        if (id) {
            return db.query(`
                UPDATE ${s('website')}.cms_news 
                SET title = ?, content = ?, image_url = ?, category = ?, author = ?, is_published = ?, lang = ?
                WHERE id = ?
            `, [title, content, image_url, category, author, is_published, currentLang, id]);
        } else {
            return db.query(`
                INSERT INTO ${s('website')}.cms_news (title, content, image_url, category, author, is_published, lang) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [title, content, image_url, category, author, is_published, currentLang]);
        }
    }

    async deleteNews(id) {
        const { s } = db;
        return db.query(`DELETE FROM ${s('website')}.cms_news WHERE id = ?`, [id]);
    }

    async updateSettings(settings) {
        const { s } = db;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            for (const [key, value] of Object.entries(settings)) {
                if (value === undefined || value === null) continue;
                await connection.query(
                    `INSERT INTO ${s('website')}.site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?`,
                    [key, String(value), String(value)]
                );
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    async getAllDownloads() {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.downloads ORDER BY display_order ASC`);
        return rows;
    }

    async addDownload(data) {
        const { s } = db;
        const { title, description, url, icon, bg_color, icon_color, display_order } = data;
        return db.query(`
            INSERT INTO ${s('website')}.downloads (title, description, url, icon, bg_color, icon_color, display_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [title, description, url, icon, bg_color, icon_color, display_order || 0]);
    }

    async updateDownload(id, data) {
        const { s } = db;
        const { title, description, url, icon, bg_color, icon_color, display_order } = data;
        return db.query(`
            UPDATE ${s('website')}.downloads 
            SET title = ?, description = ?, url = ?, icon = ?, bg_color = ?, icon_color = ?, display_order = ?
            WHERE id = ?
        `, [title, description, url, icon, bg_color, icon_color, display_order || 0, id]);
    }

    async deleteDownload(id) {
        const { s } = db;
        return db.query(`DELETE FROM ${s('website')}.downloads WHERE id = ?`, [id]);
    }

    // Navbar Links
    async getNavbarLinks() {
        const { s } = db;
        const [rows] = await db.query(`
            SELECT id, title_key AS label, url, icon, parent_id, is_external, display_order, is_active 
            FROM ${s('website')}.navbar_links 
            ORDER BY display_order ASC
        `);
        return rows;
    }

    async createNavbarLink(data) {
        const { s } = db;
        const { label, url, icon, parent_id } = data;
        const [res] = await db.query(`
            INSERT INTO ${s('website')}.navbar_links (title_key, url, icon, parent_id, is_active)
            VALUES (?, ?, ?, ?, 1)
        `, [label, url, icon, parent_id || null]);
        return res.insertId;
    }

    async updateNavbarLink(id, data) {
        const { s } = db;
        const { label, url, icon, parent_id } = data;
        return db.query(`
            UPDATE ${s('website')}.navbar_links 
            SET title_key = ?, url = ?, icon = ?, parent_id = ?
            WHERE id = ?
        `, [label, url, icon, parent_id || null, id]);
    }

    async reorderNavbarLinks(links) {
        const { s } = db;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            for (const link of links) {
                await connection.query(`UPDATE ${s('website')}.navbar_links SET display_order = ? WHERE id = ?`, [link.display_order, link.id]);
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    // Audit Logs
    async getAuditLogs(limit = 100, page = 1) {
        const { s } = db;
        const offset = (page - 1) * limit;
        const [rows] = await db.query(`
            SELECT * FROM ${s('website')}.admin_audit_logs 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);
        return rows;
    }

    // Events
    async getAllEvents() {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.cms_events ORDER BY start_date ASC`);
        return rows;
    }

    async saveEvent(event) {
        const { s } = db;
        const { id, title, description, start_date, end_date, icon, is_active } = event;
        if (id) {
            await db.query(`
                UPDATE ${s('website')}.cms_events 
                SET title = ?, description = ?, start_date = ?, end_date = ?, icon = ?, is_active = ?
                WHERE id = ?
            `, [title, description, start_date, end_date, icon, is_active ? 1 : 0, id]);
        } else {
            await db.query(`
                INSERT INTO ${s('website')}.cms_events (title, description, start_date, end_date, icon, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [title, description, start_date, end_date, icon, is_active ? 1 : 0]);
        }
    }

    async deleteEvent(id) {
        const { s } = db;
        await db.query(`DELETE FROM ${s('website')}.cms_events WHERE id = ?`, [id]);
    }

    // Vouchers
    async getAllVouchers() {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.vouchers ORDER BY created_at DESC`);
        return rows;
    }

    async createVoucher(voucher) {
        const { s } = db;
        const { code, reward_type, reward_amount } = voucher;
        await db.query(`
            INSERT INTO ${s('website')}.vouchers (code, reward_type, reward_amount)
            VALUES (?, ?, ?)
        `, [code, reward_type, reward_amount]);
    }

    async deleteVoucher(id) {
        const { s } = db;
        await db.query(`DELETE FROM ${s('website')}.vouchers WHERE id = ?`, [id]);
    }

    // REDEEM VOUCHER IS ALREADY DONE IN PREVIOUS STEP

    // Themes
    async getAllThemes() {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.cms_themes ORDER BY created_at DESC`);
        return rows;
    }
 
    async getActiveTheme() {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.cms_themes WHERE is_active = 1 LIMIT 1`);
        return rows[0];
    }
 
    async saveTheme(theme) {
        const { s } = db;
        const { id, name, primary_color, accent_color, bg_color, border_radius, bg_image } = theme;
        if (id) {
            await db.query(`
                UPDATE ${s('website')}.cms_themes 
                SET name = ?, primary_color = ?, accent_color = ?, bg_color = ?, border_radius = ?, bg_image = ?
                WHERE id = ?
            `, [name, primary_color, accent_color, bg_color, border_radius, bg_image, id]);
        } else {
            await db.query(`
                INSERT INTO ${s('website')}.cms_themes (name, primary_color, accent_color, bg_color, border_radius, bg_image)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [name, primary_color, accent_color, bg_color, border_radius, bg_image]);
        }
    }
 
    async deleteTheme(id) {
        const { s } = db;
        await db.query(`DELETE FROM ${s('website')}.cms_themes WHERE id = ?`, [id]);
    }
 
    async activateTheme(id) {
        const { s } = db;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            // Deactivate all
            await connection.query(`UPDATE ${s('website')}.cms_themes SET is_active = 0`);
            // Activate selected
            await connection.query(`UPDATE ${s('website')}.cms_themes SET is_active = 1 WHERE id = ?`, [id]);
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
}

module.exports = new CmsRepository();
