const CmsSettingsPage = {
    title: 'CMS Einstellungen',
    icon: 'fa-cog',
    breadcrumb: 'Content &rsaquo; CMS Einstellungen',

    render() {
        return `
            <div class="admin-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                <button class="btn-tab active" onclick="CmsSettingsPage.switchTab('general', this)"><i class="fas fa-cog"></i> Allgemein</button>
                <button class="btn-tab" onclick="CmsSettingsPage.switchTab('styling', this)"><i class="fas fa-palette"></i> Styling</button>
                <button class="btn-tab" onclick="CmsSettingsPage.switchTab('advanced-styling', this)"><i class="fas fa-font"></i> Erweitertes Styling</button>
                <button class="btn-tab" onclick="CmsSettingsPage.switchTab('modules', this)"><i class="fas fa-cubes"></i> Module</button>
                <button class="btn-tab" onclick="CmsSettingsPage.switchTab('integration', this)"><i class="fas fa-link"></i> Integration</button>
            </div>

            <form id="cmsSettingsForm" onsubmit="CmsSettingsPage.save(event)">
                <input type="hidden" id="resetStylingFlag" name="reset_styling" value="false">
                
                <!-- Tab: General -->
                <div id="tab-general" class="tab-content active">
                    <div class="admin-grid admin-grid-2">
                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-cog"></i> Basis-Einstellungen</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Seitenname</label>
                                <input type="text" class="admin-input" id="cmsSiteName" name="site_name" placeholder="z.B. Metin2 Web" oninput="CmsSettingsPage.updateLivePreview()">
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
                                <input type="text" class="admin-input" id="cmsSiteLogo" name="site_logo" placeholder="URL zum Logo" oninput="CmsSettingsPage.updateLivePreview()">
                                <input type="file" class="admin-input" id="cmsSiteLogoFile" name="logo_file" accept="image/*" style="margin-top:0.5rem;" onchange="CmsSettingsPage.handleFilePreview(this, 'cmsLogoPreview')">
                            </div>
                            <div class="form-group">
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
                </div>

                <!-- Tab: Advanced Styling -->
                <div id="tab-advanced-styling" class="tab-content" style="display:none;">
                    <div class="admin-grid admin-grid-2">
                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-font"></i> Typografie</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Haupt-Schriftart (Body)</label>
                                <select class="admin-input" id="cmsThemeFontMain" name="theme_font_main" onchange="CmsSettingsPage.updateLivePreview()">
                                    <option value="">Standard (Inter)</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Open Sans">Open Sans</option>
                                    <option value="Cinzel">Cinzel (Metin2 Classic)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Überschriften (Headers)</label>
                                <select class="admin-input" id="cmsThemeFontHeaders" name="theme_font_headers" onchange="CmsSettingsPage.updateLivePreview()">
                                    <option value="">Wie Body</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Cinzel">Cinzel</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Forum">Forum (Edel)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">UI Elemente (Buttons/Menü)</label>
                                <select class="admin-input" id="cmsThemeFontUi" name="theme_font_ui" onchange="CmsSettingsPage.updateLivePreview()">
                                    <option value="">Wie Body</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Cinzel">Cinzel</option>
                                </select>
                            </div>
                        </div>

                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-paint-brush"></i> Individuelle Schriftfarben</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Haupt-Textfarbe</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeTextColorMainPicker" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeTextColorMain')">
                                    <input type="text" class="admin-input" id="cmsThemeTextColorMain" name="theme_color_text_main" placeholder="#f8fafc" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeTextColorMainPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Gedimmter Text (Muted)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeTextColorMutedPicker" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeTextColorMuted')">
                                    <input type="text" class="admin-input" id="cmsThemeTextColorMuted" name="theme_color_text_muted" placeholder="#94a3b8" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeTextColorMutedPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Akzent-Text (Wichtig)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeTextColorAccentPicker" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeTextColorAccent')">
                                    <input type="text" class="admin-input" id="cmsThemeTextColorAccent" name="theme_color_text_accent" placeholder="#00f2fe" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeTextColorAccentPicker')">
                                </div>
                            </div>
                        </div>

                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-sitemap"></i> Menü-Styling</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Überschriften-Farbe (Dropdowns)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeMenuHeaderColorPicker" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeMenuHeaderColor')">
                                    <input type="text" class="admin-input" id="cmsThemeMenuHeaderColor" name="theme_color_menu_header" placeholder="#f8fafc" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeMenuHeaderColorPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Überschriften-Schriftart</label>
                                <select class="admin-input" id="cmsThemeFontMenuHeader" name="theme_font_menu_header" onchange="CmsSettingsPage.updateLivePreview()">
                                    <option value="">Wie Überschriften</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Cinzel">Cinzel</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Forum">Forum</option>
                                </select>
                            </div>
                        </div>

                        <div class="admin-card" style="border: 1px dashed var(--danger); background: rgba(220, 53, 69, 0.05);">
                            <div class="admin-card-header">
                                <div class="admin-card-title" style="color:var(--danger);"><i class="fas fa-undo"></i> Zurücksetzen</div>
                            </div>
                            <p style="font-size:0.8rem; margin-bottom:1rem;">Möchten Sie alle individuellen Schrift- und Farbanpassungen löschen und zu den Standardwerten des Skins zurückkehren?</p>
                            <button type="button" class="btn-admin btn-danger btn-sm" onclick="CmsSettingsPage.resetToDefault()"><i class="fas fa-trash"></i> Styling zurücksetzen</button>
                        </div>
                    </div>
                </div>

                <!-- Tab: Styling -->
                <div id="tab-styling" class="tab-content" style="display:none;">
                    <div class="admin-grid admin-grid-2">
                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-palette"></i> Farben & Formen</div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Primärfarbe</label>
                                    <div style="display:flex; gap:10px;">
                                        <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemePrimaryColorPicker" oninput="CmsSettingsPage.syncColor(this, 'cmsThemePrimaryColor')">
                                        <input type="text" class="admin-input" id="cmsThemePrimaryColor" name="theme_primary_color" placeholder="#6d28d9" oninput="CmsSettingsPage.syncColor(this, 'cmsThemePrimaryColorPicker')">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Akzentfarbe</label>
                                    <div style="display:flex; gap:10px;">
                                        <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeAccentColorPicker" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeAccentColor')">
                                        <input type="text" class="admin-input" id="cmsThemeAccentColor" name="theme_accent_color" placeholder="#00f2fe" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeAccentColorPicker')">
                                    </div>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Hintergrund (Dark)</label>
                                    <div style="display:flex; gap:10px;">
                                        <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeBgColorPicker" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeBgColor')">
                                        <input type="text" class="admin-input" id="cmsThemeBgColor" name="theme_bg_color" placeholder="#0a0a0f" oninput="CmsSettingsPage.syncColor(this, 'cmsThemeBgColorPicker')">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Ecken-Radius</label>
                                    <input type="text" class="admin-input" id="cmsThemeBorderRadius" name="theme_border_radius" placeholder="12px" oninput="CmsSettingsPage.updateLivePreview()">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Hintergrundbild (Wallpaper)</label>
                                <input type="text" class="admin-input" id="cmsThemeBgImage" name="theme_bg_image" placeholder="URL" oninput="CmsSettingsPage.updateLivePreview()">
                                <input type="file" class="admin-input" id="cmsThemeBgFile" name="bg_file" accept="image/*" style="margin-top:0.5rem;" onchange="CmsSettingsPage.handleFilePreview(this, 'cmsBgPreview')">
                            </div>
                        </div>

                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-eye"></i> Vorschau</div>
                            </div>
                            <div style="text-align:center; padding: 2.5rem; background: var(--bg-dark); border-radius: var(--border-radius); border: 1px solid rgba(255,255,255,0.05); position: relative; overflow: hidden; min-height: 250px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                <div id="cmsBgPreview" style="position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.3; pointer-events: none;"></div>
                                <img id="cmsLogoPreview" src="" style="max-height: 60px; margin-bottom: 1rem; position: relative; z-index: 1;" onerror="this.style.display='none'">
                                <h2 id="cmsNamePreview" style="color: var(--text-main); position: relative; z-index: 1;">—</h2>
                                <div style="margin-top: 1.5rem; display: flex; gap: 10px; justify-content: center; position: relative; z-index: 1;">
                                    <button class="btn-admin btn-primary" type="button">Primär</button>
                                    <button class="btn-admin btn-secondary" type="button">Sekundär</button>
                                </div>
                            </div>
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

                // Detailed Theme Fields
                document.getElementById('cmsThemePrimaryColor').value = s.theme_primary_color || '';
                if (s.theme_primary_color?.startsWith('#')) document.getElementById('cmsThemePrimaryColorPicker').value = s.theme_primary_color;

                document.getElementById('cmsThemeAccentColor').value = s.theme_accent_color || '';
                if (s.theme_accent_color?.startsWith('#')) document.getElementById('cmsThemeAccentColorPicker').value = s.theme_accent_color;

                document.getElementById('cmsThemeBgColor').value = s.theme_bg_color || '';
                if (s.theme_bg_color?.startsWith('#')) document.getElementById('cmsThemeBgColorPicker').value = s.theme_bg_color;

                document.getElementById('cmsThemeBorderRadius').value = s.theme_border_radius || '';
                document.getElementById('cmsThemeBgImage').value = s.theme_bg_image || '';

                // Modules
                if (document.getElementById('modVouchers')) document.getElementById('modVouchers').checked = s.module_vouchers === 'true';
                if (document.getElementById('modLogs')) document.getElementById('modLogs').checked = s.module_logs === 'true';
                if (document.getElementById('modEvents')) document.getElementById('modEvents').checked = s.module_events === 'true';
                if (document.getElementById('modMaintenance')) document.getElementById('modMaintenance').checked = s.module_maintenance === 'true';
                if (document.getElementById('modDiscord')) document.getElementById('modDiscord').checked = s.module_discord === 'true';
                if (document.getElementById('modStash')) document.getElementById('modStash').checked = s.module_stash === 'true';

                // SEO & Footer
                if (document.getElementById('cmsSiteDescription')) document.getElementById('cmsSiteDescription').value = s.site_description || '';
                if (document.getElementById('cmsSiteKeywords')) document.getElementById('cmsSiteKeywords').value = s.site_keywords || '';
                if (document.getElementById('cmsDefaultLanguage')) document.getElementById('cmsDefaultLanguage').value = s.default_language || 'de';
                if (document.getElementById('cmsFooterText')) document.getElementById('cmsFooterText').value = s.footer_text || '';
                if (document.getElementById('cmsDiscordUrl')) document.getElementById('cmsDiscordUrl').value = s.discord_url || '';

                // Discord Integration
                if (document.getElementsByName('discord_news_webhook')[0])
                    document.getElementsByName('discord_news_webhook')[0].value = s.discord_news_webhook || '';
                if (document.getElementsByName('discord_shop_webhook')[0])
                    document.getElementsByName('discord_shop_webhook')[0].value = s.discord_shop_webhook || '';

                // Advanced Styling
                document.getElementById('cmsThemeFontMain').value = s.theme_font_main || '';
                document.getElementById('cmsThemeFontHeaders').value = s.theme_font_headers || '';
                document.getElementById('cmsThemeFontUi').value = s.theme_font_ui || '';
                document.getElementById('cmsThemeFontMenuHeader').value = s.theme_font_menu_header || '';

                document.getElementById('cmsThemeTextColorMain').value = s.theme_color_text_main || '';
                if (s.theme_color_text_main?.startsWith('#')) document.getElementById('cmsThemeTextColorMainPicker').value = s.theme_color_text_main;

                document.getElementById('cmsThemeTextColorMuted').value = s.theme_color_text_muted || '';
                if (s.theme_color_text_muted?.startsWith('#')) document.getElementById('cmsThemeTextColorMutedPicker').value = s.theme_color_text_muted;

                document.getElementById('cmsThemeTextColorAccent').value = s.theme_color_text_accent || '';
                if (s.theme_color_text_accent?.startsWith('#')) document.getElementById('cmsThemeTextColorAccentPicker').value = s.theme_color_text_accent;

                document.getElementById('cmsThemeMenuHeaderColor').value = s.theme_color_menu_header || '';
                if (s.theme_color_menu_header?.startsWith('#')) document.getElementById('cmsThemeMenuHeaderColorPicker').value = s.theme_color_menu_header;

                // Available themes etc...

                // Fetch Available Themes for Dropdowns
                try {
                    const themeData = await apiFetch('/cms/available-themes');
                    console.log('[CmsSettings] Loaded available themes:', themeData);
                    
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
                } catch (e) {
                    console.error('[CmsSettings] Error loading themes:', e);
                }

                if (s.theme_mode) document.getElementById('cmsThemeMode').value = s.theme_mode;

                document.getElementById('cmsNamePreview').textContent = s.site_name || '—';
                const logo = document.getElementById('cmsLogoPreview');
                if (s.site_logo) {
                    logo.src = s.site_logo;
                    logo.style.display = 'block';
                }
            }
        } catch (e) { console.error(e); }
    },

    async save(e) {
        e.preventDefault();
        try {
            const form = document.getElementById('cmsSettingsForm');
            const token = localStorage.getItem('m2token');

            // Explicitly read all fields so checkboxes are always included correctly
            const payload = {
                site_name: document.getElementById('cmsSiteName')?.value || '',
                site_logo: document.getElementById('cmsSiteLogo')?.value || '',
                theme_mode: document.getElementById('cmsThemeMode')?.value || 'dark',
                theme_skin: document.getElementById('cmsThemeSkin')?.value || 'default',
                theme_empire: document.getElementById('cmsThemeEmpire')?.value || 'default',
                theme_primary_color: document.getElementById('cmsThemePrimaryColor')?.value || '',
                theme_accent_color: document.getElementById('cmsThemeAccentColor')?.value || '',
                theme_bg_color: document.getElementById('cmsThemeBgColor')?.value || '',
                theme_border_radius: document.getElementById('cmsThemeBorderRadius')?.value || '',
                theme_bg_image: document.getElementById('cmsThemeBgImage')?.value || '',

                // SEO & Social
                site_description: document.getElementById('cmsSiteDescription')?.value || '',
                site_keywords: document.getElementById('cmsSiteKeywords')?.value || '',
                default_language: document.getElementById('cmsDefaultLanguage')?.value || 'de',
                footer_text: document.getElementById('cmsFooterText')?.value || '',
                discord_url: document.getElementById('cmsDiscordUrl')?.value || '',

                // Modules: always read .checked state explicitly
                module_vouchers: String(document.getElementById('modVouchers')?.checked ?? false),
                module_logs: String(document.getElementById('modLogs')?.checked ?? false),
                module_events: String(document.getElementById('modEvents')?.checked ?? false),
                module_maintenance: String(document.getElementById('modMaintenance')?.checked ?? false),
                module_discord: String(document.getElementById('modDiscord')?.checked ?? false),
                module_stash: String(document.getElementById('modStash')?.checked ?? false),

                // Discord
                discord_news_webhook: document.getElementsByName('discord_news_webhook')[0]?.value || '',
                discord_shop_webhook: document.getElementsByName('discord_shop_webhook')[0]?.value || '',

                // Advanced Styling
                theme_font_main: document.getElementById('cmsThemeFontMain')?.value || '',
                theme_font_headers: document.getElementById('cmsThemeFontHeaders')?.value || '',
                theme_font_ui: document.getElementById('cmsThemeFontUi')?.value || '',
                theme_font_menu_header: document.getElementById('cmsThemeFontMenuHeader')?.value || '',
                theme_color_text_main: document.getElementById('cmsThemeTextColorMain')?.value || '',
                theme_color_text_muted: document.getElementById('cmsThemeTextColorMuted')?.value || '',
                theme_color_text_accent: document.getElementById('cmsThemeTextColorAccent')?.value || '',
                theme_color_menu_header: document.getElementById('cmsThemeMenuHeaderColor')?.value || '',
                reset_styling: document.getElementById('resetStylingFlag')?.value || 'false'
            };

            // Check if there are file uploads
            const logoFile = document.getElementById('cmsSiteLogoFile')?.files?.[0];
            const bgFile = document.getElementById('cmsThemeBgFile')?.files?.[0];

            if (logoFile || bgFile) {
                // Use FormData for file uploads
                const formData = new FormData();
                Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
                if (logoFile) formData.append('logo_file', logoFile);
                if (bgFile) formData.append('bg_file', bgFile);

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
            } else {
                // No files: send as URL-encoded (handled by express.urlencoded, 100% reliable)
                const res = await fetch('/api/cms/settings', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(payload).toString()
                });
                const data = await res.json();
                if (data.success) {
                    showToast(data.message || 'Einstellungen gespeichert!', 'success');
                    this.load();
                    if (window.renderSidebar) renderSidebar();
                } else {
                    showToast(data.message || 'Fehler beim Speichern', 'error');
                }
            }
        } catch (err) {
            console.error('[CmsSettings] Save error:', err);
            showToast('Fehler beim Speichern', 'error');
        }
    },

    syncColor(source, targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            target.value = source.value;
            this.updateLivePreview();
        }
    },

    updateLivePreview() {
        const name = document.getElementById('cmsSiteName').value;
        const logo = document.getElementById('cmsSiteLogo').value;
        const primary = document.getElementById('cmsThemePrimaryColor').value;
        const accent = document.getElementById('cmsThemeAccentColor').value;
        const bg = document.getElementById('cmsThemeBgColor').value;
        const radius = document.getElementById('cmsThemeBorderRadius').value;
        const bgImg = document.getElementById('cmsThemeBgImage').value;

        document.getElementById('cmsNamePreview').textContent = name || 'Metin2 Web';
        const logoEl = document.getElementById('cmsLogoPreview');
        if (logo) {
            logoEl.src = logo;
            logoEl.style.display = 'block';
        } else {
            logoEl.style.display = 'none';
        }

        const bgPreview = document.getElementById('cmsBgPreview');
        if (bgImg) bgPreview.style.backgroundImage = `url('${bgImg}')`;
        else bgPreview.style.backgroundImage = 'none';

        if (primary) {
            document.documentElement.style.setProperty('--primary', primary);
            const rgb = this.hexToRgb(primary);
            if (rgb) document.documentElement.style.setProperty('--primary-rgb', rgb);
        }
        if (accent) document.documentElement.style.setProperty('--accent', accent);
        if (bg) document.documentElement.style.setProperty('--bg-dark', bg);
        if (radius) document.documentElement.style.setProperty('--border-radius', radius);

        // Advanced
        const fMain = document.getElementById('cmsThemeFontMain').value;
        const fHeader = document.getElementById('cmsThemeFontHeaders').value;
        const fUi = document.getElementById('cmsThemeFontUi').value;
        const cMain = document.getElementById('cmsThemeTextColorMain').value;
        const cMuted = document.getElementById('cmsThemeTextColorMuted').value;
        const cAccent = document.getElementById('cmsThemeTextColorAccent').value;

        if (fMain) document.documentElement.style.setProperty('--font-main', `'${fMain}', sans-serif`);
        if (fHeader) document.documentElement.style.setProperty('--font-headers', `'${fHeader}', sans-serif`);
        if (fUi) document.documentElement.style.setProperty('--font-ui', `'${fUi}', sans-serif`);
        if (cMain) document.documentElement.style.setProperty('--text-main', cMain);
        if (cMuted) document.documentElement.style.setProperty('--text-muted', cMuted);
        if (cAccent) document.documentElement.style.setProperty('--accent-text', cAccent);

        const fMenuHeader = document.getElementById('cmsThemeFontMenuHeader').value;
        const cMenuHeader = document.getElementById('cmsThemeMenuHeaderColor').value;
        if (fMenuHeader) document.documentElement.style.setProperty('--font-menu-header', `'${fMenuHeader}', sans-serif`);
        if (cMenuHeader) document.documentElement.style.setProperty('--menu-header-color', cMenuHeader);
    },

    async resetToDefault() {
        if (await customConfirm('Styling wirklich zurücksetzen?', 'Alle individuellen Schrift- und Farbanpassungen werden gelöscht.')) {
            document.getElementById('resetStylingFlag').value = 'true';
            this.save({ preventDefault: () => {} });
        }
    },

    handleFilePreview(input, previewId) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const el = document.getElementById(previewId);
                if (previewId.includes('Bg')) {
                    el.style.backgroundImage = `url('${e.target.result}')`;
                } else {
                    el.src = e.target.result;
                    el.style.display = 'block';
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    hexToRgb(hex) {
        if (!hex || !hex.startsWith('#')) return null;
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return isNaN(r) || isNaN(g) || isNaN(b) ? null : `${r}, ${g}, ${b}`;
    }
};

window.CmsSettingsPage = CmsSettingsPage;
