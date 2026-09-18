/* FilterBar — toolbar mode transitions. Auto-binds to every `.filter-bar`.
 *
 * Two-row layout with search / new-view modes. The saved-views Dropdown, kebab
 * actions menu, per-row Copy/Delete mini-menu, and the FilterItem chips are their
 * own components — load and init their scripts separately (they auto-bind).
 *
 * Hooks (data-filter-action on a descendant button): "search" / "search-exit",
 * "new-view" / "new-view-exit" / "new-view-create" (Create → add the typed name to
 * the saved-views list + select it), "save-view". Per-row … menu actions
 * (rename/copy/delete) are handled in wireViews.
 *
 * TODO(backend:Filters): saved-views list, value pickers, search querying,
 * Create, Export, and the row actions (rename/copy/delete) are all mock — they
 * mutate the DOM only, so every change is lost on reload.
 */

import { initAll as initDropdowns } from '../../components/Dropdown/Dropdown.js';

function setMode(root, mode) {
  root.classList.toggle('filter-bar--search', mode === 'search');
  root.classList.toggle('filter-bar--new-view', mode === 'new-view');
  /* Naming a view to SAVE reuses New View's field + Create, because that is
     the only naming UI Figma defines (2977:3799) — but it must not collapse
     row 2 the way New View does. A new view starts empty; a saved one is being
     saved BECAUSE of the chips currently on the bar. */
  root.classList.toggle('filter-bar--saving-view', mode === 'saving-view');

  const field = root.querySelector('.filter-bar__new-view .input__control');
  if (field) {
    const saving = mode === 'saving-view';
    field.placeholder = saving ? 'Save view as' : 'New view';
    field.setAttribute('aria-label', saving ? 'Name for the saved view' : 'New view name');
  }
  const create = root.querySelector('.filter-bar__create');
  if (create) create.textContent = mode === 'saving-view' ? 'Save' : 'Create';
}

function closeDropdowns(root) {
  root.querySelectorAll('.dropdown.is-open').forEach((d) => {
    d.classList.remove('is-open');
    const t = d.querySelector('.dropdown__trigger');
    if (t) t.setAttribute('aria-expanded', 'false');
  });
}

/* Select a saved-view row: trigger label + tick + aria-checked, then close. */
function selectView(root, item) {
  const views = root.querySelector('.filter-bar__views');
  if (!views || !item) return;
  const label = views.querySelector('.filter-bar__views-label');
  const text = item.querySelector('[data-text]');
  if (label && text) label.textContent = text.textContent.trim();
  views.querySelectorAll('.dropdown-item[role="menuitemradio"]').forEach((it) => {
    it.setAttribute('aria-checked', it === item ? 'true' : 'false');
  });
  // New (empty) view → show only "Add Filters"; existing views keep their chips.
  // Non-destructive: chips stay in the DOM, hidden by CSS while this class is on.
  root.classList.toggle('filter-bar--view-empty', item.dataset.viewEmpty === '1');
  /* A view carries a filter set; only the screen knows how to restore it. */
  root.dispatchEvent(new CustomEvent('filter-bar:select-view', {
    bubbles: true,
    detail: { name: text ? text.textContent.trim() : '', view: item },
  }));
  let check = views.querySelector('.dropdown-item__check');
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

/* Append a new saved-view row (with its … menu) and return its radio button. */
function addView(root, name) {
  const list = root.querySelector('.filter-bar__views .dropdown__list--filter-views-top');
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
  span.textContent = name;
  li.querySelector('.dropdown-item__more').setAttribute('aria-label', name + ' actions');
  li.querySelector('.dropdown__row-menu').setAttribute('aria-label', name + ' actions');
  list.appendChild(li);
  const row = li.querySelector('.dropdown-item[role="menuitemradio"]');
  row.dataset.viewEmpty = '1'; // new view starts with no filters (see selectView)
  return row;
}

/* Saved-views row interaction (FilterBar): single click selects + closes,
 * double click inline-renames (capture-phase takeover + 220ms single/double timer). */
function wireViews(root) {
  const views = root.querySelector('.filter-bar__views');
  if (!views) return;
  const label = views.querySelector('.filter-bar__views-label');
  let clickTimer = null;

  const startRename = (item) => {
    const li = item.closest('li');
    const text = item.querySelector('[data-text]');
    if (!li || !text || li.querySelector('.filter-bar__rename')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'filter-bar__rename';
    input.value = text.textContent.trim();
    input.setAttribute('aria-label', 'Rename view');
    li.classList.add('filter-bar__li--renaming');
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
      li.classList.remove('filter-bar__li--renaming');
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
    if (e.target.closest('.dropdown-item__more, .dropdown__row-menu, .filter-bar__rename')) return null;
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

  /* Collapse EVERY row's … menu. Used when the saved-views panel itself
     closes: a row menu left open is still open on the next open, so the
     panel reappears showing Rename/Copy/Delete for a row the user may not
     even have been acting on. */
  const closeAllRowMenus = () => {
    views.querySelectorAll('li').forEach(closeRowMenu);
  };

  /* Watch the panel's own open class rather than calling the above from each
     close path. There are five: FilterBar's closeDropdowns() and selectView(),
     plus Dropdown.js's trigger toggle, outside-click and Escape. Dropdown.js
     owns three of them and emits no close event — it only removes the class —
     so hooking the class is the one place that catches all five without
     reaching into the shared component. */
  new MutationObserver(() => {
    if (!views.classList.contains('is-open')) closeAllRowMenus();
  }).observe(views, { attributes: true, attributeFilter: ['class'] });

  views.addEventListener('click', (e) => {
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
    if (clickTimer) return;
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

/* Chip pickers — show the dropdown a chip is assigned when it opens.
 *
 * FilterItem emits `filter-item:toggle` and explicitly leaves mounting the
 * picker to its consumer; this is that consumer. The bar stays generic: it
 * never knows WHICH dropdown a chip has, only that a chip may have a
 * `.filter-bar__panel` sibling. The screen supplies the panel content, so the
 * same bar serves every listing screen.
 */
/* Below this, a query is treated as no query at all. Short terms match most of
   a listing, so the table would thrash on the first keystroke and then settle —
   which reads as a bug rather than a search. */
const SEARCH_MIN = 3;

/* The bar has TWO search fields — the persistent desktop one and the mobile
   takeover — and they are the same search, so they mirror each other. */
function wireSearch(root) {
  const fields = Array.from(root.querySelectorAll(
    '.filter-bar__search .input__control, .filter-bar__search-bar .input__control'
  ));
  if (!fields.length) return;

  let last = '';
  const emit = (raw) => {
    const query = raw.trim().length >= SEARCH_MIN ? raw.trim() : '';
    if (query === last) return;   // typing within the threshold changes nothing
    last = query;
    root.dispatchEvent(new CustomEvent('filter-bar:search', {
      bubbles: true,
      detail: { query },
    }));
  };

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      fields.forEach((other) => { if (other !== field) other.value = field.value; });
      emit(field.value);
    });
  });

  /* Leaving the mobile takeover cancels the search. Without this the query
     would keep filtering from a field that is no longer on screen. */
  root.clearSearch = () => {
    fields.forEach((f) => { f.value = ''; });
    emit('');
  };
}

function wireChipPanels(root) {
  const panelOf = (chip) => {
    if (!chip) return null;
    /* A chip INSIDE a picker is not a picker owner. The More Filters type is
       built from `.filter-item` chips, and those bubble `filter-item:toggle`
       exactly like a bar chip — without this guard, clicking "Order Date"
       inside the Add Filters panel would walk up to the Add Filters wrapper
       and toggle the very panel it lives in. */
    if (chip.closest('.filter-bar__panel')) return null;
    const wrap = chip.closest('.filter-bar__chip');
    return wrap ? wrap.querySelector('.filter-bar__panel') : null;
  };

  /* Only one picker open at a time. Closing a chip means closing its panel AND
     clearing the chip's own open state, which FilterItem set. */
  const closeAll = (keep) => {
    root.querySelectorAll('.filter-bar__chip').forEach((wrap) => {
      const panel = wrap.querySelector('.filter-bar__panel');
      if (!panel || panel === keep) return;
      panel.hidden = true;
      panel.classList.remove('filter-bar__panel--end');
      const chip = wrap.querySelector('.filter-item--open');
      if (!chip) return;
      chip.classList.remove('filter-item--open');
      const trigger = chip.querySelector('.filter-item__trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  };

  root.addEventListener('filter-item:toggle', (e) => {
    const panel = panelOf(e.target.closest('.filter-item'));
    if (!panel) return;                       // chip with no assigned picker
    if (!e.detail || !e.detail.open) { panel.hidden = true; return; }

    closeAll(panel);
    panel.hidden = false;

    /* Flip to the end edge if the 320px card would overrun the bar. Measured
       after showing, because a hidden element has no box to measure. */
    panel.classList.remove('filter-bar__panel--end');
    if (panel.getBoundingClientRect().right > root.getBoundingClientRect().right) {
      panel.classList.add('filter-bar__panel--end');
    }
  });

  /* "Was this click inside the bar?" — asked of the event's PATH, not of the
     live DOM. Picking a More Filters facet removes that facet (it has moved to
     the bar), so by the time this document-level listener runs the target is
     detached and `root.contains(target)` reads false — closing the panel the
     user is still picking from. composedPath() is captured at dispatch, so it
     still remembers where the click came from. */
  const cameFromBar = (e) => {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : null;
    return path && path.length ? path.indexOf(root) !== -1 : root.contains(e.target);
  };

  document.addEventListener('click', (e) => {
    if (!cameFromBar(e)) closeAll(null);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll(null);
  });

  /* Read the picked values out of a panel WITHOUT knowing its type. The shape
     of the panel tells us where its value lives, so the bar stays generic:
       - a menu present  -> the selected option rows ARE the value. Predictive
         panels also contain a text input, but that is a SEARCH field, not the
         value, so the menu must win.
       - checkboxes      -> every checked label.
       - neither         -> a plain field, so its text is the value. */
  const valuesIn = (panel) => {
    const pick = (nodes) => Array.from(nodes).map((n) => n.textContent.trim()).filter(Boolean);

    if (panel.querySelector('[data-select-menu]')) {
      return pick(panel.querySelectorAll('.filter-dropdown-item--selected .filter-dropdown-item__name'));
    }
    const checked = panel.querySelectorAll('.checkbox__input:checked');
    if (panel.querySelector('.checkbox__input')) {
      return pick(Array.from(checked).map((c) => c.closest('.checkbox').querySelector('.checkbox__label-text')));
    }
    const field = panel.querySelector('.input__control');
    const text = field ? field.value.trim() : '';
    return text ? [text] : [];
  };

  /* Push the panel's values onto the chip. FilterItem.setFilterValues owns the
     rollup Figma specifies — 1–3 list in full, 4+ becomes "<first>, and N more"
     — and drops the chip back to Default when the list is empty, so the chip's
     selected state and its label both fall out of this one call. */
  /* Announce what a chip now holds. FilterItem's rollup is LOSSY — four values
     render as "<first>, and 3 more" — so a consumer that needs the values
     cannot read them back off the chip. This is how the listing learns what to
     filter by. */
  /* Save view (Type=Save View) appears when the bar no longer matches the view
     it claims to be showing — i.e. there is something to save. That is a
     DIFFERENCE, not "any filter is set": a saved view full of filters is not
     dirty, and the CTA has to disappear the moment its own view is saved.

     The comparison is a signature of the chips on the bar and the values each
     holds. Both halves matter — adding a filter changes the view even before
     it has a value. Values come from `announce`, not from the chip's label,
     which rolls 4+ up into "<first>, and 3 more" and would call two different
     four-value selections identical. */
  const current = new Map();

  /* Anything ELSE about the view that the bar cannot see. The listing puts
     its column layout here: editing the columns is a change to the view in
     exactly the way adding a filter is, so it has to reach the same CTA —
     but the bar has no business knowing what a column is. */
  let extra = '';

  const signature = () => JSON.stringify([extra,
    Array.from(root.querySelectorAll('.filter-bar__chips > .filter-bar__chip'))
      /* The chip's OWN FilterItem — not a More Filters facet inside its
         picker, which would make every bar look different from itself. */
      .map((wrap) => wrap.querySelector(':scope > .filter-item'))
      .filter(Boolean)
      .map((chip) => {
        const name = chip.getAttribute('data-filter-name');
        return [name, current.get(name) || []];
      })
  ]);

  let baseline = signature();

  const refreshSaveView = () => {
    root.classList.toggle('filter-bar--save-view', signature() !== baseline);
  };

  const announce = (chip, values) => {
    root.dispatchEvent(new CustomEvent('filter-bar:change', {
      bubbles: true,
      detail: { name: chip.getAttribute('data-filter-name'), values },
    }));
  };

  const sync = (panel) => {
    const wrap = panel.closest('.filter-bar__chip');
    const chip = wrap && wrap.querySelector('.filter-item');
    if (!chip) return;
    const values = valuesIn(panel);
    if (typeof chip.setFilterValues === 'function') chip.setFilterValues(values);
    current.set(chip.getAttribute('data-filter-name'), values);
    announce(chip, values);
    refreshSaveView();
  };

  /* EVERY picker commits on Apply — 3039:5639 gives all of them the button,
     More Filters alone excepted. So picking an option is not yet a filter: it
     closes the MENU and fills the field, and the chip changes only when Apply
     is pressed. Nothing listens to `filter-dropdown-item:toggle` here for that
     reason. */
  root.addEventListener('filter-dropdowns:apply', (e) => {
    const panel = e.target.closest('.filter-bar__panel');
    if (!panel) return;
    sync(panel);
    closeAll(null);
  });

  /* Clearing the chip must clear its picker too, or reopening shows values the
     chip no longer claims. */
  root.addEventListener('filter-item:clear', (e) => {
    const chip = e.target.closest('.filter-item');
    if (!chip) return;
    current.set(chip.getAttribute('data-filter-name'), []);
    announce(chip, []);
    refreshSaveView();

    const panel = panelOf(chip);
    const card = panel && panel.querySelector('[data-filter-dropdowns]');
    /* The card resets itself — it is the only thing that knows what unset
       looks like for its type. Clearing it from out here got the selections
       but left the chosen name sitting in the field, greyed, reading like a
       placeholder that could not be chosen again. */
    if (card && typeof card.resetFilterDropdown === 'function') card.resetFilterDropdown();
  });

  /* Add Filters: picking a facet inside the More Filters panel should put that
     filter on the bar. The bar cannot build the new chip — it does not know
     what picker the filter wants — so it reports the choice and the screen,
     which owns the config, builds it.

     More Filters is the one type with no Apply (3039:5637), so a click IS the
     commit. The panel deliberately stays open afterwards: the facets are a
     pick-list several of which are usually wanted, and the picked one leaves
     the list as it goes, so the remaining choices stay in front of the user.
     It closes on the outside click / Escape handled above, like any panel. */
  root.addEventListener('click', (e) => {
    const facet = e.target.closest('.filter-bar__panel .filter-item');
    if (!facet) return;
    const name = facet.getAttribute('data-filter-name');
    if (!name) return;
    /* The chip does not exist yet — the screen builds it — so settle the CTA
       once it does. */
    setTimeout(refreshSaveView, 0);
    root.dispatchEvent(new CustomEvent('filter-bar:add-filter', {
      bubbles: true,
      detail: { name },
    }));
  });

  /* Public, like FilterItem.setFilterValues. The screen calls resetSaveView()
     once the bar shows a view as saved — after selecting one, or after saving
     the current filters as a new one — passing the values it just restored, so
     the new baseline is the values themselves and not a stale cache of them. */
  root.refreshSaveView = refreshSaveView;

  /* The consumer's half of the view state, as an opaque string — the bar
     compares it, never reads it. */
  root.setViewExtra = (value) => {
    extra = value || '';
    refreshSaveView();
  };

  root.resetSaveView = (valuesByName) => {
    if (valuesByName) {
      current.clear();
      Object.keys(valuesByName).forEach((n) => current.set(n, valuesByName[n]));
    }
    baseline = signature();
    refreshSaveView();
  };

  /* Chips can be rendered already selected, so settle the state up front. */
  refreshSaveView();
}

function init(root) {
  if (root.dataset.filterBarInit === '1') return;
  root.dataset.filterBarInit = '1';

  wireViews(root);

  wireChipPanels(root);

  wireSearch(root);

  // Save View is revealed by wireChipPanels' refreshSaveView, from the real
  // signal — a chip holding values, or a filter added from More Filters. It
  // used to be faked here by merely OPENING the Add Filters chip, which showed
  // the CTA for a look that changed nothing.

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
        focusEl('.filter-bar__search .input__control');
        break;
      case 'search-exit':
        setMode(root, null);
        if (typeof root.clearSearch === 'function') root.clearSearch();
        break;
      case 'new-view':
        closeDropdowns(root);
        setMode(root, 'new-view');
        focusEl('.filter-bar__new-view .input__control');
        break;
      case 'new-view-exit':
        setMode(root, null);
        /* Abandoning the name leaves the filters as they were, so the CTA is
           owed again. */
        if (typeof root.refreshSaveView === 'function') root.refreshSaveView();
        break;
      case 'new-view-create': {
        const saving = root.classList.contains('filter-bar--saving-view');
        const input = root.querySelector('.filter-bar__new-view .input__control');
        const name = input ? input.value.trim() : '';
        if (name) {
          const row = addView(root, name);
          if (row) {
            /* Saving keeps the chips that are on the bar; New View starts
               empty. addView() assumes the latter, so undo that here. */
            if (saving) {
              row.dataset.viewEmpty = '0';
              /* Snapshot BEFORE selecting — selectView asks the screen to
                 restore this view, and there would be nothing to restore. */
              root.dispatchEvent(new CustomEvent('filter-bar:save-view', {
                bubbles: true,
                detail: { name, view: row },
              }));
            }
            if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
            initDropdowns(root);
            selectView(root, row);
          }
        }
        if (input) input.value = '';
        setMode(root, null);
        break;
      }
      case 'save-view': {
        /* Saving needs a name, so the CTA opens the naming field rather than
           saving on the spot. */
        closeDropdowns(root);
        const add = root.querySelector('.filter-bar__add');
        if (add) {
          add.classList.remove('filter-item--open');
          const t = add.querySelector('.filter-item__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
          const panel = add.closest('.filter-bar__chip');
          const p = panel && panel.querySelector('.filter-bar__panel');
          if (p) p.hidden = true;
        }
        setMode(root, 'saving-view');
        focusEl('.filter-bar__new-view .input__control');
        break;
      }
      default:
        break;
    }
  });
}

function initAll(scope = document) {
  scope.querySelectorAll('.filter-bar').forEach(init);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }
}

export { init, initAll };
