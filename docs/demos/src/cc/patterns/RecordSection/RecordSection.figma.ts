import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3871-3259', {
  props: { width: figma.enum('Width', { Standard: '', Full: 'record-section--full' }) },
  example: ({ width }) => html`<section class="record-section ${width}" aria-labelledby="s1">
  <div class="record-section__header"><h2 class="record-section__title" id="s1">Navigation</h2></div>
  <dl class="record-section__body"><!-- FieldRow × n --></dl>
</section>`,
})
