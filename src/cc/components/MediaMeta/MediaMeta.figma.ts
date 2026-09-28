import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3861-1922', {
  example: () => html`<div class="media-meta">
  <img class="media-meta__thumb" src="thumb.jpg" alt="…">
  <dl class="media-meta__list"><dt class="media-meta__term">Alt text</dt><dd class="media-meta__value">…</dd></dl>
</div>`,
})
