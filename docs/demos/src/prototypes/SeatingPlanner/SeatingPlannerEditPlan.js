/* Seating Planner — Edit plan popup (TASK-344754)
 *
 * Rename a plan / change its room, from the plan chip's edit (✎) action.
 * Second sub-task to plug into the workspace shell (TASK-344753) — same route
 * as the New plan popup, and again WITHOUT touching SeatingPlannerWorkspace.js:
 *
 *     SeatingPlannerWorkspace.on('plan-edit', openModal)
 *
 * The shell hands the handler the button that was clicked (ctx.trigger), which
 * is how the popup knows which plan to load — the shell doesn't need a concept
 * of "the plan being edited".
 *
 * TODO(backend:SeatingPlanner): saving is DOM-only. Real version PATCHes the
 * SeatingPlan record (name, room) and re-reads the plans row. Renaming must not
 * touch the plan's Tables or TableSeats.
 */
(function () {
  'use strict';

  var editing = null; /* the chip currently being edited */

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ------------------------------------------------------------ open / close */

  function openModal(ctx) {
    var overlay = one('[data-ep-overlay]');
    if (!overlay) return;

    /* Which plan? The shell passes the clicked control through. */
    editing = ctx && ctx.trigger ? ctx.trigger.closest('[data-sp-plan]') : null;
    if (!editing) editing = one('[data-sp-plan].sp-plan--active') || one('[data-sp-plan]');
    if (!editing) return;

    var nameField = one('[data-ep-name]');
    var roomField = one('[data-ep-room]');
    if (nameField) nameField.value = (one('.sp-plan__name', editing) || {}).textContent || '';
    if (roomField) roomField.value = editing.getAttribute('data-sp-plan-room') || '';

    clearErrors();
    overlay.classList.add('modal-overlay--open');
    if (nameField) { nameField.focus(); nameField.select(); }
  }

  function closeModal() {
    var overlay = one('[data-ep-overlay]');
    if (overlay) overlay.classList.remove('modal-overlay--open');
    editing = null;
  }

  /* ------------------------------------------------------------- validation */

  function setError(field, message) {
    var wrap = field.closest('.input');
    if (!wrap) return;
    wrap.classList.add('input--error');
    field.setAttribute('aria-invalid', 'true');
    var help = one('.input__help', wrap);
    if (help) {
      if (!help.hasAttribute('data-ep-help-original')) {
        help.setAttribute('data-ep-help-original', help.textContent);
      }
      help.textContent = message;
    }
  }

  function clearErrors() {
    all('[data-ep-modal] .input').forEach(function (wrap) {
      wrap.classList.remove('input--error');
      var control = one('.input__control', wrap);
      if (control) control.removeAttribute('aria-invalid');
      var help = one('.input__help', wrap);
      if (help && help.hasAttribute('data-ep-help-original')) {
        help.textContent = help.getAttribute('data-ep-help-original');
      }
    });
  }

  function validate() {
    clearErrors();
    var nameField = one('[data-ep-name]');
    if (nameField && !nameField.value.trim()) {
      setError(nameField, 'Plan name is required.');
      nameField.focus();
      return false;
    }
    return true;
  }

  /* ------------------------------------------------------------------- save */

  function save() {
    if (!editing) { closeModal(); return; }

    var name = one('[data-ep-name]').value.trim();
    var room = (one('[data-ep-room]') || {}).value.trim();

    /* the chip */
    var nameEl = one('.sp-plan__name', editing);
    if (nameEl) nameEl.textContent = name;
    editing.setAttribute('data-sp-plan-room', room);

    /* the label the toolbar reads, kept in the same shape the shell expects */
    var label = room ? name.toUpperCase() + ' — ' + room.toUpperCase() : name.toUpperCase();
    editing.setAttribute('data-sp-plan-label', label);

    /* action buttons name the plan in their aria-labels */
    all('[data-sp-action="plan-edit"], [data-sp-action="plan-delete"]', editing).forEach(function (b) {
      var verb = b.getAttribute('data-sp-action') === 'plan-edit' ? 'Edit ' : 'Delete ';
      b.setAttribute('aria-label', verb + name);
    });

    /* if it's the open plan, the toolbar title has to follow */
    if (editing.classList.contains('sp-plan--active')) {
      var title = one('[data-sp-plan-title]');
      if (title) {
        var tables = (title.textContent.match(/·\s*(\d+)\s*tables/) || [])[1];
        title.textContent = label + (tables ? ' · ' + tables + ' tables' : '');
      }
    }

    var toastName = name;
    closeModal();

    if (window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.toast) {
      window.SeatingPlannerWorkspace.toast('Plan saved — <strong>' + toastName + '</strong>' +
        (room ? ' · ' + room : '') + '.');
    }
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-ep-modal]')) return;

    /* THE integration point */
    if (window.SeatingPlannerWorkspace) {
      window.SeatingPlannerWorkspace.on('plan-edit', openModal);
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-ep-cancel]') || e.target.closest('[data-ep-close]')) {
        e.preventDefault(); closeModal(); return;
      }
      if (e.target.closest('[data-ep-save]')) {
        e.preventDefault();
        if (validate()) save();
        return;
      }
      var overlay = one('[data-ep-overlay]');
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
