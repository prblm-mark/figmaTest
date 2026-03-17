import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2139-2674',
  {
    props: {
      type: figma.enum('Type', {
        Default: '',
        Desktop: '',
      }),
    },
    example: ({ type }) => html`
      <button class="suggested-question" type="button">
        <i data-lucide="message-circle-question" aria-hidden="true"></i>
        <div class="suggested-question__body">
          <p class="suggested-question__text">Question title here</p>
          <p class="suggested-question__subtext">Optional subtitle (visible on desktop)</p>
        </div>
      </button>
    `,
  },
)
