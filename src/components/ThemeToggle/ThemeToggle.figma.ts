import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2699-2052',
  {
    props: {
      state: figma.enum('State', {
        Light: 'light',
        Dark: 'dark',
      }),
    },
    example: ({ state }) => html`
      <div class="theme-toggle">
        <button class="theme-toggle__btn" type="button" data-theme-value="light" aria-pressed="${state === 'light' ? 'true' : 'false'}">
          <i data-lucide="sun" aria-hidden="true"></i>
          <span>Light</span>
        </button>
        <button class="theme-toggle__btn" type="button" data-theme-value="dark" aria-pressed="${state === 'dark' ? 'true' : 'false'}">
          <i data-lucide="moon" aria-hidden="true"></i>
          <span>Dark</span>
        </button>
      </div>
    `,
  }
)
