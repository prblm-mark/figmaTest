import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-2136', {
  example: () => html`<section class="fact-panel" aria-labelledby="p1">
  <div class="fact-panel__header"><div class="fact-panel__title-block"><h2 class="fact-panel__title" id="p1">Meta Information</h2></div></div>
  <dl class="fact-list"><!-- FieldRow Layout=Compact × n --></dl>
</section>`,
})
