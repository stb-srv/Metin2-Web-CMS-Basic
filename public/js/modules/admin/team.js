// Team & Permissions Management

async function loadPermissions() {
    const tbody = document.getElementById('permissionsTableBody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/admin/core/permissions`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (data.success) {
            tbody.innerHTML = '';

            if (data.permissions && data.permissions.length > 0) {
                data.permissions.forEach(p => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding: 1rem; font-weight: bold; color: var(--primary-light);">${p.role_name}</td>
                        <td style="padding: 1rem;"><i class="fas ${p.can_manage_shop ? 'fa-check text-green-500' : 'fa-times text-red-500'}"></i></td>
                        <td style="padding: 1rem;"><i class="fas ${p.can_give_gifts ? 'fa-check text-green-500' : 'fa-times text-red-500'}"></i></td>
                        <td style="padding: 1rem;"><i class="fas ${p.can_manage_players ? 'fa-check text-green-500' : 'fa-times text-red-500'}"></i></td>
                        <td style="padding: 1rem;"><i class="fas ${p.can_manage_team ? 'fa-check text-green-500' : 'fa-times text-red-500'}"></i></td>
                        <td style="padding: 1rem;">
                            <button class="btn secondary-btn" onclick="editPermissions('${p.role_name}')">Bearbeiten</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 1rem;">Keine Rollen gefunden.</td></tr>';
            }
        } else {
            customAlert(data.message || 'Fehler beim Laden der Berechtigungen.', 'Fehler');
        }
    } catch (e) {
        console.error('Permission load error:', e);
    }
}

async function editPermissions(roleName) {
    customAlert(`Bearbeiten der Berechtigungen für Rolle: ${roleName} ist in dieser Ansicht noch einzubauen.`, 'Info');
}
