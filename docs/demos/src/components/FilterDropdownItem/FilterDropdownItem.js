/* FilterDropdownItem — multi-select toggle behaviour.
 * Figma node 3032:18152. Each item toggles its own selected state independently
 * (multi-select), so several options can be checked at once.
 *
 * Auto-inits every [data-filter-dropdown-item] on load. The element is a
 * <button aria-pressed>; clicking toggles `.filter-dropdown-item--selected`,
 * `aria-pressed`, and fires a `filter-dropdown-item:toggle` event carrying
 * { selected } so a consuming dropdown can react.
 */
(function () {
  'use strict';

  function toggle(item) {
    var selected = item.classList.toggle('filter-dropdown-item--selected');
    item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    item.dispatchEvent(new CustomEvent('filter-dropdown-item:toggle', {
      bubbles: true,
      detail: { selected: selected }
    }));
    return selected;
  }

  function wire(item) {
    if (item.__filterDropdownItem) return;
    item.__filterDropdownItem = true;
    // Reflect any server-rendered selected class into aria-pressed
    item.setAttribute('aria-pressed', item.classList.contains('filter-dropdown-item--selected') ? 'true' : 'false');
    item.addEventListener('click', function () { toggle(item); });
  }

  function initFilterDropdownItems(scope) {
    (scope || document).querySelectorAll('[data-filter-dropdown-item]').forEach(wire);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initFilterDropdownItems(); });
  } else {
    initFilterDropdownItems();
  }

  window.initFilterDropdownItems = initFilterDropdownItems;
})();
