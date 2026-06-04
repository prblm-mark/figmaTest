import figma, { html } from '@figma/code-connect/html'

// Toast — component set 2856:3020 (Affino AI Design System).
// Figma exposes a single "Type" enum with 10 values; in code this maps to a
// status × fill model (--info/--success/--danger/--warning + optional --color)
// plus two standalone layout types (--notification, --interactive). The example
// below shows the status-toast structure; the Notification and Interactive
// layouts use different inner markup — see Toast.html / Toast.figma-notes.md.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2856-3020',
  {
    props: {
      type: figma.enum('Type', {
        Info: 'toast--info',
        Success: 'toast--success',
        Danger: 'toast--danger',
        Warning: 'toast--warning',
        'Info Color': 'toast--info toast--color',
        'Success Color': 'toast--success toast--color',
        'Danger Color': 'toast--danger toast--color',
        'Warning Color': 'toast--warning toast--color',
        Notification: 'toast--notification',
        Interactive: 'toast--interactive',
      }),
    },
    example: ({ type }) => html`
      <div class="toast ${type}" role="status">
        <span class="toast__icon"><i data-lucide="info" aria-hidden="true"></i></span>
        <p class="toast__message">Your changes have been saved.</p>
        <button type="button" class="toast__close" aria-label="Dismiss">
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
      </div>
    `,
  }
)
