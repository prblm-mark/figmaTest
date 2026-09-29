import figma, { html } from '@figma/code-connect/html'

// Set 3905:140931 — State (Collapsed / Expanded). Layout B (designer, 2026-09-29): caption +
// "Image details" Dropdown; Expanded is Dropdown.js's `.is-open`, not a class you write.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3905-140931', {
  props: {
    alt: figma.string('Alt text'),
  },
  example: ({ alt }) => html`<div class="media-meta">
  <img class="media-meta__thumb" src="thumb.jpg" alt="${alt}">
  <div class="media-meta__summary">
    <div class="media-meta__caption">${alt}</div>
    <div class="dropdown media-meta__info" data-dropdown="stay-open">
      <button type="button" class="btn btn--secondary btn--xs dropdown__trigger" aria-expanded="false" aria-haspopup="dialog"><i data-lucide="info" aria-hidden="true"></i><span>Image details</span></button>
      <div class="dropdown__panel media-meta__panel" role="dialog" aria-label="Image details">
        <dl class="media-meta__list"><dt class="media-meta__term">Alt text</dt><dd class="media-meta__value">${alt}</dd></dl>
      </div>
    </div>
  </div>
</div>`,
})
