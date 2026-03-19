/**
 * Web-Shop Page — Item & Category Management
 */
const WebShopPage = {
    title: 'Web-Shop',
    icon: 'fa-store',
    breadcrumb: 'Shop &rsaquo; Web-Shop Items',
    _items: [],
    _editId: null,
    _vnumPicker: null,

    render() {
        return `
            <div class="admin-grid admin-grid-sidebar">
                <!-- Left: Add/Edit Form -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-plus-circle"></i> <span id="shopFormTitle">Item hinzufügen</span></div>
                        <button class="btn-admin btn-secondary btn-sm" id="shopFormReset" onclick="WebShopPage.resetForm()" style="display:none;">
                            <i class="fas fa-times"></i> Abbrechen
                        </button>
                    </div>
                    <form id="shopItemForm" onsubmit="WebShopPage.saveItem(event)">
                        <div class="form-group">
                            <label class="form-label">Item suchen (Name oder VNUM)</label>
                            <div id="shopVnumPicker"></div>
                            <input type="hidden" id="shopVnum">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Preis (DR)</label>
                                <input type="number" class="admin-input" id="shopPriceDR" placeholder="Drachenmünzen">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Preis (DM)</label>
                                <input type="number" class="admin-input" id="shopPriceDM" placeholder="Drachenmarken">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Menge</label>
                                <input type="number" class="admin-input" id="shopCount" value="1" min="1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Kategorie</label>
                                <select class="admin-select" id="shopCategory"></select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Beschreibung (optional)</label>
                            <textarea class="admin-textarea" id="shopDescription" placeholder="Optionale Beschreibung..."></textarea>
                        </div>
                        <button type="submit" class="btn-admin btn-primary btn-block"><i class="fas fa-save"></i> Speichern</button>
                    </form>

                    <!-- Category Management -->
                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.06);">
                        <div class="admin-card-title mb-1"><i class="fas fa-tags"></i> Kategorien</div>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                            <input type="text" class="admin-input" id="newCatName" placeholder="Neue Kategorie..." style="flex: 1;">
                            <button class="btn-admin btn-secondary" onclick="WebShopPage.addCategory()"><i class="fas fa-plus"></i></button>
                        </div>
                        <div id="categoryList"></div>
                    </div>
                </div>

                <!-- Right: Items Table -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-list"></i> Shop Items <span class="badge badge-purple" id="shopItemCount">0</span></div>
                    </div>
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Icon</th>
                                    <th>Name</th>
                                    <th>Kategorie</th>
                                    <th>Preis</th>
                                    <th style="text-align:right;">Aktion</th>
                                </tr>
                            </thead>
                            <tbody id="shopItemsBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Initialize ItemSearchPicker for VNUM field
        this._vnumPicker = ItemSearchPicker.create({
            containerId: 'shopVnumPicker',
            placeholder: 'Item suchen (Name oder VNUM)...',
            showIcon: true,
            onSelect: (item) => {
                document.getElementById('shopVnum').value = item.vnum;
            }
        });

        this.loadCategories();
        this.loadItems();
    },

    async loadCategories() {
        try {
            const data = await apiFetch('/shop/categories');
            if (!data.success) return;
            const sel = document.getElementById('shopCategory');
            const list = document.getElementById('categoryList');
            if (sel) {
                sel.innerHTML = data.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
            }
            if (list) {
                list.innerHTML = data.categories.map(c => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0.6rem;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:0.4rem;font-size:0.85rem;">
                        <span>${c.name}</span>
                        <button class="btn-admin btn-danger btn-sm" onclick="WebShopPage.deleteCategory(${c.id})"><i class="fas fa-trash"></i></button>
                    </div>
                `).join('');
            }
        } catch (e) { console.error(e); }
    },

    async addCategory() {
        const input = document.getElementById('newCatName');
        const name = input.value.trim();
        if (!name) return;
        try {
            const data = await apiPost('/shop/admin/categories', { name });
            if (data.success) { input.value = ''; this.loadCategories(); showToast('Kategorie erstellt', 'success'); }
            else showToast(data.message, 'error');
        } catch (e) { showToast('Fehler', 'error'); }
    },

    deleteCategory(id) {
        customConfirm('Kategorie wirklich löschen?', async () => {
            try {
                const data = await apiDelete(`/shop/admin/categories/${id}`);
                if (data.success) {
                    this.loadCategories();
                    showToast('Kategorie gelöscht', 'success');
                } else {
                    showToast(data.message || 'Fehler', 'error');
                }
            } catch (e) { showToast('Fehler', 'error'); }
        });
    },

    async loadItems() {
        const tbody = document.getElementById('shopItemsBody');
        const badge = document.getElementById('shopItemCount');
        try {
            const data = await apiFetch('/shop/admin/items');
            if (!tbody) return;

            if (!data.success) {
                badge.textContent = '0';
                tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${data.message || 'Fehler beim Laden der Items'}</p></td></tr>`;
                showToast(data.message || 'Fehler beim Laden der Items', 'error');
                return;
            }

            this._items = data.items;
            badge.textContent = data.items.length;

            if (data.items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-box-open"></i><p>Keine Items im Shop</p></td></tr>';
                return;
            }

            data.items.sort((a, b) => a.category.localeCompare(b.category) || b.id - a.id);
            tbody.innerHTML = data.items.map(item => {
                const price = (item.price_marken && item.price_marken > 0)
                    ? `<span class="text-silver"><i class="fas fa-coins"></i> ${item.price_marken} DM</span>`
                    : `<span class="text-gold"><i class="fas fa-coins"></i> ${item.price_coins} DR</span>`;
                return `
                    <tr>
                        <td><div class="item-icon-box"><img src="${getItemIconPath(item.vnum)}" onerror="handleIconFallback(this, ${item.vnum})"></div></td>
                        <td><strong>${item.name}</strong><br><span class="text-muted text-sm">x${item.count} · VNUM ${item.vnum}</span></td>
                        <td><span class="badge badge-muted">${item.category}</span></td>
                        <td>${price}</td>
                        <td class="text-right">
                            <button class="btn-admin btn-secondary btn-sm" onclick="WebShopPage.editItem(${item.id})" title="Bearbeiten"><i class="fas fa-edit"></i></button>
                            <button class="btn-admin btn-danger btn-sm" onclick="WebShopPage.deleteItem(${item.id})" title="Löschen"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (e) {
            console.error('[WebShop] loadItems error:', e);
            if (tbody) {
                if (badge) badge.textContent = '!';
                tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Fehler beim Laden der Shop-Items</p></td></tr>';
            }
            showToast('Fehler beim Laden der Shop-Items', 'error');
        }
    },

    editItem(id) {
        const item = this._items.find(i => i.id === id);
        if (!item) return;
        this._editId = id;
        document.getElementById('shopVnum').value = item.vnum;
        if (this._vnumPicker) this._vnumPicker.setVnum(item.vnum, item.name);
        document.getElementById('shopPriceDR').value = item.price_coins || '';
        document.getElementById('shopPriceDM').value = item.price_marken || '';
        document.getElementById('shopCount').value = item.count;
        document.getElementById('shopCategory').value = item.category;
        document.getElementById('shopDescription').value = item.description || '';
        document.getElementById('shopFormTitle').textContent = 'Item bearbeiten';
        document.getElementById('shopFormReset').style.display = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    resetForm() {
        this._editId = null;
        document.getElementById('shopItemForm').reset();
        document.getElementById('shopVnum').value = '';
        if (this._vnumPicker) this._vnumPicker.clear();
        document.getElementById('shopFormTitle').textContent = 'Item hinzufügen';
        document.getElementById('shopFormReset').style.display = 'none';
    },

    async saveItem(e) {
        e.preventDefault();
        const payload = {
            vnum: parseInt(document.getElementById('shopVnum').value),
            price_coins: parseInt(document.getElementById('shopPriceDR').value) || 0,
            price_marken: parseInt(document.getElementById('shopPriceDM').value) || null,
            count: parseInt(document.getElementById('shopCount').value) || 1,
            category: document.getElementById('shopCategory').value,
            description: document.getElementById('shopDescription').value || null
        };

        try {
            let data;
            if (this._editId) {
                data = await apiPut(`/shop/admin/items/${this._editId}`, payload);
            } else {
                data = await apiPost('/shop/admin/items', payload);
            }

            if (data.success) {
                showToast(this._editId ? 'Item aktualisiert' : 'Item hinzugefügt', 'success');
                this.resetForm();
                this.loadItems();
            } else {
                showToast(data.message || 'Fehler', 'error');
            }
        } catch (e) { showToast('Fehler beim Speichern', 'error'); }
    },

    deleteItem(id) {
        customConfirm('Item wirklich löschen?', async () => {
            try {
                const data = await apiDelete(`/shop/admin/items/${id}`);
                if (data.success) {
                    showToast('Item gelöscht', 'success');
                    this.loadItems();
                } else {
                    showToast(data.message || 'Fehler beim Löschen des Items', 'error');
                }
            } catch (e) {
                console.error('[WebShop] deleteItem error:', e);
                showToast('Fehler beim Löschen', 'error');
            }
        });
    }
};

window.WebShopPage = WebShopPage;
