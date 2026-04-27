import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-2215',
  {
    props: {
      type: figma.enum('Type', {
        'Multiple Lines': '',
        'Single Line': '',
        'Bar Chart': '',
        Doughnut: '',
      }),
    },
    example: () => html`
      <div class="chart">
        <div class="chart__head">
          <div class="chart__title">
            <p class="chart__big">42,389</p>
            <p class="chart__sub">Total clicks this month</p>
          </div>
          <span class="chart__delta">
            <i data-lucide="trending-up" aria-hidden="true"></i>
            <span>12.4%</span>
          </span>
        </div>
        <div class="chart__canvas"><canvas id="chart-canvas"></canvas></div>
        <div class="chart__foot">
          <button type="button" class="chart__filter">
            <span>Last 7 days</span>
            <i data-lucide="chevron-down" aria-hidden="true"></i>
          </button>
          <a href="#" class="chart__report-link">
            <span>Report</span>
            <i data-lucide="arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    `,
  }
)
