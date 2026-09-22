/* ControlRecordScreen — tab strip (model A only)
 * ────────────────────────────────────────────────────────────────────────────
 * The only behaviour this prototype needs. Model B has no tabs, so this is a
 * no-op there.
 *
 * Panels are toggled via the `hidden` ATTRIBUTE, never via a CSS display rule:
 * base.css declares [hidden] with !important (noted at Datatables.css:377-380),
 * so a stylesheet cannot reveal a hidden panel and would only look broken.
 *
 * No matchMedia anywhere. Layout state in this screen belongs to container
 * queries — a docked SidebarMenu changes the content column with no window
 * resize at all, so a viewport listener would simply never fire (CLAUDE.md §4a).
 */
/* Capture mode: ?capture=tall unpicks the fixed-height app shell so the Figma
 * frame comes out at full record height instead of one viewport. See the
 * matching block at the foot of ControlRecordScreen.css. Runs before the
 * Figma capture script, which is async and carries a 1000ms delay. */
(function () {
  var m = /[?&]capture=([a-z]+)/.exec(window.location.search);
  if (m) document.documentElement.setAttribute('data-capture', m[1]);
})();

(function () {
  'use strict';

  var strip = document.querySelector('.crs-tabs');
  if (!strip) return;

  var tabs = Array.prototype.slice.call(strip.querySelectorAll('.crs-tab'));

  function panelOf(tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  }

  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      var panel = panelOf(t);
      t.classList.toggle('crs-tab--active', on);
      t.setAttribute('aria-selected', String(on));
      t.setAttribute('tabindex', on ? '0' : '-1');
      if (panel) panel.hidden = !on;
    });
  }

  strip.addEventListener('click', function (e) {
    var tab = e.target.closest('.crs-tab');
    if (tab) select(tab);
  });

  /* Roving tabindex — left/right move, Home/End jump, per the WAI tabs pattern. */
  strip.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (!next) return;
    e.preventDefault();
    next.focus();
    select(next);
  });

  /* Normalise the initial state from the markup rather than assuming index 0,
     so the generated `hidden` attributes and the active class cannot disagree. */
  select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
})();
