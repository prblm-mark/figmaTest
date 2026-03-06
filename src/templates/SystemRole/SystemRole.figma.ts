import figma, { html } from '@figma/code-connect/html'

// Three variants:
// - Default (163:3894): full-screen modal, activated by JS adding .system-role--open
// - Minimised (169:2466): 400px floating panel, JS adds .system-role--minimised + data-layout="minimised"
// - Mobile (176:3242): full-viewport layout, activated by CSS @media (max-width: 767px)
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=163-3895',
  {
    props: {
      variant: figma.enum('Type', {
        Default: '',
        Minimised: 'system-role--minimised',
        // Mobile variant is activated by CSS @media (max-width: 767px) — no modifier class
        Mobile: '',
      }),
    },
    example: ({ variant }) => html`
      <div class="system-role-overlay"></div>

      <div class="system-role ${variant}">
        <div class="system-role__top">
          <header class="header">
            <div class="header__title-group">
              <h1 class="header__title">System Role</h1>
              <button class="info-label" aria-label="More information">
                <i data-lucide="info" aria-hidden="true"></i>
                <span class="info-label__text">Info label</span>
              </button>
            </div>
            <div class="header__actions">
              <button class="btn btn--primary system-role__btn-default" disabled>Make Live</button>
              <button class="btn btn--alert-outline system-role__btn-discard" hidden>Discard Changes</button>
              <button class="btn btn--primary system-role__btn-save" hidden>Make Live</button>
            </div>
          </header>
          <div class="system-role__controls">
            <button class="btn btn--tertiary btn--icon system-role__minimize-btn" aria-label="Minimise">
              <i data-lucide="panel-right-dashed" aria-hidden="true"></i>
            </button>
            <button class="btn btn--tertiary btn--icon system-role__maximize-btn" aria-label="Restore" hidden>
              <i data-lucide="maximize-2" aria-hidden="true"></i>
            </button>
            <button class="btn btn--tertiary btn--icon system-role__close-btn" aria-label="Close">
              <i data-lucide="x" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div class="system-role__body">
          <div class="system-role__prompt">
            <textarea class="system-role__textarea" placeholder="Enter system role..."></textarea>
          </div>
          <div class="system-role__sidebar">
            <!-- VersionHistory and PromptTemplates panels -->
          </div>
        </div>
      </div>
    `,
  }
)
