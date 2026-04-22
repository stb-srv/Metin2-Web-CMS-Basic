const CmsSettingsPage = {
    title: 'CMS Einstellungen',
    icon: 'fa-cog',
    breadcrumb: 'Content &rsaquo; CMS Einstellungen',

    render() {
        return `
            <div class="admin-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                <button class="btn-tab active" onclick="CmsSettingsPage.switchTab('general', this)"><i class="fas fa-cog"></i> Allgemein</button>
                <button class="btn-tab" onclick="CmsSettingsPage.switchTab('design', this)"><i class="fas fa-palette"></i> Design</button>
                <button class="btn-tab" onclick="CmsSettingsPage.switchTab('modules', this)"><i class="fas fa-cubes"></i> Module</button>
                <button class="btn-tab" onclick="CmsSettingsPage.switchTab('integration', this)"><i class="fas fa-link"></i> Integration</button>
            </div>

            <form id="cmsSettingsForm" onsubmit="CmsSettingsPage.save(event)">
                
                <!-- Tab: General -->
                <div id="tab-general" class="tab-content active">
                    <div class="admin-grid admin-grid-2">
                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-cog"></i> Basis-Einstellungen</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Seitenname</label>
                                <input type="text" class="admin-input" id="cmsSiteName" name="site_name" placeholder="z.B. Metin2 Web">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Globales Design (Skin)</label>
                                <select class="admin-input" id="cmsThemeSkin" name="theme_skin">
                                    <option value="default">Lade Skins...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Reichs-Akzent</label>
                                <select class="admin-input" id="cmsThemeEmpire" name="theme_empire">
                                    <option value="default">Lade Themes...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Standard-Modus</label>
                                <select class="admin-input" id="cmsThemeMode" name="theme_mode">
                                    <option value="dark">Dark Mode</option>
                                    <option value="light">White Mode (Light)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Logo</label>
                                <input type="text" class="admin-input" id="cmsSiteLogo" name="site_logo" placeholder="URL zum Logo">
                                <input type="file" class="admin-input" id="cmsSiteLogoFile" name="logo_file" accept="image/*" style="margin-top:0.5rem;" onchange="CmsSettingsPage.handleFilePreview(this, 'cmsLogoPreview')">
                            </div>
                            <div style="text-align:center; padding: 1rem; background: var(--bg-dark); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                <img id="cmsLogoPreview" src="" style="max-height: 50px; display:none;" onerror="this.style.display='none'">
                            </div>
                            <div class="form-group" style="margin-top:1rem;">
                                <label class="form-label">Footer-Text (Copyright Zusatz)</label>
                                <input type="text" class="admin-input" id="cmsFooterText" name="footer_text" placeholder="Alle Rechte vorbehalten.">
                            </div>
                        </div>

                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-search"></i> SEO & Suche</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Meta Beschreibung (Description)</label>
                                <textarea class="admin-input" id="cmsSiteDescription" name="site_description" rows="3" placeholder="Kurze Beschreibung für Google..."></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Suchbegriffe (Keywords)</label>
                                <input type="text" class="admin-input" id="cmsSiteKeywords" name="site_keywords" placeholder="Metin2, P-Server, Gaming...">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Standard Sprache (i18n)</label>
                                <select class="admin-input" id="cmsDefaultLanguage" name="default_language">
                                    <option value="de">Deutsch</option>
                                    <option value="en">English</option>
                                    <option value="tr">Türkçe</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Design -->
                <div id="tab-design" class="tab-content" style="display:none;">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <div class="admin-card-title"><i class="fas fa-palette"></i> Theme-Engine</div>
                        </div>
                        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.5rem;">
                            Wähle ein Basis-Theme für dein CMS aus. Themes können die komplette Struktur der Seite verändern.
                        </p>
                        
                        <div class="theme-selector">
                            <div class="theme-option" data-theme="classic" onclick="CmsSettingsPage.selectTheme('classic')">
                                <div class="theme-preview classic-preview"></div>
                                <span>Classic</span>
                            </div>
                            <div class="theme-option" data-theme="dragon-dark" onclick="CmsSettingsPage.selectTheme('dragon-dark')">
                                <div class="theme-preview dragon-preview"></div>
                                <span>Dragon Dark</span>
                            </div>
                        </div>
                        
                        <input type="hidden" id="activeThemeInput" name="active_theme" value="classic">
                        
                        <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid rgba(255,255,255,0.05);">
                            <button type="button" class="btn-admin btn-primary" onclick="CmsSettingsPage.saveActiveTheme()"><i class="fas fa-save"></i> Theme aktivieren</button>
                        </div>
                    </div>
                </div>

                <!-- Tab: Modules -->
                <div id="tab-modules" class="tab-content" style="display:none;">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <div class="admin-card-title"><i class="fas fa-cubes"></i> Feature Management</div>
                        </div>
                        <div class="admin-grid admin-grid-2">
                             <div class="form-group-toggle" style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <h4 style="margin:0;">Gutschein-System</h4>
                                        <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">Erstellung & Einlösen von Codes.</p>
                                    </div>
                                    <label class="admin-switch">
                                        <input type="checkbox" name="module_vouchers" id="modVouchers" value="true">
                                        <span class="admin-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group-toggle" style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <h4 style="margin:0;">Audit Logs</h4>
                                        <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">Protokollierung von Admin-Aktionen.</p>
                                    </div>
                                    <label class="admin-switch">
                                        <input type="checkbox" name="module_logs" id="modLogs" value="true">
                                        <span class="admin-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group-toggle" style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <h4 style="margin:0;">Event-Kalender</h4>
                                        <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">Anzeige von Ingame Events.</p>
                                    </div>
                                    <label class="admin-switch">
                                        <input type="checkbox" name="module_events" id="modEvents" value="true">
                                        <span class="admin-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group-toggle" style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <h4 style="margin:0;">Web-Lager</h4>
                                        <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">Spieler können Items auf der Web lagern.</p>
                                    </div>
                                    <label class="admin-switch">
                                        <input type="checkbox" name="module_stash" id="modStash" value="true">
                                        <span class="admin-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group-toggle" style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <h4 style="margin:0;">Wartungsmodus</h4>
                                        <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">Deaktiviert den Zugang für Spieler.</p>
                                    </div>
                                    <label class="admin-switch">
                                        <input type="checkbox" name="module_maintenance" id="modMaintenance" value="true">
                                        <span class="admin-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group-toggle" style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <h4 style="margin:0;">Discord-Sync</h4>
                                        <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">News & Events nach Discord senden.</p>
                                    </div>
                                    <label class="admin-switch">
                                        <input type="checkbox" name="module_discord" id="modDiscord" value="true">
                                        <span class="admin-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Integration -->
                <div id="tab-integration" class="tab-content" style="display:none;">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <div class="admin-card-title"><i class="fab fa-discord"></i> Discord Webhooks</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Discord Server URL</label>
                            <input type="text" class="admin-input" id="cmsDiscordUrl" name="discord_url" placeholder="https://discord.gg/...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">News-Webhook URL</label>
                            <input type="text" class="admin-input" id="cmsDiscordNews" name="discord_news_webhook">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Shop-Webhook URL</label>
                            <input type="text" class="admin-input" id="cmsDiscordShop" name="discord_shop_webhook">
                        </div>
                    </div>
                </div>

                <div style="margin-top: 20px; position: sticky; bottom: 0; background: var(--bg-card); padding: 15px; border-radius: 12px; border-top: 1px solid rgba(255,255,255,0.05); z-index: 10;">
                    <button type="submit" class="btn-admin btn-primary btn-block"><i class="fas fa-save"></i> Alle Einstellungen speichern</button>
                </div>
            </form>
        `;
    },

    switchTab(tabId, btn) {
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
        
        document.getElementById(`tab-${tabId}`).style.display = 'block';
        btn.classList.add('active');
    },

    init() {
        this.load();
    },

    async load() {
        try {
            const data = await apiFetch('/cms/settings/admin');
            if (data.success) {
                const s = data.settings;
                document.getElementById('cmsSiteName').value = s.site_name || '';
                document.getElementById('cmsSiteLogo').value = s.site_logo || '';

                if (document.getElementById('modVouchers')) document.getElementById('modVouchers').checked = s.module_vouchers === 'true';
                if (document.getElementById('modLogs')) document.getElementById('modLogs').checked = s.module_logs === 'true';
                if (document.getElementById('modEvents')) document.getElementById('modEvents').checked = s.module_events === 'true';
                if (document.getElementById('modMaintenance')) document.getElementById('modMaintenance').checked = s.module_maintenance === 'true';
                if (document.getElementById('modDiscord')) document.getElementById('modDiscord').checked = s.module_discord === 'true';
                if (document.getElementById('modStash')) document.getElementById('modStash').checked = s.module_stash === 'true';

                if (document.getElementById('cmsSiteDescription')) document.getElementById('cmsSiteDescription').value = s.site_description || '';
                if (document.getElementById('cmsSiteKeywords')) document.getElementById('cmsSiteKeywords').value = s.site_keywords || '';
                if (document.getElementById('cmsDefaultLanguage')) document.getElementById('cmsDefaultLanguage').value = s.default_language || 'de';
                if (document.getElementById('cmsFooterText')) document.getElementById('cmsFooterText').value = s.footer_text || '';
                if (document.getElementById('cmsDiscordUrl')) document.getElementById('cmsDiscordUrl').value = s.discord_url || '';

                if (document.getElementsByName('discord_news_webhook')[0]) document.getElementsByName('discord_news_webhook')[0].value = s.discord_news_webhook || '';
                if (document.getElementsByName('discord_shop_webhook')[0]) document.getElementsByName('discord_shop_webhook')[0].value = s.discord_shop_webhook || '';

                try {
                    const themeData = await apiFetch('/cms/available-themes');
                    if (themeData.success) {
                        const skinSel = document.getElementById('cmsThemeSkin');
                        const empSel = document.getElementById('cmsThemeEmpire');

                        if (skinSel) {
                            skinSel.innerHTML = '';
                            themeData.skins.forEach(skin => {
                                let label = skin === 'default' ? 'Standard (Crystal 3)' : (skin.charAt(0).toUpperCase() + skin.slice(1));
                                skinSel.innerHTML += `<option value="${skin}">${label}</option>`;
                            });
                            if (s.theme_skin) skinSel.value = s.theme_skin;
                        }

                        if (empSel) {
                            empSel.innerHTML = '';
                            themeData.themes.forEach(theme => {
                                let label = theme === 'default' ? 'Kein Akzent' : (theme.charAt(0).toUpperCase() + theme.slice(1).replace(/-/g, ' '));
                                empSel.innerHTML += `<option value="${theme}">${label}</option>`;
                            });
                            if (s.theme_empire) empSel.value = s.theme_empire;
                        }
                    }
                } catch (e) { console.error('[CmsSettings] Error loading themes:', e); }

                if (s.theme_mode) document.getElementById('cmsThemeMode').value = s.theme_mode;

                const logo = document.getElementById('cmsLogoPreview');
                if (s.site_logo) {
                    logo.src = s.site_logo;
                    logo.style.display = 'block';
                }

                if (s.active_theme) {
                    this.selectTheme(s.active_theme);
                }
            }
        } catch (e) { console.error(e); }
    },

    selectTheme(theme) {
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.theme === theme) opt.classList.add('active');
        });
        document.getElementById('activeThemeInput').value = theme;
    },

    async saveActiveTheme() {
        const theme = document.getElementById('activeThemeInput').value;
        const token = localStorage.getItem('m2token');
        
        try {
            const res = await fetch('/api/admin/settings/theme', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ theme })
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                // Optional: Reload after some delay to show the new theme
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast(data.message, 'error');
            }
        } catch (e) {
            showToast('Fehler beim Speichern des Themes', 'error');
        }
    },

    async save(e) {
        e.preventDefault();
        try {
            const formData = new FormData(document.getElementById('cmsSettingsForm'));
            const token = localStorage.getItem('m2token');

            // Force checkboxes values since unchecked checkboxes are not included in FormData
            formData.set('module_vouchers', String(document.getElementById('modVouchers')?.checked ?? false));
            formData.set('module_logs', String(document.getElementById('modLogs')?.checked ?? false));
            formData.set('module_events', String(document.getElementById('modEvents')?.checked ?? false));
            formData.set('module_maintenance', String(document.getElementById('modMaintenance')?.checked ?? false));
            formData.set('module_discord', String(document.getElementById('modDiscord')?.checked ?? false));
            formData.set('module_stash', String(document.getElementById('modStash')?.checked ?? false));

            const res = await fetch('/api/cms/settings', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                showToast(data.message || 'Einstellungen gespeichert!', 'success');
                this.load();
                if (window.renderSidebar) renderSidebar();
            } else {
                showToast(data.message || 'Fehler beim Speichern', 'error');
            }
        } catch (err) {
            console.error('[CmsSettings] Save error:', err);
            showToast('Fehler beim Speichern', 'error');
        }
    },

    handleFilePreview(input, previewId) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const el = document.getElementById(previewId);
                el.src = e.target.result;
                el.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
};

window.CmsSettingsPage = CmsSettingsPage;
