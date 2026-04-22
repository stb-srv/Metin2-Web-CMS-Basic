// Immediately Invoked Function Expression to run before page loads
(function () {
    // 1. Load immediately from local storage to prevent Flash of Unstyled Content
    const localMode = localStorage.getItem('site-theme-mode') || 'dark';
    const localSkin = localStorage.getItem('site-theme-skin') || 'default';
    const localEmpire = localStorage.getItem('site-theme-empire') || 'default';
    const userMode = localStorage.getItem('user-theme-mode'); // user override for light/dark

    const activeMode = userMode || localMode;

    function hexToRgb(hex) {
        if (!hex) return null;
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return isNaN(r) || isNaN(g) || isNaN(b) ? null : `${r}, ${g}, ${b}`;
    }

    function applyStyles(mode, skin, empire, customTheme = null) {
        if (!customTheme && window.siteSettings) customTheme = window.siteSettings;
        if (!customTheme) customTheme = {};
        
        // Mode handling
        const target = document.body || document.documentElement;
        if (mode === 'light' || mode === 'white') {
            target.classList.add('light-mode');
        } else {
            target.classList.remove('light-mode');
        }

        // Body specific classes (Skin & Empire)
        if (document.body) {
            // Comprehensive cleanup
            const skins = ['skin-sovereign', 'skin-default', 'skin-premium'];
            const themes = ['theme-blue', 'theme-red', 'theme-yellow', 'theme-jinno', 'theme-shinsoo', 'theme-chunjo'];
            document.body.classList.remove(...skins, ...themes);

            if (skin && skin !== 'default') document.body.classList.add(`skin-${skin}`);
            if (empire && empire !== 'default') {
                let themeClass = empire;
                if (empire === 'jinno' || empire === 'blue') themeClass = 'blue';
                else if (empire === 'shinsoo' || empire === 'red') themeClass = 'red';
                else if (empire === 'chunjo' || empire === 'yellow') themeClass = 'yellow';
                document.body.classList.add(`theme-${themeClass}`);
            }
        }

        // Dynamic Skin Link
        applyCssLink('dynamic-skin-css', skin && skin !== 'default' ? `/css/skins/${skin}.css` : null);
        applyCssLink('dynamic-empire-css', empire && empire !== 'default' ? getEmpireCssPath(empire) : null);

        // Custom Theme Variables
        applyCustomVars(customTheme, mode);

        // Custom Background Handling
        applyBackground(customTheme.theme_bg_image || customTheme.bg_image, mode);

        // Branding (Logo & Name)
        applyBranding(customTheme);

        // Page Titles
        if (customTheme.site_name && !document.title.includes(customTheme.site_name)) {
            const current = document.title.includes('|') ? document.title.split('|').pop().trim() : document.title;
            document.title = `${customTheme.site_name} | ${current}`;
        }

        // Dispatch event
        document.dispatchEvent(new CustomEvent('themeUpdated', { detail: { mode, skin, empire, customTheme } }));
    }

    // Helper: Apply Background logic
    function applyBackground(bgImg, mode) {
        const bgOverlay = document.querySelector('.bg-overlay');
        const particles = document.getElementById('particles-js');

        // 1. Handle .bg-overlay
        if (bgOverlay) {
            if (bgImg) {
                bgOverlay.style.backgroundImage = `url('${bgImg}')`;
                bgOverlay.style.opacity = '1';
                bgOverlay.style.backgroundSize = 'cover';
                bgOverlay.style.backgroundPosition = 'center';
            } else {
                // If NO custom background image, reset to CSS defaults
                bgOverlay.style.backgroundImage = 'none';
                bgOverlay.style.opacity = '0'; // Hide it if it has no image
            }
        }

        // 2. Handle Particles Opacity
        if (particles) {
            // If we have a custom BG image, particles should be subtle
            if (bgImg) {
                particles.style.opacity = '0.2';
            } else {
                // Default visibility based on mode
                particles.style.opacity = (mode === 'light' || mode === 'white') ? '0.3' : '1';
            }
        }
    }

    // Helper: Apply Branding logic (Logo & Name)
    function applyBranding(customTheme) {
        if (!customTheme) customTheme = window.siteSettings || {};
        const sn = customTheme.site_name || 'Metin2 Web';
        const logo = (customTheme.site_logo && customTheme.site_logo.trim().length > 0) ? customTheme.site_logo : null;

        // Names
        document.querySelectorAll('#siteNameDisplay, #adminSidebarBrandText, .site-name-footer, #heroSiteName').forEach(el => {
            el.textContent = sn;
            if (el.id === 'siteNameDisplay' || el.id === 'adminSidebarBrandText') {
                el.style.display = logo ? 'none' : 'block';
            }
        });

        // Logo Images
        document.querySelectorAll('#navLogoImg, #adminSidebarBrandImg').forEach(img => {
            if (logo) {
                img.src = logo;
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
        });

        // Logo Icons
        document.querySelectorAll('#navLogoIcon, #adminSidebarBrandIcon').forEach(icon => {
            icon.style.display = logo ? 'none' : 'block';
        });
    }

    // --- Sub-Helpers ---
    function applyCssLink(id, href) {
        let link = document.getElementById(id);
        if (!link) {
            link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        if (href) link.href = href;
        else link.removeAttribute('href');
    }

    function getEmpireCssPath(empire) {
        if (empire === 'blue' || empire === 'jinno') return '/css/themes/jinno-blue.css';
        if (empire === 'red' || empire === 'shinsoo') return '/css/themes/shinsoo-red.css';
        if (empire === 'yellow' || empire === 'chunjo') return '/css/themes/chunjo-yellow.css';
        return `/css/themes/${empire}.css`;
    }

    function applyCustomVars(s, mode) {
        if (!s) return;
        let vars = '';
        
        // Key Mapping (Supports legacy and new naming)
        const p = s.theme_primary_color || s.primary_color || s.theme_primary || s.primary;
        const a = s.theme_accent_color || s.accent_color || s.theme_accent || s.accent;
        const b = s[`theme_bg_color_${mode}`] || s.theme_bg_color || s.theme_bg || s.bg;
        const r = s.theme_border_radius || s.border_radius || s.theme_radius;
        
        // Advanced
        const fMain = s.theme_font_main;
        const fHeader = s.theme_font_headers;
        const fUi = s.theme_font_ui;
        const fMenuHeader = s.theme_font_menu_header;
        
        // Split Mode Variables
        const cMain = s[`theme_color_text_main_${mode}`] || s.theme_color_text_main;
        const cMuted = s[`theme_color_text_muted_${mode}`] || s.theme_color_text_muted;
        const cAccent = s[`theme_color_text_accent_${mode}`] || s.theme_color_text_accent;
        const cMenuHeader = s[`theme_color_menu_header_${mode}`] || s.theme_color_menu_header;

        if (p) { vars += `--primary: ${p};`; const rgb = hexToRgb(p); if (rgb) vars += `--primary-rgb: ${rgb};`; }
        if (a) { vars += `--accent: ${a};`; const rgb = hexToRgb(a); if (rgb) vars += `--accent-rgb: ${rgb};`; }
        if (b) { vars += `--bg-dark: ${b};`; const rgb = hexToRgb(b); if (rgb) vars += `--bg-dark-rgb: ${rgb};`; }
        if (r) vars += `--border-radius: ${r};`;

        // Load fonts from Google if specified
        const fontsToLoad = [fMain, fHeader, fUi, fMenuHeader].filter(f => f && f !== 'default');
        if (fontsToLoad.length > 0) {
            const fontFamilies = [...new Set(fontsToLoad)].map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&');
            const fontUrl = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
            applyCssLink('dynamic-google-fonts', fontUrl);
        }

        if (fMain) vars += `--font-main: '${fMain}', sans-serif;`;
        if (fHeader) vars += `--font-headers: '${fHeader}', sans-serif;`;
        if (fUi) vars += `--font-ui: '${fUi}', sans-serif;`;
        if (fMenuHeader) vars += `--font-menu-header: '${fMenuHeader}', sans-serif;`;
        if (cMain) vars += `--text-main: ${cMain};`;
        if (cMuted) vars += `--text-muted: ${cMuted};`;
        if (cAccent) vars += `--accent-text: ${cAccent};`;
        if (cMenuHeader) vars += `--menu-header-color: ${cMenuHeader};`;

        let tag = document.getElementById('dynamic-custom-vars');
        if (!tag) {
            tag = document.createElement('style');
            tag.id = 'dynamic-custom-vars';
            document.head.appendChild(tag);
        } else {
            // Re-append to ensure it's at the end of head (overriding other styles)
            document.head.appendChild(tag);
        }
        tag.innerHTML = vars ? `:root { ${vars} }` : '';
    }

    // --- Global Export ---
    window.applyThemeStyles = () => {
        const mode = localStorage.getItem('user-theme-mode') || localStorage.getItem('site-theme-mode') || 'dark';
        const skin = localStorage.getItem('site-theme-skin') || 'default';
        const empire = localStorage.getItem('site-theme-empire') || 'default';
        applyStyles(mode, skin, empire, window.siteSettings);
    };

    // --- Initialization ---
    applyStyles(activeMode, localSkin, localEmpire);
    document.addEventListener('DOMContentLoaded', window.applyThemeStyles);
    document.addEventListener('settingsLoaded', (e) => {
        const s = e.detail;
        if (!s) return;
        window.siteSettings = s;
        if (s.theme_mode) localStorage.setItem('site-theme-mode', s.theme_mode);
        if (s.theme_skin) localStorage.setItem('site-theme-skin', s.theme_skin);
        if (s.theme_empire) localStorage.setItem('site-theme-empire', s.theme_empire);
        window.applyThemeStyles();
    });

    // Auto-apply when new elements are added (e.g. sidebar)
    const observer = new MutationObserver((mutations) => {
        const brandingElements = ['siteNameDisplay', 'adminSidebarBrandText', 'navLogoImg', 'adminSidebarBrandImg'];
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.id && brandingElements.includes(node.id)) {
                    applyBranding(window.siteSettings);
                    return;
                }
                if (node.querySelectorAll) {
                    const found = node.querySelectorAll(brandingElements.map(id => `#${id}`).join(','));
                    if (found.length > 0) {
                        applyBranding(window.siteSettings);
                        return;
                    }
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Fallback fetch
    const initFetch = async () => {
        try {
            const res = await fetch(`/api/cms/settings?t=${Date.now()}`);
            const data = await res.json();
            if (data.success && data.settings && !window.CMS_STATE) {
                document.dispatchEvent(new CustomEvent('settingsLoaded', { detail: data.settings }));
            }
        } catch (e) {}
    };
    if (document.readyState === 'complete') initFetch();
    else window.addEventListener('load', initFetch);

})();
