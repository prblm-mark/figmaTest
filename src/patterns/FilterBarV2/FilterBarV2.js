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

/* Saved-views row interaction (FilterBarV2): single click selects + closes,
 * double click inline-renames. See FilterBarV1.js for the full rationale. */
function wireViews(root) {
  const views = root.querySelector('.filter-bar-v2__views');
  if (!views) return;
  const label = views.querySelector('.filter-bar-v2__views-label');
  let clickTimer = null;

  const selectRow = (item) => {
    const text = item.querySelector('[data-text]');
    if (label && text) label.textContent = text.textContent.trim();
    views.querySelectorAll('.dropdown-item[role="menuitemradio"]').forEach((it) => {
      it.setAttribute('aria-checked', it === item ? 'true' : 'false');
    });
    const check = views.querySelector('.dropdown-item__check');
    if (check) item.appendChild(check);
    views.classList.remove('is-open');
    const trigger = views.querySelector('.dropdown__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  };

  const startRename = (item) => {
    const li = item.closest('li');
    const text = item.querySelector('[data-text]');
    if (!li || !text || li.querySelector('.filter-bar-v2__rename')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'filter-bar-v2__rename';
    input.value = text.textContent.trim();
    input.setAttribute('aria-label', 'Rename view');
    li.classList.add('filter-bar-v2__li--renaming');
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
      li.classList.remove('filter-bar-v2__li--renaming');
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
    if (e.target.closest('.dropdown-item__more, .dropdown__row-menu, .filter-bar-v2__rename')) return null;
    return item;
  };

  views.addEventListener('click', (e) => {
    const renameBtn = e.target.closest('[data-filter-rename]');
    if (renameBtn && views.contains(renameBtn)) {
      e.stopPropagation();
      const li = renameBtn.closest('li');
      const menu = li && li.querySelector('.dropdown__row-menu');
      if (menu) menu.hidden = true;
      const moreBtn = li && li.querySelector('.dropdown-item__more');
      if (moreBtn) moreBtn.setAttribute('aria-expanded', 'false');
      const row = li && li.querySelector('.dropdown-item[role="menuitemradio"]');
      if (row) startRename(row);
      return;
    }
    const item = isRowName(e);
    if (!item) return;
    e.stopPropagation();
    if (clickTimer) return;
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
