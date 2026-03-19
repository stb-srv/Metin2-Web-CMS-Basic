// --- Global Modal System ---
function getGlobalModalContainer() {
    let container = document.getElementById('globalModalContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'globalModalContainer';
        container.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); align-items: center; justify-content: center;';

        container.innerHTML = `
            <div class="glass-panel" style="width: 400px; max-width: 90%; text-align: center; animation: modalFadeIn 0.3s ease;">
                <h2 id="globalModalTitle" style="margin-bottom: 1rem; color: var(--primary);">System</h2>
                <p id="globalModalMessage" style="margin-bottom: 2rem; color: var(--text-main); font-size: 1.1rem;"></p>
                <div id="globalModalActions" style="display: flex; gap: 1rem; justify-content: center;"></div>
            </div>
        `;
        document.body.appendChild(container);

        if (!document.getElementById('modalKeyframes')) {
            const style = document.createElement('style');
            style.id = 'modalKeyframes';
            style.innerHTML = `
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    return container;
}

window.customAlert = function (message, title = 'Hinweis') {
    const container = getGlobalModalContainer();
    document.getElementById('globalModalTitle').innerHTML = title;
    document.getElementById('globalModalMessage').innerHTML = message;

    document.getElementById('globalModalActions').innerHTML = `
        <button class="btn primary-btn" id="globalModalOkBtn" style="min-width: 120px;">OK</button>
    `;

    container.style.display = 'flex';

    document.getElementById('globalModalOkBtn').onclick = () => {
        container.style.display = 'none';
    };
};

window.customConfirm = function (message, onConfirm, title = 'Bestätigung') {
    const container = getGlobalModalContainer();
    document.getElementById('globalModalTitle').innerHTML = title;
    document.getElementById('globalModalMessage').innerHTML = message;

    document.getElementById('globalModalActions').innerHTML = `
        <button class="btn secondary-btn" id="globalModalCancelBtn" style="min-width: 120px;">Abbrechen</button>
        <button class="btn primary-btn" id="globalModalConfirmBtn" style="min-width: 120px; background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); color: #ef4444;">Bestätigen</button>
    `;

    container.style.display = 'flex';

    document.getElementById('globalModalCancelBtn').onclick = () => {
        container.style.display = 'none';
    };

    document.getElementById('globalModalConfirmBtn').onclick = () => {
        container.style.display = 'none';
        if (typeof onConfirm === 'function') onConfirm();
    };
};
