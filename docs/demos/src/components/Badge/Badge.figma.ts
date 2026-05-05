import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2580-8904',
  {
    props: {
      type: figma.enum('Type', {
        Default: '',
        Border: 'badge--border',
        Pill: 'badge--pill',
        'Icon Left': '',
        Indicator: 'badge--pill',
        Dismissible: '',
      }),
      state: figma.enum('State', {
        Default: 'badge--default',
        Neutral: 'badge--neutral',
        Success: 'badge--success',
        Warning: 'badge--warning',
        Danger: 'badge--danger',
        Info: 'badge--info',
      }),
      size: figma.enum('Size', {
        sm: 'badge--sm',
        Default: '',
        lg: 'badge--lg',
      }),
    },
    example: ({ type, state, size }) => html`
      <span class="badge ${type} ${state} ${size}">Label</span>
    `,
  }
)
