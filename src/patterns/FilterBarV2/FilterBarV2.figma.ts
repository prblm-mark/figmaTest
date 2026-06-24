import figma, { html } from '@figma/code-connect/html'

// Filter Bar — V2 (two-row filter toolbar with explicit Export). Component set 2977:3811.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2977-3811',
  {
    props: {
      mode: figma.enum('Type', {
        Default: '',
        'Filter Active': '',
        'Views dropdown': '',
        'New View': 'filter-bar-v2--new-view',
        Wrapping: '',
        'Save View': 'filter-bar-v2--save-view',
        Search: 'filter-bar-v2--search',
        Actions: '',
      }),
    },
    example: ({ mode }) => html`
      <div class="filter-bar-v2 ${mode}">
        <div class="filter-bar-v2__row filter-bar-v2__row--top">
          <div class="filter-bar-v2__lead">
            <div class="dropdown filter-bar-v2__views" data-dropdown>
              <button type="button" class="dropdown__trigger filter-bar-v2__views-trigger" aria-haspopup="menu" aria-expanded="false">
                <span class="filter-bar-v2__views-label">All Orders</span>
                <i data-lucide="chevron-down" class="filter-bar-v2__views-chevron" aria-hidden="true"></i>
              </button>
              <div class="dropdown__panel dropdown__panel--filter-views" role="menu" aria-label="Saved views"><!-- saved views --></div>
            </div>
          </div>
          <div class="filter-bar-v2__actions">
            <button type="button" class="btn btn--secondary filter-bar-v2__export"><i data-lucide="download" aria-hidden="true"></i>Export</button>
            <div class="input filter-bar-v2__search-bar"><div class="input__wrap"><i data-lucide="search" class="input__icon" aria-hidden="true"></i><input type="search" class="input__control" placeholder="Search" aria-label="Search"></div></div>
            <button type="button" class="filter-bar-v2__icon-btn" data-filter-action="search" aria-label="Search"><i data-lucide="search" aria-hidden="true"></i></button>
            <div class="dropdown filter-bar-v2__menu" data-dropdown>
              <button type="button" class="dropdown__trigger filter-bar-v2__icon-btn" aria-haspopup="menu" aria-label="More actions"><i data-lucide="ellipsis-vertical" aria-hidden="true"></i></button>
              <div class="dropdown__panel" role="menu" aria-label="Actions"><!-- Some action / Generate Shipping Labels --></div>
            </div>
          </div>
        </div>
        <div class="filter-bar-v2__row">
          <div class="filter-bar-v2__chips">
            <div class="filter-item filter-item--rounded" data-filter-name="Name">
              <button type="button" class="filter-item__trigger" aria-haspopup="listbox"><i data-lucide="plus" class="filter-item__add" aria-hidden="true"></i><span class="filter-item__name">Name</span></button>
            </div>
            <div class="filter-item filter-item--rounded filter-item--empty filter-bar-v2__add" data-filter-name="Add Filters">
              <button type="button" class="filter-item__trigger" aria-haspopup="listbox"><i data-lucide="plus" class="filter-item__add" aria-hidden="true"></i><span class="filter-item__name">Add Filters</span></button>
            </div>
          </div>
        </div>
      </div>
    `,
  }
)
