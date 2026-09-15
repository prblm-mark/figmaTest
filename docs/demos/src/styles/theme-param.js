/* Theme from the URL, for the component demo pages.
 * ================================================
 * The client preview page (`demo/index.html`) is dark, and links out to these demos. Without
 * this they render light, so clicking a card flips the whole page from dark to light — which
 * reads as a broken link rather than a deliberate difference.
 *
 * `?theme=dark` (or `light`) sets `data-theme` on <html>, which is how this system switches
 * theme: every `--ai-*` colour re-resolves and nothing else has to change. No param means no
 * attribute, so the internal hub's own light demos are untouched.
 *
 * Loaded from <head>, before the body parses, so the page paints in the right theme once
 * rather than flashing light first.
 *
 * NESTED FRAMES. Five of these demos embed THEMSELVES in a 390px iframe to show the narrow
 * layout, and that iframe's src carries `?frame=mobile` with no theme on it. Rather than
 * rewriting the src — which would re-request a document already in flight — the frame reads
 * the host page's `data-theme` directly. It is same-origin, so this is a plain property read;
 * the try/catch is for the case where it is ever served cross-origin, where the frame simply
 * keeps the default rather than throwing.
 */
(function () {
  var root = document.documentElement;
  var theme = (/[?&]theme=(dark|light)\b/.exec(window.location.search) || [])[1];

  if (!theme && window.parent !== window) {
    try { theme = window.parent.document.documentElement.getAttribute('data-theme'); } catch (e) { /* cross-origin */ }
  }

  if (theme === 'dark' || theme === 'light') root.setAttribute('data-theme', theme);
})();
