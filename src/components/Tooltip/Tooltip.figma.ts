import figma, { html } from '@figma/code-connect/html'

// Single variant — no configurable props.
// Positioning (top, left, z-index) is the responsibility of the parent component.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=169-3025',
  {
    example: () => html`
      <div class="tooltip" role="tooltip">
        Tooltip text goes here.
      </div>
    `,
  }
)
