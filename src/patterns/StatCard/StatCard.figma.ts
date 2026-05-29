import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2758-3020',
  {
    props: {
      size: figma.enum('Size', {
        Base: '',
        Lg: 'stat-card--lg',
      }),
      type: figma.enum('Type', {
        Default: '',
        'Chevron Down': '',          // adds .stat-card__chevron with chevron-down icon
        'Chevron Right': '',         // adds .stat-card__chevron with chevron-right icon
        'No card': 'stat-card--no-card',
        'Number First': 'stat-card--number-first',
      }),
    },
    example: ({ size, type }) => html`
      <div class="stat-card ${size} ${type}">
        <div class="stat-card__icon-wrap"><i data-lucide="mail" aria-hidden="true"></i></div>
        <div class="stat-card__text">
          <p class="stat-card__title">Message Opens</p>
          <p class="stat-card__value">330</p>
        </div>
      </div>
    `,
  }
)
