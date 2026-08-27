/* Seating Planner — Delete plan (TASK-344755)
 *
 * Confirmation dialog on a plan chip's ✕. Third sub-task onto the workspace
 * shell, same route, again without touching SeatingPlannerWorkspace.js:
 *
 *     SeatingPlannerWorkspace.on('plan-delete', openModal)
 *
 * The dialog copy is DATA-DRIVEN, not hardcoded: it counts the plan's tables
 * and its seated occupants off the DOM, so the numbers are always true. On a
 * screen with no grid it falls back to parsing the chip's
 * own stats line.
 *
 * TODO(backend:SeatingPlanner): deletion is DOM-only. Real version deletes the
 * SeatingPlan plus its Table and TableSeat rows in one transaction and returns
 * the occupants to the event pool — a partial failure must not leave people
 * unassigned from a plan that still exists.
 */
(function () {
  'use strict';

  var target = null; /* chip being deleted */

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function roleOf(dot) {
    var m = (dot.className || '').match(/sp-dot--(attendee|sponsor|vip|speaker|host|guest)/);
    return m ? m[1] : null;
  }

  /* --------------------------------------------------------- what's at stake */

  function surveyPlan(chip) {
    var key = chip.getAttribute('data-sp-plan');
    var cards = all('[data-sp-table][data-sp-belongs="' + key + '"]');

    if (cards.length) {
      var seated = 0;
      cards.forEach(function (card) {
        seated += all('.sp-dot', card).filter(roleOf).length;
      });
      return { tables: cards.length, seated: seated, cards: cards };
    }

    /* No grid on this screen — read the chip's own stats line instead */
    var stats = (one('.sp-plan__stats', chip) || {}).textContent || '';
    var t = stats.match(/(\d+)\s*tables?/);
    var s = stats.match(/(\d+)\s*\/\s*\d+\s*seated/);
    return {
      tables: t ? parseInt(t[1], 10) : 0,
      seated: s ? parseInt(s[1], 10) : 0,
      cards: []
    };
  }

  /* ------------------------------------------------------------ open / close */

  function openModal(ctx) {
    var overlay = one('[data-dp-overlay]');
    if (!overlay) return;

    target = ctx && ctx.trigger ? ctx.trigger.closest('[data-sp-plan]') : null;
    if (!target) return;

    var name = (one('.sp-plan__name', target) || {}).textContent || 'this plan';
    var info = surveyPlan(target);

    var body = one('[data-dp-copy]');
    if (body) {
      body.innerHTML = 'Are you sure you wish to delete the seating plan <strong>' +
        name + '</strong>?';
    }
    var detail = one('[data-dp-detail]');
    if (detail) {
      /* The people clause only earns its place when there are people */
      detail.textContent = 'Its ' + info.tables + (info.tables === 1 ? ' table' : ' tables') +
        ' will be removed' +
        (info.seated
          ? ' and ' + info.seated + (info.seated === 1 ? ' seated person' : ' seated people') +
            ' returned to Unassigned.'
          : '. Nobody is seated on this plan.');
    }

    overlay.classList.add('modal-overlay--open');
    var confirm = one('[data-dp-confirm]');
    if (confirm) confirm.focus();
  }

  function closeModal() {
    var overlay = one('[data-dp-overlay]');
    if (overlay) overlay.classList.remove('modal-overlay--open');
    target = null;
  }

  /* --------------------------------------------------- return people to tray */

  /* Every returned person is injected — no preview cap. The shell's own
     updateTrayCount() counts DOM rows, so a capped list would make the badge
     and the list disagree (it did: 46 returned, badge said 19). The DOM is the
     single source of truth for the count.

     People are labelled by where they were sitting rather than given invented
     names: it's honest prototype data and it happens to be the useful fact —
     you can see who came off which table. */
  function returnPeopleToTray(cards) {
    var list = one('[data-sp-tray-list]');
    if (!list) return 0;

    var html = '';
    var count = 0;
    cards.forEach(function (card) {
      var table = card.getAttribute('data-sp-name') || 'Table';
      all('.sp-dot', card).forEach(function (dot, i) {
        var role = roleOf(dot);
        if (!role) return;
        count++;
        html += '<div class="sp-person" data-sp-person draggable="true">' +
          '<span class="sp-role sp-role--' + role + '">' +
          role.charAt(0).toUpperCase() + role.slice(1) + '</span>' +
          '<p class="sp-person__name">' + table + ' · seat ' + (i + 1) + '</p>' +
          '<span class="sp-person__org">returned</span></div>';
      });
    });

    if (html) list.insertAdjacentHTML('afterbegin', html);
    return count;
  }

  /* ----------------------------------------------------------------- delete */

  function doDelete() {
    if (!target) { closeModal(); return; }

    var name = (one('.sp-plan__name', target) || {}).textContent || 'Plan';
    var wasActive = target.classList.contains('sp-plan--active');
    var info = surveyPlan(target);

    var returned = returnPeopleToTray(info.cards);
    info.cards.forEach(function (c) { c.remove(); });
    target.remove();

    var remaining = all('[data-sp-plan]');
    closeModal();

    if (wasActive) {
      if (remaining.length) {
        /* Deleting the open plan shouldn't leave an empty workspace — open the
           next one so the tray (where the people just went) stays visible. */
        remaining[0].click();
      } else {
        /* The only place the workspace was addressed by CLASS NAME, which made
           it the one hard layout dependency in the codebase. Now hook-based, so
           a layout is free to call its pane row whatever it likes, and a LIST so
           a layout with more than one top-level region can hide all of them.
           `.sp-ws__cols` is kept because the sub-task capture states still use it —
           they were cut from the old fallback markup, which named the region by
           class. The adopted workspace uses the hook. */
        all('[data-sp-workspace], .sp-ws__cols').forEach(function (region) {
          region.setAttribute('hidden', '');
        });
        var row = one('[data-sp-plans-row]');
        if (row && !one('.sp-plans__none', row)) {
          var hint = document.createElement('p');
          hint.className = 'sp-plans__none';
          hint.textContent = 'No plans yet — create one →';
          row.insertBefore(hint, one('[data-sp-action="new-plan"]', row));
        }
      }
    }

    if (window.SeatingPlannerWorkspace) {
      if (window.SeatingPlannerWorkspace.refresh) window.SeatingPlannerWorkspace.refresh();
      if (window.SeatingPlannerWorkspace.toast) {
        window.SeatingPlannerWorkspace.toast('<strong>' + name + '</strong> deleted' +
          (returned ? ' · ' + returned + ' people returned to Unassigned' : '') + '.');
      }
    }
    refreshIcons();
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-dp-modal]')) return;

    if (window.SeatingPlannerWorkspace) {
      window.SeatingPlannerWorkspace.on('plan-delete', openModal);
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-dp-cancel]') || e.target.closest('[data-dp-close]')) {
        e.preventDefault(); closeModal(); return;
      }
      if (e.target.closest('[data-dp-confirm]')) {
        e.preventDefault(); doDelete(); return;
      }
      var overlay = one('[data-dp-overlay]');
      if (overlay && e.target === overlay) closeModal();
    });

    /* Esc cancels — a destructive dialog must be trivially escapable */
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
