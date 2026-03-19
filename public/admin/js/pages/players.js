/**
 * Players Page — Search, Ban, Unban, History
 */
const PlayersPage = {
    title: 'Spieler & Bans',
    icon: 'fa-users',
    breadcrumb: 'Verwaltung &rsaquo; Spieler & Bans',

    render() {
        return `
            <div class="admin-grid admin-grid-sidebar">
                <!-- Left: Search & Ban Form -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-search"></i> Spieler suchen & bannen</div>
                    </div>
                    <div class="search-group mb-2">
                        <i class="fas fa-search"></i>
                        <input type="text" class="admin-input" id="banSearchInput" placeholder="Spielername eingeben..." oninput="PlayersPage.search()">
                    </div>
                    <div id="banSearchResults"></div>

                    <form id="banForm" style="display:none; margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.06);" onsubmit="PlayersPage.banPlayer(event)">
                        <input type="hidden" id="banAccountId">
                        <div class="form-group">
                            <label class="form-label">Account</label>
                            <input type="text" class="admin-input" id="banAccountName" readonly style="opacity:0.6;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Dauer (Tage, 0 = Permanent)</label>
                            <input type="number" class="admin-input" id="banDuration" value="0" min="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Grund</label>
                            <textarea class="admin-textarea" id="banReason" placeholder="Grund für den Bann..." required></textarea>
                        </div>
                        <button type="submit" class="btn-admin btn-danger btn-block"><i class="fas fa-ban"></i> Account bannen</button>
                    </form>
                </div>

                <!-- Right: Ban History -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-history"></i> Bann-Historie <span class="badge badge-red" id="banCount">0</span></div>
                    </div>
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Account</th>
                                    <th>Admin</th>
                                    <th>Grund</th>
                                    <th>Bis</th>
                                    <th style="text-align:right;">Aktion</th>
                                </tr>
                            </thead>
                            <tbody id="banHistoryBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.loadHistory();
    },

    async search() {
        const q = document.getElementById('banSearchInput').value;
        const results = document.getElementById('banSearchResults');
        if (q.length < 3) { results.innerHTML = ''; return; }

        try {
            const data = await apiFetch(`/player/search?q=${encodeURIComponent(q)}`);
            if (!data.success) return;

            results.innerHTML = data.players.map(p => `
                <button type="button" class="btn-admin btn-secondary btn-block mb-1" style="text-align:left;" onclick="PlayersPage.selectPlayer(${p.account_id}, '${p.name}')">
                    <i class="fas fa-user"></i> ${p.name} <span class="text-muted text-sm">(Account: ${p.account_id})</span>
                </button>
            `).join('');
        } catch (e) { console.error(e); }
    },

    selectPlayer(accountId, name) {
        document.getElementById('banAccountId').value = accountId;
        document.getElementById('banAccountName').value = `${name} (Account ID: ${accountId})`;
        document.getElementById('banForm').style.display = 'block';
        document.getElementById('banSearchResults').innerHTML = '';
    },

    async banPlayer(e) {
        e.preventDefault();
        const payload = {
            account_id: document.getElementById('banAccountId').value,
            duration_days: parseInt(document.getElementById('banDuration').value) || 0,
            reason: document.getElementById('banReason').value
        };

        try {
            const data = await apiPost('/player/bans/account', payload);
            if (data.success) {
                showToast('Account gebannt', 'success');
                document.getElementById('banForm').style.display = 'none';
                document.getElementById('banForm').reset();
                this.loadHistory();
            } else {
                showToast(data.message || 'Fehler', 'error');
            }
        } catch (e) { showToast('Fehler', 'error'); }
    },

    async loadHistory() {
        try {
            const data = await apiFetch('/player/bans/history');
            const tbody = document.getElementById('banHistoryBody');
            const badge = document.getElementById('banCount');
            if (!data.success || !tbody) return;

            badge.textContent = data.history.length;

            if (data.history.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-check-circle"></i><p>Keine Bans vorhanden</p></td></tr>';
                return;
            }

            tbody.innerHTML = data.history.map(b => `
                <tr>
                    <td><strong>${b.account_name || 'N/A'}</strong><br><span class="text-muted text-sm">ID: ${b.account_id}</span></td>
                    <td class="text-sm">${b.admin_username}</td>
                    <td class="text-sm" style="max-width:200px;">${b.reason || '—'}</td>
                    <td>${b.banned_until ? `<span class="badge badge-red">${new Date(b.banned_until).toLocaleDateString('de-DE')}</span>` : '<span class="badge badge-red">Permanent</span>'}</td>
                    <td class="text-right">
                        <button class="btn-admin btn-success btn-sm" onclick="PlayersPage.unban(${b.account_id})"><i class="fas fa-unlock"></i> Entbannen</button>
                    </td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    },

    unban(id) {
        customConfirm('Account wirklich entbannen?', async () => {
            try {
                const data = await apiPost('/player/bans/unban', { account_id: id });
                if (data.success) { this.loadHistory(); showToast('Entbannt', 'success'); }
            } catch (e) { showToast('Fehler', 'error'); }
        });
    }
};

window.PlayersPage = PlayersPage;
