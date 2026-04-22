/**
 * Admin: Media Library
 * Central image management for the CMS. Upload, browse, and delete media files.
 */

const CmsMediaPage = {
    title: 'Medienbibliothek',
    icon: 'fa-images',
    breadcrumb: 'Content &rsaquo; Medienbibliothek',
    files: [],

    render() {
        return `
            <div class="admin-card" style="margin-bottom: 1.5rem;">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-images"></i> Medienbibliothek</div>
                    <label class="btn-admin btn-primary" for="mediaUploadInput" style="cursor:pointer;">
                        <i class="fas fa-upload"></i> Bilder hochladen
                    </label>
                </div>
                <!-- Drag & Drop Upload Zone -->
                <div id="mediaDropZone" style="
                    border: 2px dashed rgba(var(--primary-rgb), 0.4);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin: 1rem 0;
                    color: var(--text-muted);
                    display: none;
                ">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 0.75rem; display: block;"></i>
                    <strong style="color: var(--text-main);">Dateien hier hineinziehen</strong><br>
                    <span style="font-size: 0.8rem;">oder oben auf "Bilder hochladen" klicken</span>
                </div>
                <!-- Hidden file input -->
                <input type="file" id="mediaUploadInput" multiple accept="image/*" style="display:none;" onchange="CmsMediaPage.handleUpload(this.files)">

                <!-- Upload Progress -->
                <div id="mediaUploadProgress" style="display:none; padding: 0.75rem; background: rgba(var(--primary-rgb),0.1); border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <i class="fas fa-spinner fa-spin" style="color: var(--primary);"></i>
                        <span id="mediaUploadStatus">Lade hoch...</span>
                    </div>
                </div>
            </div>

            <!-- Filter / Search -->
            <div class="admin-card" style="margin-bottom: 1.5rem;">
                <div style="display:flex; gap:1rem; align-items:center;">
                    <input type="text" class="admin-input" id="mediaSearch" placeholder="Dateiname suchen..." oninput="CmsMediaPage.filterFiles()" style="max-width:320px;">
                    <span id="mediaCount" style="color: var(--text-muted); font-size: 0.85rem;"></span>
                </div>
            </div>

            <!-- Image Grid -->
            <div id="mediaGrid" style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 1rem;
            ">
                <div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-spinner fa-spin"></i> Lade Medienbibliothek...
                </div>
            </div>
        `;
    },

    init() {
        this.load();
        this.initDragDrop();
    },

    initDragDrop() {
        const zone = document.getElementById('mediaDropZone');
        if (!zone) return;

        zone.style.display = 'block';

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.style.borderColor = 'var(--primary)';
            zone.style.background = 'rgba(var(--primary-rgb),0.05)';
        });

        zone.addEventListener('dragleave', () => {
            zone.style.borderColor = 'rgba(var(--primary-rgb), 0.4)';
            zone.style.background = 'transparent';
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.style.borderColor = 'rgba(var(--primary-rgb), 0.4)';
            zone.style.background = 'transparent';
            const files = e.dataTransfer.files;
            if (files.length > 0) this.handleUpload(files);
        });

        zone.addEventListener('click', () => {
            document.getElementById('mediaUploadInput').click();
        });
    },

    async load() {
        try {
            const data = await apiFetch('/media');
            if (data.success) {
                this.files = data.files;
                this.renderGrid(this.files);
            }
        } catch (e) {
            console.error('[Media] Load error:', e);
        }
    },

    filterFiles() {
        const query = document.getElementById('mediaSearch')?.value.toLowerCase() || '';
        const filtered = this.files.filter(f => f.filename.toLowerCase().includes(query));
        this.renderGrid(filtered);
    },

    renderGrid(files) {
        const grid = document.getElementById('mediaGrid');
        const countEl = document.getElementById('mediaCount');
        if (!grid) return;

        if (countEl) countEl.textContent = `${files.length} Datei(en)`;

        if (files.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
                    <i class="fas fa-photo-video" style="font-size:3rem; margin-bottom:1rem; display:block; opacity:0.3;"></i>
                    Keine Bilder vorhanden. Lade dein erstes Bild hoch!
                </div>`;
            return;
        }

        grid.innerHTML = files.map(f => `
            <div class="media-card" style="
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.07);
                border-radius: 12px;
                overflow: hidden;
                transition: transform 0.2s, box-shadow 0.2s;
                cursor: pointer;
            " onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)'"
               onmouseleave="this.style.transform=''; this.style.boxShadow=''">
                <!-- Thumbnail -->
                <div style="height: 140px; overflow:hidden; background: rgba(0,0,0,0.2); position:relative;">
                    <img src="${f.url}" alt="${f.filename}"
                        style="width:100%; height:100%; object-fit:cover;"
                        onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\\"display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);\\\"><i class=\\\"fas fa-image fa-2x\\\"></i></div>'"
                    >
                </div>
                <!-- Info -->
                <div style="padding: 0.65rem;">
                    <div style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:0.4rem;" title="${f.filename}">
                        ${f.filename}
                    </div>
                    <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:0.5rem;">
                        ${this.formatSize(f.size)}
                    </div>
                    <div style="display:flex; gap:4px;">
                        <button class="btn-admin btn-secondary btn-sm" style="flex:1; font-size:0.7rem;" onclick="CmsMediaPage.copyUrl('${f.url}')" title="URL kopieren">
                            <i class="fas fa-copy"></i> Kopieren
                        </button>
                        <button class="btn-admin btn-danger btn-sm" onclick="CmsMediaPage.deleteFile('${f.filename}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    async handleUpload(fileList) {
        const progressEl = document.getElementById('mediaUploadProgress');
        const statusEl = document.getElementById('mediaUploadStatus');

        progressEl.style.display = 'block';
        statusEl.textContent = `${fileList.length} Datei(en) werden hochgeladen...`;

        const formData = new FormData();
        for (const file of fileList) formData.append('files', file);

        try {
            const token = localStorage.getItem('m2token');
            const res = await fetch('/api/media/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                showToast(data.message, 'success');
                this.load();
            } else {
                showToast(data.message || 'Fehler beim Upload', 'error');
            }
        } catch (e) {
            showToast('Fehler beim Upload', 'error');
        } finally {
            progressEl.style.display = 'none';
            document.getElementById('mediaUploadInput').value = '';
        }
    },

    async deleteFile(filename) {
        customConfirm(`Datei "${filename}" wirklich löschen?`, async () => {
            try {
                const data = await apiFetch('/media/' + encodeURIComponent(filename), { method: 'DELETE' });
                if (data.success) {
                    showToast('Datei gelöscht', 'success');
                    this.load();
                } else {
                    showToast(data.message, 'error');
                }
            } catch (e) {
                showToast('Fehler beim Löschen', 'error');
            }
        });
    },

    copyUrl(url) {
        const fullUrl = window.location.origin + url;
        navigator.clipboard.writeText(fullUrl).then(() => {
            showToast('URL in Zwischenablage kopiert!', 'success');
        }).catch(() => {
            // Fallback for non-secure contexts
            const el = document.createElement('textarea');
            el.value = fullUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            showToast('URL kopiert!', 'success');
        });
    },

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
};

window.CmsMediaPage = CmsMediaPage;
