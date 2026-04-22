const repo = require('./repository');

class VoteController {
    // ADMIN: Get all vote links
    async getAllLinks(req, res) {
        try {
            const links = await repo.getAllLinks();
            res.json({ success: true, links });
        } catch (err) {
            console.error('Error fetching vote links:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // ADMIN: Create vote link
    async createLink(req, res) {
        try {
            const { title, url, image_url, reward, cooldown_hours, is_active } = req.body;
            if (!title || !url || reward == null || cooldown_hours == null) {
                return res.status(400).json({ success: false, message: 'Bitte alle Pflichtfelder ausfüllen.' });
            }

            const id = await repo.createLink({ title, url, image_url, reward, cooldown_hours, is_active: is_active ? 1 : 0 });
            res.json({ success: true, message: 'Vote-Link erstellt.', id });
        } catch (err) {
            console.error('Error creating vote link:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // ADMIN: Update vote link
    async updateLink(req, res) {
        try {
            const { id } = req.params;
            const { title, url, image_url, reward, cooldown_hours, is_active } = req.body;
            
            if (!title || !url || reward == null || cooldown_hours == null) {
                return res.status(400).json({ success: false, message: 'Bitte alle Pflichtfelder ausfüllen.' });
            }

            const success = await repo.updateLink(id, { title, url, image_url, reward, cooldown_hours, is_active: is_active ? 1 : 0 });
            if (success) {
                res.json({ success: true, message: 'Vote-Link aktualisiert.' });
            } else {
                res.status(404).json({ success: false, message: 'Link nicht gefunden.' });
            }
        } catch (err) {
            console.error('Error updating vote link:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // ADMIN: Delete vote link
    async deleteLink(req, res) {
        try {
            const { id } = req.params;
            const success = await repo.deleteLink(id);
            if (success) {
                res.json({ success: true, message: 'Vote-Link gelöscht.' });
            } else {
                res.status(404).json({ success: false, message: 'Link nicht gefunden.' });
            }
        } catch (err) {
            console.error('Error deleting vote link:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // PUBLIC: Get active vote links
    async getPublicLinks(req, res) {
        try {
            const accountId = req.accountId; 
            // req.accountId is populated by user auth middleware
            const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ipAddress = rawIp.split(',')[0].trim();

            const links = await repo.getPublicLinks(accountId, ipAddress);
            res.json({ success: true, links });
        } catch (err) {
            console.error('Error fetching public vote links:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // PUBLIC: Process vote
    async processVote(req, res) {
        try {
            const accountId = req.accountId;
            const { linkId } = req.body;
            const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ipAddress = rawIp.split(',')[0].trim();

            if (!linkId) {
                return res.status(400).json({ success: false, message: 'Voting Link ID fehlt.' });
            }

            const reward = await repo.processVote(accountId, linkId, ipAddress);
            res.json({ success: true, message: `Vielen Dank für deinen Vote! Du hast ${reward} Coins erhalten.`, reward });
        } catch (err) {
            if (err.message.includes('Du hast bereits abgestimmt') || err.message.includes('nicht gefunden')) {
                return res.status(400).json({ success: false, message: err.message });
            }
            console.error('Error processing vote:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }
}

module.exports = new VoteController();
