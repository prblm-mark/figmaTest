import figma, { html } from '@figma/code-connect/html'

// Type controls layout (Announcement / Marketing / Information).
// Position controls border-radius + shadow + border-style (Floating / Fixed).
// Device variants are handled by @media (max-width: 767px) — no modifier class.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2550-2225',
  {
    props: {
      type: figma.enum('Type', {
        Announcement: 'announcement',
        Marketing: 'marketing',
        Information: 'information',
      }),
      position: figma.enum('Position', {
        Floating: 'floating',
        Fixed: 'fixed',
      }),
    },
    example: ({ type, position }) => html`
      <!-- Announcement -->
      <div class="banner banner--announcement banner--floating">
        <span class="banner__icon" aria-hidden="true">
          <i data-lucide="megaphone"></i>
        </span>
        <p class="banner__text">
          New: Affino 9.0.11 ships next week with brand-new chat-style settings.
          <a href="#" class="banner__link">Read what's coming</a>.
        </p>
        <button type="button" class="banner__close" aria-label="Dismiss banner">
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Marketing -->
      <div class="banner banner--marketing banner--floating">
        <div class="banner__logo" aria-hidden="true">
          <i data-lucide="award"></i>
        </div>
        <div class="banner__body">
          <h3 class="banner__title">Affino Innovation Briefing 2025</h3>
          <p class="banner__text">Dive into the insights, tools, and AI features shaping tomorrow's digital experiences.</p>
        </div>
        <div class="banner__actions">
          <button type="button" class="btn btn--primary">Sign Up</button>
          <button type="button" class="btn btn--tertiary">Learn more</button>
        </div>
        <button type="button" class="banner__close" aria-label="Dismiss banner">
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Information -->
      <div class="banner banner--information banner--floating">
        <div class="banner__body">
          <h3 class="banner__title">Affino Innovation Briefing 2025</h3>
          <p class="banner__text">Dive into the insights, tools, and AI features shaping tomorrow's digital experiences.</p>
        </div>
        <div class="banner__actions">
          <button type="button" class="btn btn--primary">Sign Up</button>
        </div>
        <button type="button" class="banner__close" aria-label="Dismiss banner">
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
      </div>
    `,
  }
)
