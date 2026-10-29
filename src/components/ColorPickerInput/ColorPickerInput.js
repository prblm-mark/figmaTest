/* ColorPickerInput — Editable form (`.color-picker-input--editable`, code-first 2026-10-29).
 *
 * v1 parity (AfcForm EditForm.cfm / CheckForm.cfm): the colour is a text field you can type or paste
 * into, the swatch opens a picker, empty is allowed ("None" — the record falls back to its default),
 * and anything else must be a 6-digit hex. Friendlier than v1 on input: a leading # is optional, a
 * 3-digit shorthand expands (#1AD → #11AADD), surrounding spaces are ignored, and the field shows
 * the tidy uppercase #RRGGBB once you leave it.
 *
 * Markup contract (record_markup.edit_row kind "color"):
 *   <div class="color-picker-input color-picker-input--editable [color-picker-input--empty]" data-color-input data-value="#RRGGBB|">
 *     <span class="color-picker-input__swatch"><span class="color-picker-input__swatch-inner"></span>
 *       <input type="color" class="color-picker-input__native" aria-label="Pick … colour"></span>
 *     <input type="text" class="color-picker-input__value" placeholder="None" aria-describedby="<id>-error">
 *     <button type="button" class="color-picker-input__clear" aria-label="Clear …">x</button>
 *   </div>
 *   <span class="input__help color-picker-input__error" id="<id>-error" hidden>…</span>
 *
 * Output: the root's data-value only ever holds a VALID value ("#RRGGBB" or "" for None) — a half-typed
 * "#1A" never escapes, so a consumer (StylePreview) can't push an invalid colour. Every change fires a
 * bubbling `color-picker-input:change` with { value }. Delegated at the document, bound once.
 */
(function () {
  'use strict';
  if (window.__colorPickerInputBound) return;
  window.__colorPickerInputBound = true;

  var ROOT = '.color-picker-input--editable';

  /* "#1a56db" | "1A56DB" | "#1ad" → "#1A56DB" / "#11AADD"; "" → ""; anything else → null (invalid). */
  function normalise(raw) {
    var v = String(raw || '').trim().replace(/^#/, '');
    if (v === '') return '';
    if (/^[0-9a-f]{3}$/i.test(v)) v = v.replace(/(.)/g, '$1$1');
    return /^[0-9a-f]{6}$/i.test(v) ? '#' + v.toUpperCase() : null;
  }

  function parts(root) {
    return {
      text: root.querySelector('.color-picker-input__value'),
      native: root.querySelector('.color-picker-input__native'),
      inner: root.querySelector('.color-picker-input__swatch-inner'),
      error: document.getElementById((root.querySelector('.color-picker-input__value').getAttribute('aria-describedby') || '').split(' ').filter(function (id) { return /-error$/.test(id); })[0] || '')
    };
  }

  function setError(root, on) {
    var p = parts(root);
    root.classList.toggle('color-picker-input--error', on);
    if (on) p.text.setAttribute('aria-invalid', 'true'); else p.text.removeAttribute('aria-invalid');
    if (p.error) {
      p.error.hidden = !on;
      if (on) p.error.setAttribute('role', 'alert'); else p.error.removeAttribute('role');
    }
  }

  /* Apply a VALID value ("#RRGGBB" or "") to the swatch, the native picker and data-value. */
  function apply(root, value) {
    var p = parts(root);
    root.classList.toggle('color-picker-input--empty', value === '');
    p.inner.style.backgroundColor = value;                 /* record data, not a design value */
    if (value) p.native.value = value.toLowerCase();
    if (root.getAttribute('data-value') === value) return;
    root.setAttribute('data-value', value);
    root.dispatchEvent(new CustomEvent('color-picker-input:change', { bubbles: true, detail: { value: value } }));
  }

  /* Typing: follow along while the text is valid; judge it only when the field is left. */
  document.addEventListener('input', function (e) {
    var root = e.target.closest && e.target.closest(ROOT);
    if (!root) return;
    var p = parts(root);
    if (e.target === p.native) {
      p.text.value = p.native.value.toUpperCase();
      setError(root, false);
      apply(root, p.text.value);
      return;
    }
    if (e.target !== p.text) return;
    var v = normalise(p.text.value);
    if (v !== null) { setError(root, false); apply(root, v); }
  });

  document.addEventListener('change', function (e) {
    var root = e.target.closest && e.target.closest(ROOT);
    if (!root) return;
    var p = parts(root);
    if (e.target !== p.text) return;
    var v = normalise(p.text.value);
    if (v === null) { setError(root, true); return; }
    p.text.value = v;                                     /* tidy: #RRGGBB, uppercase */
    setError(root, false);
    apply(root, v);
  });

  document.addEventListener('click', function (e) {
    var clear = e.target.closest && e.target.closest('.color-picker-input__clear');
    if (clear) {
      var root = clear.closest(ROOT);
      var p = parts(root);
      p.text.value = '';
      setError(root, false);
      apply(root, '');
      p.text.focus();
      p.text.dispatchEvent(new Event('input', { bubbles: true }));   /* field listeners see the change */
      return;
    }
    /* A click on the box's empty space puts the caret in the hex field. */
    var box = e.target.closest && e.target.closest(ROOT);
    if (box && e.target === box) parts(box).text.focus();
  });

  function init() {
    document.querySelectorAll(ROOT).forEach(function (root) {
      var v = normalise(parts(root).text.value);
      if (v === null) setError(root, true);
      else { root.classList.toggle('color-picker-input--empty', v === ''); root.setAttribute('data-value', v); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.ColorPickerInput = { normalise: normalise };
})();
