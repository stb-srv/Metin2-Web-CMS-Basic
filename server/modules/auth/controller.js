const db = require('../../config/database');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('../../utils/validator');
const { hashPassword, bcryptHash } = require('../../utils/password');

class AuthController {
    async register(req, res) {
        try {
            const { username, password, email, social_id, real_name, question1, answer1 } = req.body;

            const validationError = validator.validateRegistration(req.body);
            if (validationError) {
                return res.status(400).json({ success: false, message: validationError });
            }

            const { s } = db;
            const [existing] = await db.query(`SELECT login FROM ${s('account')}.account WHERE login = ?`, [username]);
            if (existing.length > 0) {
                return res.status(409).json({ success: false, message: 'Dieser Benutzername ist bereits vergeben.' });
            }

            const hashedPassword = hashPassword(password);
            const webHash = await bcryptHash(password);
            const hashedAnswer = await bcryptHash(answer1.toLowerCase().trim());

            await db.query(`
                INSERT INTO ${s('account')}.account (login, password, web_pass_hash, email, social_id, real_name, question1, answer1, create_time, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'OK')
            `, [username, hashedPassword, webHash, email, social_id || '1234567', real_name, question1, hashedAnswer]);

            res.status(201).json({ success: true, message: 'Registrierung erfolgreich!' });
        } catch (err) {
            console.error('[Auth] Error in register:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Interner Serverfehler.' 
            });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Bitte Benutzername und Passwort eingeben.' });
        }

        const colDR = process.env.DB_COLUMN_DR || 'coins';
        const colDM = process.env.DB_COLUMN_DM || 'cash';

        const { s } = db;
        const query = `
            SELECT id, login, password as legacyPassword, web_pass_hash, status, ${colDR} as dr_balance, ${colDM} as dm_balance, email
            FROM ${s('account')}.account 
            WHERE login = ?
        `;
        const [users] = await db.query(query, [username]);

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Falscher Benutzername oder Passwort.' });
        }

        const user = users[0];
        let isMatch = false;
        let needsWebMigration = !user.web_pass_hash;
        let needsLegacyFix = user.legacyPassword && user.legacyPassword.startsWith('$2');

        // 1. Try modern Bcrypt hash first
        if (user.web_pass_hash) {
            isMatch = await bcrypt.compare(password, user.web_pass_hash);
        }

        // 2. Fallback to Legacy Field (Might be SHA1 or accidentally Bcrypt)
        if (!isMatch) {
            if (user.legacyPassword && user.legacyPassword.startsWith('$2')) {
                // Fix for previous accidental migration: legacy field contains Bcrypt
                isMatch = await bcrypt.compare(password, user.legacyPassword);
            } else {
                // Standard SHA1 check
                isMatch = (user.legacyPassword === hashPassword(password));
            }
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Falscher Benutzername oder Passwort.' });
        }

        if (user.status !== 'OK') {
            return res.status(403).json({ success: false, message: 'Dein Account ist gesperrt.' });
        }

        // --- Self-Healing & Migration ---
        try {
            const { s } = db;
            const updates = [];
            const params = [];

            if (needsWebMigration) {
                const newWebHash = await bcryptHash(password);
                updates.push('web_pass_hash = ?');
                params.push(newWebHash);
                console.log(`[Security] Account ${user.login} Web-Login migrated to Bcrypt.`);
            }

            if (needsLegacyFix) {
                const restoredLegacyHash = hashPassword(password);
                updates.push('password = ?');
                params.push(restoredLegacyHash);
                console.log(`[Security] Account ${user.login} Ingame-Password restored to SHA1.`);
            }

            if (updates.length > 0) {
                params.push(user.id);
                const query = `
                    UPDATE ${s('account')}.account 
                    SET ${updates.join(', ')} 
                    WHERE id = ?
                `;
                await db.query(query, params);
            }
        } catch (err) {
            console.error('[Security] Failed to heal/migrate password hashes:', err);
        }



        const token = jwt.sign(
            { id: user.id, username: user.login },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );

        // Set HttpOnly Cookie for security
        res.cookie('m2token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching JWT_EXPIRES default
        });

        res.json({
            success: true,
            message: 'Login erfolgreich!',
            user: {
                id: user.id,
                username: user.login,
                coins: user.dr_balance || 0,
                cash: user.dm_balance || 0,
                email: user.email
            }
        });
    }

    async logout(req, res) {
        res.clearCookie('m2token');
        res.json({ success: true, message: 'Erfolgreich abgemeldet.' });
    }

    async getMe(req, res) {
        try {
            const colDR = process.env.DB_COLUMN_DR || 'coins';
            const colDM = process.env.DB_COLUMN_DM || 'cash';
            
            const { s } = db;
            const query = `SELECT ${colDR} as dr_balance, ${colDM} as dm_balance FROM ${s('account')}.account WHERE id = ?`;
            const [users] = await db.query(query, [req.accountId]);

            if (users.length === 0) {
                return res.status(404).json({ success: false, message: 'Benutzer nicht gefunden.' });
            }

            res.json({
                success: true,
                coins: users[0].dr_balance || 0,
                cash: users[0].dm_balance || 0
            });
        } catch (err) {
            console.error('[Auth] Error in getMe:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Interner Serverfehler.' 
            });
        }
    }

    async getSettings(req, res) {
        try {
            const { s } = db;
            const [users] = await db.query(`SELECT email, social_id FROM ${s('account')}.account WHERE id = ?`, [req.accountId]);
            if (users.length === 0) return res.status(404).json({ success: false, message: 'Account nicht gefunden.' });

            const user = users[0];
            let maskedEmail = user.email;
            if (maskedEmail && maskedEmail.includes('@')) {
                const parts = maskedEmail.split('@');
                maskedEmail = parts[0][0] + '***@' + parts[1];
            }

            let maskedSocial = user.social_id || 'Nicht gesetzt';
            if (maskedSocial.length > 4) {
                maskedSocial = maskedSocial.substring(0, 3) + '****';
            }

            res.json({ success: true, maskedEmail, maskedSocial });
        } catch (err) {
            console.error('[Auth] Error in getSettings:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Interner Serverfehler.' 
            });
        }
    }

    async updatePassword(req, res) {
        try {
            const { oldPassword, newPassword, confirmNewPassword } = req.body;
            // Joi already handles basic validation, but let's keep it safe
            if (!oldPassword || !newPassword || !confirmNewPassword) {
                return res.status(400).json({ success: false, message: 'Alle Felder ausfüllen.' });
            }

            const { s } = db;
            const [users] = await db.query(`SELECT web_pass_hash, password FROM ${s('account')}.account WHERE id = ?`, [req.accountId]);
            if (users.length === 0) return res.status(404).json({ success: false, message: 'Account nicht gefunden.' });

            const { web_pass_hash, password: legacyPassword } = users[0];
            let isMatch = false;

            if (web_pass_hash) {
                isMatch = await bcrypt.compare(oldPassword, web_pass_hash);
            } else {
                isMatch = (legacyPassword === hashPassword(oldPassword));
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Altes Passwort ist inkorrekt.' });
            }

            const legacyHash = hashPassword(newPassword);
            const webHash = await bcryptHash(newPassword);
            await db.query(`UPDATE ${s('account')}.account SET password = ?, web_pass_hash = ? WHERE id = ?`, [legacyHash, webHash, req.accountId]);
            res.json({ success: true, message: 'Passwort erfolgreich geändert!' });
        } catch (err) {
            console.error('[Auth] Error in updatePassword:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Interner Serverfehler.' 
            });
        }
    }

    async updateSecurityQuestion(req, res) {
        try {
            const { password, question1, answer1 } = req.body;

            const { s } = db;
            const [users] = await db.query(`SELECT web_pass_hash, password FROM ${s('account')}.account WHERE id = ?`, [req.accountId]);
            if (users.length === 0) return res.status(404).json({ success: false, message: 'Account nicht gefunden.' });

            const { web_pass_hash, password: legacyPassword } = users[0];
            let isMatch = false;

            if (web_pass_hash) {
                isMatch = await bcrypt.compare(password, web_pass_hash);
            } else {
                isMatch = (legacyPassword === hashPassword(password));
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Passwort ist inkorrekt.' });
            }

            const hashedAnswer = await bcryptHash(answer1.toLowerCase().trim());
            await db.query(`UPDATE ${s('account')}.account SET question1 = ?, answer1 = ? WHERE id = ?`, [question1, hashedAnswer, req.accountId]);
            res.json({ success: true, message: 'Sicherheitsfrage erfolgreich aktualisiert!' });
        } catch (err) {
            console.error('[Auth] Error in updateSecurityQuestion:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Interner Serverfehler.' 
            });
        }
    }

    async updateSocialId(req, res) {
        try {
            const { currentPassword, newSocialId } = req.body;
            if (!currentPassword || !newSocialId) return res.status(400).json({ success: false, message: 'Alle Felder ausfüllen.' });
            if (!validator.isValidSocialId(newSocialId)) return res.status(400).json({ success: false, message: 'Der Löschcode muss exakt 7 Ziffern lang sein.' });

            const { s } = db;
            const [users] = await db.query(`SELECT web_pass_hash, password FROM ${s('account')}.account WHERE id = ?`, [req.accountId]);
            if (users.length === 0) return res.status(404).json({ success: false, message: 'Account nicht gefunden.' });

            const { web_pass_hash, password: legacyPassword } = users[0];
            let isMatch = false;

            if (web_pass_hash) {
                isMatch = await bcrypt.compare(currentPassword, web_pass_hash);
            } else {
                isMatch = (legacyPassword === hashPassword(currentPassword));
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Passwort ist inkorrekt.' });
            }

            await db.query(`UPDATE ${s('account')}.account SET social_id = ? WHERE id = ?`, [newSocialId, req.accountId]);
            res.json({ success: true, message: 'Löschcode erfolgreich aktualisiert!' });
        } catch (err) {
            console.error('[Auth] Error in updateSocialId:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Interner Serverfehler.' 
            });
        }
    }

    async getCharacters(req, res) {
        try {
            const { s } = db;
            const query = `
                SELECT p.id, p.name, p.job, p.level, p.exp, p.playtime, p.gold, 
                       g.name AS guild_name, pi.empire
                FROM ${s('player')}.player p
                LEFT JOIN ${s('player')}.guild_member gm ON gm.pid = p.id
                LEFT JOIN ${s('player')}.guild g ON g.id = gm.guild_id
                LEFT JOIN ${s('player')}.player_index pi ON pi.id = p.account_id
                WHERE p.account_id = ?
            `;
            const [chars] = await db.query(query, [req.accountId]);
            res.json({ success: true, characters: chars });
        } catch (err) {
            console.error('[Auth] Error in getCharacters:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Interner Serverfehler.' 
            });
        }
    }

    async unstuckCharacter(req, res) {
        const charId = req.params.id;
        const { s } = db;

        try {
            // 1. Verify ownership and get recent activity
            const [chars] = await db.query(
                `SELECT p.id, p.name, pi.empire, p.last_play 
                 FROM ${s('player')}.player p
                 JOIN ${s('player')}.player_index pi ON pi.id = p.account_id
                 WHERE p.id = ? AND p.account_id = ?`,
                [charId, req.accountId]
            );

            if (chars.length === 0) {
                return res.status(404).json({ success: false, message: 'Charakter nicht gefunden oder Zugriff verweigert.' });
            }

            const char = chars[0];

            // Saftey Check: Metin2 game server caches character data. 
            // We must ensure the character has been offline for at least 2 minutes.
            const lastPlayDate = new Date(char.last_play);
            const now = new Date();
            const diffMinutes = (now - lastPlayDate) / 1000 / 60;

            if (diffMinutes < 2) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Der Charakter ${char.name} war vor kurzem noch aktiv. Bitte logge dich aus und warte mindestens 2 Minuten, bevor du ihn entbuggst.` 
                });
            }

            const empire = char.empire;

            // Standard Metin2 coordinates for Map 1
            let x, y, mapIndex;
            if (empire === 1) { x = 469300; y = 964200; mapIndex = 1; } // Shinsoo (Red)
            else if (empire === 2) { x = 55700; y = 157900; mapIndex = 21; } // Chunjo (Yellow)
            else if (empire === 3) { x = 969600; y = 278400; mapIndex = 41; } // Jinno (Blue)
            else { x = 469300; y = 964200; mapIndex = 1; } // Fallback

            // 2. Update position and clear session-related fields (ip, dir) to prevent server overrides
            await db.query(`
                UPDATE ${s('player')}.player 
                SET x = ?, y = ?, map_index = ?, exit_x = ?, exit_y = ?, exit_map_index = ?, 
                    ip = '', dir = 0
                WHERE id = ?`,
                [x, y, mapIndex, x, y, mapIndex, charId]
            );

            res.json({ success: true, message: `Der Charakter ${char.name} wurde erfolgreich zum Marktplatz teleportiert. Bitte warte 2 Minuten, bevor du dich wieder einloggst, damit die Änderungen übernommen werden.` });
        } catch (err) {
            console.error('Unstuck error:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler beim Entbuggen.' });
        }
    }

    async forgotPassword(req, res) {
        const { username, email } = req.body;
        
        if (!username || !email) {
            return res.status(400).json({ success: false, message: 'Bitte Benutzername und E-Mail eingeben.' });
        }

        const { s } = db;
        const [users] = await db.query(`SELECT id, login, email FROM ${s('account')}.account WHERE login = ? AND email = ?`, [username, email]);
        if (users.length === 0) {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
            return res.json({ success: true, message: 'Falls die Daten stimmen, haben wir dir eine E-Mail mit einem Reset-Link gesendet.' });
        }

        const user = users[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        try {
            await db.query(
                `INSERT INTO ${s('website')}.password_reset_tokens (account_id, token, expires_at) VALUES (?, ?, ?)`,
                [user.id, token, expiresAt]
            );

            const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

            const emailService = require('../../utils/email');
            const mailRes = await emailService.sendPasswordReset(user.email, user.login, resetLink);

            if (!mailRes.success) {
                console.error('Email send failed:', mailRes.error);
            }

            res.json({ success: true, message: 'Falls die Daten stimmen, haben wir dir eine E-Mail mit einem Reset-Link gesendet.' });
        } catch (err) {
            console.error('Error generating reset token:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler.' });
        }
    }

    async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Fehlende Parameter.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Das Passwort muss mindestens 8 Zeichen lang sein.' });
        }

        try {
            const { s } = db;
            const [tokens] = await db.query(
                `SELECT account_id FROM ${s('website')}.password_reset_tokens WHERE token = ? AND expires_at > NOW()`,
                [token]
            );

            if (tokens.length === 0) {
                return res.status(400).json({ success: false, message: 'Der Link ist ungültig oder abgelaufen.' });
            }

            const accountId = tokens[0].account_id;
            const hashedNewLegacy = hashPassword(newPassword);
            const hashedNewWeb = await bcryptHash(newPassword);

            await db.query(`UPDATE ${s('account')}.account SET password = ?, web_pass_hash = ? WHERE id = ?`, [hashedNewLegacy, hashedNewWeb, accountId]);
            await db.query(`DELETE FROM ${s('website')}.password_reset_tokens WHERE account_id = ?`, [accountId]);

            res.json({ success: true, message: 'Dein Passwort wurde erfolgreich zurückgesetzt! Du kannst dich nun einloggen.' });
        } catch (err) {
            console.error('Error resetting password:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler.' });
        }
    }
}

module.exports = new AuthController();
