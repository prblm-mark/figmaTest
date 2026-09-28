import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3875-3331', {
  props: { state: figma.enum('State', { Empty: 'empty', Filled: 'filled' }) },
  example: () => html`<div class="media-picker">
  <span class="media-picker__thumb"><i data-lucide="image" aria-hidden="true"></i></span>
  <div class="media-picker__actions">
    <button type="button" class="btn btn--secondary btn--sm"><i data-lucide="pencil" aria-hidden="true"></i><span>Edit</span></button>
    <button type="button" class="btn btn--secondary btn--sm btn--icon" aria-label="Remove image"><i data-lucide="trash-2" aria-hidden="true"></i></button>
  </div>
</div>`,
})
