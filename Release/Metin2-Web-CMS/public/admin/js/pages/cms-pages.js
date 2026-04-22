/**
 * Admin: CMS Pages Manager
 * Handles dynamic content pages (AGB, Rules, etc.) with TinyMCE WYSIWYG editor.
 */

const CmsPagesPage = {
    title: 'Seiten-Manager',
    icon: 'fa-file-alt',
    breadcrumb: 'Content &rsaquo; Seiten-Manager',
    pages: [],

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
                <div class="admin-modal" style="max-width: 1200px; width: 95%;">
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
                                <select class="admin-input" id="editPageLang" onchange="CmsPagesPage.onEditorLangChange()">
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
                            <div id="pageEditorWrapper" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                                <textarea id="pageTinyEditor"></textarea>
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
        this.load();
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

        let existingContent = '';
        if (slug) {
            const lang = document.getElementById('cmsPagesLangFilter')?.value || 'de';
            apiFetch(`/cms/pages/${slug}?lang=${lang}`).then(data => {
                if (data.success) {
                    document.getElementById('editPageTitle').value = data.page.title;
                    document.getElementById('editPageSlug').value = data.page.slug;
                    AdminEditor.init('pageTinyEditor', data.page.content || '');
                } else {
                    showToast('Fehler beim Laden der Seite', 'error');
                    AdminEditor.init('pageTinyEditor', '');
                }
            }).catch(() => {
                showToast('Verbindungsfehler zum Backend', 'error');
                AdminEditor.init('pageTinyEditor', '');
            });
        } else {
            AdminEditor.init('pageTinyEditor', '');
        }
    },

    closeEditor() {
        AdminEditor.destroy('pageTinyEditor');
        document.getElementById('pageEditorModal').style.display = 'none';
    },

    async onEditorLangChange() {
        const slug = document.getElementById('editPageOldSlug').value;
        const lang = document.getElementById('editPageLang').value;
        if (!slug) return; // New page, nothing to reload

        if (AdminEditor.isDirty('pageTinyEditor')) {
            if (!confirm('Du hast ungespeicherte Änderungen. Möchtest du wirklich die Sprache wechseln? Die Änderungen gehen verloren.')) {
                // Restore previous lang (approximate via filter lang or similar, 
                // but actually we don't have the old value easily here, 
                // so we just warn the user)
            }
        }

        try {
            const data = await apiFetch(`/cms/pages/${slug}?lang=${lang}`);
            if (data.success) {
                document.getElementById('editPageTitle').value = data.page.title;
                AdminEditor.init('pageTinyEditor', data.page.content || '');
            } else {
                // If not found in this language, clear fields for a new translation
                document.getElementById('editPageTitle').value = '';
                AdminEditor.init('pageTinyEditor', '');
            }
        } catch (e) {
            showToast('Ladefehler', 'error');
        }
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
        
        // Get content from TinyMCE
        const content = AdminEditor.getContent('pageTinyEditor');

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
    },

    async canLeave() {
        if (AdminEditor.isDirty('pageTinyEditor')) {
            return confirm('Du hast ungespeicherte Änderungen im Seiten-Editor. Möchtest du die Seite wirklich verlassen?');
        }
        return true;
    }
};

window.CmsPagesPage = CmsPagesPage;
