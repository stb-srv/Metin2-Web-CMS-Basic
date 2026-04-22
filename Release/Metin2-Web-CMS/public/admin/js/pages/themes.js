/**
 * Admin: Themes Management Page
 * Allows creating and switching between professional theme presets.
 */

const ThemesPage = {
    themes: [],

    render() {
        return `
            <div class="cms-settings-container anim-up">
                <div class="settings-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2><i class="fas fa-palette"></i> Design-Vorlagen (Themes)</h2>
                        <p style="color: var(--text-muted);">Erstelle professionelle Layouts oder nutze unsere Vorgaben.</p>
                    </div>
                    <button class="btn-admin btn-primary" onclick="ThemesPage.openThemeModal()">
                        <i class="fas fa-plus"></i> Neues Theme erstellen
                    </button>
                </div>

                <div id="themesGrid" class="themes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                    <div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted);">
                        <i class="fas fa-spinner fa-spin fa-2x"></i><br><br>
                        Lade Themes...
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        await this.loadThemes();
        this.renderThemes();
    },

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
                        <button class="btn-admin btn-sm btn-primary" style="flex: 1;" onclick="ThemesPage.activateTheme(${theme.id})">
                            <i class="fas fa-check"></i> Aktivieren
                        </button>
                    ` : `
                        <button class="btn-admin btn-sm" style="flex: 1; opacity: 0.5; cursor: default;" disabled>
                            <i class="fas fa-check-circle"></i> Aktiv
                        </button>
                    `}
                    <button class="btn-admin btn-sm btn-secondary" onclick="ThemesPage.openThemeModal(${theme.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-admin btn-sm btn-danger icon-btn" onclick="ThemesPage.deleteTheme(${theme.id})">
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
                    // Reload the page to apply changes immediately
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
                    window.navigateTo('themes');
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
                        <label>Primärfarbe (Primary)</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="color" name="primary_color" value="${theme.primary_color}" style="width: 50px; height: 38px; padding: 2px;">
                            <input type="text" value="${theme.primary_color}" placeholder="#RRGGBB" style="flex: 1;" oninput="this.previousElementSibling.value = this.value">
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Akzentfarbe (Accent)</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="color" name="accent_color" value="${theme.accent_color}" style="width: 50px; height: 38px; padding: 2px;">
                            <input type="text" value="${theme.accent_color}" placeholder="#RRGGBB" style="flex: 1;" oninput="this.previousElementSibling.value = this.value">
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="input-group">
                        <label>Hintergrundfarbe (Background)</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="color" name="bg_color" value="${theme.bg_color}" style="width: 50px; height: 38px; padding: 2px;">
                            <input type="text" value="${theme.bg_color}" placeholder="#RRGGBB" style="flex: 1;" oninput="this.previousElementSibling.value = this.value">
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
                    window.navigateTo('themes');
                }
            } catch (err) {
                showToast('Error', 'Speichern fehlgeschlagen.', 'error');
            }
        };
    }
};

window.ThemesPage = ThemesPage;
