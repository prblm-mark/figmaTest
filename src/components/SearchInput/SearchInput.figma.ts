import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2522-711',
  {
    props: {
      type: figma.enum('Type', {
        Basic: 'search',
        'Basic Icon Only': 'search',
        'Category Dropdown Search': 'search-group',
        Split: 'search-split',
        'Split Icon Only': 'search-split',
        'Locations Search': 'search-group',
        'Voice Search': 'search',
        Advanced: 'search-group',
      }),
      size: figma.enum('Size', {
        Default: '',
        sm: 'search--sm',
      }),
    },
    example: ({ type, size }) => html`
      <div class="${type} ${size}">
        <span class="search__icon"><i data-lucide="search" aria-hidden="true"></i></span>
        <input class="search__input" type="search" placeholder="Search">
        <button type="submit" class="search__action">Search</button>
      </div>
    `,
  }
)
