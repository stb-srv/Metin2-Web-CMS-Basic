/**
 * ItemSearchPicker — Wiederverwendbare Suchkomponente für Metin2 Items
 * 
 * Verwendung:
 * 
 *   ItemSearchPicker.create({
 *       containerId: 'mySearchContainer',
 *       onSelect: (item) => { console.log('Gewählt:', item.vnum, item.name); },
 *       placeholder: 'Item suchen...',
 *       showIcon: true
 *   });
 * 
 * Oder programmatisch öffnen als Modal:
 * 
 *   ItemSearchPicker.openModal({
 *       onSelect: (item) => { ... },
 *       title: 'Item auswählen'
 *   });
 */

const ItemSearchPicker = (() => {
    let _debounceTimer = null;
    let _activeDropdown = null;
    let _instanceCounter = 0;

    /**
     * Create an inline search picker inside a container
     */
    function create(options = {}) {
        const {
            containerId,
            onSelect,
            placeholder = 'Item suchen (Name oder VNUM)...',
            showIcon = true,
            initialVnum = null,
            initialName = ''
        } = options;

        const container = document.getElementById(containerId);
        if (!container) { console.error('ItemSearchPicker: Container nicht gefunden:', containerId); return; }

        const instanceId = `isp_${++_instanceCounter}`;

        container.innerHTML = `
            <div class="isp-wrapper" id="${instanceId}">
                <div class="isp-input-row">
                    <div class="isp-search-box">
                        <i class="fas fa-search isp-search-icon"></i>
                        <input type="text" class="admin-input isp-input" id="${instanceId}_input" 
                               placeholder="${placeholder}" autocomplete="off"
                               value="${initialName}">
                        <button type="button" class="isp-clear" id="${instanceId}_clear" style="display:${initialName ? 'flex' : 'none'};" title="Leeren">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    ${showIcon ? `<div class="isp-preview" id="${instanceId}_preview" style="display:${initialVnum ? 'flex' : 'none'};">
                        <div class="item-icon-box">
                            <img id="${instanceId}_previewImg" src="${initialVnum ? getItemIconPath(initialVnum) : ''}" 
                                 onerror="handleIconFallback(this, ${initialVnum || 0})">
                        </div>
                        <span class="isp-preview-label" id="${instanceId}_previewLabel">${initialName || ''}</span>
                    </div>` : ''}
                </div>
                <div class="isp-dropdown" id="${instanceId}_dropdown"></div>
            </div>
        `;

        // Hidden VNUM field
        let _selectedVnum = initialVnum;

        const input = document.getElementById(`${instanceId}_input`);
        const dropdown = document.getElementById(`${instanceId}_dropdown`);
        const clear = document.getElementById(`${instanceId}_clear`);
        const preview = showIcon ? document.getElementById(`${instanceId}_preview`) : null;

        // Input handler with debounce
        input.addEventListener('input', () => {
            const q = input.value.trim();
            clear.style.display = q ? 'flex' : 'none';

            if (_debounceTimer) clearTimeout(_debounceTimer);

            if (q.length < 2) {
                _closeDropdown(dropdown);
                return;
            }

            _debounceTimer = setTimeout(() => _search(q, dropdown, instanceId, onSelect, preview), 250);
        });

        // Focus handler — re-open if there's content
        input.addEventListener('focus', () => {
            const q = input.value.trim();
            if (q.length >= 2) {
                if (_debounceTimer) clearTimeout(_debounceTimer);
                _debounceTimer = setTimeout(() => _search(q, dropdown, instanceId, onSelect, preview), 100);
            }
        });

        // Clear button
        clear.addEventListener('click', () => {
            input.value = '';
            _selectedVnum = null;
            _closeDropdown(dropdown);
            clear.style.display = 'none';
            if (preview) preview.style.display = 'none';
            input.focus();
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest(`#${instanceId}`)) {
                _closeDropdown(dropdown);
            }
        });

        // ESC to close
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                _closeDropdown(dropdown);
                input.blur();
            }
        });

        // Return API
        return {
            getVnum: () => _selectedVnum,
            setVnum: (vnum, name) => {
                _selectedVnum = vnum;
                input.value = name || '';
                clear.style.display = name ? 'flex' : 'none';
                if (preview && vnum) {
                    preview.style.display = 'flex';
                    const img = document.getElementById(`${instanceId}_previewImg`);
                    const label = document.getElementById(`${instanceId}_previewLabel`);
                    if (img) { img.src = getItemIconPath(vnum); img.onerror = function () { handleIconFallback(this, vnum); }; }
                    if (label) label.textContent = name || `VNUM ${vnum}`;
                }
            },
            clear: () => {
                input.value = '';
                _selectedVnum = null;
                _closeDropdown(dropdown);
                clear.style.display = 'none';
                if (preview) preview.style.display = 'none';
            },
            element: container
        };
    }

    /**
     * Open a modal search picker
     */
    function openModal(options = {}) {
        const {
            onSelect,
            title = 'Item auswählen',
            placeholder = 'Item suchen (Name oder VNUM)...'
        } = options;

        // Remove old modal if any
        const existing = document.getElementById('ispModal');
        if (existing) existing.remove();

        const modalId = `isp_modal_${++_instanceCounter}`;

        const overlay = document.createElement('div');
        overlay.id = 'ispModal';
        overlay.className = 'admin-modal-overlay';
        overlay.innerHTML = `
            <div class="admin-modal" style="width: 560px;" onclick="event.stopPropagation()">
                <div class="admin-modal-header">
                    <div class="admin-modal-title"><i class="fas fa-search"></i> ${title}</div>
                    <button class="admin-modal-close" id="${modalId}_close"><i class="fas fa-times"></i></button>
                </div>
                <div class="isp-modal-search">
                    <div class="isp-search-box" style="margin-bottom: 1rem;">
                        <i class="fas fa-search isp-search-icon"></i>
                        <input type="text" class="admin-input isp-input" id="${modalId}_input" 
                               placeholder="${placeholder}" autocomplete="off">
                    </div>
                    <div class="isp-modal-results" id="${modalId}_results">
                        <div class="empty-state" style="padding: 2rem;">
                            <i class="fas fa-search" style="font-size: 2rem; opacity: 0.2;"></i>
                            <p style="margin-top: 0.5rem;">Gib mindestens 2 Zeichen ein um nach Items zu suchen.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) _closeModal();
        });

        document.body.appendChild(overlay);

        const input = document.getElementById(`${modalId}_input`);
        const results = document.getElementById(`${modalId}_results`);
        const closeBtn = document.getElementById(`${modalId}_close`);

        closeBtn.addEventListener('click', _closeModal);

        input.addEventListener('input', () => {
            const q = input.value.trim();
            if (_debounceTimer) clearTimeout(_debounceTimer);
            if (q.length < 2) {
                results.innerHTML = `<div class="empty-state" style="padding: 2rem;"><i class="fas fa-search" style="font-size: 2rem; opacity: 0.2;"></i><p style="margin-top: 0.5rem;">Gib mindestens 2 Zeichen ein.</p></div>`;
                return;
            }
            results.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Suche...</div>';
            _debounceTimer = setTimeout(() => _searchModal(q, results, onSelect), 250);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') _closeModal();
        });

        // Auto-Focus
        setTimeout(() => input.focus(), 100);
    }

    function _closeModal() {
        const m = document.getElementById('ispModal');
        if (m) m.remove();
    }

    async function _search(query, dropdown, instanceId, onSelect, preview) {
        dropdown.innerHTML = '<div style="text-align:center;padding:0.75rem;color:var(--text-muted);font-size:0.8rem;"><i class="fas fa-spinner fa-spin"></i> Suche...</div>';
        dropdown.style.display = 'block';
        _activeDropdown = dropdown;

        try {
            const data = await apiFetch(`/items/search?q=${encodeURIComponent(query)}&limit=20`);
            if (!data.success || !data.items.length) {
                dropdown.innerHTML = '<div style="text-align:center;padding:0.75rem;color:var(--text-muted);font-size:0.8rem;">Keine Items gefunden</div>';
                return;
            }

            dropdown.innerHTML = data.items.map(item => `
                <button type="button" class="isp-result" data-vnum="${item.vnum}" data-name="${_escHtml(item.name)}">
                    <div class="item-icon-box" style="width:32px;height:32px;">
                        <img src="${getItemIconPath(item.vnum)}" onerror="handleIconFallback(this, ${item.vnum})" style="max-width:28px;max-height:28px;">
                    </div>
                    <div class="isp-result-info">
                        <span class="isp-result-name">${_escHtml(item.name)}</span>
                        <span class="isp-result-vnum">VNUM ${item.vnum}</span>
                    </div>
                </button>
            `).join('');

            // Attach click handlers
            dropdown.querySelectorAll('.isp-result').forEach(btn => {
                btn.addEventListener('click', () => {
                    const vnum = parseInt(btn.dataset.vnum);
                    const name = btn.dataset.name;

                    const input = document.getElementById(`${instanceId}_input`);
                    if (input) input.value = name;

                    const clear = document.getElementById(`${instanceId}_clear`);
                    if (clear) clear.style.display = 'flex';

                    if (preview) {
                        preview.style.display = 'flex';
                        const img = document.getElementById(`${instanceId}_previewImg`);
                        const label = document.getElementById(`${instanceId}_previewLabel`);
                        if (img) { img.src = getItemIconPath(vnum); img.onerror = function () { handleIconFallback(this, vnum); }; }
                        if (label) label.textContent = name;
                    }

                    _closeDropdown(dropdown);
                    if (typeof onSelect === 'function') onSelect({ vnum, name });
                });
            });
        } catch (e) {
            dropdown.innerHTML = '<div style="text-align:center;padding:0.75rem;color:#f87171;font-size:0.8rem;">Fehler bei der Suche</div>';
        }
    }

    async function _searchModal(query, container, onSelect) {
        try {
            const data = await apiFetch(`/items/search?q=${encodeURIComponent(query)}&limit=40`);
            if (!data.success || !data.items.length) {
                container.innerHTML = '<div class="empty-state" style="padding: 2rem;"><i class="fas fa-box-open" style="font-size: 2rem; opacity: 0.2;"></i><p style="margin-top: 0.5rem;">Keine Items gefunden</p></div>';
                return;
            }

            container.innerHTML = data.items.map(item => `
                <button type="button" class="isp-modal-item" data-vnum="${item.vnum}" data-name="${_escHtml(item.name)}">
                    <div class="item-icon-box" style="width:38px;height:38px;">
                        <img src="${getItemIconPath(item.vnum)}" onerror="handleIconFallback(this, ${item.vnum})" style="max-width:32px;max-height:32px;">
                    </div>
                    <div class="isp-result-info">
                        <span class="isp-result-name">${_escHtml(item.name)}</span>
                        <span class="isp-result-vnum">VNUM: ${item.vnum} <span class="isp-result-meta">Typ: ${item.type} · Größe: ${item.size}</span></span>
                    </div>
                </button>
            `).join('');

            container.querySelectorAll('.isp-modal-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    const vnum = parseInt(btn.dataset.vnum);
                    const name = btn.dataset.name;
                    _closeModal();
                    if (typeof onSelect === 'function') onSelect({ vnum, name });
                });
            });
        } catch (e) {
            container.innerHTML = '<div style="text-align:center;padding:2rem;color:#f87171;">Fehler bei der Suche</div>';
        }
    }

    function _closeDropdown(dropdown) {
        if (dropdown) dropdown.style.display = 'none';
        _activeDropdown = null;
    }

    function _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { create, openModal };
})();
