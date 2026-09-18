/* FilterDropdowns — pattern-level glue.
 * Figma node 3039:5639. The interactive controls come from the composed child
 * components' own scripts (Checkbox = native, FilterDropdownItem.js = option
 * toggle, DatePicker.js = date popovers). This file only adds the two things the
 * pattern owns:
 *   1. live search-filtering of a checkbox list (Multi Select w/search)
 *   2. an Apply button that emits `filter-dropdowns:apply` for the consuming bar
 *
 * Auto-inits every [data-filter-dropdowns] on load.
 */
(function () {
  'use strict';

  /* This card's OWN element, not one belonging to a card nested inside it.
     `root.querySelector('[data-filter-dropdowns-apply]')` reaches straight
     through a nested picker: the Multi Select Table's sub-filters are
     `.filter-dropdowns` cards of their own, so the outer card bound its Apply
     to the FIRST apply button in the subtree — a sub-filter's. Clicking that
     then fired an apply for the outer card too, which committed an empty value
     and closed the whole picker.

     Every lookup here uses this. A pattern that can contain itself cannot use
     descendant queries. */
  function own(root, selector) {
    var found = root.querySelectorAll(selector);
    for (var i = 0; i < found.length; i++) {
      if (found[i].closest('[data-filter-dropdowns]') === root) return found[i];
    }
    return null;
  }

  function ownAll(root, selector) {
    return Array.prototype.filter.call(root.querySelectorAll(selector), function (el) {
      return el.closest('[data-filter-dropdowns]') === root;
    });
  }

  function labelText(row) {
    var el = row.querySelector('.checkbox__label-text, .filter-dropdown-item__name');
    return (el ? el.textContent : row.textContent).trim().toLowerCase();
  }

  function wireSearch(root) {
    var input = own(root, '[data-filter-dropdowns-search]');
    var list = own(root, '[data-filter-dropdowns-list]');
    if (!input || !list) return;
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      list.querySelectorAll('.checkbox, .filter-dropdown-item').forEach(function (row) {
        row.style.display = (!q || labelText(row).indexOf(q) !== -1) ? '' : 'none';
      });
    });
  }

  function wireSelect(root) {
    var trigger = own(root, '[data-select-trigger]');
    var menu = own(root, '[data-select-menu]');
    var valueEl = own(root, '[data-select-value]');
    if (!trigger || !menu) return;
    /* `data-placeholder` wins over the rendered text: a card can be rendered
       with a value already in the field (restoring a saved view), and reading
       the placeholder off the DOM would then adopt that VALUE as the
       placeholder — clearing the filter would put it straight back. */
    var placeholder = (valueEl && valueEl.dataset.placeholder)
      || (valueEl ? valueEl.textContent : 'Select');

    function open() { root.classList.add('filter-dropdowns--open'); menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); }
    function close() { root.classList.remove('filter-dropdowns--open'); menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); }
    function toggle() { if (menu.hidden) open(); else close(); }

    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      if (e.key === 'Escape') close();
    });

    function updateValue() {
      if (!valueEl) return;
      var names = [];
      menu.querySelectorAll('.filter-dropdown-item--selected .filter-dropdown-item__name').forEach(function (n) {
        names.push(n.textContent.trim());
      });
      if (!names.length) {
        valueEl.textContent = placeholder;
        valueEl.classList.add('filter-dropdowns__value--placeholder');
      } else {
        valueEl.textContent = names.length <= 2 ? names.join(', ') : (names[0] + ', +' + (names.length - 1) + ' more');
        valueEl.classList.remove('filter-dropdowns__value--placeholder');
      }
    }
    // Select Options are SINGLE-select: choosing one clears the others and closes.
    // (FilterDropdownItem.js stays multi-select for checkbox lists; we constrain it here.)
    menu.addEventListener('filter-dropdown-item:toggle', function (e) {
      if (e.detail && e.detail.selected) {
        menu.querySelectorAll('.filter-dropdown-item--selected').forEach(function (item) {
          if (item !== e.target) {
            item.classList.remove('filter-dropdown-item--selected');
            item.setAttribute('aria-pressed', 'false');
          }
        });
        updateValue();
        close();
      } else {
        updateValue();
      }
    });
    updateValue(); // reflect any server-rendered selection into the field

    /* Resetting the card is not just "drop the selections": the FIELD has to
       go back to its placeholder, which only this closure knows. */
    (root.__resets = root.__resets || []).push(function () { updateValue(); close(); });

    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
  }

  function wirePredictive(root) {
    var input = own(root, '[data-predictive-input]');
    var menu = own(root, '[data-select-menu]');
    if (!input || !menu) return;

    function open() { root.classList.add('filter-dropdowns--open'); menu.hidden = false; }
    function close() { root.classList.remove('filter-dropdowns--open'); menu.hidden = true; }

    function filter() {
      var q = input.value.trim().toLowerCase();
      menu.querySelectorAll('.filter-dropdown-item').forEach(function (item) {
        var n = item.querySelector('.filter-dropdown-item__name');
        var t = (n ? n.textContent : '').toLowerCase();
        item.style.display = (!q || t.indexOf(q) !== -1) ? '' : 'none';
      });
    }

    // Suggestions reveal as characters are typed; an empty query closes the menu.
    input.addEventListener('input', function () {
      if (input.value.trim()) { open(); filter(); } else { close(); }
    });

    // Single-select: picking a suggestion fills the input and closes
    menu.addEventListener('filter-dropdown-item:toggle', function (e) {
      if (e.detail && e.detail.selected) {
        menu.querySelectorAll('.filter-dropdown-item--selected').forEach(function (it) {
          if (it !== e.target) { it.classList.remove('filter-dropdown-item--selected'); it.setAttribute('aria-pressed', 'false'); }
        });
        var n = e.target.querySelector('.filter-dropdown-item__name');
        if (n) input.value = n.textContent.trim();
        close();
      }
    });

    (root.__resets = root.__resets || []).push(function () { input.value = ''; filter(); close(); });

    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
  }

  /* Select-all in a Multi Select Table header. Without this the header
     checkbox is decoration. */
  function wireSelectAll(root) {
    var all = own(root, '[data-select-all]');
    if (!all) return;
    var rows = function () { return ownAll(root, '[data-row-value]'); };

    all.addEventListener('change', function () {
      rows().forEach(function (c) { c.checked = all.checked; });
    });

    root.addEventListener('change', function (e) {
      if (!e.target.matches('[data-row-value]')) return;
      var list = Array.prototype.slice.call(rows());
      var on = list.filter(function (c) { return c.checked; }).length;
      all.checked = on === list.length;
      /* Some but not all — the header says "partly", not "none". */
      all.indeterminate = on > 0 && on < list.length;
    });
  }

  /* Drag the table sideways with a mouse.
     The picker keeps every column and overflows rather than dropping any, so
     at narrow widths there is always something off-screen. Touch and trackpads
     scroll an overflowing box already; a mouse does not, and a scrollbar under
     a list you are reading is easy to miss. */
  function wireDragScroll(root) {
    var scroller = own(root, '.datatables__body');
    if (!scroller) return;

    var down = false, moved = false, startX = 0, startLeft = 0;

    scroller.addEventListener('pointerdown', function (e) {
      /* Never hijack a control — the rows are full of checkboxes and links. */
      if (e.target.closest('input, button, a, label')) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = scroller.scrollLeft;
    });

    scroller.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      /* A few pixels of travel before it counts as a drag, so a click that
         wobbles is still a click. */
      if (!moved && Math.abs(dx) < 4) return;
      moved = true;
      scroller.classList.add('is-dragging');
      scroller.scrollLeft = startLeft - dx;
      e.preventDefault();
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) {
      scroller.addEventListener(type, function () {
        down = false;
        scroller.classList.remove('is-dragging');
      });
    });
  }

  function wireApply(root) {
    var apply = own(root, '[data-filter-dropdowns-apply]');
    if (!apply) return;
    apply.addEventListener('click', function () {
      root.dispatchEvent(new CustomEvent('filter-dropdowns:apply', { bubbles: true }));
    });
  }

  /* Put the card back to its unset state. Public, like FilterItem's
     setFilterValues — a consuming bar clears the chip and the card together,
     and only the card knows what "unset" looks like per type. */
  function wireReset(root) {
    root.resetFilterDropdown = function () {
      ownAll(root, '.filter-dropdown-item--selected').forEach(function (item) {
        item.classList.remove('filter-dropdown-item--selected');
        item.setAttribute('aria-pressed', 'false');
      });
      ownAll(root, '.checkbox__input:checked').forEach(function (c) { c.checked = false; });
      ownAll(root, '.input__control').forEach(function (f) { f.value = ''; });
      (root.__resets || []).forEach(function (fn) { fn(); });
    };
  }

  function initFilterDropdowns(scope) {
    (scope || document).querySelectorAll('[data-filter-dropdowns]').forEach(function (root) {
      if (root.__filterDropdowns) return;
      root.__filterDropdowns = true;
      wireSearch(root);
      wireSelect(root);
      wirePredictive(root);
      wireApply(root);
      wireSelectAll(root);
      wireDragScroll(root);
      wireReset(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initFilterDropdowns(); });
  } else {
    initFilterDropdowns();
  }

  window.initFilterDropdowns = initFilterDropdowns;
})();
