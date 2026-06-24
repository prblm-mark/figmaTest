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
 *   "search"    enter search mode          "search-exit"   leave search mode (back ←)
 *   "new-view"  enter new-view mode         "new-view-exit" cancel new-view (×)
 *   "new-view-create"  Create → add the typed name to the saved-views list + select it
 *
 * Per-row … menu actions (handled in wireViews, capture phase):
 *   data-filter-rename  inline-rename the view
 *   data-filter-copy    duplicate the view as "Copy of <name>" + select it
 *   data-filter-delete  remove the view (selected → fall back to first remaining)
 *
 * TODO(backend:Filters): the saved-views list, the filter value pickers, search
 * querying, Create, and the row actions (rename/copy/delete) are all mock — they
 * mutate the DOM only, so every change is lost on reload.
 */

import { initAll as initDropdowns } from '../../components/Dropdown/Dropdown.js';

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

/* Select a saved-view row: update the trigger label, move the tick onto it, flip
 * aria-checked across the list, and close the menu. */
function selectView(root, item) {
  const views = root.querySelector('.filter-bar-v1__views');
  if (!views || !item) return;
  const label = views.querySelector('.filter-bar-v1__views-label');
  const text = item.querySelector('[data-text]');
  if (label && text) label.textContent = text.textContent.trim();
  views.querySelectorAll('.dropdown-item[role="menuitemradio"]').forEach((it) => {
    it.setAttribute('aria-checked', it === item ? 'true' : 'false');
  });
  // A freshly created view has no filters yet → show only "Add Filters". Existing
  // views keep their default chips. Non-destructive: chips stay in the DOM, hidden
  // by CSS while this class is on.
  root.classList.toggle('filter-bar-v1--view-empty', item.dataset.viewEmpty === '1');
  let check = views.querySelector('.dropdown-item__check'); // single rendered tick — move it
  if (!check) {
    check = document.createElement('i');
    check.setAttribute('data-lucide', 'check');
    check.setAttribute('aria-hidden', 'true');
    check.className = 'dropdown-item__check';
  }
  item.appendChild(check);
  views.classList.remove('is-open');
  const trigger = views.querySelector('.dropdown__trigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

/* Append a new saved-view row (with its … menu) to the list and return its radio
 * button. The … menu is wired by re-running Dropdown.initAll afterwards. */
function addView(root, name) {
  const list = root.querySelector('.filter-bar-v1__views .dropdown__list--filter-views-top');
  if (!list) return null;
  const li = document.createElement('li');
  li.setAttribute('role', 'none');
  li.className = 'dropdown__view';
  li.innerHTML =
    '<button type="button" class="dropdown-item dropdown-item--sm" role="menuitemradio" aria-checked="false"><span data-text=""></span></button>'
    + '<button type="button" class="dropdown-item__more" aria-haspopup="menu" aria-expanded="false"><i data-lucide="ellipsis" aria-hidden="true"></i></button>'
    + '<div class="dropdown__row-menu" role="menu" hidden>'
    + '<button type="button" class="btn btn--tertiary btn--sm" role="menuitem" data-filter-rename><i data-lucide="pencil" aria-hidden="true"></i>Rename</button>'
    + '<button type="button" class="btn btn--tertiary btn--sm" role="menuitem" data-filter-copy><i data-lucide="copy" aria-hidden="true"></i>Copy</button>'
    + '<button type="button" class="btn btn--tertiary btn--sm" role="menuitem" data-filter-delete><i data-lucide="trash-2" aria-hidden="true"></i>Delete</button>'
    + '</div>';
  const span = li.querySelector('[data-text]');
  span.setAttribute('data-text', name);
  span.textContent = name; // textContent — safe against markup in the typed name
  li.querySelector('.dropdown-item__more').setAttribute('aria-label', name + ' actions');
  li.querySelector('.dropdown__row-menu').setAttribute('aria-label', name + ' actions');
  list.appendChild(li);
  const row = li.querySelector('.dropdown-item[role="menuitemradio"]');
  row.dataset.viewEmpty = '1'; // new view starts with no filters (see selectView)
  return row;
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

  // Close a row's … menu (we stopped Dropdown.js, so we close it ourselves).
  const closeRowMenu = (li) => {
    if (!li) return;
    const menu = li.querySelector('.dropdown__row-menu');
    if (menu) menu.hidden = true;
    const moreBtn = li.querySelector('.dropdown-item__more');
    if (moreBtn) moreBtn.setAttribute('aria-expanded', 'false');
  };

  // Capture phase so we beat Dropdown.js's bubble-phase close on .dropdown-item.
  views.addEventListener('click', (e) => {
    // "Rename" in a row's … menu — touch-friendly equivalent of double-click.
    const renameBtn = e.target.closest('[data-filter-rename]');
    if (renameBtn && views.contains(renameBtn)) {
      e.stopPropagation();
      const li = renameBtn.closest('li');
      closeRowMenu(li);
      const row = li && li.querySelector('.dropdown-item[role="menuitemradio"]');
      if (row) startRename(row);
      return;
    }
    // "Copy" in a row's … menu — duplicate the view (mock; DOM only).
    const copyBtn = e.target.closest('[data-filter-copy]');
    if (copyBtn && views.contains(copyBtn)) {
      e.stopPropagation();
      const li = copyBtn.closest('li');
      closeRowMenu(li);
      const srcRow = li && li.querySelector('.dropdown-item[role="menuitemradio"]');
      const srcText = srcRow && srcRow.querySelector('[data-text]');
      if (srcRow && srcText) {
        const copyRow = addView(root, 'Copy of ' + srcText.textContent.trim());
        if (copyRow) {
          // Mirror the source's filter state (addView defaults new rows to empty).
          copyRow.dataset.viewEmpty = srcRow.dataset.viewEmpty === '1' ? '1' : '0';
          if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
          initDropdowns(root); // wire the new row's … menu (idempotent)
          selectView(root, copyRow);
        }
      }
      return;
    }
    // "Delete" in a row's … menu — remove the view (mock; DOM only).
    const deleteBtn = e.target.closest('[data-filter-delete]');
    if (deleteBtn && views.contains(deleteBtn)) {
      e.stopPropagation();
      const li = deleteBtn.closest('li');
      if (!li) return;
      const row = li.querySelector('.dropdown-item[role="menuitemradio"]');
      const wasSelected = row && row.getAttribute('aria-checked') === 'true';
      const list = li.parentElement;
      li.remove();
      if (wasSelected) {
        const next = list && list.querySelector('.dropdown-item[role="menuitemradio"]');
        if (next) selectView(root, next); // fall back to the first remaining view
      }
      return;
    }
    const item = isRowName(e);
    if (!item) return;
    e.stopPropagation();
    if (clickTimer) return; // the 2nd click of a dblclick — handled below
    clickTimer = setTimeout(() => { clickTimer = null; selectView(root, item); }, 220);
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

  // Save View: a filter being added/amended reveals the "Save view" CTA. Mock —
  // here we trigger it from the "Add Filters" chip's toggle (FilterItem bubbles
  // `filter-item:toggle`). TODO(backend:Filters): real trigger is a persisted
  // filter-set change.
  root.addEventListener('filter-item:toggle', (e) => {
    if (e.target.closest('.filter-bar-v1__add') && e.detail && e.detail.open) {
      root.classList.add('filter-bar-v1--save-view');
    }
  });

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
      case 'new-view-create': {
        const input = root.querySelector('.filter-bar-v1__new-view .input__control');
        const name = input ? input.value.trim() : '';
        if (name) {
          const row = addView(root, name); // append to the saved-views list
          if (row) {
            if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
            initDropdowns(root); // wire the new row's … menu (idempotent for existing rows)
            selectView(root, row); // selects + applies --view-empty (only Add Filters shows)
          }
        }
        if (input) input.value = '';
        setMode(root, null);
        break;
      }
      case 'save-view': {
        // Mock "save" — dismiss the CTA and close the Add Filters chip it came from.
        root.classList.remove('filter-bar-v1--save-view');
        const add = root.querySelector('.filter-bar-v1__add');
        if (add) {
          add.classList.remove('filter-item--open');
          const t = add.querySelector('.filter-item__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
        break;
      }
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
