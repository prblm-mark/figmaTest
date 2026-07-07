import figma, { html } from '@figma/code-connect/html'

// FilterDropdownItemGroup — Figma component set 3032:18397.
// A bordered card that stacks FilterDropdownItem rows. Property 1 toggles whether
// the child items render sub text; the container itself is identical either way.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3032-18397',
  {
    props: {
      subText: figma.enum('Property 1', {
        'w/Subtext': html`<span class="filter-dropdown-item__sub">Sub Text</span>`,
        'Default': html``,
      }),
    },
    example: ({ subText }) => html`
      <div class="filter-dropdown-item-group" role="listbox" aria-multiselectable="true">
        <button type="button" class="filter-dropdown-item filter-dropdown-item--selected" data-filter-dropdown-item aria-pressed="true">
          <span class="filter-dropdown-item__text">
            <span class="filter-dropdown-item__name">Selected option name</span>
            ${subText}
          </span>
          <span class="filter-dropdown-item__check"><i data-lucide="circle-check" aria-hidden="true"></i></span>
        </button>
        <button type="button" class="filter-dropdown-item" data-filter-dropdown-item aria-pressed="false">
          <span class="filter-dropdown-item__text">
            <span class="filter-dropdown-item__name">Option name</span>
            ${subText}
          </span>
          <span class="filter-dropdown-item__check"><i data-lucide="circle-check" aria-hidden="true"></i></span>
        </button>
      </div>
    `,
  }
)
