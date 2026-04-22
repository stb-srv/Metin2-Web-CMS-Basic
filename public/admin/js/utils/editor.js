/**
 * Admin: Central WYSIWYG Editor Utility (TinyMCE)
 * Handles loading and initializing the TinyMCE editor consistently across the admin panel.
 */

const AdminEditor = {
    _loaded: false,
    _instances: {},

    /**
     * Loads the TinyMCE script from CDN if not already loaded.
     */
    async ensureLoaded() {
        if (this._loaded || window.tinymce) {
            this._loaded = true;
            return;
        }

        const loadScript = (src, checkStr) => {
            return new Promise((resolve) => {
                if (window[checkStr]) return resolve();
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                document.head.appendChild(script);
            });
        };

        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js', 'tinymce');
        this._loaded = true;
    },

    /**
     * Initializes the editor on a specific textarea ID.
     * @param {string} textareaId - The HTML ID of the textarea to convert.
     * @param {string} initialContent - The content to populate (optional).
     * @param {Object} options - Additional TinyMCE options to override defaults.
     */
    async init(textareaId, initialContent = '', options = {}) {
        await this.ensureLoaded();

        if (!window.tinymce) return;

        // Clean up previously active instance on this ID
        if (tinymce.get(textareaId)) {
            tinymce.get(textareaId).remove();
        }

        const textarea = document.getElementById(textareaId);
        if (!textarea) return;

        // Apply fallback value directly to prevent visual jumps
        textarea.value = initialContent;
        this._instances[textareaId] = true;

        const defaultOptions = {
            selector: `#${textareaId}`,
            skin: 'oxide-dark',
            content_css: 'dark',
            height: options.height || 550,
            menubar: false,
            plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
            toolbar: 'undo redo | formatselect | ' +
            'bold italic underline strikethrough | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'link image media | code preview fullscreen | help',
            content_style: `
                html, body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; 
                    font-size: 15px; 
                    background-color: transparent !important; 
                    color: #e2e8f0 !important; 
                }
                a { color: #8b5cf6; }
            `,
            setup: function (editor) {
                editor.on('init', function () {
                    try {
                        const doc = editor.getDoc();
                        if (doc) {
                            doc.body.style.backgroundColor = 'transparent';
                            doc.documentElement.style.backgroundColor = 'transparent';
                        }
                        
                        const iframe = editor.getContainer().querySelector('iframe');
                        if (iframe) iframe.style.backgroundColor = 'transparent';
                        
                        const editArea = editor.getContainer().querySelector('.tox-edit-area');
                        if (editArea) {
                            const isLight = document.body.classList.contains('light-mode');
                            editArea.style.backgroundColor = isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.3)';
                        }
                    } catch(e) {}
                });
            }
        };

        // Merge with specific options
        Object.assign(defaultOptions, options);

        tinymce.init(defaultOptions);
    },

    /**
     * Retrieves the HTML content from the editor safely.
     * @param {string} textareaId 
     * @returns {string} HTML content
     */
    getContent(textareaId) {
        if (window.tinymce && tinymce.get(textareaId)) {
            return tinymce.get(textareaId).getContent();
        }
        return document.getElementById(textareaId)?.value || '';
    },

    /**
     * Destroys an editor instance if it exists.
     * @param {string} textareaId 
     */
    destroy(textareaId) {
        if (window.tinymce && tinymce.get(textareaId)) {
            tinymce.get(textareaId).remove();
            delete this._instances[textareaId];
        }
    },

    /**
     * Checks if the content has changed since it was last saved or initialized.
     * @param {string} textareaId 
     * @returns {boolean}
     */
    isDirty(textareaId) {
        if (window.tinymce && tinymce.get(textareaId)) {
            return tinymce.get(textareaId).isDirty();
        }
        return false;
    }
};

window.AdminEditor = AdminEditor;
