import figma, { html } from '@figma/code-connect/html'

// Single variant — no configurable props.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=169-3026',
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
