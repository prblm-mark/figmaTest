import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=68-4425',
  {
    props: {
      noLabel: figma.boolean('No Label', {
        true: 'info-label--no-label',
        false: '',
      }),
    },
    example: ({ noLabel }) => html`
      <button class="info-label ${noLabel}" aria-label="More information">
        <i data-lucide="info" aria-hidden="true"></i>
        <span class="info-label__text">Label</span>
      </button>
    `,
  }
)
