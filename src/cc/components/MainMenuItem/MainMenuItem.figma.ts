import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4057-2802',
  {
    props: {
      state: figma.enum('State', {
        Default: '',
        Hover: '',  // CSS :hover handles this
        Selected: 'cc-main-menu-item--selected',
        Expanded: 'cc-main-menu-item--expanded',
      }),
    },
    example: ({ state }) => html`
      <button class="cc-main-menu-item ${state}">
        <span class="cc-main-menu-item__icon"><i data-lucide="file-text"></i></span>
        <span class="cc-main-menu-item__label">Publish</span>
        <span class="cc-main-menu-item__chevron"><i data-lucide="chevron-down"></i></span>
      </button>
    `,
  }
)
