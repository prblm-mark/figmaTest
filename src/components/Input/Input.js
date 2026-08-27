/* Input — stepper behaviour for `.input--stepper`.
 *
 * Include once per page; binds nothing per element. Everything else Input does is CSS-only
 * (the clear button uses `:has(:not(:placeholder-shown))`), so this file exists solely for
 * the − / + buttons.
 *
 * Markup contract:
 *   <div class="input input--stepper">
 *     <label class="input__label" for="qty">Quantity</label>
 *     <div class="input__wrap">
 *       <button type="button" class="input__step input__step--dec"
 *               data-input-step="-1" aria-controls="qty" aria-label="Decrease">
 *         <i data-lucide="minus" aria-hidden="true"></i>
 *       </button>
 *       <input id="qty" type="number" class="input__control" value="12" min="1" max="99">
 *       <button type="button" class="input__step input__step--inc"
 *               data-input-step="1" aria-controls="qty" aria-label="Increase">
 *         <i data-lucide="plus" aria-hidden="true"></i>
 *       </button>
 *     </div>
 *   </div>
 *
 * Behaviour:
 *   - Honours `min`, `max` and `step` on the input, clamping to the bounds.
 *   - DISABLES a button once its bound is reached, so the control cannot produce an invalid
 *     value at all — and because it is a real `disabled`, the button also leaves the tab order
 *     and reports itself to assistive tech, rather than just looking unavailable.
 *   - Emits `input` and `change` so listeners and form validation react exactly as they would
 *     to typing. Without these, a framework binding or a validation handler would never see
 *     the new value.
 *   - Typing is not intercepted: the field stays a real `<input type="number">`, so arrow
 *     keys, scroll, and paste all keep working. The buttons are an addition, not a
 *     replacement.
 *
 * Guarded so including the script twice does not double-bind — a lesson from Select.js, whose
 * trigger is a toggle and so cancelled itself out when double-included (2026-08-27).
 */
(function () {
  'use strict';

  if (window.__inputStepperReady) return;
  window.__inputStepperReady = true;

  function controlFor(button) {
    var id = button.getAttribute('aria-controls');
    if (id) {
      var byId = document.getElementById(id);
      if (byId) return byId;
    }
    /* Falls back to the field beside it, so the markup works without aria-controls — though
     * the label association is worth having for its own sake. */
    var wrap = button.closest('.input__wrap');
    return wrap ? wrap.querySelector('.input__control') : null;
  }

  function numberOr(value, fallback) {
    var n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }

  /* Decimal steps accumulate float error (0.1 + 0.2), so the result is rounded to the
   * precision the step itself implies. */
  function roundToStep(value, step) {
    var decimals = (String(step).split('.')[1] || '').length;
    return decimals ? parseFloat(value.toFixed(decimals)) : Math.round(value);
  }

  function syncButtons(control) {
    var wrap = control.closest('.input__wrap');
    if (!wrap) return;

    var min = numberOr(control.getAttribute('min'), null);
    var max = numberOr(control.getAttribute('max'), null);
    var value = numberOr(control.value, null);

    Array.prototype.forEach.call(wrap.querySelectorAll('[data-input-step]'), function (btn) {
      var dir = numberOr(btn.getAttribute('data-input-step'), 0);
      /* An empty field disables nothing — the first press should be able to seed a value. */
      if (value === null) { btn.disabled = false; return; }
      if (dir < 0 && min !== null) btn.disabled = value <= min;
      else if (dir > 0 && max !== null) btn.disabled = value >= max;
      else btn.disabled = false;
    });
  }

  function step(control, direction) {
    var stepAttr = numberOr(control.getAttribute('step'), 1);
    var min = numberOr(control.getAttribute('min'), null);
    var max = numberOr(control.getAttribute('max'), null);

    /* An empty field starts from min if there is one, else 0 — so the first press lands on a
     * valid value rather than on NaN. */
    var current = numberOr(control.value, min !== null ? min - stepAttr * direction : 0);
    var next = roundToStep(current + stepAttr * direction, stepAttr);

    if (min !== null && next < min) next = min;
    if (max !== null && next > max) next = max;
    if (String(next) === control.value) return;

    control.value = String(next);
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }

  document.addEventListener('click', function (event) {
    var btn = event.target.closest ? event.target.closest('[data-input-step]') : null;
    if (!btn || btn.disabled) return;

    var control = controlFor(btn);
    if (!control) return;

    step(control, numberOr(btn.getAttribute('data-input-step'), 0) < 0 ? -1 : 1);
    syncButtons(control);
    /* Focus follows the value, so a keyboard user who has stepped to a bound (and had that
     * button disabled underneath them) is not left with focus on nothing. */
    if (document.activeElement === btn && btn.disabled) control.focus();
  });

  /* Typing or arrow-keying past a bound must update the buttons too, not just clicking them. */
  document.addEventListener('input', function (event) {
    var control = event.target;
    if (control.classList && control.classList.contains('input__control') &&
        control.closest('.input--stepper')) {
      syncButtons(control);
    }
  });

  function initAll() {
    Array.prototype.forEach.call(
      document.querySelectorAll('.input--stepper .input__control'),
      syncButtons
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  /* Exposed so a consumer that injects steppers, or changes min/max at runtime, can re-sync
   * without waiting for an interaction. */
  window.inputStepperSync = initAll;
})();
