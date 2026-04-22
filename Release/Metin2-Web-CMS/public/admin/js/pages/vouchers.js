
const VouchersPage = {
    render() {
        return `
            <div class="admin-header">
                <div class="admin-title">
                    <h1><i class="fas fa-gift"></i> Gutschein-Manager</h1>
                    <p>Erstelle und verwalte DR/DM-Codes für deine Spieler</p>
                </div>
                <div class="admin-actions">
                    <button class="btn-admin btn-primary" onclick="VouchersPage.openModal()"><i class="fas fa-plus"></i> Code generieren</button>
                </div>
            </div>

            <div class="admin-grid admin-grid-3">
                <div class="admin-card stats-card">
                    <div class="stats-label">Aktive Codes</div>
                    <div class="stats-value" id="statsActiveVouchers">-</div>
                </div>
                <div class="admin-card stats-card">
                    <div class="stats-label">Gesamt Belohnung</div>
                    <div class="stats-value" id="statsTotalRewards">-</div>
                </div>
                <div class="admin-card stats-card">
                    <div class="stats-label">Eingelöste Codes</div>
                    <div class="stats-value" id="statsUsedVouchers">-</div>
                </div>
            </div>

            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-list"></i> Gutschein-Liste</div>
                </div>
                <div class="table-responsive">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Code</th>
                                <th>Belohnung</th>
                                <th>Erstellt am</th>
                                <th>Eingelöst von</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="vouchersList">
                            <tr>
                                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                                    <i class="fas fa-spinner fa-spin"></i> Lade Gutscheine...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    async init() {
        await this.loadVouchers();
    },

    async loadVouchers() {
        try {
            const data = await apiFetch('/cms/vouchers');
            if (data.success) {
                this.renderVouchers(data.vouchers);
                this.updateStats(data.vouchers);
            }
        } catch (err) {
            showToast('Fehler beim Laden der Gutscheine', 'error');
        }
    },

    updateStats(vouchers) {
        const active = vouchers.filter(v => !v.is_used).length;
        const used = vouchers.filter(v => v.is_used).length;
        const total = vouchers.reduce((sum, v) => sum + v.reward_amount, 0);

        document.getElementById('statsActiveVouchers').textContent = active;
        document.getElementById('statsUsedVouchers').textContent = used;
        document.getElementById('statsTotalRewards').textContent = total.toLocaleString();
    },

    renderVouchers(vouchers) {
        const list = document.getElementById('vouchersList');
        if (!list) return;

        if (vouchers.length === 0) {
            list.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Keine Gutscheine vorhanden.</td></tr>';
            return;
        }

        list.innerHTML = vouchers.map(v => {
            const status = v.is_used ? '<span class="badge badge-danger">Benutzt</span>' : '<span class="badge badge-success">Gültig</span>';
            const date = new Date(v.created_at).toLocaleDateString('de-DE');
            const usedDate = v.used_at ? new Date(v.used_at).toLocaleDateString('de-DE') : '-';
            const usedBy = v.used_by_id ? `<div style="font-size: 0.8rem; font-weight: 600;">AID: ${v.used_by_id}</div><div style="font-size: 0.7rem; color: var(--text-muted);">${usedDate}</div>` : '-';

            return `
                <tr>
                    <td>${status}</td>
                    <td><code style="font-weight: 700; color: var(--primary); font-size: 1.1rem; background: rgba(var(--primary-rgb), 0.1); padding: 4px 8px; border-radius: 4px;">${v.code}</code></td>
                    <td>
                        <span style="font-weight: 600;">${v.reward_amount} ${v.reward_type}</span>
                    </td>
                    <td style="font-size: 0.85rem; color: var(--text-muted);">${date}</td>
                    <td>${usedBy}</td>
                    <td>
                        <div class="admin-table-actions">
                            <button class="btn-icon" title="Kopieren" onclick="VouchersPage.copyToClipboard('${v.code}')"><i class="fas fa-copy"></i></button>
                            ${!v.is_used ? `<button class="btn-icon btn-icon-danger" title="Löschen" onclick="VouchersPage.deleteVoucher(${v.id})"><i class="fas fa-trash"></i></button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openModal() {
        const html = `
            <form id="voucherForm">
                <div class="form-group">
                    <label class="form-label">Währung</label>
                    <select class="admin-input" name="reward_type">
                        <option value="DR">Drachenmünzen (DR)</option>
                        <option value="DM">Drachenmarken (DM)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Betrag</label>
                    <input type="number" class="admin-input" name="reward_amount" value="100" required min="1">
                </div>
                <div class="form-group">
                    <label class="form-label">Code-Präfix (Optional)</label>
                    <input type="text" class="admin-input" name="prefix" value="M2-" placeholder="z.B. EVENT-">
                </div>
            </form>
        `;

        showModal('Gutschein generieren', html, async () => {
            const form = document.getElementById('voucherForm');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const res = await apiFetch('/cms/vouchers', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                if (res.success) {
                    showToast(`Gutschein erstellt: ${res.code}`, 'success');
                    await this.loadVouchers();
                    return true;
                } else {
                    showToast(res.message, 'error');
                    return false;
                }
            } catch (err) {
                showToast('Fehler beim Generieren', 'error');
                return false;
            }
        });
    },

    async deleteVoucher(id) {
        customConfirm('Möchtest du diesen Gutschein löschen? Er kann dann nicht mehr eingelöst werden.', async () => {
            try {
                const res = await apiFetch(`/cms/vouchers/${id}`, { method: 'DELETE' });
                if (res.success) {
                    showToast(res.message, 'success');
                    await this.loadVouchers();
                }
            } catch (err) {
                showToast('Fehler beim Löschen', 'error');
            }
        }, 'Gutschein löschen');
    },

    copyToClipboard(code) {
        navigator.clipboard.writeText(code).then(() => {
            showToast('Code in Zwischenablage kopiert!', 'success');
        });
    }
};

window.VouchersPage = VouchersPage;
