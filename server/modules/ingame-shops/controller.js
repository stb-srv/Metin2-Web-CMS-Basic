const repository = require('./repository');

class IngameShopsController {
    async getShops(req, res) {
        try {
            const shops = await repository.getAllShops();
            const items = await repository.getShopItems();
            const shopMap = {};
            shops.forEach(s => shopMap[s.vnum] = { ...s, items: [] });
            items.forEach(i => {
                if (shopMap[i.shop_vnum]) {
                    shopMap[i.shop_vnum].items.push({
                        item_vnum: i.item_vnum, count: i.count, size: i.size, type: i.type
                    });
                }
            });
            res.json({ success: true, shops: Object.values(shopMap) });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim Laden der Shops.' });
        }
    }

    async createShop(req, res) {
        try {
            await repository.addShop(req.body);
            res.json({ success: true, message: 'Shop erfolgreich erstellt.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim Erstellen.' });
        }
    }

    async deleteShop(req, res) {
        try {
            await repository.deleteShop(req.params.vnum);
            res.json({ success: true, message: 'Shop erfolgreich gelöscht.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim Löschen.' });
        }
    }

    async updateShopItems(req, res) {
        try {
            await repository.updateShopItems(req.params.vnum, req.body.items);
            res.json({ success: true, message: 'Shop-Inventar gespeichert!' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim Speichern der Items.' });
        }
    }

    async searchItems(req, res) {
        try {
            const query = req.query.q;
            if (!query || query.length < 2) return res.json({ success: true, items: [] });
            let items = await repository.searchItems(query);
            items = items.map(item => ({
                vnum: item.vnum,
                name: item.name ? item.name.toString('utf8') : 'Unbekanntes Item'
            }));
            res.json({ success: true, items });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler bei der Item-Suche.' });
        }
    }

    // GM List Controller
    async getGmList(req, res) {
        try {
            const gmlist = await repository.getGms();
            res.json({ success: true, gmlist });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim Laden der GM-Liste.' });
        }
    }

    async saveGm(req, res) {
        try {
            await repository.addOrUpdateGm(req.body);
            res.json({ success: true, message: 'Game Master Status erfolgreich aktualisiert.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim Speichern.' });
        }
    }

    async deleteGm(req, res) {
        try {
            await repository.deleteGm(req.params.id);
            res.json({ success: true, message: 'Game Master Eintrag gelöscht.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim Löschen.' });
        }
    }
}

module.exports = new IngameShopsController();
