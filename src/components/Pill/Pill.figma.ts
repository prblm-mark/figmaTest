import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=68-4503',
  {
    props: {
      type: figma.enum('Type', {
        Success: '',
        Default: 'pill--default',
        Contrast: 'pill--contrast',
        Warning: 'pill--warning',
        Brand: 'pill--brand',
      }),
    },
    example: ({ type }) => html`
      <span class="pill ${type}">
        <span class="pill__label">Label</span>
      </span>
    `,
  }
)
