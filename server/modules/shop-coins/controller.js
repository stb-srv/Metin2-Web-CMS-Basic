const repo = require('./repository');

class ShopCoinController {
    // PUBLIC: Get packages and current bonus
    async getPublicData(req, res) {
        try {
            const packages = await repo.getActivePackages();
            const bonus = await repo.getActiveBonus();
            const paypalEmail = await repo.getSetting('paypal_email');
            
            res.json({ 
                success: true, 
                packages, 
                bonus, 
                settings: { 
                    paypal_email: paypalEmail || '' 
                } 
            });
        } catch (err) {
            console.error('[ShopCoins] Error fetching public data:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // ADMIN: CRUD for Packages
    async getAllPackages(req, res) {
        try {
            const packages = await repo.getAllPackages();
            res.json({ success: true, packages });
        } catch (err) {
            console.error('[ShopCoins] Error fetching all packages:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    async createPackage(req, res) {
        try {
            const id = await repo.createPackage(req.body);
            res.json({ success: true, message: 'Paket erstellt.', id });
        } catch (err) {
            console.error('[ShopCoins] Error creating package:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    async updatePackage(req, res) {
        try {
            const { id } = req.params;
            const success = await repo.updatePackage(id, req.body);
            if (success) {
                res.json({ success: true, message: 'Paket aktualisiert.' });
            } else {
                res.status(404).json({ success: false, message: 'Paket nicht gefunden.' });
            }
        } catch (err) {
            console.error('[ShopCoins] Error updating package:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    async deletePackage(req, res) {
        try {
            const { id } = req.params;
            const success = await repo.deletePackage(id);
            if (success) {
                res.json({ success: true, message: 'Paket gelöscht.' });
            } else {
                res.status(404).json({ success: false, message: 'Paket nicht gefunden.' });
            }
        } catch (err) {
            console.error('[ShopCoins] Error deleting package:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // ADMIN: Settings Management
    async updateBonus(req, res) {
        try {
            const { percentage, expiresAt } = req.body;
            if (percentage == null) {
                return res.status(400).json({ success: false, message: 'Prozentsatz fehlt.' });
            }
            const success = await repo.updateBonus(percentage, expiresAt);
            res.json({ success: true, message: 'Promotion aktualisiert.' });
        } catch (err) {
            console.error('[ShopCoins] Error updating bonus:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    async updateSetting(req, res) {
        try {
            const { key, value } = req.body;
            if (!key) return res.status(400).json({ success: false, message: 'Key fehlt.' });
            const success = await repo.updateSetting(key, value);
            if (success) {
                res.json({ success: true, message: 'Einstellung gespeichert.' });
            } else {
                res.status(404).json({ success: false, message: 'Fehler beim Speichern.' });
            }
        } catch (err) {
            console.error('[ShopCoins] Error updating setting:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }
}

module.exports = new ShopCoinController();
