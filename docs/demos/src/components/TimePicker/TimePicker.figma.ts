import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2522-1532',
  {
    props: {
      type: figma.enum('Type', {
        'Single input': 'tp tp--single',
        Duration: 'tp tp--segmented tp--duration',
        Timezone: 'tp tp--segmented tp--timezone',
        Range: 'tp-range',
        'Range Reveal': 'tp-reveal',
        Slots: 'tp-slots',
      }),
    },
    example: ({ type }) => html`
      <div class="${type}">
        <label class="tp__label">Pick a time</label>
        <div class="tp__field">
          <span class="tp__icon"><i data-lucide="clock" aria-hidden="true"></i></span>
          <input class="tp__control" type="text" value="11:30">
        </div>
      </div>
    `,
  }
)
