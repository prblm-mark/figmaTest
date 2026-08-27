/* SeatingHeader — drag-to-scroll for the room-plans carousel.
 * Include once per page; binds nothing per element.
 *
 * The carousel (`.seating-header__rooms`) hides its scrollbar, so this supplies the
 * affordance that replaces it:
 *
 *   - TOUCH needs nothing from this file. A native overflow-x container already swipes,
 *     with the platform's own momentum and rubber-banding, and re-implementing that in JS
 *     is how carousels end up feeling wrong. Only `pointerType === 'mouse'` is handled.
 *   - MOUSE gets click-and-drag, which no browser gives natively.
 *   - KEYBOARD needs nothing either: the cards inside are real <button>s, so tabbing to one
 *     that is off-screen scrolls it into view. That is why the rail itself is deliberately
 *     NOT given a tabindex — it would add a focus stop that announces nothing.
 *
 * `is-scrollable` is added only when the content actually overflows, so a bar holding one
 * plan does not offer a grab cursor that does nothing.
 *
 * TWO THINGS THIS HAS TO GET RIGHT, both learned the hard way in carousels:
 *
 *   1. A drag must not activate what it ended on. Every card is a select trigger and
 *      carries edit/delete buttons, so a 200px drag that happens to finish over "Delete"
 *      must not delete anything. Hence the movement THRESHOLD: under it the press stays an
 *      ordinary click, over it the click is swallowed in the capture phase.
 *   2. `preventDefault()` is NOT called on pointerdown. It would stop the card buttons
 *      taking focus, breaking the keyboard path above. Text selection is suppressed with
 *      `user-select` while dragging instead.
 *
 * Guarded so including the script twice does not double-bind.
 */
(function () {
  'use strict';

  if (window.__seatingHeaderReady) return;
  window.__seatingHeaderReady = true;

  var RAIL = '.seating-header__rooms';
  var THRESHOLD = 5; /* px of movement before a press counts as a drag */

  /* Sub-pixel layout can leave scrollWidth a hair over clientWidth with nothing to
   * scroll, so compare with a 1px tolerance rather than for any difference at all. */
  function overflows(rail) {
    return rail.scrollWidth - rail.clientWidth > 1;
  }

  function syncOne(rail) {
    rail.classList.toggle('is-scrollable', overflows(rail));
  }

  function syncAll() {
    Array.prototype.forEach.call(document.querySelectorAll(RAIL), syncOne);
  }

  /* ── drag state ─────────────────────────────────────────────────────────── */
  var rail = null;        /* the rail currently under the pointer */
  var startX = 0;
  var startScroll = 0;
  var dragging = false;   /* has the THRESHOLD been passed? */
  var swallowClick = false;

  document.addEventListener('pointerdown', function (event) {
    /* A fresh press always starts with a clean slate — see the note on swallowClick below. */
    swallowClick = false;

    /* Touch and pen scroll natively; only the mouse needs help. Primary button only. */
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    var el = event.target.closest ? event.target.closest(RAIL) : null;
    if (!el || !overflows(el)) return;

    rail = el;
    startX = event.clientX;
    startScroll = el.scrollLeft;
    dragging = false;
  });

  document.addEventListener('pointermove', function (event) {
    if (!rail) return;

    var dx = event.clientX - startX;

    if (!dragging) {
      if (Math.abs(dx) < THRESHOLD) return;
      dragging = true;
      rail.classList.add('is-dragging');
    }

    rail.scrollLeft = startScroll - dx;
    /* Suppresses the native text/element drag once we have taken over. */
    event.preventDefault();
  });

  function endDrag() {
    if (!rail) return;

    rail.classList.remove('is-dragging');

    /* Only a real drag swallows the click that follows. Cleared on the next pointerdown
     * AND after being used, rather than on a timer — a drag released outside the window
     * fires no click at all, and a flag cleared by setTimeout would then still be set
     * when the user's next genuine click arrived. */
    if (dragging) swallowClick = true;

    rail = null;
    dragging = false;
  }

  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);

  /* Capture phase, so this runs before the card's own click handlers rather than after
   * they have already acted. */
  document.addEventListener('click', function (event) {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener('dragstart', function (event) {
    if (dragging) event.preventDefault();
  });

  /* ── keeping is-scrollable honest ───────────────────────────────────────── */

  /* Coalesced to one pass per frame. syncAll reads scrollWidth, which forces layout, and
   * the mutation source below is noisy: lucide's createIcons() replaces every <i> with an
   * <svg>, so an un-debounced observer would flush layout ~40 times at startup. */
  var pending = false;
  function scheduleSync() {
    if (pending) return;
    pending = true;
    var run = function () {
      pending = false;
      syncAll();
    };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else setTimeout(run, 0);
  }

  /* The first pass is synchronous, so `is-scrollable` is already correct on the first
   * paint rather than a frame later. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAll);
  } else {
    syncAll();
  }

  /* Width changes flip overflow on and off. */
  window.addEventListener('resize', scheduleSync);

  /* So does adding or removing a plan, which resizes nothing — the rail is already full
   * width — so a ResizeObserver alone would miss it. */
  if (window.MutationObserver) {
    new MutationObserver(scheduleSync).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  /* Exposed so a consumer that injects plans can re-sync without waiting for the
   * observer, and so tests can measure a settled state. */
  window.seatingHeaderSync = syncAll;
})();
