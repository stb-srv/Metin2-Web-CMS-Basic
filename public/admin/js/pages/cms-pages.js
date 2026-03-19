/**
 * Admin: CMS Pages Manager
 * Handles dynamic content pages (AGB, Rules, etc.) with Quill.js WYSIWYG editor.
 */

const CmsPagesPage = {
    title: 'Seiten-Manager',
    icon: 'fa-file-alt',
    breadcrumb: 'Content &rsaquo; Seiten-Manager',
    pages: [],
    quill: null,

    render() {
        return `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-file-alt"></i> Alle Seiten</div>
                    <div style="display:flex; gap:12px;">
                        <select class="admin-input" id="cmsPagesLangFilter" style="width:140px;" onchange="CmsPagesPage.load()">
                            <option value="de">Deutsch</option>
                            <option value="en">English</option>
                            <option value="ro">Română</option>
                            <option value="tr">Türkçe</option>
                            <option value="it">Italiano</option>
                        </select>
                        <button class="btn-admin btn-primary" onclick="CmsPagesPage.showEditor()">
                            <i class="fas fa-plus"></i> Neue Seite
                        </button>
                    </div>
                </div>
                <div class="admin-card-body">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Name / Titel</th>
                                <th>Slug (URL)</th>
                                <th style="width:150px;">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="cmsPagesTableBody">
                            <tr><td colspan="3">Lade Seiten...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Editor Modal (Hidden by default) -->
            <div id="pageEditorModal" class="modal-overlay" style="display:none;">
                <div class="admin-modal" style="max-width: 900px;">
                    <div class="admin-modal-header">
                        <div class="admin-modal-title" id="pageEditorTitle">Seite erstellen</div>
                        <button class="modal-close" onclick="CmsPagesPage.closeEditor()">&times;</button>
                    </div>
                    <form id="pageEditorForm" onsubmit="CmsPagesPage.save(event)">
                        <input type="hidden" id="editPageOldSlug">
                        <div class="admin-grid admin-grid-3">
                            <div class="form-group" style="grid-column: span 1;">
                                <label class="form-label">Titel</label>
                                <input type="text" class="admin-input" id="editPageTitle" required placeholder="z.B. Serverregeln">
                            </div>
                            <div class="form-group" style="grid-column: span 1;">
                                <label class="form-label">Slug (URL Name)</label>
                                <input type="text" class="admin-input" id="editPageSlug" required placeholder="z.B. serverregeln">
                            </div>
                            <div class="form-group" style="grid-column: span 1;">
                                <label class="form-label">Sprache</label>
                                <select class="admin-input" id="editPageLang">
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
                            <!-- Quill.js WYSIWYG Editor wrapper to prevent multiple toolbars -->
                            <div id="pageQuillWrapper" style="border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                                <div id="pageQuillEditor" style="background: rgba(0,0,0,0.3); min-height: 350px; color: var(--text-main);"></div>
                            </div>
                        </div>
                        <div class="admin-modal-footer">
                            <button type="button" class="btn-admin btn-secondary" onclick="CmsPagesPage.closeEditor()">Abbrechen</button>
                            <button type="submit" class="btn-admin btn-primary"><i class="fas fa-save"></i> Speichern</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    async init() {
        await this.ensureQuill();
        this.load();
    },

    async ensureQuill() {
        // Reuse CSS from CmsNewsPage if already loaded (they share the same styles)
        if (!document.getElementById('quill-css')) {
            const link = document.createElement('link');
            link.id = 'quill-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css';
            document.head.appendChild(link);

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
                .ql-editor { min-height: 300px; color: var(--text-main); }
                .ql-editor.ql-blank::before { color: var(--text-muted); font-style: normal; }
                .ql-picker-options { background: #1e293b; border-color: rgba(255,255,255,0.1) !important; }
                .ql-picker-label svg { width: 18px !important; height: 18px !important; }
            `;
            document.head.appendChild(style);
        }

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
        const wrapper = document.getElementById('pageQuillWrapper');
        if (wrapper) {
            wrapper.innerHTML = '<div id="pageQuillEditor" style="background: rgba(0,0,0,0.3); min-height: 350px; color: var(--text-main);"></div>';
        }
        this.quill = null;

        if (!window.Quill) return;

        this.quill = new Quill('#pageQuillEditor', {
            theme: 'snow',
            placeholder: 'Schreibe hier den Seiteninhalt...',
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, 4, false] }],
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
            const lang = document.getElementById('cmsPagesLangFilter')?.value || 'de';
            const data = await apiFetch(`/cms/pages/list/admin?lang=${lang}`);
            if (data.success) {
                this.pages = data.pages;
                this.renderTable();
            }
        } catch (e) { console.error(e); }
    },

    renderTable() {
        const tbody = document.getElementById('cmsPagesTableBody');
        if (!tbody) return;

        if (this.pages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Keine Seiten vorhanden.</td></tr>';
            return;
        }

        tbody.innerHTML = this.pages.map(p => `
            <tr>
                <td><strong>${p.title}</strong></td>
                <td><code class="text-secondary">/page?slug=${p.slug}&lang=${document.getElementById('cmsPagesLangFilter')?.value || 'de'}</code></td>
                <td>
                    <div style="display:flex; gap:5px;">
                        <button class="btn-admin btn-secondary btn-sm" onclick="CmsPagesPage.edit('${p.slug}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-admin btn-danger btn-sm" onclick="CmsPagesPage.delete('${p.slug}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    showEditor(slug = null) {
        const modal = document.getElementById('pageEditorModal');
        const titleEl = document.getElementById('pageEditorTitle');

        document.getElementById('editPageOldSlug').value = slug || '';
        document.getElementById('editPageTitle').value = '';
        document.getElementById('editPageSlug').value = '';
        document.getElementById('editPageLang').value = document.getElementById('cmsPagesLangFilter')?.value || 'de';
        titleEl.textContent = slug ? 'Seite bearbeiten' : 'Neue Seite erstellen';

        modal.style.display = 'flex';

        if (slug) {
            // Fetch full content async, then init editor
            const lang = document.getElementById('cmsPagesLangFilter')?.value || 'de';
            apiFetch(`/cms/pages/${slug}?lang=${lang}`).then(data => {
                if (data.success) {
                    document.getElementById('editPageTitle').value = data.page.title;
                    document.getElementById('editPageSlug').value = data.page.slug;
                    setTimeout(() => this.initQuillEditor(data.page.content || ''), 50);
                }
            });
        } else {
            setTimeout(() => this.initQuillEditor(''), 50);
        }
    },

    closeEditor() {
        document.getElementById('pageEditorModal').style.display = 'none';
    },

    async edit(slug) {
        this.showEditor(slug);
    },

    async delete(slug) {
        customConfirm('Möchtest du diese Seite wirklich löschen?', async () => {
            try {
                const lang = document.getElementById('cmsPagesLangFilter')?.value || 'de';
                const data = await apiFetch(`/cms/pages/${slug}?lang=${lang}`, { method: 'DELETE' });
                if (data.success) {
                    showToast('Seite gelöscht', 'success');
                    this.load();
                }
            } catch (e) {
                showToast('Fehler beim Löschen', 'error');
            }
        });
    },

    async save(e) {
        e.preventDefault();
        const oldSlug = document.getElementById('editPageOldSlug').value;
        const newSlug = document.getElementById('editPageSlug').value;
        const title = document.getElementById('editPageTitle').value;
        const lang = document.getElementById('editPageLang').value;
        // Get content from Quill editor
        const content = this.quill ? this.quill.getSemanticHTML() : '';

        try {
            const data = await apiFetch(`/cms/pages/${oldSlug || newSlug}`, {
                method: 'POST',
                body: JSON.stringify({ title, content, lang })
            });

            if (data.success) {
                showToast('Seite gespeichert', 'success');
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

window.CmsPagesPage = CmsPagesPage;
