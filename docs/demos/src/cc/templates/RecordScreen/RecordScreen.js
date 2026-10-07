/* RecordScreen — page glue for the Article View / Edit / Steps screens.
 *
 *   1. Width: applies the shell's width mode (?template=full, else the viewer's saved choice from
 *      the rail's Minimise toggle — control-width.js) and mirrors it onto the kit's
 *      own --full modifiers (RecordTabs, RecordSection, StepsTable; page Alerts → Style=Fixed), so each component owns
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

  // A page alert at the top of the main column (failed-Save summary, confirmation banner) becomes
  // Alert Style=Fixed in full width — the bar Figma draws for it (2542:5854; designer, 2026-10-05).
  var FULL = { '.record-tabs': 'record-tabs--full', '.record-section': 'record-section--full', '.steps-table': 'steps-table--full',
               '.record-screen__main > .alert': 'alert--fixed' };

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

  /* ── Sidebar panel order (designer, 2026-10-05; code-first) ──
   * A sidebar FactPanel is dragged by its header: the header shows a grab cursor and nothing is
   * added to the layout (a visible handle broke the header — designer, 2026-10-05). Controls inside
   * the header (the Converting Articles switch, SEO Expand all) keep their own behaviour and never
   * start a drag. Keyboard alternative: the header is focusable, and ↑ / ↓ move the panel one place.
   * Pointer devices only — on touch nothing is made draggable, but a saved order still applies.
   * TODO(backend:RecordScreen) record-sidebar-order: the order lives in localStorage for the demo →
   *   save per user profile and record type { recordType: 'article', panels: [panelId…] }, and
   *   render the sidebar in that order server-side. Unknown / new panels keep their default place. */
  var side = document.getElementById('record-sidebar');
  if (side) {
    /* One order per record type (data-record-type on the screen; Article when unset): Contact's
       panels are a different set, and sharing the Article key let one reorder the other. */
    var rs = side.closest('[data-record-screen]');
    var ORDER_KEY = 'cc-record-sidebar-order:' + ((rs && rs.getAttribute('data-record-type')) || 'article');
    var panels = function () { return Array.prototype.slice.call(side.querySelectorAll(':scope > .fact-panel')); };
    var idOf = function (p) { return p.getAttribute('aria-labelledby'); };
    var CONTROLS = 'button, a, input, select, textarea, label, [role="radio"], [role="switch"]';

    var saveOrder = function () {
      try { localStorage.setItem(ORDER_KEY, JSON.stringify(panels().map(idOf))); } catch (err) { /* demo only */ }
    };
    // Restore: saved ids first in their saved order, then any panel the saved list doesn't know.
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(ORDER_KEY) || 'null'); } catch (err) { saved = null; }
    if (Array.isArray(saved)) {
      var current = panels();
      var tail = current[current.length - 1].nextSibling;
      var byId = {};
      current.forEach(function (p) { byId[idOf(p)] = p; });
      var ordered = saved.map(function (id) { return byId[id]; }).filter(Boolean);
      current.forEach(function (p) { if (ordered.indexOf(p) < 0) ordered.push(p); });
      ordered.forEach(function (p) { side.insertBefore(p, tail); });
    }

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      panels().forEach(function (p) {
        p.classList.add('fact-panel--sortable');
        var header = p.querySelector('.fact-panel__header');
        if (!header) return;
        header.setAttribute('tabindex', '0');
        header.setAttribute('data-panel-grip', '');
        header.title = 'Drag to reorder, or press the arrow keys';
      });

      var dragging = null;
      // Only a press on the header itself (not a control in it) makes the panel draggable, so
      // panel text stays selectable and the header's buttons keep working.
      side.addEventListener('mousedown', function (e) {
        var g = e.target.closest('[data-panel-grip]');
        if (g && !e.target.closest(CONTROLS)) g.closest('.fact-panel').setAttribute('draggable', 'true');
      });
      document.addEventListener('mouseup', function () {
        if (!dragging) panels().forEach(function (p) { p.removeAttribute('draggable'); });
      });
      side.addEventListener('dragstart', function (e) {
        dragging = e.target.closest && e.target.closest('.fact-panel[draggable]');
        if (!dragging) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', idOf(dragging));
        dragging.classList.add('fact-panel--dragging');
      });
      side.addEventListener('dragover', function (e) {
        if (!dragging) return;
        e.preventDefault();
        var over = e.target.closest('.fact-panel');
        if (!over || over === dragging || over.parentNode !== side) return;
        var r = over.getBoundingClientRect();
        side.insertBefore(dragging, e.clientY > r.top + r.height / 2 ? over.nextSibling : over);
      });
      side.addEventListener('drop', function (e) { if (dragging) e.preventDefault(); });
      side.addEventListener('dragend', function () {
        if (!dragging) return;
        dragging.classList.remove('fact-panel--dragging');
        dragging.removeAttribute('draggable');
        dragging = null;
        saveOrder();
      });
      side.addEventListener('keydown', function (e) {
        var g = e.target.matches && e.target.matches('[data-panel-grip]') ? e.target : null;
        if (!g || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
        e.preventDefault();
        var p = g.closest('.fact-panel');
        var list = panels(), i = list.indexOf(p);
        if (e.key === 'ArrowUp' && i > 0) side.insertBefore(p, list[i - 1]);
        else if (e.key === 'ArrowDown' && i < list.length - 1) side.insertBefore(p, list[i + 1].nextSibling);
        else return;
        g.focus();
        saveOrder();
      });
    }
  }

  /* ── Converting Articles (code-first, 2026-10-05) ──
   * The Registration / Purchase switch (SegmentedControl) swaps the three stats and the chart.
   * TODO(backend:RecordScreen): totals + 12-month series per type are static → conversions endpoint */
  var CONV = {
    registration: { total: '64', per_day: '0.18', rate: '1.94%', series: [2, 4, 3, 6, 5, 7, 4, 8, 6, 9, 5, 5] },
    purchase: { total: '17', per_day: '0.05', rate: '0.52%', series: [0, 1, 2, 1, 0, 2, 3, 1, 2, 2, 1, 2] },
  };
  var convCanvas = document.getElementById('conv-chart');
  if (convCanvas && window.Chart) {
    var ccs = getComputedStyle(document.documentElement);
    var months = [];
    for (var mi = 11; mi >= 0; mi--) {
      var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - mi);
      months.push(d.toLocaleString('en-GB', { month: 'short' }));
    }
    var convChart = new window.Chart(convCanvas, {
      type: 'bar',
      data: { labels: months, datasets: [{ label: 'Conversions', data: CONV.registration.series,
        backgroundColor: ccs.getPropertyValue('--ai-surface-brand').trim(), borderRadius: 2, maxBarThickness: 12 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, border: { display: false } },
                  y: { beginAtZero: true, ticks: { precision: 0 }, border: { display: false } } },
      },
    });
    document.addEventListener('seg-control:change', function (e) {
      if (!e.target.closest('[data-conv-switch]')) return;
      var c = CONV[e.detail.value];
      if (!c) return;
      ['total', 'per_day', 'rate'].forEach(function (k) {
        var v = document.querySelector('[data-conv-stat="' + k + '"] .stat-card__value');
        if (v) v.textContent = c[k];
      });
      convChart.data.datasets[0].data = c.series;
      convChart.update();
    });
  }

  /* ── Add a step chooser (designer, 2026-09-30; code-first) ──
   * + Add opens a small modal of two ActionCards. Escape, the ×, or a click on the backdrop
   * closes it and focus returns to + Add. `?form=exists` is the demo state for the legacy
   * one-Dynamic-Form-Step-per-article rule: that card becomes unavailable and says why. */
  var openModal = null, opener = null;
  function closeModal() {
    if (!openModal) return;
    openModal.classList.remove('modal-overlay--open');
    openModal = null;
    if (opener) opener.focus();
  }
  function showModal(ov, from) {
    opener = from; openModal = ov;
    ov.classList.add('modal-overlay--open');
    // A destructive confirm lands on Cancel, so Enter never deletes by accident.
    var first = ov.querySelector('.action-card:not(.action-card--disabled)') || ov.querySelector('[data-modal-cancel]') || ov.querySelector('.modal__close');
    if (first) first.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-record-modal-open]');
    if (t) {
      var ov = document.getElementById(t.getAttribute('data-record-modal-open'));
      if (ov) showModal(ov, t);
      return;
    }
    if (openModal && (e.target === openModal || e.target.closest('.modal__close, [data-modal-cancel]'))) closeModal();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ── Edit states the design doesn't draw (code-first, 2026-10-05; Hub TASK-531782 Q3) ──
   * Demo switches on ArticleEdit: ?state=duplicates — Save opens the duplicates check;
   * ?state=sector — the Recruitment Brief sector chooser opens on load. ArticleEditErrors.html is a
   * failed Save: focus moves to the summary so it is announced and is the next thing read. */
  var demoState = (location.search.match(/[?&]state=([a-z]+)/) || [])[1];
  document.addEventListener('DOMContentLoaded', function () {
    var summary = document.querySelector('[data-validation-summary]');
    if (summary) summary.focus();
    if (demoState === 'sector') {
      var sec = document.getElementById('modal-sector');
      if (sec) showModal(sec, null);
    }
  });
  if (demoState === 'duplicates') document.addEventListener('click', function (e) {
    var save = e.target.closest('.cc-header [aria-label="Save"]');
    var dup = document.getElementById('modal-duplicates');
    if (save && dup) { e.preventDefault(); showModal(dup, save); }
  });

  // The modals sit after the scripts in the page, so wait for the whole document.
  if (/[?&]form=exists\b/.test(location.search)) document.addEventListener('DOMContentLoaded', function () {
    var formCard = document.querySelector('[data-step-type="form"]');
    if (formCard) {
      // A link cannot be disabled, so it becomes a plain box (ActionCard --disabled).
      var box = document.createElement('div');
      box.className = formCard.className + ' action-card--disabled';
      box.setAttribute('aria-disabled', 'true');
      box.setAttribute('data-step-type', 'form');
      box.innerHTML = formCard.innerHTML;
      box.querySelector('[data-step-desc]').textContent =
        'This article already has a Dynamic Form Step. An article can only have one at present.';
      formCard.replaceWith(box);
    }
  });

  /* ColorPickerInput in edit rows — the swatch and hex follow the native picker. */
  document.addEventListener('input', function (e) {
    var wrap = e.target.closest && e.target.closest('[data-color-input]');
    if (!wrap) return;
    wrap.querySelector('.color-picker-input__swatch-inner').style.backgroundColor = e.target.value;
    wrap.querySelector('.color-picker-input__value').textContent = e.target.value.toUpperCase();
  });
})();
