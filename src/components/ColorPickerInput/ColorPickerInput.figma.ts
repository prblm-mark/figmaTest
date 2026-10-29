import figma, { html } from '@figma/code-connect/html'

// ColorPickerInput (Figma set 3929:19338). Form=Display: swatch + hex over a whole-box native picker
// (StyleSettings, AI Chat; each screen wires its own script). Form=Editable (2026-10-29, record screens):
// the hex is a typed field, the swatch opens the picker, Clear empties to None — ColorPickerInput.js.
// The swatch colour is record data, not a token.

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3929-19338', {
  variant: { Form: 'Display' },
  props: {
    value: figma.enum('State', { Empty: 'None', Filled: '#1A56DB' }),
  },
  example: ({ value }) => html`<div class="color-picker-input">
  <span class="color-picker-input__swatch"><span class="color-picker-input__swatch-inner"></span></span>
  <span class="color-picker-input__value">${value}</span>
  <input type="color" class="color-picker-input__native" aria-label="Accent colour">
</div>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3929-19338', {
  variant: { Form: 'Editable' },
  props: {
    mods: figma.enum('State', {
      Empty: 'color-picker-input--empty',
      Filled: '',
      Focus: '',
      Error: 'color-picker-input--error color-picker-input--empty',
    }),
    value: figma.enum('State', { Empty: '', Filled: '#1A56DB', Focus: '#1A56DB', Error: '#1A56' }),
    hidden: figma.enum('State', { Empty: 'hidden', Filled: 'hidden', Focus: 'hidden', Error: '' }),
  },
  example: ({ mods, value, hidden }) => html`<div class="color-picker-input color-picker-input--editable ${mods}" data-color-input>
  <span class="color-picker-input__swatch"><span class="color-picker-input__swatch-inner"></span><input type="color" class="color-picker-input__native" aria-label="Pick Background Colour" tabindex="-1"></span>
  <input type="text" class="color-picker-input__value" id="f-bg" value="${value}" placeholder="None" spellcheck="false" autocomplete="off" aria-describedby="f-bg-error">
  <button type="button" class="color-picker-input__clear" aria-label="Clear Background Colour"><i data-lucide="x" aria-hidden="true"></i></button>
</div>
<span class="input__help color-picker-input__error" id="f-bg-error" ${hidden}>Enter a 6-digit hex colour, like #1A56DB, or leave it empty.</span>`,
})
