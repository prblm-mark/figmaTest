/* Seating Planner — Delete table (TASK-344758)
 *
 * Seventh sub-task onto the workspace shell:
 *
 *     SeatingPlannerWorkspace.on('table-delete', openModal)
 *
 * Sibling of Delete plan (TASK-344755), one level down. Same dialog shape, same
 * data-driven copy discipline: the seated count is read off the card so it is
 * always true, and the "returned to Unassigned" line is dropped entirely when
 * nobody is sitting there.
 *
 * Deleting the OPEN table would leave the seat panel showing something that no
 * longer exists, so the next remaining table in the plan is selected; if the
 * plan is now empty the panel is cleared rather than left stale.
 *
 * TODO(backend:SeatingPlanner): DOM-only. Real version deletes the Table and its
 * TableSeat rows and returns occupants to the event pool in ONE transaction.
 * Table numbers are NOT resequenced after a delete — Add table takes max+1, so
 * gaps are expected and harmless.
 */
(function () {
  'use strict';

  var target = null;

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
  function roleOf(dot) {
    var m = (dot.className || '').match(/sp-dot--(attendee|sponsor|vip|speaker|host|guest)/);
    return m ? m[1] : null;
  }

  /* ------------------------------------------------------------ open / close */

  function openModal(ctx) {
    var overlay = one('[data-dt-overlay]');
    if (!overlay) return;

    target = ctx && ctx.trigger ? ctx.trigger.closest('[data-sp-table]') : null;
    if (!target) return;

    var name = target.getAttribute('data-sp-name') || 'this table';
    var seated = all('.sp-dot', target).filter(roleOf).length;

    var copy = one('[data-dt-copy]');
    if (copy) {
      copy.innerHTML = 'Are you sure you wish to delete <strong>' + name + '</strong>?';
    }
    var detail = one('[data-dt-detail]');
    if (detail) {
      if (seated) {
        detail.textContent = seated + (seated === 1 ? ' seated person' : ' seated people') +
          ' will be returned to the Unassigned pool.';
        detail.removeAttribute('hidden');
      } else {
        /* No one to displace — don't invent a consequence */
        detail.textContent = 'Nobody is seated at this table.';
        detail.removeAttribute('hidden');
      }
    }

    overlay.classList.add('modal-overlay--open');
    var confirm = one('[data-dt-confirm]');
    if (confirm) confirm.focus();
  }

  function closeModal() {
    var overlay = one('[data-dt-overlay]');
    if (overlay) overlay.classList.remove('modal-overlay--open');
    target = null;
  }

  /* ----------------------------------------------------------------- delete */

  function doDelete() {
    if (!target) { closeModal(); return; }

    var card = target;
    var name = card.getAttribute('data-sp-name') || 'Table';
    var planKey = card.getAttribute('data-sp-belongs');
    var wasSelected = card.classList.contains('sp-table--selected');

    /* occupants back to the pool, labelled by where they were sitting */
    var returned = 0;
    all('.sp-dot', card).forEach(function (dot, i) {
      var role = roleOf(dot);
      if (!role) return;
      returned++;
      if (window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.addToTray) {
        window.SeatingPlannerWorkspace.addToTray(role, name + ' · seat ' + (i + 1), 'returned');
      }
    });

    card.remove();
    closeModal();

    /* the seat panel must not keep showing a table that's gone */
    var siblings = all('[data-sp-table][data-sp-belongs="' + planKey + '"]')
      .filter(function (c) { return !c.hasAttribute('hidden'); });

    if (wasSelected) {
      if (siblings.length && window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.selectTable) {
        window.SeatingPlannerWorkspace.selectTable(siblings[0]);
      } else {
        var list = one('[data-sp-seatlist]');
        if (list) list.innerHTML = '';
        var title = one('[data-sp-seat-title]');
        if (title) title.textContent = 'No tables';
        var tierBadge = one('[data-sp-seat-tier]');
        if (tierBadge) tierBadge.setAttribute('hidden', '');
        var meta = one('[data-sp-seat-meta]');
        if (meta) meta.textContent = 'Add a table to start seating people.';
      }
    }

    if (window.SeatingPlannerWorkspace) {
      if (window.SeatingPlannerWorkspace.syncPlanChip) {
        window.SeatingPlannerWorkspace.syncPlanChip(planKey);
      }
      if (window.SeatingPlannerWorkspace.refresh) window.SeatingPlannerWorkspace.refresh();
      if (window.SeatingPlannerWorkspace.toast) {
        window.SeatingPlannerWorkspace.toast('<strong>' + name + '</strong> deleted' +
          (returned ? ' · ' + returned + (returned === 1 ? ' person' : ' people') +
           ' returned to Unassigned' : '') + '.');
      }
    }
    refreshIcons();
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-dt-modal]')) return;

    if (window.SeatingPlannerWorkspace) {
      window.SeatingPlannerWorkspace.on('table-delete', openModal);
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-dt-cancel]') || e.target.closest('[data-dt-close]')) {
        e.preventDefault(); closeModal(); return;
      }
      if (e.target.closest('[data-dt-confirm]')) { e.preventDefault(); doDelete(); return; }
      var overlay = one('[data-dt-overlay]');
      if (overlay && e.target === overlay) closeModal();
    });

    /* Esc cancels — destructive dialogs must be trivially escapable */
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
