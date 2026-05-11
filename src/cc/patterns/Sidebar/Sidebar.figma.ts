import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4055-10681',
  {
    props: {
      device: figma.enum('Device', {
        Desktop: '',
        Mobile: 'cc-sidebar--mobile',
      }),
    },
    example: ({ device }) => html`
      <nav class="cc-sidebar ${device}" role="toolbar" aria-label="Workspace switcher">
        <div class="cc-sidebar__brand" role="img" aria-label="Affino"></div>
        <button class="cc-sidebar__btn cc-sidebar__btn--active" aria-current="true">
          <i data-lucide="sliders-vertical"></i>
        </button>
        <!-- More rail buttons follow… -->
      </nav>
    `,
  }
)
