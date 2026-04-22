// Dragon Dark Navbar Renderer
function renderDragonNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    
    const user = window._m2state?.user;
    
    nav.innerHTML = `
        <div class="nav-container">
            <a href="/" class="logo-text">⚔ METIN2</a>
            <ul class="nav-links">
                <li><a href="/" class="nav-link" data-i18n="nav.home">Home</a></li>
                <li><a href="/shop.html" class="nav-link" data-i18n="nav.shop">Item Shop</a></li>
                <li><a href="/ranking.html" class="nav-link" data-i18n="nav.ranking">Ranking</a></li>
                <li><a href="/news.html" class="nav-link" data-i18n="nav.news">News</a></li>
                <li><a href="/vote.html" class="nav-link" data-i18n="nav.vote">Vote</a></li>
            </ul>
            <div class="nav-user">
                ${user ? `
                    <span style="color:var(--gold-bright); margin-right:1rem;">
                        <i class="fas fa-coins"></i> ${user.coins || 0}
                    </span>
                    <a href="/account.html" class="btn secondary-btn" style="padding:0.4rem 1rem;">
                        ${user.login}
                    </a>
                ` : `
                    <a href="/" class="btn primary-btn" style="padding:0.5rem 1.2rem;">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                `}
            </div>
        </div>
    `;
    
    // Active link highlighting
    const path = window.location.pathname;
    nav.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === path) link.classList.add('active');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Wait for state to load, then render navbar
    setTimeout(renderDragonNavbar, 100);
    // Re-render after auth state changes
    window.addEventListener('m2-auth-change', renderDragonNavbar);
});
