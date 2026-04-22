/**
 * Admin Page: Icon Converter
 * Upload TGA files and convert them to PNG for item icons.
 */

const IconConverterPage = {
    title: 'Icon Konverter',
    icon: 'fa-image',
    breadcrumb: 'TGA → PNG Konverter',

    render() {
        return `
            <div class="admin-card mb-3">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-image"></i> TGA & PNG Icon Manager</div>
                    <div id="iconStats" class="badge badge-purple"><i class="fas fa-spinner fa-spin"></i></div>
                </div>
                <p class="text-muted text-sm mb-2">
                    Lade deine Metin2 TGA oder PNG Icon-Dateien hoch. TGA-Dateien werden automatisch konvertiert, PNGs direkt kopiert.
                </p>

                <!-- Drop Zone -->
                <div id="tgaDropZone" class="icon-drop-zone" onclick="document.getElementById('tgaFileInput').click()">
                    <input type="file" id="tgaFileInput" accept=".tga,.png" multiple hidden>
                    <div class="icon-drop-inner">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <div class="icon-drop-title">TGA oder PNG Dateien hierher ziehen</div>
                        <div class="icon-drop-sub">oder klicken zum Auswählen (max. 500 Dateien)</div>
                    </div>
                </div>

                <!-- File List Preview -->
                <div id="tgaFileList" class="icon-file-list hidden"></div>

                <!-- Actions -->
                <div id="tgaActions" class="flex items-center gap-1 mt-2 hidden">
                    <button class="btn-admin btn-primary" id="btnConvertStart" onclick="IconConverterPage.startConversion()">
                        <i class="fas fa-magic"></i> Konvertieren
                    </button>
                    <button class="btn-admin btn-secondary" onclick="IconConverterPage.clearTgaFiles()">
                        <i class="fas fa-times"></i> Zurücksetzen
                    </button>
                    <span id="tgaFileCount" class="text-muted text-sm"></span>
                </div>
            </div>

            <!-- Progress -->
            <div id="tgaProgress" class="admin-card hidden mb-3">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-cog fa-spin"></i> Konvertierung läuft...</div>
                </div>
                <div class="icon-progress-bar-wrap">
                    <div class="icon-progress-bar" id="tgaProgressBar"></div>
                </div>
                <p id="tgaProgressText" class="text-muted text-sm mt-1">Dateien werden hochgeladen und konvertiert...</p>
            </div>

            <!-- Results -->
            <div id="tgaResults" class="admin-card hidden">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-check-circle"></i> Ergebnis</div>
                </div>
                <div id="tgaResultContent"></div>
            </div>
        `;
    },

    init() {
        this.loadIconStats();
        this.setupDropZone();
        this.selectedTgaFiles = [];
    },

    selectedTgaFiles: [],

    loadIconStats() {
        const el = document.getElementById('iconStats');
        if (!el) return;

        fetch('/api/admin/core/icons/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('m2token')}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    el.innerHTML = `<i class="fas fa-images"></i> ${data.count} Icons vorhanden`;
                }
            })
            .catch(() => {
                el.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Fehler`;
                el.className = 'badge badge-red';
            });
    },

    setupDropZone() {
        const zone = document.getElementById('tgaDropZone');
        const input = document.getElementById('tgaFileInput');
        if (!zone || !input) return;

        // Drag & Drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        // File input change
        input.addEventListener('change', () => {
            this.handleFiles(input.files);
        });
    },

    handleFiles(fileList) {
        const allowedFiles = Array.from(fileList).filter(f => {
            const ext = f.name.toLowerCase();
            return ext.endsWith('.tga') || ext.endsWith('.png');
        });
        if (allowedFiles.length === 0) {
            if (typeof showToast === 'function') showToast('Keine .tga oder .png Dateien gefunden.', 'warning');
            return;
        }
        this.selectedTgaFiles = allowedFiles;
        this.renderFileList();
    },

    renderFileList() {
        const list = document.getElementById('tgaFileList');
        const actions = document.getElementById('tgaActions');
        const count = document.getElementById('tgaFileCount');

        if (!list || !actions || !count) return;

        if (this.selectedTgaFiles.length === 0) {
            list.classList.add('hidden');
            actions.classList.add('hidden');
            return;
        }

        list.classList.remove('hidden');
        actions.classList.remove('hidden');

        const totalSize = this.selectedTgaFiles.reduce((sum, f) => sum + f.size, 0);
        count.textContent = `${this.selectedTgaFiles.length} Dateien (${(totalSize / 1024 / 1024).toFixed(1)} MB)`;

        // Show first 20 + count
        const preview = this.selectedTgaFiles.slice(0, 20);
        let html = '<div class="icon-file-grid">';
        for (const f of preview) {
            const name = f.name.replace(/\.(tga|png)$/i, '');
            html += `
                <div class="icon-file-item">
                    <i class="fas fa-file-image"></i>
                    <span class="icon-file-name" title="${f.name}">${name}</span>
                    <span class="text-muted text-xs">${(f.size / 1024).toFixed(0)} KB</span>
                </div>
            `;
        }
        if (this.selectedTgaFiles.length > 20) {
            html += `<div class="icon-file-item text-muted">... und ${this.selectedTgaFiles.length - 20} weitere</div>`;
        }
        html += '</div>';
        list.innerHTML = html;
    },

    clearTgaFiles() {
        this.selectedTgaFiles = [];
        const input = document.getElementById('tgaFileInput');
        if (input) input.value = '';
        this.renderFileList();
        document.getElementById('tgaResults')?.classList.add('hidden');
        document.getElementById('tgaProgress')?.classList.add('hidden');
    },

    async startConversion() {
        if (this.selectedTgaFiles.length === 0) return;

        const btn = document.getElementById('btnConvertStart');
        const progress = document.getElementById('tgaProgress');
        const progressBar = document.getElementById('tgaProgressBar');
        const progressText = document.getElementById('tgaProgressText');
        const results = document.getElementById('tgaResults');

        if (!btn || !progress || !progressBar || !progressText) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Läuft...';
        progress.classList.remove('hidden');
        results?.classList.add('hidden');
        progressBar.style.width = '10%';
        progressText.textContent = `${this.selectedTgaFiles.length} Dateien werden hochgeladen...`;

        // Build FormData
        const formData = new FormData();
        for (const file of this.selectedTgaFiles) {
            formData.append('tga_files', file);
        }

        try {
            const response = await fetch('/api/admin/core/icons/convert', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('m2token')}` },
                body: formData
            });
            const data = await response.json();

            progressBar.style.width = '100%';

            if (data.success) {
                progressText.textContent = 'Fertig!';
                progress.querySelector('.admin-card-title').innerHTML = '<i class="fas fa-check"></i> Abgeschlossen';

                this.showResults(data);
                this.loadIconStats(); // Refresh counter

                if (typeof showToast === 'function') {
                    showToast(`${data.converted?.length || 0} Icons erfolgreich verarbeitet!`, 'success');
                }
            } else {
                progressText.textContent = data.message || 'Fehler bei der Konvertierung.';
                if (typeof showToast === 'function') showToast(data.message, 'error');
            }
        } catch (err) {
            progressText.textContent = 'Netzwerkfehler: ' + err.message;
            if (typeof showToast === 'function') showToast('Konvertierung fehlgeschlagen: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-magic"></i> Konvertieren';
        }
    },

    showResults(data) {
        const container = document.getElementById('tgaResults');
        const content = document.getElementById('tgaResultContent');
        if (!container || !content) return;

        container.classList.remove('hidden');

        const converted = data.converted || [];
        const errors = data.errors || [];

        let html = `
            <div class="flex gap-1 mb-2">
                <span class="badge badge-green"><i class="fas fa-check"></i> ${converted.length} konvertiert</span>
                ${errors.length > 0 ? `<span class="badge badge-red"><i class="fas fa-times"></i> ${errors.length} Fehler</span>` : ''}
            </div>
        `;

        if (converted.length > 0) {
            html += '<div class="icon-result-grid">';
            for (const item of converted.slice(0, 50)) {
                html += `
                    <div class="icon-result-item">
                        <img src="/images/items/${item.output}?t=${Date.now()}" alt="${item.output}" loading="lazy" onerror="this.src='/images/items/error.png'">
                        <span class="text-xs">${item.output}</span>
                    </div>
                `;
            }
            if (converted.length > 50) {
                html += `<div class="icon-result-item text-muted">+${converted.length - 50} mehr...</div>`;
            }
            html += '</div>';
        }

        if (errors.length > 0) {
            html += '<div class="mt-2"><strong class="text-danger text-sm">Fehler:</strong><ul class="text-sm text-muted">';
            for (const e of errors) {
                html += `<li>${e.file}: ${e.error}</li>`;
            }
            html += '</ul></div>';
        }

        content.innerHTML = html;
    }
};

window.IconConverterPage = IconConverterPage;
