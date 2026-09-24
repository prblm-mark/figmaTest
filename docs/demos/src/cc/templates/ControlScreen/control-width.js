/* Control Centre width mode — the shell's ONE full-width switch (2026-09-24).
 *
 * The full-width layout was built first as a Listing template (Figma 3788:16762), then drawn for
 * the Seating Planner (3808:125109) with the note that it "might" become a SITE-WIDE mode. So the
 * switch lives with the shell, not with any one screen: every CC screen reads the same attribute,
 * and a future site-wide toggle is one call here rather than one per screen.
 *
 *   window.ccWidth.apply('full' | 'standard')   → returns the mode applied
 *   window.ccWidth.fromUrl()                    → 'full' | 'standard' | null, from ?template=
 *
 * What `apply` does, and all it does:
 *   - `data-cc-width="<mode>"` on the shell root (`.cc-control`), for screens to scope against;
 *   - `.cc-control__page--flush`  on the page   — no padding, edge to edge (ControlScreen.css);
 *   - `.cc-control__chrome--flush` on the chrome — no rule under the CC header (ControlScreen.css);
 *   - a `cc:width` event on document, detail `{ mode }`, for anything that renders differently
 *     (the Listing's FilterItem shape, for one) to follow a runtime change.
 *
 * Everything else — what a screen's own panels do when flush — is that screen's CSS, keyed on the
 * page modifier or the attribute.
 *
 * `?template=full` is the demo's way in, kept from the Listing so existing links still work.
 *
 * TOGGLE-READY: there is no user toggle yet (still being agreed with the wider team). When there
 * is, it calls `apply()` and persists the choice. Kept out of the backend handover notes until the
 * designer says otherwise. */
(function () {
  var MODES = ['standard', 'full'];

  function apply(name) {
    var mode = MODES.indexOf(name) !== -1 ? name : 'standard';
    var full = mode === 'full';
    var shell = document.querySelector('.cc-control');
    if (!shell) return mode;
    shell.setAttribute('data-cc-width', mode);
    shell.querySelectorAll('.cc-control__page').forEach(function (el) {
      el.classList.toggle('cc-control__page--flush', full);
    });
    shell.querySelectorAll('.cc-control__chrome').forEach(function (el) {
      el.classList.toggle('cc-control__chrome--flush', full);
    });
    document.dispatchEvent(new CustomEvent('cc:width', { detail: { mode: mode } }));
    return mode;
  }

  function fromUrl() {
    var m = /[?&]template=(standard|full)/.exec(window.location.search);
    return m ? m[1] : null;
  }

  window.ccWidth = { apply: apply, fromUrl: fromUrl };
})();
