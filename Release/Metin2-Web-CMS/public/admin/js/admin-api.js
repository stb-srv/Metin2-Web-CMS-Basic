/**
 * Admin API Helper
 * Zentrale Stelle für Auth-Headers und API-Calls.
 */
const API = '/api';

function getUser() {
    try { return JSON.parse(localStorage.getItem('m2user')); } catch { return null; }
}

function getToken() {
    return localStorage.getItem('m2token') || '';
}

// Stabile Auth-Header Funktion
function getAuthHeaders(extra = {}) {
    const user = getUser();
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        'x-account-id': user ? user.id : '',
        ...extra
    };
    // Behandle 'null' String robust
    if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Konsolidierte apiFetch
window.apiFetch = async function(endpoint, options = {}) {
    const apiPrefix = '/api';
    const url = endpoint.startsWith('http') ? endpoint : (endpoint.startsWith('/') ? `${apiPrefix}${endpoint}` : `${apiPrefix}/${endpoint}`);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: getAuthHeaders(options.headers || {})
        });

        // 401/403 Handling: Only redirect if we are sure it's an Auth failure on a protected route
        if ((response.status === 401 || response.status === 403) && !endpoint.includes('/core/check')) {
            console.warn('[AdminAPI] Auth failed, redirecting to home.');
            window.location.href = '/';
            return { success: false, message: 'Nicht autorisiert' };
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await response.text();
            console.error('[AdminAPI] Non-JSON response:', text.substring(0, 100));
            return { success: false, message: 'Serverfehler (Kein JSON)' };
        }

        return await response.json();
    } catch (err) {
        console.error('[AdminAPI] Connect Error:', err);
        return { success: false, message: 'Netzwerkfehler' };
    }
};

async function apiPost(endpoint, body) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    });
}
window.apiPost = apiPost;

async function apiPut(endpoint, body) {
    return apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
}
window.apiPut = apiPut;

async function apiDelete(endpoint) {
    return apiFetch(endpoint, { method: 'DELETE' });
}
window.apiDelete = apiDelete;

function logout() {
    localStorage.removeItem('m2token');
    localStorage.removeItem('m2user');
    window.location.href = '/';
}
window.logout = logout;

window.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
