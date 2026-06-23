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

/* Saved-views row interaction (FilterBarV1):
 *   - single click  → select the view (update trigger label + tick) and close
 *   - double click   → inline-rename the view name (Enter/blur commit, Esc cancel)
 *
 * We take the row click over from Dropdown.js (capture phase + stopPropagation) so
 * the first click of a double-click doesn't close the panel. A short timer
 * disambiguates single vs double click. The rename <input> overlays the row
 * (it can't nest inside the row's <button>), so it's appended to the <li>.
 */
function wireViews(root) {
  const views = root.querySelector('.filter-bar-v1__views');
  if (!views) return;
  const label = views.querySelector('.filter-bar-v1__views-label');
  let clickTimer = null;

  const selectRow = (item) => {
    const text = item.querySelector('[data-text]');
    if (label && text) label.textContent = text.textContent.trim();
    views.querySelectorAll('.dropdown-item[role="menuitemradio"]').forEach((it) => {
      it.setAttribute('aria-checked', it === item ? 'true' : 'false');
    });
    const check = views.querySelector('.dropdown-item__check'); // one rendered tick — move it
    if (check) item.appendChild(check);
    views.classList.remove('is-open'); // we suppressed Dropdown.js's close, so close here
    const trigger = views.querySelector('.dropdown__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  };

  const startRename = (item) => {
    const li = item.closest('li');
    const text = item.querySelector('[data-text]');
    if (!li || !text || li.querySelector('.filter-bar-v1__rename')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'filter-bar-v1__rename';
    input.value = text.textContent.trim();
    input.setAttribute('aria-label', 'Rename view');
    li.classList.add('filter-bar-v1__li--renaming');
    li.appendChild(input);
    input.focus();
    input.select();

    let done = false;
    const finish = (commit) => {
      if (done) return;
      done = true;
      const v = input.value.trim();
      if (commit && v) {
        text.textContent = v;
        if (item.getAttribute('aria-checked') === 'true' && label) label.textContent = v;
      }
      input.remove();
      li.classList.remove('filter-bar-v1__li--renaming');
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
    input.addEventListener('blur', () => finish(true));
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('dblclick', (e) => e.stopPropagation());
  };

  const isRowName = (e) => {
    const item = e.target.closest('.dropdown-item[role="menuitemradio"]');
    if (!item || !views.contains(item)) return null;
    if (e.target.closest('.dropdown-item__more, .dropdown__row-menu, .filter-bar-v1__rename')) return null;
    return item;
  };

  // Capture phase so we beat Dropdown.js's bubble-phase close on .dropdown-item.
  views.addEventListener('click', (e) => {
    const item = isRowName(e);
    if (!item) return;
    e.stopPropagation();
    if (clickTimer) return; // the 2nd click of a dblclick — handled below
    clickTimer = setTimeout(() => { clickTimer = null; selectRow(item); }, 220);
  }, true);

  views.addEventListener('dblclick', (e) => {
    const item = isRowName(e);
    if (!item) return;
    e.stopPropagation();
    if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
    startRename(item);
  }, true);
}

function init(root) {
  if (root.dataset.filterBarInit === '1') return;
  root.dataset.filterBarInit = '1';

  wireViews(root);

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
