// Analytics stub for standalone quiz export.
// No-op implementations matching the main site's API so Quiz.jsx runs unchanged.
// When re-integrated into the main site, this file is replaced by the real analytics.js.
window.WTU_ANALYTICS = {
  event(name, props) {
    console.log('[stub analytics]', name, props || {});
  },
  bindOutboundLinks() { /* no-op in standalone mode */ },
};
