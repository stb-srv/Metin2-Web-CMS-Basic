/**
 * Admin Modal System
 * Provides integrated confirmation, alert and custom content dialogs.
 */

window.customConfirm = function (message, onConfirm, title = 'Bestätigung') {
    const overlay = document.createElement('div');
    overlay.className = 'admin-modal-overlay';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="admin-modal" style="width: 400px; text-align: center;">
            <div class="admin-modal-header">
                <div class="admin-modal-title"><i class="fas fa-exclamation-triangle"></i> ${title}</div>
                <button class="admin-modal-close" id="confirmClose"><i class="fas fa-times"></i></button>
            </div>
            <div style="margin-bottom: 2rem; color: var(--text-main); font-size: 1rem; line-height: 1.5;">${message}</div>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="btn-admin btn-secondary" id="confirmCancel" style="flex:1;">Abbrechen</button>
                <button class="btn-admin btn-primary" id="confirmOk" style="flex:1; background: #ef4444; border-color: #dc2626; color: white;">Bestätigen</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => overlay.remove(), 200);
    };

    overlay.querySelector('#confirmCancel').onclick = close;
    overlay.querySelector('#confirmClose').onclick = close;
    overlay.querySelector('#confirmOk').onclick = () => {
        close();
        if (typeof onConfirm === 'function') onConfirm();
    };

    overlay.onclick = (e) => { if (e.target === overlay) close(); };
};

window.customAlert = function (message, title = 'Hinweis') {
    const overlay = document.createElement('div');
    overlay.className = 'admin-modal-overlay';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="admin-modal" style="width: 400px; text-align: center;">
            <div class="admin-modal-header">
                <div class="admin-modal-title"><i class="fas fa-info-circle"></i> ${title}</div>
                <button class="admin-modal-close" id="alertClose"><i class="fas fa-times"></i></button>
            </div>
            <div style="margin-bottom: 2rem; color: var(--text-main); font-size: 1rem; line-height: 1.5;">${message}</div>
            <div style="display: flex; justify-content: center;">
                <button class="btn-admin btn-primary" id="alertOk" style="min-width: 120px;">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => overlay.remove(), 200);
    };

    overlay.querySelector('#alertOk').onclick = close;
    overlay.querySelector('#alertClose').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
};

/**
 * Generic Modal for custom forms
 */
window.showModal = function(title, html, onSave) {
    const overlay = document.createElement('div');
    overlay.className = 'admin-modal-overlay';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="admin-modal" style="width: 500px;">
            <div class="admin-modal-header">
                <div class="admin-modal-title">${title}</div>
                <button class="admin-modal-close" id="modalClose"><i class="fas fa-times"></i></button>
            </div>
            <div class="admin-modal-body" style="padding: 1.5rem 0;">
                ${html}
            </div>
            <div class="admin-modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
                <button class="btn-admin btn-secondary" id="modalCancel">Abbrechen</button>
                <button class="btn-admin btn-primary" id="modalSave">Speichern</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => overlay.remove(), 200);
    };

    overlay.querySelector('#modalCancel').onclick = close;
    overlay.querySelector('#modalClose').onclick = close;
    overlay.querySelector('#modalSave').onclick = async () => {
        if (typeof onSave === 'function') {
            const success = await onSave();
            if (success) close();
        } else {
            close();
        }
    };
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
};
