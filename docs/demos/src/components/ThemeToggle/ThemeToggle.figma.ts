import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2699-2052',
  {
    /* Each button's pressed state is its OWN enum rather than one `state` prop compared inside
     * the template. The parser rejects a conditional as a placeholder — every `${}` must be a
     * destructured prop or a `figma.*()` call — so the branching has to live here. See
     * docs/code-connect.md. */
    props: {
      lightPressed: figma.enum('State', {
        Light: 'true',
        Dark: 'false',
      }),
      darkPressed: figma.enum('State', {
        Light: 'false',
        Dark: 'true',
      }),
    },
    example: ({ lightPressed, darkPressed }) => html`
      <div class="theme-toggle">
        <button class="theme-toggle__btn" type="button" data-theme-value="light" aria-pressed="${lightPressed}">
          <i data-lucide="sun" aria-hidden="true"></i>
          <span>Light</span>
        </button>
        <button class="theme-toggle__btn" type="button" data-theme-value="dark" aria-pressed="${darkPressed}">
          <i data-lucide="moon" aria-hidden="true"></i>
          <span>Dark</span>
        </button>
      </div>
    `,
  }
)
