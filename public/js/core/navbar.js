
/**
 * Navbar Template System
 * Ensures consistent navigation across all pages.
 */


let _navbarBaseRendered = false;

function renderNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Only render base structure once unless we need a full refresh
    if (!_navbarBaseRendered) {
        renderNavbarBase(navbar);
        _navbarBaseRendered = true;
        setupNavbarListeners();
    }

    // Refresh dynamic parts
    renderNavbarLinks();
    renderNavbarAuth();
}

/**
 * Renders the static parts of the navbar
 */
function renderNavbarBase(navbar) {
    navbar.innerHTML = `
            <div class="nav-brand">
                <a href="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 12px;">
                    <img id="navLogoImg" src="" style="max-height: 70px; width: auto; display: none; object-fit: contain; background: transparent !important;" onerror="this.style.display='none'">
                    <i class="fas fa-dragon" id="navLogoIcon" style="font-size: 1.8rem;"></i> 
                    <span id="siteNameDisplay" style="font-weight: 800; font-size: 1.4rem;">Metin2 Web</span>
                </a>
            </div>
            <div class="nav-links" id="mainNavLinks">
                <div style="padding: 0 1rem; color: rgba(255,255,255,0.3); font-size: 0.8rem;"><i class="fas fa-spinner fa-spin"></i></div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="nav-dropdown language-selector">
                    <a href="#" style="padding: 10px; display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit;">
                        <img src="${window.getFlag ? window.getFlag(window.i18n ? window.i18n.currentLang : 'en') : 'https://flagcdn.com/w20/us.png'}" style="width: 20px; height: auto; border-radius: 2px;">
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">${(window.i18n ? window.i18n.currentLang : 'en').toUpperCase()}</span>
                    </a>
                    <div class="nav-dropdown-content" style="min-width: 100px;">
                        <a href="javascript:void(0)" onclick="i18n.setLanguage('de')" style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w20/de.png" style="width: 18px; height: auto; border-radius: 1px;"> DE
                        </a>
                        <a href="javascript:void(0)" onclick="i18n.setLanguage('en')" style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w20/us.png" style="width: 18px; height: auto; border-radius: 1px;"> EN
                        </a>
                        <a href="javascript:void(0)" onclick="i18n.setLanguage('it')" style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w20/it.png" style="width: 18px; height: auto; border-radius: 1px;"> IT
                        </a>
                        <a href="javascript:void(0)" onclick="i18n.setLanguage('es')" style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w20/es.png" style="width: 18px; height: auto; border-radius: 1px;"> SP
                        </a>
                        <a href="javascript:void(0)" onclick="i18n.setLanguage('pl')" style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w20/pl.png" style="width: 18px; height: auto; border-radius: 1px;"> PL
                        </a>
                        <a href="javascript:void(0)" onclick="i18n.setLanguage('ro')" style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w20/ro.png" style="width: 18px; height: auto; border-radius: 1px;"> RO
                        </a>
                        <a href="javascript:void(0)" onclick="i18n.setLanguage('tr')" style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w20/tr.png" style="width: 18px; height: auto; border-radius: 1px;"> TR
                        </a>
                        <a href="javascript:void(0)" onclick="i18n.setLanguage('pt')" style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w20/pt.png" style="width: 18px; height: auto; border-radius: 1px;"> PT
                        </a>
                    </div>
                </div>
                <div class="nav-auth" id="navAuth"></div>
                <!-- Hamburger for mobile -->
                <button class="nav-hamburger" id="navHamburger" onclick="toggleMobileNav()" aria-label="Menü öffnen">
                    <i class="fas fa-bars" id="hamburgerIcon"></i>
                </button>
            </div>
        `;

    // Theme.js now handles Logo/SiteName via settingsLoaded event
}

function setupNavbarListeners() {
    // Mobile nav toggle function
    window.toggleMobileNav = function() {
        const navLinks = document.getElementById('mainNavLinks');
        const icon = document.getElementById('hamburgerIcon');
        if (!navLinks) return;
        const isOpen = navLinks.classList.toggle('nav-open');
        if (icon) {
            icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        }
    };

    // Use a single listener for document-wide clicks
    document.addEventListener('click', (e) => {
        const navLinks = document.getElementById('mainNavLinks');
        const hamburger = document.getElementById('navHamburger');
        
        // Handle outside click to close
        if (navLinks && hamburger && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            navLinks.classList.remove('nav-open');
            const icon = document.getElementById('hamburgerIcon');
            if (icon) icon.className = 'fas fa-bars';
        }
        
        // Handle nav link click to close (on mobile)
        if (e.target.closest('#mainNavLinks a')) {
            if (navLinks) navLinks.classList.remove('nav-open');
            const icon = document.getElementById('hamburgerIcon');
            if (icon) icon.className = 'fas fa-bars';
        }
    }, { passive: true });
}

let isNavbarRendering = false;
let navbarRetryTimeout = null;

async function renderNavbarLinks() {
    const linkContainer = document.getElementById('mainNavLinks');
    if (!linkContainer) return;

    if (isNavbarRendering) return;
    isNavbarRendering = true;

    // Clear any pending retry
    if (navbarRetryTimeout) {
        clearTimeout(navbarRetryTimeout);
        navbarRetryTimeout = null;
    }

    // WAIT for i18n to be ready before rendering links
    if (!window.i18n || !window.i18n.isReady) {
        console.log('[Navbar] Waiting for i18n to render links...');
        isNavbarRendering = false;
        
        // Safety: If it takes too long, try rendering anyway
        navbarRetryTimeout = setTimeout(() => {
            if (linkContainer && linkContainer.innerHTML.includes('fa-spin')) {
                console.warn('[Navbar] i18n timeout, attempting forced render...');
                renderNavbarLinks();
            }
        }, 3000);

        // Remove old listener to avoid buildup
        document.removeEventListener('languageChanged', renderNavbarLinks);
        document.addEventListener('languageChanged', renderNavbarLinks, { once: true });
        return;
    }

    try {
        const res = await fetch('/api/cms/navbar');
        const data = await res.json();
        isNavbarRendering = false;
        
        if (data.success) {
            const parents = data.links.filter(l => !l.parent_id && l.is_active);
            linkContainer.innerHTML = parents.map(parent => {
                const title = window.i18n.t(parent.title_key, parent.title_key);
                const children = data.links.filter(l => l.parent_id === parent.id && l.is_active);
                
                if (children.length > 0) {
                    const pUrl = parent.url.startsWith('http') || parent.url.startsWith('/') ? parent.url : '/' + parent.url;
                    return `
                    <div class="nav-dropdown">
                        <a href="${pUrl}" style="cursor: default;"><i class="${parent.icon}"></i> ${title}</a>
                        <div class="nav-dropdown-content">
                            ${children.map(child => {
                                const cTitle = window.i18n.t(child.title_key, child.title_key);
                                const cUrl = child.url.startsWith('http') || child.url.startsWith('/') ? child.url : '/' + child.url;
                                return `<a href="${cUrl}"><i class="${child.icon}"></i> ${cTitle}</a>`;
                            }).join('')}
                        </div>
                    </div>`;
                }
                const url = parent.url.startsWith('http') || parent.url.startsWith('/') ? parent.url : '/' + parent.url;
                return `<a href="${url}"><i class="${parent.icon}"></i> ${title}</a>`;
            }).join('');
        }
    } catch (err) {
        console.error('[Navbar] Error fetching links:', err);
    }
}

async function renderNavbarAuth() {
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;

    const user = window.safeJSONParse(localStorage.getItem('m2user'));

    if (user) {
        // Wait for i18n if needed for auth buttons
        if (!window.i18n || !window.i18n.isReady) {
            document.addEventListener('languageChanged', () => renderNavbarAuth(), { once: true });
            return;
        }

        const parseBal = (val) => {
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
        };
        const coins = parseBal(user.coins).toLocaleString('de-DE');
        const cash = parseBal(user.cash).toLocaleString('de-DE');

        try {
            const adminData = await apiFetch(`/admin/core/check?account_id=${user.id}`);
            const isAdmin = adminData.isAdmin;
            const settings = window.siteSettings || {};
            const getPos = (key) => settings[`nav_${key}_pos`] || 'navbar';

            let authHtml = `<span id="navBalances" style="margin-right:1rem; display:inline-flex; flex-direction:column; gap:2px; color: var(--text-main); font-size: 0.8rem; line-height:1.2;">`;
            authHtml += `<span style="display:inline-flex; align-items:center; gap:4px;" title="Drachenmünzen"><i class="fas fa-coins" style="color: #ffd700; font-size:0.75rem;"></i> <span id="navDR">${coins}</span> <span style="color:rgba(255,255,255,0.4); font-size:0.7rem;">DR</span></span>`;
            authHtml += `<span style="display:inline-flex; align-items:center; gap:4px;" title="Drachenmarken"><i class="fas fa-coins" style="color: #9ca3af; font-size:0.75rem;"></i> <span id="navDM">${cash}</span> <span style="color:rgba(255,255,255,0.4); font-size:0.7rem;">DM</span></span>`;
            authHtml += `</span>`;

            if (getPos('vote') === 'navbar') {
                authHtml += `<span style="margin-right:1rem; color: var(--text-main);"><a href="/vote" style="color: inherit; text-decoration: none;"><i class="fas fa-thumbs-up" style="color: var(--primary);"></i> Vote4Coins</a></span>`;
            }
            if (getPos('stash') === 'navbar' && settings.module_stash === 'true') {
                authHtml += `<span style="margin-right:1rem; color: var(--text-main);"><a href="/stash.html" style="color: inherit; text-decoration: none;"><i class="fas fa-box-open" style="color: var(--primary);"></i> ${i18n.t('navbar.web_store', 'Web-Lager')}</a></span>`;
            }
 
            authHtml += `
            <div class="nav-dropdown">
                <a href="/account" style="margin-right:0.5rem; color: var(--text-main); text-decoration: none;">
                    <i class="fas fa-user" style="color: var(--primary);"></i> ${user.username || user.login || 'Account'} <i class="fas fa-chevron-down" style="font-size:0.7rem; opacity:0.5; margin-left:4px;"></i>
                </a>
                <div class="nav-dropdown-content" style="right: 0; left: auto; min-width: 180px;">
                    <a href="/account"><i class="fas fa-cog"></i> ${window.i18n.t('navbar.account', 'Account')}</a>
                    <a href="/buy-coins.html"><i class="fas fa-coins"></i> ${window.i18n.t('navbar.buy_coins', 'Coins kaufen')}</a>
                    ${getPos('vote') === 'account' ? `<a href="/vote"><i class="fas fa-thumbs-up"></i> Vote4Coins</a>` : ''}
                    ${(getPos('stash') === 'account' && settings.module_stash === 'true') ? `<a href="/stash.html"><i class="fas fa-box-open"></i> ${window.i18n.t('navbar.web_store', 'Web-Lager')}</a>` : ''}
                    <div style="height:1px; background: rgba(255,255,255,0.05); margin: 5px 0;"></div>
                    ${isAdmin ? `<a href="/admin/" style="color: #ef4444;"><i class="fas fa-shield-alt"></i> <span>${window.i18n.t('navbar.admin_panel', 'Admin Panel')}</span></a>` : ''}
                    <a href="javascript:void(0)" onclick="logout()"><i class="fas fa-sign-out-alt"></i> <span>${window.i18n.t('navbar.logout', 'Logout')}</span></a>
                </div>
            </div>`;

            navAuth.innerHTML = authHtml;
        } catch (e) {
            console.error('[Navbar] Auth render error:', e);
        }
    } else {
        navAuth.innerHTML = `<button onclick="window.location.href = '/'" class="auth-btn">${window.i18n && window.i18n.isReady ? window.i18n.t('navbar.login', 'Einloggen') : 'Einloggen'}</button>`;
    }
}


// Helper to update balances dynamically
window.updateNavBalance = function (user) {
    if (!user) return;
    const drEl = document.getElementById('navDR');
    const dmEl = document.getElementById('navDM');
    if (drEl) drEl.innerText = (user.coins || 0).toLocaleString('de-DE');
    if (dmEl) dmEl.innerText = (user.cash || 0).toLocaleString('de-DE');
};

// Auto-run if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderNavbar();
    });
} else {
    renderNavbar();
}

// Re-render navbar whenever language changes
document.addEventListener('languageChanged', () => {
    console.log('[Navbar] Language change detected, re-rendering...');
    renderNavbar();
});

// Helper for language flags (returns URL to flag image)
window.getFlag = function(lang) {
    const flags = { 
        de: 'de', 
        en: 'us', 
        it: 'it', 
        es: 'es', 
        pl: 'pl', 
        ro: 'ro', 
        tr: 'tr', 
        pt: 'pt' 
    };
    const code = flags[lang] || 'us';
    return `https://flagcdn.com/w20/${code}.png`;
};
