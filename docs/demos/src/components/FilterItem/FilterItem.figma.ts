import figma, { html } from '@figma/code-connect/html'

// Filter Item — faceted filter chip.
// Component set: node 2972:1058 (State × Rounded).
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2972-1058',
  {
    props: {
      rounded: figma.enum('Rounded', {
        True: 'filter-item--rounded',
        False: '',
      }),
      state: figma.enum('State', {
        Default: '',
        Empty: 'filter-item--empty',
        '1 Selected': 'filter-item--selected',
        '2 Selected': 'filter-item--selected',
        '3 Selected': 'filter-item--selected',
        '4+ Selected': 'filter-item--selected',
      }),
      filterName: figma.string('filterName'),
    },
    example: ({ rounded, state, filterName }) => html`
      <div class="filter-item ${rounded} ${state}" data-filter-name="${filterName}">
        <button type="button" class="filter-item__clear" aria-label="Clear ${filterName} filter">
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
        <button type="button" class="filter-item__trigger" aria-haspopup="listbox" aria-expanded="false">
          <i data-lucide="plus" class="filter-item__add" aria-hidden="true"></i>
          <span class="filter-item__name">${filterName}</span>
          <span class="filter-item__sep" aria-hidden="true">·</span>
          <span class="filter-item__values">Affino</span>
          <i data-lucide="chevron-down" class="filter-item__chevron" aria-hidden="true"></i>
        </button>
      </div>
    `,
  }
)
