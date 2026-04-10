import figma, { html } from '@figma/code-connect/html'

// Single variant — no configurable props.
figma.connect(
  'https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-7662',
  {
    example: () => html`
      <div class="prompt-templates">
        <div class="prompt-templates__heading">
          <h2 class="prompt-templates__title">Prompt Templates</h2>
          <p class="prompt-templates__description">Choose a prompt template to get started.</p>
        </div>
        <div class="prompt-templates__list">
          <!-- prompt-template-item components here -->
        </div>
      </div>
    `,
  }
)
