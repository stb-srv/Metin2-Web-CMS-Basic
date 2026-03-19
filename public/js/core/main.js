// API and Auth routines extracted to api.js and auth.js

// Custom Modal System extracted to modal.js


const metin2Bonuses = [
    { id: 0, name: "Kein Bonus" },
    { id: 1, name: "Max TP" },
    { id: 2, name: "Max MP" },
    { id: 3, name: "VIT" },
    { id: 4, name: "INT" },
    { id: 5, name: "STR" },
    { id: 6, name: "DEX" },
    { id: 7, name: "Angriffsgeschwindigkeit" },
    { id: 8, name: "Bewegungsgeschwindigkeit" },
    { id: 9, name: "Zaubergeschwindigkeit" },
    { id: 10, name: "TP-Regeneration" },
    { id: 11, name: "MP-Regeneration" },
    { id: 12, name: "Vergiftungschance" },
    { id: 13, name: "Ohnmachtschance" },
    { id: 14, name: "Verlangsamungschance" },
    { id: 15, name: "Kritischer Treffer" },
    { id: 16, name: "Durchbohrender Treffer" },
    { id: 17, name: "Stark gegen Halbmenschen" },
    { id: 18, name: "Stark gegen Tiere" },
    { id: 19, name: "Stark gegen Orks" },
    { id: 20, name: "Stark gegen Esoterische" },
    { id: 21, name: "Stark gegen Untote" },
    { id: 22, name: "Stark gegen Teufel" },
    { id: 23, name: "Schaden wird von TP absorbiert" },
    { id: 24, name: "Schaden wird von MP absorbiert" },
    { id: 27, name: "Nahkampf-Angriff blocken" },
    { id: 28, name: "Pfeilangriff ausweichen" },
    { id: 29, name: "Schwertverteidigung" },
    { id: 30, name: "Zweihänderverteidigung" },
    { id: 31, name: "Dolchverteidigung" },
    { id: 32, name: "Glockenverteidigung" },
    { id: 33, name: "Fächerverteidigung" },
    { id: 34, name: "Pfeilwiderstand" },
    { id: 35, name: "Feuerwiderstand" },
    { id: 36, name: "Blitzwiderstand" },
    { id: 37, name: "Magiewiderstand" },
    { id: 38, name: "Windwiderstand" },
    { id: 39, name: "Nahkampf-Treffer reflektieren" },
    { id: 41, name: "Giftwiderstand" },
    { id: 43, name: "EXP-Bonus" },
    { id: 44, name: "Doppel-Yang Dropchance" },
    { id: 45, name: "Doppel-Item Dropchance" },
    { id: 48, name: "Immun gegen Ohnmacht" },
    { id: 53, name: "Angriffswert" },
    { id: 71, name: "Durchschnittsschaden (DSS)" },
    { id: 72, name: "Fertigkeitsschaden (FKS)" },
    { id: 73, name: "Widerstand gegen DSS" },
    { id: 74, name: "Widerstand gegen FKS" }
];

const metin2Stones = [
    { id: 0, name: "Leerer Sockel" },
    { id: 28430, name: "Stein des Durchschlags +4" },
    { id: 28431, name: "Stein des Todesstoßes +4" },
    { id: 28432, name: "Stein der Wiederkehr +4" },
    { id: 28433, name: "Stein der Krieger +4" },
    { id: 28434, name: "Stein der Ninja +4" },
    { id: 28435, name: "Stein der Sura +4" },
    { id: 28436, name: "Stein der Schamanen +4" },
    { id: 28437, name: "Stein gegen Monster +4" },
    { id: 28438, name: "Stein des Ausweichens +4" },
    { id: 28439, name: "Stein des Duckens +4" },
    { id: 28440, name: "Stein der Magie +4" },
    { id: 28441, name: "Stein der Vitalität +4" },
    { id: 28442, name: "Stein der Verteidigung +4" },
    { id: 28443, name: "Stein der Hast +4" }
];

// Initialize Particles.js if element exists and library is loaded
if (document.getElementById('particles-js') && typeof particlesJS !== 'undefined') {
    const initParticles = () => {
        try {
            const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
            const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            
            // Only init if we have valid-looking colors (or fall back to defaults)
            const accentColor = (accent && accent.length > 3) ? accent : "#ff4d4d";
            const primaryColor = (primary && primary.length > 3) ? primary : "#cc0000";

            particlesJS('particles-js', {
                particles: {
                    number: { value: 60, density: { enable: true, value_area: 800 } },
                    color: { value: accentColor },
                    shape: { type: "circle" },
                    opacity: { value: 0.3, random: true },
                    size: { value: 3, random: true },
                    line_linked: { enable: true, distance: 150, color: primaryColor, opacity: 0.2, width: 1 },
                    move: { enable: true, speed: 2, direction: "none", random: true, out_mode: "out" }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: true, mode: "grab" },
                        onclick: { enable: true, mode: "push" },
                        resize: true
                    },
                    modes: {
                        grab: { distance: 140, line_linked: { opacity: 0.5 } },
                        push: { particles_nb: 3 }
                    }
                },
                retina_detect: true
            });
        } catch (e) {
            console.warn('ParticlesJS initialization failed:', e);
        }
    };

    initParticles();

    // Re-init when theme changes
    document.addEventListener('themeUpdated', () => {
        // Short delay to ensure CSS variables are applied
        setTimeout(initParticles, 50);
    });
}

// --- Icon System ---
// The server scans public/images/items/ at startup and provides /api/icons/map
// which maps numeric VNUM → filename. We load this once and use it for all icon lookups.
let _iconMap = null; // Will be { "110": "00110.png", "8001": "08001.png", ... }
let _iconMapLoading = false;

async function loadIconMap() {
    if (_iconMap || _iconMapLoading) return;
    _iconMapLoading = true;
    try {
        const res = await fetch('/api/icons/map');
        _iconMap = await res.json();
        console.log(`[IconMap] Loaded ${Object.keys(_iconMap).length} icon entries.`);
    } catch (e) {
        console.warn('[IconMap] Failed to load icon map:', e);
        _iconMap = {};
    }
    _iconMapLoading = false;
}
// Auto-load on script init
loadIconMap();

function getItemIconPath(vnum) {
    if (!vnum || vnum <= 0) return '/images/default.png';

    const v = parseInt(vnum, 10);

    // 1. Check exact VNUM in the icon map
    if (_iconMap && _iconMap[v]) {
        return `/images/items/${_iconMap[v]}`;
    }

    // 2. Check base VNUM (strip refinement: +0 to +9)
    const baseVnum = Math.floor(v / 10) * 10;
    if (baseVnum !== v && _iconMap && _iconMap[baseVnum]) {
        return `/images/items/${_iconMap[baseVnum]}`;
    }

    // 3. Fallback: try padded VNUM (works if map isn't loaded yet)
    return `/images/items/${String(v).padStart(5, '0')}.png`;
}

// Authentication DOM handlers extracted to auth.js

window.metin2Bonuses = metin2Bonuses;
window.metin2Stones = metin2Stones;

// --- CMS Settings & State Integration ---
async function initializeWithState() {
    if (window.CMS_STATE) {
        await CMS_STATE.init();
        // Theme.js now handles the settings application
    }
}

// Auto-init
initializeWithState();

// --- Server Status ---
async function loadServerStatus() {
    const elStatus = document.getElementById('statStatus');
    const elPlayers = document.getElementById('statPlayers');
    const elAccounts = document.getElementById('statAccounts');

    if (!elStatus) return; // Only run on pages with the status widget

    try {
        const res = await fetch(`${window.API_URL || '/api'}/public/status`);
        const data = await res.json();
        
        if (data.success) {
            const { online, players_active_24h, accounts } = data.status;
            
            elStatus.innerHTML = online 
                ? '<span style="color: var(--success);"><i class="fas fa-check-circle"></i> Online</span>' 
                : '<span style="color: var(--danger);"><i class="fas fa-times-circle"></i> Offline</span>';
                
            elPlayers.innerText = players_active_24h.toLocaleString('de-DE');
            elAccounts.innerText = accounts.toLocaleString('de-DE');
        } else {
             elStatus.innerText = 'Fehler';
             elPlayers.innerText = '-';
             elAccounts.innerText = '-';
        }
    } catch(e) {
        elStatus.innerText = 'Offline';
        elPlayers.innerText = '-';
        elAccounts.innerText = '-';
    }
}

document.addEventListener('DOMContentLoaded', loadServerStatus);

