import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-2099', {
  example: () => html`<ul class="advisory-list"><!-- AdvisoryItem × n --></ul>`,
})
