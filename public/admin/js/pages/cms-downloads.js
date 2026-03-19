/**
 * CMS Downloads Page — Manage download links
 */
const CmsDownloadsPage = {
    title: 'Downloads',
    icon: 'fa-download',
    breadcrumb: 'Content &rsaquo; Downloads',
    _downloads: [],

    render() {
        return `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-download"></i> Download-Links <span class="badge badge-purple" id="dlCount">0</span></div>
                    <button class="btn-admin btn-primary btn-sm" onclick="CmsDownloadsPage.openModal()"><i class="fas fa-plus"></i> Neuer Link</button>
                </div>
                <div class="admin-table-wrap">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Titel</th>
                                <th>Beschreibung</th>
                                <th>URL</th>
                                <th>Icon</th>
                                <th style="text-align:right;">Aktion</th>
                            </tr>
                        </thead>
                        <tbody id="dlTableBody"></tbody>
                    </table>
                </div>
            </div>
            <div id="dlModalSlot"></div>
        `;
    },

    init() {
        this.loadDownloads();
    },

    async loadDownloads() {
        try {
            const data = await apiFetch('/cms/downloads');
            const tbody = document.getElementById('dlTableBody');
            const badge = document.getElementById('dlCount');
            if (!data.success || !tbody) return;

            this._downloads = data.downloads;
            badge.textContent = data.downloads.length;

            if (data.downloads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-link"></i><p>Keine Downloads</p></td></tr>';
                return;
            }

            tbody.innerHTML = data.downloads.map(dl => `
                <tr>
                    <td>${dl.display_order}</td>
                    <td><strong>${dl.title}</strong></td>
                    <td class="text-muted text-sm" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${dl.description || '—'}</td>
                    <td class="text-sm"><a href="${dl.url}" target="_blank" style="color:var(--primary);">${dl.url}</a></td>
                    <td><i class="${dl.icon}" style="color:${dl.icon_color};background:${dl.bg_color};padding:6px;border-radius:4px;"></i></td>
                    <td class="text-right">
                        <button class="btn-admin btn-secondary btn-sm" onclick="CmsDownloadsPage.openModal(${dl.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-admin btn-danger btn-sm" onclick="CmsDownloadsPage.deleteDownload(${dl.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    },

    openModal(editId = null) {
        const dl = editId ? this._downloads.find(d => d.id === editId) : null;
        const slot = document.getElementById('dlModalSlot');
        slot.innerHTML = `
            <div class="admin-modal-overlay" onclick="CmsDownloadsPage.closeModal(event)">
                <div class="admin-modal" onclick="event.stopPropagation()">
                    <div class="admin-modal-header">
                        <div class="admin-modal-title"><i class="fas fa-${dl ? 'edit' : 'plus'}"></i> ${dl ? 'Link bearbeiten' : 'Neuer Link'}</div>
                        <button class="admin-modal-close" onclick="CmsDownloadsPage.closeModal()"><i class="fas fa-times"></i></button>
                    </div>
                    <form onsubmit="CmsDownloadsPage.saveDownload(event, ${editId || 'null'})">
                        <div class="form-group">
                            <label class="form-label">Titel</label>
                            <input type="text" class="admin-input" id="dlTitle" value="${dl ? dl.title : ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Beschreibung</label>
                            <input type="text" class="admin-input" id="dlDesc" value="${dl ? (dl.description || '') : ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">URL</label>
                            <input type="text" class="admin-input" id="dlUrl" value="${dl ? dl.url : ''}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Icon Class</label>
                                <input type="text" class="admin-input" id="dlIcon" value="${dl ? dl.icon : 'fas fa-download'}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Reihenfolge</label>
                                <input type="number" class="admin-input" id="dlOrder" value="${dl ? dl.display_order : 0}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">BG Farbe</label>
                                <input type="text" class="admin-input" id="dlBgColor" value="${dl ? dl.bg_color : 'rgba(0,0,0,0.2)'}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Icon Farbe</label>
                                <input type="text" class="admin-input" id="dlIconColor" value="${dl ? dl.icon_color : 'var(--accent)'}">
                            </div>
                        </div>
                        <div class="admin-modal-footer">
                            <button type="button" class="btn-admin btn-secondary" onclick="CmsDownloadsPage.closeModal()">Abbrechen</button>
                            <button type="submit" class="btn-admin btn-primary"><i class="fas fa-save"></i> Speichern</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    closeModal(e) {
        if (e && e.target !== e.currentTarget) return;
        document.getElementById('dlModalSlot').innerHTML = '';
    },

    async saveDownload(e, editId) {
        e.preventDefault();
        const payload = {
            title: document.getElementById('dlTitle').value,
            description: document.getElementById('dlDesc').value,
            url: document.getElementById('dlUrl').value,
            icon: document.getElementById('dlIcon').value,
            bg_color: document.getElementById('dlBgColor').value,
            icon_color: document.getElementById('dlIconColor').value,
            display_order: parseInt(document.getElementById('dlOrder').value) || 0
        };

        try {
            const data = editId
                ? await apiPut(`/cms/downloads/${editId}`, payload)
                : await apiPost('/cms/downloads', payload);

            if (data.success) {
                this.closeModal();
                this.loadDownloads();
                showToast(editId ? 'Link aktualisiert' : 'Link erstellt', 'success');
            } else {
                showToast(data.message, 'error');
            }
        } catch (e) { showToast('Fehler', 'error'); }
    },

    deleteDownload(id) {
        customConfirm('Download wirklich löschen?', async () => {
            try {
                const data = await apiDelete(`/cms/downloads/${id}`);
                if (data.success) { this.loadDownloads(); showToast('Gelöscht', 'success'); }
            } catch (e) { showToast('Fehler', 'error'); }
        });
    }
};

window.CmsDownloadsPage = CmsDownloadsPage;
