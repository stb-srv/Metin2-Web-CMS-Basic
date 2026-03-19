// Player & Ban Management

async function searchPlayerToBan() {
    const q = document.getElementById('banSearchInput').value;
    const results = document.getElementById('banPlayerResults');
    if (q.length < 3) { results.innerHTML = ''; return; }

    try {
        const res = await fetch(`${API_URL}/player/search?q=${q}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            results.innerHTML = '';
            data.players.forEach(p => {
                const btn = document.createElement('button');
                btn.className = 'btn';
                btn.style.width = '100%';
                btn.style.marginBottom = '0.5rem';
                btn.style.textAlign = 'left';
                btn.innerHTML = `<i class="fas fa-user"></i> ${p.name} (ID: ${p.account_id})`;
                btn.onclick = () => {
                    document.getElementById('banAccountId').value = p.account_id;
                    document.getElementById('banAccountName').value = `Account ID: ${p.account_id}`;
                    document.getElementById('banPlayerForm').style.display = 'block';
                    results.innerHTML = '';
                };
                results.appendChild(btn);
            });
        }
    } catch (e) { console.error(e); }
}

async function loadBanHistory() {
    const tbody = document.getElementById('banHistoryTableBody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/player/bans/history`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            tbody.innerHTML = '';
            data.history.forEach(b => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 1rem;">${b.account_name || 'N/A'} (ID: ${b.account_id})</td>
                    <td style="padding: 1rem;">${b.admin_username}</td>
                    <td style="padding: 1rem;">${b.reason}</td>
                    <td style="padding: 1rem;">${b.banned_until ? new Date(b.banned_until).toLocaleDateString() : 'Permanent'}</td>
                    <td style="padding: 1rem;">
                        <button class="btn secondary-btn" onclick="unbanAccount(${b.account_id})">Entbannen</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) { console.error(e); }
}

async function unbanAccount(id) {
    customConfirm('Diesen Account wirklich entbannen?', async () => {
        try {
            const res = await fetch(`${API_URL}/player/bans/unban`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ account_id: id })
            });
            const data = await res.json();
            if (data.success) loadBanHistory();
        } catch (e) { console.error(e); }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const banForm = document.getElementById('banPlayerForm');
    if (banForm) {
        banForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                account_id: document.getElementById('banAccountId').value,
                duration_days: document.getElementById('banDuration').value,
                reason: document.getElementById('banReason').value
            };
            try {
                const res = await fetch(`${API_URL}/player/bans/account`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                customAlert(data.message, data.success ? 'Erfolg' : 'Fehler');
                if (data.success) {
                    banForm.reset();
                    banForm.style.display = 'none';
                    loadBanHistory();
                }
            } catch (e) { console.error(e); }
        });
    }
});
