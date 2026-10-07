/* AvatarGroup — expandable "+N" counter that toggles to "show less".
 *
 * When the counter is a <button data-avatar-group-more>, pressing it shows the members held back
 * with `data-avatar-group-extra` + `hidden`; pressing it again hides them. The button stays last,
 * swapping "+N" for a chevron via aria-expanded (CSS). A static counter (a <span>, as Figma
 * 4057:2759 draws it) is left alone. Document-delegated, so markup added after load works too.
 *
 * Also paints the ring colour from the surface underneath (paintRings, below).
 */
(function () {
  'use strict';
  if (window.__avatarGroupReady) return;
  window.__avatarGroupReady = true;

  /* Ring colour = the surface the element actually sits on. CSS cannot read an ancestor's
   * background, so walk up to the first opaque one and hand it over as --ring-surface. Used by the
   * group's 2px ring and by any [data-ring-surface] element (the record timeline's icon ring).
   * Re-run when the theme changes (data-theme / class on <html> or <body>). */
  function surfaceOf(el) {
    for (var n = el.parentElement; n; n = n.parentElement) {
      var bg = getComputedStyle(n).backgroundColor;
      if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) return bg;
    }
    return '';
  }
  function paintRings() {
    document.querySelectorAll('.avatar-group, [data-ring-surface]').forEach(function (el) {
      var bg = surfaceOf(el);
      if (bg) el.style.setProperty('--ring-surface', bg); else el.style.removeProperty('--ring-surface');
    });
  }
  window.AvatarGroupRings = paintRings;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintRings); else paintRings();
  var themeWatch = new MutationObserver(function () { setTimeout(paintRings, 0); });
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  if (document.body) themeWatch.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });

  document.addEventListener('click', function (e) {
    var more = e.target.closest('[data-avatar-group-more]');
    if (!more) return;
    var open = more.getAttribute('aria-expanded') !== 'true';
    more.closest('.avatar-group').querySelectorAll('[data-avatar-group-extra]').forEach(function (m) {
      m.hidden = !open;
    });
    more.setAttribute('aria-expanded', String(open));
    more.setAttribute('aria-label', open ? more.dataset.labelLess : more.dataset.labelMore);
    more.title = open ? 'Show less' : more.dataset.names;
  });
})();
