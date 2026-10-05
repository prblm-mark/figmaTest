/* RecordTabs — overflow navigation (designer, 2026-10-02).
 *
 * When the tabs don't fit their bar, every tab stays reachable:
 *   - touch:  native horizontal swipe (the list scrolls, see RecordTabs.css)
 *   - mouse:  drag the list sideways; a drag never opens a tab (the click that ends it is swallowed)
 *   - wheel:  vertical wheel scrolls the list sideways (trackpads scroll it natively)
 *   - keys:   Tab moves focus along the tabs and the focused one is brought into view
 *   - state:  the active tab is brought into view on load and whenever it changes
 *
 * `.record-tabs__list--scrollable` is set only while the list overflows (ResizeObserver, since
 * the bar's width changes with the docked menu without any window resize), and the grab cursor
 * keys on it. Auto-inits every `.record-tabs__list`; idempotent.
 */
(function () {
  'use strict';

  var DRAG_THRESHOLD = 4; /* px of movement before a press becomes a drag */

  function overflows(list) { return list.scrollWidth - list.clientWidth > 1; }

  /* Scroll just enough to show `tab` inside `list`, never the page. */
  function reveal(list, tab, smooth) {
    if (!tab) return;
    var l = list.getBoundingClientRect(), t = tab.getBoundingClientRect();
    var delta = t.left < l.left ? t.left - l.left : t.right > l.right ? t.right - l.right : 0;
    if (delta) list.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'auto' });
  }

  function active(list) { return list.querySelector('.record-tab--active, [aria-current="page"]'); }

  function init(list) {
    if (list.dataset.rtInit) return;
    list.dataset.rtInit = '1';

    function sync() { list.classList.toggle('record-tabs__list--scrollable', overflows(list)); }
    if (window.ResizeObserver) new ResizeObserver(sync).observe(list);
    sync();
    reveal(list, active(list), false);

    /* Mouse drag. Touch and pen keep the browser's own scrolling. */
    var press = null, suppressClick = false;
    list.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !overflows(list)) return;
      press = { x: e.clientX, left: list.scrollLeft, dragging: false, id: e.pointerId };
    });
    list.addEventListener('pointermove', function (e) {
      if (!press || e.pointerId !== press.id) return;
      var dx = e.clientX - press.x;
      if (!press.dragging && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!press.dragging) {
        press.dragging = true;
        list.classList.add('record-tabs__list--dragging');
        list.setPointerCapture(e.pointerId);
      }
      list.scrollLeft = press.left - dx;
    });
    function end(e) {
      if (!press || (e && e.pointerId !== press.id)) return;
      if (press.dragging) {
        suppressClick = true;
        list.classList.remove('record-tabs__list--dragging');
        setTimeout(function () { suppressClick = false; }, 0);
      }
      press = null;
    }
    list.addEventListener('pointerup', end);
    list.addEventListener('pointercancel', end);
    list.addEventListener('click', function (e) {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      suppressClick = false;
    }, true);
    /* Links are draggable by default: stop the browser's ghost-image drag stealing the gesture. */
    list.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* Wheel: turn a vertical wheel into a horizontal scroll, only while there is somewhere to go,
     * so the page still scrolls once the list reaches either end. */
    list.addEventListener('wheel', function (e) {
      if (!overflows(list) || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var max = list.scrollWidth - list.clientWidth;
      var next = Math.max(0, Math.min(max, list.scrollLeft + e.deltaY));
      if (next === list.scrollLeft) return;
      e.preventDefault();
      list.scrollLeft = next;
    }, { passive: false });

    /* Keyboard: keep the focused tab visible. */
    list.addEventListener('focusin', function (e) {
      var tab = e.target.closest('.record-tab');
      if (tab) reveal(list, tab, true);
    });

    /* Active tab changes in place on some screens (Contract Analysis): follow it. */
    new MutationObserver(function () { reveal(list, active(list), true); })
      .observe(list, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-current'] });
  }

  function boot() { document.querySelectorAll('.record-tabs__list').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
