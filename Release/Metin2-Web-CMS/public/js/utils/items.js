// --- Standard Metin2 Bonuses ---
window.metin2Bonuses = [
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

window.metin2Stones = [
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

window.renderBonusFields = function (containerId, prefix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<h4 style="margin: 0 0 1rem 0; color: var(--text-main); font-size: 0.9rem;">Boni (Attr)</h4>';

    for (let i = 0; i < 7; i++) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '0.5rem';
        row.style.marginBottom = '0.5rem';
        row.className = 'bonus-row';

        let options = '';
        metin2Bonuses.forEach(b => {
            options += `<option value="${b.id}" style="background-color: #1a1a2e; color: #f8fafc;">${b.name} (ID: ${b.id})</option>`;
        });

        row.innerHTML = `
            <select id="${prefix}_attrtype${i}" style="flex: 2; padding: 0.5rem; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: var(--text-main); outline:none; height: 42px;">
                ${options}
            </select>
            <input type="number" id="${prefix}_attrvalue${i}" placeholder="Wert" style="flex: 1; padding: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: var(--text-main); outline:none; height: 42px;">
        `;
        container.appendChild(row);
    }
};

window.renderSocketFields = function (containerId, prefix, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        let options = '';
        metin2Stones.forEach(s => {
            options += `<option value="${s.id}" style="background-color: #1a1a2e; color: #f8fafc;">${s.name}</option>`;
        });
        container.innerHTML += `
            <select id="${prefix}_socket${i}" style="padding: 0.5rem; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: var(--text-main); outline:none; height: 42px; width: 100%;">
                ${options}
            </select>
        `;
    }
};

window.decodeItemName = function (val) {
    if (!val) return 'Unbekanntes Item';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        if (val.type === 'Buffer' && Array.isArray(val.data)) {
            return new TextDecoder().decode(new Uint8Array(val.data));
        }
        if (val.data) return new TextDecoder().decode(new Uint8Array(val.data));
    }
    return String(val);
};

// Icon System
let _iconMap = null;
(async function () {
    try {
        const res = await fetch('/api/icons/map');
        _iconMap = await res.json();
    } catch (e) { _iconMap = {}; }
})();

window.getItemIconPath = function (vnum) {
    if (!vnum || vnum <= 0) return '/images/default.png';
    const v = parseInt(vnum, 10);
    if (_iconMap && _iconMap[v]) return '/images/items/' + _iconMap[v];
    const base = Math.floor(v / 10) * 10;
    if (base !== v && _iconMap && _iconMap[base]) return '/images/items/' + _iconMap[base];
    return '/images/items/' + String(v).padStart(5, '0') + '.png';
};

window.handleIconFallback = function (img, vnum) {
    if (img.dataset.fallbackDone) return;
    let step = parseInt(img.dataset.fallbackStep || '0');
    step++;
    img.dataset.fallbackStep = step;
    const v = parseInt(vnum, 10);
    const baseVnum = Math.floor(v / 10) * 10;

    if (step === 1) {
        img.src = '/images/items/' + String(baseVnum).padStart(5, '0') + '.png';
    } else if (step === 2) {
        img.src = '/images/items/' + String(v).padStart(5, '0') + '.jpg';
    } else if (step === 3) {
        img.src = '/images/items/' + String(baseVnum).padStart(5, '0') + '.jpg';
    } else {
        img.src = '/images/default.png';
        img.dataset.fallbackDone = 'true';
    }
};
