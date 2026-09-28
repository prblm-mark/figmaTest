/* StepsTable — "Show details" expands every step row; header checkbox selects all.
 *
 * Markup contract:
 *   <div class="datatables steps-table" data-steps-table>
 *     … <button class="toggle toggle--xxs" role="switch" data-steps-details …>
 *     … <thead> <input class="checkbox__input" data-steps-select-all>
 *     … <tbody> <tr class="datatables__row"> … <input class="checkbox__input" data-steps-select>
 *               <tr class="datatables__row-detail"> …
 *   Toggle.js owns the switch's own state and fires `toggle:change`.
 */
// TODO(backend:RecordScreen): row checkboxes select steps for bulk actions → bulk-action endpoint
//   (not designed yet). Rows, paging and "Show n" are static demo data → steps list endpoint.
(function () {
  'use strict';
  if (window.__stepsTableBound) return;
  window.__stepsTableBound = true;

  document.addEventListener('toggle:change', function (e) {
    var t = e.target.closest('[data-steps-details]');
    if (!t) return;
    var table = t.closest('[data-steps-table]');
    if (table) table.classList.toggle('steps-table--details', !!(e.detail && e.detail.active));
  });

  document.addEventListener('change', function (e) {
    var all = e.target.closest('[data-steps-select-all]');
    if (all) {
      var table = all.closest('[data-steps-table]');
      table.querySelectorAll('[data-steps-select]').forEach(function (cb) { cb.checked = all.checked; });
      return;
    }
    var one = e.target.closest('[data-steps-select]');
    if (one) {
      var t = one.closest('[data-steps-table]');
      var boxes = t.querySelectorAll('[data-steps-select]');
      var checked = t.querySelectorAll('[data-steps-select]:checked').length;
      var head = t.querySelector('[data-steps-select-all]');
      if (head) {
        head.checked = checked === boxes.length;
        head.indeterminate = checked > 0 && checked < boxes.length;
      }
    }
  });
})();
