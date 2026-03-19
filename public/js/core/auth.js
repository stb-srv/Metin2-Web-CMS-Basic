// --- Authentication Flow ---

window.toggleAuth = function (type) {
    document.getElementById('loginForm').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = type === 'register' ? 'block' : 'none';
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) forgotForm.style.display = type === 'forgot' ? 'block' : 'none';
    
    if (document.getElementById('loginMsg')) document.getElementById('loginMsg').innerText = '';
    if (document.getElementById('regMsg')) document.getElementById('regMsg').innerText = '';
    if (document.getElementById('forgotMsg')) document.getElementById('forgotMsg').innerText = '';
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('loginUsername').value;
        const pass = document.getElementById('loginPassword').value;
        const msgDiv = document.getElementById('loginMsg');

        msgDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${window.i18n ? window.i18n.t('auth.msg_loading') : 'Lade...'}`;
        msgDiv.className = 'form-msg';

        try {
            const data = await window.apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username: user, password: pass })
            });

            if (data.success) {
                msgDiv.innerHTML = data.message;
                msgDiv.className = 'form-msg msg-success';
                
                localStorage.setItem('m2user', JSON.stringify(data.user));
                setTimeout(() => {
                    checkAuthState();
                }, 1000);
            } else {
                msgDiv.innerHTML = data.message;
                msgDiv.className = 'form-msg msg-error';
            }
        } catch (error) {
            msgDiv.innerHTML = window.i18n ? window.i18n.t('auth.msg_network_error') : 'Netzwerkfehler. Läuft der Server?';
            msgDiv.className = 'form-msg msg-error';
        }
    });
}

const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('forgotUsername').value;
        const email = document.getElementById('forgotEmail').value;
        const msgDiv = document.getElementById('forgotMsg');

        msgDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Senden...`;
        msgDiv.className = 'form-msg';

        try {
            const data = await window.apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ username: user, email })
            });

            if (data.success) {
                msgDiv.innerHTML = data.message;
                msgDiv.className = 'form-msg msg-success';
            } else {
                msgDiv.innerHTML = data.message;
                msgDiv.className = 'form-msg msg-error';
            }
        } catch (error) {
            msgDiv.innerHTML = 'Netzwerkfehler.';
            msgDiv.className = 'form-msg msg-error';
        }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('regUsername').value;
        const realName = document.getElementById('regRealName').value;
        const email = document.getElementById('regEmail').value;
        const emailConfirm = document.getElementById('regEmailConfirm').value;
        const pass = document.getElementById('regPassword').value;
        const passConfirm = document.getElementById('regPasswordConfirm').value;
        const socialId = document.getElementById('regSocialID').value;
        const question = document.getElementById('regQuestion').value;
        const answer = document.getElementById('regAnswer').value;
        const msgDiv = document.getElementById('regMsg');

        if (email !== emailConfirm) {
            msgDiv.innerHTML = 'Die E-Mail-Adressen stimmen nicht überein.';
            msgDiv.className = 'form-msg msg-error';
            return;
        }

        if (pass !== passConfirm) {
            msgDiv.innerHTML = 'Die Passwörter stimmen nicht überein.';
            msgDiv.className = 'form-msg msg-error';
            return;
        }

        if (!question) {
            msgDiv.innerHTML = 'Bitte wähle eine Sicherheitsfrage.';
            msgDiv.className = 'form-msg msg-error';
            return;
        }

        msgDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${window.i18n ? window.i18n.t('auth.msg_loading') : 'Lade...'}`;
        msgDiv.className = 'form-msg';

        try {
            const data = await window.apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ 
                    username: user, 
                    real_name: realName,
                    email: email, 
                    confirmEmail: emailConfirm,
                    password: pass, 
                    confirmPassword: passConfirm,
                    social_id: socialId, 
                    question1: parseInt(question),
                    answer1: answer
                })
            });

            if (data.success) {
                const suffix = window.i18n ? ` ${window.i18n.t('auth.msg_reg_success_suffix', 'Du kannst dich nun einloggen.')}` : ' Du kannst dich nun einloggen.';
                msgDiv.innerHTML = (data.message || 'Registrierung erfolgreich!') + suffix;
                msgDiv.className = 'form-msg msg-success';
                setTimeout(() => window.toggleAuth('login'), 2000);
            } else {
                msgDiv.innerHTML = data.message;
                msgDiv.className = 'form-msg msg-error';
            }
        } catch (error) {
            msgDiv.innerHTML = window.i18n ? window.i18n.t('auth.msg_network_error') : 'Netzwerkfehler.';
            msgDiv.className = 'form-msg msg-error';
        }
    });
}

window.checkAuthState = async function () {
    let user = window.safeJSONParse(localStorage.getItem('m2user'));
    let isAdmin = false;

    if (user && user.id) {
        try {
            const data = await window.apiFetch('/auth/me');
            if (data.success) {
                user.coins = data.coins;
                user.cash = data.cash;
                localStorage.setItem('m2user', JSON.stringify(user));
            }

            const adminData = await window.apiFetch(`/admin/core/check?account_id=${user.id}`);
            isAdmin = adminData.isAdmin;
            window.isAdminMode = isAdmin;

        } catch (e) {
            console.error("Konnte aktuelle Daten nicht abrufen", e);
        }
    }

    const authBox = document.getElementById('authBox');
    const navShopBtn = document.getElementById('navShopBtn');
    const profileAdminBtn = document.getElementById('profileAdminBtn');

    // Always re-render navbar on auth state check to ensure proper buttons/balances
    if (typeof renderNavbar === 'function') {
        renderNavbar();
    }

    if (user) {
        if (navShopBtn) navShopBtn.style.display = 'inline';
        if (profileAdminBtn) profileAdminBtn.style.display = isAdmin ? 'block' : 'none';

        if (authBox) {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('profileBox').style.display = 'block';

            document.getElementById('pUsername').innerText = user.username;
            document.getElementById('pCoins').innerText = (user.coins || 0).toLocaleString('de-DE');
            document.getElementById('pCash').innerText = (user.cash || 0).toLocaleString('de-DE');

            if (isAdmin && profileAdminBtn) {
                profileAdminBtn.style.display = 'flex';
                // Use safe i18n access
                const label = (window.i18n && window.i18n.isReady) ? window.i18n.t('navbar.admin_panel', 'Admin Panel') : 'Admin Panel';
                profileAdminBtn.innerHTML = `<i class="fas fa-shield-alt" style="margin-right:8px;"></i> ${label}`;
                profileAdminBtn.onclick = () => window.location.href = '/admin/';
            }
        }

        const shopCoins = document.getElementById('shopCoins');
        if (shopCoins) shopCoins.innerText = user.coins || 0;

    } else {
        if (navShopBtn) navShopBtn.style.display = 'none';
        if (profileAdminBtn) profileAdminBtn.style.display = 'none';

        if (authBox) {
            document.getElementById('profileBox').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        }
    }
}

let inactivityTimer;
const INACTIVITY_TIME = 5 * 60 * 1000;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    const user = localStorage.getItem('m2user');
    if (user) {
        inactivityTimer = setTimeout(() => {
            console.log('Benutzer inaktiv für 5 Minuten. Automatischer Logout...');
            window.logout();
        }, INACTIVITY_TIME);
    }
}

function setupInactivityListeners() {
    ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'].forEach(evt => {
        window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();
}
setupInactivityListeners();

window.checkAuthState();

window.addEventListener('storage', (e) => {
    if (e.key !== 'm2_balance_update' || !e.newValue) return;
    try {
        let user = window.safeJSONParse(localStorage.getItem('m2user'));
        const update = window.safeJSONParse(e.newValue);
        if (user && update) {
            if (update.coins !== undefined) user.coins = update.coins;
            if (update.cash !== undefined) user.cash = update.cash;
            localStorage.setItem('m2user', JSON.stringify(user));
            
            // Trigger navbar update if it exists
            if (typeof updateNavBalance === 'function') {
                updateNavBalance(user);
            } else if (typeof renderNavbar === 'function') {
                renderNavbar();
            }

            // Also update profile box if present
            const pCoins = document.getElementById('pCoins');
            const pCash = document.getElementById('pCash');
            if (pCoins) pCoins.innerText = (user.coins || 0).toLocaleString('de-DE');
            if (pCash) pCash.innerText = (user.cash || 0).toLocaleString('de-DE');
        }
    } catch (err) { }
});

function updateNavBalance(user) {
    const drEl = document.getElementById('navDR');
    const dmEl = document.getElementById('navDM');
    if (drEl) drEl.innerText = (user.coins || 0).toLocaleString('de-DE');
    if (dmEl) dmEl.innerText = (user.cash || 0).toLocaleString('de-DE');
}
