const db = require('../../config/database');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const shopRepo = require('../web-shop/repository');

class IngameMallController {
    /**
     * Autologin from game client
     * URL: /mall?aid=123&secret=abc...
     */
    async autologin(req, res) {
        const { aid, secret } = req.query;

        // 1. Check if already logged in via cookie
        const token = req.cookies.m2token;
        let accountId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
                accountId = decoded.id;
            } catch (e) {}
        }

        // 2. If new login params provided, validate them
        if (aid && secret) {
            const secretKey = "Crystal 3";
            const hash = crypto.createHash('md5').update(aid + secretKey).digest('hex');

            if (hash === secret) {
                const { s } = db;
                const [users] = await db.query(`SELECT id, login FROM ${s('account')}.account WHERE id = ?`, [aid]);
                if (users.length > 0) {
                    const user = users[0];
                    const newToken = jwt.sign(
                        { id: user.id, username: user.login },
                        process.env.JWT_SECRET || 'secret',
                        { expiresIn: '12h' }
                    );
                    res.cookie('m2token', newToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 12 * 60 * 60 * 1000
                    });
                    accountId = user.id;
                }
            } else {
                return res.status(403).send('Systemfehler: Ungültiger Sicherheitsschlüssel.');
            }
        }

        if (!accountId) {
            return res.status(401).send('Bitte logge dich über den Metin2-Client ein.');
        }

        return this._renderMall(req, res, accountId);
    }

    async _renderMall(req, res, accountId, success = false, error = null) {
        try {
            const { s } = db;
            const colDR = process.env.DB_COLUMN_DR || 'coins';
            const colDM = process.env.DB_COLUMN_DM || 'cash';

            // Fetch balances
            const [users] = await db.query(`SELECT ${colDR} as dr, ${colDM} as dm FROM ${s('account')}.account WHERE id = ?`, [accountId]);
            const user = users[0] || { dr: 0, dm: 0 };

            // Fetch items
            const items = await shopRepo.getAllItems(true);
            
            let statusHtml = '';
            if (success) statusHtml = '<div style="background:#1a5a1a; color:#99ff99; padding:10px; margin-bottom:10px; border:1px solid #339933; text-align:center;">Kauf erfolgreich! Prüfe dein Lager-Depot.</div>';
            if (error) {
                let msg = 'Ein Fehler ist aufgetreten.';
                if (error === 'not_enough_dr') msg = 'Nicht genug DR vorhanden.';
                if (error === 'not_enough_dm') msg = 'Nicht genug DM vorhanden.';
                if (error === 'mall_full') msg = 'Lager-Depot ist voll.';
                statusHtml = '<div style="background:#5a1a1a; color:#ff9999; padding:10px; margin-bottom:10px; border:1px solid #993333; text-align:center;">' + msg + '</div>';
            }

            let itemsHtml = '';
            items.forEach(item => {
                let name = Buffer.isBuffer(item.name) ? item.name.toString('utf8') : item.name;
                let priceText = item.price_coins ? item.price_coins + " DR" : (item.price_marken + " DM");
                
                itemsHtml += `
                <div style="background:#222; border:1px solid #333; margin-bottom:8px; padding:10px; overflow:hidden;">
                    <div style="width:32px; height:32px; background:#000; float:left; margin-right:15px; border:1px solid #444;">
                        <img src="/images/items/${item.vnum}.png" width="32" height="32" alt="">
                    </div>
                    <div style="float:left; width:60%;">
                        <b style="color:#eee; display:block; margin-bottom:3px;">${name} (${item.count}x)</b>
                        <span style="color:#f0c040; font-size:12px;">Preis: ${priceText}</span>
                    </div>
                    <div style="float:right;">
                        <form method="POST" action="/mall/buy">
                            <input type="hidden" name="item_id" value="${item.id}">
                            <input type="submit" value="Kaufen" style="background:#d4a017; border:1px solid #996a00; color:#000; padding:5px 12px; font-weight:bold; cursor:pointer;">
                        </form>
                    </div>
                </div>`;
            });

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Itemshop</title>
</head>
<body style="background:#1a1a1a; color:#ccc; font-family:Arial, sans-serif; margin:0; padding:10px; font-size:13px;">
    <div style="background:#2a2a2a; padding:10px; border-bottom:1px solid #444; margin-bottom:10px; overflow:hidden;">
        <h2 style="margin:0; font-size:16px; color:#f0c040; float:left;">Itemshop</h2>
        <div style="float:right; color:#fff; font-weight:bold;">
            DR: <span style="color:#f0c040; margin-left:10px;">${user.dr}</span>
            DM: <span style="color:#f0c040; margin-left:10px;">${user.dm || 0}</span>
        </div>
    </div>
    ${statusHtml}
    <div id="itemContainer">
        ${itemsHtml || '<center>Aktuell keine Angebote verfügbar.</center>'}
    </div>
</body>
</html>`;

            res.send(html);
        } catch (err) {
            console.error('[IngameMall] Render error:', err);
            res.status(500).send('Interner Serverfehler beim Laden des Shops.');
        }
    }

    async getItems(req, res) {
        // Obsolete but keeping for compatibility if anyone calls it
        try {
            const items = await shopRepo.getAllItems(true);
            const formatted = items.map(item => {
                if (Buffer.isBuffer(item.name)) item.name = item.name.toString('utf8');
                return item;
            });
            res.json({ success: true, items: formatted });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim Laden.' });
        }
    }

    async buyItem(req, res) {
        const { item_id } = req.body;
        const account_id = req.accountId;

        if (!item_id) return this._renderMall(req, res, account_id, false, 'invalid_item');

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { s } = db;

            const colDR = process.env.DB_COLUMN_DR || 'coins';
            const colDM = process.env.DB_COLUMN_DM || 'cash';
            const [users] = await connection.query(`SELECT id, ${colDR} as coins, ${colDM} as cash FROM ${s('account')}.account WHERE id = ? FOR UPDATE`, [account_id]);
            if (users.length === 0) {
                await connection.rollback();
                return this._renderMall(req, res, account_id, false, 'user_not_found');
            }
            const user = users[0];

            const [items] = await connection.query(`SELECT * FROM ${s('website')}.shop_items WHERE id = ? AND is_active = 1`, [item_id]);
            if (items.length === 0) {
                await connection.rollback();
                return this._renderMall(req, res, account_id, false, 'item_not_available');
            }
            const item = items[0];

            let cost = 0;
            if (item.price_marken !== null) {
                cost = item.price_marken;
                if ((user.cash || 0) < cost) {
                    await connection.rollback();
                    return this._renderMall(req, res, account_id, false, 'not_enough_dm');
                }
                await connection.query(`UPDATE ${s('account')}.account SET ${colDM} = COALESCE(${colDM}, 0) - ? WHERE id = ?`, [cost, account_id]);
            } else if (item.price_coins !== null) {
                cost = item.price_coins;
                if (user.coins < cost) {
                    await connection.rollback();
                    return this._renderMall(req, res, account_id, false, 'not_enough_dr');
                }
                const reward = item.marken_reward !== null ? item.marken_reward : Math.floor(cost * 0.15);
                await connection.query(`UPDATE ${s('account')}.account SET ${colDR} = ${colDR} - ?, ${colDM} = COALESCE(${colDM}, 0) + ? WHERE id = ?`, [cost, reward, account_id]);
            }

            const [existingItems] = await connection.query(`SELECT pos FROM ${s('player')}.item WHERE owner_id = ? AND window = "MALL"`, [account_id]);
            const occupied = new Set(existingItems.map(i => i.pos));
            
            let freePos = -1;
            for (let i = 0; i < 90; i++) {
                if (!occupied.has(i)) { freePos = i; break; }
            }

            if (freePos === -1) {
                await connection.rollback();
                return this._renderMall(req, res, account_id, false, 'mall_full');
            }

            const insertQuery = `
                INSERT INTO ${s('player')}.item (
                    owner_id, window, pos, count, vnum,
                    socket0, socket1, socket2,
                    attrtype0, attrvalue0, attrtype1, attrvalue1, attrtype2, attrvalue2,
                    attrtype3, attrvalue3, attrtype4, attrvalue4, attrtype5, attrvalue5, attrtype6, attrvalue6
                ) VALUES (?, 'MALL', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const clamp = (val) => Math.max(-32768, Math.min(32767, parseInt(val) || 0));
            await connection.query(insertQuery, [
                account_id, freePos, item.count, item.vnum,
                item.socket0 || 0, item.socket1 || 0, item.socket2 || 0,
                item.attrtype0 || 0, clamp(item.attrvalue0), item.attrtype1 || 0, clamp(item.attrvalue1), item.attrtype2 || 0, clamp(item.attrvalue2),
                item.attrtype3 || 0, clamp(item.attrvalue3), item.attrtype4 || 0, clamp(item.attrvalue4), item.attrtype5 || 0, clamp(item.attrvalue5), item.attrtype6 || 0, clamp(item.attrvalue6)
            ]);

            await connection.commit();
            return this._renderMall(req, res, account_id, true);

        } catch (err) {
            if (connection) await connection.rollback();
            console.error('[IngameMall] Order error:', err);
            return this._renderMall(req, res, account_id, false, 'internal');
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = new IngameMallController();
