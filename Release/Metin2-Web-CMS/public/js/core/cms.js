/**
 * Public: CMS Logic
 * Handles loading news and other CMS content + navigating to dedicated news pages.
 */

const CMS = {
    async init() {
        // Handle SPA Routing for pages
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');
        if (slug) {
            await this.loadPage(slug);
        } else if (document.getElementById('newsGrid')) {
            await this.loadNews();
        }

        // Intercept link clicks for SPA-like navigation
        this.interceptLinks();

        // Init server status widget collapse toggle
        this.initStatusWidget();
    },

    initStatusWidget() {
        // Restore collapsed state
        const collapsed = localStorage.getItem('statusWidgetCollapsed') === 'true';
        const widget = document.getElementById('serverStatusWidget');
        if (widget && collapsed) {
            widget.classList.add('collapsed');
        }
    },

    async loadPage(slug, lang = null) {
        const activeLang = lang || window.i18n?.currentLang || 'de';
        const container = document.getElementById('dynamicPageContainer');
        const hero = document.querySelector('.hero-section');
        const news = document.getElementById('newsSection');
        const statusWidget = document.getElementById('serverStatusWidget');
        const contentArea = document.getElementById('pageContentArea');
        const loading = document.getElementById('pageLoading');

        if (!container || !contentArea) return;

        // Hide other sections
        if (hero) hero.style.display = 'none';
        if (news) news.style.display = 'none';
        if (statusWidget) statusWidget.style.display = 'none';
        
        container.style.display = 'block';
        loading.style.display = 'block';
        contentArea.innerHTML = '';

        try {
            const res = await fetch(`${API_URL}/cms/pages/${slug}?lang=${activeLang}`);
            const data = await res.json();

            loading.style.display = 'none';

            if (data.success && data.page) {
                document.title = `${data.page.title} — ${window.siteSettings?.site_name || 'Metin2 Web'}`;
                contentArea.innerHTML = `
                    <h1 style="color: var(--primary); margin-bottom: 2rem; display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-file-alt"></i> ${data.page.title}
                    </h1>
                    <div class="cms-rich-text">
                        ${data.page.content}
                    </div>
                    <div style="margin-top: 3rem; border-top: 1px solid var(--glass-border); padding-top: 2rem;">
                        <button class="btn secondary-btn" onclick="CMS.goHome()">
                            <i class="fas fa-arrow-left"></i> ${window.i18n?.t('navbar.back_home') || 'Zurück zur Startseite'}
                        </button>
                    </div>
                `;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                contentArea.innerHTML = `
                    <div class="error-msg">
                        <h3>Seite nicht gefunden</h3>
                        <p>Die angeforderte Seite "${slug}" existiert leider nicht in der Sprache "${activeLang}".</p>
                        <button class="btn primary-btn" onclick="CMS.goHome()">Zurück</button>
                    </div>
                `;
            }
        } catch (err) {
            loading.style.display = 'none';
            contentArea.innerHTML = '<div class="error-msg">Fehler beim Laden der Seite.</div>';
        }
    },

    goHome() {
        window.history.pushState({}, '', '/');
        this.resetToHome();
    },

    resetToHome() {
        const container = document.getElementById('dynamicPageContainer');
        const hero = document.querySelector('.hero-section');
        const news = document.getElementById('newsSection');
        const statusWidget = document.getElementById('serverStatusWidget');

        if (container) container.style.display = 'none';
        if (hero) hero.style.display = 'flex';
        if (news) news.style.display = 'block';
        if (statusWidget) statusWidget.style.removeProperty('display');
        
        if (window.siteSettings?.site_name) {
            document.title = `Home — ${window.siteSettings.site_name}`;
        }
        
        if (document.getElementById('newsGrid') && document.getElementById('newsGrid').innerHTML.includes('fa-spinner')) {
            this.loadNews();
        }
    },

    interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('javascript:')) return;

            // Only intercept if we have the SPA containers on this page
            const hasSpaContainers = document.getElementById('newsSection') || document.getElementById('dynamicPageContainer');
            if (!hasSpaContainers) return;

            // Handle internal page links like /page?slug=...
            if (href.includes('slug=') || href === 'index' || href === '/') {
                e.preventDefault();
                
                if (href === 'index' || href === '/') {
                    window.history.pushState({}, '', '/');
                    this.resetToHome();
                } else {
                    const params = new URLSearchParams(href.split('?')[1]);
                    const slug = params.get('slug');
                    const lang = params.get('lang');
                    window.history.pushState({ slug, lang }, '', href);
                    this.loadPage(slug, lang);
                }
            }
        });

        window.addEventListener('popstate', (e) => {
            const params = new URLSearchParams(window.location.search);
            const slug = params.get('slug');
            const lang = params.get('lang');
            if (slug) {
                this.loadPage(slug, lang);
            } else {
                this.resetToHome();
            }
        });

        // Listen for language changes to update the current dynamic page
        document.addEventListener('languageChanged', (e) => {
            const params = new URLSearchParams(window.location.search);
            const slug = params.get('slug');
            if (slug) {
                this.loadPage(slug, e.detail.lang);
            } else if (document.getElementById('newsGrid')) {
                this.loadNews();
            }
        });
    },

    async loadNews() {
        const grid = document.getElementById('newsGrid');
        if (!grid) return;

        try {
            const activeLang = window.i18n?.currentLang || 'de';
            const res = await fetch(`${API_URL}/cms/news/all?lang=${activeLang}`);
            const data = await res.json();

            if (data.success && data.news.length > 0) {
                const publishedNews = data.news.filter(n => n.is_published);
                
                if (publishedNews.length === 0) {
                    grid.innerHTML = '<div class="news-empty"><i class="fas fa-newspaper"></i> Keine Neuigkeiten vorhanden.</div>';
                    return;
                }

                grid.innerHTML = publishedNews.map(item => {
                    const date = new Date(item.created_at);
                    const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
                    const excerpt = this.truncateHtml(item.content, 130);
                    const readMoreLabel = window.i18n?.t('news.read_more') || 'Weiterlesen';

                    return `
                    <article class="news-card glass-panel">
                        ${item.image_url ? `<div class="news-img" style="background-image:url('${item.image_url}')"></div>` : ''}
                        <div class="news-content">
                            <div class="news-meta">
                                <span class="news-badge">${item.category || 'News'}</span>
                                <span class="news-date"><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                                ${item.author ? `<span class="news-author"><i class="far fa-user"></i> ${item.author}</span>` : ''}
                            </div>
                            <h3 class="news-title">${item.title}</h3>
                            <div class="news-excerpt">${excerpt}</div>
                            <a href="/news/${item.id}" class="news-read-more">
                                ${readMoreLabel} <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </article>`;
                }).join('');
            } else {
                grid.innerHTML = '<div class="news-empty"><i class="fas fa-newspaper"></i> Keine Neuigkeiten verfügbar.</div>';
            }
        } catch (err) {
            console.error('[CMS] Error loading news:', err);
            grid.innerHTML = '<div class="news-error"><i class="fas fa-exclamation-triangle"></i> Fehler beim Laden der News.</div>';
        }
    },

    truncateHtml(html, maxLength) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        let text = tmp.textContent || tmp.innerText || '';
        if (text.length > maxLength) {
            text = text.substring(0, maxLength) + '...';
        }
        return text;
    },

    // viewArticle now navigates to /news/:id — no more modal/alert
    viewArticle(id) {
        window.location.href = `/news/${id}`;
    }
};

// Global status widget toggle (called inline from HTML)
window.toggleStatusWidget = function() {
    const widget = document.getElementById('serverStatusWidget');
    if (!widget) return;
    widget.classList.toggle('collapsed');
    localStorage.setItem('statusWidgetCollapsed', widget.classList.contains('collapsed'));
};

document.addEventListener('DOMContentLoaded', () => CMS.init());
