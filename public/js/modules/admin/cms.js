// CMS Management (Downloads, Pages, Settings)

async function loadCmsSettings() {
    try {
        const res = await fetch(`${API_URL}/cms/settings`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            document.getElementById('site_name').value = data.settings.site_name || '';
            document.getElementById('site_logo').value = data.settings.site_logo || '';
        }
    } catch (e) {
        console.error('Fetch Settings Error:', e);
    }
}

async function loadDownloads() {
    try {
        const res = await fetch(`${API_URL}/cms/downloads`, { headers: getAuthHeaders() });
        const data = await res.json();
        const tbody = document.getElementById('downloadsTableBody');

        if (data.success) {
            window.adminDownloadsList = data.downloads;
            tbody.innerHTML = '';
            if (data.downloads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1rem;">Keine Downloads gefunden.</td></tr>';
                return;
            }

            data.downloads.forEach(dl => {
                let safeUrl = dl.url;
                if (!safeUrl.startsWith('http://') && !safeUrl.startsWith('https://') && !safeUrl.startsWith('/') && !safeUrl.startsWith('#')) {
                    safeUrl = 'https://' + safeUrl;
                }

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                tr.innerHTML = `
                    <td style="padding: 1rem;">${dl.display_order}</td>
                    <td style="padding: 1rem;"><strong>${dl.title}</strong></td>
                    <td style="padding: 1rem; color: var(--text-muted); max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"><a href="${safeUrl}" target="_blank" style="color: var(--primary);">${safeUrl}</a></td>
                    <td style="padding: 1rem;"><i class="${dl.icon}" style="color: ${dl.icon_color}; background: ${dl.bg_color}; padding: 8px; border-radius: 4px;"></i></td>
                    <td style="padding: 1rem; text-align: right;">
                        <button class="btn secondary-btn" style="padding: 0.5rem 1rem;" onclick="editDownload(${dl.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn" style="padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5);" onclick="deleteDownload(${dl.id})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error('Fetch Downloads Error:', e);
    }
}

function openDownloadModal() {
    document.getElementById('downloadForm').reset();
    document.getElementById('downloadId').value = '';
    document.getElementById('downloadModalTitle').innerHTML = '<i class="fas fa-plus"></i> Neuer Link';
    document.getElementById('downloadModal').style.display = 'flex';
}

function closeDownloadModal() {
    document.getElementById('downloadModal').style.display = 'none';
}

function editDownload(id) {
    const dl = window.adminDownloadsList.find(d => d.id === id);
    if (!dl) return;
    document.getElementById('downloadId').value = dl.id;
    document.getElementById('dlTitle').value = dl.title;
    document.getElementById('dlDesc').value = dl.description;
    document.getElementById('dlUrl').value = dl.url;
    document.getElementById('dlIcon').value = dl.icon;
    document.getElementById('dlBgColor').value = dl.bg_color;
    document.getElementById('dlIconColor').value = dl.icon_color;
    document.getElementById('dlOrder').value = dl.display_order;
    document.getElementById('downloadModalTitle').innerHTML = '<i class="fas fa-edit"></i> Link bearbeiten';
    document.getElementById('downloadModal').style.display = 'flex';
}

async function deleteDownload(id) {
    customConfirm('Download wirklich löschen?', async () => {
        try {
            const res = await fetch(`${API_URL}/cms/downloads/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) loadDownloads();
            else customAlert(data.message);
        } catch (err) {
            console.error(err);
        }
    });
}

// Initial Listeners
document.addEventListener('DOMContentLoaded', () => {
    const dlForm = document.getElementById('downloadForm');
    if (dlForm) {
        dlForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('downloadId').value;
            const payload = {
                title: document.getElementById('dlTitle').value,
                description: document.getElementById('dlDesc').value,
                url: document.getElementById('dlUrl').value,
                icon: document.getElementById('dlIcon').value,
                bg_color: document.getElementById('dlBgColor').value,
                icon_color: document.getElementById('dlIconColor').value,
                display_order: document.getElementById('dlOrder').value
            };

            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/cms/downloads/${id}` : `${API_URL}/cms/downloads`;

            try {
                const res = await fetch(url, {
                    method,
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    closeDownloadModal();
                    loadDownloads();
                } else {
                    customAlert(data.message);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    const settingsForm = document.getElementById('cmsSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                site_name: document.getElementById('site_name').value,
                site_logo: document.getElementById('site_logo').value
            };
            try {
                const res = await fetch(`${API_URL}/cms/settings`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                customAlert(data.message, data.success ? 'Erfolg' : 'Fehler');
            } catch (err) {
                console.error(err);
            }
        });
    }
});
