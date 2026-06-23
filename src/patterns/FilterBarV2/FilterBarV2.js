/* FilterBarV2 — toolbar mode transitions. Auto-binds to every `.filter-bar-v2`.
 *
 * Same mode model as FilterBarV1 (search / new-view), but scoped to the V2
 * two-row layout. The saved-views Dropdown, kebab actions menu, per-row
 * Copy/Delete mini-menu, and the FilterItem chips are their own components —
 * load and init their scripts separately (they auto-bind).
 *
 * Hooks (data-filter-action on a descendant button): see FilterBarV1.js.
 *
 * TODO(backend:Filters): saved-views list, value pickers, search querying,
 * Create (persist), Export, and the kebab actions are all mock.
 */

function setMode(root, mode) {
  root.classList.toggle('filter-bar-v2--search', mode === 'search');
  root.classList.toggle('filter-bar-v2--new-view', mode === 'new-view');
}

function closeDropdowns(root) {
  root.querySelectorAll('.dropdown.is-open').forEach((d) => {
    d.classList.remove('is-open');
    const t = d.querySelector('.dropdown__trigger');
    if (t) t.setAttribute('aria-expanded', 'false');
  });
}

/* Saved-views selection: update the trigger label + move the tick to the chosen row. */
function wireViewSelect(root) {
  const views = root.querySelector('.filter-bar-v2__views');
  if (!views) return;
  views.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item[role="menuitemradio"]');
    if (!item || !views.contains(item)) return;
    if (e.target.closest('.dropdown-item__more, .dropdown__row-menu')) return;

    const label = views.querySelector('.filter-bar-v2__views-label');
    const text = item.querySelector('[data-text]');
    if (label && text) label.textContent = text.textContent;

    views.querySelectorAll('.dropdown-item[role="menuitemradio"]').forEach((it) => {
      it.setAttribute('aria-checked', it === item ? 'true' : 'false');
    });
    const check = views.querySelector('.dropdown-item__check');
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
        focusEl('.filter-bar-v2__search .input__control');
        break;
      case 'search-exit':
        setMode(root, null);
        break;
      case 'new-view':
        closeDropdowns(root);
        setMode(root, 'new-view');
        focusEl('.filter-bar-v2__new-view .input__control');
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
  scope.querySelectorAll('.filter-bar-v2').forEach(init);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }
}

export { init, initAll };
