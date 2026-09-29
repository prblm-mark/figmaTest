/* MediaMeta — Show / Hide details toggle for an image's file facts.
 *
 * Hidden by default (designer, 2026-09-29). Markup contract:
 *   <button class="media-meta__toggle" data-media-toggle aria-expanded="false"
 *           aria-controls="media-meta-1"><span>Show details</span><svg class="media-meta__chevron"/></button>
 *   <dl class="media-meta__list" id="media-meta-1" hidden>…</dl>
 *
 * Delegated at the document so rows rendered later still work.
 */
(function () {
  'use strict';
  if (window.__mediaMetaBound) return;
  window.__mediaMetaBound = true;

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-media-toggle]');
    if (!btn) return;
    var list = document.getElementById(btn.getAttribute('aria-controls'));
    if (!list) return;
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    list.hidden = !open;
    var label = btn.querySelector('span');
    if (label) label.textContent = open ? 'Hide details' : 'Show details';
  });
})();
