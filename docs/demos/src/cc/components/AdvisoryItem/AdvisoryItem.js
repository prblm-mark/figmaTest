/* AdvisoryItem — inline expand/collapse for SEO Health advisories.
 *
 * Markup contract:
 *   <div class="advisory-item">
 *     <div class="advisory-item__row"> … <button class="advisory-item__toggle"
 *          aria-expanded="false" aria-controls="adv-1" data-advisory-toggle> … </button></div>
 *     <p class="advisory-item__description" id="adv-1">…</p>
 *   </div>
 *   Optional "Expand all" button anywhere in an ancestor panel:
 *     <button data-advisory-expand-all aria-expanded="false">Expand all</button>
 *
 * Delegated at the document so items rendered later still work.
 */
(function () {
  'use strict';
  if (window.__advisoryItemBound) return;
  window.__advisoryItemBound = true;

  function setExpanded(item, open) {
    item.classList.toggle('advisory-item--expanded', open);
    var btn = item.querySelector('[data-advisory-toggle]');
    if (btn) {
      btn.setAttribute('aria-expanded', String(open));
      var title = item.querySelector('.advisory-item__title');
      btn.setAttribute('aria-label', (open ? 'Hide details: ' : 'Show details: ') + (title ? title.textContent.trim() : ''));
    }
  }

  function syncExpandAll(scope) {
    var all = scope.querySelector('[data-advisory-expand-all]');
    if (!all) return;
    var items = scope.querySelectorAll('.advisory-item');
    var allOpen = items.length > 0 && Array.prototype.every.call(items, function (i) {
      return i.classList.contains('advisory-item--expanded');
    });
    all.setAttribute('aria-expanded', String(allOpen));
    all.textContent = allOpen ? 'Collapse all' : 'Expand all';
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-advisory-toggle]');
    if (toggle) {
      var item = toggle.closest('.advisory-item');
      setExpanded(item, !item.classList.contains('advisory-item--expanded'));
      syncExpandAll(item.closest('.fact-panel') || document);
      return;
    }
    var expandAll = e.target.closest('[data-advisory-expand-all]');
    if (expandAll) {
      var scope = expandAll.closest('.fact-panel') || document;
      var open = expandAll.getAttribute('aria-expanded') !== 'true';
      scope.querySelectorAll('.advisory-item').forEach(function (i) { setExpanded(i, open); });
      syncExpandAll(scope);
    }
  });
})();
