import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-2008', {
  example: () => html`<div class="viewer-list"><ul class="viewer-list__items"><!-- ViewerItem × n --></ul>
  <button type="button" class="btn btn--secondary btn--sm"><span>Add to Contact List</span></button></div>`,
})
