/* EventPicker (CC) — interaction layer
 *
 * Figma Type axis maps to runtime states, not separate markup:
 *   Event Picker                -> no query, Live ticked
 *   Event Picker (search)       -> query typed, list filtered, matches highlighted
 *   Event Picker (no results)   -> query matches nothing, empty state shown
 *   Event Picker (all statuses) -> Live unticked, draft/archived rows revealed
 *
 * Wires: predictive search, the Live checkbox, event selection, clear-search
 * and close. Emits CustomEvents so the host app owns persistence and routing —
 * "remember the last-used event per user" is deliberately NOT done here.
 *
 *   event-picker:select  detail { id, name }  — an event row was chosen
 *   event-picker:close                        — Cancel or the close button
 *
 * TODO(backend:SeatingPlanner): rows are rendered from server data →
 *   GET /crm/events?status=live&q=<term>&sort=-startDate
 * TODO(backend:SeatingPlanner): last-used event is a per-user preference the
 *   host must persist → GET/PUT /users/me/prefs/seatingPlanner.lastEventId
 */
(function () {
  'use strict';

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Wraps the matched run of characters so the prediction is visible. */
  function renderName(nameEl, name, query) {
    var i = query ? name.toLowerCase().indexOf(query.toLowerCase()) : -1;
    if (i === -1) {
      nameEl.textContent = name;
      return;
    }
    nameEl.innerHTML =
      escapeHtml(name.slice(0, i)) +
      '<mark class="event-picker__mark">' +
      escapeHtml(name.slice(i, i + query.length)) +
      '</mark>' +
      escapeHtml(name.slice(i + query.length));
  }

  function initPicker(root) {
    if (root.__eventPicker) return;
    root.__eventPicker = true;

    var input = root.querySelector('[data-ep-search]');
    var live = root.querySelector('[data-ep-live]');
    var list = root.querySelector('[data-ep-list]');
    var empty = root.querySelector('[data-ep-empty]');
    var emptyQuery = root.querySelector('[data-ep-empty-query]');
    var count = root.querySelector('[data-ep-count]');
    var rows = Array.prototype.slice.call(root.querySelectorAll('[data-ep-event]'));

    function apply() {
      var q = input ? input.value.trim() : '';
      var liveOnly = live ? live.checked : false;
      var visible = 0;

      rows.forEach(function (row) {
        var name = row.getAttribute('data-name') || '';
        var isLive = row.getAttribute('data-status') === 'live';
        var matches = !q || name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        var show = matches && (!liveOnly || isLive);

        row.hidden = !show;
        if (show) visible++;

        var nameEl = row.querySelector('.event-picker__event-name');
        if (nameEl) renderName(nameEl, name, q);
      });

      /* A group heading disappears with its last visible row. */
      root.querySelectorAll('[data-ep-group]').forEach(function (group) {
        var key = group.getAttribute('data-ep-group');
        var members = rows.filter(function (row) {
          return row.getAttribute('data-group') === key;
        });
        group.hidden = !members.some(function (row) {
          return !row.hidden;
        });
      });

      if (list) list.hidden = visible === 0;
      if (empty) empty.hidden = visible !== 0;
      if (emptyQuery) emptyQuery.textContent = q;

      if (count) {
        count.textContent =
          visible + (visible === 1 ? ' event' : ' events') +
          (liveOnly ? ' · live only' : ' · all statuses');
      }
    }

    if (input) input.addEventListener('input', apply);
    if (live) live.addEventListener('change', apply);

    root.querySelectorAll('[data-ep-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (input) {
          input.value = '';
          apply();
          input.focus();
        }
      });
    });

    rows.forEach(function (row) {
      row.addEventListener('click', function () {
        root.dispatchEvent(new CustomEvent('event-picker:select', {
          bubbles: true,
          detail: {
            id: row.getAttribute('data-id') || '',
            name: row.getAttribute('data-name') || ''
          }
        }));
      });
    });

    root.querySelectorAll('[data-ep-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.dispatchEvent(new CustomEvent('event-picker:close', { bubbles: true }));
      });
    });

    /* Esc closes, matching modal convention */
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        root.dispatchEvent(new CustomEvent('event-picker:close', { bubbles: true }));
      }
    });

    apply();
  }

  function initEventPickers(scope) {
    (scope || document).querySelectorAll('[data-event-picker]').forEach(initPicker);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initEventPickers(); });
  } else {
    initEventPickers();
  }

  window.initEventPickers = initEventPickers;
})();
