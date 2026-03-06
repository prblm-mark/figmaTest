import figma, { html } from '@figma/code-connect/html'

// All portrait variants (Female 1/3/4/5, Male 2) are structurally identical.
// Clipping to a circle is the parent Avatar's responsibility.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=68-4785',
  {
    example: () => html`
      <img class="portrait" src="portrait.jpg" alt="User portrait">
    `,
  }
)
