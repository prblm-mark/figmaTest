import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2758-3140',
  {
    props: {
      size: figma.enum('Size', {
        Base: '',
        lg: 'upgrade-card--lg',
      }),
      type: figma.enum('Type', {
        Update: '',
        'No updates': '',
      }),
    },
    example: ({ size }) => html`
      <div class="upgrade-card ${size}">
        <div class="upgrade-card__text">
          <p class="upgrade-card__version">Version 8.0.33.10</p>
          <p class="upgrade-card__status">Update available</p>
        </div>
        <button type="button" class="btn btn--primary btn--sm">Update</button>
      </div>
    `,
  }
)
