const repository = require('./repository');
const db = require('../../config/database');

class WebShopController {

    async getItems(req, res) {
        const items = await repository.getAllItems(true);
        const formatted = items.map(item => {
            if (Buffer.isBuffer(item.name)) item.name = item.name.toString('utf8');
            return item;
        });
        res.json({ success: true, items: formatted });
    }

    async getCategories(req, res) {
        const categories = await repository.getCategories();
        res.json({ success: true, categories });
    }

    async buyItem(req, res) {
        const { item_id, destination } = req.body;
        const account_id = req.accountId;
        const clamp = (val) => Math.max(-32768, Math.min(32767, parseInt(val) || 0));

        if (!item_id) return res.status(400).json({ success: false, message: 'Ungültige Kaufanfrage.' });

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { s } = db;

            const colDR = process.env.DB_COLUMN_DR || 'coins';
            const colDM = process.env.DB_COLUMN_DM || 'cash';
            const [users] = await connection.query(`SELECT ${colDR} as coins, ${colDM} as cash FROM ${s('account')}.account WHERE id = ? FOR UPDATE`, [account_id]);
            if (users.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Account nicht gefunden.' });
            }
            const user = users[0];

            const [items] = await connection.query(`SELECT * FROM ${s('website')}.shop_items WHERE id = ? AND is_active = 1`, [item_id]);
            if (items.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Item ist nicht mehr verfügbar.' });
            }
            const item = items[0];

            let cost = 0;
            let isDmPurchase = false;
            let reward = 0;

            if (item.price_marken !== null) {
                isDmPurchase = true;
                cost = item.price_marken;
                if ((user.cash || 0) < cost) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: 'Nicht genug DM vorhanden!' });
                }
                await connection.query(`UPDATE ${s('account')}.account SET ${colDM} = COALESCE(${colDM}, 0) - ? WHERE id = ?`, [cost, account_id]);
            } else if (item.price_coins !== null) {
                cost = item.price_coins;
                if (user.coins < cost) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: 'Nicht genug DR vorhanden!' });
                }
                reward = item.marken_reward !== null ? item.marken_reward : Math.floor(cost * 0.15);
                await connection.query(`UPDATE ${s('account')}.account SET ${colDR} = ${colDR} - ?, ${colDM} = COALESCE(${colDM}, 0) + ? WHERE id = ?`, [cost, reward, account_id]);
            }

            const [existingItems] = await connection.query(`
                SELECT i.pos, IFNULL(p.size, 1) as size 
                FROM ${s('player')}.item i 
                LEFT JOIN ${s('player')}.item_proto p ON i.vnum = p.vnum 
                WHERE i.owner_id = ? AND i.window = "MALL"
            `, [account_id]);

            let isOccupied = new Array(90).fill(false);
            existingItems.forEach(row => {
                let pos = row.pos;
                let size = row.size;
                for (let j = 0; j < size; j++) {
                    if (pos + (j * 5) < 90) isOccupied[pos + (j * 5)] = true;
                }
            });

            const [proto] = await connection.query(`SELECT size FROM ${s('player')}.item_proto WHERE vnum = ?`, [item.vnum]);
            const newItemSize = proto.length > 0 ? (proto[0].size || 1) : 1;

            let freePos = -1;
            if (destination !== 'WEB') {
                for (let i = 0; i < 90; i++) {
                    let canFit = true;
                    for (let j = 0; j < newItemSize; j++) {
                        let checkPos = i + (j * 5);
                        let pageStart = Math.floor(i / 45);
                        let pageEnd = Math.floor(checkPos / 45);
                        if (checkPos >= 90 || isOccupied[checkPos] || pageStart !== pageEnd) {
                            canFit = false; break;
                        }
                    }
                    if (canFit) { freePos = i; break; }
                }
            }

            if (freePos === -1) {
                const [stashCount] = await connection.query(`SELECT COUNT(*) as count FROM ${s('website')}.web_stash WHERE account_id = ? AND is_deleted = 0`, [account_id]);
                if (stashCount[0].count >= 120) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: 'Web-Lager voll!' });
                }

                const insertStashQuery = `
                    INSERT INTO ${s('website')}.web_stash (
                        account_id, vnum, count,
                        socket0, socket1, socket2,
                        attrtype0, attrvalue0, attrtype1, attrvalue1, attrtype2, attrvalue2,
                        attrtype3, attrvalue3, attrtype4, attrvalue4, attrtype5, attrvalue5, attrtype6, attrvalue6
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                await connection.query(insertStashQuery, [
                    account_id, item.vnum, item.count,
                    item.socket0 || 0, item.socket1 || 0, item.socket2 || 0,
                    item.attrtype0 || 0, clamp(item.attrvalue0), item.attrtype1 || 0, clamp(item.attrvalue1), item.attrtype2 || 0, clamp(item.attrvalue2),
                    item.attrtype3 || 0, clamp(item.attrvalue3), item.attrtype4 || 0, clamp(item.attrvalue4), item.attrtype5 || 0, clamp(item.attrvalue5), item.attrtype6 || 0, clamp(item.attrvalue6)
                ]);

                await connection.commit();
                return res.json({ success: true, message: destination === 'WEB' ? 'Im Web-Lager abgelegt.' : 'Ingame voll, im Web-Lager abgelegt.' });
            }

            const insertItemQuery = `
                INSERT INTO ${s('player')}.item (
                    owner_id, window, pos, count, vnum,
                    socket0, socket1, socket2,
                    attrtype0, attrvalue0, attrtype1, attrvalue1, attrtype2, attrvalue2,
                    attrtype3, attrvalue3, attrtype4, attrvalue4, attrtype5, attrvalue5, attrtype6, attrvalue6
                ) VALUES (?, 'MALL', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await connection.query(insertItemQuery, [
                account_id, freePos, item.count, item.vnum,
                item.socket0 || 0, item.socket1 || 0, item.socket2 || 0,
                item.attrtype0 || 0, clamp(item.attrvalue0), item.attrtype1 || 0, clamp(item.attrvalue1), item.attrtype2 || 0, clamp(item.attrvalue2),
                item.attrtype3 || 0, clamp(item.attrvalue3), item.attrtype4 || 0, clamp(item.attrvalue4), item.attrtype5 || 0, clamp(item.attrvalue5), item.attrtype6 || 0, clamp(item.attrvalue6)
            ]);

            await connection.commit();

            // Fetch new balances to return to frontend
            const [newBalances] = await connection.query(`SELECT ${colDR} as col_dr, ${colDM} as col_dm FROM ${s('account')}.account WHERE id = ?`, [account_id]);
            const balances = newBalances[0] || { col_dr: user.coins, col_dm: user.cash };

            res.json({
                success: true,
                message: 'Kauf erfolgreich!',
                new_coins: balances.col_dr,
                new_cash: balances.col_dm
            });

        } catch (err) {
            if (connection) await connection.rollback();
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }


    // Admin Methods
    async getAdminItems(req, res) {
        if (!req.adminPermissions.can_manage_shop) return res.status(403).json({ success: false, message: 'Berechtigung fehlt.' });
        const items = await repository.getAllItems(false);
        const formatted = items.map(item => {
            if (Buffer.isBuffer(item.name)) item.name = item.name.toString('utf8');
            return item;
        });
        res.json({ success: true, items: formatted });
    }

    async saveItem(req, res) {
        if (!req.adminPermissions.can_manage_shop) return res.status(403).json({ success: false, message: 'Berechtigung fehlt.' });
        const { id } = req.params;
        const data = req.body;
        if (id) {
            await repository.update(id, data);
            res.json({ success: true, message: 'Item aktualisiert.' });
        } else {
            await repository.create(data);
            res.json({ success: true, message: 'Item hinzugefügt.' });
        }
    }

    async deleteItem(req, res) {
        if (!req.adminPermissions.can_manage_shop) return res.status(403).json({ success: false, message: 'Berechtigung fehlt.' });
        await repository.delete(req.params.id);
        res.json({ success: true, message: 'Item gelöscht.' });
    }

    async getAccounts(req, res) {
        if (!req.adminPermissions.can_give_gifts && !req.adminPermissions.can_manage_players) return res.status(403).json({ success: false, message: 'Fehlende Berechtigung.' });
        const { s } = db;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;

        const [accounts] = await db.query(
            `SELECT id, login FROM ${s('account')}.account 
             ORDER BY login ASC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) as total FROM ${s('account')}.account`
        );
        res.json({ success: true, accounts, total, page, limit });
    }

    async giveDr(req, res) {
        if (!req.adminPermissions.can_give_gifts) return res.status(403).json({ success: false, message: 'Fehlende Berechtigung.' });
        const { target_account_id, amount } = req.body;
        const parsedAmount = parseInt(amount);
        if (!target_account_id || !parsedAmount || parsedAmount <= 0 || parsedAmount > 1000000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bitte gültige Account-ID und Menge (1 - 1.000.000) angeben.' 
            });
        }
        
        const { s } = db;
        const colDR = process.env.DB_COLUMN_DR || 'coins';
        await db.query(`UPDATE ${s('account')}.account SET ${colDR} = ${colDR} + ? WHERE id = ?`, [parsedAmount, target_account_id]);
        res.json({ success: true, message: `${parsedAmount} DR wurden erfolgreich gutgeschrieben!` });
    }

    async giveDm(req, res) {
        if (!req.adminPermissions.can_give_gifts) return res.status(403).json({ success: false, message: 'Fehlende Berechtigung.' });
        const { target_account_id, amount } = req.body;
        const parsedAmount = parseInt(amount);
        if (!target_account_id || !parsedAmount || parsedAmount <= 0 || parsedAmount > 1000000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bitte gültige Account-ID und Menge (1 - 1.000.000) angeben.' 
            });
        }
        
        const { s } = db;
        const colDM = process.env.DB_COLUMN_DM || 'cash';
        await db.query(`UPDATE ${s('account')}.account SET ${colDM} = COALESCE(${colDM}, 0) + ? WHERE id = ?`, [parsedAmount, target_account_id]);
        res.json({ success: true, message: `${parsedAmount} DM wurden erfolgreich gutgeschrieben!` });
    }
    async saveCategory(req, res) {
        if (!req.adminPermissions.can_manage_shop) return res.status(403).json({ success: false, message: 'Berechtigung fehlt.' });
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Kein Name angegeben.' });
        const { s } = db;
        await db.query(`INSERT INTO ${s('website')}.shop_categories (name) VALUES (?)`, [name]);
        res.json({ success: true, message: 'Kategorie erstellt.' });
    }

    async deleteCategory(req, res) {
        if (!req.adminPermissions.can_manage_shop) return res.status(403).json({ success: false, message: 'Berechtigung fehlt.' });
        const { s } = db;
        await db.query(`DELETE FROM ${s('website')}.shop_categories WHERE id = ?`, [req.params.id]);
        res.json({ success: true, message: 'Kategorie gelöscht.' });
    }

    async getCreatorHistory(req, res) {
        if (!req.adminPermissions.can_manage_shop && !req.adminPermissions.can_give_gifts) return res.status(403).json({ success: false, message: 'Fehlende Berechtigung.' });
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.item_creator_history ORDER BY created_at DESC LIMIT 50`);
        const parsedRows = rows.map(r => {
            if (typeof r.payload === 'string') {
                try { r.payload = JSON.parse(r.payload); } catch (e) { }
            }
            return r;
        });
        res.json({ success: true, history: parsedRows });
    }

    async addCreatorHistory(req, res) {
        if (!req.adminPermissions.can_manage_shop && !req.adminPermissions.can_give_gifts) return res.status(403).json({ success: false, message: 'Fehlende Berechtigung.' });
        const { name, vnum, payload, mode } = req.body;
        const { s } = db;
        const [result] = await db.query(`INSERT INTO ${s('website')}.item_creator_history (name, vnum, payload, mode) VALUES (?, ?, ?, ?)`, [name, vnum, JSON.stringify(payload), mode]);
        res.json({ success: true, insertId: result.insertId });
    }

    async deleteCreatorHistory(req, res) {
        if (!req.adminPermissions.can_manage_shop && !req.adminPermissions.can_give_gifts) return res.status(403).json({ success: false, message: 'Fehlende Berechtigung.' });
        const { s } = db;
        await db.query(`DELETE FROM ${s('website')}.item_creator_history WHERE id = ?`, [req.params.id]);
        res.json({ success: true, message: 'Aus Historie entfernt.' });
    }
}

module.exports = new WebShopController();
