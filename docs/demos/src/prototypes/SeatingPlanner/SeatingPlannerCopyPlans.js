/* Seating Planner — Copy plans (TASK-344756)
 *
 * Copies every plan in the current event into another event: tables,
 * capacities, types and sponsors kept, seated attendees cleared. Fourth
 * sub-task onto the workspace shell, same route, shell untouched:
 *
 *     SeatingPlannerWorkspace.on('copy-plans', openModal)
 *
 * Reuses the SHIPPED EventPicker component for the destination list
 * (src/cc/patterns/EventPicker — .event-picker__filters / __list / __event /
 * __empty) rather than inventing a second event-row
 * pattern — same rows, same predictive search behaviour.
 *
 * TODO(backend:SeatingPlanner): copying is DOM-only. Real version inserts cloned
 * SeatingPlan + Table rows under the target Event with TableSeat occupants left
 * EMPTY. Semantics are INSERT, not replace — a destination that already has
 * plans ends up with both sets, which is why each row shows its current plan
 * count. Clone in one transaction so a failure can't leave half a layout.
 */
(function () {
  'use strict';

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ------------------------------------------------------------------- copy */

  /* What is actually being copied — read off the page, never hardcoded */
  function survey() {
    var chips = all('[data-sp-plan]');
    var tables = 0;
    chips.forEach(function (chip) {
      var key = chip.getAttribute('data-sp-plan');
      var cards = all('[data-sp-table][data-sp-belongs="' + key + '"]');
      if (cards.length) { tables += cards.length; return; }
      var m = ((one('.sp-plan__stats', chip) || {}).textContent || '').match(/(\d+)\s*tables?/);
      if (m) tables += parseInt(m[1], 10);
    });
    return { plans: chips.length, tables: tables };
  }

  function sourceName() {
    return (one('.sp-eventbar__name') || {}).textContent || 'this event';
  }

  /* ------------------------------------------------------------ open / close */

  function openModal() {
    var overlay = one('[data-cp-overlay]');
    if (!overlay) return;

    var info = survey();
    var intro = one('[data-cp-intro]');
    if (intro) {
      if (!info.plans) {
        intro.textContent = 'This event has no seating plans to copy.';
      } else {
        intro.innerHTML = 'Copy all <strong>' + info.plans +
          (info.plans === 1 ? ' plan' : ' plans') + '</strong> from <strong>' +
          sourceName() + '</strong> to another event. Tables and capacities are kept; ' +
          'seated attendees are cleared. Choose the destination event:';
      }
    }

    /* Nothing to copy — don't offer a destination list */
    var body = one('[data-cp-body]');
    if (body) body.toggleAttribute('hidden', !info.plans);

    resetSearch();
    overlay.classList.add('modal-overlay--open');
    var search = one('[data-cp-search]');
    if (search) search.focus();
  }

  function closeModal() {
    var overlay = one('[data-cp-overlay]');
    if (overlay) overlay.classList.remove('modal-overlay--open');
  }

  /* -------------------------------------------------- predictive search */

  function resetSearch() {
    var search = one('[data-cp-search]');
    if (search) search.value = '';
    all('[data-cp-event]').forEach(function (r) { r.removeAttribute('hidden'); });
    var nores = one('[data-cp-nores]');
    if (nores) nores.setAttribute('hidden', '');
    updateCount();
  }

  function updateCount() {
    var el = one('[data-cp-count]');
    if (!el) return;
    var n = all('[data-cp-event]').filter(function (r) { return !r.hasAttribute('hidden'); }).length;
    el.textContent = n + (n === 1 ? ' event' : ' events');
  }

  function applySearch() {
    var search = one('[data-cp-search]');
    if (!search) return;
    var q = search.value.trim().toLowerCase();
    var shown = 0;

    all('[data-cp-event]').forEach(function (row) {
      var name = (row.getAttribute('data-name') || '').toLowerCase();
      var hit = !q || name.indexOf(q) !== -1;
      if (hit) { row.removeAttribute('hidden'); shown++; }
      else row.setAttribute('hidden', '');
    });

    var nores = one('[data-cp-nores]');
    var list = one('[data-cp-list]');
    if (nores) {
      nores.toggleAttribute('hidden', shown !== 0);
      var echo = one('[data-cp-nores-query]');
      if (echo) echo.textContent = search.value;
    }
    if (list) list.toggleAttribute('hidden', shown === 0);
    updateCount();
  }

  /* ----------------------------------------------------------- do the copy */

  function copyTo(row) {
    var info = survey();
    var name = row.getAttribute('data-name') || 'the event';

    /* The destination's plan count grows — INSERT semantics, not replace */
    var countEl = one('[data-cp-plans]', row);
    if (countEl) {
      var existing = parseInt(countEl.getAttribute('data-plans') || '0', 10);
      var next = existing + info.plans;
      countEl.setAttribute('data-plans', next);
      countEl.innerHTML = '<i data-lucide="layout-grid" aria-hidden="true"></i>' +
        next + (next === 1 ? ' plan' : ' plans');
      countEl.classList.remove('event-picker__plans--none');
    }

    closeModal();
    refreshIcons();

    if (window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.toast) {
      window.SeatingPlannerWorkspace.toast('Copied <strong>' + info.plans +
        (info.plans === 1 ? ' plan' : ' plans') + '</strong> · ' + info.tables +
        ' tables to <strong>' + name + '</strong> — seats left empty.');
    }
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-cp-modal]')) return;

    if (window.SeatingPlannerWorkspace) {
      window.SeatingPlannerWorkspace.on('copy-plans', openModal);
    }

    var search = one('[data-cp-search]');
    if (search) search.addEventListener('input', applySearch);

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cp-cancel]') || e.target.closest('[data-cp-close]')) {
        e.preventDefault(); closeModal(); return;
      }
      if (e.target.closest('[data-cp-clear]')) {
        e.preventDefault(); resetSearch();
        if (search) search.focus();
        return;
      }
      var row = e.target.closest('[data-cp-event]');
      if (row) { e.preventDefault(); copyTo(row); return; }

      var overlay = one('[data-cp-overlay]');
      if (overlay && e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    updateCount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
