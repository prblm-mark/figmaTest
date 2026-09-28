import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3881-7518', {
  props: {
    details: figma.enum('Details', { Off: '', On: 'steps-table--details' }),
    width: figma.enum('Width', { Standard: '', Full: 'steps-table--full' }),
  },
  example: ({ details, width }) => html`<div class="datatables steps-table ${details} ${width}" data-steps-table>
  <!-- datatables__toolbar (Show n of N + Show details toggle), table, datatables__footer -->
</div>`,
})
