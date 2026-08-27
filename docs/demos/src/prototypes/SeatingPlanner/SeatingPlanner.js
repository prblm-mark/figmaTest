/* Seating Planner prototype — Event Picker behaviour
 *
 * Wires: predictive search (live filter + match highlight), "Live events only"
 * checkbox, event selection, and the "Change event" re-entry path.
 *
 * TODO(backend:SeatingPlanner): every event in the listing is mock DOM data →
 *   GET /crm/events?status=live&q=<term>&sort=-startDate  (returns id, name,
 *   startDate, location, attendeeCount, planCount, seatsSeated, seatsTotal)
 * TODO(backend:SeatingPlanner): last-used event is kept in localStorage →
 *   should be a per-user preference: GET/PUT /users/me/prefs/seatingPlanner.lastEventId
 * TODO(backend:SeatingPlanner): search filters the already-loaded rows in the
 *   browser → predictive lookup should hit the server with debounce + paging
 */
(function () {
  'use strict';

  var LAST_USED_KEY = 'sp:lastEventId';

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Wraps the matched run of characters in <mark> so the prediction is visible. */
  function renderName(nameEl, name, query) {
    if (!query) {
      nameEl.textContent = name;
      return;
    }
    var i = name.toLowerCase().indexOf(query.toLowerCase());
    if (i === -1) {
      nameEl.textContent = name;
      return;
    }
    nameEl.innerHTML =
      escapeHtml(name.slice(0, i)) +
      '<mark class="event-picker__mark">' + escapeHtml(name.slice(i, i + query.length)) + '</mark>' +
      escapeHtml(name.slice(i + query.length));
  }

  function initPicker(picker) {
    var input = picker.querySelector('[data-sp-search]');
    var live = picker.querySelector('[data-sp-live]');
    var list = picker.querySelector('[data-sp-list]');
    var nores = picker.querySelector('[data-sp-nores]');
    var noresQuery = picker.querySelector('[data-sp-nores-query]');
    var count = picker.querySelector('[data-sp-count]');
    var rows = Array.prototype.slice.call(picker.querySelectorAll('[data-sp-event]'));

    function apply() {
      var q = input ? input.value.trim() : '';
      var liveOnly = live ? live.checked : false;
      var visible = 0;

      rows.forEach(function (row) {
        var name = row.getAttribute('data-name') || '';
        var isLive = row.getAttribute('data-status') === 'live';
        var match = !q || name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        var show = match && (!liveOnly || isLive);

        row.hidden = !show;
        if (show) visible++;

        var nameEl = row.querySelector('.event-picker__event-name');
        if (nameEl) renderName(nameEl, name, q);
      });

      /* A group heading disappears with its last visible row. */
      picker.querySelectorAll('[data-sp-group]').forEach(function (group) {
        var members = rows.filter(function (row) {
          return row.getAttribute('data-group') === group.getAttribute('data-sp-group');
        });
        group.hidden = !members.some(function (row) { return !row.hidden; });
      });

      if (nores) nores.hidden = visible !== 0;
      if (list) list.hidden = visible === 0;
      if (noresQuery) noresQuery.textContent = q;

      if (count) {
        count.textContent = visible + (visible === 1 ? ' event' : ' events') +
          (liveOnly ? ' · live only' : ' · all statuses');
      }
    }

    if (input) input.addEventListener('input', apply);
    if (live) live.addEventListener('change', apply);

    picker.querySelectorAll('[data-sp-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (input) input.value = '';
        apply();
        if (input) input.focus();
      });
    });

    /* Selecting an event: remember it, close the picker, show it on the page.
       The seating plans screen itself is a later spec screen. */
    rows.forEach(function (row) {
      row.addEventListener('click', function () {
        try { localStorage.setItem(LAST_USED_KEY, row.getAttribute('data-id') || ''); } catch (e) {}
        selectEvent(row.getAttribute('data-name') || '');
        closePicker();
      });
    });

    apply();
  }

  function overlay() { return document.querySelector('[data-sp-overlay]'); }

  function closePicker() {
    var o = overlay();
    if (o) o.classList.remove('modal-overlay--open');
  }

  function openPicker() {
    var o = overlay();
    if (!o) return;
    o.classList.add('modal-overlay--open');
    var input = o.querySelector('[data-sp-search]');
    if (input) input.focus();
  }

  function selectEvent(name) {
    var empty = document.querySelector('[data-sp-empty]');
    var selected = document.querySelector('[data-sp-selected]');
    var nameEl = document.querySelector('[data-sp-selected-name]');
    if (nameEl) nameEl.textContent = name;
    if (empty) empty.hidden = true;
    if (selected) selected.hidden = false;
  }

  function init() {
    document.querySelectorAll('[data-sp-picker]').forEach(initPicker);
    document.querySelectorAll('[data-sp-open]').forEach(function (btn) {
      btn.addEventListener('click', openPicker);
    });
    document.querySelectorAll('[data-sp-close]').forEach(function (btn) {
      btn.addEventListener('click', closePicker);
    });

    /* Esc closes, matching modal convention */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePicker();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
