/**
 * Dragon Dark Theme - Specific JavaScript Effects
 */

document.addEventListener('DOMContentLoaded', () => {
    initMistEffect();
    initThemeParticals();
});

/**
 * Atmospheric mist effect
 */
function initMistEffect() {
    const mist = document.createElement('div');
    mist.className = 'mist-effect';
    mist.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: url('https://www.transparenttextures.com/patterns/fog.png');
        pointer-events: none;
        z-index: 3;
        opacity: 0.05;
        animation: mistFloat 15s infinite alternate ease-in-out;
    `;
    document.body.appendChild(mist);
}

/**
 * Initialize theme-specific particles if particles.js is loaded
 */
function initThemeParticals() {
    if (typeof particlesJS === 'undefined') return;

    particlesJS('particles-js', {
        "particles": {
            "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#D4A017" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.3, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
            "size": { "value": 3, "random": true, "anim": { "enable": false } },
            "line_linked": { "enable": true, "distance": 150, "color": "#D4A017", "opacity": 0.1, "width": 1 },
            "move": { "enable": true, "speed": 1, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
            "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
        },
        "retina_detect": true
    });
}
