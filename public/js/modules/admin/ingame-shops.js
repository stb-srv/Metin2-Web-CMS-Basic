// Ingame System Management (NPC Shops, GMs, Permissions, Players)

async function loadIngameShops() {
    const list = document.getElementById('ingameShopsList');
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/server/shops`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            list.innerHTML = '';
            data.shops.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 1rem;">${s.vnum}</td>
                    <td style="padding: 1rem;"><strong>${s.name}</strong></td>
                    <td style="padding: 1rem;">${s.npc_vnum}</td>
                    <td style="padding: 1rem; text-align: right;">
                        <button class="btn primary-btn" style="padding: 0.5rem 1rem;" onclick="editIngameShop(${s.vnum})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn" style="padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5);" onclick="deleteIngameShop(${s.vnum})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                list.appendChild(tr);
            });
        }
    } catch (err) {
        console.error('Fetch Ingame Shops Error:', err);
    }
}

async function loadGmList() {
    const tbody = document.getElementById('gmListTable');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/server/gmlist`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            tbody.innerHTML = '';
            data.gmlist.forEach(gm => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 1rem;">${gm.mAccount}</td>
                    <td style="padding: 1rem;">${gm.mName}</td>
                    <td style="padding: 1rem;">${gm.mContactIP}</td>
                    <td style="padding: 1rem;"><span class="badge" style="background: rgba(255,255,255,0.1);">${gm.mAuthority}</span></td>
                    <td style="padding: 1rem; text-align: right;">
                        <button class="btn" style="padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5);" onclick="deleteGm(${gm.mID})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error('Fetch GM List Error:', e);
    }
}

async function deleteGm(id) {
    customConfirm('Game Master Eintrag wirklich entfernen?', async () => {
        try {
            await fetch(`${API_URL}/server/gmlist/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            loadGmList();
        } catch (e) {
            console.error(e);
        }
    });
}
// ... [More functions like addShop, editShop, etc.]
// For now, I'll extract the core ones clearly.
