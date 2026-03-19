// API Base URL
window.API_URL = '/api';
const API_URL = window.API_URL;

// Safe JSON Parse helper
window.safeJSONParse = function (str, fallback = null) {
    try {
        return JSON.parse(str) || fallback;
    } catch (e) {
        console.error('JSON Parse Error:', e);
        return fallback;
    }
}

// Auth helper - handles legacy user info if needed
window.getAuthHeaders = function (extra) {
    const user = safeJSONParse(localStorage.getItem('m2user'));
    return Object.assign({
        'Content-Type': 'application/json',
        ...(user ? { 'x-account-id': user.id } : {})
    }, extra || {});
}

window.getAuthHeadersSimple = function (extra) {
    const user = safeJSONParse(localStorage.getItem('m2user'));
    return Object.assign({
        ...(user ? { 'x-account-id': user.id } : {})
    }, extra || {});
}

window.logout = async function () {
    try {
        // Try server-side logout to clear HttpOnly cookie
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch (e) {
        console.error('Logout API failed:', e);
    }
    
    localStorage.removeItem('m2user');
    localStorage.removeItem('m2token'); // Still removing if somehow set manually
    
    // Fallback: Clear cookie via JS (only works if NOT httponly, but good practice for other cookies)
    document.cookie = "m2token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
    window.location.href = '/';
}

// --- Centralized API Fetcher ---
window.apiFetch = async function (endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    // Set default headers
    const headers = window.getAuthHeaders(options.headers || {});

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);

        // Auto-logout on 401 Unauthorized
        if (response.status === 401) {
            console.warn('Session expired or unauthorized. Logging out.');
            window.logout();
            return { success: false, message: 'Sitzung abgelaufen. Bitte erneut einloggen.' };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Fetch Error (${endpoint}):`, error);
        return { success: false, message: 'Netzwerkfehler. Bitte versuche es später erneut.' };
    }
}
