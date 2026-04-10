import figma, { html } from '@figma/code-connect/html'

// State variants change DOM composition rather than CSS classes:
// - Default: disabled Make Live button
// - Discard: Discard Changes + active Make Live buttons
// - Tooltip/Info: tooltip panel visible in DOM
// Device=Mobile layout is handled by @media (max-width: 767px) — no modifier class.
figma.connect(
  'https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-6854',
  {
    props: {
      state: figma.enum('State', {
        Default: 'default',
        Tooltip: 'tooltip',
        Discard: 'discard',
        Info: 'info',
      }),
    },
    example: () => html`
      <header class="header">
        <div class="header__title-group">
          <h1 class="header__title">Page Title</h1>
          <button class="info-label" aria-label="More information">
            <i data-lucide="info" aria-hidden="true"></i>
            <span class="info-label__text">Info label</span>
          </button>
        </div>
        <div class="header__actions">
          <!-- Default state: disabled Make Live -->
          <button class="btn btn--primary" disabled>Make Live</button>
          <!-- Discard state: swap for Discard Changes + Make Live -->
          <!-- <button class="btn btn--alert-outline">Discard Changes</button> -->
          <!-- <button class="btn btn--primary">Make Live</button> -->
        </div>
      </header>
    `,
  }
)
