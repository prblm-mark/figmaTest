import figma, { html } from '@figma/code-connect/html'

// Type controls toolbar content (Pagination = row-count select + Filter/Export;
// Search = search input + View/Export). Device variants are responsive — the
// .datatables--mobile-scroll modifier constrains to 24rem and triggers
// horizontal scroll. Overflow=Trigger uses kebab-row-expand markup with the
// hidden detail row revealed via :has(:checked) — pure CSS, no JS.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2562-8289',
  {
    props: {
      type: figma.enum('Type', {
        Pagination: 'pagination',
        Search: 'search',
      }),
      overflowContent: figma.enum('Overflow Content', {
        Scroll: 'scroll',
        Trigger: 'trigger',
      }),
    },
    example: () => html`
      <!-- Pagination · Desktop · Scroll -->
      <div class="datatables">
        <div class="datatables__toolbar">
          <span class="datatables__meta">
            <span>Show</span>
            <button type="button" class="datatables__select" aria-label="Rows per page">
              <span>10</span>
              <i data-lucide="chevron-down" aria-hidden="true"></i>
            </button>
            <span>of <strong>1,289</strong></span>
          </span>
          <div class="datatables__actions">
            <button type="button" class="btn btn--tertiary btn--sm">
              <i data-lucide="filter" aria-hidden="true"></i><span>Filter</span>
            </button>
            <button type="button" class="btn btn--tertiary btn--sm">
              <i data-lucide="download" aria-hidden="true"></i><span>Export</span>
            </button>
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th><button class="datatables__sort datatables__sort--active">Product <i data-lucide="arrow-up-narrow-wide" aria-hidden="true"></i></button></th>
              <th><button class="datatables__sort">Category <i data-lucide="chevrons-up-down" aria-hidden="true"></i></button></th>
              <th><button class="datatables__sort">Stock <i data-lucide="chevrons-up-down" aria-hidden="true"></i></button></th>
              <th><button class="datatables__sort">Price <i data-lucide="chevrons-up-down" aria-hidden="true"></i></button></th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Apple MacBook Pro 17"</td><td>Laptop</td><td>14</td><td>£2,999</td></tr>
            <tr><td>Apple Watch 5</td><td>Wearables</td><td>22</td><td>£399</td></tr>
          </tbody>
        </table>
        <div class="datatables__footer">
          <span>Showing <strong>1–5</strong> of <strong>1,289</strong> results</span>
          <div class="datatables__pagination" role="group" aria-label="Pagination">
            <button class="datatables__page-btn" aria-label="Previous"><i data-lucide="chevron-left" aria-hidden="true"></i></button>
            <button class="datatables__page-btn datatables__page-btn--active">1</button>
            <button class="datatables__page-btn">2</button>
            <button class="datatables__page-btn" aria-label="Next"><i data-lucide="chevron-right" aria-hidden="true"></i></button>
          </div>
        </div>
      </div>
    `,
  }
)
