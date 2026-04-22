const repository = require('./repository');

class PlayerController {
    async searchPlayer(req, res) {
        if (!req.adminPermissions.can_manage_players) return res.json({ success: true, players: [] });
        const players = await repository.searchPlayer(req.query.q);
        res.json({ success: true, players });
    }

    async getHistory(req, res) {
        if (!req.adminPermissions.can_manage_players) return res.status(403).json({ success: false, message: 'Keine Rechte.' });
        const history = await repository.getBanHistory();
        res.json({ success: true, history });
    }

    async ban(req, res) {
        if (!req.adminPermissions.can_manage_players) return res.status(403).json({ success: false, message: 'Keine Rechte.' });
        const { account_id, reason, duration_days } = req.body;
        
        let bannedUntil = null;
        if (duration_days > 0) {
            bannedUntil = new Date();
            bannedUntil.setDate(bannedUntil.getDate() + Number(duration_days));
        }
        await repository.banAccount(account_id, {
            reason, bannedUntil, adminUsername: req.adminUsername, isPermanent: !duration_days || duration_days <= 0
        });
        res.json({ success: true, message: 'Account erfolgreich gebannt.' });
    }

    async unban(req, res) {
        if (!req.adminPermissions.can_manage_players) return res.status(403).json({ success: false, message: 'Keine Rechte.' });
        await repository.unbanAccount(req.body.account_id, req.adminUsername);
        res.json({ success: true, message: 'Account entbannt.' });
    }
}

module.exports = new PlayerController();
