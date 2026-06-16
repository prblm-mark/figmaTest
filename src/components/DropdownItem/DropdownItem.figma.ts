import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2699-2149',
  {
    props: {
      type: figma.enum('Type', {
        Default: '',
        Warning: 'dropdown-item--warning',
      }),
      state: figma.enum('State', {
        Default: '',
        Hover: 'is-hover',
      }),
      size: figma.enum('Size', {
        Default: '',
        sm: 'dropdown-item--sm',
      }),
    },
    example: ({ type, state, size }) => html`
      <button class="dropdown-item ${type} ${state} ${size}" type="button">
        <i data-lucide="star" aria-hidden="true"></i>
        <span data-text="Item label">Item label</span>
      </button>
    `,
  }
)
