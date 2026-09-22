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
  if (!m) return;
  var root = document.documentElement;
  root.setAttribute('data-capture', m[1]);

  /* The Figma frame name comes from document.title, and identical titles are
   * neither a reliable update nor a reliable no-op — on 2026-07-27 a second
   * capture at another viewport silently destroyed four existing frames. So
   * desktop and mobile of the same screen MUST differ, and every push carries
   * a version. Set here rather than in the <title> so the demo pages keep
   * readable tab names. */
  /* Version comes from the URL so a re-push (e.g. after a wrong-width capture)
   * gets a distinct frame name without editing this file: ?capture=tall&v=2 */
  var VERSION = 'v' + ((/[?&]v=(\d+)/.exec(window.location.search) || [])[1] || '1');
  /* Pin the render width on the PAGE, not the window.
   * The Chrome window would not hold a set size: measured on 2026-09-22 it
   * drifted 1600 -> 1826 between captures and 1600 -> 2156 *during* one, so
   * three frames came out at the wrong width. Whatever is resizing it (window
   * manager / Chrome session restore) cannot be relied on to stop, and the
   * capture serialises the DOM — so a body pinned to 1600px produces a 1600px
   * frame no matter how wide the window happens to be. Container queries key
   * off the page column, which derives from this width, so the layout is
   * identical to a genuinely 1600px window. */
  var w = parseInt((/[?&]w=(\d+)/.exec(window.location.search) || [])[1], 10);
  if (w) {
    root.style.width = w + 'px';
    root.style.overflowX = 'hidden';
    document.body.style.width = w + 'px';
    document.body.style.minWidth = w + 'px';
  }

  var name = root.getAttribute('data-capture-name') || document.title;
  var variant = (w || window.innerWidth) <= 600 ? 'Mobile' : 'Desktop';
  document.title = 'CC Record — ' + name + ' — ' + VERSION + ' · ' + variant;
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
