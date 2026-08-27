/* Seating Planner — Table types lookup (TASK-342308)
 *
 * Eighth sub-task onto the workspace shell. Makes the tier list configurable so
 * tiers and their colours stop being hard-coded:
 *
 *     SeatingPlannerWorkspace.on('tier-colours', openModal)
 *
 * THIS TASK RESOLVES THE TIER TOKEN GAP flagged in 344753 and 342307. Colours
 * come from a picker, so they are CLIENT DATA, not design-system tokens — the DS
 * needs no metallic Gold/Silver/Bronze. Every table card now takes its edge from
 * the configured value via --sp-tier-colour.
 *
 * Two rules the reference adds that the brief doesn't state:
 *   · Standard cannot be removed — it's the fallback, so it shows "default"
 *     rather than a dead Remove control.
 *   · Removing a tier falls its tables back to Standard, rather than orphaning
 *     them on a tier that no longer exists.
 *
 * Sort order: the brief asks for a number field, the reference shows an ordered
 * list with no number. Implemented as row order with up/down controls — the same
 * affordance the seat list already uses — and persisted as sortOrder. The number
 * is the data; the list is the interface.
 *
 * TODO(backend:SeatingPlanner): DOM-only. Real version is a TableType lookup
 * table (label, colour, sortOrder). Table.Type is an FK to it, so a delete must
 * either repoint dependent Tables at Standard or be blocked — never left
 * dangling. Renaming a tier must NOT change its identity.
 */
(function () {
  'use strict';

  var STANDARD = 'Standard';

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  /* --------------------------------------------------------- read the lookup */

  /* The rows ARE the model: label + colour + row order = sortOrder */
  function types() {
    return all('[data-tt-row]').map(function (row, i) {
      return {
        label: (one('[data-tt-label]', row) || {}).value || '',
        colour: (one('[data-tt-colour]', row) || {}).value || '#000000',
        sortOrder: i,
        row: row
      };
    });
  }

  function colourFor(label) {
    var hit = types().filter(function (t) { return t.label === label; })[0];
    return hit ? hit.colour : null;
  }

  /* ------------------------------------------------- push changes outward */

  /* Every card carrying a tier takes its edge from the configured colour. A
     card whose tier no longer exists falls back to Standard. */
  function applyToCards() {
    var known = {};
    types().forEach(function (t) { known[t.label] = t.colour; });

    all('[data-sp-table]').forEach(function (card) {
      var tier = card.getAttribute('data-sp-tier');
      if (!tier) { card.style.removeProperty('--sp-tier-colour'); return; }

      if (!(tier in known)) {
        /* tier was removed — fall back to Standard, as the dialog promises */
        card.removeAttribute('data-sp-tier');
        card.style.removeProperty('--sp-tier-colour');
        var labelEl = one('.sp-table__tier', card);
        if (labelEl) labelEl.remove();
        return;
      }
      card.style.setProperty('--sp-tier-colour', known[tier]);
    });
  }

  /* Keep the Table form's tier dropdown in step with the lookup */
  function applyToDropdown() {
    var menu = one('[data-tf-modal] .sel__menu');
    if (!menu) return;
    var current = (one('[data-tf-tier-value]') || {}).textContent || STANDARD;
    var list = types();
    var stillThere = list.some(function (t) { return t.label === current; });
    if (!stillThere) current = STANDARD;

    menu.innerHTML = list.map(function (t) {
      var on = t.label === current;
      return '<li><button type="button" class="sel__menu-item' +
        (on ? ' sel__menu-item--selected' : '') + '" role="option" aria-selected="' +
        (on ? 'true' : 'false') + '" data-tf-tier="' + t.label + '">' + t.label +
        (on ? ' <i data-lucide="check"></i>' : '') + '</button></li>';
    }).join('');

    var value = one('[data-tf-tier-value]');
    if (value) value.textContent = current;
    refreshIcons();
  }

  function sync() {
    applyToCards();
    applyToDropdown();
    if (window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.refresh) {
      window.SeatingPlannerWorkspace.refresh();
    }
  }

  /* ------------------------------------------------------------------ rows */

  function rowHtml(label, colour, removable) {
    return '<div class="sp-types__row" data-tt-row>' +
      '<label class="sp-types__swatch" aria-label="Colour for ' + label + '">' +
      '<input type="color" value="' + colour + '" data-tt-colour>' +
      '</label>' +
      '<div class="input"><div class="input__wrap">' +
      '<input class="input__control" type="text" value="' + label + '"' +
      ' aria-label="Tier name" data-tt-label></div></div>' +
      '<span class="sp-types__reorder">' +
      '<button class="sp-iconbtn" type="button" data-tt-move="up" aria-label="Move up">' +
      '<i data-lucide="chevron-up" aria-hidden="true"></i></button>' +
      '<button class="sp-iconbtn" type="button" data-tt-move="down" aria-label="Move down">' +
      '<i data-lucide="chevron-down" aria-hidden="true"></i></button>' +
      '</span>' +
      (removable
        ? '<button class="btn btn--secondary btn--xs" type="button" data-tt-remove>' +
          '<i data-lucide="x" aria-hidden="true"></i>Remove</button>'
        : '<span class="sp-types__default">default</span>') +
      '</div>';
  }

  function addType() {
    var nameField = one('[data-tt-new-name]');
    var colourField = one('[data-tt-new-colour]');
    if (!nameField) return;

    var label = nameField.value.trim();
    if (!label) { nameField.focus(); return; }

    /* Don't let a duplicate label in — two tiers with one name is ambiguous
       everywhere downstream (the card label, the dropdown, the export). */
    var clash = types().some(function (t) {
      return t.label.toLowerCase() === label.toLowerCase();
    });
    if (clash) {
      if (window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.toast) {
        window.SeatingPlannerWorkspace.toast('A tier called <strong>' + label +
          '</strong> already exists.');
      }
      nameField.focus();
      return;
    }

    one('[data-tt-list]').insertAdjacentHTML('beforeend',
      rowHtml(label, colourField ? colourField.value : '#3b6fe0', true));
    var added = all('[data-tt-row]').pop();
    if (added) added.setAttribute('data-tt-prev', label);
    nameField.value = '';
    refreshIcons();
    sync();

    if (window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.toast) {
      window.SeatingPlannerWorkspace.toast('Tier <strong>' + label + '</strong> added.');
    }
  }

  function removeType(row) {
    var label = (one('[data-tt-label]', row) || {}).value || '';
    if (label === STANDARD) return; /* the fallback can't be removed */

    var affected = all('[data-sp-table]').filter(function (c) {
      return c.getAttribute('data-sp-tier') === label;
    }).length;

    row.remove();
    sync(); /* applyToCards drops affected tables back to Standard */

    if (window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.toast) {
      window.SeatingPlannerWorkspace.toast('Tier <strong>' + label + '</strong> removed' +
        (affected ? ' · ' + affected + (affected === 1 ? ' table' : ' tables') +
         ' fell back to Standard' : '') + '.');
    }
  }

  /* Carry a rename across every table on that tier — the prototype keys cards
     on the label, the real model keys them on a TableType id. */
  function renameTier(from, to) {
    all('[data-sp-table]').forEach(function (card) {
      if (card.getAttribute('data-sp-tier') !== from) return;
      card.setAttribute('data-sp-tier', to);
      var labelEl = one('.sp-table__tier', card);
      if (labelEl) labelEl.textContent = to;
    });
  }

  /* ------------------------------------------------------------ open / close */

  function openModal() {
    var overlay = one('[data-tt-overlay]');
    if (!overlay) return;
    overlay.classList.add('modal-overlay--open');
    var first = one('[data-tt-label]');
    if (first) first.focus();
  }

  function closeModal() {
    var overlay = one('[data-tt-overlay]');
    if (overlay) overlay.classList.remove('modal-overlay--open');
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-tt-modal]')) return;

    if (window.SeatingPlannerWorkspace) {
      window.SeatingPlannerWorkspace.on('tier-colours', openModal);
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-tt-close]') || e.target.closest('[data-tt-done]')) {
        e.preventDefault(); closeModal(); return;
      }
      if (e.target.closest('[data-tt-add]')) { e.preventDefault(); addType(); return; }

      var rm = e.target.closest('[data-tt-remove]');
      if (rm) { e.preventDefault(); removeType(rm.closest('[data-tt-row]')); return; }

      var mv = e.target.closest('[data-tt-move]');
      if (mv) {
        e.preventDefault();
        var row = mv.closest('[data-tt-row]');
        var dir = mv.getAttribute('data-tt-move');
        if (dir === 'up' && row.previousElementSibling) {
          row.parentNode.insertBefore(row, row.previousElementSibling);
        } else if (dir === 'down' && row.nextElementSibling) {
          row.parentNode.insertBefore(row.nextElementSibling, row);
        }
        sync(); /* row order IS sortOrder */
        return;
      }

      var overlay = one('[data-tt-overlay]');
      if (overlay && e.target === overlay) closeModal();
    });

    /* Recolour live */
    document.addEventListener('input', function (e) {
      if (e.target.closest('[data-tt-colour]')) { sync(); return; }

      /* Rename: a tier's IDENTITY must survive it. The real model has Table.Type
         as an FK, so a rename is invisible to the tables; here cards carry the
         label, so the rename has to be migrated across them — otherwise every
         table on that tier would silently fall back to Standard. */
      var labelField = e.target.closest('[data-tt-label]');
      if (!labelField) return;

      var row = labelField.closest('[data-tt-row]');
      var prev = row.getAttribute('data-tt-prev');
      var next = labelField.value.trim();
      if (prev && next && prev !== next) renameTier(prev, next);
      row.setAttribute('data-tt-prev', next);
      sync();
    });

    /* Remember each row's starting label so a rename can be migrated */
    all('[data-tt-row]').forEach(function (row) {
      var f = one('[data-tt-label]', row);
      row.setAttribute('data-tt-prev', f ? f.value.trim() : '');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Enter' && e.target.closest('[data-tt-new-name]')) {
        e.preventDefault(); addType();
      }
    });

    /* Colours are data — paint the plan from the lookup on load */
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
