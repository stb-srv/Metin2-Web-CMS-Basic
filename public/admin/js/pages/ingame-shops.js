/**
 * Ingame Shops Page — NPC Shops & GM List
 */
const IngameShopsPage = {
    title: 'Ingame Shops',
    icon: 'fa-gamepad',
    breadcrumb: 'Shop &rsaquo; Ingame NPC Shops',

    render() {
        return `
            <div class="admin-grid" style="gap:1.5rem;">
                <!-- NPC Shops -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-gamepad"></i> NPC Shops</div>
                    </div>
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead><tr><th>VNUM</th><th>Name</th><th>NPC</th><th style="text-align:right;">Aktion</th></tr></thead>
                            <tbody id="ingameShopsBody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- GM List -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-crown"></i> GM-Liste</div>
                    </div>
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead><tr><th>Account</th><th>Name</th><th>IP</th><th>Rang</th><th style="text-align:right;">Aktion</th></tr></thead>
                            <tbody id="gmListBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.loadShops();
        this.loadGmList();
    },

    async loadShops() {
        const tbody = document.getElementById('ingameShopsBody');
        if (!tbody) return;
        try {
            const data = await apiFetch('/server/shops');
            if (!data.success) return;
            if (!data.shops.length) { tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><p>Keine Shops</p></td></tr>'; return; }
            tbody.innerHTML = data.shops.map(s => `<tr>
                <td><span class="badge badge-muted">${s.vnum}</span></td>
                <td><strong>${s.name}</strong></td>
                <td class="text-muted">${s.npc_vnum}</td>
                <td class="text-right">
                    <button class="btn-admin btn-secondary btn-sm" onclick="IngameShopsPage.editShop(${s.vnum})" title="Bearbeiten"><i class="fas fa-edit"></i></button>
                    <button class="btn-admin btn-danger btn-sm" onclick="IngameShopsPage.deleteShop(${s.vnum})" title="Löschen"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
        } catch (e) { console.error(e); }
    },

    deleteShop(vnum) {
        customConfirm('Diesen Shop wirklich löschen?', async () => {
            try {
                await apiDelete(`/server/shops/${vnum}`);
                this.loadShops();
                showToast('Shop gelöscht', 'success');
            } catch (e) { showToast('Fehler', 'error'); }
        });
    },

    editShop(vnum) {
        showToast('Shop-Editor wird in Kürze implementiert.', 'info');
    },

    async loadGmList() {
        const tbody = document.getElementById('gmListBody');
        if (!tbody) return;
        try {
            const data = await apiFetch('/server/gmlist');
            if (!data.success) return;
            if (!data.gmlist || !data.gmlist.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>Keine GMs</p></td></tr>'; return; }
            tbody.innerHTML = data.gmlist.map(gm => `<tr>
                <td>${gm.mAccount}</td>
                <td><strong>${gm.mName}</strong></td>
                <td class="text-muted text-sm">${gm.mContactIP}</td>
                <td><span class="badge badge-purple">${gm.mAuthority}</span></td>
                <td class="text-right">
                    <button class="btn-admin btn-danger btn-sm" onclick="IngameShopsPage.deleteGm(${gm.mID})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
        } catch (e) { console.error(e); }
    },

    deleteGm(id) {
        customConfirm('GM-Eintrag entfernen?', async () => {
            try {
                await apiDelete(`/server/gmlist/${id}`);
                this.loadGmList();
                showToast('GM entfernt', 'success');
            } catch (e) { showToast('Fehler', 'error'); }
        });
    }
};

window.IngameShopsPage = IngameShopsPage;
