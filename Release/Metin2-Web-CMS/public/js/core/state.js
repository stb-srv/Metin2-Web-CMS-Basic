/**
 * Central State Management for Metin2 Web CMS
 * Minimalist, reactive-ish store for shared data.
 */
(function() {
    const state = {
        user: null,
        settings: {},
        i18n: {
            lang: localStorage.getItem('m2lang') || 'de',
            translations: {}
        },
        isInitialized: false,
        listeners: []
    };

    /**
     * Subscribe to state changes
     * @param {string} key - 'user', 'settings', 'i18n'
     * @param {Function} callback 
     */
    function subscribe(key, callback) {
        state.listeners.push({ key, callback });
    }

    /**
     * Update state and notify listeners
     */
    function set(key, value) {
        state[key] = value;
        state.listeners.forEach(l => {
            if (l.key === key || l.key === 'all') l.callback(value);
        });
    }

    /**
     * Initialize essential data
     */
    async function init() {
        if (state.isInitialized) return;

        // 1. User
        const savedUser = localStorage.getItem('m2user');
        if (savedUser) {
            state.user = window.safeJSONParse(savedUser);
        }

        // 2. Fetch Settings & Translations in parallel
        try {
            const [settingsRes, translations] = await Promise.all([
                window.apiFetch('/cms/settings'),
                window.i18n ? window.i18n.load(state.i18n.lang) : Promise.resolve(null)
            ]);

            if (settingsRes && settingsRes.success) {
                state.settings = settingsRes.settings;
                document.dispatchEvent(new CustomEvent('settingsLoaded', { detail: state.settings }));
            }

            if (translations) {
                // Determine language: Priority: localStorage > settings.default_language > 'de'
                const storedLang = localStorage.getItem('m2lang');
                const defaultLang = state.settings.default_language || 'de';
                const finalLang = storedLang || defaultLang;
                
                state.i18n.lang = finalLang;
                state.i18n.translations = translations;
                
                // If the language changed during this process (e.g. from default), update localStorage
                if (!storedLang) localStorage.setItem('m2lang', finalLang);
                
                document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: state.i18n.lang } }));
            }
        } catch(e) {
            console.error('[State] Init error:', e);
        }

        state.isInitialized = true;
        state.listeners.forEach(l => {
            if (l.key === 'ready') l.callback(true);
        });
    }

    // Export to window
    window.CMS_STATE = {
        get: (key) => state[key],
        set,
        subscribe,
        init
    };

    // Auto-init on script load
    // init(); 
})();
