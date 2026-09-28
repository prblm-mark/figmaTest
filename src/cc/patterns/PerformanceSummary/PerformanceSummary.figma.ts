import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3867-2067', {
  example: () => html`<div class="performance-summary"><!-- StatCards, accounts, chart, totals, link --></div>`,
})
