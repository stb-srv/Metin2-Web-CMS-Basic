/**
 * Team Page — Permissions Management
 */
const TeamPage = {
    title: 'Team & Rechte',
    icon: 'fa-user-shield',
    breadcrumb: 'System &rsaquo; Team & Berechtigungen',
    _permissions: [],

    render() {
        return `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-user-shield"></i> Rollen & Berechtigungen</div>
                </div>
                <div class="admin-table-wrap">
                    <table class="admin-table">
                        <thead><tr><th>Rolle</th><th style="text-align:center;">Shop</th><th style="text-align:center;">Geschenke</th><th style="text-align:center;">Spieler</th><th style="text-align:center;">Team</th><th style="text-align:right;">Aktion</th></tr></thead>
                        <tbody id="teamTableBody"></tbody>
                    </table>
                </div>
            </div>
            <div id="teamModalSlot"></div>
        `;
    },

    init() {
        this.loadPermissions();
    },

    async loadPermissions() {
        try {
            const data = await apiFetch('/admin/core/permissions');
            const tbody = document.getElementById('teamTableBody');
            if (!data.success || !tbody) return;
            this._permissions = data.permissions;
            if (!data.permissions.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><p>Keine Rollen</p></td></tr>'; return; }
            const ck = v => v ? '<i class="fas fa-check-circle check-yes"></i>' : '<i class="fas fa-minus-circle check-no"></i>';
            tbody.innerHTML = data.permissions.map(p => `<tr>
                <td><strong style="color:#a78bfa;">${p.role_name}</strong></td>
                <td style="text-align:center;">${ck(p.can_manage_shop)}</td>
                <td style="text-align:center;">${ck(p.can_give_gifts)}</td>
                <td style="text-align:center;">${ck(p.can_manage_players)}</td>
                <td style="text-align:center;">${ck(p.can_manage_team)}</td>
                <td class="text-right"><button class="btn-admin btn-secondary btn-sm" onclick="TeamPage.editRole('${p.role_name}')"><i class="fas fa-edit"></i></button></td>
            </tr>`).join('');
        } catch (e) { console.error(e); }
    },

    editRole(roleName) {
        const p = this._permissions.find(x => x.role_name === roleName);
        if (!p) return;
        const slot = document.getElementById('teamModalSlot');
        const c = (n, v) => `<label style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;cursor:pointer;"><input type="checkbox" id="perm_${n}" ${v ? 'checked' : ''}> <span>${n.replace('can_', '').replace(/_/g, ' ')}</span></label>`;
        slot.innerHTML = `<div class="admin-modal-overlay" onclick="TeamPage.closeModal(event)"><div class="admin-modal" onclick="event.stopPropagation()">
            <div class="admin-modal-header"><div class="admin-modal-title"><i class="fas fa-edit"></i> ${roleName}</div><button class="admin-modal-close" onclick="TeamPage.closeModal()"><i class="fas fa-times"></i></button></div>
            ${c('can_manage_shop', p.can_manage_shop)}${c('can_give_gifts', p.can_give_gifts)}${c('can_manage_players', p.can_manage_players)}${c('can_manage_team', p.can_manage_team)}
            <div class="admin-modal-footer"><button class="btn-admin btn-secondary" onclick="TeamPage.closeModal()">Abbrechen</button><button class="btn-admin btn-primary" onclick="TeamPage.saveRole('${roleName}')"><i class="fas fa-save"></i> Speichern</button></div>
        </div></div>`;
    },

    closeModal(e) { if (e && e.target !== e.currentTarget) return; document.getElementById('teamModalSlot').innerHTML = ''; },

    async saveRole(roleName) {
        const g = n => document.getElementById('perm_' + n)?.checked ? 1 : 0;
        try {
            const data = await apiPost('/admin/core/permissions', { role_name: roleName, can_manage_shop: g('can_manage_shop'), can_give_gifts: g('can_give_gifts'), can_manage_players: g('can_manage_players'), can_manage_team: g('can_manage_team') });
            if (data.success) { this.closeModal(); this.loadPermissions(); showToast('Gespeichert', 'success'); }
            else showToast(data.message || 'Fehler', 'error');
        } catch (e) { showToast('Fehler', 'error'); }
    }
};

window.TeamPage = TeamPage;
