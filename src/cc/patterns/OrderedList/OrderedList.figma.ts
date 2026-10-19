import figma, { html } from '@figma/code-connect/html'

// OrderedList (CC) — code-first 2026-10-19, drawn natively in Figma the same day.
// Record screens render it via record_markup.py: edit_row(label, "ordered", tags=[…], modal=…) /
// view_row(label, "ordered", […]). OrderedList.js numbers the rows and disables the end arrows.

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4392-181669', {
  variant: { Kind: 'Fixed' },
  example: () => html`<div class="ordered-list" data-ordered-list>
  <ol class="ordered-list__items" aria-label="Content Group Priority" data-empty="None selected">
    <li class="ordered-list__row" data-ordered-list-key="articles">
      <span class="ordered-list__grip" data-ordered-list-grip title="Drag to reorder" aria-hidden="true"><i data-lucide="grip-vertical"></i></span>
      <span class="ordered-list__position">1</span>
      <span class="ordered-list__label">Articles</span>
      <span class="ordered-list__actions">
        <button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Move Articles up" data-ordered-list-move="up" disabled><i data-lucide="arrow-up" aria-hidden="true"></i></button>
        <button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Move Articles down" data-ordered-list-move="down"><i data-lucide="arrow-down" aria-hidden="true"></i></button>
      </span>
    </li>
  </ol>
  <input type="hidden" name="content-group-priority" value="articles" data-ordered-list-value>
  <p class="ordered-list__live" aria-live="polite" data-ordered-list-live></p>
</div>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4392-181669', {
  variant: { Kind: 'Selectable' },
  example: () => html`<div class="ordered-list" data-ordered-list>
  <ol class="ordered-list__items" aria-label="Contact Topics" data-empty="None selected">
    <li class="ordered-list__row" data-ordered-list-key="ai">
      <span class="ordered-list__grip" data-ordered-list-grip title="Drag to reorder" aria-hidden="true"><i data-lucide="grip-vertical"></i></span>
      <span class="ordered-list__position">1</span>
      <span class="ordered-list__label">AI</span>
      <span class="ordered-list__actions">
        <button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Move AI up" data-ordered-list-move="up" disabled><i data-lucide="arrow-up" aria-hidden="true"></i></button>
        <button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Move AI down" data-ordered-list-move="down" disabled><i data-lucide="arrow-down" aria-hidden="true"></i></button>
        <button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Remove AI" data-ordered-list-remove><i data-lucide="x" aria-hidden="true"></i></button>
      </span>
    </li>
  </ol>
  <input type="hidden" name="contact-topics" value="ai" data-ordered-list-value>
  <p class="ordered-list__live" aria-live="polite" data-ordered-list-live></p>
  <button type="button" class="btn btn--secondary btn--sm" data-ordered-list-select="modal-id" aria-haspopup="dialog"><span>Select</span></button>
</div>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4392-181669', {
  variant: { Kind: 'Empty' },
  example: () => html`<div class="ordered-list" data-ordered-list>
  <ol class="ordered-list__items" aria-label="Contact Topics" data-empty="None selected"></ol>
  <input type="hidden" name="contact-topics" value="" data-ordered-list-value>
  <p class="ordered-list__live" aria-live="polite" data-ordered-list-live></p>
  <button type="button" class="btn btn--secondary btn--sm" data-ordered-list-select="modal-id" aria-haspopup="dialog"><span>Select</span></button>
</div>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4392-181669', {
  variant: { Kind: 'View' },
  example: () => html`<ol class="ordered-list-view">
  <li>Articles</li>
  <li>Contacts</li>
</ol>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4392-30279', {
  props: {
    number: figma.string('Number'),
    label: figma.string('Label'),
    upDisabled: figma.enum('Position', { First: 'disabled', Middle: undefined, Last: undefined }),
    downDisabled: figma.enum('Position', { First: undefined, Middle: undefined, Last: 'disabled' }),
    remove: figma.boolean('Removable', {
      true: html`<button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Remove" data-ordered-list-remove><i data-lucide="x" aria-hidden="true"></i></button>`,
      false: undefined,
    }),
  },
  example: ({ number, label, upDisabled, downDisabled, remove }) => html`<li class="ordered-list__row" data-ordered-list-key="${label}">
  <span class="ordered-list__grip" data-ordered-list-grip title="Drag to reorder" aria-hidden="true"><i data-lucide="grip-vertical"></i></span>
  <span class="ordered-list__position">${number}</span>
  <span class="ordered-list__label">${label}</span>
  <span class="ordered-list__actions">
    <button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Move up" data-ordered-list-move="up" ${upDisabled}><i data-lucide="arrow-up" aria-hidden="true"></i></button>
    <button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Move down" data-ordered-list-move="down" ${downDisabled}><i data-lucide="arrow-down" aria-hidden="true"></i></button>
    ${remove}
  </span>
</li>`,
})
