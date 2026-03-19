// --- Custom Modal System ---
window.getGlobalModalContainer = function () {
    let container = document.getElementById('globalModalContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'globalModalContainer';
        container.className = 'modal-overlay';

        container.innerHTML = `
            <div class="glass-panel" style="width: 400px; max-width: 95%; text-align: center; animation: modalFadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); padding: 3rem 2rem;">
                <h2 id="globalModalTitle" style="margin-bottom: 1.5rem; color: var(--primary); font-weight:800; font-size:1.8rem;">System</h2>
                <div id="globalModalMessage" style="margin-bottom: 2.5rem; color: var(--text-main); font-size: 1.15rem; line-height:1.6;"></div>
                <div id="globalModalActions" style="display: flex; gap: 1rem; justify-content: center;"></div>
            </div>
            <style>
                .modal-overlay {
                    display: none; 
                    position: fixed; 
                    top: 0; left: 0; 
                    width: 100%; height: 100%; 
                    z-index: 10000; 
                    background: rgba(0,0,0,0.85); 
                    backdrop-filter: blur(8px); 
                    align-items: center; 
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                body.light-mode .modal-overlay {
                    background: rgba(255,255,255,0.7);
                }
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(-30px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            </style>
        `;
        document.body.appendChild(container);
    }
    return container;
}

window.customAlert = function (message, title = 'Hinweis') {
    const container = window.getGlobalModalContainer();
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
    const container = window.getGlobalModalContainer();
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

    container.querySelector('#globalModalConfirmBtn').onclick = () => {
        container.style.display = 'none';
        window.removeEventListener('keydown', handleModalKeys);
        if (typeof onConfirm === 'function') onConfirm();
    };

    container.querySelector('#globalModalCancelBtn').onclick = () => {
        container.style.display = 'none';
        window.removeEventListener('keydown', handleModalKeys);
    };

    const handleModalKeys = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            container.querySelector('#globalModalConfirmBtn').click();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            container.querySelector('#globalModalCancelBtn').click();
        }
    };

    window.addEventListener('keydown', handleModalKeys);
};

// Add Enter listener for customAlert as well
const originalAlert = window.customAlert;
window.customAlert = function (message, title) {
    originalAlert(message, title);
    const container = window.getGlobalModalContainer();
    const handleAlertKeys = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            document.getElementById('globalModalOkBtn').click();
            window.removeEventListener('keydown', handleAlertKeys);
        }
    };
    window.addEventListener('keydown', handleAlertKeys);
};

window.customPrompt = function (message, title = 'Eingabe', placeholder = '') {
    return new Promise((resolve) => {
        const container = window.getGlobalModalContainer();
        document.getElementById('globalModalTitle').innerHTML = title;
        document.getElementById('globalModalMessage').innerHTML = message + `<br><input type="text" id="globalPromptInput" placeholder="${placeholder}" style="width: 100%; padding: 0.8rem; margin-top: 1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; outline: none;">`;

        document.getElementById('globalModalActions').innerHTML = `
            <button class="btn secondary-btn" id="globalModalCancelBtn" style="min-width: 120px;">Abbrechen</button>
            <button class="btn primary-btn" id="globalModalConfirmBtn" style="min-width: 120px;">OK</button>
        `;

        container.style.display = 'flex';

        const inputNode = document.getElementById('globalPromptInput');
        if (inputNode) setTimeout(() => inputNode.focus(), 50);

        document.getElementById('globalModalCancelBtn').onclick = () => {
            container.style.display = 'none';
            window.removeEventListener('keydown', handlePromptKeys);
            resolve(null);
        };

        container.querySelector('#globalModalConfirmBtn').onclick = () => {
            container.style.display = 'none';
            window.removeEventListener('keydown', handlePromptKeys);
            resolve(inputNode.value);
        };

        const handlePromptKeys = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                container.querySelector('#globalModalConfirmBtn').click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                container.querySelector('#globalModalCancelBtn').click();
            }
        };

        window.addEventListener('keydown', handlePromptKeys);
    });
};
