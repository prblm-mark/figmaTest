import figma, { html } from '@figma/code-connect/html'

// Filter Bar — V1 (single-row filter toolbar). Component set 2975:2303.
// `Type` is a set of toolbar scenarios → mapped to the JS mode classes; the
// dropdown-open / chip-selected scenarios are runtime states, not classes.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2975-2303',
  {
    props: {
      mode: figma.enum('Type', {
        Default: '',
        'Filter active': '',
        'View Dropdown': '',
        'New View': 'filter-bar-v1--new-view',
        Wrapping: '',
        Search: 'filter-bar-v1--search',
        Actions: '',
        Dropdowns: '',
      }),
    },
    example: ({ mode }) => html`
      <div class="filter-bar-v1 ${mode}">
        <div class="filter-bar-v1__main">
          <div class="dropdown filter-bar-v1__views" data-dropdown>
            <button type="button" class="dropdown__trigger filter-bar-v1__views-trigger" aria-haspopup="menu" aria-expanded="false">
              <span class="filter-bar-v1__views-label">All Orders</span>
              <i data-lucide="chevron-down" class="filter-bar-v1__views-chevron" aria-hidden="true"></i>
            </button>
            <div class="dropdown__panel dropdown__panel--filter-views" role="menu" aria-label="Saved views"><!-- saved views --></div>
          </div>
          <div class="filter-bar-v1__chips">
            <div class="filter-item filter-item--empty" data-filter-name="Name">
              <button type="button" class="filter-item__trigger" aria-haspopup="listbox"><i data-lucide="plus" class="filter-item__add" aria-hidden="true"></i><span class="filter-item__name">Name</span></button>
            </div>
          </div>
        </div>
        <div class="filter-bar-v1__actions">
          <button type="button" class="filter-bar-v1__icon-btn" data-filter-action="search" aria-label="Search"><i data-lucide="search" aria-hidden="true"></i></button>
          <div class="dropdown filter-bar-v1__menu" data-dropdown>
            <button type="button" class="dropdown__trigger filter-bar-v1__icon-btn" aria-haspopup="menu" aria-label="More actions"><i data-lucide="ellipsis-vertical" aria-hidden="true"></i></button>
            <div class="dropdown__panel" role="menu" aria-label="Actions"><!-- Export / Generate Shipping Labels --></div>
          </div>
        </div>
      </div>
    `,
  }
)
