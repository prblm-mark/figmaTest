/* CrmAnalysis — behaviour for /control/crm-analysis (TASK-471015).
 *
 *   1. Full width: the cards go flush, following `cc:width` (as Live Dashboard).
 *   2. At a glance: classic's two linked pairs, Contacts → Accounts and Opportunities → Wins, with the
 *      relation each arrow stands for ("3.6 contacts per account", "22% won").
 *   3. Contracts and Opportunities cards: classic's summary figures, then ONE chart per card with a
 *      This month / 12 months switch (classic drew both, four charts in all). This month is a
 *      CALENDAR HEATMAP (a Mon–Sun grid, each day shaded by its count: sparse daily counts read as
 *      busy days and gaps, where bars were mostly empty space); 12 months is a gradient AREA chart.
 *      Contracts are Contract Analysis's own data and rule.
 *      Under each: Top customers (share bars) and Open pipeline by stage (classic's "open" rule shown).
 *   4. Activity: Contact notes and Unsubscribes over the last 30 days, each with the total, the change
 *      against the 30 days before (an unsubscribe rise is bad news, so it reads red), the busiest day
 *      and a gradient area sparkline (the Flowbite KPI card's chart).
 *   5. The win rate is drawn as well as written: the Wins chip is a radial gauge filled to it.
 * One colour scheme: every data mark (charts, calendar, share bars, gauge) is lagoon (Mark, 2026-10-05).
 * Every chart has a table view.
 */
(function () {
  'use strict';

  var page = document.querySelector('.cc-crm');
  if (!page || typeof CRM === 'undefined' || typeof CONTRACT_ANALYSIS_DATA === 'undefined') return;

  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TODAY = CRM.today;
  var NUM = new Intl.NumberFormat('en-GB');
  var MONTH_YY = new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' });
  var MONTH_LONG = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });
  var DAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  var DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function $(sel) { return page.querySelector(sel); }
  function money(v) { return CRM.currency.prefix + NUM.format(Math.round(v)); }
  function short(v) {
    if (v >= 1e6) return CRM.currency.prefix + (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'm';
    if (v >= 1e3) return CRM.currency.prefix + Math.round(v / 1e3) + 'k';
    return CRM.currency.prefix + v;
  }

  /* ── 1. Full width ────────────────────────────────────────────── */
  var charts = [];
  var shell = document.querySelector('.cc-control');
  function mirror(mode) { page.classList.toggle('cc-live--full', mode === 'full'); }
  document.addEventListener('cc:width', function (e) { mirror(e.detail.mode); charts.forEach(function (c) { c.resize(); }); });
  mirror(shell ? shell.getAttribute('data-cc-width') : 'standard');

  /* ── Data, by classic's rules ─────────────────────────────────── */
  var CONTRACTS = CONTRACT_ANALYSIS_DATA.contracts.filter(function (c) { return !c.cancelled && !c.archived; });
  var OPPS = CRM.opportunities;
  var STAGE = {}; CRM.stages.forEach(function (s) { STAGE[s.code] = s; });
  var wins = OPPS.filter(function (o) { return o.stage === 9; }).length;
  var open = OPPS.filter(function (o) { return STAGE[o.stage].open; });

  /* This month by day (to today), or the 12 months to this one, of whatever `rows` holds. */
  function series(rows, period) {
    var y = TODAY.getFullYear(), m = TODAY.getMonth();
    if (period === 'month') {
      var days = new Date(y, m + 1, 0).getDate(), out = [];
      for (var d = 1; d <= days; d++) out.push({ label: String(d), long: DAY.format(new Date(y, m, d)), value: d <= TODAY.getDate() ? 0 : null });
      rows.forEach(function (r) { if (r.created.getFullYear() === y && r.created.getMonth() === m && r.created <= TODAY) out[r.created.getDate() - 1].value++; });
      return out;
    }
    var months = [];
    for (var i = 11; i >= 0; i--) { var dt = new Date(y, m - i, 1); months.push({ y: dt.getFullYear(), m: dt.getMonth(), label: MONTH_YY.format(dt), long: MONTH_LONG.format(dt), value: 0 }); }
    rows.forEach(function (r) {
      for (var k = 0; k < 12; k++) if (r.created.getFullYear() === months[k].y && r.created.getMonth() === months[k].m && r.created <= TODAY) { months[k].value++; break; }
    });
    return months;
  }

  /* ── 2. At a glance ───────────────────────────────────────────── */
  function renderFunnel() {
    var per = CRM.contacts / CRM.accounts, rate = OPPS.length ? Math.round(wins / OPPS.length * 100) : 0;
    $('[data-funnel="contacts"]').textContent = NUM.format(CRM.contacts);
    $('[data-funnel="accounts"]').textContent = NUM.format(CRM.accounts);
    $('[data-funnel="opportunities"]').textContent = NUM.format(OPPS.length);
    $('[data-funnel="wins"]').textContent = NUM.format(wins);
    $('[data-funnel-link="perAccount"]').textContent = per.toFixed(1) + ' per account';
    $('[data-funnel-link="winRate"]').textContent = rate + '% won';
    /* Set on the next frame so the ring sweeps up from 0 (the property is registered in the CSS). */
    var g = $('[data-gauge]');
    requestAnimationFrame(function () { g.style.setProperty('--cc-crm-pct', rate); });
    $('[data-funnel-said]').textContent = NUM.format(CRM.contacts) + ' contacts across ' + NUM.format(CRM.accounts) +
      ' accounts, ' + per.toFixed(1) + ' per account. ' + NUM.format(OPPS.length) + ' opportunities, of which ' + NUM.format(wins) + ' won, ' + rate + '%.';
    $('[data-asof]').textContent = 'All time, as of ' + DATE.format(TODAY);
  }

  /* ── 3. Pipeline cards ────────────────────────────────────────── */
  function renderFigures() {
    var value = CONTRACTS.reduce(function (s, c) { return s + c.amount; }, 0);
    var customers = {}; CONTRACTS.forEach(function (c) { customers[c.accountCode] = (customers[c.accountCode] || 0) + c.amount; });
    var nCust = Object.keys(customers).length;
    $('[data-fig="contractValue"]').textContent = money(value);
    $('[data-fig="customers"]').textContent = NUM.format(nCust);
    $('[data-fig="contractAvg"]').textContent = nCust ? money(value / nCust) : '—';
    var oppValue = open.reduce(function (s, o) { return s + o.amount; }, 0);
    $('[data-fig="oppValue"]').textContent = money(oppValue);
    $('[data-fig="oppCount"]').textContent = NUM.format(open.length);
    $('[data-fig="oppAvg"]').textContent = open.length ? money(oppValue / open.length) : '—';

    /* Top customers by contract value, Contract Analysis's ranking. */
    var names = {}; CONTRACT_ANALYSIS_DATA.accounts.forEach(function (a) { names[a.code] = a.name; });
    var top = Object.keys(customers).map(function (k) { return { code: k, name: names[k], value: customers[k] }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 5);
    $('[data-list="customers"]').innerHTML = rankRows(top, function (r) { return '/control/accounts?AccountCode=' + r.code; }, function (r) { return money(r.value); });

    /* Open pipeline by stage, in stage order; the bar is each stage's share of the open value. */
    var by = CRM.stages.filter(function (s) { return s.open; }).map(function (s) {
      var rows = open.filter(function (o) { return o.stage === s.code; });
      return { code: s.code, name: s.name, count: rows.length, value: rows.reduce(function (t, o) { return t + o.amount; }, 0) };
    });
    var max = Math.max.apply(null, by.map(function (r) { return r.value; })) || 1;
    $('[data-list="stages"]').innerHTML = by.map(function (r, i) {
      var pct = Math.max(2, Math.round(r.value / max * 100));
      return '<li class="cc-live__row"><span class="cc-live__pos" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="cc-live__row-main"><span class="cc-live__row-line">' +
          '<a class="cc-live__link" href="/control/opportunities?OpportunityStage=' + r.code + '" target="_blank" rel="noopener"><span class="cc-live__row-name">' + esc(r.name) + '</span></a>' +
          '<span class="cc-crm__stage-figs"><span class="cc-crm__stage-count">' + NUM.format(r.count) + '</span><span class="cc-live__views">' + money(r.value) + '</span></span></span>' +
          '<span class="cc-live__bar" aria-hidden="true"><span class="cc-live__bar-fill" style="--cc-live-share:' + pct + '%"></span></span>' +
        '</span></li>';
    }).join('');
    var left = [1, 11].map(function (c) { return { name: STAGE[c].name.toLowerCase(), n: OPPS.filter(function (o) { return o.stage === c; }).length }; });
    $('[data-stage-note]').textContent = 'Not counted as open, as in classic: ' + NUM.format(left[0].n) + ' ' + left[0].name +
      ' and ' + NUM.format(left[1].n) + ' ' + left[1].name + ', plus everything closed.';
  }
  function rankRows(rows, href, val) {
    var top = rows.length ? rows[0].value : 1;
    return rows.map(function (r, i) {
      var pct = Math.max(2, Math.round(r.value / top * 100));
      return '<li class="cc-live__row"><span class="cc-live__pos" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="cc-live__row-main"><span class="cc-live__row-line">' +
          '<a class="cc-live__link" href="' + esc(href(r)) + '" target="_blank" rel="noopener"><span class="cc-live__row-name">' + esc(r.name) + '</span></a>' +
          '<span class="cc-live__views">' + val(r) + '</span></span>' +
          '<span class="cc-live__bar" aria-hidden="true"><span class="cc-live__bar-fill" style="--cc-live-share:' + pct + '%"></span></span>' +
        '</span></li>';
    }).join('');
  }

  /* One bar chart per card. Classic's "Opportunities this month" leaves out Closed Won and Closed
     (Stage NOT IN 9, 10); its 12-month chart counts every opportunity. Both rules kept. */
  var PIPE = {
    contracts: { rows: function () { return CONTRACTS; }, noun: 'contracts', period: 'month', chart: null },
    opportunities: { rows: function (p) { return p === 'month' ? OPPS.filter(function (o) { return o.stage !== 9 && o.stage !== 10; }) : OPPS; },
      noun: 'opportunities', period: 'month', chart: null }
  };
  function chartDefaults() {
    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = tok('--ai-text-contrast');
  }
  function tooltip(fmt) {
    return { backgroundColor: tok('--ai-surface-invert'), titleColor: tok('--ai-text-invert'), bodyColor: tok('--ai-text-invert'),
      padding: 10, cornerRadius: 6, displayColors: false, callbacks: fmt };
  }
  /* Area: Live Dashboard's treatment — a 2px line over a fill that fades from 25% to nothing. */
  function area(data, colour, label) {
    /* Monotone: a smoothed line that never overshoots, so a busy Friday then an empty Saturday
       does not dip below zero. */
    return { label: label, data: data, borderColor: colour, borderWidth: 2, cubicInterpolationMode: 'monotone', fill: true,
      pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2, pointHoverBorderColor: tok('--ai-surface-primary'),
      pointHoverBackgroundColor: colour,
      backgroundColor: function (ctx) {
        var a = ctx.chart.chartArea;
        if (!a) return colour;
        var g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
        g.addColorStop(0, colour + '40'); g.addColorStop(1, colour + '00');
        return g;
      } };
  }
  var crosshair = {
    id: 'ccCrmCrosshair',
    afterDatasetsDraw: function (c) {
      var act = c.tooltip && c.tooltip.getActiveElements && c.tooltip.getActiveElements();
      if (!act || !act.length) return;
      var ctx = c.ctx, x = act[0].element.x;
      ctx.save(); ctx.strokeStyle = tok('--ai-border-primary'); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, c.chartArea.top); ctx.lineTo(x, c.chartArea.bottom); ctx.stroke(); ctx.restore();
    }
  };

  /* Calendar heatmap: a real <table> (weekday headers, one row per week), so it is its own table view.
     Three shades of one hue by the day's share of the month's busiest day, an empty shade for none,
     and days still to come outlined. */
  var WEEKDAYS = [['M', 'Monday'], ['T', 'Tuesday'], ['W', 'Wednesday'], ['T', 'Thursday'], ['F', 'Friday'], ['S', 'Saturday'], ['S', 'Sunday']];
  function heatmap(key, data, noun) {
    var y = TODAY.getFullYear(), m = TODAY.getMonth();
    var max = Math.max.apply(null, data.map(function (d) { return d.value || 0; })) || 1;
    var lead = (new Date(y, m, 1).getDay() + 6) % 7, cells = [];
    for (var i = 0; i < lead; i++) cells.push('<td class="cc-crm__day cc-crm__day--pad"></td>');
    data.forEach(function (d, i) {
      var day = i + 1, future = d.value === null, today = day === TODAY.getDate();
      var level = future || !d.value ? 0 : Math.max(1, Math.ceil(d.value / max * 3));
      var what = future ? 'still to come' : NUM.format(d.value) + ' ' + (d.value === 1 ? noun[0] : noun[1]);
      cells.push('<td class="cc-crm__day cc-crm__day--l' + level + (future ? ' cc-crm__day--future' : '') + (today ? ' cc-crm__day--today' : '') +
        '" title="' + esc(d.long + ': ' + what) + '"><span class="cc-crm__day-num" aria-hidden="true">' + day + '</span>' +
        '<span class="cc-live__visually-hidden">' + esc(d.long + (today ? ', today' : '') + ': ' + what) + '</span></td>');
    });
    while (cells.length % 7) cells.push('<td class="cc-crm__day cc-crm__day--pad"></td>');
    var rows = '';
    for (var r = 0; r < cells.length; r += 7) rows += '<tr>' + cells.slice(r, r + 7).join('') + '</tr>';
    $('[data-heat="' + key + '"]').innerHTML =
      '<table class="cc-crm__cal"><caption class="cc-live__visually-hidden">' + esc(noun[1].charAt(0).toUpperCase() + noun[1].slice(1)) + ' created each day in ' + MONTH_LONG.format(TODAY) + '</caption>' +
      '<thead><tr>' + WEEKDAYS.map(function (w) { return '<th scope="col"><abbr title="' + w[1] + '">' + w[0] + '</abbr></th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + rows + '</tbody></table>' +
      '<div class="cc-crm__heat-key" aria-hidden="true"><span>None</span>' +
        [0, 1, 2, 3].map(function (l) { return '<span class="cc-crm__swatch cc-crm__day--l' + l + '"></span>'; }).join('') +
        '<span>Most (' + NUM.format(max) + ')</span><span class="cc-crm__swatch cc-crm__day--future"></span><span>To come</span></div>';
  }

  function renderPipe(key) {
    var p = PIPE[key], data = series(p.rows(p.period), p.period), month = p.period === 'month';
    var total = data.reduce(function (s, d) { return s + (d.value || 0); }, 0);
    $('[data-chart-sub="' + key + '"]').textContent = month
      ? 'Created in ' + MONTH_LONG.format(TODAY) + ', by day' + (key === 'opportunities' ? ' · still in play' : '')
      : 'Created in the last 12 months, by month';
    var badge = $('[data-chart-count="' + key + '"]');
    badge.textContent = NUM.format(total) + ' ' + (month ? 'this month' : 'in 12 months');
    var empty = $('[data-chart-empty="' + key + '"]');
    empty.hidden = total > 0;
    empty.textContent = 'No ' + p.noun + ' created ' + (month ? 'this month' : 'in the last 12 months') + ' yet.';
    $('[data-th-period="' + key + '"]').textContent = month ? 'Day' : 'Month';
    $('[data-table="' + key + '"]').innerHTML = data.map(function (d) {
      return '<tr><td>' + esc(d.long) + '</td><td class="cc-live__num">' + (d.value === null ? '—' : NUM.format(d.value)) + '</td></tr>';
    }).join('');
    var canvas = $('[data-canvas="' + key + '"]'), heat = $('[data-heat="' + key + '"]');
    var nouns = key === 'contracts' ? ['contract', 'contracts'] : ['opportunity', 'opportunities'];
    heat.hidden = !month || total === 0;
    canvas.parentElement.hidden = month || total === 0;
    $('[data-table-view="' + key + '"]').hidden = month;      // the calendar is itself a table
    if (p.chart) { p.chart.destroy(); p.chart = null; }
    if (month) { if (total) heatmap(key, data, nouns); return; }
    canvas.setAttribute('aria-label', 'Area chart of ' + p.noun + ' created each month for the last 12 months, ' + total + ' in all');
    if (!window.Chart) return;
    var blue = tok('--ai-accent-lagoon-solid');
    p.chart = new Chart(canvas, {
      type: 'line',
      data: { labels: data.map(function (d) { return d.label; }), datasets: [area(data.map(function (d) { return d.value; }), blue, p.noun)] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: REDUCED ? false : { duration: 400 },
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: tooltip({
          title: function (items) { return data[items[0].dataIndex].long; },
          label: function (c) { return ' ' + NUM.format(c.parsed.y) + ' ' + (c.parsed.y === 1 ? nouns[0] : nouns[1]); } }) },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 } },
          y: { beginAtZero: true, grid: { color: tok('--ai-border-secondary') }, border: { display: false }, ticks: { precision: 0, maxTicksLimit: 4 } }
        }
      },
      plugins: [crosshair]
    });
    charts = charts.filter(function (c) { return c !== p.old; });
    charts.push(p.chart); p.old = p.chart;
  }
  page.addEventListener('seg-control:change', function (e) {
    var key = e.target.getAttribute('data-period');
    if (!PIPE[key]) return;
    PIPE[key].period = e.detail.value;
    renderPipe(key);
  });

  /* ── 4. Activity ──────────────────────────────────────────────── */
  var ACT = {
    notes: { days: CRM.notes, noun: ['note', 'notes'], upIsGood: true },
    unsubs: { days: CRM.unsubscribes, noun: ['unsubscribe', 'unsubscribes'], upIsGood: false }
  };
  function renderActivity(key) {
    var a = ACT[key], last = a.days.slice(30), prev = a.days.slice(0, 30);
    var sum = function (arr) { return arr.reduce(function (s, d) { return s + d.count; }, 0); };
    var t = sum(last), p = sum(prev), pct = p ? Math.round((t - p) / p * 100) : 0;
    var up = pct >= 0, good = up === a.upIsGood;
    $('[data-act-total="' + key + '"]').textContent = NUM.format(t);
    var badge = $('[data-act-delta="' + key + '"]');
    /* Within ±2% is no change worth colouring. */
    badge.className = 'badge badge--' + (Math.abs(pct) <= 2 ? 'neutral' : good ? 'success' : 'danger');
    badge.innerHTML = '<i data-lucide="' + (up ? 'trending-up' : 'trending-down') + '" aria-hidden="true"></i>' +
      (up ? '+' : '−') + Math.abs(pct) + '% vs previous 30 days';
    var best = last.reduce(function (b, d) { return d.count > b.count ? d : b; }, last[0]);
    $('[data-act-foot="' + key + '"]').innerHTML = 'Busiest day <strong>' + DAY.format(best.date) + '</strong> · ' +
      NUM.format(best.count) + ' ' + (best.count === 1 ? a.noun[0] : a.noun[1]) + ' · ' + (t / 30).toFixed(1) + ' a day on average';
    $('[data-act-table="' + key + '"]').innerHTML = last.map(function (d) {
      return '<tr><td>' + DAY.format(d.date) + '</td><td class="cc-live__num">' + NUM.format(d.count) + '</td></tr>';
    }).join('');
    var canvas = $('[data-act-canvas="' + key + '"]');
    canvas.setAttribute('aria-label', 'Area chart of ' + a.noun[1] + ' per day for the last 30 days, ' + t + ' in all');
    if (!window.Chart) return;
    var colour = tok('--ai-accent-lagoon-solid');
    var c = new Chart(canvas, {
      type: 'line',
      data: { labels: last.map(function (d) { return d.date.getDate(); }), datasets: [area(last.map(function (d) { return d.count; }), colour, a.noun[1])] },
      plugins: [crosshair],
      options: {
        responsive: true, maintainAspectRatio: false, animation: REDUCED ? false : { duration: 400 },
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 4 } },
        plugins: { legend: { display: false }, tooltip: tooltip({
          title: function (items) { return DAY.format(last[items[0].dataIndex].date); },
          label: function (x) { return ' ' + NUM.format(x.parsed.y) + ' ' + (x.parsed.y === 1 ? a.noun[0] : a.noun[1]); } }) },
        scales: {
          /* First and last day only: a sparkline needs its ends, not every date. */
          x: { grid: { display: false }, border: { display: false },
               ticks: { maxRotation: 0, autoSkip: false, callback: function (v, i) { return i === 0 || i === last.length - 1 ? DAY.format(last[i].date).replace(/^\w+ /, '') : ''; } } },
          y: { display: false, beginAtZero: true }
        }
      }
    });
    charts.push(c);
  }

  if (window.Chart) chartDefaults();
  renderFunnel();
  renderFigures();
  renderPipe('contracts');
  renderPipe('opportunities');
  renderActivity('notes');
  renderActivity('unsubs');
  if (window.lucide) window.lucide.createIcons();
})();
