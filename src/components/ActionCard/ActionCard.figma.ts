import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2930-5757',
  {
    props: {
      // Action determines the trailing element. State=Hover is a CSS :hover,
      // not a separate example.
      action: figma.enum('Action', {
        Button: html`<button class="btn btn--tertiary btn--xs" type="button">
          <i data-lucide="plus" aria-hidden="true"></i>
          add
        </button>`,
        'Right Chevron': html`<i class="action-card__chevron" data-lucide="chevron-right" aria-hidden="true"></i>`,
      }),
    },
    example: ({ action }) => html`
      <div class="action-card">
        <p class="action-card__title">Campaign Dashboards</p>
        ${action}
      </div>
    `,
  }
)
