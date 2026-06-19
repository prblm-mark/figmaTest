/* Dropdown — open/close behaviour, click-outside dismiss, Escape to close,
 * search filtering, and linked-toggle reveals. Auto-binds to every `.dropdown`
 * on the page.
 *
 * Markup contract:
 *   <div class="dropdown" data-dropdown>
 *     <button class="dropdown__trigger" aria-expanded="false" aria-haspopup="menu">…</button>
 *     <div class="dropdown__panel" role="menu">…</div>
 *   </div>
 *
 * Behaviour modifiers via data attributes on the root `.dropdown`:
 *   data-dropdown="stay-open"   — keep panel open when an item is clicked
 *                                 (Checkbox variant and User menu use this)
 *   data-dropdown-search        — enable search-input filtering of items
 *                                 inside the panel
 *
 * Linked-toggle reveal (User menu Icon Navigation → Hide Labels):
 *   A `.toggle` inside the panel can reveal another row when active. Pattern:
 *     <button class="toggle" id="icon-nav-toggle" …>…</button>
 *     <div class="dropdown__toggle-row dropdown__toggle-row--reveal"
 *          data-reveal-by="icon-nav-toggle">…</div>
 *   When the toggle gains `.toggle--active`, the reveal row gets `.is-revealed`.
 *
 * Open class on the root: `.is-open`. Trigger's aria-expanded mirrors it.
 */

const OPEN_CLASS = 'is-open';

/* Wire up linked-toggle reveals on a panel. Idempotent (skips if already
 * wired via data-reveal-init). Lives OUTSIDE the open/close init() so it
 * still runs when a dropdown is rendered as a static showcase
 * (data-dropdown-init="1" — used by the HeaderGroup demo). */
function initReveals(panel) {
  const revealRows = panel.querySelectorAll('.dropdown__toggle-row--reveal[data-reveal-by]');
  revealRows.forEach((row) => {
    if (row.dataset.revealInit === '1') return;
    row.dataset.revealInit = '1';

    const sourceId = row.getAttribute('data-reveal-by');
    if (!sourceId) return;
    const source = panel.querySelector('#' + sourceId);
    if (!source) return;

    const sync = () => {
      row.classList.toggle('is-revealed', source.classList.contains('toggle--active'));
    };

    sync();
    source.addEventListener('click', () => {
      // The Toggle's own click handler flips .toggle--active synchronously
      // before this listener fires (event listeners attached later run later),
      // so reading the class here gives the post-click state. We re-sync next
      // tick to be safe against any other handler order.
      sync();
      setTimeout(sync, 0);
    });
  });
}

/* Wire up per-row action menus (Filter views: the "…" trigger on a non-selected
 * view row toggles a floating copy/delete mini-menu). Idempotent per trigger.
 * Click "…" to toggle; clicking elsewhere in the panel, the menu buttons, or
 * outside the dropdown closes it. */
function initRowActions(panel) {
  const triggers = panel.querySelectorAll('.dropdown-item__more');
  if (!triggers.length) return;

  const closeAll = () => {
    panel.querySelectorAll('.dropdown__row-menu').forEach((menu) => {
      menu.hidden = true;
    });
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
  };

  triggers.forEach((trigger) => {
    if (trigger.dataset.rowActionsInit === '1') return;
    trigger.dataset.rowActionsInit = '1';

    const menu = trigger.parentElement.querySelector('.dropdown__row-menu');
    if (!menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation(); // don't select the row or close the dropdown
      const willOpen = menu.hidden;
      closeAll();
      menu.hidden = !willOpen;
      trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });

    // Mock copy/delete — keep the dropdown open, just close the row menu.
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      // TODO(backend:SavedViews): wire copy (duplicate view) / delete (remove view).
      closeAll();
    });
  });

  // A click anywhere else inside the panel closes any open row menu.
  panel.addEventListener('click', closeAll);
}

function init(root) {
  const panel = root.querySelector('.dropdown__panel');

  // Reveal wiring runs for every dropdown (including static showcases), so
  // do it before the dropdown-init early-return below.
  if (panel) {
    initReveals(panel);
    initRowActions(panel);
  }

  if (root.dataset.dropdownInit === '1') return;
  root.dataset.dropdownInit = '1';

  const trigger = root.querySelector('.dropdown__trigger');
  if (!trigger || !panel) return;

  const stayOpen = root.dataset.dropdown === 'stay-open';
  const searchInput = root.querySelector('.dropdown__search-input');

  const open = () => {
    root.classList.add(OPEN_CLASS);
    trigger.setAttribute('aria-expanded', 'true');
    if (searchInput) searchInput.focus();
  };

  const close = () => {
    root.classList.remove(OPEN_CLASS);
    trigger.setAttribute('aria-expanded', 'false');
  };

  const toggle = () => {
    if (root.classList.contains(OPEN_CLASS)) close();
    else open();
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  // Close when an item is clicked (unless stay-open)
  panel.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown__item, .dropdown-item, .btn--alert');
    if (!item) return;
    // Toggle rows inside the panel must not close the dropdown.
    if (e.target.closest('.toggle, .dropdown__toggle-row')) return;
    if (!stayOpen) close();
  });

  // Click outside closes
  document.addEventListener('click', (e) => {
    if (!root.classList.contains(OPEN_CLASS)) return;
    if (root.contains(e.target)) return;
    close();
  });

  // Escape closes and returns focus to the trigger
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains(OPEN_CLASS)) {
      close();
      trigger.focus();
    }
  });

  // Search filtering
  if (searchInput) {
    const list = panel.querySelector('.dropdown__list');
    if (list) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        for (const item of list.children) {
          const label = (item.textContent || '').toLowerCase();
          item.style.display = !q || label.includes(q) ? '' : 'none';
        }
      });
    }
  }
}

function initAll(scope = document) {
  scope.querySelectorAll('.dropdown').forEach(init);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }
}

export { init, initAll };
