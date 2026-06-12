import figma, { html } from '@figma/code-connect/html'

// CC filterable directory screen. Reuses the ControlScreen app-shell verbatim
// (rail + chrome + sidebar + right ActionsMenu rail); only the page content
// differs: a filter Input + titled sections, each a responsive grid of
// ActionCards (Button "add" + Right Chevron variants). Device axis is handled
// responsively (3-col → 1-col via @container cs-page) — no separate code variant.
// Filter + card actions are visual-only (backend TODOs in the markup).
figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4244-6526',
  {
    props: {
      device: figma.enum('Device', {
        Desktop: 'desktop',
        Mobile: 'mobile',
      }),
    },
    example: () => html`
      <html data-brand="cc">
      <body class="cc-control">
        <!-- … ControlScreen app-shell (sidebar + chrome + ActionsMenu rail) … -->
        <main class="cc-control__main">
          <div class="cc-control__chrome"><!-- cc-header-group --></div>
          <div class="cc-control__page cc-control__page--directory">
            <div class="input cc-directory__filter">
              <div class="input__wrap">
                <i data-lucide="search" class="input__icon" aria-hidden="true"></i>
                <input type="text" class="input__control" placeholder="Filter..." aria-label="Filter">
                <button type="button" class="input__clear" aria-label="Clear filter">
                  <i data-lucide="x" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <section class="cc-directory__section">
              <h2 class="cc-directory__section-title">Analysis</h2>
              <div class="cc-directory__grid">
                <a class="action-card action-card--chevron" href="#">
                  <span class="action-card__title">Ad Campaign Analysis</span>
                  <i class="action-card__chevron" data-lucide="chevron-right" aria-hidden="true"></i>
                </a>
                <div class="action-card action-card--button">
                  <p class="action-card__title">Campaign Dashboards</p>
                  <button class="btn btn--tertiary btn--xs" type="button">
                    <i data-lucide="plus" aria-hidden="true"></i>
                    add
                  </button>
                </div>
                <!-- … remaining ActionCards … -->
              </div>
            </section>
            <!-- … further sections (Ad Campaigns …) … -->
          </div>
        </main>
      </body>
      </html>
    `,
  }
)
