import figma, { html } from '@figma/code-connect/html'

// Selector (code-first 2026-09-29; Figma 2026-09-30). One overlay per field; the mode is data-selector.
// Paired is Type=Single with two columns (the Article step lookup): record_markup.single_select_modal(columns=…).
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3941-23874', {
  props: { type: figma.enum('Type', { Single: 'single', Paired: 'single', Multi: 'multi', Media: 'media', Sort: 'sort' }) },
  example: ({ type }) => html`<div class="modal-overlay" id="modal-section" role="presentation" data-selector="${type}">
  <div class="modal filter-dropdowns__modal selector" role="dialog" aria-modal="true" aria-labelledby="modal-section-title">
    <!-- header · toolbar (search + facets) · results region (.modal__scroll) · footer (status + actions) -->
  </div>
</div>`,
})
