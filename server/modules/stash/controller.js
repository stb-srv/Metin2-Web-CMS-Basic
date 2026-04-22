const repository = require('./repository');

class StashController {
    async getStash(req, res) {
        try {
            const items = await repository.getStash(req.accountId);
            res.json({ success: true, items });
        } catch (err) {
            console.error("Fetch Stash Error:", err);
            res.status(500).json({ success: false, message: 'Fehler beim Laden des Zwischenspeichers.' });
        }
    }

    async getTrash(req, res) {
        try {
            const items = await repository.getTrash(req.accountId);
            res.json({ success: true, items });
        } catch (err) {
            console.error("Fetch Trash Error:", err);
            res.status(500).json({ success: false, message: 'Fehler beim Laden des Mülleimers.' });
        }
    }

    async claimItem(req, res) {
        const stash_id = req.params.id;
        const account_id = req.accountId;
        let connection;

        try {
            connection = await repository.getConnection();
            await connection.beginTransaction();

            const item = await repository.getById(stash_id, account_id, true);
            if (!item) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Item nicht im Zwischenspeicher gefunden.' });
            }

            const existingMALL = await repository.getMallItems(account_id);
            let isOccupied = new Array(90).fill(false);
            existingMALL.forEach(row => {
                let pos = row.pos;
                let size = row.size;
                for (let j = 0; j < size; j++) {
                    if (pos + (j * 5) < 90) isOccupied[pos + (j * 5)] = true;
                }
            });

            const proto = await repository.getItemProto(item.vnum);
            const claimItemSize = proto?.size || 1;

            let freePos = -1;
            for (let i = 0; i < 90; i++) {
                let canFit = true;
                for (let j = 0; j < claimItemSize; j++) {
                    let checkPos = i + (j * 5);
                    let pageStart = Math.floor(i / 45);
                    let pageEnd = Math.floor(checkPos / 45);
                    if (checkPos >= 90 || isOccupied[checkPos] || pageStart !== pageEnd) {
                        canFit = false;
                        break;
                    }
                }
                if (canFit) {
                    freePos = i;
                    break;
                }
            }

            if (freePos === -1) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Dein Ingame-Itemshop-Lager ist voll! Bitte mache erst Platz.' });
            }

            await repository.moveToMall(connection, account_id, freePos, item);
            await repository.removeFromStash(connection, stash_id);

            await connection.commit();
            res.json({ success: true, message: 'Erfolgreich in dein Ingame-Lager transferiert!' });
        } catch (err) {
            if (connection) await connection.rollback();
            console.error("Claim Stash Error:", err);
            res.status(500).json({ success: false, message: 'Systemfehler beim Einlösen.' });
        } finally {
            if (connection) connection.release();
        }
    }

    async moveToTrash(req, res) {
        try {
            const trashCount = await repository.getTrashCount(req.accountId);
            if (trashCount >= 40) {
                return res.status(400).json({ success: false, message: 'Mülleimer voll (max 40 Items). Bitte leere ihn erst.' });
            }

            const [result] = await repository.moveToTrash(req.params.id, req.accountId);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Item nicht gefunden oder bereits gelöscht.' });
            }
            res.json({ success: true, message: 'Item wurde in den Mülleimer verschoben (7 Tage Aufbewahrung).' });
        } catch (err) {
            console.error("Delete Stash Error:", err);
            res.status(500).json({ success: false, message: 'Fehler beim Löschen des Items.' });
        }
    }

    async restoreFromTrash(req, res) {
        try {
            const stashCount = await repository.getStashCount(req.accountId);
            if (stashCount >= 120) {
                return res.status(400).json({ success: false, message: 'Lager voll (max 120 Items). Bitte lösche erst Platz.' });
            }

            const [result] = await repository.restoreFromTrash(req.params.id, req.accountId);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Item nicht im Mülleimer gefunden.' });
            }
            res.json({ success: true, message: 'Item wurde aus dem Mülleimer wiederhergestellt!' });
        } catch (err) {
            console.error("Restore Stash Error:", err);
            res.status(500).json({ success: false, message: 'Fehler beim Wiederherstellen.' });
        }
    }

    async permanentDelete(req, res) {
        try {
            await repository.permanentDelete(req.params.id, req.accountId);
            res.json({ success: true, message: 'Item endgültig gelöscht.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim endgültigen Löschen.' });
        }
    }

    async bulkMoveToTrash(req, res) {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Keine IDs angegeben.' });
        }

        try {
            const trashCount = await repository.getTrashCount(req.accountId);
            const canDeleteCount = Math.max(0, 40 - trashCount);
            if (canDeleteCount < ids.length) {
                return res.status(400).json({ success: false, message: `Mülleimer-Limit erreicht! Du kannst nur noch ${canDeleteCount} Items löschen (Limit: 40).` });
            }

            const [result] = await repository.bulkMoveToTrash(ids, req.accountId);
            res.json({ success: true, message: `${result.affectedRows} Items wurden in den Mülleimer verschoben.` });
        } catch (err) {
            console.error("Bulk Delete Stash Error:", err);
            res.status(500).json({ success: false, message: 'Fehler beim Löschen der Items.' });
        }
    }

    async bulkPermanentDelete(req, res) {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: 'Keine IDs.' });

        try {
            const [result] = await repository.bulkPermanentDelete(ids, req.accountId);
            res.json({ success: true, message: `${result.affectedRows} Items endgültig gelöscht.` });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Fehler beim endgültigen Löschen.' });
        }
    }

    async adminGift(req, res) {
        if (!req.adminPermissions?.can_give_gifts) return res.status(403).json({ success: false, message: 'Fehlende Berechtigung.' });

        const { player_name, account_id, vnum } = req.body;
        if (!vnum) return res.status(400).json({ success: false, message: 'Item VNUM erforderlich.' });

        try {
            let targetAccountId = account_id;
            if (!targetAccountId && player_name) {
                targetAccountId = await repository.getAccountIdByPlayerName(player_name);
                if (!targetAccountId) return res.status(404).json({ success: false, message: 'Spieler nicht gefunden.' });
            }

            if (!targetAccountId) return res.status(400).json({ success: false, message: 'Empfänger erforderlich.' });

            const stashCount = await repository.getStashCount(targetAccountId);
            if (stashCount >= 120) {
                return res.status(400).json({ success: false, message: 'Web-Lager des Spielers ist voll (Max. 120).' });
            }

            const itemData = {
                account_id: targetAccountId,
                vnum: parseInt(req.body.vnum) || 0,
                count: parseInt(req.body.count) || 1,
                socket0: parseInt(req.body.socket0) || 0,
                socket1: parseInt(req.body.socket1) || 0,
                socket2: parseInt(req.body.socket2) || 0,
                attrtype0: parseInt(req.body.attrtype0) || 0,
                attrvalue0: parseInt(req.body.attrvalue0) || 0,
                attrtype1: parseInt(req.body.attrtype1) || 0,
                attrvalue1: parseInt(req.body.attrvalue1) || 0,
                attrtype2: parseInt(req.body.attrtype2) || 0,
                attrvalue2: parseInt(req.body.attrvalue2) || 0,
                attrtype3: parseInt(req.body.attrtype3) || 0,
                attrvalue3: parseInt(req.body.attrvalue3) || 0,
                attrtype4: parseInt(req.body.attrtype4) || 0,
                attrvalue4: parseInt(req.body.attrvalue4) || 0,
                attrtype5: parseInt(req.body.attrtype5) || 0,
                attrvalue5: parseInt(req.body.attrvalue5) || 0,
                attrtype6: parseInt(req.body.attrtype6) || 0,
                attrvalue6: parseInt(req.body.attrvalue6) || 0
            };

            await repository.addToWebStash(itemData);
            res.json({ success: true, message: 'Item wurde in das Web-Lager des Spielers gesendet.' });
        } catch (err) {
            console.error("Gift Item Error:", err);
            res.status(500).json({ success: false, message: 'Fehler beim Verschenken des Items.' });
        }
    }

    async changeStoragePassword(req, res) {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const account_id = req.accountId;

        if (!newPassword || newPassword.length !== 6 || !/^\d+$/.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'Das neue Passwort muss aus genau 6 Ziffern bestehen.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Die neuen Passwörter stimmen nicht überein.' });
        }

        try {
            await repository.ensureSafeboxExists(account_id);
            const safebox = await repository.getSafebox(account_id);

            // In Metin2, if the password was never changed, it might be '000000' or whatever is in the DB.
            // Some databases use '0' as default. We compare as strings.
            if (safebox.password !== oldPassword) {
                // Special case: if DB is '0' and user tried '000000' (or vice versa)
                const isDefault = (safebox.password === '0' || safebox.password === '000000');
                const isInputDefault = (oldPassword === '0' || oldPassword === '000000');
                
                if (!(isDefault && isInputDefault)) {
                    return res.status(400).json({ success: false, message: 'Das aktuelle Lager-Passwort ist nicht korrekt.' });
                }
            }

            const success = await repository.updateSafeboxPassword(account_id, newPassword);
            if (success) {
                res.json({ success: true, message: 'Lager-Passwort erfolgreich geändert!' });
            } else {
                res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren des Passworts.' });
            }
        } catch (err) {
            console.error("Change Storage Password Error:", err);
            res.status(500).json({ success: false, message: 'Systemfehler beim Ändern des Passworts.' });
        }
    }
}

module.exports = new StashController();
