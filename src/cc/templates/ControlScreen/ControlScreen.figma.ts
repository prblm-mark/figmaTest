import figma, { html } from '@figma/code-connect/html'

// CC home/landing dashboard. Layout-only template that composes
// cc-sidebar-menu + cc-header-group + Alert + StatCard ×2 + UpgradeCard
// + Select + Chart ×2 + Datatables (Whos Online). The Menu Open/Collapsed
// axis is the natural state of sidebar-menu.js (rail-button toggles the
// docked panel). Device axis is handled responsively at the 768px
// breakpoint inside the template — no separate variants in code.
figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4187-21254',
  {
    props: {
      type: figma.enum('Type', {
        'Menu Open': 'open',
        'Menu Collapsed': 'collapsed',
      }),
      device: figma.enum('Device', {
        Desktop: 'desktop',
        Mobile: 'mobile',
      }),
    },
    example: () => html`
      <html data-brand="cc">
      <body class="cc-control">
        <aside class="cc-control__sidebar cc-control__sidebar--desktop">
          <div class="cc-sidebar-menu"><!-- Sidebar rail + Menu panels --></div>
        </aside>
        <aside class="cc-control__sidebar cc-control__sidebar--mobile">
          <div class="cc-sidebar-menu"><!-- Mobile rail + Menu panels --></div>
        </aside>
        <main class="cc-control__main">
          <div class="cc-control__chrome">
            <div class="cc-header-group"><!-- TopNavigation + cc-header--control --></div>
          </div>
          <div class="cc-control__page">
            <div class="alert alert--cta alert--warning"><!-- … --></div>
            <div class="cc-control__cards">
              <div class="stat-card"><!-- Key Features --></div>
              <div class="stat-card"><!-- Help Guides --></div>
              <div class="upgrade-card"><!-- Version + Update --></div>
            </div>
            <div class="cc-control__panel">
              <div class="cc-control__panel-head">
                <div class="sel"><!-- Select Zone --></div>
                <a class="btn btn--secondary cc-control__dash-btn" href="#">Analysis Dashboard</a>
              </div>
              <div class="cc-control__charts">
                <div class="chart"><!-- Page Views --></div>
                <div class="chart"><!-- Users --></div>
              </div>
            </div>
            <section class="cc-control__section">
              <header class="cc-control__section-head">
                <h2 class="cc-control__section-title">Who's Online</h2>
                <p class="cc-control__section-meta">78 Members Online (15 Guest Users / 2 Bots)</p>
              </header>
              <div class="datatables datatables--mobile-scroll"><!-- Whos Online --></div>
            </section>
          </div>
        </main>
      </body>
      </html>
    `,
  }
)
