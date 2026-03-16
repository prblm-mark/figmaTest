import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2126-4901',
  {
    props: {
      state: figma.enum('State', {
        Default: '',
        Hover: 'hover',
      }),
    },
    example: ({ state }) => html`
      <div class="msg-bubble">
        <div class="msg-bubble__question">
          <p class="msg-bubble__text">
            Can you explain page views, and how they are saved in Affino?
          </p>
        </div>
        <div class="msg-bubble__actions">
          <button
            class="btn btn--tertiary btn--sm btn--icon"
            aria-label="Copy message"
          >
            <i data-lucide="copy" aria-hidden="true"></i>
          </button>
          <button
            class="btn btn--tertiary btn--sm btn--icon"
            aria-label="Copy link"
          >
            <i data-lucide="link" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `,
  },
)
