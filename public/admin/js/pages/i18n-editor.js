/**
 * Admin: I18n Editor Page
 * Allows translating all website texts for all supported languages.
 */

const I18nEditorPage = {
    title: 'Spracherweiterung',
    icon: 'fa-language',
    breadcrumb: 'Content &rsaquo; Sprachen',
    languages: ['de', 'en', 'it', 'es', 'pl', 'ro', 'tr', 'pt'],
    langNames: { de: '🇩🇪 Deutsch', en: '🇬🇧 English', it: '🇮🇹 Italiano', es: '🇪🇸 Español', pl: '🇵🇱 Polski', ro: '🇷🇴 Română', tr: '🇹🇷 Türkçe', pt: '🇵🇹 Português' },
    currentLang: 'de',
    translations: {},

    // Complete ordered key list, grouped by section
    keyGroups: [
        { label: 'Navbar', keys: ['navbar.home','navbar.shop','navbar.ranking','navbar.downloads','navbar.info','navbar.rules','navbar.bans','navbar.web_store','navbar.stash','navbar.account','navbar.support','navbar.vote','navbar.news','navbar.admin_panel','navbar.logout','navbar.login'] },
        { label: 'Hero (Startseite)', keys: ['hero.welcome','hero.subtitle'] },
        { label: 'Anmeldung / Registrierung', keys: ['auth.login','auth.register','auth.username','auth.password','auth.email','auth.social_id','auth.btn_login','auth.btn_register','auth.btn_reset','auth.have_account','auth.no_account','auth.toggle_login','auth.toggle_register','auth.forgot_password','auth.forgot_title','auth.back_login','auth.msg_loading','auth.msg_network_error','auth.msg_reg_success_suffix'] },
        { label: 'Shop', keys: ['shop.dr_label','shop.dm_label'] },
        { label: 'News', keys: ['news.title','news.read_more','news.back','news.by'] },
        { label: 'Rangliste', keys: ['ranking.title','ranking.rank','ranking.player','ranking.level','ranking.guild'] },
        { label: 'Downloads', keys: ['downloads.title','downloads.download'] },
        { label: 'Account', keys: ['account.title','account.save','account.change_password'] },
    ],

    render() {
        return `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">
                        <i class="fas fa-language"></i> Übersetzungen
                    </div>
                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                        <select id="langSelect" class="admin-input" style="width:180px; margin:0;" onchange="I18nEditorPage.switchLanguage(this.value)">
                            ${this.languages.map(l => `<option value="${l}" ${l === this.currentLang ? 'selected' : ''}>${this.langNames[l] || l.toUpperCase()}</option>`).join('')}
                        </select>
                        <!-- Export current language -->
                        <button class="btn-admin btn-secondary" onclick="I18nEditorPage.exportCurrent()" title="Aktuelle Sprache als JSON exportieren">
                            <i class="fas fa-download"></i> Exportieren
                        </button>
                        <!-- Export ALL languages -->
                        <button class="btn-admin btn-secondary" onclick="I18nEditorPage.exportAll()" title="Alle Sprachen als eine JSON-Datei exportieren">
                            <i class="fas fa-file-export"></i> Alle exportieren
                        </button>
                        <!-- Import JSON file -->
                        <label class="btn-admin btn-secondary" style="cursor:pointer; margin:0;" title="JSON-Datei importieren">
                            <i class="fas fa-upload"></i> Importieren
                            <input type="file" accept=".json" style="display:none;" onchange="I18nEditorPage.importFile(this)">
                        </label>
                        <button class="btn-admin btn-primary" onclick="I18nEditorPage.save()">
                            <i class="fas fa-save"></i> Speichern
                        </button>
                    </div>
                </div>
                <div class="admin-card-body">
                    <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">
                        <i class="fas fa-info-circle"></i> Sprache wählen, Texte bearbeiten, <strong>Speichern</strong> klicken.
                        Zum externen Bearbeiten: <em>Alle exportieren</em> → JSON bearbeiten → <em>Importieren</em>.
                    </p>
                    <div id="translationEditor">
                        <div style="text-align:center; padding:2rem; color:var(--text-muted);">
                            <i class="fas fa-spinner fa-spin"></i> Lade Übersetzungen...
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .i18n-group-header td {
                    background: rgba(var(--primary-rgb), 0.08) !important;
                    color: var(--primary);
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    padding: 0.5rem 1rem !important;
                    border-top: 1px solid rgba(var(--primary-rgb), 0.2);
                }
                .i18n-key { font-family: monospace; font-size: 0.82rem; color: var(--text-muted); white-space: nowrap; width: 28%; }
            </style>
        `;
    },

    async init() {
        await this.load();
        this.renderForm();
    },

    async load() {
        try {
            const res = await fetch(`/api/i18n/${this.currentLang}`);
            const data = await res.json();
            if (data.success) this.translations = data.translations || {};
        } catch (e) {
            if (typeof showToast === 'function') showToast('Fehler beim Laden der Übersetzungen.', 'error');
        }
    },

    async switchLanguage(lang) {
        this.currentLang = lang;
        await this.load();
        this.renderForm();
    },

    renderForm() {
        const grid = document.getElementById('translationEditor');
        if (!grid) return;

        const flat = this.flattenObject(this.translations);
        const knownKeys = new Set(this.keyGroups.flatMap(g => g.keys));
        const extraKeys = Object.keys(flat).filter(k => !knownKeys.has(k));

        let html = `<table class="admin-table"><thead><tr>
            <th class="i18n-key">Key</th>
            <th>Übersetzung (${this.langNames[this.currentLang] || this.currentLang})</th>
        </tr></thead><tbody>`;

        this.keyGroups.forEach(group => {
            html += `<tr class="i18n-group-header"><td colspan="2"><i class="fas fa-tag"></i> ${group.label}</td></tr>`;
            group.keys.forEach(key => {
                const val = (flat[key] || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                html += `<tr>
                    <td class="i18n-key">${key}</td>
                    <td><input type="text" class="admin-input" style="width:100%; margin:0;"
                        value="${val}" oninput="I18nEditorPage.updateKey('${key}', this.value)"></td>
                </tr>`;
            });
        });

        if (extraKeys.length > 0) {
            html += `<tr class="i18n-group-header"><td colspan="2"><i class="fas fa-plus-circle"></i> Weitere Keys</td></tr>`;
            extraKeys.forEach(key => {
                const val = (flat[key] || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                html += `<tr>
                    <td class="i18n-key">${key}</td>
                    <td><input type="text" class="admin-input" style="width:100%; margin:0;"
                        value="${val}" oninput="I18nEditorPage.updateKey('${key}', this.value)"></td>
                </tr>`;
            });
        }

        html += '</tbody></table>';
        grid.innerHTML = html;
    },

    updateKey(key, value) {
        const parts = key.split('.');
        let obj = this.translations;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]] || typeof obj[parts[i]] !== 'object') obj[parts[i]] = {};
            obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
    },

    async save() {
        try {
            const token = localStorage.getItem('m2token');
            const res = await fetch(`/api/i18n/${this.currentLang}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ translations: this.translations })
            });
            const data = await res.json();
            if (data.success) {
                if (typeof showToast === 'function') showToast(`✅ ${this.langNames[this.currentLang] || this.currentLang} gespeichert.`, 'success');
            } else {
                if (typeof showToast === 'function') showToast(data.message || 'Fehler beim Speichern.', 'error');
            }
        } catch (e) {
            if (typeof showToast === 'function') showToast('Verbindung fehlgeschlagen.', 'error');
        }
    },

    // Download current language as JSON file
    exportCurrent() {
        this._download(`translations_${this.currentLang}.json`, JSON.stringify(this.translations, null, 4));
        if (typeof showToast === 'function') showToast(`${this.langNames[this.currentLang]} exportiert.`, 'success');
    },

    // Fetch + download all 8 languages as one combined JSON file
    async exportAll() {
        try {
            const token = localStorage.getItem('m2token');
            const all = {};
            await Promise.all(this.languages.map(async lang => {
                const res = await fetch(`/api/i18n/${lang}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                if (data.success) all[lang] = data.translations || {};
            }));
            this._download('translations_all.json', JSON.stringify(all, null, 4));
            if (typeof showToast === 'function') showToast('Alle Sprachen exportiert.', 'success');
        } catch (e) {
            if (typeof showToast === 'function') showToast('Export fehlgeschlagen.', 'error');
        }
    },

    // Import JSON file — supports both single-language {key:...} and multi-language {de:{...}, en:{...}}
    importFile(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                // Detect if it's a multi-language export (keys are lang codes)
                const isMulti = this.languages.some(l => parsed[l] && typeof parsed[l] === 'object');

                if (isMulti) {
                    // Save all languages that exist in the file
                    const token = localStorage.getItem('m2token');
                    const langs = Object.keys(parsed).filter(l => this.languages.includes(l));
                    let saved = 0;
                    for (const lang of langs) {
                        const res = await fetch(`/api/i18n/${lang}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ translations: parsed[lang] })
                        });
                        const d = await res.json();
                        if (d.success) saved++;
                    }
                    if (typeof showToast === 'function') showToast(`${saved} Sprachen importiert und gespeichert.`, 'success');
                    // Reload current language view
                    await this.load();
                    this.renderForm();
                } else {
                    // Single-language import — load into current language
                    this.translations = parsed;
                    this.renderForm();
                    if (typeof showToast === 'function') showToast(`Importiert für ${this.langNames[this.currentLang]}. Klicke Speichern um zu übernehmen.`, 'success');
                }
            } catch (err) {
                if (typeof showToast === 'function') showToast('Ungültige JSON-Datei.', 'error');
            }
        };
        reader.readAsText(file);
        // Reset file input so the same file can be re-imported
        input.value = '';
    },

    _download(filename, content) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    flattenObject(obj, prefix = '') {
        return Object.keys(obj).reduce((acc, k) => {
            const pre = prefix ? prefix + '.' : '';
            if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
                Object.assign(acc, this.flattenObject(obj[k], pre + k));
            } else {
                acc[pre + k] = obj[k];
            }
            return acc;
        }, {});
    }
};

window.I18nEditorPage = I18nEditorPage;
