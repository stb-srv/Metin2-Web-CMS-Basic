/**
 * Admin Sidebar Component
 * Renders the sidebar navigation based on user permissions.
 */

const SIDEBAR_SECTIONS = [
    {
        title: 'Übersicht',
        items: [
            { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', page: 'dashboard' }
        ]
    },
    {
        title: 'Content',
        permission: 'can_manage_shop',
        items: [
            { id: 'cms-news', icon: 'fa-newspaper', label: 'Neuigkeiten', page: 'cms-news' },
            { id: 'cms-pages', icon: 'fa-file-alt', label: 'Seiten-Manager', page: 'cms-pages' },
            { id: 'cms-navbar', icon: 'fa-bars', label: 'Navigation', page: 'cms-navbar' },
            { id: 'cms-downloads', icon: 'fa-download', label: 'Downloads', page: 'cms-downloads' },
            { id: 'cms-media', icon: 'fa-images', label: 'Medienbibliothek', page: 'cms-media' }
        ]
    },
    {
        title: 'Spieler & Team',
        permission: 'can_manage_players',
        items: [
            { id: 'players', icon: 'fa-users', label: 'Spieler & Bans', page: 'players' },
            { id: 'team', icon: 'fa-user-shield', label: 'Team-Manager', page: 'team' },
            { id: 'admin-roles', icon: 'fa-key', label: 'Admin-Rollen', page: 'admin-roles' }
        ]
    },
    {
        title: 'Shop & Ökonomie',
        permission: 'can_manage_shop',
        items: [
            { id: 'web-shop', icon: 'fa-store', label: 'Web-Shop', page: 'web-shop' },
            { id: 'ingame-shops', icon: 'fa-gamepad', label: 'Ingame Shops', page: 'ingame-shops' },
            { id: 'shop-coins', icon: 'fa-coins', label: 'Coins & Aktionen', page: 'shop-coins' },
            { id: 'item-creator', icon: 'fa-wand-magic-sparkles', label: 'Items erstellen', page: 'item-creator' },
            { id: 'gifts', icon: 'fa-gift', label: 'Geschenke & Währung', page: 'gifts' },
            { id: 'votes', icon: 'fa-thumbs-up', label: 'Vote4Coins', page: 'votes' }
        ]
    },
    {
        title: 'System & Setup',
        permission: 'can_manage_team',
        items: [
            { id: 'cms-settings', icon: 'fa-cog', label: 'CMS Einstellungen', page: 'cms-settings' },
            { id: 'cms-smtp', icon: 'fa-envelope', label: 'SMTP & E-Mail', page: 'cms-smtp' },
            { id: 'themes', icon: 'fa-paint-brush', label: 'Theme Presets', page: 'themes' },
            { id: 'i18n-editor', icon: 'fa-language', label: 'Sprachen', page: 'i18n-editor' },
            { id: 'logs', icon: 'fa-clipboard-list', label: 'Audit Logs', page: 'logs' },
            { id: 'icon-converter', icon: 'fa-image', label: 'Icon Konverter', page: 'icon-converter' }
        ]
    }
];

function renderSidebar(permissions) {
    const sidebar = document.getElementById('adminSidebar');
    if (!sidebar) return;

    let html = `
        <a href="/" class="sidebar-brand">
            <div class="sidebar-brand-icon" id="adminSidebarBrandIcon"><i class="fas fa-dragon"></i></div>
            <img src="" alt="Logo" id="adminSidebarBrandImg" class="sidebar-brand-img" style="display: none;">
            <div>
                <div class="sidebar-brand-text" id="adminSidebarBrandText">Metin2 Web</div>
                <span class="sidebar-brand-sub">Admin Panel</span>
            </div>
        </a>
        <nav class="sidebar-nav">
    `;

    for (const section of SIDEBAR_SECTIONS) {
        // Check permission
        if (section.permission && !permissions[section.permission]) continue;

        html += `<div class="sidebar-section">`;
        html += `<div class="sidebar-section-title">${section.title}</div>`;

        for (const item of section.items) {
            html += `
                <button class="sidebar-link" data-page="${item.page}" id="nav-${item.id}">
                    <i class="fas ${item.icon}"></i>
                    ${item.label}
                </button>
            `;
        }

        html += `</div>`;
    }

    html += `</nav>`;

    html += `
        <div class="sidebar-footer">
            <button class="sidebar-footer-link" onclick="window.location.href = '/'">
                <i class="fas fa-arrow-left"></i> Zur Website
            </button>
            <button class="sidebar-footer-link" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;

    sidebar.innerHTML = html;

    // Add Event Listeners (CSP-compliant)
    sidebar.querySelectorAll('.sidebar-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            if (page && typeof navigateTo === 'function') {
                navigateTo(page);
            }
        });
    });

    // Sidebar footer links
    const footerBtns = sidebar.querySelectorAll('.sidebar-footer-link');
    if (footerBtns[0]) footerBtns[0].addEventListener('click', () => window.location.href = '/');
    if (footerBtns[1]) footerBtns[1].addEventListener('click', () => typeof logout === 'function' && logout());
}

function setActiveSidebarItem(page) {
    document.querySelectorAll('.sidebar-link').forEach(el => {
        el.classList.remove('active');
    });
    const active = document.querySelector(`.sidebar-link[data-page="${page}"]`);
    if (active) active.classList.add('active');
}

function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) sidebar.classList.toggle('open');
}
