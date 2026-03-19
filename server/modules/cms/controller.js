const fs = require('fs');
const path = require('path');
const repository = require('./repository');
const auditLogger = require('../../utils/auditLogger');
const discordLogger = require('../../utils/discordLogger');
const sanitizeHtml = require('sanitize-html');

const sanitizeOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span', 'br']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['style', 'class', 'data-*'],
        'img': ['src', 'alt', 'width', 'height']
    },
    allowedSchemes: ['http', 'https', 'data']
};

function isSafeSvg(filePath) {
    if (!fs.existsSync(filePath)) return true;
    const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
    const malicious = ['<script', 'onmouseover', 'onload', 'onclick', 'onerror', 'onfocus', 'onsubmit'];
    return !malicious.some(m => content.includes(m));
}

class CmsController {
    // Keys that should NEVER be sent to unauthenticated clients
    static SENSITIVE_KEYS = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from', 'smtp_secure'];

    async getSettings(req, res) {
        const settings = await repository.getSettings();
        // Strip sensitive keys for the public endpoint
        const publicSettings = Object.fromEntries(
            Object.entries(settings).filter(([k]) => !CmsController.SENSITIVE_KEYS.includes(k))
        );
        res.json({ success: true, settings: publicSettings });
    }

    async getAdminSettings(req, res) {
        const settings = await repository.getSettings();
        res.json({ success: true, settings });
    }

    async getAvailableThemes(req, res) {
        const skinsDir = path.join(__dirname, '../../../public/css/skins');
        const themesDir = path.join(__dirname, '../../../public/css/themes');

        let skins = [];
        let themes = [];

        if (fs.existsSync(skinsDir)) {
            skins = fs.readdirSync(skinsDir)
                .filter(file => file.endsWith('.css'))
                .map(file => file.replace('.css', ''));
        }

        if (fs.existsSync(themesDir)) {
            themes = fs.readdirSync(themesDir)
                .filter(file => file.endsWith('.css'))
                .map(file => file.replace('.css', ''));
        }

        // Always add defaults
        if (!skins.includes('default')) skins.unshift('default');
        if (!themes.includes('default')) themes.unshift('default');

        res.json({ success: true, skins, themes });
    }

    async updateSettings(req, res) {
        const {
            site_name,
            theme_mode,
            theme_skin,
            theme_empire,
            theme_primary_color,
            theme_accent_color,
            theme_bg_color,
            theme_border_radius,
            theme_bg_image: theme_bg_image_body,
            module_vouchers,
            module_logs,
            module_events,
            module_maintenance,
            module_discord,
            module_stash,
            nav_vote_pos,
            nav_stash_pos,
            nav_support_pos,
            discord_news_webhook,
            discord_shop_webhook,
            discord_ticket_webhook,
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_pass,
            smtp_from,
            smtp_secure,
            site_description,
            site_keywords,
            discord_url,
            footer_text,
            default_language,
            // Advanced Styling
            theme_font_main,
            theme_font_headers,
            theme_font_ui,
            theme_font_menu_header,
            theme_color_text_main,
            theme_color_text_muted,
            theme_color_text_accent,
            theme_color_menu_header,
            reset_styling
        } = req.body;
        let site_logo = req.body.site_logo;
        let theme_bg_image = theme_bg_image_body || '';

        if (req.files) {
            if (req.files.logo_file && req.files.logo_file[0]) {
                const file = req.files.logo_file[0];
                if (path.extname(file.filename).toLowerCase() === '.svg' && !isSafeSvg(file.path)) {
                    fs.unlinkSync(file.path);
                    return res.status(400).json({ success: false, message: 'Die hochgeladene SVG-Datei enthält unsichere Inhalte.' });
                }
                site_logo = '/uploads/logos/' + file.filename;
            }
            if (req.files.bg_file && req.files.bg_file[0]) {
                const file = req.files.bg_file[0];
                if (path.extname(file.filename).toLowerCase() === '.svg' && !isSafeSvg(file.path)) {
                    fs.unlinkSync(file.path);
                    return res.status(400).json({ success: false, message: 'Die hochgeladene SVG-Datei enthält unsichere Inhalte.' });
                }
                theme_bg_image = '/uploads/backgrounds/' + file.filename;
            }
        }

        const settings = {
            site_name: site_name || 'Metin2 Web',
            site_logo: site_logo || '',
            theme_mode: theme_mode || 'dark',
            theme_skin: theme_skin || 'default',
            theme_empire: theme_empire || 'default',
            theme_primary_color: theme_primary_color || '',
            theme_accent_color: theme_accent_color || '',
            theme_bg_color: theme_bg_color || '',
            theme_border_radius: theme_border_radius || '',
            theme_bg_image: theme_bg_image || '',
            module_vouchers: module_vouchers || 'false',
            module_logs: module_logs || 'false',
            module_events: module_events || 'false',
            module_maintenance: module_maintenance || 'false',
            module_discord: module_discord || 'false',
            module_stash: module_stash || 'false',
            nav_vote_pos: nav_vote_pos || 'navbar',
            nav_stash_pos: nav_stash_pos || 'navbar',
            nav_support_pos: nav_support_pos || 'navbar',
            discord_news_webhook: discord_news_webhook || '',
            discord_shop_webhook: discord_shop_webhook || '',
            discord_ticket_webhook: discord_ticket_webhook || '',
            smtp_host: smtp_host || '',
            smtp_port: smtp_port || '',
            smtp_user: smtp_user || '',
            smtp_pass: smtp_pass || '',
            smtp_from: smtp_from || '',
            smtp_secure: smtp_secure || 'false',
            site_description: site_description || '',
            site_keywords: site_keywords || '',
            discord_url: discord_url || '',
            footer_text: footer_text || '',
            default_language: default_language || 'de',
            // Advanced Styling
            theme_font_main: reset_styling === 'true' ? '' : (theme_font_main || ''),
            theme_font_headers: reset_styling === 'true' ? '' : (theme_font_headers || ''),
            theme_font_ui: reset_styling === 'true' ? '' : (theme_font_ui || ''),
            theme_font_menu_header: reset_styling === 'true' ? '' : (theme_font_menu_header || ''),
            theme_color_text_main: reset_styling === 'true' ? '' : (theme_color_text_main || ''),
            theme_color_text_muted: reset_styling === 'true' ? '' : (theme_color_text_muted || ''),
            theme_color_text_accent: reset_styling === 'true' ? '' : (theme_color_text_accent || ''),
            theme_color_menu_header: reset_styling === 'true' ? '' : (theme_color_menu_header || '')
        };

        await repository.updateSettings(settings);

        // Audit Log
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'update_settings',
            target_type: 'site_settings',
            target_id: 'global',
            details: settings,
            ip: req.ip
        });

        const updated = await repository.getSettings();
        res.json({ success: true, message: 'Einstellungen erfolgreich gespeichert.', settings: updated, site_logo });
    }

    async getPage(req, res) {
        const lang = req.query.lang || req.headers['accept-language']?.split(',')[0].split('-')[0] || 'de';
        const page = await repository.getPage(req.params.slug, lang);
        if (page) {
            res.json({ success: true, page });
        } else {
            res.status(404).json({ success: false, message: 'Seite nicht gefunden.' });
        }
    }

    async savePage(req, res) {
        let { title, content, lang } = req.body;
        
        // Sanitize content
        content = sanitizeHtml(content, sanitizeOptions);
        title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });

        await repository.savePage(req.params.slug, title, content, lang || 'de');
        
        // Audit Log
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'save_page',
            target_type: 'page',
            target_id: req.params.slug,
            details: { title, lang },
            ip: req.ip
        });

        res.json({ success: true, message: 'Seite gespeichert' });
    }

    async getAllPages(req, res) {
        const lang = req.query.lang || 'de';
        const pages = await repository.getAllPages(lang);
        res.json({ success: true, pages });
    }

    async deletePage(req, res) {
        const lang = req.query.lang || 'de';
        await repository.deletePage(req.params.slug, lang);
        
        // Audit Log
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'delete_page',
            target_type: 'page',
            target_id: `${req.params.slug} (${lang})`,
            ip: req.ip
        });

        res.json({ success: true, message: 'Seite erfolgreich gelöscht.' });
    }

    // --- News Actions ---
    async getAllNews(req, res) {
        const lang = req.query.lang || req.headers['accept-language']?.split(',')[0].split('-')[0] || 'de';
        const news = await repository.getAllNews(lang);
        res.json({ success: true, news });
    }

    async getNewsById(req, res) {
        const item = await repository.getNewsById(req.params.id);
        if (item) res.json({ success: true, item });
        else res.status(404).json({ success: false, message: 'News nicht gefunden.' });
    }

    async saveNews(req, res) {
        const data = { ...req.body };
        
        // Sanitize
        if (data.content) data.content = sanitizeHtml(data.content, sanitizeOptions);
        if (data.title) data.title = sanitizeHtml(data.title, { allowedTags: [], allowedAttributes: {} });

        await repository.saveNews(data);
        
        // Audit Log
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'save_news',
            target_type: 'news',
            target_id: req.body.id || 'new',
            details: { title: req.body.title },
            ip: req.ip
        });

        if (req.body.is_published === '1' || req.body.is_published === true) {
            await discordLogger.sendNewsNotification(req.body);
        }

        res.json({ success: true, message: 'News erfolgreich gespeichert.' });
    }

    async deleteNews(req, res) {
        await repository.deleteNews(req.params.id);
        
        // Audit Log
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'delete_news',
            target_type: 'news',
            target_id: req.params.id,
            ip: req.ip
        });

        res.json({ success: true, message: 'News erfolgreich gelöscht.' });
    }

    async getDownloads(req, res) {
        const downloads = await repository.getAllDownloads();
        res.json({ success: true, downloads });
    }

    async createDownload(req, res) {
        await repository.addDownload(req.body);
        
        // Audit Log
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'create_download',
            target_type: 'download',
            target_id: req.body.title,
            ip: req.ip
        });

        res.json({ success: true, message: 'Download erfolgreich hinzugefügt.' });
    }

    async updateDownload(req, res) {
        await repository.updateDownload(req.params.id, req.body);
        
        // Audit Log
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'update_download',
            target_type: 'download',
            target_id: req.params.id,
            ip: req.ip
        });

        res.json({ success: true, message: 'Download erfolgreich aktualisiert.' });
    }

    async deleteDownload(req, res) {
        await repository.deleteDownload(req.params.id);
        
        // Audit Log
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'delete_download',
            target_type: 'download',
            target_id: req.params.id,
            ip: req.ip
        });

        res.json({ success: true, message: 'Download erfolgreich gelöscht.' });
    }

    // Navbar
    async getNavbarLinks(req, res) {
        const links = await repository.getNavbarLinks();
        res.json({ success: true, links });
    }

    async updateNavbarLinks(req, res) {
        await repository.updateNavbarLinks(req.body.links);
        
        // Audit Log
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'update_navbar',
            target_type: 'navbar',
            target_id: 'global',
            ip: req.ip
        });

        res.json({ success: true, message: 'Navigation erfolgreich aktualisiert.' });
    }

    // Audit Logs
    async getAuditLogs(req, res) {
        const { limit, page } = req.query;
        const logs = await repository.getAuditLogs(limit || 50, page || 1);
        res.json({ success: true, logs });
    }

    // Events
    async getEvents(req, res) {
        const events = await repository.getAllEvents();
        res.json({ success: true, events });
    }

    async saveEvent(req, res) {
        await repository.saveEvent(req.body);
        
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'save_event',
            target_type: 'event',
            target_id: req.body.id || 'new',
            details: { title: req.body.title },
            ip: req.ip
        });

        res.json({ success: true, message: 'Event erfolgreich gespeichert.' });
    }

    async deleteEvent(req, res) {
        await repository.deleteEvent(req.params.id);

        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'delete_event',
            target_type: 'event',
            target_id: req.params.id,
            ip: req.ip
        });

        res.json({ success: true, message: 'Event erfolgreich gelöscht.' });
    }

    // Vouchers
    async getVouchers(req, res) {
        const vouchers = await repository.getAllVouchers();
        res.json({ success: true, vouchers });
    }

    async generateVoucher(req, res) {
        const { reward_type, reward_amount, prefix } = req.body;
        const code = (prefix || 'M2-') + Math.random().toString(36).substring(2, 10).toUpperCase();
        
        await repository.createVoucher({ code, reward_type, reward_amount });

        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'generate_voucher',
            target_type: 'voucher',
            target_id: code,
            details: { reward_type, reward_amount },
            ip: req.ip
        });

        res.json({ success: true, message: 'Gutschein generiert.', code });
    }

    async deleteVoucher(req, res) {
        await repository.deleteVoucher(req.params.id);
        res.json({ success: true, message: 'Gutschein gelöscht.' });
    }

    async redeemVoucher(req, res) {
        const { code } = req.body;
        const voucher = await repository.redeemVoucher(code, req.user.id);
        res.json({ 
            success: true, 
            message: `Gutschein erfolgreich eingelöst! Dir wurden ${voucher.reward_amount} ${voucher.reward_type} gutgeschrieben.` 
        });
    }
 
    // THEMES
    async getThemes(req, res) {
        const themes = await repository.getAllThemes();
        res.json({ success: true, themes });
    }
 
    async getActiveTheme(req, res) {
        const theme = await repository.getActiveTheme();
        res.json({ success: true, theme });
    }
 
    async saveTheme(req, res) {
        await repository.saveTheme(req.body);
        
        await auditLogger.log({
            account_id: req.user?.id || 0,
            username: req.user?.username || 'Unknown',
            action: 'save_theme',
            target_type: 'theme',
            target_id: req.body.name,
            details: req.body,
            ip: req.ip
        });

        res.json({ success: true, message: 'Theme gespeichert.' });
    }
 
    async deleteTheme(req, res) {
        await repository.deleteTheme(req.params.id);
        res.json({ success: true, message: 'Theme gelöscht.' });
    }
 
    async activateTheme(req, res) {
        await repository.activateTheme(req.params.id);
        res.json({ success: true, message: 'Theme aktiviert.' });
    }
}

module.exports = new CmsController();
