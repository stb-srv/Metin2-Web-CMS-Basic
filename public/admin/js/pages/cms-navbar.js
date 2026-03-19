/**
 * Admin: CMS Navigation Manager
 * Handles the menu structure and utility link positioning.
 */

const CmsNavbarPage = {
    title: 'Navigation & Menüs',
    icon: 'fa-bars',
    breadcrumb: 'Content &rsaquo; Navigation',

    render() {
        return `
            <div class="admin-grid admin-grid-2">
                <!-- Menu Link List -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-list"></i> Menü-Struktur (Navbar)</div>
                        <button type="button" class="btn-admin btn-primary btn-sm" onclick="CmsNavbarPage.openLinkModal()"><i class="fas fa-plus"></i></button>
                    </div>
                    <div id="navLinkList" class="nav-links-sortable" style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="text-align:center; padding:10px; color:var(--text-muted);">Lade Links...</div>
                    </div>
                </div>

                <!-- Navigation Layout Settings -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-arrows-alt"></i> Modul-Links Positionierung</div>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.5rem;">Spezielle Utility-Links flexibel platzieren:</p>
                    
                    <form id="cmsNavForm" onsubmit="CmsNavbarPage.savePositions(event)">
                        <div class="form-group">
                            <label class="form-label">Vote4Coins</label>
                            <select class="admin-select" id="navVotePos" name="nav_vote_pos">
                                <option value="navbar">Navbar (Standard)</option>
                                <option value="account">Account-Menü</option>
                                <option value="hidden">Versteckt</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Web-Lager</label>
                            <select class="admin-select" id="navStashPos" name="nav_stash_pos">
                                <option value="navbar">Navbar (Standard)</option>
                                <option value="account">Account-Menü</option>
                                <option value="hidden">Versteckt</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Support</label>
                            <select class="admin-select" id="navSupportPos" name="nav_support_pos">
                                <option value="navbar">Navbar (Standard)</option>
                                <option value="account">Account-Menü</option>
                                <option value="hidden">Versteckt</option>
                            </select>
                        </div>
                        <div style="margin-top: 1.5rem;">
                            <button type="submit" class="btn-admin btn-primary"><i class="fas fa-save"></i> Positionen speichern</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    init() {
        this.loadNavLinks();
        this.loadPositions();
    },

    async loadNavLinks() {
        const list = document.getElementById('navLinkList');
        if (!list) return;

        try {
            const data = await apiFetch('/cms/navbar');
            if (data.success) {
                const parents = data.links.filter(l => !l.parent_id);
                let html = '';
                
                parents.forEach(parent => {
                    html += this.renderNavLinkItem(parent);
                    const children = data.links.filter(l => l.parent_id === parent.id);
                    children.forEach(child => {
                        html += this.renderNavLinkItem(child, true);
                    });
                });

                list.innerHTML = html || '<div style="text-align:center; padding:10px; color:var(--text-muted);">Keine Links vorhanden.</div>';
            }
        } catch (e) {
            list.innerHTML = '<div style="color:var(--danger); padding:10px;">Fehler beim Laden.</div>';
        }
    },

    renderNavLinkItem(link, isChild = false) {
        return `
            <div class="nav-link-item" style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-left: ${isChild ? '30px' : '0'}; margin-top: 5px;">
                <i class="fas fa-grip-lines" style="color: var(--text-muted); cursor: grab;"></i>
                <i class="${link.icon || 'fas fa-link'}" style="width: 20px; text-align: center;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 0.9rem;">${link.label} ${isChild ? '<span style="font-size: 0.7rem; opacity: 0.5; font-weight: 400;">(Child)</span>' : ''}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${link.url}</div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button type="button" class="btn-admin btn-secondary btn-sm" onclick="CmsNavbarPage.openLinkModal(${JSON.stringify(link).replace(/"/g, '&quot;')})"><i class="fas fa-edit"></i></button>
                    <button type="button" class="btn-admin btn-danger btn-sm" onclick="CmsNavbarPage.deleteNavLink(${link.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    },

    async loadPositions() {
        try {
            const data = await apiFetch('/cms/settings/admin');
            if (data.success) {
                const s = data.settings;
                if (document.getElementById('navVotePos')) document.getElementById('navVotePos').value = s.nav_vote_pos || 'navbar';
                if (document.getElementById('navStashPos')) document.getElementById('navStashPos').value = s.nav_stash_pos || 'navbar';
                if (document.getElementById('navSupportPos')) document.getElementById('navSupportPos').value = s.nav_support_pos || 'navbar';
            }
        } catch (e) { console.error(e); }
    },

    async savePositions(e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem('m2token');
            const form = document.getElementById('cmsNavForm');
            const data = {
                nav_vote_pos: form.nav_vote_pos.value,
                nav_stash_pos: form.nav_stash_pos.value,
                nav_support_pos: form.nav_support_pos.value
            };

            const res = await fetch('/api/cms/settings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(data).toString()
            });

            const resData = await res.json();
            if (resData.success) {
                showToast('Positionen gespeichert!', 'success');
            } else {
                showToast(resData.message || 'Fehler beim Speichern', 'error');
            }
        } catch (err) {
            showToast('Fehler beim Speichern', 'error');
        }
    },

    openLinkModal(link = null) {
        const isEdit = !!link;
        const modalHtml = `
            <div id="linkModal" class="admin-modal-overlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <h3><i class="fas ${isEdit ? 'fa-edit' : 'fa-plus'}"></i> ${isEdit ? 'Link bearbeiten' : 'Neuer Link'}</h3>
                        <button class="modal-close" onclick="document.getElementById('linkModal').remove()">&times;</button>
                    </div>
                    <form onsubmit="CmsNavbarPage.saveNavLink(event, ${link ? link.id : 'null'})">
                        <div class="form-group">
                            <label class="form-label">Label (Anzeigename)</label>
                            <input type="text" class="admin-input" name="label" value="${link?.label || ''}" required placeholder="z.B. Forum">
                        </div>
                        <div class="form-group">
                            <label class="form-label">URL / Route</label>
                            <input type="text" class="admin-input" name="url" value="${link?.url || ''}" required placeholder="/forum oder https://... (Nutze # für Kategorien)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Eltern-Element (Parent)</label>
                            <select class="admin-select" name="parent_id" id="parentLinkSelect">
                                <option value="">Keines (Hauptmenü)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Icon (FontAwesome)</label>
                            <div style="display:flex; gap:10px;">
                                <input type="text" class="admin-input" name="icon" id="linkIconInput" value="${link?.icon || 'fas fa-link'}" oninput="document.getElementById('iconPreview').className = this.value">
                                <div style="width:40px; height:38px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05); border-radius:4px;">
                                    <i id="iconPreview" class="${link?.icon || 'fas fa-link'}"></i>
                                </div>
                            </div>
                        </div>
                        <div class="admin-modal-footer">
                            <button type="button" class="btn-admin btn-secondary" onclick="document.getElementById('linkModal').remove()">Abbrechen</button>
                            <button type="submit" class="btn-admin btn-primary">${isEdit ? 'Speichern' : 'Hinzufügen'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.loadParentOptions(link?.parent_id);
    },

    async loadParentOptions(selectedId = null) {
        const select = document.getElementById('parentLinkSelect');
        if (!select) return;
        try {
            const data = await apiFetch('/cms/navbar');
            if (data.success) {
                const parents = data.links.filter(l => !l.parent_id);
                parents.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = p.label;
                    if (p.id == selectedId) opt.selected = true;
                    select.appendChild(opt);
                });
            }
        } catch (e) {}
    },

    async saveNavLink(e, id) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const url = id ? `/cms/navbar/${id}` : '/cms/navbar';
            const method = id ? 'PUT' : 'POST';
            
            const res = await apiFetch(url, {
                method: method,
                body: JSON.stringify(data)
            });

            if (res.success) {
                showToast(res.message, 'success');
                document.getElementById('linkModal').remove();
                this.loadNavLinks();
            } else {
                showToast(res.message, 'error');
            }
        } catch (e) {
            showToast('Verbindungsfehler', 'error');
        }
    },

    async deleteNavLink(id) {
        if (await customConfirm('Link wirklich löschen?', 'Dieser Schritt kann nicht rückgängig gemacht werden.')) {
            try {
                const res = await apiFetch(`/cms/navbar/${id}`, { method: 'DELETE' });
                if (res.success) {
                    showToast(res.message, 'success');
                    this.loadNavLinks();
                } else {
                    showToast(res.message, 'error');
                }
            } catch (e) {
                showToast('Verbindungsfehler', 'error');
            }
        }
    }
};

window.CmsNavbarPage = CmsNavbarPage;
