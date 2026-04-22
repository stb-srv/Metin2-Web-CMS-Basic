const repository = require('./repository');

class PlayerController {
    async searchPlayer(req, res) {
        try {
            if (!req.adminPermissions.can_manage_players) {
                return res.json({ success: true, players: [] });
            }

            const q = (req.query.q || '').trim();
            if (q.length < 2) {
                return res.json({ success: true, players: [] });
            }

            const players = await repository.searchPlayer(q);
            res.json({ success: true, players });
        } catch (err) {
            console.error('[Player] Error in searchPlayer:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler.' });
        }
    }

    async getHistory(req, res) {
        if (!req.adminPermissions.can_manage_players) return res.status(403).json({ success: false, message: 'Keine Rechte.' });
        const history = await repository.getBanHistory();
        res.json({ success: true, history });
    }

    async ban(req, res) {
        try {
            const { account_id, reason, duration_days } = req.body;

            if (!req.adminPermissions.can_manage_players) {
                return res.status(403).json({ success: false, message: 'Keine Rechte.' });
            }

            if (!account_id || isNaN(parseInt(account_id))) {
                return res.status(400).json({ success: false, message: 'Ungültige Account-ID.' });
            }

            if (!reason || reason.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'Bitte einen Grund angeben.' });
            }

            let bannedUntil = null;
            const days = parseInt(duration_days);
            if (days > 0) {
                bannedUntil = new Date();
                bannedUntil.setDate(bannedUntil.getDate() + days);
            }

            await repository.banAccount(parseInt(account_id), {
                reason: reason.trim(),
                bannedUntil,
                adminUsername: req.adminUsername,
                isPermanent: !days || days <= 0
            });

            res.json({ success: true, message: 'Account erfolgreich gebannt.' });
        } catch (err) {
            console.error('[Player] Error in ban:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler.' });
        }
    }

    async unban(req, res) {
        try {
            if (!req.adminPermissions.can_manage_players) {
                return res.status(403).json({ success: false, message: 'Keine Rechte.' });
            }

            if (!req.body.account_id || isNaN(parseInt(req.body.account_id))) {
                return res.status(400).json({ success: false, message: 'Ungültige Account-ID.' });
            }

            await repository.unbanAccount(parseInt(req.body.account_id), req.adminUsername);
            res.json({ success: true, message: 'Account entbannt.' });
        } catch (err) {
            console.error('[Player] Error in unban:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler.' });
        }
    }
}

module.exports = new PlayerController();
