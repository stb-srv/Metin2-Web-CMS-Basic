/**
 * Admin: CMS SMTP & Email Configuration
 * Handles SMTP settings for the platform.
 */

const CmsSmtpPage = {
    title: 'SMTP & E-Mail',
    icon: 'fa-envelope',
    breadcrumb: 'System & Setup &rsaquo; SMTP & E-Mail',

    render() {
        return `
            <div class="admin-grid admin-grid-2">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-envelope"></i> SMTP Konfiguration</div>
                    </div>
                    <form id="cmsSmtpForm" onsubmit="CmsSmtpPage.save(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">SMTP Host</label>
                                <input type="text" class="admin-input" id="cmsSmtpHost" name="smtp_host" placeholder="smtp.example.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">SMTP Port</label>
                                <input type="number" class="admin-input" id="cmsSmtpPort" name="smtp_port" placeholder="587">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">SMTP User</label>
                            <input type="text" class="admin-input" id="cmsSmtpUser" name="smtp_user" placeholder="user@example.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">SMTP Passwort</label>
                            <input type="password" class="admin-input" id="cmsSmtpPass" name="smtp_pass" placeholder="••••••••">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Von (Sender E-Mail)</label>
                            <input type="text" class="admin-input" id="cmsSmtpFrom" name="smtp_from" placeholder="noreply@example.com">
                        </div>
                        <div class="form-group" style="display:flex; justify-content:space-between; align-items:center;">
                            <label class="form-label" style="margin:0;">SSL/TLS Secure (Port 465)</label>
                            <label class="admin-switch">
                                <input type="checkbox" id="cmsSmtpSecure" name="smtp_secure" value="true">
                                <span class="admin-slider"></span>
                            </label>
                        </div>
                        
                        <div style="margin-top: 1.5rem; text-align: right;">
                            <button type="submit" class="btn-admin btn-primary"><i class="fas fa-save"></i> SMTP Speichern</button>
                        </div>
                    </form>
                </div>

                <div class="admin-card" style="align-self: flex-start;">
                    <div class="admin-card-header">
                        <div class="admin-card-title"><i class="fas fa-info-circle"></i> Hinweise</div>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
                        Die SMTP-Einstellungen werden für den E-Mail-Versand (z.B. Passwort zurücksetzen, Registrierung) benötigt.
                    </p>
                    <ul style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; padding-left: 1.2rem;">
                        <li><strong>Port 587:</strong> Oft für TLS genutzt. "SSL/TLS Secure" hier meist auf <strong>aus</strong>.</li>
                        <li><strong>Port 465:</strong> Wird oft für echtes SSL genutzt. "SSL/TLS Secure" hier auf <strong>an</strong>.</li>
                    </ul>
                </div>
            </div>
        `;
    },

    init() {
        this.load();
    },

    async load() {
        try {
            const data = await apiFetch('/cms/settings/admin');
            if (data.success) {
                const s = data.settings;
                document.getElementById('cmsSmtpHost').value = s.smtp_host || '';
                document.getElementById('cmsSmtpPort').value = s.smtp_port || '';
                document.getElementById('cmsSmtpUser').value = s.smtp_user || '';
                document.getElementById('cmsSmtpPass').value = s.smtp_pass || '';
                document.getElementById('cmsSmtpFrom').value = s.smtp_from || '';
                document.getElementById('cmsSmtpSecure').checked = s.smtp_secure === 'true';
            }
        } catch (e) {
            console.error(e);
        }
    },

    async save(e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem('m2token');
            const data = {
                smtp_host: document.getElementById('cmsSmtpHost').value,
                smtp_port: document.getElementById('cmsSmtpPort').value,
                smtp_user: document.getElementById('cmsSmtpUser').value,
                smtp_pass: document.getElementById('cmsSmtpPass').value,
                smtp_from: document.getElementById('cmsSmtpFrom').value,
                smtp_secure: String(document.getElementById('cmsSmtpSecure').checked)
            };

            const res = await fetch('/api/cms/settings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(data).toString()
            });

            const resData = await res.json();
            if (resData.success) {
                showToast('SMTP-Einstellungen gespeichert!', 'success');
            } else {
                showToast(resData.message || 'Fehler beim Speichern', 'error');
            }
        } catch (err) {
            showToast('Fehler beim Speichern', 'error');
        }
    }
};

window.CmsSmtpPage = CmsSmtpPage;
