// --- Shop Specific Functionality ---
// Depends on api.js and modal.js

let currentItem = null;

window.loadShopItems = async function () {
    const grid = document.getElementById('shopGrid');
    if (!grid) return;

    try {
        const data = await window.apiFetch('/shop/items');

        if (data.success) {
            grid.innerHTML = '';
            data.items.forEach(item => {
                let priceDisplay = '';
                let priceValue = 0;
                let isDM = false;

                if (item.price_marken && item.price_marken > 0) {
                    priceDisplay = `<i class="fas fa-coins text-silver"></i> <span style="color: var(--silver);">${item.price_marken} DM</span>`;
                    priceValue = item.price_marken;
                    isDM = true;
                } else {
                    priceDisplay = `<i class="fas fa-coins text-gold"></i> <span class="text-gold">${item.price_coins} DR</span>`;
                    priceValue = item.price_coins;
                }

                // Build Tooltip HTML
                let tooltipHtml = `<div class="tooltip-header">${item.name}</div>`;
                if (item.description) {
                    tooltipHtml += `<div class="tooltip-desc" style="color: var(--accent); font-style: italic; margin-bottom: 0.5rem; white-space: pre-wrap;">${item.description}</div>`;
                }

                // Add Sockets
                let hasSockets = false;
                let socketsHtml = `<div class="tooltip-sockets">`;
                for (let i = 0; i < 3; i++) {
                    const socketVnum = item[`socket${i}`];
                    if (socketVnum && socketVnum > 0) {
                        hasSockets = true;
                        // use global metin2Stones if available, else fallback
                        const stoneName = (window.metin2Stones && window.metin2Stones.find(s => s.id == socketVnum)?.name) || `Unbekannter Stein`;
                        socketsHtml += `
                            <div class="tooltip-socket">
                                <img src="${window.getItemIconPath(socketVnum)}" onerror="handleIconFallback(this, ${socketVnum})">
                                <span>${stoneName}</span>
                            </div>
                        `;
                    }
                }
                socketsHtml += `</div>`;
                if (hasSockets) tooltipHtml += socketsHtml;

                // Add Attributes
                let attrsHtml = `<div class="tooltip-attrs">`;
                let hasAttrs = false;
                for (let i = 0; i < 7; i++) {
                    const attrType = item[`attrtype${i}`];
                    const attrVal = item[`attrvalue${i}`];
                    if (attrType !== null && attrType !== undefined && attrType > 0 && attrVal && attrVal > 0) {
                        hasAttrs = true;
                        const attrName = (window.metin2Bonuses && window.metin2Bonuses.find(b => b.id == attrType)?.name) || `Bonus #${attrType}`;
                        attrsHtml += `<div style="color: #55efc4; font-size: 0.85rem; margin-bottom: 2px;">+${attrVal}${attrName.includes('%') ? '' : '%'} ${attrName}</div>`;
                    }
                }
                attrsHtml += `</div>`;
                if (hasAttrs) tooltipHtml += attrsHtml;

                // Only wrap if it actually has stats
                let tooltipWrapperOpen = '';
                let tooltipWrapperClose = '';
                let tooltipInner = '';
                if (hasSockets || hasAttrs || item.description) {
                    tooltipWrapperOpen = `<div class="tooltip-container">`;
                    tooltipWrapperClose = `</div>`;
                    tooltipInner = `<div class="item-tooltip">${tooltipHtml}</div>`;
                } else {
                    tooltipWrapperOpen = `<div class="tooltip-container">`;
                    tooltipWrapperClose = `</div>`;
                    tooltipInner = `<div class="item-tooltip"><div class="tooltip-header">${item.name}</div><div style="color:var(--text-muted)">Keine speziellen Boni/Steine</div></div>`;
                }

                grid.innerHTML += `
                    <div class="shop-card ${isDM ? 'shop-card-dm' : 'shop-card-dr'}" data-category="${item.category}" data-currency="${isDM ? 'DM' : 'DR'}">
                        <div class="currency-badge ${isDM ? 'badge-dm' : 'badge-dr'}">
                            <i class="fas fa-coins"></i> ${isDM ? 'DM' : 'DR'}
                        </div>
                        ${tooltipWrapperOpen}
                        <div class="item-icon" 
                             style="background: transparent; border: none; display: flex; align-items: center; justify-content: center; flex-direction: column; cursor: pointer; transition: transform 0.2s;"
                             onclick="openBuyModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                            <img src="${window.getItemIconPath(item.vnum)}" 
                                 onerror="handleIconFallback(this, ${item.vnum})" 
                                 alt="Item Icon" style="max-height: 96px;">
                            <div class="vnum-fallback" style="display: none; padding: 10px; border: 1px dashed var(--glass-border); border-radius: 8px; font-size: 0.8rem; color: var(--text-muted); text-align: center;">
                                <i class="fas fa-image" style="display: block; font-size: 1.5rem; margin-bottom: 5px; color: var(--danger);"></i>
                                VNUM:<br><strong style="color: var(--text-main);">${item.vnum}</strong>
                            </div>
                            <div class="icon-expand-hint" style="font-size: 0.7rem; color: var(--accent); margin-top: 5px; opacity: 0.6;">
                                <i class="fas fa-search-plus"></i> Vergrößern
                            </div>
                        </div>
                        ${tooltipInner}
                        ${tooltipWrapperClose}
                        <h3 class="item-name">${item.name}</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Menge: x${item.count}</p>
                        <div class="item-price">
                            ${priceDisplay}
                        </div>
                        <button class="btn primary-btn" onclick="openBuyModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">Kaufen</button>
                        ${window.isAdminMode ? `
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                            <button class="btn secondary-btn" style="flex: 1; padding: 0.3rem; font-size: 0.8rem;" onclick="window.open('/admin/#/web-shop', '_blank')"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn primary-btn" style="flex: 1; padding: 0.3rem; font-size: 0.8rem; background: rgba(239, 68, 68, 0.2); color: #ef4444; border-color: rgba(239, 68, 68, 0.5);" onclick="deleteItemAsAdmin(${item.id})"><i class="fas fa-trash"></i></button>
                        </div>
                        ` : ''}
                    </div>
                `;
            });

            // Re-apply filters if active
            window.applyShopFilters();
        } else {
            grid.innerHTML = `<p class="msg-error">${data.message}</p>`;
        }
    } catch (err) {
        grid.innerHTML = '<p class="msg-error">Shop konnte nicht geladen werden.</p>';
    }
};

window.applyShopFilters = function () {
    const activeCurBtn = document.querySelector('#currencyFilters .active');
    const filterType = activeCurBtn ? activeCurBtn.getAttribute('data-cur') : 'ALL';
    const cards = document.querySelectorAll('.shop-card');
    const searchInput = document.getElementById('shopSearchInput');
    const query = searchInput ? searchInput.value.toLowerCase() : '';

    cards.forEach(card => {
        const itemCur = card.getAttribute('data-currency');
        const itemCat = card.getAttribute('data-category');
        const itemNameObj = card.querySelector('.item-name');
        const itemName = itemNameObj ? itemNameObj.innerText.toLowerCase() : '';

        let show = false;

        if (filterType === 'ALL') {
            show = true;
        } else if (filterType === 'DR' || filterType === 'DM') {
            show = (itemCur === filterType);
        } else {
            show = (itemCat === filterType);
        }

        if (show && query && !itemName.includes(query)) {
            show = false;
        }

        if (show) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
};

function attachFilterEvents() {
    const curBtns = document.querySelectorAll('#currencyFilters .filter-btn');
    curBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            curBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.borderColor = 'transparent';
            });
            btn.classList.add('active');
            btn.style.background = 'rgba(var(--primary-rgb), 0.2)';
            btn.style.borderColor = 'var(--primary)';
            window.applyShopFilters();
        });
    });
}

window.openBuyModal = function (itemOrId, name, price, vnum, isDM) {
    let item = typeof itemOrId === 'object' ? itemOrId : { id: itemOrId, name, price, vnum, isDM };
    const priceValue = item.price_marken || item.price_coins || item.price || 0;
    const isDMValue = (item.price_marken && item.price_marken > 0) || item.isDM || false;

    currentItem = { id: item.id, name: item.name, price: priceValue, isDM: isDMValue };
    document.getElementById('modalItemName').innerText = item.name;

    if (isDMValue) {
        document.getElementById('modalItemPriceText').innerHTML = `<i class="fas fa-coins text-silver" style="color: var(--silver);"></i> ${priceValue} DM`;
    } else {
        document.getElementById('modalItemPriceText').innerHTML = `<i class="fas fa-coins text-gold"></i> ${priceValue} DR`;
    }

    // Icon im Modal aktualisieren
    const modalIconDiv = document.querySelector('#buyModal .item-icon');
    if (modalIconDiv) {
        modalIconDiv.style.background = 'transparent';
        modalIconDiv.style.border = 'none';
        modalIconDiv.style.width = 'auto';
        modalIconDiv.style.height = 'auto';
        modalIconDiv.innerHTML = `
            <img src="${window.getItemIconPath(item.vnum)}" 
                 onerror="handleIconFallback(this, ${item.vnum})" 
                 style="max-height: 160px; filter: drop-shadow(0 0 15px rgba(var(--primary-rgb), 0.3));">
        `;
    }

    // Details/Boni im Modal anzeigen
    let detailsHtml = '';
    if (item.description) {
        detailsHtml += `<div style="margin-top: 1rem; color: var(--accent); font-style: italic; font-size: 0.9rem; background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 8px;">${item.description}</div>`;
    }

    let statsHtml = '<div style="margin-top: 1rem; text-align: left; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid var(--glass-border);">';
    let hasStats = false;

    // Sockets
    for (let i = 0; i < 3; i++) {
        const socketVnum = item[`socket${i}`];
        if (socketVnum && socketVnum > 0) {
            hasStats = true;
            const stoneName = (window.metin2Stones && window.metin2Stones.find(s => s.id == socketVnum)?.name) || `Stein #${socketVnum}`;
            statsHtml += `<div style="display:flex; align-items:center; gap:8px; margin-bottom:5px; font-size:0.85rem;">
                <img src="${window.getItemIconPath(socketVnum)}" onerror="handleIconFallback(this, ${socketVnum})" style="width:18px; height:18px;">
                <span>${stoneName}</span>
            </div>`;
        }
    }

    // Attrs
    for (let i = 0; i < 7; i++) {
        const attrType = item[`attrtype${i}`];
        const attrVal = item[`attrvalue${i}`];
        if (attrType !== null && attrType !== undefined && attrType > 0 && attrVal && attrVal > 0) {
            hasStats = true;
            const attrName = (window.metin2Bonuses && window.metin2Bonuses.find(b => b.id == attrType)?.name) || `Bonus #${attrType}`;
            statsHtml += `<div style="color: #55efc4; font-size: 0.85rem; margin-bottom: 2px;">+${attrVal}${attrName.includes('%') ? '' : '%'} ${attrName}</div>`;
        }
    }
    statsHtml += '</div>';

    const detailsContainer = document.getElementById('modalItemDetails');
    if (detailsContainer) {
        detailsContainer.innerHTML = detailsHtml + (hasStats ? statsHtml : '');
        detailsContainer.style.display = 'block';
    }

    document.getElementById('buyModal').style.display = 'flex';
};

window.closeBuyModal = function () {
    document.getElementById('buyModal').style.display = 'none';
    currentItem = null;
};

document.addEventListener('DOMContentLoaded', async () => {
    const filterContainer = document.getElementById('currencyFilters');

    // If we are on the shop page, fetch dynamic categories
    if (filterContainer) {
        try {
            const data = await window.apiFetch('/shop/categories');

            if (data.success && data.categories.length > 0) {
                data.categories.forEach(cat => {
                    const btn = document.createElement('button');
                    btn.className = 'btn secondary-btn filter-btn';
                    btn.setAttribute('data-cur', cat.name);
                    btn.style.width = 'auto';
                    btn.style.padding = '0.5rem 1rem';
                    btn.innerHTML = `<i class="fas fa-tag" style="color:var(--primary);"></i> ${cat.name}`;
                    filterContainer.appendChild(btn);
                });
            }
        } catch (e) {
            console.error("Fehler beim Laden der Kategorien für den Shop", e);
        }

        // Attach event listeners to all filter buttons
        attachFilterEvents();
    }

    // Bind buy action
    const confirmBuyBtn = document.getElementById('confirmBuyBtn');
    if (confirmBuyBtn) {
        confirmBuyBtn.addEventListener('click', async () => {
            if (!currentItem) return;

            const user = window.safeJSONParse(localStorage.getItem('m2user'));
            const btn = confirmBuyBtn;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            const destinationElement = document.getElementById('buyDestination');
            const destination = destinationElement ? destinationElement.value : 'MALL';

            try {
                const data = await window.apiFetch('/shop/buy', {
                    method: 'POST',
                    body: JSON.stringify({
                        item_id: currentItem.id,
                        destination: destination
                    })
                });
                window.customAlert(data.message, data.success ? 'Erfolg' : 'Fehler');

                if (data.success) {
                    // Update user in localStorage with new balances from server
                    if (data.new_coins !== undefined) user.coins = data.new_coins;
                    if (data.new_cash !== undefined) user.cash = data.new_cash;

                    localStorage.setItem('m2user', JSON.stringify(user));

                    const shopCoins = document.getElementById('shopCoins');
                    const pCoins = document.getElementById('pCoins');
                    const shopCash = document.getElementById('shopCash');
                    const pCash = document.getElementById('pCash');

                    if (shopCoins) shopCoins.innerText = user.coins;
                    if (pCoins) pCoins.innerText = user.coins;
                    if (shopCash) shopCash.innerText = user.cash;
                    if (pCash) pCash.innerText = user.cash;

                    if (typeof window.updateNavBalance === 'function') {
                        window.updateNavBalance(user);
                    }
                }

            } catch (err) {
                window.customAlert('Kauf fehlgeschlagen.', 'Fehler');
            } finally {
                window.closeBuyModal();
                btn.innerHTML = 'Kaufen';
                btn.disabled = false;
            }
        });
    }
});

// Admin Shop direct delete helper
window.deleteItemAsAdmin = async function (id) {
    window.customConfirm('Möchtest du dieses Item wirklich aus dem Shop entfernen?', async () => {
        try {
            const data = await window.apiFetch(`/admin/items/${id}`, {
                method: 'DELETE'
            });
            if (data.success) {
                window.customAlert('Das Item wurde erfolgreich gelöscht.', 'Erfolg');
                window.loadShopItems();
            } else {
                window.customAlert(data.message, 'Fehler');
            }
        } catch (err) {
            window.customAlert('Fehler beim Löschen des Items.', 'Fehler');
        }
    });
};
