import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-7446',
  {
    props: {
      // Hover is a CSS :hover state — no class needed.
      // Selected and Expanded are JS-toggled modifiers.
      state: figma.enum('Property 1', {
        Default: '',
        Hover: '',
        Selected: 'prompt-template-item--selected',
        Expanded: 'prompt-template-item--expanded',
      }),
    },
    example: ({ state }) => html`
      <div class="prompt-template-item ${state}" role="button" tabindex="0">
        <div class="prompt-template-item__header">
          <i class="prompt-template-item__icon" data-lucide="headset" aria-hidden="true"></i>
          <span class="prompt-template-item__title">Prompt title</span>
          <button class="prompt-template-item__chevron-btn" aria-label="Expand details">
            <i data-lucide="chevron-right" aria-hidden="true"></i>
          </button>
        </div>
        <div class="prompt-template-item__details">
          <p class="prompt-template-item__description">Prompt description text.</p>
        </div>
      </div>
    `,
  }
)
