import figma, { html } from '@figma/code-connect/html'

// FilterDropdownItem — Figma component set 3032:18152.
// Type = Initial | Selected (check visibility); State = Default | Hover (:hover, CSS).
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3032-18152',
  {
    props: {
      type: figma.enum('Type', {
        Initial: '',
        Selected: 'filter-dropdown-item--selected',
      }),
      subText: figma.boolean('showSubText', {
        true: html`<span class="filter-dropdown-item__sub">Sub Text</span>`,
        false: html``,
      }),
    },
    // State=Hover is the CSS :hover state — no modifier class needed.
    example: ({ type, subText }) => html`
      <button type="button" class="filter-dropdown-item ${type}" data-filter-dropdown-item aria-pressed="false">
        <span class="filter-dropdown-item__text">
          <span class="filter-dropdown-item__name">Option name</span>
          ${subText}
        </span>
        <span class="filter-dropdown-item__check">
          <i data-lucide="circle-check" aria-hidden="true"></i>
        </span>
      </button>
    `,
  }
)
