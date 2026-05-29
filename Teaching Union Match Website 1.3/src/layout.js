// ─────────────────────────────────────────────────────────────────────────────
// Shared layout helpers: header, footer, sticky CTA bar.
// These attach to DOM nodes with data-include attributes.
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  // Pages in subdirectories need a "../" prefix when linking back to root.
  function pathPrefix(active) {
    return (active === 'blog' || active === 'organisations') ? '../' : '';
  }

  function getMarkSrc(prefix) {
    let variant = 'fan';
    try { variant = localStorage.getItem('wtu_logo_variant') || 'fan'; } catch (e) {}
    const map = { fan: 'mark-shields-fan.svg', stack: 'mark-shields-stack.svg', mono: 'mark-shields-mono.svg' };
    // Standalone-bundle override: if the page pre-populated window.__resources
    // with blob URLs for the marks, use those instead of relative paths.
    if (window.__resources) {
      const keyMap = { fan: 'markFan', stack: 'markStack', mono: 'markMono' };
      const k = keyMap[variant] || keyMap.fan;
      if (window.__resources[k]) return window.__resources[k];
    }
    return (prefix || '') + 'assets/brand/' + (map[variant] || map.fan);
  }

  function buildHeader(active) {
    const p = pathPrefix(active);
    // Modern lockup: three-shield mark + sans wordmark, "Match" emphasised
    const brand = `<a href="${p}index.html" class="brand brand-home" aria-label="Teaching Union Match — home">
           <img src="${getMarkSrc(p)}" alt="" class="wtu-mark"/>
           <span class="wtu-wordmark-modern">Teaching Union <span class="wtu-which">Match</span></span>
         </a>`;
    return `
      <header class="site-header">
        <div class="wrap">
          ${brand}
          <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
          <nav class="nav" id="primary-nav" aria-label="Primary">
            <button class="nav-toggle" id="nav-close" aria-label="Close menu" style="position:absolute; top:14px; right:14px; display:none;">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
            <a href="${p}index.html" ${active==='home'?'class="active"':''}>Home</a>
            <a href="${p}quiz.html" ${active==='quiz'?'class="active"':''}>Compare options</a>
            <a href="${p}how-it-works.html" ${active==='how'?'class="active"':''}>How it works</a>
            <a href="${p}blog/index.html" ${active==='blog'?'class="active"':''}>Articles</a>
            <a href="${p}about.html" ${active==='about'?'class="active"':''}>About</a>
            <a href="${p}faq.html" ${active==='faq'?'class="active"':''}>FAQ</a>
            <a href="${p}quiz.html" class="btn btn-primary" style="margin-left:10px; padding:10px 18px; font-size:14px;" data-ev="nav_cta">Start comparing</a>
          </nav>
          <div class="nav-backdrop" id="nav-backdrop" aria-hidden="true"></div>
        </div>
      </header>
    `;
  }

  function buildFooter(active) {
    const p = pathPrefix(active);
    return `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <a href="${p}index.html" class="brand" style="margin-bottom:14px;" aria-label="Teaching Union Match — home">
                <img src="${getMarkSrc(p)}" alt="" class="wtu-mark wtu-mark-footer"/>
                <span class="wtu-wordmark-modern wtu-wordmark-footer">Teaching Union <span class="wtu-which">Match</span></span>
              </a>
              <p class="tagline">A comparison tool for UK school staff. Free to use, no sign-up.</p>
            </div>
            <div>
              <h4>Compare</h4>
              <ul>
                <li><a href="${p}quiz.html">Start the quiz</a></li>
                <li><a href="${p}how-it-works.html">How it works</a></li>
                <li><a href="${p}blog/index.html">Articles</a></li>
              </ul>
            </div>
            <div>
              <h4>About</h4>
              <ul>
                <li><a href="${p}about.html">Who we are</a></li>
                <li><a href="${p}faq.html">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4>Site</h4>
              <ul>
                <li><a href="${p}privacy.html">Privacy</a></li>
                <li><a href="#">Accessibility</a></li>
                <li><a href="mailto:info@edapt.org.uk">Contact</a></li>
              </ul>
            </div>
          </div>
          <div class="legal">
            <div>© ${new Date().getFullYear()} Teaching Union Match. Costs and features change — please verify with each organisation before joining.</div>
            <div class="mono">v0.2</div>
          </div>
        </div>
      </footer>
    `;
  }

  function buildStickyBar(active) {
    const p = pathPrefix(active);
    return `
      <div class="sticky-bar" id="sticky-bar" role="complementary" aria-label="Start comparing">
        <span>Not sure which union or professional support fits you?</span>
        <a href="${p}quiz.html" class="btn btn-primary" data-ev="sticky_cta">Start the 2-minute quiz</a>
        <button class="close" id="sticky-close" aria-label="Dismiss">×</button>
      </div>
    `;
  }

  window.WTU_LAYOUT = {
    mount(active) {
      // Apply persisted font theme (from index.html Tweaks) before anything else paints
      try {
        const font = localStorage.getItem('wtu_font_theme') || 'editorial';
        document.documentElement.setAttribute('data-font', font);
      } catch (e) { /* ignore */ }

      const header = document.querySelector('[data-include="header"]');
      if (header) header.outerHTML = buildHeader(active);

      // Mobile nav drawer wiring
      const navToggle = document.getElementById('nav-toggle');
      const navClose = document.getElementById('nav-close');
      const navEl = document.getElementById('primary-nav');
      const navBackdrop = document.getElementById('nav-backdrop');
      function setNav(open) {
        if (!navEl) return;
        navEl.classList.toggle('open', open);
        navBackdrop?.classList.toggle('open', open);
        navToggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (navClose) navClose.style.display = open ? 'inline-flex' : 'none';
        document.documentElement.style.overflow = open ? 'hidden' : '';
      }
      navToggle?.addEventListener('click', () => setNav(!navEl.classList.contains('open')));
      navClose?.addEventListener('click', () => setNav(false));
      navBackdrop?.addEventListener('click', () => setNav(false));
      // Close drawer when a link inside it is clicked
      navEl?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNav(false)));
      // Reset state on resize back to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > 880) setNav(false);
      });

      const footer = document.querySelector('[data-include="footer"]');
      if (footer) footer.outerHTML = buildFooter(active);

      const sticky = document.querySelector('[data-include="sticky"]');
      if (sticky) {
        sticky.outerHTML = buildStickyBar(active);
        // Reveal after scroll
        const bar = document.getElementById('sticky-bar');
        const close = document.getElementById('sticky-close');
        let dismissed = sessionStorage.getItem('wtu_sticky_dismissed') === '1';
        const onScroll = () => {
          if (dismissed) return;
          if (window.scrollY > 600) bar.classList.add('show');
          else bar.classList.remove('show');
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        close?.addEventListener('click', () => {
          dismissed = true;
          sessionStorage.setItem('wtu_sticky_dismissed', '1');
          bar.classList.remove('show');
        });
      }

      // Wire CTA click tracking (picks up nav_cta, sticky_cta, hero_cta, etc.)
      document.querySelectorAll('[data-ev]').forEach(a => {
        if (a.__wtuEvBound) return;
        a.__wtuEvBound = true;
        a.addEventListener('click', () => {
          window.WTU_ANALYTICS?.event('cta_click', {
            cta: a.dataset.ev,
            source_page: document.body.dataset.page || active || location.pathname,
          });
        });
      });

      // Bind any outbound links rendered into the page
      window.WTU_ANALYTICS?.bindOutboundLinks();
    }
  };
})();
