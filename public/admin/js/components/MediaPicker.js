/**
 * Reusable Media Picker Component
 * Displays a modal with the media library for selecting images.
 */
const MediaPicker = {
    callback: null,
    modal: null,

    /**
     * Open the media picker modal
     * @param {function} onSelect Callback function(imageUrl)
     */
    open(onSelect) {
        this.callback = onSelect;
        this.renderModal();
        this.loadMedia();
    },

    renderModal() {
        // Remove existing if any
        if (this.modal) this.modal.remove();

        const modalHtml = `
            <div id="mediaPickerOverlay" class="modal-overlay" style="display: flex; z-index: 10001; background: rgba(0,0,0,0.8);">
                <div class="admin-modal" style="max-width: 900px; width: 95%; max-height: 85vh; display: flex; flex-direction: column;">
                    <div class="admin-modal-header" style="flex-shrink:0;">
                        <div class="admin-modal-title"><i class="fas fa-photo-video"></i> Bild auswählen</div>
                        <button class="modal-close" onclick="MediaPicker.close()">&times;</button>
                    </div>
                    <div class="admin-modal-body" style="flex-grow: 1; overflow-y: auto; padding: 1.5rem;">
                        <div style="display:flex; gap:1rem; margin-bottom: 1.5rem;">
                            <input type="text" id="mediaPickerSearch" class="admin-input" placeholder="Suchen..." oninput="MediaPicker.filter()">
                            <span id="mediaPickerCount" style="align-self:center; font-size: 0.85rem; color: var(--text-muted);"></span>
                        </div>
                        <div id="mediaPickerGrid" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                            gap: 1rem;
                        ">
                            <div style="grid-column: 1/-1; text-align:center; padding: 3rem;">
                                <i class="fas fa-spinner fa-spin"></i> Lade Bibliothek...
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer" style="flex-shrink:0;">
                        <button class="btn-admin btn-secondary" onclick="MediaPicker.close()">Abbrechen</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('mediaPickerOverlay');
    },

    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    },

    async loadMedia() {
        try {
            const data = await apiFetch('/media');
            if (data.success) {
                this.files = data.files;
                this.renderGrid(this.files);
            }
        } catch (e) {
            console.error('[MediaPicker] Error:', e);
        }
    },

    filter() {
        const query = document.getElementById('mediaPickerSearch').value.toLowerCase();
        const filtered = this.files.filter(f => f.filename.toLowerCase().includes(query));
        this.renderGrid(filtered);
    },

    renderGrid(files) {
        const grid = document.getElementById('mediaPickerGrid');
        const count = document.getElementById('mediaPickerCount');
        if (!grid) return;

        if (count) count.textContent = `${files.length} Bilder`;

        if (files.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-muted);">Keine Bilder gefunden.</div>';
            return;
        }

        grid.innerHTML = files.map(f => `
            <div class="media-picker-item" onclick="MediaPicker.select('${f.url}')" style="
                aspect-ratio: 1;
                border-radius: 8px;
                overflow: hidden;
                border: 2px solid transparent;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
                background: rgba(0,0,0,0.2);
            " onmouseenter="this.style.borderColor='var(--primary)'; this.style.transform='scale(1.03)'"
               onmouseleave="this.style.borderColor='transparent'; this.style.transform=''">
                <img src="${f.url}" style="width:100%; height:100%; object-fit:cover;">
                <div style="
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    font-size: 0.65rem;
                    padding: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">${f.filename}</div>
            </div>
        `).join('');
    },

    select(url) {
        if (this.callback) {
            this.callback(url);
        }
        this.close();
    }
};
