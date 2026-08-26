import figma, { html } from '@figma/code-connect/html'

// Seating Planner screen, "No Event" state. Reuses the ControlScreen app-shell verbatim
// (icon rail + chrome + desktop/mobile sidebar swap + right ActionsMenu rail +
// AiAssistant); only the page content differs — a full-height Container card holding a
// centred empty state.
//
// Unlike ControlHub there is NO Device property to map: the desktop (3515:175956) and
// mobile (3515:213358) frames are two standalone frames rather than variants of one set,
// and both render from this markup — the differences (page padding 32→12, heading 18→16,
// body 14→13) are handled in @media (max-width: 767px).
//
// Three shell CONFIGURATION differences from ControlScreen, all in markup, no CSS:
//   1. the sidebar menu panel is CLOSED (Figma shows the collapsed 56px rail)
//   2. the cc-header title row is REMOVED (Figma's chrome is CCTopNavigation only, 48px)
//   3. the breadcrumb reads Affino.com > Events > Seating Planner
//
// This is screen 1 of a series; later screens replace the .seating-screen__empty child
// while keeping the .seating-screen card.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3515-175956',
  {
    example: () => html`
      <body class="cc-control">
        <!-- … ControlScreen app-shell: collapsed 56px rail (first icon active, all
             cc-menu panels hidden) + mobile rail + right ActionsMenu rail … -->
        <main class="cc-control__main">
          <div class="cc-control__chrome">
            <!-- cc-header-group → cc-top-navigation ONLY (no cc-header title row).
                 Breadcrumb: Affino.com › Events › Seating Planner -->
          </div>
          <div class="cc-control__page cc-control__page--seating">
            <section class="seating-screen" aria-labelledby="seating-empty-title">
              <div class="seating-screen__empty">
                <span class="seating-screen__empty-icon" aria-hidden="true">
                  <i data-lucide="calendar-days"></i>
                </span>
                <h2 class="seating-screen__empty-title" id="seating-empty-title">No event selected</h2>
                <p class="seating-screen__empty-text">Choose an event to start planning its seating.</p>
                <button type="button" class="btn btn--secondary">
                  <i data-lucide="calendar-search" aria-hidden="true"></i>Select Event
                </button>
              </div>
            </section>
          </div>
        </main>
      </body>
    `,
  }
)
