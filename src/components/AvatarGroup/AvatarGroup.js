/* AvatarGroup — expandable "+N" counter that toggles to "show less".
 *
 * When the counter is a <button data-avatar-group-more>, pressing it shows the members held back
 * with `data-avatar-group-extra` + `hidden`; pressing it again hides them. The button stays last,
 * swapping "+N" for a chevron via aria-expanded (CSS). A static counter (a <span>, as Figma
 * 4057:2759 draws it) is left alone. Document-delegated, so markup added after load works too.
 */
(function () {
  'use strict';
  if (window.__avatarGroupReady) return;
  window.__avatarGroupReady = true;

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
