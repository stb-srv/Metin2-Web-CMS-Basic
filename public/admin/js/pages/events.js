
const EventsPage = {
    render() {
        return `
            <div class="admin-header">
                <div class="admin-title">
                    <h1><i class="fas fa-calendar-alt"></i> Event-Kalender</h1>
                    <p>Verwalte Ingame-Events und Aktionen auf der Website</p>
                </div>
                <div class="admin-actions">
                    <button class="btn-admin btn-primary" onclick="EventsPage.openModal()"><i class="fas fa-plus"></i> Neues Event</button>
                </div>
            </div>

            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title"><i class="fas fa-list"></i> Alle Events</div>
                </div>
                <div class="table-responsive">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Icon</th>
                                <th>Titel</th>
                                <th>Zeitraum</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="eventsList">
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                                    <i class="fas fa-spinner fa-spin"></i> Lade Events...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    async init() {
        await this.loadEvents();
    },

    async loadEvents() {
        try {
            const data = await apiFetch('/cms/events');
            if (data.success) {
                this.renderEvents(data.events);
            }
        } catch (err) {
            showToast('Fehler beim Laden der Events', 'error');
        }
    },

    renderEvents(events) {
        const list = document.getElementById('eventsList');
        if (!list) return;

        if (events.length === 0) {
            list.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">Keine Events geplant.</td></tr>';
            return;
        }

        const now = new Date();

        list.innerHTML = events.map(ev => {
            const start = new Date(ev.start_date);
            const end = new Date(ev.end_date);
            
            let status = '<span class="badge badge-secondary">Geplant</span>';
            if (now >= start && now <= end) {
                status = '<span class="badge badge-success">Aktiv</span>';
            } else if (now > end) {
                status = '<span class="badge badge-danger">Beendet</span>';
            }

            if (!ev.is_active) status = '<span class="badge badge-secondary">Inaktiv</span>';

            const period = `${start.toLocaleDateString('de-DE')} ${start.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})} - ${end.toLocaleDateString('de-DE')} ${end.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})}`;

            return `
                <tr>
                    <td>${status}</td>
                    <td><i class="${ev.icon || 'fas fa-calendar-alt'}" style="font-size: 1.2rem; color: var(--primary);"></i></td>
                    <td>
                        <div style="font-weight: 600;">${ev.title}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ev.description || ''}</div>
                    </td>
                    <td style="font-size: 0.85rem;">${period}</td>
                    <td>
                        <div class="admin-table-actions">
                            <button class="btn-icon" title="Bearbeiten" onclick="EventsPage.openModal(${JSON.stringify(ev).replace(/"/g, '&quot;')})"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon btn-icon-danger" title="Löschen" onclick="EventsPage.deleteEvent(${ev.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openModal(event = null) {
        const isEdit = !!event;
        const title = isEdit ? 'Event bearbeiten' : 'Neues Event erstellen';
        
        // Helper for date formatting for input[type="datetime-local"]
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
        };

        const html = `
            <form id="eventForm">
                <input type="hidden" name="id" value="${event?.id || ''}">
                <div class="form-group">
                    <label class="form-label">Titel</label>
                    <input type="text" class="admin-input" name="title" value="${event?.title || ''}" required placeholder="z.B. Oster-Event">
                </div>
                <div class="form-group">
                    <label class="form-label">Beschreibung</label>
                    <textarea class="admin-input" name="description" rows="3" placeholder="Kurze Beschreibung des Events...">${event?.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start</label>
                        <input type="datetime-local" class="admin-input" name="start_date" value="${formatDate(event?.start_date)}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ende</label>
                        <input type="datetime-local" class="admin-input" name="end_date" value="${formatDate(event?.end_date)}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Icon (Font Awesome)</label>
                        <input type="text" class="admin-input" name="icon" value="${event?.icon || 'fas fa-calendar-alt'}" placeholder="fas fa-star">
                    </div>
                    <div class="form-group" style="padding-top: 2rem;">
                        <label><input type="checkbox" name="is_active" value="true" ${event?.is_active !== 0 ? 'checked' : ''}> Aktiviert</label>
                    </div>
                </div>
            </form>
        `;

        showModal(title, html, async () => {
            const form = document.getElementById('eventForm');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.is_active = formData.get('is_active') === 'true';

            try {
                const res = await apiFetch('/cms/events', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                if (res.success) {
                    showToast(res.message, 'success');
                    await this.loadEvents();
                    return true;
                } else {
                    showToast(res.message, 'error');
                    return false;
                }
            } catch (err) {
                showToast('Fehler beim Speichern', 'error');
                return false;
            }
        });
    },

    async deleteEvent(id) {
        customConfirm('Möchtest du dieses Event wirklich löschen?', async () => {
            try {
                const res = await apiFetch(`/cms/events/${id}`, { method: 'DELETE' });
                if (res.success) {
                    showToast(res.message, 'success');
                    await this.loadEvents();
                }
            } catch (err) {
                showToast('Fehler beim Löschen', 'error');
            }
        }, 'Event löschen');
    }
};

window.EventsPage = EventsPage;
