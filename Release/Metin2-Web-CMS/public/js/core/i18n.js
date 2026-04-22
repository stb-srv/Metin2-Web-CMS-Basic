/**
 * I18n Core Logic
 * Handles language loading, switching, and page translation.
 */

const i18n = {
    currentLang: localStorage.getItem('m2lang') || 'en',
    translations: {},
    supportedLanguages: ['de', 'en', 'it', 'es', 'pl', 'ro', 'tr', 'pt'],

    async init() {
        console.log(`[I18n] Initializing with language: ${this.currentLang}`);
        await this.loadTranslations(this.currentLang);
        this.isReady = true;
        this.translatePage();
        
        // Expose to window for global access
        window.i18n = this;
    },

    /**
     * Public load method for CMS_STATE
     */
    async load(lang) {
        if (lang) this.currentLang = lang;
        await this.loadTranslations(this.currentLang);
        this.translatePage();
        return this.translations;
    },

    async loadTranslations(lang) {
        try {
            const response = await fetch(`/api/i18n/${lang}`);
            const data = await response.json();
            if (data.success) {
                this.translations = data.translations;
                this.isReady = true;
            } else {
                console.error(`[I18n] Failed to load translations for ${lang}:`, data.message);
                this.isReady = false;
            }
        } catch (err) {
            console.error(`[I18n] Error fetching translations for ${lang}:`, err);
        }
    },

    async setLanguage(lang) {
        if (lang === this.currentLang) return;
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`[I18n] Unsupported language: ${lang}`);
            return;
        }

        console.log(`[I18n] Switching language to: ${lang}`);
        this.currentLang = lang;
        localStorage.setItem('m2lang', lang);
        
        await this.loadTranslations(lang);
        this.translatePage();
        
        // Re-render navbar if it exists (since it has hardcoded text that needs translation)
        if (typeof renderNavbar === 'function') {
            renderNavbar();
        }

        // Trigger custom event
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    t(key, defaultValue = '') {
        if (typeof key !== 'string') return defaultValue || key || '';
        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                value = null;
                break;
            }
        }

        // If it's an object (missing nested key) or null, use fallback
        if (value === null || typeof value === 'object') {
            // If defaultValue is an object (common bug), use key as final fallback
            const fallback = (typeof defaultValue === 'object') ? key : (defaultValue || key);
            return fallback;
        }

        return String(value);
    },

    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'password' || el.type === 'email')) {
                el.placeholder = translation;
            } else {
                el.innerText = translation;
            }
        });
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;
    }
};

// Expose globally
window.i18n = i18n;
