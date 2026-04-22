const DesignStudioPage = {
    title: 'Design Studio',
    icon: 'fa-paint-brush',
    breadcrumb: 'Content &rsaquo; Design Studio',
    themes: [],

    render() {
        return `
            <div class="admin-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                <button class="btn-tab active" onclick="DesignStudioPage.switchTab('themes', this)"><i class="fas fa-palette"></i> Design-Vorlagen (Themes)</button>
                <button class="btn-tab" onclick="DesignStudioPage.switchTab('styling-dark', this)"><i class="fas fa-moon"></i> Dark-Mode Farben</button>
                <button class="btn-tab" onclick="DesignStudioPage.switchTab('styling-light', this)"><i class="fas fa-sun"></i> Light-Mode Farben</button>
                <button class="btn-tab" onclick="DesignStudioPage.switchTab('typography', this)"><i class="fas fa-font"></i> Typografie & Basis</button>
            </div>

            <form id="designStudioForm" onsubmit="DesignStudioPage.save(event)">
                <input type="hidden" id="resetStylingFlag" name="reset_styling" value="false">
                
                <!-- Tab: Themes -->
                <div id="tab-themes" class="tab-content active">
                    <div class="settings-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <div>
                            <h2>Design-Vorlagen</h2>
                            <p style="color: var(--text-muted);">Erstelle professionelle Layouts oder nutze unsere Vorgaben.</p>
                        </div>
                        <button type="button" class="btn-admin btn-primary" onclick="DesignStudioPage.openThemeModal()">
                            <i class="fas fa-plus"></i> Neues Theme erstellen
                        </button>
                    </div>
                    <div id="themesGrid" class="themes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                        <div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted);">
                            <i class="fas fa-spinner fa-spin fa-2x"></i><br><br>Lade Themes...
                        </div>
                    </div>
                </div>

                <!-- Tab: Dark Mode -->
                <div id="tab-styling-dark" class="tab-content" style="display:none;">
                    <div class="admin-grid admin-grid-2">
                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-moon"></i> Dark-Mode Farben</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Haupt-Text (Dark)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeTextColorMainDarkPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorMainDark')">
                                    <input type="text" class="admin-input" id="cmsThemeTextColorMainDark" name="theme_color_text_main_dark" placeholder="#f8fafc" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorMainDarkPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Gedimmter Text (Muted)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeTextColorMutedDarkPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorMutedDark')">
                                    <input type="text" class="admin-input" id="cmsThemeTextColorMutedDark" name="theme_color_text_muted_dark" placeholder="#94a3b8" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorMutedDarkPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Akzent-Text (Highlight)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeTextColorAccentDarkPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorAccentDark')">
                                    <input type="text" class="admin-input" id="cmsThemeTextColorAccentDark" name="theme_color_text_accent_dark" placeholder="#00f2fe" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorAccentDarkPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Menü-Überschriften</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeMenuHeaderColorDarkPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeMenuHeaderColorDark')">
                                    <input type="text" class="admin-input" id="cmsThemeMenuHeaderColorDark" name="theme_color_menu_header_dark" placeholder="#ffffff" oninput="DesignStudioPage.syncColor(this, 'cmsThemeMenuHeaderColorDarkPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Hintergrundfarbe (Dark)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeBgColorDarkPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeBgColorDark')">
                                    <input type="text" class="admin-input" id="cmsThemeBgColorDark" name="theme_bg_color_dark" placeholder="#0a0a0f" oninput="DesignStudioPage.syncColor(this, 'cmsThemeBgColorDarkPicker')">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Light Mode -->
                <div id="tab-styling-light" class="tab-content" style="display:none;">
                    <div class="admin-grid admin-grid-2">
                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-sun"></i> Light-Mode Farben</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Haupt-Text (Light)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeTextColorMainLightPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorMainLight')">
                                    <input type="text" class="admin-input" id="cmsThemeTextColorMainLight" name="theme_color_text_main_light" placeholder="#1e293b" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorMainLightPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Gedimmter Text (Muted)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeTextColorMutedLightPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorMutedLight')">
                                    <input type="text" class="admin-input" id="cmsThemeTextColorMutedLight" name="theme_color_text_muted_light" placeholder="#64748b" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorMutedLightPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Akzent-Text (Highlight)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeTextColorAccentLightPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorAccentLight')">
                                    <input type="text" class="admin-input" id="cmsThemeTextColorAccentLight" name="theme_color_text_accent_light" placeholder="#0284c7" oninput="DesignStudioPage.syncColor(this, 'cmsThemeTextColorAccentLightPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Menü-Überschriften</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeMenuHeaderColorLightPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeMenuHeaderColorLight')">
                                    <input type="text" class="admin-input" id="cmsThemeMenuHeaderColorLight" name="theme_color_menu_header_light" placeholder="#0f172a" oninput="DesignStudioPage.syncColor(this, 'cmsThemeMenuHeaderColorLightPicker')">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Hintergrundfarbe (Light)</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="color" class="admin-input" style="width:50px; padding:2px; height:38px;" id="cmsThemeBgColorLightPicker" oninput="DesignStudioPage.syncColor(this, 'cmsThemeBgColorLight')">
                                    <input type="text" class="admin-input" id="cmsThemeBgColorLight" name="theme_bg_color_light" placeholder="#f8fafc" oninput="DesignStudioPage.syncColor(this, 'cmsThemeBgColorLightPicker')">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Typography & Base -->
                <div id="tab-typography" class="tab-content" style="display:none;">
                    <div class="admin-grid admin-grid-2">
                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-font"></i> Typografie</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Haupt-Schriftart (Body)</label>
                                <select class="admin-input" id="cmsThemeFontMain" name="theme_font_main" onchange="DesignStudioPage.updateLivePreview()">
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
                                <select class="admin-input" id="cmsThemeFontHeaders" name="theme_font_headers" onchange="DesignStudioPage.updateLivePreview()">
                                    <option value="">Wie Body</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Cinzel">Cinzel</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Forum">Forum (Edel)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">UI Elemente (Buttons/Menü)</label>
                                <select class="admin-input" id="cmsThemeFontUi" name="theme_font_ui" onchange="DesignStudioPage.updateLivePreview()">
                                    <option value="">Wie Body</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Cinzel">Cinzel</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Überschriften-Schriftart (Dropdowns)</label>
                                <select class="admin-input" id="cmsThemeFontMenuHeader" name="theme_font_menu_header" onchange="DesignStudioPage.updateLivePreview()">
                                    <option value="">Wie Überschriften</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Cinzel">Cinzel</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Forum">Forum</option>
                                </select>
                            </div>
                        </div>

                        <div class="admin-card">
                            <div class="admin-card-header">
                                <div class="admin-card-title"><i class="fas fa-image"></i> Hintergrund & Scan</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Individuelles Hintergrundbild</label>
                                <input type="text" class="admin-input" id="cmsThemeBgImage" name="theme_bg_image" placeholder="URL" oninput="DesignStudioPage.updateLivePreview(); DesignStudioPage.scanBgColor();">
                                <input type="file" class="admin-input" id="cmsThemeBgFile" name="bg_file" accept="image/*" style="margin-top:0.5rem;" onchange="DesignStudioPage.handleBgFile(this)">
                                <div id="bgScanResult" style="margin-top:10px; font-size: 0.85rem; color: var(--text-muted);">
                                    <!-- Scan Results injected here -->
                                </div>
                            </div>
                            <canvas id="bgScannerCanvas" style="display:none;"></canvas>
                        </div>

                        <div class="admin-card" style="border: 1px dashed var(--danger); background: rgba(220, 53, 69, 0.05);">
                            <div class="admin-card-header">
                                <div class="admin-card-title" style="color:var(--danger);"><i class="fas fa-undo"></i> Zurücksetzen</div>
                            </div>
                            <p style="font-size:0.8rem; margin-bottom:1rem;">Möchten Sie alle individuellen Schrift- und Farbanpassungen löschen und zu den Standardwerten des Skins zurückkehren?</p>
                            <button type="button" class="btn-admin btn-danger btn-sm" onclick="DesignStudioPage.resetToDefault()"><i class="fas fa-trash"></i> Styling komplett zurücksetzen</button>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 20px; position: sticky; bottom: 0; background: var(--bg-card); padding: 15px; border-radius: 12px; border-top: 1px solid rgba(255,255,255,0.05); z-index: 10;">
                    <button type="submit" class="btn-admin btn-primary btn-block"><i class="fas fa-save"></i> Design-Einstellungen speichern</button>
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

    async init() {
        await this.loadThemes();
        this.renderThemes();
        await this.loadSettings();
    },

    // --- Settings Load & Save ---

    async loadSettings() {
        try {
            const data = await apiFetch('/cms/settings/admin');
            if (data.success) {
                const s = data.settings;
                
                // Load Split Colors
                const m = [
                    ['Dark', '_dark', s],
                    ['Light', '_light', s]
                ];

                for (let i = 0; i < m.length; i++) {
                    let suffix = m[i][1];
                    let prefix = m[i][0];
                    let modePrefix = `theme_color_text_main${suffix}`;
                    this.setField(`cmsThemeTextColorMain${prefix}`, s[modePrefix] || '');
                    this.setField(`cmsThemeTextColorMuted${prefix}`, s[`theme_color_text_muted${suffix}`] || '');
                    this.setField(`cmsThemeTextColorAccent${prefix}`, s[`theme_color_text_accent${suffix}`] || '');
                    this.setField(`cmsThemeMenuHeaderColor${prefix}`, s[`theme_color_menu_header${suffix}`] || '');
                    this.setField(`cmsThemeBgColor${prefix}`, s[`theme_bg_color${suffix}`] || '');

                    if(s[modePrefix]?.startsWith('#')) this.setField(`cmsThemeTextColorMain${prefix}Picker`, s[modePrefix]);
                    if(s[`theme_color_text_muted${suffix}`]?.startsWith('#')) this.setField(`cmsThemeTextColorMuted${prefix}Picker`, s[`theme_color_text_muted${suffix}`]);
                    if(s[`theme_color_text_accent${suffix}`]?.startsWith('#')) this.setField(`cmsThemeTextColorAccent${prefix}Picker`, s[`theme_color_text_accent${suffix}`]);
                    if(s[`theme_color_menu_header${suffix}`]?.startsWith('#')) this.setField(`cmsThemeMenuHeaderColor${prefix}Picker`, s[`theme_color_menu_header${suffix}`]);
                    if(s[`theme_bg_color${suffix}`]?.startsWith('#')) this.setField(`cmsThemeBgColor${prefix}Picker`, s[`theme_bg_color${suffix}`]);
                }

                // Advanced Typography
                this.setField('cmsThemeFontMain', s.theme_font_main || '');
                this.setField('cmsThemeFontHeaders', s.theme_font_headers || '');
                this.setField('cmsThemeFontUi', s.theme_font_ui || '');
                this.setField('cmsThemeFontMenuHeader', s.theme_font_menu_header || '');
                
                // BG Image
                this.setField('cmsThemeBgImage', s.theme_bg_image || '');
            }
        } catch (e) { console.error(e); }
    },

    setField(id, val) {
        if (document.getElementById(id)) document.getElementById(id).value = val;
    },

    syncColor(source, targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            target.value = source.value;
            this.updateLivePreview();
        }
    },

    updateLivePreview() {
        if(typeof window.applyThemeStyles === 'function') {
           // We might want real-time preview updating here but we must prevent it from breaking the form.
        }
    },

    async resetToDefault() {
        if (await customConfirm('Styling wirklich zurücksetzen?', 'Alle individuellen Schrift- und Farbanpassungen werden gelöscht. Dies inkludiert Dark- und Light-Mode Anpassungen sowie Typografie.')) {
            document.getElementById('resetStylingFlag').value = 'true';
            this.save({ preventDefault: () => {} });
        }
    },

    async save(e) {
        if (e && e.preventDefault) e.preventDefault();
        try {
            const formData = new FormData(document.getElementById('designStudioForm'));
            const token = localStorage.getItem('m2token');
            const res = await fetch('/api/cms/settings', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                showToast(data.message || 'Design gespeichert!', 'success');
                if (document.getElementById('resetStylingFlag').value === 'true') {
                    setTimeout(() => location.reload(), 800);
                }
            } else {
                showToast(data.message || 'Fehler beim Speichern', 'error');
            }
        } catch (err) {
            console.error('[DesignStudio] Save error:', err);
            showToast('Fehler beim Speichern', 'error');
        }
    },

    // --- Background Scanning Logic ---

    handleBgFile(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.setField('cmsThemeBgImage', ''); // Clear URL if using file
                this.scanBgColor(e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    scanBgColor(imgSrcUrl = null) {
        const src = imgSrcUrl || document.getElementById('cmsThemeBgImage').value;
        const resDiv = document.getElementById('bgScanResult');
        if (!src) {
            resDiv.innerHTML = '';
            return;
        }

        resDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysiere Hintergrundbild...';

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.getElementById('bgScannerCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            
            // Sample the image to find average brightness
            let r=0, g=0, b=0;
            // Let's sample a grid to avoid massive processing on large images
            const step = Math.max(1, Math.floor(img.width * img.height / 1000));
            const data = ctx.getImageData(0,0, img.width, img.height).data;
            let count = 0;
            for(let i = 0; i < data.length; i += step * 4) {
                r += data[i];
                g += data[i+1];
                b += data[i+2];
                count++;
            }
            r = Math.floor(r/count);
            g = Math.floor(g/count);
            b = Math.floor(b/count);

            // Perceived brightness formula
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            
            if (brightness > 128) {
                // Bright image
                resDiv.innerHTML = `<div style="color: var(--danger);"><i class="fas fa-exclamation-triangle"></i> <strong>Helles Bild erkannt!</strong> Wir empfehlen, in den White Mode zu wechseln oder dunkle Schriftfarben und einen dunklen Hintergrund Overlay zu verwenden.</div>`;
            } else {
                // Dark image
                resDiv.innerHTML = `<div style="color: var(--success);"><i class="fas fa-check-circle"></i> Dunkles Bild erkannt. Dark Mode sollte gut lesbar sein.</div>`;
            }
        };
        img.onerror = () => {
            resDiv.innerHTML = 'Konnte Bild nicht scannen (Cross-Origin Beschränkung oder URL ungültig).';
        };
        img.src = src;
    },

    // --- Themes Logic (inherited from themes.js) ---

    renderThemes() {
        const container = document.getElementById('themesGrid');
        if (!container) return;
        if (this.themes.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted);">Keine Themes gefunden.</div>`;
            return;
        }
        container.innerHTML = this.themes.map(theme => `
            <div class="theme-card glass-panel ${theme.is_active ? 'active-theme' : ''}" style="padding: 1.5rem; border: 1px solid ${theme.is_active ? 'var(--primary)' : 'var(--glass-border)'}; position: relative;">
                ${theme.is_active ? '<span class="active-badge" style="position: absolute; top: 10px; right: 10px; background: var(--primary); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">AKTIV</span>' : ''}
                <h3 style="margin-bottom: 1rem; color: var(--text-main);">${theme.name}</h3>
                <div class="theme-preview" style="height: 100px; border-radius: 8px; background: ${theme.bg_color}; padding: 10px; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 8px;">
                    <div style="height: 15px; width: 60%; background: ${theme.primary_color}; border-radius: 4px;"></div>
                    <div style="height: 15px; width: 40%; background: ${theme.accent_color}; border-radius: 4px;"></div>
                    <div style="height: 30px; width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: ${theme.border_radius};"></div>
                </div>
                <div style="display: flex; gap: 8px;">
                    ${!theme.is_active ? `
                        <button class="btn-admin btn-sm btn-primary" style="flex: 1;" onclick="DesignStudioPage.activateTheme(${theme.id})">
                            <i class="fas fa-check"></i> Aktivieren
                        </button>
                    ` : `
                        <button class="btn-admin btn-sm" style="flex: 1; opacity: 0.5; cursor: default;" disabled>
                            <i class="fas fa-check-circle"></i> Aktiv
                        </button>
                    `}
                    <button class="btn-admin btn-sm btn-secondary" onclick="DesignStudioPage.openThemeModal(${theme.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-admin btn-sm btn-danger icon-btn" onclick="DesignStudioPage.deleteTheme(${theme.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    async loadThemes() {
        try {
            const data = await apiFetch('/cms/themes');
            if (data.success) {
                this.themes = data.themes;
            }
        } catch (err) {
            console.error('Failed to load themes', err);
        }
    },

    async activateTheme(id) {
        customConfirm('Möchtest du dieses Theme wirklich aktivieren? Alle User sehen die Website dann in diesem Design.', async () => {
            try {
                const data = await apiPost(`/cms/themes/${id}/activate`);
                if (data.success) {
                    showToast('Success', 'Theme aktiviert!', 'success');
                    setTimeout(() => location.reload(), 800);
                }
            } catch (err) {
                showToast('Error', 'Aktivierung fehlgeschlagen.', 'error');
            }
        });
    },

    async deleteTheme(id) {
        customConfirm('Dieses Theme wirklich löschen?', async () => {
            try {
                const data = await apiDelete(`/cms/themes/${id}`);
                if (data.success) {
                    showToast('Theme gelöscht.', 'info');
                    this.init();
                }
            } catch (e) {
                showToast('Error', 'Löschen fehlgeschlagen.', 'error');
            }
        });
    },

    openThemeModal(id = null) {
        const theme = id ? this.themes.find(t => t.id === id) : {
            name: '',
            primary_color: '#cc0000',
            accent_color: '#ff4d4d',
            bg_color: '#1a0000',
            border_radius: '12px',
            bg_image: ''
        };

        const modalHtml = `
            <form id="themeForm" style="display: grid; gap: 15px;">
                <input type="hidden" name="id" value="${theme.id || ''}">
                <div class="input-group">
                    <label>Name der Vorlage</label>
                    <input type="text" name="name" value="${theme.name}" placeholder="z.B. Winter-Design" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="input-group">
                        <label>Primärfarbe</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="color" name="primary_color" value="${theme.primary_color}" style="width: 50px; height: 38px; padding: 2px;">
                            <input type="text" value="${theme.primary_color}" style="flex: 1;" oninput="this.previousElementSibling.value = this.value">
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Akzentfarbe</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="color" name="accent_color" value="${theme.accent_color}" style="width: 50px; height: 38px; padding: 2px;">
                            <input type="text" value="${theme.accent_color}" style="flex: 1;" oninput="this.previousElementSibling.value = this.value">
                        </div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="input-group">
                        <label>Hintergrundfarbe</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="color" name="bg_color" value="${theme.bg_color}" style="width: 50px; height: 38px; padding: 2px;">
                            <input type="text" value="${theme.bg_color}" style="flex: 1;" oninput="this.previousElementSibling.value = this.value">
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Abrundungen (Border Radius)</label>
                        <input type="text" name="border_radius" value="${theme.border_radius}" placeholder="z.B. 12px oder 0px">
                    </div>
                </div>
                <div class="input-group">
                    <label>Hintergrundbild URL (Optional)</label>
                    <input type="text" name="bg_image" value="${theme.bg_image}" placeholder="https://...">
                </div>
                <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
                    <button type="submit" class="btn-admin btn-primary">
                        <i class="fas fa-save"></i> Theme speichern
                    </button>
                </div>
            </form>
        `;

        showModal(id ? 'Theme bearbeiten' : 'Neues Theme erstellen', modalHtml);

        document.getElementById('themeForm').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            try {
                const res = await apiPost('/cms/themes', data);
                if (res.success) {
                    showToast('Theme gespeichert!', 'success');
                    closeModal();
                    this.init();
                }
            } catch (err) {
                showToast('Error', 'Speichern fehlgeschlagen.', 'error');
            }
        };
    }
};

window.DesignStudioPage = DesignStudioPage;

