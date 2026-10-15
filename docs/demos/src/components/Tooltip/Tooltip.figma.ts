import figma, { html } from '@figma/code-connect/html'

// Arrow = the side the arrow sits on (None / Top / Bottom / Left / Right) → .tooltip--arrow-<side>.
// Positioning (top, left, z-index) is the responsibility of the parent component.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=169-3025',
  {
    props: {
      arrow: figma.enum('Arrow', {
        None: '',
        Top: ' tooltip--arrow-top',
        Bottom: ' tooltip--arrow-bottom',
        Left: ' tooltip--arrow-left',
        Right: ' tooltip--arrow-right',
      }),
    },
    example: ({ arrow }) => html`
      <div class="tooltip${arrow}" role="tooltip">
        <p class="tooltip__text">Tooltip text goes here.</p>
      </div>
    `,
  }
)
