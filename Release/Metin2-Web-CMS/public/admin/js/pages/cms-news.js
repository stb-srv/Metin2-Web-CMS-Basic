/**
 * Admin: CMS News Manager
 * Handles updates and news feed. Uses TinyMCE for WYSIWYG editing.
 */

const CmsNewsPage = {
    title: 'Neuigkeiten',
    icon: 'fa-newspaper',
    breadcrumb: 'Content &rsaquo; Neuigkeiten',
    news: [],

    render() {
        return `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-newspaper"></i> News &amp; Updates</div>
                    <div style="display:flex; gap:12px;">
                        <select class="admin-input" id="cmsNewsLangFilter" style="width:140px;" onchange="CmsNewsPage.load()">
                            <option value="de">Deutsch</option>
                            <option value="en">English</option>
                            <option value="ro">Română</option>
                            <option value="tr">Türkçe</option>
                            <option value="it">Italiano</option>
                        </select>
                        <button class="btn-admin btn-primary" onclick="CmsNewsPage.showEditor()">
                            <i class="fas fa-plus"></i> Artikel erstellen
                        </button>
                    </div>
                </div>
                <div class="admin-card-body">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Titel</th>
                                <th>Kategorie</th>
                                <th>Datum</th>
                                <th>Status</th>
                                <th style="width:150px;">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="cmsNewsTableBody">
                            <tr><td colspan="5">Lade News...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="newsEditorModal" class="modal-overlay" style="display:none;">
                <div class="admin-modal" style="max-width: 1200px; width: 95%; max-height: 95vh; overflow-y: auto; margin: auto;">
                    <div class="admin-modal-header" style="position: sticky; top: 0; z-index: 10; background: var(--glass-bg); backdrop-filter: blur(8px);">
                        <div class="admin-modal-title" id="newsEditorTitle">Artikel erstellen</div>
                        <button class="modal-close" onclick="CmsNewsPage.closeEditor()">&times;</button>
                    </div>
                    <form id="newsEditorForm" onsubmit="CmsNewsPage.save(event)" style="padding: 1.5rem;">
                        <input type="hidden" id="editNewsId">
                        <div class="admin-grid admin-grid-2" style="margin-bottom: 1rem;">
                            <div class="form-group">
                                <label class="form-label">Titel</label>
                                <input type="text" class="admin-input" id="editNewsTitle" required placeholder="z.B. Wartungsarbeiten">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Kategorie</label>
                                <select class="admin-input" id="editNewsCategory">
                                    <option value="Update">Update</option>
                                    <option value="Event">Event</option>
                                    <option value="Wartung">Wartung</option>
                                    <option value="Shop">Shop</option>
                                    <option value="Ankündigung">Ankündigung</option>
                                </select>
                            </div>
                        </div>
                        <div class="admin-grid admin-grid-2" style="margin-bottom: 1rem;">
                            <div class="form-group">
                                <label class="form-label">Beitragsbild</label>
                                <div style="display:flex; gap:8px;">
                                    <input type="text" class="admin-input" id="editNewsImage" placeholder="https://..." style="flex:1;">
                                    <button type="button" class="btn-admin btn-secondary" onclick="MediaPicker.open(url => document.getElementById('editNewsImage').value = url)">
                                        <i class="fas fa-folder-open"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Sprache</label>
                                <select class="admin-input" id="editNewsLang">
                                    <option value="de">Deutsch</option>
                                    <option value="en">English</option>
                                    <option value="ro">Română</option>
                                    <option value="tr">Türkçe</option>
                                    <option value="it">Italiano</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Inhalt</label>
                            <div id="newsEditorWrapper" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                                <textarea id="newsTinyEditor"></textarea>
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 0.75rem;">
                            <label class="flex-center" style="gap:10px; cursor:pointer;">
                                <input type="checkbox" id="editNewsPublished" checked> Veröffentlicht
                            </label>
                        </div>
                        <div class="admin-modal-footer" style="padding: 1rem 0 0; border-top: 1px solid var(--glass-border); margin-top: 1rem; display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap;">
                            <button type="button" class="btn-admin btn-secondary" onclick="CmsNewsPage.closeEditor()">Abbrechen</button>
                            <button type="submit" class="btn-admin btn-primary"><i class="fas fa-save"></i> Speichern</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    async init() {
        this.load();
    },

    async load() {
        try {
            const lang = document.getElementById('cmsNewsLangFilter')?.value || 'de';
            const data = await apiFetch(`/cms/news/all?lang=${lang}`);
            if (data.success) {
                this.news = data.news;
                this.renderTable();
            }
        } catch (e) { console.error(e); }
    },

    renderTable() {
        const tbody = document.getElementById('cmsNewsTableBody');
        if (!tbody) return;

        if (this.news.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Keine News vorhanden.</td></tr>';
            return;
        }

        tbody.innerHTML = this.news.map(n => `
            <tr>
                <td><strong>${n.title}</strong></td>
                <td><span class="badge">${n.category}</span></td>
                <td>${new Date(n.created_at).toLocaleDateString('de-DE')}</td>
                <td>${n.is_published ? '<span class="text-success">Live</span>' : '<span class="text-secondary">Entwurf</span>'}</td>
                <td>
                    <div style="display:flex; gap:5px;">
                        <button class="btn-admin btn-secondary btn-sm" onclick="CmsNewsPage.edit(${n.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-admin btn-danger btn-sm" onclick="CmsNewsPage.delete(${n.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    showEditor(id = null) {
        const modal = document.getElementById('newsEditorModal');
        document.getElementById('editNewsId').value = id || '';
        document.getElementById('newsEditorTitle').textContent = id ? 'Artikel bearbeiten' : 'Artikel erstellen';
        document.getElementById('editNewsTitle').value = '';
        document.getElementById('editNewsImage').value = '';
        document.getElementById('editNewsPublished').checked = true;
        document.getElementById('editNewsCategory').value = 'Update';
        document.getElementById('editNewsLang').value = document.getElementById('cmsNewsLangFilter')?.value || 'de';

        let existingContent = '';
        if (id) {
            const item = this.news.find(n => n.id === id);
            if (item) {
                document.getElementById('editNewsTitle').value = item.title;
                document.getElementById('editNewsCategory').value = item.category;
                document.getElementById('editNewsImage').value = item.image_url || '';
                document.getElementById('editNewsPublished').checked = !!item.is_published;
                document.getElementById('editNewsLang').value = item.lang || 'de';
                existingContent = item.content || '';
            }
        }

        modal.style.display = 'flex';
        AdminEditor.init('newsTinyEditor', existingContent);
    },

    closeEditor() {
        AdminEditor.destroy('newsTinyEditor');
        document.getElementById('newsEditorModal').style.display = 'none';
    },

    async edit(id) {
        this.showEditor(id);
    },

    async delete(id) {
        customConfirm('Diesen Artikel wirklich löschen?', async () => {
            try {
                const data = await apiFetch('/cms/news/' + id, { method: 'DELETE' });
                if (data.success) {
                    showToast('News gelöscht', 'success');
                    this.load();
                }
            } catch (e) {
                showToast('Fehler beim Löschen', 'error');
            }
        });
    },

    async save(e) {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('m2user'));

        // Get content from TinyMCE
        const content = AdminEditor.getContent('newsTinyEditor');

        const payload = {
            id: document.getElementById('editNewsId').value || null,
            title: document.getElementById('editNewsTitle').value,
            category: document.getElementById('editNewsCategory').value,
            image_url: document.getElementById('editNewsImage').value,
            lang: document.getElementById('editNewsLang').value,
            content,
            is_published: document.getElementById('editNewsPublished').checked ? 1 : 0,
            author: user ? user.username : 'Admin'
        };

        try {
            const data = await apiFetch('/cms/news', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (data.success) {
                showToast('Gespeichert', 'success');
                this.closeEditor();
                this.load();
            } else {
                showToast(data.message, 'error');
            }
        } catch (e) {
            showToast('Fehler beim Speichern', 'error');
        }
    },

    async canLeave() {
        if (AdminEditor.isDirty('newsTinyEditor')) {
            return confirm('Du hast ungespeicherte Änderungen im News-Editor. Möchtest du die Seite wirklich verlassen?');
        }
        return true;
    }
};

window.CmsNewsPage = CmsNewsPage;
