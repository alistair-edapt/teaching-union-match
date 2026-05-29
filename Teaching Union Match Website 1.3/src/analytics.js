/* WTU analytics + consent
   - GA4 placeholder (swap MEASUREMENT_ID in one place when live)
   - Cookie-free by default; GA loads only after explicit consent
   - Emits wtu:event for any element with data-ev on click, and for named events via WTU_TRACK
*/
(function () {
  const GA_ID = "G-4JZZQCMBJC"; // GA4 measurement ID (Admin → Data streams)
  const KEY = "wtu-consent-v1";

  const state = {
    consent: (() => { try { return localStorage.getItem(KEY); } catch (e) { return null; } })(),
    queue: [],
  };

  function storeConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    state.consent = v;
  }

  function loadGA() {
    if (window.__wtuGaLoaded || !GA_ID || GA_ID.indexOf("XXXX") > -1) return; // no-op for placeholder
    window.__wtuGaLoaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  }

  function track(name, params) {
    const evt = { name: name, params: params || {}, t: Date.now() };
    // Always dispatch a DOM event so anything on page can listen (useful in dev)
    document.dispatchEvent(new CustomEvent("wtu:event", { detail: evt }));
    if (state.consent === "granted") {
      if (window.gtag) window.gtag("event", name, params || {});
    } else {
      state.queue.push(evt);
    }
  }

  function flush() {
    if (state.consent !== "granted" || !window.gtag) return;
    state.queue.splice(0).forEach(e => window.gtag("event", e.name, e.params));
  }

  // Public API
  window.WTU_TRACK = track;

  // ---------- Quiz-facing API (WTU_ANALYTICS) ----------
  // Quiz.jsx calls window.WTU_ANALYTICS.event(...) and .bindOutboundLinks().
  // Both route through track() above, so they respect consent and the
  // configured sink. Inert until a real provider is configured.
  function bindOutboundLinks(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("[data-outbound]").forEach(function (a) {
      if (a.__wtuOutbound) return;
      a.__wtuOutbound = true;
      a.addEventListener("click", function () {
        track("outbound_click", {
          org_slug: a.getAttribute("data-outbound"),
          href: a.getAttribute("href") || null,
          label: (a.textContent || "").trim().slice(0, 60),
        });
      });
    });
  }

  window.WTU_ANALYTICS = {
    event: track,
    bindOutboundLinks: bindOutboundLinks,
  };

  // Auto-track any clickable element with data-ev
  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-ev]");
    if (!el) return;
    track(el.dataset.ev, {
      label: el.getAttribute("data-ev-label") || el.textContent.trim().slice(0, 60),
      href: el.getAttribute("href") || null,
    });
  });

  // Page-view
  window.addEventListener("load", function () {
    track("page_view", { page: document.body.dataset.page || "unknown", path: location.pathname });
  });

  // ---------- Consent banner ----------
  function renderBanner() {
    if (state.consent) { if (state.consent === "granted") { loadGA(); flush(); } return; }

    const el = document.createElement("div");
    el.id = "wtu-consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Cookies and analytics");
    el.innerHTML = `
      <div class="wtu-consent-inner">
        <div class="wtu-consent-copy">
          <strong>Help us improve this tool</strong>
          <span>We use anonymous usage data to see how people use the tool and improve its accuracy. No name, email or account, and never shared with anyone. You can decline — the tool works just the same.</span>
        </div>
        <div class="wtu-consent-actions">
          <button type="button" class="wtu-consent-btn wtu-consent-decline" data-choice="denied">Decline</button>
          <button type="button" class="wtu-consent-btn wtu-consent-accept" data-choice="granted">Accept</button>
        </div>
      </div>`;
    document.body.appendChild(el);

    el.addEventListener("click", function (e) {
      const b = e.target.closest("[data-choice]");
      if (!b) return;
      storeConsent(b.dataset.choice);
      if (b.dataset.choice === "granted") { loadGA(); flush(); }
      el.remove();
    });
  }

  // Inject minimal banner styles (kept local so it works on any page)
  const css = `
    #wtu-consent { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 9999;
      background: #fff; border: 1px solid rgba(0,0,0,0.12); box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      border-radius: 14px; padding: 16px 18px; font-family: var(--f-sans, system-ui, sans-serif);
      animation: wtuConsentIn .28s ease-out both; }
    @keyframes wtuConsentIn { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
    #wtu-consent .wtu-consent-inner { display: flex; gap: 18px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
    #wtu-consent .wtu-consent-copy { max-width: 640px; font-size: 14px; color: var(--c-text, #1a1a1a); line-height: 1.55; }
    #wtu-consent .wtu-consent-copy strong { display: block; margin-bottom: 2px; font-size: 14.5px; }
    #wtu-consent .wtu-consent-copy span { color: var(--c-text-muted, #555); }
    #wtu-consent .wtu-consent-actions { display: flex; gap: 8px; flex-shrink: 0; }
    #wtu-consent .wtu-consent-btn { padding: 9px 18px; border-radius: 10px; border: 1px solid var(--c-border, #ddd);
      background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; color: inherit; }
    #wtu-consent .wtu-consent-accept { background: var(--c-primary, #6E3B7E); border-color: var(--c-primary, #6E3B7E); color: #fff; }
    #wtu-consent .wtu-consent-accept:hover { filter: brightness(1.05); }
    #wtu-consent .wtu-consent-decline:hover { background: var(--c-background-2, #f5f3f7); }
    @media (max-width: 520px) { #wtu-consent .wtu-consent-actions { width: 100%; } #wtu-consent .wtu-consent-btn { flex: 1; } }
  `;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderBanner);
  } else {
    renderBanner();
  }
})();
