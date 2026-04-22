/**
 * Gifts Page — Items verschenken, DR/DM vergeben
 */
const GiftsPage = {
    title: 'Geschenke & Währung',
    icon: 'fa-gift',
    breadcrumb: 'Geschenke &rsaquo; Items & Währung',

    render() {
        return `
            <div class="admin-grid admin-grid-3">
                <!-- Gift Item -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-gift"></i> Item verschenken</div>
                    </div>
                    <form id="giftItemForm" onsubmit="GiftsPage.sendGiftItem(event)">
                        <div class="form-group">
                            <label class="form-label">Spielername</label>
                            <input type="text" class="admin-input" id="giftPlayer" placeholder="Charaktername" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Item suchen (Name oder VNUM)</label>
                            <div id="giftVnumPicker"></div>
                            <input type="hidden" id="giftVnum">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Menge</label>
                            <input type="number" class="admin-input" id="giftCount" value="1" min="1" required>
                        </div>
                        <button type="submit" class="btn-admin btn-primary btn-block"><i class="fas fa-paper-plane"></i> Versenden</button>
                        <div class="form-msg mt-1" id="giftItemMsg"></div>
                    </form>
                </div>

                <!-- Give DR -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-coins" style="color:var(--gold)"></i> Drachenmünzen (DR)</div>
                    </div>
                    <form id="drForm" onsubmit="GiftsPage.giveCurrency(event, 'dr')">
                        <div class="form-group">
                            <label class="form-label">Account</label>
                            <select class="admin-select" id="drAccountSelect" required>
                                <option value="">— Account wählen —</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Menge</label>
                            <input type="number" class="admin-input" id="drAmount" placeholder="z.B. 1000" required>
                        </div>
                        <button type="submit" class="btn-admin btn-primary btn-block"><i class="fas fa-plus"></i> DR vergeben</button>
                        <div class="form-msg mt-1" id="drMsg"></div>
                    </form>
                </div>

                <!-- Give DM -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-circle-notch" style="color:#c084fc"></i> Drachenmarken (DM)</div>
                    </div>
                    <form id="dmForm" onsubmit="GiftsPage.giveCurrency(event, 'dm')">
                        <div class="form-group">
                            <label class="form-label">Account</label>
                            <select class="admin-select" id="dmAccountSelect" required>
                                <option value="">— Account wählen —</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Menge</label>
                            <input type="number" class="admin-input" id="dmAmount" placeholder="z.B. 500" required>
                        </div>
                        <button type="submit" class="btn-admin btn-primary btn-block"><i class="fas fa-plus"></i> DM vergeben</button>
                        <div class="form-msg mt-1" id="dmMsg"></div>
                    </form>
                </div>
            </div>
        `;
    },

    init() {
        // Initialize ItemSearchPicker for gift VNUM
        ItemSearchPicker.create({
            containerId: 'giftVnumPicker',
            placeholder: 'Item suchen (Name oder VNUM)...',
            showIcon: true,
            onSelect: (item) => {
                document.getElementById('giftVnum').value = item.vnum;
            }
        });

        this.loadAccounts();
    },

    async loadAccounts() {
        try {
            const data = await apiFetch('/shop/admin/accounts');
            if (!data.success) return;

            const opts = '<option value="">— Account wählen —</option>' +
                data.accounts.map(a => `<option value="${a.id}">${a.login} (ID: ${a.id})</option>`).join('');

            const dr = document.getElementById('drAccountSelect');
            const dm = document.getElementById('dmAccountSelect');
            if (dr) dr.innerHTML = opts;
            if (dm) dm.innerHTML = opts;
        } catch (e) { console.error(e); }
    },

    async sendGiftItem(e) {
        e.preventDefault();
        const msg = document.getElementById('giftItemMsg');
        const payload = {
            player_name: document.getElementById('giftPlayer').value,
            vnum: parseInt(document.getElementById('giftVnum').value),
            count: parseInt(document.getElementById('giftCount').value) || 1
        };

        try {
            const data = await apiPost('/stash/admin/gift', payload);
            msg.className = `form-msg mt-1 ${data.success ? 'msg-success' : 'msg-error'}`;
            msg.textContent = data.message || (data.success ? 'Geschenk gesendet!' : 'Fehler');
            if (data.success) {
                showToast('Item wurde verschenkt!', 'success');
                document.getElementById('giftItemForm').reset();
            }
        } catch (e) {
            msg.className = 'form-msg mt-1 msg-error';
            msg.textContent = 'Netzwerkfehler';
        }
    },

    async giveCurrency(e, type) {
        e.preventDefault();
        const accId = document.getElementById(`${type}AccountSelect`).value;
        const amount = document.getElementById(`${type}Amount`).value;
        const msg = document.getElementById(`${type}Msg`);

        if (!accId || !amount) {
            msg.className = 'form-msg mt-1 msg-error';
            msg.textContent = 'Bitte alle Felder ausfüllen.';
            return;
        }

        try {
            const data = await apiPost(`/shop/admin/give-${type}`, { target_account_id: accId, amount });
            msg.className = `form-msg mt-1 ${data.success ? 'msg-success' : 'msg-error'}`;
            msg.textContent = data.message;
            if (data.success) showToast(`${type.toUpperCase()} vergeben!`, 'success');
        } catch (e) {
            msg.className = 'form-msg mt-1 msg-error';
            msg.textContent = 'Netzwerkfehler';
        }
    }
};

window.GiftsPage = GiftsPage;
