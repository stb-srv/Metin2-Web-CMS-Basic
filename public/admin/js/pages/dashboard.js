/**
 * Dashboard Page — Quick Stats Overview
 */
const DashboardPage = {
    title: 'Dashboard',
    icon: 'fa-chart-pie',
    breadcrumb: 'Übersicht',

    render() {
        return `
            <div class="admin-grid admin-grid-4" style="margin-bottom: 1.5rem;">
                <div class="stat-card">
                    <div class="stat-icon purple"><i class="fas fa-store"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="statShopItems">—</div>
                        <div class="stat-label">Shop Items</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon gold"><i class="fas fa-users"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="statAccounts">—</div>
                        <div class="stat-label">Accounts</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fas fa-ban"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="statBans">—</div>
                        <div class="stat-label">Aktive Bans</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-download"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="statDownloads">—</div>
                        <div class="stat-label">Downloads</div>
                    </div>
                </div>
            </div>

            <div class="admin-grid admin-grid-2">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-history"></i> Letzte Aktivitäten</div>
                    </div>
                    <div id="dashboardActivity" class="activity-list" style="max-height: 300px; overflow-y: auto;">
                        <div style="padding: 1rem; text-align: center; color: var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Lade Aktivitäten...</div>
                    </div>
                </div>
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-bolt"></i> Schnellzugriff</div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                        <button class="btn-admin btn-secondary" onclick="navigateTo('web-shop')"><i class="fas fa-plus"></i> Item hinzufügen</button>
                        <button class="btn-admin btn-secondary" onclick="navigateTo('gifts')"><i class="fas fa-gift"></i> Geschenk senden</button>
                        <button class="btn-admin btn-secondary" onclick="navigateTo('players')"><i class="fas fa-search"></i> Spieler suchen</button>
                        <button class="btn-admin btn-secondary" onclick="navigateTo('cms-settings')"><i class="fas fa-cog"></i> CMS Einstellungen</button>
                        <button class="btn-admin btn-secondary" onclick="navigateTo('cms-downloads')"><i class="fas fa-download"></i> Downloads</button>
                    </div>
                    <div id="dashboardInfo" style="margin-top: 1.5rem; font-size: 0.8125rem; color: var(--text-muted); line-height: 1.8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
                        <p><i class="fas fa-server text-primary" style="width: 20px;"></i> Port: <strong>${window.location.port || '80'}</strong></p>
                        <p><i class="fas fa-clock text-primary" style="width: 20px;"></i> Stand: <strong>${new Date().toLocaleTimeString('de-DE')}</strong></p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.loadStats();
        this.loadRecentActivity();
    },

    async loadStats() {
        try {
            const data = await apiFetch('/admin/core/stats');
            if (data.success) {
                document.getElementById('statShopItems').textContent = data.stats.shop_items.toLocaleString('de-DE');
                document.getElementById('statAccounts').textContent = data.stats.accounts.toLocaleString('de-DE');
                document.getElementById('statBans').textContent = data.stats.active_bans.toLocaleString('de-DE');
                document.getElementById('statDownloads').textContent = data.stats.downloads.toLocaleString('de-DE');
            }
        } catch (e) {
            console.error('Dashboard stats error:', e);
        }
    },

    async loadRecentActivity() {
        const container = document.getElementById('dashboardActivity');
        if (!container) return;

        try {
            const data = await apiFetch('/admin/core/activity');
            if (data.success && data.activity.length > 0) {
                container.innerHTML = data.activity.map(act => {
                    let icon = 'fa-user-plus';
                    let color = 'var(--primary)';
                    let label = 'Neuer Account';
                    let desc = `<b>${act.username}</b> hat sich registriert.`;

                    if (act.type === 'ban') {
                        icon = 'fa-user-slash';
                        color = '#ef4444';
                        label = 'Account Ban';
                        desc = `<b>${act.admin_username}</b> hat ID ${act.account_id} gebannt.`;
                    }

                    const time = new Date(act.timestamp).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' });

                    return `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: ${color}; font-size: 0.85rem;">
                                <i class="fas ${icon}"></i>
                            </div>
                            <div style="flex: 1; font-size: 0.85rem;">
                                <div style="color: var(--text-main);">${desc}</div>
                                <div style="color: var(--text-muted); font-size: 0.75rem;">${label} • ${time} Uhr</div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Keine aktuellen Aktivitäten vorhanden.</div>`;
            }
        } catch (e) {
            container.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">Fehler beim Laden der Aktivitäten.</div>`;
        }
    }
};

window.DashboardPage = DashboardPage;
