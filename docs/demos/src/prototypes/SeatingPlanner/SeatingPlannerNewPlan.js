/* Seating Planner — New plan popup (TASK-342306)
 *
 * The first sub-task to plug into the workspace shell (TASK-344753). It does
 * NOT touch SeatingPlannerWorkspace.js — it registers a handler on the
 * published extension point and the "New plan" button becomes live:
 *
 *     SeatingPlannerWorkspace.on('new-plan', openModal)
 *
 * That is the whole integration contract. Load this file after the shell and
 * the deferred-control toast is replaced by the real popup.
 *
 * What it does: validates the two required fields, then creates the plan chip
 * and generates its tables — the brief's "creates a plan in the selected event
 * and generates its tables".
 *
 * TODO(backend:SeatingPlanner): creation is DOM-only. Real version POSTs a new
 * SeatingPlan (FK to the selected Event) and generates Table + TableSeat rows
 * server-side, then re-reads the plans row. Seats-per-table is bounded 6–12.
 */
(function () {
  'use strict';

  var SEATS_MIN = 6;
  var SEATS_MAX = 12;

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ------------------------------------------------------------ open / close */

  function openModal() {
    var overlay = one('[data-np-overlay]');
    if (!overlay) return;
    overlay.classList.add('modal-overlay--open');
    clearErrors();
    var first = one('[data-np-name]');
    if (first) first.focus();
  }

  function closeModal() {
    var overlay = one('[data-np-overlay]');
    if (!overlay) return;
    overlay.classList.remove('modal-overlay--open');
  }

  /* ------------------------------------------------------------- validation */

  function setError(field, message) {
    var wrap = field.closest('.input');
    if (!wrap) return;
    wrap.classList.add('input--error');
    field.setAttribute('aria-invalid', 'true');
    var help = one('.input__help', wrap);
    if (help) {
      if (!help.hasAttribute('data-np-help-original')) {
        help.setAttribute('data-np-help-original', help.textContent);
      }
      help.textContent = message;
    }
  }

  function clearErrors() {
    all('[data-np-modal] .input').forEach(function (wrap) {
      wrap.classList.remove('input--error');
      var control = one('.input__control', wrap);
      if (control) control.removeAttribute('aria-invalid');
      var help = one('.input__help', wrap);
      if (help && help.hasAttribute('data-np-help-original')) {
        help.textContent = help.getAttribute('data-np-help-original');
      }
    });
  }

  function validate() {
    clearErrors();
    var ok = true;

    var name = one('[data-np-name]');
    if (name && !name.value.trim()) {
      setError(name, 'Plan name is required.');
      ok = false;
    }

    var tables = one('[data-np-tables]');
    var n = tables ? parseInt(tables.value, 10) : NaN;
    if (!tables || !tables.value.trim()) {
      setError(tables, 'Number of tables is required.');
      ok = false;
    } else if (isNaN(n) || n < 1) {
      setError(tables, 'Enter at least 1 table.');
      ok = false;
    }

    /* Seats is optional but bounded when supplied */
    var seats = one('[data-np-seats]');
    if (seats && seats.value.trim()) {
      var s = parseInt(seats.value, 10);
      if (isNaN(s) || s < SEATS_MIN || s > SEATS_MAX) {
        setError(seats, 'Seats per table must be between ' + SEATS_MIN + ' and ' + SEATS_MAX + '.');
        ok = false;
      }
    }

    if (!ok) {
      var firstBad = one('[data-np-modal] .input--error .input__control');
      if (firstBad) firstBad.focus();
    }
    return ok;
  }

  /* --------------------------------------------------- create plan + tables */

  function tableCardHtml(planKey, n, seats) {
    var dots = '';
    for (var i = 0; i < seats; i++) dots += '<span class="sp-dot sp-dot--empty"></span>';
    var name = 'Table ' + n;
    return '<div class="sp-table" data-sp-table role="button" tabindex="0" aria-pressed="false"' +
      ' data-sp-belongs="' + planKey + '" data-sp-name="' + name + '" data-sp-seed="' + (n * 5 % 24) + '">' +
      '<div class="sp-table__head">' +
      '<p class="sp-table__name">' + name + '</p>' +
      '<span class="badge badge--neutral badge--sm" data-sp-fill>Empty</span>' +
      '</div>' +
      '<div class="sp-table__foot">' +
      '<p class="sp-table__count" data-sp-count>0 / ' + seats + ' seated</p>' +
      '<button class="sp-iconbtn" type="button" aria-label="Edit ' + name + '" data-sp-action="table-edit" data-sp-task="TASK-342307"><i data-lucide="pencil" aria-hidden="true"></i></button>' +
      '<button class="sp-iconbtn sp-iconbtn--danger" type="button" aria-label="Delete ' + name + '" data-sp-action="table-delete" data-sp-task="TASK-344758"><i data-lucide="x" aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="sp-table__dots" aria-hidden="true">' + dots + '</div>' +
      '</div>';
  }

  function createPlan() {
    var name = one('[data-np-name]').value.trim();
    var room = (one('[data-np-room]') || {}).value || '';
    var tables = parseInt(one('[data-np-tables]').value, 10);
    var seatsRaw = (one('[data-np-seats]') || {}).value;
    var seats = parseInt(seatsRaw, 10);
    if (isNaN(seats)) seats = 10; /* documented default */
    var shape = (one('[data-np-shape-value]') || {}).textContent || 'Round';

    var key = 'plan-' + Date.now();
    var capacity = tables * seats;
    var label = (room.trim() ? name.toUpperCase() + ' — ' + room.trim().toUpperCase() : name.toUpperCase());

    /* 1 · the plan chip */
    var row = one('[data-sp-plans-row]');
    if (row) {
      var none = one('.sp-plans__none', row);
      if (none) none.remove();
      var chip = document.createElement('div');
      chip.className = 'sp-plan';
      chip.setAttribute('data-sp-plan', key);
      chip.setAttribute('data-sp-plan-label', label);
      chip.setAttribute('data-sp-plan-room', room.trim());
      /* The plan's default seat count — Add table (TASK-344757) reads this */
      chip.setAttribute('data-sp-plan-seats', seats);
      chip.setAttribute('role', 'button');
      chip.setAttribute('tabindex', '0');
      chip.setAttribute('aria-pressed', 'false');
      chip.innerHTML =
        '<div class="sp-plan__head">' +
        '<p class="sp-plan__name">' + name + '</p>' +
        '<button class="sp-iconbtn" type="button" aria-label="Edit ' + name + '" data-sp-action="plan-edit" data-sp-task="TASK-344754"><i data-lucide="pencil" aria-hidden="true"></i></button>' +
        '<button class="sp-iconbtn sp-iconbtn--danger" type="button" aria-label="Delete ' + name + '" data-sp-action="plan-delete" data-sp-task="TASK-344755"><i data-lucide="x" aria-hidden="true"></i></button>' +
        '</div>' +
        '<p class="sp-plan__stats">' + tables + ' tables · 0/' + capacity + ' seated · ' + capacity + ' free</p>' +
        '<span class="sp-seated__track"><span class="sp-seated__fill" style="--sp-seated-pct: 0%"></span></span>';
      var addBtn = one('[data-sp-action="new-plan"]', row);
      row.insertBefore(chip, addBtn);
    }

    /* 2 · generate its tables */
    var grid = one('[data-sp-grid]');
    if (grid) {
      var html = '';
      for (var i = 1; i <= tables; i++) html += tableCardHtml(key, i, seats);
      grid.insertAdjacentHTML('beforeend', html);
    }

    /* 3 · on the "no plans yet" screen the workspace itself is still hidden */
    var reveal = one('[data-np-reveal]');
    if (reveal) reveal.removeAttribute('hidden');
    var placeholder = one('[data-np-placeholder]');
    if (placeholder) placeholder.remove();

    /* 4 · open the new plan — the shell owns selection, so hand back to it */
    closeModal();
    refreshIcons();
    var newChip = one('[data-sp-plan="' + key + '"]');
    if (newChip) newChip.click();

    if (window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.toast) {
      window.SeatingPlannerWorkspace.toast(
        '<strong>' + name + '</strong> created · ' + tables + ' tables × ' + seats +
        ' seats (' + shape.toLowerCase() + ').');
    }
  }

  /* ------------------------------------------------------------------ wiring */

  function init() {
    if (!one('[data-np-modal]')) return; /* page has no New plan popup */

    /* THE integration point — replaces the shell's deferred-control toast */
    if (window.SeatingPlannerWorkspace) {
      window.SeatingPlannerWorkspace.on('new-plan', openModal);
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-np-cancel]') || e.target.closest('[data-np-close]')) {
        e.preventDefault(); closeModal(); return;
      }
      if (e.target.closest('[data-np-create]')) {
        e.preventDefault();
        if (validate()) createPlan();
        return;
      }
      /* click the backdrop to dismiss */
      var overlay = one('[data-np-overlay]');
      if (overlay && e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
