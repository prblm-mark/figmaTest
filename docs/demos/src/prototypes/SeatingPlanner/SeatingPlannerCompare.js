/* Seating Planner — toolbar options review board (2026-08-04)
 *
 * Two jobs, both about making the comparison honest:
 *
 * 1. THE WIDTH SWITCHER. Sets --cmp-w so every frame renders at the same real
 *    device width. The frames are fixed-width, never 1fr — the first version of
 *    this board let them stretch and they rendered at 534px, which is 144px more
 *    room than a real phone and made every option look better than it is.
 *
 * 2. THE MEASURED READOUT. Each caption reports the width the iframe is ACTUALLY
 *    rendering at, read back from the DOM rather than assumed. If the CSS ever
 *    starts stretching them again, the number says so instead of the board quietly
 *    lying. That is the failure it exists to catch.
 *
 * The switcher lives on the review board, not inside the prototypes — the demo
 * switcher was deliberately removed from the design itself on 2026-07-31.
 */
(function () {
  'use strict';

  var DEFAULT_W = 390;   /* iPhone 14/15/16 logical width */

  function frames() {
    return [].slice.call(document.querySelectorAll('.cmp__iframe'));
  }

  function report() {
    var want = parseInt(getComputedStyle(document.documentElement)
                          .getPropertyValue('--cmp-w'), 10);
    frames().forEach(function (f) {
      var out = f.closest('.cmp__frame').querySelector('.cmp__measured');
      if (!out) return;
      /* Reading getBoundingClientRect forces layout, so this is accurate the
         moment it is called — no need to wait for a frame. */
      var w = Math.round(f.getBoundingClientRect().width);
      /* Flag a mismatch loudly rather than showing a comforting number. */
      out.textContent = (want && w !== want) ? w + 'px ⚠ expected ' + want : w + 'px';
    });
  }

  function setWidth(w) {
    document.documentElement.style.setProperty('--cmp-w', w + 'px');
    [].slice.call(document.querySelectorAll('.cmp__wbtn')).forEach(function (b) {
      b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-w')) === w));
    });
    /* Synchronous: the rect read below forces the reflow itself. An earlier version
       deferred this through two nested requestAnimationFrames, which left the
       readout stale wherever rAF does not run — headless virtual time being the
       case that caught it. Nothing here needs a frame boundary. */
    report();
  }

  function init() {
    setWidth(DEFAULT_W);

    document.addEventListener('click', function (e) {
      var b = e.target.closest('.cmp__wbtn');
      if (!b) return;
      setWidth(Number(b.getAttribute('data-w')));
    });

    /* Frames finish loading after the first measurement, so re-read then. */
    frames().forEach(function (f) { f.addEventListener('load', report); });
    window.addEventListener('resize', report);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
