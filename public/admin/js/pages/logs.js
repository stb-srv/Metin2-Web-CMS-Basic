
const LogsPage = {
    render() {
        return `
            <div class="admin-header">
                <div class="admin-title">
                    <h1><i class="fas fa-history"></i> Audit Logs</h1>
                    <p>Protokoll aller administrativen Aktionen im System</p>
                </div>
                <div class="admin-actions">
                    <button class="btn-admin btn-secondary" onclick="LogsPage.loadLogs()"><i class="fas fa-sync"></i> Aktualisieren</button>
                </div>
            </div>

            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-list"></i> Letzte Aktionen</div>
                </div>
                <div class="table-responsive">
                    <table class="admin-table" id="logsTable">
                        <thead>
                            <tr>
                                <th>Zeitpunkt</th>
                                <th>Admin</th>
                                <th>Aktion</th>
                                <th>Ziel</th>
                                <th>Details</th>
                                <th>IP-Adresse</th>
                            </tr>
                        </thead>
                        <tbody id="logsList">
                            <tr>
                                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                                    <i class="fas fa-spinner fa-spin"></i> Lade Protokolle...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div id="logsPagination" class="admin-pagination" style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 0.5rem;"></div>
            </div>
        `;
    },

    async init() {
        this.currentPage = 1;
        await this.loadLogs();
    },

    async loadLogs(page = 1) {
        this.currentPage = page;
        try {
            const data = await apiFetch(`/cms/admin-logs?page=${page}&limit=50`);
            if (data.success) {
                this.renderLogs(data.logs);
            }
        } catch (err) {
            showToast('Fehler beim Laden der Logs', 'error');
        }
    },

    renderLogs(logs) {
        const list = document.getElementById('logsList');
        if (!list) return;

        if (logs.length === 0) {
            list.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Keine Einträge gefunden.</td></tr>';
            return;
        }

        list.innerHTML = logs.map(log => {
            const date = new Date(log.created_at).toLocaleString('de-DE');
            const actionClass = this.getActionClass(log.action);
            
            let details = '';
            try {
                if (log.details) {
                    const parsed = JSON.parse(log.details);
                    details = `<pre style="font-size: 0.7rem; margin: 0; max-height: 60px; overflow: auto; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 4px;">${JSON.stringify(parsed, null, 2)}</pre>`;
                }
            } catch (e) {
                details = `<span style="font-size: 0.75rem; color: var(--text-muted);">${log.details || '-'}</span>`;
            }

            return `
                <tr>
                    <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-muted);">${date}</td>
                    <td><div style="font-weight: 600;">${log.admin_username}</div><div style="font-size: 0.7rem; color: var(--text-muted);">ID: ${log.account_id}</div></td>
                    <td><span class="badge ${actionClass}" style="text-transform: uppercase; font-size: 0.7rem;">${log.action}</span></td>
                    <td><div style="font-size: 0.85rem;">${log.target_type || '-'}</div><div style="font-size: 0.7rem; color: var(--text-muted);">${log.target_id || ''}</div></td>
                    <td style="max-width: 300px;">${details}</td>
                    <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${log.ip_address || 'Unknown'}</td>
                </tr>
            `;
        }).join('');
    },

    getActionClass(action) {
        if (action.includes('delete')) return 'badge-danger';
        if (action.includes('create') || action.includes('add')) return 'badge-success';
        if (action.includes('update') || action.includes('save')) return 'badge-warning';
        return 'badge-secondary';
    }
};
