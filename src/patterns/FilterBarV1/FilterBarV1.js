/* FilterBarV1 — toolbar mode transitions. Auto-binds to every `.filter-bar-v1`.
 *
 * Owns ONLY the bar's own mode state. The saved-views dropdown, the kebab actions
 * menu, the per-row Copy/Delete mini-menu, and the chips are the Dropdown and
 * FilterItem components — load and init their scripts separately (they auto-bind).
 *
 * Modes (root classes):
 *   .filter-bar-v1--search    search-icon → back-arrow + full-width search field
 *   .filter-bar-v1--new-view  "+ New view" (in saved-views menu) → New view field + Create
 *
 * Hooks (data-filter-action on a descendant button):
 *   "search"    enter search mode        "search-exit"  leave search mode (back ←)
 *   "new-view"  enter new-view mode       "new-view-exit" leave new-view mode (× / Create)
 *
 * TODO(backend:Filters): the saved-views list, the filter value pickers, search
 * querying, Create (persist a new view), and the kebab actions are all mock.
 */

function setMode(root, mode) {
  root.classList.toggle('filter-bar-v1--search', mode === 'search');
  root.classList.toggle('filter-bar-v1--new-view', mode === 'new-view');
}

function closeDropdowns(root) {
  root.querySelectorAll('.dropdown.is-open').forEach((d) => {
    d.classList.remove('is-open');
    const t = d.querySelector('.dropdown__trigger');
    if (t) t.setAttribute('aria-expanded', 'false');
  });
}

/* Saved-views selection: clicking a view radio updates the trigger label and
 * moves the tick onto the chosen row. (Dropdown.js handles closing the panel.) */
function wireViewSelect(root) {
  const views = root.querySelector('.filter-bar-v1__views');
  if (!views) return;
  views.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item[role="menuitemradio"]');
    if (!item || !views.contains(item)) return;
    if (e.target.closest('.dropdown-item__more, .dropdown__row-menu')) return; // per-row actions

    const label = views.querySelector('.filter-bar-v1__views-label');
    const text = item.querySelector('[data-text]');
    if (label && text) label.textContent = text.textContent;

    views.querySelectorAll('.dropdown-item[role="menuitemradio"]').forEach((it) => {
      it.setAttribute('aria-checked', it === item ? 'true' : 'false');
    });
    const check = views.querySelector('.dropdown-item__check'); // one rendered tick — move it
    if (check) item.appendChild(check);
  });
}

function init(root) {
  if (root.dataset.filterBarInit === '1') return;
  root.dataset.filterBarInit = '1';

  wireViewSelect(root);

  const focusEl = (sel) => {
    const el = root.querySelector(sel);
    if (el) el.focus();
  };

  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-filter-action]');
    if (!trigger || !root.contains(trigger)) return;

    switch (trigger.dataset.filterAction) {
      case 'search':
        setMode(root, 'search');
        focusEl('.filter-bar-v1__search .input__control');
        break;
      case 'search-exit':
        setMode(root, null);
        break;
      case 'new-view':
        closeDropdowns(root); // close the saved-views menu it was triggered from
        setMode(root, 'new-view');
        focusEl('.filter-bar-v1__new-view .input__control');
        break;
      case 'new-view-exit':
        setMode(root, null);
        break;
      default:
        break;
    }
  });
}

function initAll(scope = document) {
  scope.querySelectorAll('.filter-bar-v1').forEach(init);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }
}

export { init, initAll };
