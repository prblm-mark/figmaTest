/* RecordScreen — page glue for the Article View / Edit / Steps screens.
 *
 *   1. Width: applies the shell's width mode (?template=full, else the viewer's saved choice from
 *      the rail's Minimise toggle — control-width.js) and mirrors it onto the kit's
 *      own --full modifiers (RecordTabs, RecordSection, StepsTable), so each component owns
 *      its flat style rather than this page restyling it.
 *   2. Keeps ?template= on the tab / Edit / Cancel links (marked data-keep-width) so the width
 *      survives moving between the three screens.
 *   3. Draws the Performance chart (Chart.js), colours read from tokens like Chart's own demo.
 *
 * Behaviour owned elsewhere: AdvisoryItem.js (± expand, Expand all), TagBox.js (remove +
 * Multi Select Modal), StepsTable.js (Show details, select all), Toggle.js, Select.js.
 */
(function () {
  'use strict';

  var FULL = { '.record-tabs': 'record-tabs--full', '.record-section': 'record-section--full', '.steps-table': 'steps-table--full' };

  function mirror(mode) {
    Object.keys(FULL).forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.classList.toggle(FULL[sel], mode === 'full'); });
    });
    var q = '?template=' + mode; // explicit, so a saved choice can never override the current screen's
    document.querySelectorAll('a[data-keep-width]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').split('?')[0] + q);
    });
  }

  document.addEventListener('cc:width', function (e) { mirror(e.detail.mode); });
  if (window.ccWidth) window.ccWidth.apply(window.ccWidth.resolve());

  /* Resizable sidebar (designer, 2026-09-28) — the Seating Planner's handle model.
   * MIN --ai-size-7 (384 — Figma's width is the floor, designer 2026-09-28), MAX half the row, 16px arrow step, double-click
   * resets to Figma's 384. The chosen width is kept per viewer (localStorage, like cc-width) so
   * it survives moving between View and Edit. No stacked layout exists for these screens yet,
   * so there is no isStacked() guard. */
  var body = document.querySelector('.record-screen__body');
  var handle = document.querySelector('[data-record-handle]');
  var side = document.querySelector('.record-screen__sidebar');
  var KEY = 'cc-record-sidebar-w';

  // Custom props resolve to the authored string ("17.5rem"), so convert through the root font size.
  function tokenPx(name) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    var n = parseFloat(raw);
    if (!isFinite(n)) return 0;
    return raw.indexOf('rem') !== -1 ? n * parseFloat(getComputedStyle(document.documentElement).fontSize) : n;
  }

  if (body && handle && side) {
    var bounds = function () {
      var min = tokenPx('--ai-size-7');
      return { min: min, max: Math.max(min, body.getBoundingClientRect().width / 2) };
    };
    var aria = function (w) {
      var b = bounds();
      handle.setAttribute('aria-valuenow', String(Math.round(w)));
      handle.setAttribute('aria-valuemin', String(Math.round(b.min)));
      handle.setAttribute('aria-valuemax', String(Math.round(b.max)));
    };
    var setWidth = function (px, save) {
      var b = bounds();
      var w = Math.min(b.max, Math.max(b.min, px));
      body.style.setProperty('--rs-sidebar-w', w + 'px');
      aria(w);
      if (save) { try { localStorage.setItem(KEY, String(Math.round(w))); } catch (e) { /* session only */ } }
      return w;
    };
    var from = 0, start = 0;

    handle.addEventListener('pointerdown', function (ev) {
      from = ev.clientX; start = side.getBoundingClientRect().width;
      handle.setAttribute('data-dragging', '');
      if (handle.setPointerCapture) handle.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    });
    handle.addEventListener('pointermove', function (ev) {
      if (!handle.hasAttribute('data-dragging')) return;
      setWidth(start - (ev.clientX - from), false);   // sidebar is right of its edge: drag left = wider
    });
    var end = function (ev) {
      if (!handle.hasAttribute('data-dragging')) return;
      handle.removeAttribute('data-dragging');
      try { handle.releasePointerCapture(ev.pointerId); } catch (e) { /* already released */ }
      setWidth(side.getBoundingClientRect().width, true);
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);

    handle.addEventListener('keydown', function (ev) {
      var b = bounds(), step = tokenPx('--ai-spacing-5'), w = side.getBoundingClientRect().width;
      if (ev.key === 'ArrowLeft') setWidth(w + step, true);
      else if (ev.key === 'ArrowRight') setWidth(w - step, true);
      else if (ev.key === 'Home') setWidth(b.max, true);
      else if (ev.key === 'End') setWidth(b.min, true);
      else return;
      ev.preventDefault();
    });

    handle.addEventListener('dblclick', function () {
      body.style.removeProperty('--rs-sidebar-w');
      try { localStorage.removeItem(KEY); } catch (e) { /* nothing stored */ }
      aria(side.getBoundingClientRect().width);
    });

    var saved = null;
    try { saved = parseFloat(localStorage.getItem(KEY)); } catch (e) { /* storage blocked */ }
    if (saved > 0) setWidth(saved, false); else aria(side.getBoundingClientRect().width);
  }

  /* "Show sidebar" switch. The markup carries the mode's default (View on / Edit off); the viewer's
   * own choice is remembered PER MODE (designer, 2026-09-29) and wins over it on load.
   * Toggle.js owns the switch's own state and fires `toggle:change`; this shows / hides and saves.
   * TODO(backend:RecordScreen) record-sidebar-preference: localStorage stands in for the per-user
   *   preference → save { view: bool, edit: bool } with the user's CC settings. */
  var recordScreen = document.querySelector('[data-record-screen]');
  var sidebarSwitch = document.querySelector('[data-record-sidebar]');
  var sidebarKey = recordScreen && recordScreen.getAttribute('data-record-mode')
    ? 'cc-record-sidebar-' + recordScreen.getAttribute('data-record-mode') : null;

  function showSidebar(on) {
    recordScreen.classList.toggle('record-screen--no-sidebar', !on);
    sidebarSwitch.classList.toggle('toggle--active', on);
    sidebarSwitch.setAttribute('aria-checked', on ? 'true' : 'false');
  }

  if (recordScreen && sidebarSwitch && sidebarKey) {
    var savedSidebar = null;
    try { savedSidebar = localStorage.getItem(sidebarKey); } catch (e) { /* storage blocked */ }
    if (savedSidebar === 'on' || savedSidebar === 'off') showSidebar(savedSidebar === 'on');

    document.addEventListener('toggle:change', function (e) {
      if (!e.target.closest('[data-record-sidebar]')) return;
      var on = !!(e.detail && e.detail.active);
      recordScreen.classList.toggle('record-screen--no-sidebar', !on);
      try { localStorage.setItem(sidebarKey, on ? 'on' : 'off'); } catch (err) { /* session only */ }
    });
  }

  // TODO(backend:RecordScreen): Performance figures + chart series are static → record analytics endpoint
  //   { impressions, consumed, bookmarked, topAccounts[], series: { labels[], impressions[], unique[] } }
  var canvas = document.getElementById('perf-chart');
  if (canvas && window.Chart) {
    var cs = getComputedStyle(document.documentElement);
    var tok = function (n, fb) { return cs.getPropertyValue(n).trim() || fb; };
    var brand = tok('--ai-surface-brand', '#0071d8');
    var success = tok('--ai-surface-success', '#30cb90');
    window.Chart.defaults.font.family = 'Inter, sans-serif';
    window.Chart.defaults.font.size = 10;
    window.Chart.defaults.color = tok('--ai-text-contrast', '#67676c');
    window.Chart.defaults.borderColor = tok('--ai-border-secondary', '#e2e2e3');
    new window.Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          { label: 'Impressions', data: [3000, 4200, 3800, 5100, 4900, 6100, 5800], borderColor: brand, tension: 0.4, borderWidth: 2, pointRadius: 0 },
          { label: 'Unique', data: [1800, 2400, 2200, 2900, 2800, 3300, 3100], borderColor: success, tension: 0.4, borderWidth: 2, pointRadius: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, border: { display: false } }, y: { border: { display: false } } },
      },
    });
  }
})();
