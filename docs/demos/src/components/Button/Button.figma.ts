import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=53-2489',
  {
    props: {
      type: figma.enum('Type', {
        Primary: 'btn--primary',
        Secondary: 'btn--secondary',
        Tertiary: 'btn--tertiary',
        Alert: 'btn--alert',
        // Alert Outline uses Outline=True boolean in Figma, not a separate Type value
      }),
      size: figma.enum('Size', {
        base: '',
        sm: 'btn--sm',
      }),
      iconOnly: figma.boolean('Icon Only', {
        true: 'btn--icon',
        false: '',
      }),
    },
    example: ({ type, size, iconOnly }) => html`
      <button class="btn ${type} ${size} ${iconOnly}">
        <i data-lucide="chevron-right" aria-hidden="true"></i>
        Label
        <i data-lucide="arrow-right" aria-hidden="true"></i>
      </button>
    `,
  }
)
