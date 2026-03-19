
// Internal helper to get page objects safely (avoids race conditions)
function getPage(id) {
    const map = {
        'dashboard': window.DashboardPage,
        'logs': window.LogsPage,
        'web-shop': window.WebShopPage,
        'shop-coins': window.ShopCoinsPage,
        'item-creator': window.ItemCreatorPage,
        'vouchers': window.VouchersPage,
        'gifts': window.GiftsPage,
        'ingame-shops': window.IngameShopsPage,
        'cms-settings': window.CmsSettingsPage,
        'cms-news': window.CmsNewsPage,
        'cms-pages': window.CmsPagesPage,
        'cms-downloads': window.CmsDownloadsPage,
        'cms-events': window.EventsPage,
        'cms-media': window.CmsMediaPage,
        'cms-navbar': window.CmsNavbarPage,
        'cms-smtp': window.CmsSmtpPage,
        'players': window.PlayersPage,
        'team': window.TeamPage,
        'icon-converter': window.IconConverterPage,
        'i18n-editor': window.I18nEditorPage,
        'themes': window.ThemesPage,
        'votes': window.VotesPage,
        'admin-roles': window.AdminRolesPage
    };
    return map[id] || window.DashboardPage;
}

let adminPermissions = {};
let currentRole = '';

async function initAdmin() {
    // 1. Initialize State (fetches settings, etc)
    if (window.CMS_STATE) await CMS_STATE.init();
    
    const user = CMS_STATE.get('user');
    if (!user) {
        window.location.href = '/';
        return;
    }

    try {
        const check = await window.apiFetch('/admin/core/check');
        if (!check || !check.isAdmin) {
            console.warn('[AdminCore] Not an admin, redirecting...');
            window.location.href = '/';
            return;
        }

        adminPermissions = check.permissions || {};
        currentRole = check.role || 'GOD';
        window.cmsSettings = CMS_STATE.get('settings');

        initRouter();
        if (typeof renderSidebar === 'function') {
            renderSidebar(adminPermissions);
        }
        if (window.applyThemeStyles) window.applyThemeStyles();
        applyAdminSettings(); // Local helper to update UI with settings
    } catch (err) {
        console.error('[AdminCore] Init failed explicitly:', err);
        // showToast('Admin-Initialisierung fehlgeschlagen. Bitte logge dich erneut ein.', 'error');
        // window.location.href = '/'; 
    }
}

function initRouter() {
    const handleRoute = () => {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const Page = getPage(hash);

        const content = document.getElementById('adminContent');
        if (content) {
            console.log('[AdminRouter] Loading:', hash);
            if (Page) {
                content.innerHTML = Page.render();
                if (Page.init) Page.init();
            } else {
                content.innerHTML = '<div style="padding: 2rem; text-align: center;">Seite nicht gefunden.</div>';
            }
        }

        // Active state in sidebar
        document.querySelectorAll('.sidebar-link').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-page') === hash);
        });
    };

    window.addEventListener('hashchange', handleRoute);
    
    // Global Event Delegation for Sidebar (CSP Bypass)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.sidebar-link');
        if (btn) {
            const page = btn.getAttribute('data-page');
            if (page) {
                e.preventDefault();
                window.navigateTo(page);
            }
        }
    });

    handleRoute();
}



function applyAdminSettings() {
    const settings = CMS_STATE.get('settings');
    const siteName = settings.site_name || 'Metin2 Web';
    document.title = siteName + ' | Admin';
    const sidebarName = document.getElementById('adminSidebarBrandText');
    if (sidebarName) sidebarName.textContent = siteName;

    // Update Topbar Username
    const user = CMS_STATE.get('user');
    const topUsername = document.getElementById('topbarUsername');
    if (topUsername && user) {
        topUsername.textContent = user.username || user.login || 'Admin';
    }
}

// Global navigate helper
window.navigateTo = function(page) {
    console.log('[AdminNavigate] To:', page);
    window.location.hash = page;
};

// Global Toast helper
window.showToast = function(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
};

document.addEventListener('DOMContentLoaded', initAdmin);
