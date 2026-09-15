/* Theme resolution for the demo pages and the client preview.
 * ==========================================================
 * Runs from <head>, before the body parses, so the page paints in the right theme once rather
 * than flashing the wrong one first.
 *
 * `data-theme` on <html> is how this system switches theme: setting it re-resolves every
 * `--ai-*` colour and nothing else has to change. "light" is the ABSENCE of the attribute, so
 * choosing light means removing it, not setting it to "light".
 *
 * ONE STORAGE KEY, SHARED. The choice persists in localStorage under 'demo-theme' — the same
 * key `src/components/ThemeToggle/ThemeToggle.js` writes and `src/components/dark-mode-toggle.js`
 * reads. That is what makes the preference follow a visitor from the preview page into the
 * planner and the component demos and back, with no query string threading through the links:
 * each page simply reads what the last one stored.
 *
 * PRECEDENCE, and why the stored value outranks the URL. A link carrying `?theme=dark` is a
 * SEED, not a command — it applies when the visitor has no preference yet. If the param won
 * every time, toggling to light and then following any link would snap back to dark, and the
 * toggle would look broken. So:
 *
 *   1. The 390px self-preview (`?frame=`) -> inherit the host page's theme, and store nothing.
 *      Five demos embed themselves in a frame to show the narrow layout; that frame must match
 *      the page around it, and what it renders is not a visitor choice. Keyed on the `frame=`
 *      param rather than on "am I in an iframe", so an unrelated embed still honours the
 *      visitor's stored preference instead of silently discarding it.
 *   2. A stored preference -> use it.
 *   3. `?theme=light|dark` -> use it, and store it as the visitor's preference.
 *   4. `data-theme-default` on <html> -> use it, and store it. This is how the client preview
 *      page seeds dark on a first visit without hard-coding the theme into its outgoing links.
 *   5. Nothing -> leave the document as authored. An internal demo page with no marker and no
 *      stored preference keeps its light default, unchanged.
 *
 * Every localStorage access is guarded: Safari in private mode throws on read and on write, and
 * a demo page failing to open is a far worse outcome than a preference failing to persist.
 */
(function () {
  var KEY = 'demo-theme';
  var root = document.documentElement;

  function valid(t) { return t === 'dark' || t === 'light' ? t : null; }

  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }

  var search = window.location.search;
  var param = valid((/[?&]theme=([a-z]+)/.exec(search) || [])[1]);

  /* 1. The self-preview frame: follow the host page and take no further part. Same-origin, so
        this is a plain property read; the guard is for the case where it is ever served
        cross-origin, where the frame keeps its own default rather than throwing. */
  if (!param && /[?&]frame=/.test(search) && window.parent !== window) {
    try { apply(valid(window.parent.document.documentElement.getAttribute('data-theme'))); }
    catch (e) { /* cross-origin */ }
    return;
  }

  var stored = null;
  try { stored = valid(window.localStorage.getItem(KEY)); } catch (e) { /* storage unavailable */ }

  /* 2, 3, 4 — first one that answers wins. */
  var theme = stored || param || valid(root.getAttribute('data-theme-default'));

  if (!theme) return;                                  /* 5 — leave the page as authored */

  apply(theme);
  try { window.localStorage.setItem(KEY, theme); } catch (e) { /* storage unavailable */ }
})();
