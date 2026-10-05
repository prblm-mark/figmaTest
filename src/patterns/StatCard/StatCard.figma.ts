import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2758-3020',
  {
    props: {
      size: figma.enum('Size', {
        Sm: 'stat-card--sm',
        Base: '',
        Lg: 'stat-card--lg',
        Xl: 'stat-card--xl',
      }),
      type: figma.enum('Type', {
        Default: '',
        'Chevron Down': '',          // adds .stat-card__chevron with chevron-down icon
        'Chevron Right': '',         // adds .stat-card__chevron with chevron-right icon
        'No card': 'stat-card--no-card',
        'Number First': 'stat-card--number-first',
      }),
      fill: figma.enum('Fill', {
        'Blue': '',   // default
        'Mid Blue': 'stat-card--mid-blue',
        'Dark Blue': 'stat-card--dark-blue',
        'Emerald': 'stat-card--emerald',
        'Orange': 'stat-card--orange',
        'Pink': 'stat-card--pink',
        'Red': 'stat-card--red',
        'Green': 'stat-card--green',
        'Purple': 'stat-card--purple',
        'Indigo': 'stat-card--indigo',
        'Blue Radix': 'stat-card--blue-radix',
        'Teal Radix': 'stat-card--teal-radix',
        'Green Radix': 'stat-card--green-radix',
        'Jade': 'stat-card--jade',
        'Lagoon': 'stat-card--lagoon',
        'Orange Radix': 'stat-card--orange-radix',
        'Red Radix': 'stat-card--red-radix',
        'Violet Radix': 'stat-card--violet-radix',
        'Lime Radix': 'stat-card--lime-radix',
        'Blue Soft': 'stat-card--blue stat-card--soft',
        'Mid Blue Soft': 'stat-card--mid-blue stat-card--soft',
        'Dark Blue Soft': 'stat-card--dark-blue stat-card--soft',
        'Emerald Soft': 'stat-card--emerald stat-card--soft',
        'Orange Soft': 'stat-card--orange stat-card--soft',
        'Pink Soft': 'stat-card--pink stat-card--soft',
        'Red Soft': 'stat-card--red stat-card--soft',
        'Green Soft': 'stat-card--green stat-card--soft',
        'Purple Soft': 'stat-card--purple stat-card--soft',
        'Indigo Soft': 'stat-card--indigo stat-card--soft',
        'Blue Radix Soft': 'stat-card--blue-radix stat-card--soft',
        'Teal Radix Soft': 'stat-card--teal-radix stat-card--soft',
        'Green Radix Soft': 'stat-card--green-radix stat-card--soft',
        'Jade Soft': 'stat-card--jade stat-card--soft',
        'Lagoon Soft': 'stat-card--lagoon stat-card--soft',
        'Orange Radix Soft': 'stat-card--orange-radix stat-card--soft',
        'Red Radix Soft': 'stat-card--red-radix stat-card--soft',
        'Violet Radix Soft': 'stat-card--violet-radix stat-card--soft',
        'Lime Radix Soft': 'stat-card--lime-radix stat-card--soft',
      }),
    },
    example: ({ size, type, fill }) => html`
      <div class="stat-card ${size} ${type} ${fill}">
        <div class="stat-card__icon-wrap"><i data-lucide="mail" aria-hidden="true"></i></div>
        <div class="stat-card__text">
          <p class="stat-card__title">Message Opens</p>
          <p class="stat-card__value">330</p>
        </div>
      </div>
    `,
  }
)

/* Size=Xl (built in Figma 2026-10-02, variants 3976:1810 / 1830 / 1850): a headline KPI with a different
 * structure (head + value + ruled breakdown), so it gets its own mapping. Fill keeps the same enum. */
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2758-3020',
  {
    variant: { Size: 'Xl' },
    props: {
      title: figma.string('Title'),
      number: figma.string('Number'),
      meta: figma.boolean('Meta', { true: html`<p class="stat-card__meta">Paid orders · inc tax</p>`, false: undefined }),
      breakdown: figma.boolean('Breakdown', {
        true: html`<dl class="stat-card__breakdown" aria-label="Other currencies">
          <div class="stat-card__breakdown-item"><dt class="stat-card__breakdown-label">USD</dt><dd class="stat-card__breakdown-value">$1,000.00</dd></div>
          <div class="stat-card__breakdown-item"><dt class="stat-card__breakdown-label">EUR</dt><dd class="stat-card__breakdown-value">€2,115.00</dd></div>
        </dl>`,
        false: undefined,
      }),
      fill: figma.enum('Fill', {
        'Lagoon': 'stat-card--lagoon',
        'Jade': 'stat-card--jade',
        'Violet Radix': 'stat-card--violet-radix',
      }),
    },
    example: ({ title, number, meta, breakdown, fill }) => html`
      <div class="stat-card stat-card--xl ${fill}">
        <div class="stat-card__head">
          <div class="stat-card__icon-wrap"><i data-lucide="receipt-pound-sterling" aria-hidden="true"></i></div>
          <div class="stat-card__text">
            <p class="stat-card__title">${title}</p>
            ${meta}
          </div>
        </div>
        <p class="stat-card__value">${number} <span class="stat-card__unit">GBP</span></p>
        ${breakdown}
      </div>
    `,
  }
)
