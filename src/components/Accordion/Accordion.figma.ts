import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-2622',
  {
    props: {
      type: figma.enum('Type', {
        Default: '',
        'Separated Cards': 'acc--separated',
        'All Open': '',
        Flush: 'acc--flush',
        Nested: '',
      }),
      size: figma.enum('Size', {
        Default: '',
        sm: 'acc--sm',
      }),
      mode: figma.enum('Type', {
        'All Open': 'multi',
        Default: 'single',
        'Separated Cards': 'single',
        Flush: 'single',
        Nested: 'single',
      }),
    },
    example: ({ type, size, mode }) => html`
      <div class="acc ${type} ${size}" data-acc="${mode}">
        <div class="acc__item acc__item--open">
          <h3 class="acc__heading">
            <button type="button" class="acc__trigger" data-acc-trigger>
              <span>What is Affino?</span>
              <span class="acc__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>
            </button>
          </h3>
          <div class="acc__panel">
            <p>Affino is a unified business platform.</p>
          </div>
        </div>
        <div class="acc__item">
          <h3 class="acc__heading">
            <button type="button" class="acc__trigger" data-acc-trigger>
              <span>Is there a free trial?</span>
              <span class="acc__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>
            </button>
          </h3>
          <div class="acc__panel">
            <p>Schedule a guided demo.</p>
          </div>
        </div>
      </div>
    `,
  }
)
