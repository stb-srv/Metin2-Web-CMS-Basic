const ShopCoinsPage = {
    title: 'Coin-Pakete & Aktionen',
    icon: 'fa-coins',
    breadcrumb: 'Shop > Coins',

    render() {
        return `
            <div class="admin-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                <button class="btn-tab active" onclick="ShopCoinsPage.switchTab('packages', this)"><i class="fas fa-box-open"></i> DR-Pakete</button>
                <button class="btn-tab" onclick="ShopCoinsPage.switchTab('payments', this)"><i class="fas fa-history"></i> Offene Zahlungen <span id="pendingBadge" class="badge badge-red" style="display:none; margin-left: 5px;">0</span></button>
                <button class="btn-tab" onclick="ShopCoinsPage.switchTab('bonus', this)"><i class="fas fa-cog"></i> Einstellungen & Aktionen</button>
            </div>

            <!-- Tab: Packages -->
            <div id="tab-packages" class="tab-content active">
                <div class="admin-card">
                    <div class="admin-card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="admin-card-title"><i class="fas fa-list"></i> Alle Pakete</div>
                        <button class="btn-admin btn-primary" onclick="ShopCoinsPage.openModal()"><i class="fas fa-plus"></i> Paket hinzufügen</button>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="admin-table" id="packagesTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Menge (DR)</th>
                                    <th>Preis (EUR)</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td colspan="6" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Lade Pakete...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tab: Payments -->
            <div id="tab-payments" class="tab-content" style="display: none;">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-wallet"></i> Manuelle Zahlungen</div>
                    </div>
                    <div class="table-responsive">
                        <table class="admin-table" id="paymentsTable">
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Spieler</th>
                                    <th>Methode</th>
                                    <th>Paket / Betrag</th>
                                    <th>DR Menge</th>
                                    <th>Details (Code/Info)</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td colspan="8" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Lade Zahlungen...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tab: Bonus & Settings -->
            <div id="tab-bonus" class="tab-content" style="display: none;">
                <div class="admin-grid admin-grid-2">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <div class="admin-card-title"><i class="fas fa-percentage"></i> Globale DR-Aktion</div>
                        </div>
                        <form id="bonusForm" onsubmit="window.ShopCoinsPage.saveBonus(event)">
                            <div class="form-group">
                                <label class="form-label">DR Bonus Prozentsatz (%)</label>
                                <input type="number" class="admin-input" id="bonusPercent" value="0" min="0" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Aktion gültig bis (Optional)</label>
                                <input type="date" class="admin-input" id="bonusExpiresAt">
                            </div>
                            <div style="margin-top: 20px;">
                                <button type="submit" id="btnSaveBonus" class="btn-admin btn-primary btn-block"><i class="fas fa-save"></i> Aktion speichern</button>
                            </div>
                        </form>
                    </div>

                    <div class="admin-card">
                        <div class="admin-card-header">
                            <div class="admin-card-title"><i class="fas fa-credit-card"></i> Zahlungs-Einstellungen</div>
                        </div>
                        <form onsubmit="ShopCoinsPage.savePaymentSettings(event)">
                            <div class="form-group">
                                <label class="form-label">PayPal E-Mail (für "Geld an Freunde")</label>
                                <input type="email" class="admin-input" id="paypalEmail" value="..." required>
                            </div>
                            <div style="margin-top: 20px;">
                                <button type="submit" id="btnSavePaypal" class="btn-admin btn-secondary btn-block"><i class="fas fa-save"></i> PayPal E-Mail speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    switchTab(tabId, btn) {
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
        
        document.getElementById(`tab-${tabId}`).style.display = 'block';
        if (btn) btn.classList.add('active');

        if (tabId === 'payments') this.loadPayments();
    },

    async init() {
        window.ShopCoinsPage = this;
        await this.loadBonus();
        await this.loadPackages();
    },

    async loadBonus() {
        try {
            const res = await apiFetch('/shop-coins/public');
            if (res.success) {
                if (res.bonus) {
                    const perc = document.getElementById('bonusPercent');
                    const exp = document.getElementById('bonusExpiresAt');
                    if (perc) perc.value = res.bonus.percentage || 0;
                    if (exp && res.bonus.expires_at) {
                        exp.value = new Date(res.bonus.expires_at).toISOString().split('T')[0];
                    }
                }
                if (res.settings && res.settings.paypal_email) {
                    const email = document.getElementById('paypalEmail');
                    if (email) email.value = res.settings.paypal_email;
                }
            }
        } catch (err) {
            console.error('[ShopCoins] Load Settings Error:', err);
        }
    },

    async loadPackages() {
        const tbody = document.querySelector('#packagesTable tbody');
        if (!tbody) return;
        try {
            const data = await apiFetch('/shop-coins/admin/packages');
            if (data.success) {
                if (data.packages.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">Keine Pakete gefunden.</td></tr>';
                    return;
                }
                this.packages = data.packages;
                tbody.innerHTML = data.packages.map(pkg => `
                    <tr>
                        <td>#${pkg.id}</td>
                        <td style="font-weight: 600;">${pkg.name}</td>
                        <td style="color: var(--gold); font-weight: bold;"><i class="fas fa-coins"></i> ${pkg.dr_amount.toLocaleString()} DR</td>
                        <td>${parseFloat(pkg.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                        <td>${pkg.is_active ? '<span class="badge badge-green">Aktiv</span>' : '<span class="badge badge-red">Inaktiv</span>'}</td>
                        <td style="text-align: right;">
                            <button class="btn-admin btn-secondary btn-sm" onclick="ShopCoinsPage.edit(${pkg.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn-admin btn-danger btn-sm" onclick="ShopCoinsPage.delete(${pkg.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="6" style="color: #ef4444; padding: 20px;">Netzwerkfehler.</td></tr>';
        }
    },

    async loadPayments() {
        const tbody = document.querySelector('#paymentsTable tbody');
        const badge = document.getElementById('pendingBadge');
        if (!tbody) return;
        
        try {
            const res = await apiFetch('/shop-payments/admin/all');
            if (res.success) {
                const pendingCount = res.payments.filter(p => p.status === 'pending').length;
                if (badge) {
                    badge.innerText = pendingCount;
                    badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
                }

                if (res.payments.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">Keine Zahlungen gefunden.</td></tr>';
                    return;
                }

                tbody.innerHTML = res.payments.map(p => {
                    let statusClass = 'badge-yellow';
                    if (p.status === 'approved') statusClass = 'badge-green';
                    if (p.status === 'declined') statusClass = 'badge-red';

                    return `
                        <tr>
                            <td style="font-size: 0.85rem;">${new Date(p.created_at).toLocaleString()}</td>
                            <td style="font-weight:600;">${p.username}</td>
                            <td><span class="badge ${p.method === 'paypal' ? 'badge-blue' : 'badge-slate'}">${p.method.toUpperCase()}</span></td>
                            <td>${p.package_name || 'Paket gelöscht'} (${parseFloat(p.amount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})</td>
                            <td style="color: var(--gold); font-weight:700;">${p.coins.toLocaleString()} DR</td>
                            <td><code style="background: rgba(0,0,0,0.2); padding: 2px 5px; border-radius: 4px;">${p.details}</code></td>
                            <td><span class="badge ${statusClass}">${p.status.toUpperCase()}</span></td>
                            <td style="text-align: right;">
                                ${p.status === 'pending' ? `
                                    <button class="btn-admin btn-primary btn-sm" title="Genehmigen" onclick="ShopCoinsPage.approvePayment(${p.id})"><i class="fas fa-check"></i></button>
                                    <button class="btn-admin btn-danger btn-sm" title="Ablehnen" onclick="ShopCoinsPage.declinePayment(${p.id})"><i class="fas fa-times"></i></button>
                                ` : ''}
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        } catch (e) {
            console.error('Load Payments Error:', e);
            tbody.innerHTML = '<tr><td colspan="8" style="color: #ef4444; padding: 20px;">Fehler beim Laden der Zahlungen.</td></tr>';
        }
    },

    async approvePayment(id) {
        customConfirm('Möchtest du diese Zahlung genehmigen? Die Coins werden dem Spieler sofort gutgeschrieben.', async () => {
            try {
                const res = await apiFetch(`/shop-payments/admin/approve/${id}`, { method: 'POST' });
                if (res.success) {
                    showToast(res.message, 'success');
                    this.loadPayments();
                } else {
                    showToast(res.message, 'error');
                }
            } catch (err) {
                showToast('Netzwerkfehler', 'error');
            }
        });
    },

    async declinePayment(id) {
        customConfirm('Möchtest du diese Zahlung ablehnen?', async () => {
            try {
                const res = await apiFetch(`/shop-payments/admin/decline/${id}`, { method: 'POST' });
                if (res.success) {
                    showToast(res.message, 'success');
                    this.loadPayments();
                } else {
                    showToast(res.message, 'error');
                }
            } catch (err) {
                showToast('Netzwerkfehler', 'error');
            }
        });
    },

    async saveBonus(e) {
        if (e) e.preventDefault();
        const btn = document.getElementById('btnSaveBonus');
        const percentage = parseInt(document.getElementById('bonusPercent').value) || 0;
        const expiresAt = document.getElementById('bonusExpiresAt').value || null;
        btn.disabled = true;
        try {
            const res = await apiFetch('/shop-coins/admin/bonus', { method: 'POST', body: JSON.stringify({ percentage, expiresAt }) });
            if (res.success) showToast(res.message, 'success');
            else showToast(res.message, 'error');
        } catch (err) { showToast('Netzwerkfehler', 'error'); }
        btn.disabled = false;
    },

    async savePaymentSettings(e) {
        if (e) e.preventDefault();
        const btn = document.getElementById('btnSavePaypal');
        const paypalEmail = document.getElementById('paypalEmail').value;
        btn.disabled = true;
        try {
            const res = await apiFetch('/shop-coins/admin/settings', { 
                method: 'POST', 
                body: JSON.stringify({ key: 'paypal_email', value: paypalEmail }) 
            });
            if (res.success) showToast(res.message, 'success');
            else showToast(res.message, 'error');
        } catch (err) { showToast('Netzwerkfehler', 'error'); }
        btn.disabled = false;
    },

    openModal(existingPkg = null) {
        const title = existingPkg ? 'Paket bearbeiten' : 'Paket hinzufügen';
        const html = `
            <form id="packageForm">
                <input type="hidden" name="id" value="${existingPkg ? existingPkg.id : ''}">
                <div class="form-group">
                    <label class="form-label">Name des Pakets</label>
                    <input type="text" class="admin-input" name="name" placeholder="z.B. Kleiner DR-Beutel" value="${existingPkg ? existingPkg.name : ''}" required>
                </div>
                <div class="admin-grid admin-grid-2" style="gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Menge (DR)</label>
                        <input type="number" class="admin-input" name="dr_amount" min="1" value="${existingPkg ? existingPkg.dr_amount : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Preis (EUR)</label>
                        <input type="number" step="0.01" class="admin-input" name="price" min="0" value="${existingPkg ? existingPkg.price : ''}" required>
                    </div>
                </div>
                <div class="admin-grid admin-grid-2" style="gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Priorität (Sortierung)</label>
                        <input type="number" class="admin-input" name="sort_order" value="${existingPkg ? existingPkg.sort_order : '0'}">
                    </div>
                    <div class="form-group" style="display: flex; align-items: flex-end;">
                        <label class="admin-switch-container" style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 10px;">
                            <label class="admin-switch">
                                <input type="checkbox" name="is_active" ${!existingPkg || existingPkg.is_active ? 'checked' : ''}>
                                <span class="admin-slider"></span>
                            </label>
                            <span style="font-size: 0.9rem;">Status: Aktiv</span>
                        </label>
                    </div>
                </div>
            </form>
        `;

        showModal(title, html, async () => {
            const form = document.getElementById('packageForm');
            const formData = new FormData(form);
            const payload = {
                name: formData.get('name'),
                dr_amount: parseInt(formData.get('dr_amount')),
                price: parseFloat(formData.get('price')),
                sort_order: parseInt(formData.get('sort_order')) || 0,
                is_active: form.querySelector('[name="is_active"]').checked
            };
            const id = formData.get('id');
            try {
                let res;
                if (id) res = await apiFetch(`/shop-coins/admin/packages/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                else res = await apiFetch('/shop-coins/admin/packages', { method: 'POST', body: JSON.stringify(payload) });
                if (res.success) { showToast(res.message, 'success'); this.loadPackages(); return true; }
                else { showToast(res.message, 'error'); return false; }
            } catch (err) { showToast('Netzwerkfehler', 'error'); return false; }
        });
    },

    edit(id) {
        const pkg = this.packages.find(p => p.id === id);
        if (pkg) this.openModal(pkg);
    },

    async delete(id) {
        customConfirm('Möchtest du dieses Paket wirklich löschen?', async () => {
            try {
                const res = await apiFetch(`/shop-coins/admin/packages/${id}`, { method: 'DELETE' });
                if (res.success) { showToast('Paket gelöscht.', 'success'); this.loadPackages(); }
                else showToast(res.message, 'error');
            } catch (err) { showToast('Netzwerkfehler', 'error'); }
        });
    }
};

window.ShopCoinsPage = ShopCoinsPage;
