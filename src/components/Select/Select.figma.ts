import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-1995',
  {
    props: {
      type: figma.enum('Type', {
        Default: 'sel__control',
        Disabled: 'sel__control',
        Underline: 'sel__control sel__control--underline',
        Multiselect: 'sel__list',
        'Category Dropdown': 'sel-category',
      }),
      size: figma.enum('Size', {
        Default: '',
        sm: 'sel__control--sm',
      }),
    },
    example: ({ type, size }) => html`
      <div class="sel">
        <label class="sel__label">Label</label>
        <button class="${type} ${size}" type="button">
          <span class="sel__value">Selected value</span>
          <span class="sel__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>
        </button>
      </div>
    `,
  }
)
