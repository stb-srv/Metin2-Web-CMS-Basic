const nodemailer = require('nodemailer');
const logger = require('./logger');
const db = require('../config/database');

class EmailService {
    async getSettings() {
        const { s } = db;
        const [rows] = await db.query(`SELECT setting_key, setting_value FROM ${s('website')}.site_settings WHERE setting_key LIKE "smtp_%"`);
        const config = {};
        rows.forEach(r => config[r.setting_key] = r.setting_value);
        return config;
    }

    async getTransporter() {
        // Read config from DB
        const config = await this.getSettings();

        const user = config['smtp_user'] || process.env.SMTP_USER;
        const pass = config['smtp_pass'] || process.env.SMTP_PASS;
        const host = config['smtp_host'] || process.env.SMTP_HOST;
        const port = config['smtp_port'] || process.env.SMTP_PORT || 587;
        const secureStr = config['smtp_secure'] || process.env.SMTP_SECURE;
        const secure = secureStr === 'true' || port == 465;
        const from = config['smtp_from'] || process.env.SMTP_FROM || `"Metin2 Web" <${user}>`;

        if (!host || !user || !pass) {
            return null; // Signals missing credentials
        }

        return {
            transporter: nodemailer.createTransport({
                host,
                port,
                secure,
                auth: { user, pass }
            }),
            from
        };
    }

    async sendMail({ to, subject, html, text }) {
        let tpConfig;
        try {
            tpConfig = await this.getTransporter();
        } catch (e) {
            logger.error('[EmailService] Error fetching SMTP config from DB:', e.message);
        }

        if (!tpConfig || !tpConfig.transporter) {
            logger.info(`[EmailService] (Simulated Mail to ${to}) Subject: ${subject}`);
            logger.info(`[EmailService] Content: \n${text || html}`);
            return { success: true, simulated: true };
        }

        try {
            const info = await tpConfig.transporter.sendMail({
                from: tpConfig.from,
                to,
                subject,
                text,
                html
            });
            logger.info(`[EmailService] Mail sent to ${to}. MessageId: ${info.messageId}`);
            return { success: true, simulated: false };
        } catch (error) {
            logger.error(`[EmailService] Error sending mail to ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    async sendPasswordReset(toEmail, username, resetLink) {
        const subject = 'Passwort zurücksetzen - Metin2 Web';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0000; color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #330000;">
                <h2 style="color: #ff4d4d; text-align: center;">Passwort zurücksetzen</h2>
                <p>Hallo ${username},</p>
                <p>Wir haben eine Anfrage zum Zurücksetzen deines Passworts erhalten.</p>
                <p>Klicke auf den folgenden Button, um ein neues Passwort zu vergeben:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background: #cc0000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #ff4d4d;">Passwort zurücksetzen</a>
                </div>
                <p>Sollte der Button nicht funktionieren, kopiere diesen Link in deinen Browser:</p>
                <p style="word-break: break-all; color: #9ca3af;"><a href="${resetLink}" style="color: #ff4d4d;">${resetLink}</a></p>
                <br>
                <p>Dieser Link ist für 1 Stunde gültig.</p>
                <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
                <hr style="border: none; border-top: 1px solid #1e293b; margin-top: 30px;">
                <p style="text-align: center; color: #64748b; font-size: 12px;">Dein Metin2 Server Team</p>
            </div>
        `;
        const text = `Hallo ${username},\n\nKlicke auf diesen Link, um dein Passwort zurückzusetzen: ${resetLink}\n\nDieser Link ist 1 Stunde gültig.`;

        return this.sendMail({ to: toEmail, subject, html, text });
    }
}

module.exports = new EmailService();
