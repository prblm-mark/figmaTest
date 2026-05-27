import figma, { html } from '@figma/code-connect/html'

// CC-themed floating AI chat widget. Three Type variants — Initial / Processing
// / Response — share the same outer container; the Type axis drives the
// .chat-main--initial | --processing | --response state class.
figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4152-8323',
  {
    props: {
      type: figma.enum('Type', {
        Initial: 'chat-main--initial',
        Processing: 'chat-main--processing',
        Response: 'chat-main--response',
      }),
    },
    example: ({ type }) => html`
      <div class="ai-assistant" data-surface="chat">
        <div class="ai-assistant__resize-handle" aria-hidden="true"></div>
        <div class="chat-header chat-header--minimised ai-assistant__header">
          <div class="chat-header__container">
            <button class="btn btn--tertiary btn--sm btn--icon" aria-label="Toggle sidebar"><i data-lucide="panel-left" aria-hidden="true"></i></button>
            <div class="ai-assistant__title">Affino Assistant</div>
          </div>
          <div class="chat-header__window-buttons">
            <button class="btn btn--tertiary btn--sm btn--icon chat-header__maximize" aria-label="Maximise"><i data-lucide="maximize" aria-hidden="true"></i></button>
            <button class="btn btn--tertiary btn--sm btn--icon" aria-label="Close"><i data-lucide="x" aria-hidden="true"></i></button>
          </div>
        </div>
        <div class="ai-assistant__main">
          <!-- ChatMain renders inside this with the type-specific state above -->
          <div class="chat-main ${type}"><!-- … --></div>
        </div>
      </div>
    `,
  }
)
