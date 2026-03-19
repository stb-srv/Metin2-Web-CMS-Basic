/**
 * Footer Component
 * Dynamically renders the site footer with central settings.
 */

function renderFooter() {
    const footers = document.querySelectorAll('footer, .dynamic-footer');
    if (!footers.length) return;

    const currentYear = new Date().getFullYear();
    const settings = window.siteSettings || {};
    const siteName = settings.site_name || 'Metin2 Web';
    const footerText = settings.footer_text || 'Alle Rechte vorbehalten.';
    const discordUrl = settings.discord_url || '';

    const footerHtml = `
        <div class="container" style="text-align: center; padding: 2rem 1rem;">
            <p>&copy; ${currentYear} <span class="site-name-footer">${siteName}</span>. ${footerText}</p>
            <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;">
                <a href="/page?slug=agb" style="color: var(--text-muted); text-decoration: none;">AGB</a>
                <a href="/page?slug=datenschutz" style="color: var(--text-muted); text-decoration: none;">Datenschutz</a>
                <a href="/page?slug=impressum" style="color: var(--text-muted); text-decoration: none;">Impressum</a>
                <a href="/page?slug=bann-richtlinien" style="color: var(--text-muted); text-decoration: none;">Bann-Richtlinien</a>
                <a href="/page?slug=serverregeln" style="color: var(--text-muted); text-decoration: none;">Serverregeln</a>
                ${discordUrl ? `<a href="${discordUrl}" target="_blank" style="color: #5865F2; text-decoration: none;"><i class="fab fa-discord"></i> Discord</a>` : ''}
            </div>
        </div>
    `;

    footers.forEach(footer => {
        footer.innerHTML = footerHtml;
        footer.style.borderTop = '1px solid var(--glass-border)';
        footer.style.marginTop = '4rem';
        footer.style.color = 'var(--text-muted)';
    });
}

// Initial render
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooter);
} else {
    renderFooter();
}

// Listen for settings loaded event (dispatched by navbar.js or main.js)
document.addEventListener('settingsLoaded', renderFooter);
