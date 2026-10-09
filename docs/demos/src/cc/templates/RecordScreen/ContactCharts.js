/* ContactCharts — draws the Contact View's charts from data attributes (code-first, 2026-10-07).
 *
 * <canvas data-contact-chart='{"type":"bar"|"bar-h","labels":[…],"values":[…],"label":"…",
 *                              "unit":["Month","Events"],"partialLast":true}'>
 *
 * One series in lagoon (dataviz: one hue for magnitude; sorted bars; no legend for a single series,
 * the card title names it; a hover tooltip; the values also sit in the card's "View as table").
 * Bars take the house shape: 4px radius on the outer end, flat base, at most 28px thick. A
 * `partialLast` series marks its last bar (the current month, to date) in the soft tint with a solid
 * edge, so a part-month total does not read as a drop (as CRM Analysis).
 * Colours are read from the tokens at draw time, so they follow the theme.
 */
(function () {
  'use strict';
  if (!window.Chart) return;

  function tok(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  document.querySelectorAll('canvas[data-contact-chart]').forEach(function (canvas) {
    var d = JSON.parse(canvas.getAttribute('data-contact-chart'));
    var horizontal = d.type === 'bar-h';
    var solid = tok('--ao-accent-lagoon-solid'), soft = tok('--ao-accent-lagoon-soft');
    var last = d.values.length - 1;
    var fill = d.values.map(function (_, i) { return d.partialLast && i === last ? soft : solid; });

    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = tok('--ao-text-contrast');

    var valueAxis = { beginAtZero: true, grid: { color: tok('--ao-border-secondary') }, border: { display: false },
                      ticks: { precision: 0, maxTicksLimit: 5 } };
    var labelAxis = { grid: { display: false }, border: { display: false }, ticks: { autoSkip: !horizontal, maxRotation: 0 } };

    new Chart(canvas, {
      type: 'bar',
      data: { labels: d.labels, datasets: [{
        label: d.unit[1], data: d.values, backgroundColor: fill,
        borderColor: solid, borderWidth: d.values.map(function (_, i) { return d.partialLast && i === last ? 1 : 0; }),
        borderRadius: 4, borderSkipped: 'start', maxBarThickness: 28 }] },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true, maintainAspectRatio: false,
        animation: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 400 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tok('--ao-surface-invert'), titleColor: tok('--ao-text-invert'), bodyColor: tok('--ao-text-invert'),
            padding: 10, cornerRadius: 6, displayColors: false,
            callbacks: {
              title: function (items) { var i = items[0].dataIndex; return d.labels[i] + (d.partialLast && i === last ? ' (to date)' : ''); },
              label: function (c) { return ' ' + (horizontal ? c.parsed.x : c.parsed.y) + ' ' + d.unit[1].toLowerCase(); }
            }
          }
        },
        scales: horizontal ? { x: valueAxis, y: labelAxis } : { x: labelAxis, y: valueAxis }
      }
    });
  });
})();
