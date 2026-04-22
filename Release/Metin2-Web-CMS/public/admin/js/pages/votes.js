const VotesPage = {
    title: 'Vote4Coins',
    icon: 'fa-thumbs-up',
    breadcrumb: 'CMS > Vote4Coins',

    render() {
        return `
            <div class="admin-card">
                <div class="admin-card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="admin-card-title"><i class="fas fa-list-ol"></i> Vote-Links verwalten</div>
                    <button class="btn-admin btn-primary" onclick="window.VotesPage.openModal()"><i class="fas fa-plus"></i> Link hinzufügen</button>
                </div>
                
                <div class="table-responsive">
                    <table class="admin-table" id="votesTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Titel</th>
                                <th>URL</th>
                                <th>Belohnung (Coins)</th>
                                <th>Cooldown</th>
                                <th>Status</th>
                                <th style="text-align: right;">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="7" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Lade Vote-Links...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Vote Modal -->
            <div id="voteModal" class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title" id="voteModalTitle">Vote-Link hinzufügen</h3>
                        <button class="modal-close" onclick="closeModal('voteModal')"><i class="fas fa-times"></i></button>
                    </div>
                    <form id="voteForm" onsubmit="window.VotesPage.save(event)">
                        <input type="hidden" id="voteId">
                        
                        <div class="form-group">
                            <label class="form-label">Titel (z.B. Topliste XY)</label>
                            <input type="text" class="form-input" id="voteTitle" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Vote URL</label>
                            <input type="url" class="form-input" id="voteUrl" placeholder="https://..." required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Bild URL (Optional für Banner)</label>
                            <input type="url" class="form-input" id="voteImage">
                        </div>
                        
                        <div style="display: flex; gap: 1rem;">
                            <div class="form-group" style="flex: 1;">
                                <label class="form-label">Belohnung (Coins)</label>
                                <input type="number" class="form-input" id="voteReward" value="10" min="0" required>
                            </div>
                            
                            <div class="form-group" style="flex: 1;">
                                <label class="form-label">Cooldown (Stunden)</label>
                                <input type="number" class="form-input" id="voteCooldown" value="12" min="0" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-checkbox">
                                <input type="checkbox" id="voteActive" checked>
                                <span>Aktiv (Wird den Spielern angezeigt)</span>
                            </label>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                            <button type="button" class="btn-admin btn-secondary" onclick="closeModal('voteModal')">Abbrechen</button>
                            <button type="submit" class="btn-admin btn-primary"><i class="fas fa-save"></i> Speichern</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    async init() {
        window.VotesPage = this;
        await this.loadLinks();
    },

    async loadLinks() {
        const tbody = document.querySelector('#votesTable tbody');
        try {
            const data = await apiFetch('/votes/admin');
            
            if (data.success) {
                if (data.links.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Keine Vote-Links gefunden.</td></tr>';
                    return;
                }
                
                // Store links globally for easy edit mapping
                this.links = data.links;
                
                tbody.innerHTML = data.links.map(link => `
                    <tr>
                        <td>#${link.id}</td>
                        <td style="font-weight: 500;">${escapeHtml(link.title)}</td>
                        <td><a href="${escapeHtml(link.url)}" target="_blank" style="color: var(--primary); text-decoration: none;">Link <i class="fas fa-external-link-alt" style="font-size: 0.8em;"></i></a></td>
                        <td style="color: var(--gold); font-weight: bold;"><i class="fas fa-coins"></i> ${link.reward}</td>
                        <td><i class="fas fa-clock text-muted"></i> ${link.cooldown_hours}h</td>
                        <td>${link.is_active ? '<span class="badge badge-success">Aktiv</span>' : '<span class="badge badge-danger">Inaktiv</span>'}</td>
                        <td style="text-align: right;">
                            <button class="btn-admin btn-secondary" style="padding: 5px 10px;" onclick="window.VotesPage.edit(${link.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn-admin btn-danger" style="padding: 5px 10px;" onclick="window.VotesPage.delete(${link.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = `<tr><td colspan="7" style="color: #ef4444; padding: 20px;">${data.message || 'Fehler beim Laden.'}</td></tr>`;
            }
        } catch (e) {
            console.error(e);
            tbody.innerHTML = '<tr><td colspan="7" style="color: #ef4444; padding: 20px;">Netzwerkfehler.</td></tr>';
        }
    },

    openModal() {
        document.getElementById('voteModalTitle').innerText = 'Vote-Link hinzufügen';
        document.getElementById('voteForm').reset();
        document.getElementById('voteId').value = '';
        document.getElementById('voteActive').checked = true;
        openModal('voteModal');
    },

    edit(id) {
        const link = this.links.find(l => l.id === id);
        if (!link) return;
        
        document.getElementById('voteModalTitle').innerText = 'Vote-Link bearbeiten';
        document.getElementById('voteId').value = link.id;
        document.getElementById('voteTitle').value = link.title;
        document.getElementById('voteUrl').value = link.url;
        document.getElementById('voteImage').value = link.image_url || '';
        document.getElementById('voteReward').value = link.reward;
        document.getElementById('voteCooldown').value = link.cooldown_hours;
        document.getElementById('voteActive').checked = link.is_active === 1;
        
        openModal('voteModal');
    },

    async save(e) {
        e.preventDefault();
        const id = document.getElementById('voteId').value;
        const payload = {
            title: document.getElementById('voteTitle').value,
            url: document.getElementById('voteUrl').value,
            image_url: document.getElementById('voteImage').value,
            reward: parseInt(document.getElementById('voteReward').value) || 10,
            cooldown_hours: parseInt(document.getElementById('voteCooldown').value) || 12,
            is_active: document.getElementById('voteActive').checked
        };
        
        try {
            let res;
            if (id) {
                res = await apiFetch(`/votes/admin/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                res = await apiFetch('/votes/admin', { method: 'POST', body: JSON.stringify(payload) });
            }
            
            if (res.success) {
                showToast(res.message, 'success');
                closeModal('voteModal');
                this.loadLinks();
            } else {
                showToast(res.message || 'Ein Fehler ist aufgetreten', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Netzwerkfehler', 'error');
        }
    },

    async delete(id) {
        customConfirm('Möchtest du diesen Vote-Link wirklich entfernen? Die Statistiken bleiben erhalten.', async () => {
            try {
                const res = await apiFetch(`/votes/admin/${id}`, { method: 'DELETE' });
                if (res.success) {
                    showToast('Vote-Link erfolgreich gelöscht.', 'success');
                    this.loadLinks();
                } else {
                    showToast(res.message, 'error');
                }
            } catch(e) {
                showToast('Netzwerkfehler', 'error');
            }
        });
    }
};

window.VotesPage = VotesPage;
