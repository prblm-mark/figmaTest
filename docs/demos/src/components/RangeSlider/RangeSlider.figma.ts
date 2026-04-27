import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-1876',
  {
    props: {
      type: figma.enum('Type', {
        Counter: '',
        Default: '',
        Disabled: 'rs--disabled',
        Steps: '',
        Labels: '',
      }),
      size: figma.enum('Size', {
        Default: '',
        sm: 'rs--sm',
        lg: 'rs--lg',
      }),
    },
    example: ({ type, size }) => html`
      <div class="rs ${type} ${size}">
        <div class="rs__head">
          <label class="rs__label">Label</label>
          <span class="rs__value">50</span>
        </div>
        <div class="rs__wrap">
          <input class="rs__input" type="range" min="0" max="100" value="50">
          <span class="rs__thumb"></span>
        </div>
      </div>
    `,
  }
)
