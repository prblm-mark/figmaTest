/* Toggle — on/off switch behaviour. Include once per page; binds nothing per element.
 *
 * Markup contract:
 *   <button type="button" class="toggle toggle--xxs" role="switch" aria-checked="false"
 *           aria-label="Only free seats">
 *     <span class="toggle__track"><span class="toggle__knob"></span></span>
 *   </button>
 *
 * Behaviour:
 *   - Click flips `.toggle--active` and keeps `aria-checked` in sync, then emits
 *     `toggle:change` (bubbles, detail { active }). Mount your own behaviour on that
 *     event — this component owns only the switch's own visual and ARIA state.
 *   - `.toggle--disabled`, `aria-disabled="true"` and a disabled <button> are all inert.
 *   - Keyboard comes free: it is a real <button>, so Space and Enter both fire click.
 *
 * WHY THIS FILE EXISTS. Toggle shipped CSS-only until 2026-08-26, so every consumer
 * re-implemented the same three-line flip inline — nine copies (Toggle's own demo,
 * Dropdown, StyleSettings, TableListing, HeaderGroup, AiChat twice, ControlHub,
 * ControlScreen). Two of those pages even commented "Toggle has no standalone JS file;
 * consumers wire .toggle clicks inline", while Dropdown.js and HeaderGroup.js both
 * described "the toggle's own click handler" — behaviour that did not exist. All nine were
 * removed when this landed.
 *
 * TWO DELIBERATE DESIGN CHOICES, both learned from those copies:
 *
 *   1. DELEGATED at the document, not bound per element. Three of the nine had already
 *      converged on delegation because the user-menu Dropdown injects toggles after parse,
 *      and a querySelectorAll pass at DOMContentLoaded never sees those.
 *
 *   2. CAPTURE phase. A delegated listener in the bubble phase runs *after* listeners on
 *      the element itself, so a consumer reading `.toggle--active` synchronously in its own
 *      click handler would see the pre-click state. Capture runs document-first, so the
 *      flip is already applied by the time any element handler reads it. Dropdown.js and
 *      HeaderGroup.js both hedge with a setTimeout for exactly this reason; with capture
 *      they no longer need to, though the hedge is harmless.
 *
 * Guarded so including the script twice does not double-flip.
 */
(function () {
  'use strict';

  if (window.__toggleReady) return;
  window.__toggleReady = true;

  function isInert(el) {
    return el.classList.contains('toggle--disabled') ||
           el.getAttribute('aria-disabled') === 'true' ||
           el.disabled === true;
  }

  document.addEventListener('click', function (event) {
    var el = event.target.closest ? event.target.closest('.toggle') : null;
    if (!el || isInert(el)) return;

    var active = el.classList.toggle('toggle--active');
    el.setAttribute('aria-checked', String(active));
    el.dispatchEvent(new CustomEvent('toggle:change', {
      bubbles: true,
      detail: { active: active }
    }));
  }, true); /* capture — see note 2 above */
})();
