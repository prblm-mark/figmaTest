import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-64',
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
