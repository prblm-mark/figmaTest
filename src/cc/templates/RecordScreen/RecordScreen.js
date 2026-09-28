/* RecordScreen — page glue for the Article View / Edit / Steps screens.
 *
 *   1. Width: applies the shell's width mode (?template=full, else the viewer's saved choice from
 *      the rail's Minimise toggle — control-width.js) and mirrors it onto the kit's
 *      own --full modifiers (RecordTabs, RecordSection, StepsTable), so each component owns
 *      its flat style rather than this page restyling it.
 *   2. Keeps ?template= on the tab / Edit / Cancel links (marked data-keep-width) so the width
 *      survives moving between the three screens.
 *   3. Draws the Performance chart (Chart.js), colours read from tokens like Chart's own demo.
 *
 * Behaviour owned elsewhere: AdvisoryItem.js (± expand, Expand all), TagBox.js (remove +
 * Multi Select Modal), StepsTable.js (Show details, select all), Toggle.js, Select.js.
 */
(function () {
  'use strict';

  var FULL = { '.record-tabs': 'record-tabs--full', '.record-section': 'record-section--full', '.steps-table': 'steps-table--full' };

  function mirror(mode) {
    Object.keys(FULL).forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.classList.toggle(FULL[sel], mode === 'full'); });
    });
    var q = '?template=' + mode; // explicit, so a saved choice can never override the current screen's
    document.querySelectorAll('a[data-keep-width]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').split('?')[0] + q);
    });
  }

  document.addEventListener('cc:width', function (e) { mirror(e.detail.mode); });
  if (window.ccWidth) window.ccWidth.apply(window.ccWidth.resolve());

  // TODO(backend:RecordScreen): Performance figures + chart series are static → record analytics endpoint
  //   { impressions, consumed, bookmarked, topAccounts[], series: { labels[], impressions[], unique[] } }
  var canvas = document.getElementById('perf-chart');
  if (canvas && window.Chart) {
    var cs = getComputedStyle(document.documentElement);
    var tok = function (n, fb) { return cs.getPropertyValue(n).trim() || fb; };
    var brand = tok('--ai-surface-brand', '#0071d8');
    var success = tok('--ai-surface-success', '#30cb90');
    window.Chart.defaults.font.family = 'Inter, sans-serif';
    window.Chart.defaults.font.size = 10;
    window.Chart.defaults.color = tok('--ai-text-contrast', '#67676c');
    window.Chart.defaults.borderColor = tok('--ai-border-secondary', '#e2e2e3');
    new window.Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          { label: 'Impressions', data: [3000, 4200, 3800, 5100, 4900, 6100, 5800], borderColor: brand, tension: 0.4, borderWidth: 2, pointRadius: 0 },
          { label: 'Unique', data: [1800, 2400, 2200, 2900, 2800, 3300, 3100], borderColor: success, tension: 0.4, borderWidth: 2, pointRadius: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, border: { display: false } }, y: { border: { display: false } } },
      },
    });
  }
})();
