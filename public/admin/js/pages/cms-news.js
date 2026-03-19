/**
 * Admin: CMS News Manager
 * Handles updates and news feed. Uses Quill.js for WYSIWYG editing.
 */

const CmsNewsPage = {
    title: 'Neuigkeiten',
    icon: 'fa-newspaper',
    breadcrumb: 'Content &rsaquo; Neuigkeiten',
    news: [],
    quill: null,

    render() {
        return `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-newspaper"></i> News &amp; Updates</div>
                    <button class="btn-admin btn-primary" onclick="CmsNewsPage.showEditor()">
                        <i class="fas fa-plus"></i> Artikel erstellen
                    </button>
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
                <div class="admin-modal" style="max-width: 820px; width: 95%; max-height: 92vh; overflow-y: auto; margin: auto;">
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
                            <!-- Quill wrapper: replaced entirely on each open to prevent duplicate toolbar -->
                            <div id="newsQuillWrapper" style="border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                                <div id="newsQuillEditor" style="background: rgba(0,0,0,0.3); min-height: 280px; color: var(--text-main);"></div>
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
        await this.loadQuill();
        this.load();
    },

    async loadQuill() {
        // Load Quill CSS if not already loaded
        if (!document.getElementById('quill-css')) {
            const link = document.createElement('link');
            link.id = 'quill-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css';
            document.head.appendChild(link);

            // Add dark-mode override for the editor toolbar
            const style = document.createElement('style');
            style.id = 'quill-dark-css';
            style.textContent = `
                .ql-toolbar { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px 8px 0 0; }
                .ql-toolbar .ql-stroke { stroke: var(--text-muted) !important; }
                .ql-toolbar .ql-fill { fill: var(--text-muted) !important; }
                .ql-toolbar .ql-picker { color: var(--text-muted) !important; }
                .ql-toolbar button:hover .ql-stroke, .ql-toolbar .ql-active .ql-stroke { stroke: var(--primary) !important; }
                .ql-toolbar button:hover .ql-fill, .ql-toolbar .ql-active .ql-fill { fill: var(--primary) !important; }
                .ql-container { border: none !important; font-size: 0.95rem; }
                .ql-editor { min-height: 250px; color: var(--text-main); }
                .ql-editor.ql-blank::before { color: var(--text-muted); font-style: normal; }
                .ql-picker-options { background: #1e293b; border-color: rgba(255,255,255,0.1) !important; }
            `;
            document.head.appendChild(style);
        }

        // Load Quill JS if not already loaded
        if (!window.Quill) {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
    },

    initQuillEditor(existingContent = '') {
        // Destroy previous Quill instance completely by replacing the wrapper's inner content
        // This prevents Quill from creating a second toolbar on the old container
        const wrapper = document.getElementById('newsQuillWrapper');
        if (wrapper) {
            // Replace entire inner container with a fresh element
            wrapper.innerHTML = '<div id="newsQuillEditor" style="background: rgba(0,0,0,0.3); min-height: 280px; color: var(--text-main);"></div>';
        }
        this.quill = null;

        if (!window.Quill) return;

        this.quill = new Quill('#newsQuillEditor', {
            theme: 'snow',
            placeholder: 'Schreibe hier den Inhalt des Artikels...',
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ color: [] }, { background: [] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ align: [] }],
                    ['link', 'image', 'blockquote', 'code-block'],
                    ['clean']
                ]
            }
        });

        if (existingContent) {
            this.quill.clipboard.dangerouslyPasteHTML(existingContent);
        }
    },

    async load() {
        try {
            const data = await apiFetch('/cms/news/all');
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
        document.getElementById('editNewsLang').value = 'de';

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
        // Init editor after modal is visible
        setTimeout(() => this.initQuillEditor(existingContent), 50);
    },

    closeEditor() {
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

        // Get content from Quill editor
        const content = this.quill ? this.quill.getSemanticHTML() : '';

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
    }
};

window.CmsNewsPage = CmsNewsPage;
