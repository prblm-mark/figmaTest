import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3881-7518', {
  props: {
    details: figma.enum('Details', { Off: '', On: 'steps-table--details' }),
    width: figma.enum('Width', { Standard: '', Full: 'steps-table--full' }),
  },
  // Runs on the listing engine (ListingScreen.js + LISTING_SCREENS['article-steps']) since 2026-09-29:
  // the thead/tbody/pagination are rendered from the config; Width=Full is the shell's ?template=full.
  example: ({ details, width }) => html`<div class="cc-listing" data-listing="article-steps">
  <div class="datatables datatables--orders steps-table ${details} ${width}" data-steps-table>
    <!-- datatables__toolbar: Show n of N · Show details toggle · Edit Columns · Settings -->
    <!-- datatables__body > table [data-listing-head] [data-listing-body] · datatables__footer -->
  </div>
</div>`,
})
