import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3861-1987', {
  props: {
    layout: figma.enum('Layout', { Wide: '', Stacked: '', Compact: 'field-row--compact' }), // Stacked = the RecordSection ≤559 container query, no class
    type: figma.enum('Type', { Text: '', Tags: '', Paragraph: 'field-row--paragraph', Media: 'field-row--media',
      Input: 'field-row--edit', Select: 'field-row--edit', TagBox: 'field-row--edit', Textarea: 'field-row--edit', 'Media Picker': 'field-row--edit',
      // code-first edit kinds, drawn 2026-09-30
      Lookup: 'field-row--edit', Checkbox: 'field-row--edit field-row--check', Date: 'field-row--edit', Datetime: 'field-row--edit',
      Image: 'field-row--edit', Multimedia: 'field-row--edit', Colour: 'field-row--edit', 'Rich Text': 'field-row--edit field-row--paragraph' }),
  },
  example: ({ layout, type }) => html`<div class="field-row ${layout} ${type}">
  <dt class="field-row__label">Title</dt>
  <dd class="field-row__value">Affino 9.0.11.25 - The Refinement Update</dd>
</div>`,
})

// ── Code-first types drawn 2026-10-10 (Radio, Static, Paragraph Collapsed / Expanded) ──────────────
// Each restricted to its Type on the SET (a variant URL never validates). Show Help / Help Text are
// set-level props used only by these types; the Input-based types carry help on their own Control.
// The "Show help" switch hides every .field-row__help on a data-help-mode="switch" screen.

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3861-1987', {
  variant: { Type: 'Radio' },
  props: {
    help: figma.boolean('Show Help', {
      true: html`<p class="input__help field-row__help" id="f-contacttype-help">${figma.string('Help Text')}</p>`,
      false: html``,
    }),
  },
  example: ({ help }) => html`<div class="field-row field-row--edit field-row--check field-row--has-help">
  <span class="field-row__label" id="f-contacttype-label">Contact Type</span>
  <div class="field-row__value">
    <div class="field-row__radios" role="radiogroup" aria-labelledby="f-contacttype-label">
      <label class="radio"><input type="radio" class="radio__input" name="f-contacttype" checked><span class="radio__indicator"></span><span class="radio__label"><span class="radio__label-text">Individual</span></span></label>
      <label class="radio"><input type="radio" class="radio__input" name="f-contacttype"><span class="radio__indicator"></span><span class="radio__label"><span class="radio__label-text">Organisation</span></span></label>
      <label class="radio"><input type="radio" class="radio__input" name="f-contacttype"><span class="radio__indicator"></span><span class="radio__label"><span class="radio__label-text">Other</span></span></label>
    </div>${help}
  </div>
</div>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3861-1987', {
  variant: { Type: 'Static' },
  props: {
    help: figma.boolean('Show Help', {
      true: html`<p class="input__help field-row__help" id="f-orderno-help">${figma.string('Help Text')}</p>`,
      false: html``,
    }),
  },
  example: ({ help }) => html`<div class="field-row field-row--edit field-row--has-help">
  <span class="field-row__label">Order Code</span>
  <div class="field-row__value"><p class="field-row__static" id="f-orderno" aria-describedby="f-orderno-help">ORD-100412</p>${help}</div>
</div>`,
})

// Collapsed / Expanded: the SAME markup — FieldRow.js wraps a long Paragraph (6 lines) or Rich (12)
// value in __clamp-body and adds the toggle; data-clamped / data-expanded carry the state.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3861-1987', {
  variant: { Type: 'Paragraph Collapsed' },
  example: () => html`<div class="field-row field-row--paragraph">
  <dt class="field-row__label">Blog Intro</dt>
  <dd class="field-row__value" data-field-clamp data-clamped style="--field-row-clamp-lines: 6">
    <div class="field-row__clamp-body">Long value…</div>
    <button type="button" class="btn btn--secondary btn--xs field-row__clamp-toggle" aria-expanded="false"><i data-lucide="chevron-down" aria-hidden="true"></i><span>Show more</span></button>
  </dd>
</div>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3861-1987', {
  variant: { Type: 'Paragraph Expanded' },
  example: () => html`<div class="field-row field-row--paragraph">
  <dt class="field-row__label">Blog Intro</dt>
  <dd class="field-row__value" data-field-clamp data-clamped data-expanded style="--field-row-clamp-lines: 6">
    <div class="field-row__clamp-body">Long value…</div>
    <button type="button" class="btn btn--secondary btn--xs field-row__clamp-toggle" aria-expanded="true"><i data-lucide="chevron-down" aria-hidden="true"></i><span>Show less</span></button>
  </dd>
</div>`,
})
