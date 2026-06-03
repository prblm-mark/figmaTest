import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4218-5304',
  {
    example: () => html`
      <div class="cc-assistant-popover">
        <div class="cc-assistant-popover__header">
          <div class="cc-assistant-popover__brand">
            <span class="cc-assistant-popover__badge">
              <i data-lucide="sparkles" aria-hidden="true"></i>
            </span>
            <p class="cc-assistant-popover__title">Affino Assistant</p>
          </div>
          <button class="btn btn--tertiary btn--sm btn--icon cc-assistant-popover__close" type="button" aria-label="Close">
            <i data-lucide="x" aria-hidden="true"></i>
          </button>
        </div>
        <div class="cc-assistant-popover__body">
          <div class="cc-assistant-popover__intro">
            <p>Affino’s Assistant is great at providing in context support whilst you work in the control center.</p>
            <p>Stuck on screen? Launch the Affino Assistant from the Actions Menu to get moving.</p>
          </div>
          <button class="btn btn--primary cc-assistant-popover__launch" type="button">
            Launch
            <i data-lucide="arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `,
  }
)
