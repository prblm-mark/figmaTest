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

  function labelText(row) {
    var el = row.querySelector('.checkbox__label-text, .filter-dropdown-item__name');
    return (el ? el.textContent : row.textContent).trim().toLowerCase();
  }

  function wireSearch(root) {
    var input = root.querySelector('[data-filter-dropdowns-search]');
    var list = root.querySelector('[data-filter-dropdowns-list]');
    if (!input || !list) return;
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      list.querySelectorAll('.checkbox, .filter-dropdown-item').forEach(function (row) {
        row.style.display = (!q || labelText(row).indexOf(q) !== -1) ? '' : 'none';
      });
    });
  }

  function wireSelect(root) {
    var trigger = root.querySelector('[data-select-trigger]');
    var menu = root.querySelector('[data-select-menu]');
    var valueEl = root.querySelector('[data-select-value]');
    if (!trigger || !menu) return;
    var placeholder = valueEl ? valueEl.textContent : 'Select';

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

    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
  }

  function wirePredictive(root) {
    var input = root.querySelector('[data-predictive-input]');
    var menu = root.querySelector('[data-select-menu]');
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

    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
  }

  function wireApply(root) {
    var apply = root.querySelector('[data-filter-dropdowns-apply]');
    if (!apply) return;
    apply.addEventListener('click', function () {
      root.dispatchEvent(new CustomEvent('filter-dropdowns:apply', { bubbles: true }));
    });
  }

  function initFilterDropdowns(scope) {
    (scope || document).querySelectorAll('[data-filter-dropdowns]').forEach(function (root) {
      if (root.__filterDropdowns) return;
      root.__filterDropdowns = true;
      wireSearch(root);
      wireSelect(root);
      wirePredictive(root);
      wireApply(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initFilterDropdowns(); });
  } else {
    initFilterDropdowns();
  }

  window.initFilterDropdowns = initFilterDropdowns;
})();
