/* Seating Planner — toolbar mobile options, behaviour (review only, 2026-08-03)
 *
 * Loaded ONLY by toolbar-{a,c,e}.html. workspace.html and the 35 signed-off
 * capture states do not include it, so nothing here can affect them.
 *
 * Only option A needs script: its "More" overflow menu. Options C and E are
 * pure CSS on top of variant markup.
 *
 * It runs on its own data-sp-more-* attributes rather than reusing
 * data-sp-split-*, because the shell resolves the split menu with
 * one('[data-sp-split-menu]') — the FIRST match in the document. A second menu
 * on those attributes would toggle the EXPORT menu instead. That is a latent
 * bug in the shell (harmless while only one menu exists); if option A is
 * adopted, fix it there by scoping the lookup to the clicked toggle's wrap and
 * this file goes away.
 *
 * The menu items carry the same [data-sp-action] / [data-sp-task] as the buttons
 * they replace, so the workspace's own action registry dispatches them with no
 * wiring here — a menu item IS the button, just in a different place.
 */
(function () {
  'use strict';

  function menu() { return document.querySelector('[data-sp-more-menu]'); }
  function toggle() { return document.querySelector('[data-sp-more-toggle]'); }

  function close() {
    var m = menu(), t = toggle();
    if (m) m.setAttribute('hidden', '');
    if (t) t.setAttribute('aria-expanded', 'false');
  }

  function init() {
    if (!menu()) return;   /* options C and E have no overflow menu */

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-sp-more-toggle]');
      if (t) {
        /* stopPropagation so the shell's own document click handler does not
           immediately treat this as a click outside and close it again. */
        e.stopPropagation();
        var m = menu();
        var opening = m.hasAttribute('hidden');
        m.toggleAttribute('hidden');
        t.setAttribute('aria-expanded', opening ? 'true' : 'false');
        return;
      }
      /* A click on an item runs through the workspace registry and then closes
         the menu — the action itself is not this file's business. */
      if (e.target.closest('[data-sp-more-menu]')) { close(); return; }
      close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
