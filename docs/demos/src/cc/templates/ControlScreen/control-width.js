/* Control Centre width mode — the shell's ONE full-width switch (2026-09-24).
 *
 * The full-width layout was built first as a Listing template (Figma 3788:16762), then drawn for
 * the Seating Planner (3808:125109) with the note that it "might" become a SITE-WIDE mode. So the
 * switch lives with the shell, not with any one screen: every CC screen reads the same attribute,
 * and a future site-wide toggle is one call here rather than one per screen.
 *
 *   window.ccWidth.apply('full' | 'standard')   → returns the mode applied
 *   window.ccWidth.fromUrl()                    → 'full' | 'standard' | null, from ?template=
 *   window.ccWidth.stored()                     → the viewer's saved choice, or null
 *   window.ccWidth.resolve()                    → URL, else saved choice, else 'standard'
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
 * THE TOGGLE (2026-09-28): the actions-rail full-width button (desktop rail + mobile sidebar rail; its own
 * unfold-horizontal / fold-horizontal icon since 2026-10-01 — `minimize-2` belongs to the older
 * framework's condensed view),
 * marked `data-cc-width-toggle` on EVERY CC screen — full width everywhere (designer). Clicking flips the mode,
 * keeps `aria-pressed` in step, saves the choice (localStorage `cc-width`, a per-viewer
 * convenience — it can be absent) so it follows the viewer between screens, and rewrites
 * `?template=` in place so a reload keeps what they chose. A server-side per-user preference is
 * the backend item (HANDOVER `full-width-preference`). */
(function () {
  var MODES = ['standard', 'full'];

  /* `trigger` is optional: the rail toggle passes 'toggle', so listeners can tell a viewer
     switching the mode from a page arriving in it (designer, 2026-10-02: switching ON full
     width closes the SidebarMenu — sidebar-menu.js — but loading a full-width page does not). */
  function apply(name, trigger) {
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
    document.dispatchEvent(new CustomEvent('cc:width', { detail: { mode: mode, trigger: trigger || null } }));
    return mode;
  }

  function fromUrl() {
    var m = /[?&]template=(standard|full)/.exec(window.location.search);
    return m ? m[1] : null;
  }

  var KEY = 'cc-width';

  function stored() {
    try { var v = window.localStorage.getItem(KEY); return MODES.indexOf(v) !== -1 ? v : null; }
    catch (e) { return null; }
  }

  function save(mode) {
    try { window.localStorage.setItem(KEY, mode); } catch (e) { /* private window: session only */ }
  }

  function resolve() { return fromUrl() || stored() || 'standard'; }

  function syncToggles(mode) {
    document.querySelectorAll('[data-cc-width-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(mode === 'full'));
    });
  }

  document.addEventListener('cc:width', function (e) { syncToggles(e.detail.mode); });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cc-width-toggle]');
    if (!btn) return;
    var shell = document.querySelector('.cc-control');
    var next = shell && shell.getAttribute('data-cc-width') === 'full' ? 'standard' : 'full';
    apply(next, 'toggle');
    save(next);
    if (fromUrl()) {
      var url = new URL(window.location.href);
      url.searchParams.set('template', next);
      window.history.replaceState(null, '', url);
    }
  });

  /* Scrolled state (designer, 2026-10-02). The flush chrome has no rule under it, which is right
     at rest — but once content scrolls beneath the header it needs one to separate them. The
     class is toggled at every width; the CSS only acts on it when the chrome is flush, so
     standard width (which always has the rule) is unaffected. Passive listener, and it only
     writes when the state actually changes. */
  function bindScrolled() {
    var shell = document.querySelector('.cc-control');
    if (!shell) return;
    var page = shell.querySelector('.cc-control__page');
    var chromes = shell.querySelectorAll('.cc-control__chrome');
    if (!page || !chromes.length) return;
    var was = null;
    function sync() {
      var now = page.scrollTop > 0;
      if (now === was) return;
      was = now;
      chromes.forEach(function (el) { el.classList.toggle('cc-control__chrome--scrolled', now); });
    }
    page.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindScrolled);
  else bindScrolled();

  window.ccWidth = { apply: apply, fromUrl: fromUrl, stored: stored, resolve: resolve };
})();

/* Control Centre density — the condensed view (2026-10-09). Lives here because every CC screen
 * already loads this file; it is the same shape as the width switch, on the other axis.
 *
 *   window.ccDensity.apply('condensed' | 'standard')   → returns the mode applied
 *
 * `data-cc-density="<mode>"` on `.cc-control`, `aria-pressed` on every `data-cc-condensed-toggle`
 * (the rail's Minimise button; CSS swaps fold-vertical / unfold-vertical on it), a `cc:density`
 * event, and the choice saved per viewer (localStorage `cc-density`). `?density=condensed` is the
 * demo's way in. Precedence at load: URL > saved > standard. Applied by this file on load — the
 * screens need no call of their own.
 *
 * Condensed is SPACING ONLY (Mark, 2026-10-09): table rows, record field rows and sections,
 * panels and the page tighten one step on the spacing scale; fonts and control heights stay.
 * The rules are in ControlScreen.css. Deliberately NOT `data-layout="minimised"` — that token set
 * is the AI chat's compact mode and only shrinks fluid font sizes, which CC screens barely use. */
(function () {
  var MODES = ['standard', 'condensed'];
  var KEY = 'cc-density';

  function apply(name, trigger) {
    var mode = MODES.indexOf(name) !== -1 ? name : 'standard';
    var shell = document.querySelector('.cc-control');
    if (!shell) return mode;
    shell.setAttribute('data-cc-density', mode);
    document.querySelectorAll('[data-cc-condensed-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(mode === 'condensed'));
    });
    document.dispatchEvent(new CustomEvent('cc:density', { detail: { mode: mode, trigger: trigger || null } }));
    return mode;
  }

  function fromUrl() {
    var m = /[?&]density=(standard|condensed)/.exec(window.location.search);
    return m ? m[1] : null;
  }

  function stored() {
    try { var v = window.localStorage.getItem(KEY); return MODES.indexOf(v) !== -1 ? v : null; }
    catch (e) { return null; }
  }

  function save(mode) {
    try { window.localStorage.setItem(KEY, mode); } catch (e) { /* private window: session only */ }
  }

  function resolve() { return fromUrl() || stored() || 'standard'; }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cc-condensed-toggle]');
    if (!btn) return;
    var shell = document.querySelector('.cc-control');
    var next = shell && shell.getAttribute('data-cc-density') === 'condensed' ? 'standard' : 'condensed';
    apply(next, 'toggle');
    save(next);
    if (fromUrl()) {
      var url = new URL(window.location.href);
      url.searchParams.set('density', next);
      window.history.replaceState(null, '', url);
    }
  });

  function init() { apply(resolve()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.ccDensity = { apply: apply, fromUrl: fromUrl, stored: stored, resolve: resolve };
})();
