/* Seating Planner — Add table (TASK-344757)
 *
 * Toolbar button, no popup: adds one table to the open plan with the next table
 * number, the plan's default seat count, and every seat empty.
 *
 *     SeatingPlannerWorkspace.on('add-table', addTable)
 *
 * Two details the brief implies but is easy to get wrong:
 *
 *  · "next table number" is max(existing) + 1, NOT count + 1. After deleting
 *    Table 3 of 5, count+1 would produce a second Table 5.
 *  · the seat count comes from the PLAN's default (data-sp-plan-seats, set when
 *    the plan was created), not from whatever the last table happens to have —
 *    individual tables can have been changed.
 *
 * TODO(backend:SeatingPlanner): DOM-only. Real version inserts a Table plus its
 * empty TableSeat rows under the plan, assigning the next table number and sort
 * order server-side — computing either on the client races other editors.
 */
(function () {
  'use strict';

  var DEFAULT_SEATS = 10; /* documented fallback if the plan carries none */

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* Highest existing table number in this plan, so numbering can't collide
     with a table that was deleted from the middle. */
  function nextTableNumber(planKey) {
    var highest = 0;
    all('[data-sp-table][data-sp-belongs="' + planKey + '"]').forEach(function (card) {
      var m = ((card.getAttribute('data-sp-name') || '').match(/(\d+)\s*$/));
      if (m) highest = Math.max(highest, parseInt(m[1], 10));
    });
    return highest + 1;
  }

  function planDefaultSeats(chip) {
    var n = parseInt(chip.getAttribute('data-sp-plan-seats') || '', 10);
    return isNaN(n) ? DEFAULT_SEATS : n;
  }

  function cardHtml(planKey, number, seats) {
    var name = 'Table ' + number;
    var dots = '';
    for (var i = 0; i < seats; i++) dots += '<span class="sp-dot sp-dot--empty"></span>';

    return '<div class="sp-table" data-sp-table role="button" tabindex="0" aria-pressed="false"' +
      ' data-sp-belongs="' + planKey + '" data-sp-name="' + name + '"' +
      ' data-sp-seed="' + (number * 5 % 24) + '">' +
      '<div class="sp-table__head">' +
      '<p class="sp-table__name">' + name + '</p>' +
      '<span class="badge badge--neutral badge--sm" data-sp-fill>Empty</span>' +
      '</div>' +
      '<div class="sp-table__foot">' +
      '<p class="sp-table__count" data-sp-count>0 / ' + seats + ' seated</p>' +
      '<button class="sp-iconbtn" type="button" aria-label="Edit ' + name + '"' +
      ' data-sp-action="table-edit" data-sp-task="TASK-342307">' +
      '<i data-lucide="pencil" aria-hidden="true"></i></button>' +
      '<button class="sp-iconbtn sp-iconbtn--danger" type="button" aria-label="Delete ' + name + '"' +
      ' data-sp-action="table-delete" data-sp-task="TASK-344758">' +
      '<i data-lucide="x" aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="sp-table__dots" aria-hidden="true">' + dots + '</div>' +
      '</div>';
  }

  function addTable() {
    var chip = one('[data-sp-plan].sp-plan--active');
    var grid = one('[data-sp-grid]');

    if (!chip || !grid) {
      if (window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.toast) {
        window.SeatingPlannerWorkspace.toast('Open a seating plan first — a table belongs to a plan.');
      }
      return;
    }

    var planKey = chip.getAttribute('data-sp-plan');
    var number = nextTableNumber(planKey);
    var seats = planDefaultSeats(chip);

    /* Sort order: new tables go last */
    grid.insertAdjacentHTML('beforeend', cardHtml(planKey, number, seats));
    var card = all('[data-sp-table][data-sp-belongs="' + planKey + '"]').pop();
    refreshIcons();

    if (window.SeatingPlannerWorkspace) {
      /* Chip summary + toolbar count have to follow — the shell owns that */
      if (window.SeatingPlannerWorkspace.syncPlanChip) {
        window.SeatingPlannerWorkspace.syncPlanChip(planKey);
      }
      /* Open it, so its empty seat list (and the Assign actions) is right there */
      if (card && window.SeatingPlannerWorkspace.selectTable) {
        window.SeatingPlannerWorkspace.selectTable(card);
      }
      if (window.SeatingPlannerWorkspace.refresh) window.SeatingPlannerWorkspace.refresh();
      if (window.SeatingPlannerWorkspace.toast) {
        window.SeatingPlannerWorkspace.toast('<strong>Table ' + number + '</strong> added · ' +
          seats + ' empty seats.');
      }
    }

    if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function init() {
    if (!window.SeatingPlannerWorkspace) return;
    window.SeatingPlannerWorkspace.on('add-table', addTable);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
