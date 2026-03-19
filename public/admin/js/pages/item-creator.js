/**
 * Item Creator Page — Custom Items mit Boni und Steinen erstellen
 */
const ItemCreatorPage = {
    title: 'Items erstellen',
    icon: 'fa-wand-magic-sparkles',
    breadcrumb: 'Shop &rsaquo; Items erstellen',
    _vnumPicker: null,

    // Bonus-Definitionen (Metin2 Attribute)
    BONUSES: [
        { id: 0, name: "Kein Bonus" },
        { id: 1, name: "Max TP" },
        { id: 2, name: "Max MP" },
        { id: 3, name: "VIT" },
        { id: 4, name: "INT" },
        { id: 5, name: "STR" },
        { id: 6, name: "DEX" },
        { id: 7, name: "Angriffsgeschwindigkeit" },
        { id: 8, name: "Bewegungsgeschwindigkeit" },
        { id: 9, name: "Zaubergeschwindigkeit" },
        { id: 10, name: "TP-Regeneration" },
        { id: 11, name: "MP-Regeneration" },
        { id: 12, name: "Vergiftungschance" },
        { id: 13, name: "Ohnmachtschance" },
        { id: 14, name: "Verlangsamungschance" },
        { id: 15, name: "Kritischer Treffer" },
        { id: 16, name: "Durchbohrender Treffer" },
        { id: 17, name: "Stark gegen Halbmenschen" },
        { id: 18, name: "Stark gegen Tiere" },
        { id: 19, name: "Stark gegen Orks" },
        { id: 20, name: "Stark gegen Esoterische" },
        { id: 21, name: "Stark gegen Untote" },
        { id: 22, name: "Stark gegen Teufel" },
        { id: 23, name: "Schaden wird von TP absorbiert" },
        { id: 24, name: "Schaden wird von MP absorbiert" },
        { id: 27, name: "Nahkampf-Angriff blocken" },
        { id: 28, name: "Pfeilangriff ausweichen" },
        { id: 29, name: "Schwertverteidigung" },
        { id: 30, name: "Zweihänderverteidigung" },
        { id: 31, name: "Dolchverteidigung" },
        { id: 32, name: "Glockenverteidigung" },
        { id: 33, name: "Fächerverteidigung" },
        { id: 34, name: "Pfeilwiderstand" },
        { id: 35, name: "Feuerwiderstand" },
        { id: 36, name: "Blitzwiderstand" },
        { id: 37, name: "Magiewiderstand" },
        { id: 38, name: "Windwiderstand" },
        { id: 39, name: "Nahkampf-Treffer reflektieren" },
        { id: 41, name: "Giftwiderstand" },
        { id: 43, name: "EXP-Bonus" },
        { id: 44, name: "Doppel-Yang Dropchance" },
        { id: 45, name: "Doppel-Item Dropchance" },
        { id: 48, name: "Immun gegen Ohnmacht" },
        { id: 53, name: "Angriffswert" },
        { id: 71, name: "Durchschnittsschaden (DSS)" },
        { id: 72, name: "Fertigkeitsschaden (FKS)" },
        { id: 73, name: "Widerstand gegen DSS" },
        { id: 74, name: "Widerstand gegen FKS" }
    ],

    // Stein-Definitionen (Sockels)
    STONES: [
        { id: 0, name: "Leerer Sockel" },
        { id: 28430, name: "Stein des Durchschlags +4" },
        { id: 28431, name: "Stein des Todesstoßes +4" },
        { id: 28432, name: "Stein der Wiederkehr +4" },
        { id: 28433, name: "Stein der Krieger +4" },
        { id: 28434, name: "Stein der Ninja +4" },
        { id: 28435, name: "Stein der Sura +4" },
        { id: 28436, name: "Stein der Schamanen +4" },
        { id: 28437, name: "Stein gegen Monster +4" },
        { id: 28438, name: "Stein des Ausweichens +4" },
        { id: 28439, name: "Stein des Duckens +4" },
        { id: 28440, name: "Stein der Magie +4" },
        { id: 28441, name: "Stein der Vitalität +4" },
        { id: 28442, name: "Stein der Verteidigung +4" },
        { id: 28443, name: "Stein der Hast +4" }
    ],

    render() {
        const bonusOptions = this.BONUSES.map(b =>
            `<option value="${b.id}">${b.name}</option>`
        ).join('');

        const stoneOptions = this.STONES.map(s =>
            `<option value="${s.id}">${s.name}</option>`
        ).join('');

        return `
            <div class="admin-grid admin-grid-sidebar">
                <!-- Left: Creator Form -->
                <div>
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <div class="admin-card-title"><i class="fas fa-wand-magic-sparkles"></i> Custom Item erstellen</div>
                        </div>

                        <form id="itemCreatorForm" onsubmit="ItemCreatorPage.createItem(event)">
                            <!-- Aktion auswählen -->
                            <div class="form-group">
                                <label class="form-label">Zweck des Items</label>
                                <select class="admin-select" id="creatorActionSelect" onchange="ItemCreatorPage.toggleActionMode()" style="margin-bottom:1rem; font-weight:600;">
                                    <option value="shop">🛍 In den Web-Shop einfügen</option>
                                    <option value="gift">🎁 An Spieler verschenken (Web-Lager)</option>
                                </select>
                            </div>

                            <!-- Item auswählen -->
                            <div class="form-group">
                                <label class="form-label">Item auswählen</label>
                                <div id="creatorVnumPicker"></div>
                                <input type="hidden" id="creatorVnum">
                            </div>

                            <!-- Felder für Spieler-Geschenk -->
                            <div id="creatorActionGift" style="display: none;">
                                <div class="form-group">
                                    <label class="form-label">Account (Empfänger)</label>
                                    <select class="admin-select" id="creatorAccountSelect">
                                        <option value="">Laden...</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Felder für Shop -->
                            <div id="creatorActionShop">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label">Preis (DR)</label>
                                        <input type="number" class="admin-input" id="creatorPriceDR" placeholder="Drachenmünzen">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Preis (DM)</label>
                                        <input type="number" class="admin-input" id="creatorPriceDM" placeholder="Drachenmarken">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label">Kategorie</label>
                                        <select class="admin-select" id="creatorCategory"></select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Beschreibung (optional)</label>
                                        <input class="admin-input" id="creatorDescription" placeholder="z.B. Perfekt für PvP...">
                                    </div>
                                </div>
                            </div>


                            <!-- Menge (Für beide) -->
                            <div class="form-group">
                                <label class="form-label">Menge</label>
                                <input type="number" class="admin-input" id="creatorCount" value="1" min="1">
                            </div>

                            <!-- Sockets (Steine) -->
                            <div style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06);">
                                <div class="admin-card-title mb-1"><i class="fas fa-gem"></i> Steine (Sockets)</div>
                                <div class="creator-sockets-grid">
                                    ${[0, 1, 2].map(i => `
                                        <div class="form-group">
                                            <label class="form-label">Sockel ${i + 1}</label>
                                            <select class="admin-select" id="creatorSocket${i}">
                                                ${stoneOptions}
                                            </select>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Attribute (Boni) -->
                            <div style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06);">
                                <div class="admin-card-title mb-1"><i class="fas fa-star"></i> Boni (Attribute)</div>
                                <div class="creator-bonus-list" id="creatorBonusList">
                                    ${[0, 1, 2, 3, 4, 5, 6].map(i => `
                                        <div class="creator-bonus-row">
                                            <div class="creator-bonus-num">${i + 1}</div>
                                            <select class="admin-select" id="creatorAttrType${i}" style="flex:2;">
                                                ${bonusOptions}
                                            </select>
                                            <input type="number" class="admin-input" id="creatorAttrValue${i}" placeholder="Wert" style="flex:1;" min="0" value="0">
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <button type="submit" class="btn-admin btn-primary btn-block" style="margin-top: 1.5rem;" id="creatorSubmitBtn">
                                <i class="fas fa-plus-circle"></i> Item in den Shop einfügen
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Right: Live Preview + Quick Info -->
                <div>
                    <!-- Live Preview -->
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <div class="admin-card-title"><i class="fas fa-eye"></i> Live-Vorschau</div>
                        </div>
                        <div id="creatorPreview" class="creator-preview">
                            <div class="empty-state" style="padding: 2rem;">
                                <i class="fas fa-wand-magic-sparkles" style="font-size: 2rem; opacity: 0.2;"></i>
                                <p style="margin-top: 0.5rem;">Wähle ein Item um die Vorschau zu sehen.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Letzte erstellte Items -->
                    <div class="admin-card" style="margin-top: 1.5rem;">
                        <div class="admin-card-header">
                            <div class="admin-card-title"><i class="fas fa-clock-rotate-left"></i> Zuletzt erstellt</div>
                        </div>
                        <div id="recentItemsList">
                            <div class="empty-state" style="padding: 1.5rem;">
                                <p style="color: var(--text-muted);">Noch keine Items erstellt.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // ItemSearchPicker für VNUM
        this._vnumPicker = ItemSearchPicker.create({
            containerId: 'creatorVnumPicker',
            placeholder: 'Item suchen (Name oder VNUM)...',
            showIcon: true,
            onSelect: (item) => {
                document.getElementById('creatorVnum').value = item.vnum;
                this._updatePreview(item.vnum, item.name);
            }
        });

        this._loadCategories();
        this._setupLivePreview();
        this._loadRecentListFromStorage();
    },

    toggleActionMode() {
        const mode = document.getElementById('creatorActionSelect').value;
        const shopDiv = document.getElementById('creatorActionShop');
        const giftDiv = document.getElementById('creatorActionGift');
        const btn = document.getElementById('creatorSubmitBtn');

        shopDiv.style.display = 'none';
        giftDiv.style.display = 'none';

        if (mode === 'shop') {
            shopDiv.style.display = 'block';
            btn.innerHTML = '<i class="fas fa-store"></i> Item in den Shop einfügen';
        } else if (mode === 'gift') {
            giftDiv.style.display = 'block';
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Item direkt an Spieler verschenken';
        }
        this._refreshPreview();
    },

    async _loadCategories() {
        try {
            const data = await apiFetch('/shop/categories');
            if (data.success) {
                const sel = document.getElementById('creatorCategory');
                if (sel) {
                    sel.innerHTML = data.categories.map(c =>
                        `<option value="${c.name}">${c.name}</option>`
                    ).join('');
                }
            }
        } catch (e) { console.error(e); }

        try {
            const accData = await apiFetch('/shop/admin/accounts');
            if (accData.success) {
                const sel = document.getElementById('creatorAccountSelect');
                if (sel) {
                    sel.innerHTML = '<option value="">— Account wählen —</option>' +
                        accData.accounts.map(a => `<option value="${a.id}">${a.login} (ID: ${a.id})</option>`).join('');
                }
            }
        } catch (e) { console.error(e); }
    },

    _setupLivePreview() {
        // Update preview on every change
        const fields = [
            'creatorPriceDR', 'creatorPriceDM', 'creatorCount', 'creatorDescription',
            'creatorSocket0', 'creatorSocket1', 'creatorSocket2'
        ];
        for (let i = 0; i < 7; i++) {
            fields.push(`creatorAttrType${i}`, `creatorAttrValue${i}`);
        }

        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this._refreshPreview());
            if (el && el.tagName === 'INPUT') el.addEventListener('input', () => this._refreshPreview());
        });
    },

    _updatePreview(vnum, name) {
        this._previewVnum = vnum;
        this._previewName = name;
        this._refreshPreview();
    },

    _refreshPreview() {
        const container = document.getElementById('creatorPreview');
        if (!container) return;

        const vnum = this._previewVnum || document.getElementById('creatorVnum').value;
        if (!vnum) {
            container.innerHTML = `<div class="empty-state" style="padding: 2rem;">
                <i class="fas fa-wand-magic-sparkles" style="font-size: 2rem; opacity: 0.2;"></i>
                <p style="margin-top: 0.5rem;">Wähle ein Item.</p>
            </div>`;
            return;
        }

        const name = this._previewName || `VNUM ${vnum}`;
        const count = document.getElementById('creatorCount')?.value || 1;
        const priceDR = document.getElementById('creatorPriceDR')?.value;
        const priceDM = document.getElementById('creatorPriceDM')?.value;
        const desc = document.getElementById('creatorDescription')?.value;

        // Build sockets HTML
        let socketsHtml = '';
        for (let i = 0; i < 3; i++) {
            const socketVal = parseInt(document.getElementById(`creatorSocket${i}`)?.value) || 0;
            if (socketVal > 0) {
                const stoneName = this.STONES.find(s => s.id === socketVal)?.name || 'Unbekannt';
                socketsHtml += `<div class="preview-socket"><i class="fas fa-gem" style="color: #a78bfa;"></i> ${stoneName}</div>`;
            }
        }

        // Build attributes HTML
        let attrsHtml = '';
        for (let i = 0; i < 7; i++) {
            const type = parseInt(document.getElementById(`creatorAttrType${i}`)?.value) || 0;
            const val = parseInt(document.getElementById(`creatorAttrValue${i}`)?.value) || 0;
            if (type > 0 && val > 0) {
                const bonusName = this.BONUSES.find(b => b.id === type)?.name || 'Unbekannt';
                attrsHtml += `<div class="preview-attr"><i class="fas fa-plus" style="color: #34d399; font-size: 0.7rem;"></i> +${val} ${bonusName}</div>`;
            }
        }

        let priceHtml = '';
        if (priceDM && parseInt(priceDM) > 0) {
            priceHtml = `<span class="text-silver"><i class="fas fa-circle-notch"></i> ${parseInt(priceDM).toLocaleString('de-DE')} DM</span>`;
        } else if (priceDR && parseInt(priceDR) > 0) {
            priceHtml = `<span class="text-gold"><i class="fas fa-coins"></i> ${parseInt(priceDR).toLocaleString('de-DE')} DR</span>`;
        }

        const mode = document.getElementById('creatorActionSelect').value;
        const targetLabel = mode === 'gift' ? `<div class="preview-meta" style="color:#10b981;"><i class="fas fa-gift"></i> Geschenk an Spieler</div>` : '';

        container.innerHTML = `
            <div class="preview-card">
                <div class="preview-icon">
                    <img src="${getItemIconPath(vnum)}" onerror="handleIconFallback(this, ${vnum})" alt="Item">
                </div>
                <div class="preview-info">
                    <div class="preview-name">${name}</div>
                    <div class="preview-meta">VNUM: ${vnum} · Menge: x${count}</div>
                    ${mode === 'shop' && priceHtml ? `<div class="preview-price">${priceHtml}</div>` : ''}
                    ${mode === 'shop' && desc ? `<div class="preview-desc">${desc}</div>` : ''}
                    ${targetLabel}
                </div>
            </div>
            ${socketsHtml ? `<div class="preview-section"><div class="preview-section-title"><i class="fas fa-gem"></i> Steine</div>${socketsHtml}</div>` : ''}
            ${attrsHtml ? `<div class="preview-section"><div class="preview-section-title"><i class="fas fa-star"></i> Boni</div>${attrsHtml}</div>` : ''}
            ${!socketsHtml && !attrsHtml ? '<div style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:0.75rem;"><i class="fas fa-info-circle"></i> Keine Boni oder Steine konfiguriert</div>' : ''}
        `;
    },

    async createItem(e) {
        e.preventDefault();

        const vnum = parseInt(document.getElementById('creatorVnum').value);
        if (!vnum || vnum <= 0) {
            showToast('Bitte wähle ein Item aus!', 'error');
            return;
        }

        const mode = document.getElementById('creatorActionSelect').value;

        const payload = {
            vnum: vnum,
            count: parseInt(document.getElementById('creatorCount').value) || 1,
            socket0: parseInt(document.getElementById('creatorSocket0').value) || 0,
            socket1: parseInt(document.getElementById('creatorSocket1').value) || 0,
            socket2: parseInt(document.getElementById('creatorSocket2').value) || 0,
        };

        if (mode === 'shop') {
            payload.price_coins = parseInt(document.getElementById('creatorPriceDR').value) || 0;
            payload.price_marken = parseInt(document.getElementById('creatorPriceDM').value) || null;
            payload.category = document.getElementById('creatorCategory').value || 'Allgemein';
            payload.description = document.getElementById('creatorDescription').value || null;
        } else if (mode === 'gift') {
            payload.account_id = document.getElementById('creatorAccountSelect').value;
            if (!payload.account_id) {
                showToast('Bitte einen Empfänger-Account auswählen!', 'error');
                return;
            }
        }

        // Attribute
        for (let i = 0; i < 7; i++) {
            payload[`attrtype${i}`] = parseInt(document.getElementById(`creatorAttrType${i}`).value) || 0;
            payload[`attrvalue${i}`] = parseInt(document.getElementById(`creatorAttrValue${i}`).value) || 0;
        }

        try {
            let apiPath = '';
            if (mode === 'shop') apiPath = '/shop/admin/items';
            else if (mode === 'gift') apiPath = '/stash/admin/gift';

            const data = await apiPost(apiPath, payload);

            if (data.success) {
                const msg = mode === 'shop' ? 'Custom Item wurde zum Shop hinzugefügt!' : 'Item wurde erfolgreich versendet!';
                showToast(msg, 'success');
                this._addToRecentList(this._previewName || `VNUM ${vnum}`, vnum, payload, mode);
                document.getElementById('itemCreatorForm').reset();
                document.getElementById('creatorVnum').value = '';
                if (this._vnumPicker) this._vnumPicker.clear();
                this._previewVnum = null;
                this._previewName = null;
                this._refreshPreview();
            } else {
                showToast(data.message || 'Fehler beim Erstellen', 'error');
            }
        } catch (err) {
            showToast('Fehler beim Speichern', 'error');
        }
    },

    _recentItems: [],

    async _loadRecentListFromStorage() {
        try {
            const res = await apiFetch('/shop/admin/creator-history');
            if (res.success && res.history) {
                this._recentItems = res.history.map(i => {
                    i.time = new Date(i.created_at);
                    return i;
                });
            } else {
                this._recentItems = [];
            }
        } catch (e) {
            console.error('Failed to load history', e);
            this._recentItems = [];
        }
        this._renderRecentList();
    },

    async _addToRecentList(name, vnum, payload, mode) {
        try {
            const res = await apiPost('/shop/admin/creator-history', { name, vnum, payload, mode });
            if (res.success) {
                // Just reload from DB to get the correct IDs and times
                this._loadRecentListFromStorage();
            }
        } catch (e) {
            console.error('Failed to save to history', e);
        }
    },

    copyRecentItem(id) {
        const item = this._recentItems.find(i => i.id == id);
        if (!item) return;

        // Set Dropdown
        const selectMode = document.getElementById('creatorActionSelect');
        if (selectMode) {
            selectMode.value = item.mode;
            this.toggleActionMode();
        }

        // Set Vnum (mock it up if it takes a while)
        document.getElementById('creatorVnum').value = item.vnum;
        this._updatePreview(item.vnum, item.name);

        document.getElementById('creatorCount').value = String(item.payload.count || 1);
        document.getElementById('creatorSocket0').value = String(item.payload.socket0 || 0);
        document.getElementById('creatorSocket1').value = String(item.payload.socket1 || 0);
        document.getElementById('creatorSocket2').value = String(item.payload.socket2 || 0);

        for (let i = 0; i < 7; i++) {
            document.getElementById(`creatorAttrType${i}`).value = String(item.payload[`attrtype${i}`] || 0);
            document.getElementById(`creatorAttrValue${i}`).value = String(item.payload[`attrvalue${i}`] || 0);
        }

        if (item.mode === 'shop') {
            document.getElementById('creatorPriceDR').value = item.payload.price_coins || '';
            document.getElementById('creatorPriceDM').value = item.payload.price_marken || '';
            document.getElementById('creatorCategory').value = item.payload.category || '';
            document.getElementById('creatorDescription').value = item.payload.description || '';
        } else if (item.mode === 'gift') {
            document.getElementById('creatorAccountSelect').value = String(item.payload.account_id || '');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Item-Werte in das Formular kopiert!', 'success');

        // Ensure preview gets updated to reflect the new DOM values
        this._refreshPreview();
    },

    async deleteRecentItem(id) {
        customConfirm('Soll dieses Item wirklich aus der Historie gelöscht werden?', async () => {
            try {
                const res = await apiDelete(`/shop/admin/creator-history/${id}`);
                if (res.success) {
                    this._recentItems = this._recentItems.filter(i => i.id != id);
                    this._renderRecentList();
                } else {
                    showToast(res.message || 'Fehler beim Löschen', 'error');
                }
            } catch (e) {
                showToast('Netzwerkfehler beim Löschen', 'error');
            }
        });
    },

    _renderRecentList() {
        const container = document.getElementById('recentItemsList');
        if (!container) return;

        if (this._recentItems.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding: 1.5rem;"><p style="color: var(--text-muted);">Noch keine Items erstellt.</p></div>';
            return;
        }

        container.innerHTML = this._recentItems.map((item) => {
            const bonusCount = [0, 1, 2, 3, 4, 5, 6].filter(i => (item.payload[`attrtype${i}`] || 0) > 0).length;
            const socketCount = [0, 1, 2].filter(i => (item.payload[`socket${i}`] || 0) > 0).length;
            const timeStr = item.time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

            let badge = '';
            if (item.mode === 'gift') badge = '<span class="badge badge-green"><i class="fas fa-gift"></i> Geschenk</span>';
            else badge = '<span class="badge badge-purple"><i class="fas fa-store"></i> Shop</span>';

            return `
                <div class="recent-item">
                    <div class="item-icon-box" style="width:32px;height:32px;flex-shrink:0;">
                        <img src="${getItemIconPath(item.vnum)}" onerror="handleIconFallback(this, ${item.vnum})" style="max-width:28px;max-height:28px;">
                    </div>
                    <div class="recent-item-info" style="flex:1;min-width:0;">
                        <span class="recent-item-name">${item.name}</span>
                        <span class="recent-item-meta" style="flex-wrap: wrap;">
                            ${badge}
                            <span class="badge badge-muted">${item.vnum}</span>
                            ${bonusCount > 0 ? `<span class="badge badge-green">${bonusCount} Boni</span>` : ''}
                            ${socketCount > 0 ? `<span class="badge badge-purple">${socketCount} Steine</span>` : ''}
                            <span style="color:var(--text-muted);font-size:0.7rem;margin-left:auto;">${timeStr}</span>
                        </span>
                    </div>
                    <div style="display:flex; gap:5px; margin-left: 10px;">
                        <button class="btn-admin btn-sm" onclick="ItemCreatorPage.copyRecentItem('${item.id}')" title="Werte kopieren" style="background:rgba(255,255,255,0.1); border:none; border-radius:4px; padding:6px 10px; cursor:pointer; color:#fff;">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-admin btn-sm btn-danger" onclick="ItemCreatorPage.deleteRecentItem('${item.id}')" title="Aus Historie löschen" style="border:none; border-radius:4px; padding:6px 10px; cursor:pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.ItemCreatorPage = ItemCreatorPage;
