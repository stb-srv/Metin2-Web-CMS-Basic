// Admin Panel Core Initialization & Tab Management

const API_URL = '/api';

function getAuthHeaders() {
    const user = safeJSONParse(localStorage.getItem('m2user'));
    return {
        'Content-Type': 'application/json',
        'x-account-id': user ? user.id : ''
    };
}

function safeJSONParse(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
}

async function initAdmin() {
    const user = safeJSONParse(localStorage.getItem('m2user'));
    if (!user) { window.location.href = '/'; return; }

    try {
        const res = await fetch(`${API_URL}/admin/core/check`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();

        if (!data.success || !data.isAdmin) {
            window.location.href = '/';
            return;
        }

        const perms = data.permissions;
        let firstTabId = '';

        // Conditional Tab Rendering based on permissions
        if (!perms.can_manage_shop) {
            document.getElementById('btn-tab-shop')?.remove();
            document.getElementById('tab-shop')?.remove();
            document.getElementById('btn-tab-cms')?.remove();
            document.getElementById('tab-cms')?.remove();
            document.getElementById('btn-tab-downloads')?.remove();
            document.getElementById('tab-downloads')?.remove();
        } else {
            firstTabId = 'tab-shop';
        }

        if (!perms.can_give_gifts) {
            document.getElementById('btn-tab-gifts')?.remove();
            document.getElementById('tab-gifts')?.remove();
        } else {
            firstTabId = firstTabId || 'tab-gifts';
        }

        if (!perms.can_manage_players) {
            document.getElementById('btn-tab-players')?.remove();
            document.getElementById('tab-players')?.remove();
        } else {
            firstTabId = firstTabId || 'tab-players';
        }

        if (!perms.can_manage_team) {
            document.getElementById('btn-tab-team')?.remove();
            document.getElementById('tab-team')?.remove();
        } else {
            firstTabId = firstTabId || 'tab-team';
        }

        if (firstTabId) {
            const savedTab = localStorage.getItem('activeAdminTab');
            if (savedTab && document.getElementById(savedTab)) {
                switchTab(savedTab);
            } else {
                switchTab(firstTabId);
            }
        }

        // Setup Drag & Drop
        if (typeof Sortable !== 'undefined') {
            const containers = document.querySelectorAll('.sortable-container');
            containers.forEach(el => {
                Sortable.create(el, {
                    handle: '.drag-handle',
                    animation: 200,
                    ghostClass: 'sortable-ghost',
                    dragClass: 'sortable-drag',
                    group: 'adminLayout_' + el.id,
                    store: {
                        get: (s) => (localStorage.getItem(s.options.group.name) || '').split('|'),
                        set: (s) => localStorage.setItem(s.options.group.name, s.toArray().join('|'))
                    }
                });
            });
        }

        // Initial Data Load
        if (perms.can_manage_shop) {
            if (typeof loadCategories === 'function') loadCategories();
            if (typeof loadAdminItems === 'function') loadAdminItems();
        }
        // Removed undefined loadAdminAccounts() that caused Crash
    } catch (err) {
        console.error('Admin Init Error:', err);
        window.location.href = '/';
    }
}

function switchTab(tabId) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));

    // Reset all buttons
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active');
        el.classList.remove('primary-btn');
        el.classList.add('secondary-btn');
    });

    const target = document.getElementById(tabId);
    if (!target) return;
    target.classList.add('active');

    const btn = document.getElementById('btn-' + tabId);
    if (btn) {
        btn.classList.add('active');
        btn.classList.add('primary-btn');
        btn.classList.remove('secondary-btn');
    }

    localStorage.setItem('activeAdminTab', tabId);

    // Module-specific initializations
    const runSafe = (fn) => { try { if (typeof fn === 'function') fn(); } catch (e) { console.error('Tab Module Error:', e); } };

    if (tabId === 'tab-players') runSafe(() => typeof loadBanHistory === 'function' && loadBanHistory());
    if (tabId === 'tab-team') runSafe(() => typeof loadPermissions === 'function' && loadPermissions());
    if (tabId === 'tab-downloads') runSafe(() => typeof loadDownloads === 'function' && loadDownloads());
    if (tabId === 'tab-ingame') runSafe(() => typeof loadIngameShops === 'function' && loadIngameShops());
    if (tabId === 'tab-cms') runSafe(() => typeof loadCmsSettings === 'function' && loadCmsSettings());
    if (tabId === 'tab-shop') runSafe(() => typeof loadCategories === 'function' && loadCategories());
    if (tabId === 'tab-shop') runSafe(() => typeof loadAdminItems === 'function' && loadAdminItems());
    if (tabId === 'tab-gifts') runSafe(() => typeof loadAdminAccounts === 'function' && loadAdminAccounts());
}

function toggleWidgetSize(btn) {
    const widget = btn.closest('.sortable-item');
    if (widget.style.flex === '1 1 100%') {
        widget.style.flex = '1 1 400px';
        btn.className = 'fas fa-expand-alt resize-handle';
    } else {
        widget.style.flex = '1 1 100%';
        btn.className = 'fas fa-compress-alt resize-handle';
    }
}

document.addEventListener('DOMContentLoaded', initAdmin);
