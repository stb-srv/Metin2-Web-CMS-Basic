// Web Itemshop Management (Items, Categories, DR/DM Gifting)

async function loadCategories() {
    const list = document.getElementById('itemCategory');
    const manageList = document.getElementById('manageCategoriesList');
    if (!list || !manageList) return;

    try {
        const res = await fetch(`${API_URL}/shop/categories`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            list.innerHTML = '';
            manageList.innerHTML = '';
            data.categories.forEach(c => {
                list.innerHTML += `<option value="${c.name}">${c.name}</option>`;
                manageList.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 0.5rem;">
                        <span>${c.name}</span>
                        <button class="btn" style="padding: 0.2rem 0.51rem; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5);" onclick="deleteCategory(${c.id})"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            });
        }
    } catch (e) {
        console.error('Fetch Categories Error:', e);
    }
}

async function addCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const name = nameInput.value.trim();
    if (!name) return;

    try {
        const res = await fetch(`${API_URL}/shop/admin/categories`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (data.success) {
            nameInput.value = '';
            loadCategories();
        } else {
            customAlert(data.message, 'Fehler');
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteCategory(id) {
    customConfirm('Möchtest du diese Kategorie wirklich löschen?', async () => {
        try {
            await fetch(`${API_URL}/shop/admin/categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            loadCategories();
        } catch (err) {
            console.error(err);
        }
    });
}

async function loadAdminItems() {
    const tbody = document.getElementById('adminItemsList');
    const totalBadge = document.getElementById('totalItemsBadge');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/shop/admin/items`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (data.success && data.items.length > 0) {
            window.adminItemsData = data.items;
            tbody.innerHTML = '';
            totalBadge.innerText = `${data.items.length} Items`;
            data.items.sort((a, b) => a.category.localeCompare(b.category) || b.id - a.id);

            data.items.forEach(item => {
                let priceDisplay = (item.price_marken !== null && item.price_marken > 0)
                    ? `<i class="fas fa-coins text-silver" style="color:var(--silver);"></i> ${item.price_marken}`
                    : `<i class="fas fa-coins text-gold"></i> ${item.price_coins}`;

                tbody.innerHTML += `
                    <tr>
                        <td style="text-align: center;">
                            <div style="background: rgba(0,0,0,0.5); border-radius: 8px; padding: 5px; display: inline-block; border: 1px solid rgba(255,255,255,0.1);">
                                <img src="${getItemIconPath(item.vnum)}" style="max-height: 48px; image-rendering: pixelated;" 
                                     onerror="handleIconFallback(this, ${item.vnum})">
                            </div>
                        </td>
                        <td>
                            <strong>${item.name}</strong><br>
                            <span style="color: var(--text-muted); font-size: 0.85rem;">Menge: x${item.count} | VNUM: ${item.vnum}</span>
                        </td>
                        <td><span class="badge" style="background: rgba(255,255,255,0.1);">${item.category}</span></td>
                        <td><strong>${priceDisplay}</strong></td>
                        <td style="text-align: right; min-width: 110px;">
                            <button class="btn" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.5); padding: 0.5rem; width: auto; margin-right: 0.5rem;" onclick="editItem(${item.id})" title="Bearbeiten">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.5); padding: 0.5rem; width: auto;" onclick="deleteItem(${item.id})" title="Löschen">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Keine Items gefunden.</td></tr>';
        }
    } catch (err) {
        console.error('Load Items Error:', err);
    }
}

function editItem(id) {
    if (!window.adminItemsData) return;
    const item = window.adminItemsData.find(i => i.id === id);
    if (!item) return;

    document.getElementById('editItemId').value = item.id;
    document.getElementById('itemVnum').value = item.vnum;

    if (item.price_marken !== null && item.price_marken > 0) {
        document.getElementById('costTypeDM').checked = true;
        document.getElementById('itemPriceMarken').value = item.price_marken;
        document.getElementById('groupDR').style.display = 'none';
        document.getElementById('groupDM').style.display = 'block';
    } else {
        document.getElementById('costTypeDR').checked = true;
        document.getElementById('itemPrice').value = item.price_coins;
        document.getElementById('groupDR').style.display = 'block';
        document.getElementById('groupDM').style.display = 'none';
    }

    document.getElementById('itemCount').value = item.count;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('addItemSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Änderungen Speichern';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteItem(id) {
    customConfirm('Möchtest du dieses Item wirklich löschen?', async () => {
        try {
            await fetch(`${API_URL}/shop/admin/items/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            loadAdminItems();
        } catch (err) {
            console.error(err);
        }
    });
}

async function giveCurrency(type) {
    const accId = document.getElementById(`${type}AccountSelect`).value;
    const amount = document.getElementById(`${type}Amount`).value;
    const msg = document.getElementById(`${type}Msg`);

    if (!accId || !amount) {
        msg.className = 'form-msg msg-error';
        msg.innerText = 'Bitte alle Felder ausfüllen.';
        return;
    }

    msg.innerText = 'Wird gesendet...';
    try {
        const res = await fetch(`${API_URL}/shop/admin/give-${type}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ target_account_id: accId, amount })
        });
        const data = await res.json();
        msg.className = data.success ? 'form-msg msg-success' : 'form-msg msg-error';
        msg.innerText = data.message;
    } catch (err) {
        msg.className = 'form-msg msg-error';
        msg.innerText = 'Netzwerkfehler.';
    }
}

// DR/DM Forms
document.addEventListener('DOMContentLoaded', () => {
    const drForm = document.getElementById('drForm');
    if (drForm) drForm.addEventListener('submit', (e) => { e.preventDefault(); giveCurrency('dr'); });
    const dmForm = document.getElementById('dmForm');
    if (dmForm) dmForm.addEventListener('submit', (e) => { e.preventDefault(); giveCurrency('dm'); });
});

async function loadAdminAccounts() {
    const drSelect = document.getElementById('drAccountSelect');
    const dmSelect = document.getElementById('dmAccountSelect');
    if (!drSelect && !dmSelect) return;

    try {
        const res = await fetch(`${API_URL}/shop/admin/accounts`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (data.success && data.accounts) {
            let optionsHtml = '<option value="">-- Account wählen --</option>';
            data.accounts.forEach(acc => {
                optionsHtml += `<option value="${acc.id}">${acc.login} (ID: ${acc.id})</option>`;
            });

            if (drSelect) drSelect.innerHTML = optionsHtml;
            if (dmSelect) dmSelect.innerHTML = optionsHtml;
        }
    } catch (e) {
        console.error('Fetch Accounts Error:', e);
    }
}

