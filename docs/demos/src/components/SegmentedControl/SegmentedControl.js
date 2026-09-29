/* SegmentedControl — generic single-choice behaviour for a `.seg-control` radiogroup.
 *
 * Opt-in: only controls marked `data-seg-control` are bound, so screens that already wire their
 * own (the listing's Grid / Listing switch) are untouched.
 *
 * Markup contract:
 *   <div class="seg-control" role="radiogroup" aria-labelledby="…" data-seg-control>
 *     <button class="seg-control__btn seg-control__btn--active" type="button" role="radio"
 *             aria-checked="true" data-value="Left">…</button>
 *     …
 *   </div>
 *
 * Behaviour (WAI-ARIA radio group): click selects; roving tabindex (only the checked segment is
 * in the tab order); ← → ↑ ↓ move AND select, wrapping; Home / End jump to the ends. The chosen
 * value is mirrored to `data-value` on the root and announced as a bubbling
 * `seg-control:change` event with { value }.
 * Delegated at the document, bound once.
 */
(function () {
  'use strict';
  if (window.__segControlBound) return;
  window.__segControlBound = true;

  function buttons(root) {
    return Array.prototype.slice.call(root.querySelectorAll('.seg-control__btn'));
  }

  function select(root, btn, focus) {
    buttons(root).forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('seg-control__btn--active', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (focus) btn.focus();
    var value = btn.getAttribute('data-value') || btn.textContent.trim();
    if (root.getAttribute('data-value') === value) return;
    root.setAttribute('data-value', value);
    root.dispatchEvent(new CustomEvent('seg-control:change', { bubbles: true, detail: { value: value } }));
  }

  function init(root) {
    var all = buttons(root);
    var active = all.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0] || all[0];
    all.forEach(function (b) { b.tabIndex = b === active ? 0 : -1; });
    if (active) root.setAttribute('data-value', active.getAttribute('data-value') || active.textContent.trim());
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-seg-control] .seg-control__btn');
    if (btn && !btn.disabled) select(btn.closest('[data-seg-control]'), btn, false);
  });

  document.addEventListener('keydown', function (e) {
    var btn = e.target.closest && e.target.closest('[data-seg-control] .seg-control__btn');
    if (!btn) return;
    var root = btn.closest('[data-seg-control]');
    var all = buttons(root);
    var i = all.indexOf(btn);
    var next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = all[(i + 1) % all.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = all[(i - 1 + all.length) % all.length];
    else if (e.key === 'Home') next = all[0];
    else if (e.key === 'End') next = all[all.length - 1];
    if (!next) return;
    e.preventDefault();
    select(root, next, true);
  });

  function initAll() { document.querySelectorAll('[data-seg-control]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
