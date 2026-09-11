/* SeatingHeader — drag-to-scroll for the room-plans carousel.
 * Include once per page; binds nothing per element.
 *
 * The carousel (`.seating-header__rooms`) hides its scrollbar, so this supplies the affordances
 * that replace it — a directional EDGE FADE for every input, click-and-drag for the mouse, and
 * desktop-only ARROW buttons:
 *
 *   - The FADE is the always-visible half, and the only one touch ever sees. This file just
 *     toggles `has-fade-start` / `has-fade-end` from scrollLeft; the mask itself is CSS.
 *     Added 2026-09-11, because `cursor: grab` alone is hover-only and mouse-only, so a
 *     touch user had no signal that the rail scrolled at all.
 *   - The ARROWS are the pointer-only *control*, added 2026-09-11: dragging works but is
 *     undiscoverable. Their visibility is pure CSS, keyed off the fade's classes; this file only
 *     handles the click. Desktop only — touch swipes natively.
 *   - The DRAG is the pointer-only half:
 *
 *       - TOUCH needs nothing here. A native overflow-x container already swipes, with the
 *         platform's own momentum and rubber-banding, and re-implementing that in JS is how
 *         carousels end up feeling wrong. Only `pointerType === 'mouse'` is handled.
 *       - MOUSE gets click-and-drag, which no browser gives natively.
 *       - KEYBOARD needs nothing either: the cards inside are real <button>s, so tabbing to
 *         one that is off-screen scrolls it into view. That is why the rail itself is
 *         deliberately NOT given a tabindex — it would add a focus stop announcing nothing.
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
    var scrollable = overflows(rail);
    rail.classList.toggle('is-scrollable', scrollable);

    /* The edge fade (see SeatingHeader.css) is DIRECTIONAL — a fade on both edges of a rail
     * scrolled hard to its end would advertise content that is not there. Both classes are
     * gated on `scrollable`, so a rail holding a single plan shows neither.
     *
     * Same 1px tolerance as `overflows`, and for the same reason: sub-pixel layout routinely
     * leaves scrollLeft a fraction short of its own maximum at the true end of the rail, and
     * an exact comparison would strand the end fade lit with nothing left to reach.
     *
     * scrollWidth is read straight rather than cached. It is a forced layout, and this runs on
     * every frame of a drag — but it is two integer reads on a three-card flex row, and a
     * cached maximum is precisely the kind of state that goes stale when a plan is added. */
    var max = rail.scrollWidth - rail.clientWidth;
    rail.classList.toggle('has-fade-start', scrollable && rail.scrollLeft > 1);
    rail.classList.toggle('has-fade-end', scrollable && rail.scrollLeft < max - 1);
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

  /* ── Arrows ───────────────────────────────────────────────────────────────
   *
   * Desktop-only prev/next buttons (designer, 2026-09-11), the pointer-only half of the pair the
   * edge fade opened: dragging works but nothing advertises it until you happen to press on the
   * rail, so these give a plain click target.
   *
   * WHEN THEY SHOW IS NOT DECIDED HERE. The CSS keys them off the rail's own `has-fade-start` /
   * `has-fade-end`, which already mean "there is more content this way" — so an arrow can never
   * disagree with the fade beside it, and the whole ends-behaviour (no prev arrow at the start,
   * no next arrow at the end) needs no code at all. All that is left is the click.
   *
   * A drag cannot start from an arrow: the pointerdown handler above tests
   * `closest('.seating-header__rooms')`, and an arrow is the rail's SIBLING, not its descendant —
   * which is the same structural fact that keeps it out of the mask and out of the renderer's
   * `innerHTML` rewrite. And a drag that happens to END on an arrow is swallowed by the capture
   * handler below before this bubble-phase listener ever runs. */

  /* One card plus one gap, measured rather than assumed: the card width is a token that differs
   * per breakpoint (280 desktop, a flexed floor on mobile) and the gap changes with it, so a
   * constant here would page by the wrong amount at one of the two. Falls back to the visible
   * width when there is no card to measure. */
  function stepOf(rail) {
    var card = rail.querySelector('.room-card');
    if (!card) return rail.clientWidth;
    var gap = parseFloat(getComputedStyle(rail).columnGap);
    return card.getBoundingClientRect().width + (gap || 0);
  }

  /* `matchMedia` is correct HERE and is not the layout-state use CLAUDE.md §4a forbids: this is a
   * motion PREFERENCE, not a width. Smooth scrolling started from script is not covered by the
   * CSS `scroll-behavior` the preference normally suppresses, so it has to be checked explicitly
   * or the arrows animate for someone who asked for no animation. */
  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  document.addEventListener('click', function (event) {
    var arrow = event.target.closest ? event.target.closest('.seating-header__arrow') : null;
    if (!arrow) return;

    var wrap = arrow.closest('.seating-header__carousel');
    var rail = wrap && wrap.querySelector(RAIL);
    if (!rail) return;

    var back = arrow.classList.contains('seating-header__arrow--prev');
    rail.scrollBy({
      left: (back ? -1 : 1) * stepOf(rail),
      behavior: reduced() ? 'auto' : 'smooth'
    });
  });

  /* Scroll does not bubble — but it DOES pass through the CAPTURE phase, so a single
   * document-level listener covers every rail, including any added later, with no
   * per-element binding and nothing to tear down.
   *
   * Deliberately not coalesced into scheduleSync: this must not lag the scroll it describes,
   * and the drag handler above writes `scrollLeft` directly, which fires this — so the fades
   * follow a mouse drag exactly as they follow a touch swipe. */
  document.addEventListener('scroll', function (event) {
    var el = event.target;
    /* Document-level scroll reports `document` (nodeType 9) as its target, not an element. */
    if (el && el.nodeType === 1 && el.matches && el.matches(RAIL)) syncOne(el);
  }, true);

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
