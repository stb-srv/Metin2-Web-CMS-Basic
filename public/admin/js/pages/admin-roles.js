/**
 * Admin: Rollen & Berechtigungen
 * Granular Role-Based Access Control (RBAC) Management
 */

const AdminRolesPage = {
    title: 'Rollen & Rechte',
    icon: 'fa-shield-halved',
    breadcrumb: 'System &rsaquo; Rollen & Rechte',

    // All available permission keys (should match the seeder/middleware)
    PERMS: [
        { group: 'Allgemein', keys: [
            { key: 'settings.manage', label: 'Einstellungen verwalten', desc: 'CMS & Global Settings ändern' },
            { key: 'rbac.manage',     label: 'Rollen verwalten',      desc: 'Berechtigungen & Rollen anpassen' },
            { key: 'media.upload',    label: 'Medien hochladen',      desc: 'Bilder in Bibliothek hochladen' },
            { key: 'media.delete',    label: 'Medien löschen',        desc: 'Bilder endgültig entfernen' }
        ]},
        { group: 'Neuigkeiten / News', keys: [
            { key: 'news.view',       label: 'News ansehen',          desc: 'News-Liste einsehen' },
            { key: 'news.create',     label: 'News erstellen',        desc: 'Neue Artikel anlegen' },
            { key: 'news.edit',       label: 'News bearbeiten',       desc: 'Bestehende News ändern' },
            { key: 'news.delete',     label: 'News löschen',          desc: 'News-Artikel entfernen' }
        ]},
        { group: 'Content / Seiten', keys: [
            { key: 'pages.edit',      label: 'Seiten bearbeiten',     desc: 'Statische CMS-Seiten (AGB etc.)' }
        ]},
        { group: 'Spieler & Support', keys: [
            { key: 'player.manage',   label: 'Spieler verwalten',     desc: 'Suche, Bans, Entbannen' }
        ]},
        { group: 'Shop', keys: [
            { key: 'shop.manage',     label: 'Shop verwalten',        desc: 'Items & Kategorien im Web-Shop' }
        ]}
    ],

    roles: [],
    accounts: [],

    render() {
        return `
            <div class="admin-card" style="margin-bottom:1.5rem;">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-shield-halved"></i> RBAC Rollenverwaltung</div>
                </div>
                <div class="admin-card-body">
                    <p style="font-size:0.85rem; color:var(--text-muted);">
                        Hier kannst du die granularen Berechtigungen für deine Team-Mitglieder festlegen. 
                        Benutzer erhalten Rechte über die ihnen zugewiesenen Rollen.
                    </p>
                </div>
            </div>

            <!-- Role Management Grid -->
            <div id="rolesManagerGrid" class="admin-grid admin-grid-2">
                <div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">
                    <i class="fas fa-spinner fa-spin"></i> Lade Berechtigungssystem...
                </div>
            </div>

            <div class="admin-card" style="margin-top: 2rem;">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-users-cog"></i> Account-Rollenzuweisung</div>
                    <button class="btn-admin btn-primary btn-sm" onclick="AdminRolesPage.showAssignModal()">
                        <i class="fas fa-plus"></i> Rolle zuweisen
                    </button>
                </div>
                <div class="admin-card-body">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Aktuelle Rolle</th>
                                <th style="width:100px;">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="accountRolesTableBody">
                            <tr><td colspan="3">Lade Zuweisungen...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Assign Role Modal -->
            <div id="assignRoleModal" class="modal-overlay" style="display:none;">
                <div class="admin-modal" style="max-width: 400px;">
                    <div class="admin-modal-header">
                        <div class="admin-modal-title">Rolle zuweisen</div>
                        <button class="modal-close" onclick="AdminRolesPage.closeModal()">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label class="form-label">Account ID (UID)</label>
                            <input type="number" id="assignAccountId" class="admin-input" placeholder="z.B. 1234">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Rolle auswählen</label>
                            <select id="assignRoleId" class="admin-input">
                                <!-- Loaded via JS -->
                            </select>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-admin btn-secondary" onclick="AdminRolesPage.closeModal()">Abbrechen</button>
                        <button class="btn-admin btn-primary" onclick="AdminRolesPage.saveAssignment()">Speichern</button>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        this.load();
    },

    async load() {
        try {
            const data = await apiFetch('/admin/core/permissions');
            if (data.success) {
                this.roles = data.roles;
                this.accounts = data.accounts;
                this.renderRoles();
                this.renderAccounts();
            }
        } catch (e) { console.error(e); }
    },

    renderRoles() {
        const grid = document.getElementById('rolesManagerGrid');
        if (!grid) return;

        grid.innerHTML = this.roles.map(role => {
            const isSuperAdmin = role.name === 'SuperAdmin';
            
            const permsHtml = this.PERMS.map(group => `
                <div style="margin-bottom: 0.75rem;">
                    <div style="font-size: 0.7rem; text-transform:uppercase; color:var(--primary); font-weight:700; margin-bottom: 0.25rem;">${group.group}</div>
                    ${group.keys.map(p => `
                        <label style="display:flex; align-items:flex-start; gap:8px; margin-bottom:4px; cursor:${isSuperAdmin ? 'not-allowed' : 'pointer'};">
                            <input type="checkbox" 
                                data-role-id="${role.id}" 
                                data-perm="${p.key}"
                                ${role.permissions.includes(p.key) || isSuperAdmin ? 'checked' : ''}
                                ${isSuperAdmin ? 'disabled' : ''}
                                style="margin-top:2px;">
                            <div>
                                <div style="font-size:0.8rem; font-weight:600;">${p.label}</div>
                                <div style="font-size:0.65rem; color:var(--text-muted);">${p.desc}</div>
                            </div>
                        </label>
                    `).join('')}
                </div>
            `).join('');

            return `
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title">
                            <i class="fas fa-id-card-clip"></i> ${role.name}
                        </div>
                        ${isSuperAdmin ? '<span class="badge">System</span>' : `
                            <button class="btn-admin btn-primary btn-sm" onclick="AdminRolesPage.savePermissions(${role.id})">
                                <i class="fas fa-save"></i> Speichern
                            </button>
                        `}
                    </div>
                    <div class="admin-card-body">
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:1rem;">${role.description}</div>
                        <div style="display:grid; grid-template-columns: 1fr; gap:0.5rem;">
                            ${permsHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderAccounts() {
        const tbody = document.getElementById('accountRolesTableBody');
        if (!tbody) return;

        if (this.accounts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Keine aktiven Rollenzuweisungen.</td></tr>';
            return;
        }

        tbody.innerHTML = this.accounts.map(acc => `
            <tr>
                <td><strong>${acc.username}</strong> <small class="text-muted">(ID: ${acc.account_id})</small></td>
                <td><span class="badge" style="background: rgba(var(--primary-rgb),0.1); color: var(--primary);">${acc.role_name}</span></td>
                <td>
                    <button class="btn-admin btn-danger btn-sm" onclick="AdminRolesPage.removeAssignment(${acc.account_id})" title="Rolle entfernen">
                        <i class="fas fa-user-slash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async savePermissions(roleId) {
        const checkboxes = document.querySelectorAll(`input[data-role-id="${roleId}"]`);
        const permissions = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.perm);

        try {
            const data = await apiFetch('/admin/core/role-permissions', {
                method: 'POST',
                body: JSON.stringify({ role_id: roleId, permissions })
            });
            if (data.success) {
                showToast('Rollen-Berechtigungen gespeichert!', 'success');
                this.load();
            }
        } catch (e) { showToast('Fehler beim Speichern', 'error'); }
    },

    showAssignModal() {
        const select = document.getElementById('assignRoleId');
        select.innerHTML = this.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
        document.getElementById('assignRoleModal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('assignRoleModal').style.display = 'none';
    },

    async saveAssignment() {
        const account_id = document.getElementById('assignAccountId').value;
        const role_id = document.getElementById('assignRoleId').value;

        if (!account_id) return showToast('Bitte Account ID eingeben', 'error');

        try {
            const data = await apiFetch('/admin/core/account-role', {
                method: 'POST',
                body: JSON.stringify({ account_id, role_id })
            });

            if (data.success) {
                showToast('Rolle zugewiesen', 'success');
                this.closeModal();
                this.load();
            } else {
                showToast(data.message, 'error');
            }
        } catch (e) { showToast('Fehler beim Zuweisen', 'error'); }
    },

    async removeAssignment(accountId) {
        customConfirm('Rolle für diesen Account wirklich entfernen?', async () => {
            try {
                const data = await apiFetch('/admin/core/account-role', {
                    method: 'POST',
                    body: JSON.stringify({ account_id: accountId, role_id: null })
                });
                if (data.success) {
                    showToast('Rolle entfernt', 'success');
                    this.load();
                }
            } catch (e) { showToast('Fehler beim Entfernen', 'error'); }
        });
    }
};

window.AdminRolesPage = AdminRolesPage;
