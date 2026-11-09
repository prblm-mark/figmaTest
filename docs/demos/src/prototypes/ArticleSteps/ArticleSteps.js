/* ArticleSteps — the one behaviour Option A needs: "Show details" opens or closes EVERY row's
 * detail at once (there is no per-row expand).
 *
 * Toggle.js owns the switch itself (class + aria-checked, on a capture-phase click) and announces
 * `toggle:change`; this only listens, so the switch is never flipped twice. Rows are revealed with
 * the `hidden` attribute, not a CSS display rule — base.css holds [hidden] with !important. */
(function () {
  'use strict';
  var list = document.querySelector('[data-as-list]');
  var holder = list && list.querySelector('[data-as-details-toggle]');
  if (!holder) return;
  holder.addEventListener('toggle:change', function (event) {
    var on = !!(event.detail && event.detail.active);
    list.querySelectorAll('[data-as-detail]').forEach(function (row) { row.hidden = !on; });
  });
})();
