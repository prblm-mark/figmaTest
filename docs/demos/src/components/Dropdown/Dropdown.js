/* Dropdown — open/close behaviour, click-outside dismiss, Escape to close,
 * search filtering. Auto-binds to every `.dropdown` on the page.
 *
 * Markup contract:
 *   <div class="dropdown" data-dropdown>
 *     <button class="dropdown__trigger" aria-expanded="false" aria-haspopup="menu">…</button>
 *     <div class="dropdown__panel" role="menu">…</div>
 *   </div>
 *
 * Behaviour modifiers via data attributes on the root `.dropdown`:
 *   data-dropdown="stay-open"   — keep panel open when an item is clicked
 *                                 (Checkbox variant uses this)
 *   data-dropdown-search        — enable search-input filtering of items
 *                                 inside the panel
 *
 * Open class on the root: `.is-open`. Trigger's aria-expanded mirrors it.
 */

const OPEN_CLASS = 'is-open';

function init(root) {
  if (root.dataset.dropdownInit === '1') return;
  root.dataset.dropdownInit = '1';

  const trigger = root.querySelector('.dropdown__trigger');
  const panel = root.querySelector('.dropdown__panel');
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
    const item = e.target.closest('.dropdown__item, .btn--alert');
    if (!item) return;
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
