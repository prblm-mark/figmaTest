/* FilterItem — filter-chip behaviour. Auto-binds to every `.filter-item`.
 *
 * Markup contract (always render the full slot set; CSS hides what the state
 * doesn't use):
 *   <div class="filter-item" data-filter-name="Name">
 *     <button class="filter-item__clear">…×…</button>
 *     <button class="filter-item__trigger" aria-haspopup="listbox" aria-expanded="false">
 *       <i data-lucide="plus" class="filter-item__add"></i>
 *       <span class="filter-item__name">Name</span>
 *       <span class="filter-item__sep">·</span>
 *       <span class="filter-item__values"></span>
 *       <i data-lucide="chevron-down" class="filter-item__chevron"></i>
 *     </button>
 *   </div>
 *
 * Behaviour:
 *   - Trigger click toggles `.filter-item--open` + `aria-expanded` and emits
 *     `filter-item:toggle` (detail { open }). Mount your own value picker on this
 *     event — this component only owns the chip's own visual state.
 *   - Clear (×) click resets the chip to Default (drops `--selected`, empties the
 *     values) and emits `filter-item:clear`.
 *   - el.setFilterValues(values[]) sets the selected values with the Figma rollup:
 *       0       → reverts to Default
 *       1–3     → comma-joined ("Affino, Display, QA9")
 *       4+      → "<first>, and <n-1> more"
 *
 * TODO(backend:Filters): the value picker, the source list of filterable values,
 * and persistence are not part of this front-end chip → wire on `filter-item:toggle`.
 */

function rollup(values) {
  if (values.length <= 3) return values.join(', ');
  return `${values[0]}, and ${values.length - 1} more`;
}

function setFilterValues(root, values) {
  const list = Array.isArray(values) ? values.filter(Boolean) : [];
  const valuesEl = root.querySelector('.filter-item__values');

  if (!list.length) {
    root.classList.remove('filter-item--selected');
    if (valuesEl) valuesEl.textContent = '';
    return;
  }

  root.classList.add('filter-item--selected');
  // A selected chip is never the dashed "empty" placeholder.
  root.classList.remove('filter-item--empty');
  if (valuesEl) valuesEl.textContent = rollup(list);
}

function init(root) {
  if (root.dataset.filterItemInit === '1') return;
  root.dataset.filterItemInit = '1';

  const trigger = root.querySelector('.filter-item__trigger');
  const clear = root.querySelector('.filter-item__clear');

  // Public API for consumers / demos.
  root.setFilterValues = (values) => setFilterValues(root, values);

  if (trigger) {
    trigger.addEventListener('click', () => {
      const open = root.classList.toggle('filter-item--open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      root.dispatchEvent(new CustomEvent('filter-item:toggle', {
        bubbles: true,
        detail: { open },
      }));
    });
  }

  if (clear) {
    clear.addEventListener('click', (e) => {
      e.stopPropagation(); // don't also toggle the trigger
      setFilterValues(root, []);
      root.classList.remove('filter-item--open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      root.dispatchEvent(new CustomEvent('filter-item:clear', { bubbles: true }));
    });
  }
}

function initAll(scope = document) {
  scope.querySelectorAll('.filter-item').forEach(init);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }
}

export { init, initAll };
