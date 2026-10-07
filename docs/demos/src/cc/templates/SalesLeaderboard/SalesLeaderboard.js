/* SalesLeaderboard — behaviour for /control/sales-leaderboard (TASK-471014).
 *
 * Built on the Live Dashboard (TASK-471013); everything is computed from the orders in
 * sales-leaderboard-data.js, as classic's queries compute it from the Order table.
 *
 *   1. Full width: the cards go flush, following `cc:width` (as Live Dashboard).
 *   2. Time frame + Currency (classic's two selects). Time frame re-runs the leaderboards and the two
 *      KPIs that follow it; the chart is always this year and last (classic). Currency re-runs
 *      everything (classic reloaded the page for it). Both are kept in the URL, as classic's
 *      ?timeframe= / ?currency=, so a link opens the same view.
 *   3. KPIs (StatCard Xl): Sales in the time frame (orders, average order), Sales this year (vs the
 *      same months last year, best month), Top sales person in the time frame.
 *   4. Monthly sales chart (Chart pattern + Chart.js): this year (lagoon, filled) against last year
 *      (purple, dashed) — the house pair with Live Dashboard and Contract Analysis — with a hover crosshair + tooltip, direct
 *      labels, a legend and a table view. This year stops at the current month (classic plotted the
 *      months still to come as zero, a cliff that read as a collapse).
 *   5. Lists with classic's paging (strSettings: 5, +5 each, capped at 100): Top sales teams (ranked,
 *      share-of-top bars), Top sales people and Most recent sales (tables).
 *   6. Refresh: every 5 minutes while the tab is visible (classic: 3E5, only while focused), with an
 *      "Updated n m ago" line.
 *
 * TODO(backend:SalesLeaderboard) sales-refresh: the refresh is mock (now and then a new order). Live:
 *   call SalesLeaderboard.cfc?method=getData&type=all with the time frame, currency and each list's
 *   MaxRows, as salesleaderboard.js does, and re-render.
 */
(function () {
  'use strict';

  var page = document.querySelector('.cc-sales');
  if (!page || typeof SL === 'undefined') return;

  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  var DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  var NUM = new Intl.NumberFormat('en-GB');

  var q = new URLSearchParams(location.search);
  var state = {
    timeframe: SL.timeframes.some(function (t) { return t.code === +q.get('timeframe'); }) ? +q.get('timeframe') : 1,
    currency: SL.currencies.some(function (c) { return c.code === +q.get('currency'); }) ? +q.get('currency')
      : SL.currencies.filter(function (c) { return c.primary; })[0].code
  };
  var shown = {};
  function resetPaging() { ['team', 'person', 'recent'].forEach(function (k) { shown[k] = SL.paging[k][0]; }); }
  resetPaging();

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function $(sel) { return page.querySelector(sel); }
  function $$(sel) { return page.querySelectorAll(sel); }
  function cur() { return SL.currencies.filter(function (c) { return c.code === state.currency; })[0]; }
  function tf() { return SL.timeframes.filter(function (t) { return t.code === state.timeframe; })[0]; }

  /* Money as classic's FormatPriceList does it: the currency's prefix and decimal places. The KPIs
     and the chart round to whole units; tables keep the currency's own decimals. */
  function money(v, whole) {
    var c = cur(), dp = whole ? 0 : c.dp;
    return c.prefix + v.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function short(v) {
    var c = cur();
    if (v >= 1e6) return c.prefix + (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'm';
    if (v >= 1e3) return c.prefix + Math.round(v / 1e3) + 'k';
    return c.prefix + Math.round(v);
  }

  /* ── 1. Full width ────────────────────────────────────────────── */
  var shell = document.querySelector('.cc-control');
  function mirror(mode) { page.classList.toggle('cc-live--full', mode === 'full'); }
  document.addEventListener('cc:width', function (e) { mirror(e.detail.mode); if (chart) chart.resize(); });
  mirror(shell ? shell.getAttribute('data-cc-width') : 'standard');

  /* ── Time frame (classic's getTimeFrame) ──────────────────────── */
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function windowRange() {
    var now = new Date(), start, end = now;
    switch (state.timeframe) {
      case 1: { var dow = now.getDay(); start = startOfDay(new Date(now.getTime() - ((dow + 6) % 7) * 864e5)); break; } // Monday
      case 2: start = startOfDay(new Date(now.getTime() - 7 * 864e5)); break;
      case 3: start = new Date(now.getFullYear(), now.getMonth(), 1); break;
      /* Previous month ENDS at this month's start. Classic had no end date, so "Previous Month" also
         counted every sale this month; flagged in the notes. */
      case 4: start = new Date(now.getFullYear(), now.getMonth() - 1, 1); end = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case 5: start = startOfDay(new Date(now.getTime() - 30 * 864e5)); break;
      case 6: start = new Date(now.getFullYear(), 0, 1); break;
      default: start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 11, now.getDate()));
    }
    return { start: start, end: end };
  }
  function inCurrency() { return SL.orders.filter(function (o) { return o.currency === state.currency; }); }
  function inWindow() {
    var r = windowRange();
    return inCurrency().filter(function (o) { return o.created >= r.start && o.created < r.end; });
  }
  /* As short as it can be and still exact: "Mon 5 Oct" for one day, "1–30 Sept" within a month,
     "5 Sept – 5 Oct" within a year; across years "5 Nov 2025 – 5 Oct" (an end in this year needs no
     year), so it fits beside "Updated" on a phone. */
  var D = new Intl.DateTimeFormat('en-GB', { day: 'numeric' });
  var DM = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
  function rangeText() {
    var r = windowRange(), a = r.start, b = new Date(r.end.getTime() - 1);
    if (startOfDay(a).getTime() === startOfDay(b).getTime()) return DAY.format(a);
    if (a.getFullYear() !== b.getFullYear()) {
      return DATE.format(a) + ' – ' + (b.getFullYear() === new Date().getFullYear() ? DM.format(b) : DATE.format(b));
    }
    if (a.getMonth() === b.getMonth()) return D.format(a) + '–' + DM.format(b);
    return DM.format(a) + ' – ' + DM.format(b);
  }

  /* ── Aggregates (classic's queries) ───────────────────────────── */
  function teamName(codes) {
    if (!codes.length) return '';
    return codes.length > 1 ? 'Multiple' : SL.teams.filter(function (t) { return t.code === codes[0]; })[0].name;
  }
  function unitName(codes) {
    var units = [];
    codes.forEach(function (c) {
      var u = SL.teams.filter(function (t) { return t.code === c; })[0].unit;
      if (units.indexOf(u) === -1) units.push(u);
    });
    if (!units.length) return '';
    return units.length > 1 ? 'Multiple' : SL.units.filter(function (u) { return u.code === units[0]; })[0].name;
  }
  /* getTopSalesTeams: each order counts for every team its owner is in (the join), owner-less orders
     for none. */
  function teamRows(rows) {
    var by = {};
    rows.forEach(function (o) {
      if (!o.owner) return;
      o.owner.teams.forEach(function (t) { by[t] = (by[t] || 0) + o.value; });
    });
    return Object.keys(by).map(function (k) {
      var t = SL.teams.filter(function (x) { return x.code === +k; })[0];
      return { code: t.code, name: t.name, value: by[k] };
    }).sort(function (a, b) { return b.value - a.value; }).slice(0, SL.paging.max);
  }
  /* getTopSalesPeople: owner, order count and value; team and unit, "Multiple" when more than one. */
  function personRows(rows) {
    var by = {};
    rows.forEach(function (o) {
      if (!o.owner) return;
      var r = by[o.owner.code] || (by[o.owner.code] = { person: o.owner, orders: 0, value: 0 });
      r.orders++; r.value += o.value;
    });
    return Object.keys(by).map(function (k) { return by[k]; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, SL.paging.max);
  }
  /* getMostRecentSales: one row per order LINE, newest first. */
  function recentRows(rows) {
    var out = [];
    rows.slice().sort(function (a, b) { return b.created - a.created; }).forEach(function (o) {
      o.lines.forEach(function (l) { out.push({ order: o, line: l }); });
    });
    return out.slice(0, SL.paging.max);
  }
  function monthly(year) {
    var m = MONTHS.map(function () { return 0; });
    inCurrency().forEach(function (o) { if (o.created.getFullYear() === year) m[o.created.getMonth()] += o.value; });
    return m.map(function (v) { return Math.round(v); });
  }

  /* ── 2. Selects ───────────────────────────────────────────────── */
  function fillSelect(key, items, current) {
    var menu = $('[data-sel-menu="' + key + '"]');
    menu.innerHTML = items.map(function (it) {
      var on = it.value === current;
      return '<li><button type="button" class="sel__menu-item' + (on ? ' sel__menu-item--selected' : '') + '" role="option"' +
        (on ? ' aria-selected="true"' : '') + ' data-value="' + it.value + '">' + esc(it.label) + (on ? ' <i data-lucide="check"></i>' : '') + '</button></li>';
    }).join('');
    $('[data-sel-value="' + key + '"]').textContent = items.filter(function (it) { return it.value === current; })[0].label;
  }
  fillSelect('timeframe', SL.timeframes.map(function (t) { return { value: t.code, label: t.name }; }), state.timeframe);
  fillSelect('currency', SL.currencies.map(function (c) { return { value: c.code, label: c.iso }; }), state.currency);

  /* Select.js moves the check and the value; this listens after it and re-renders. */
  page.addEventListener('click', function (e) {
    var item = e.target.closest('[data-sales-sel] .sel__menu-item');
    if (!item) return;
    var key = item.closest('[data-sales-sel]').getAttribute('data-sales-sel');
    var v = +item.getAttribute('data-value');
    if (state[key] === v) return;
    state[key] = v;
    var u = new URL(location.href);
    u.searchParams.set('timeframe', state.timeframe); u.searchParams.set('currency', state.currency);
    history.replaceState(null, '', u);
    resetPaging();
    renderWindow();
    if (key === 'currency') renderYear();
    $('[data-announce]').textContent = key === 'currency' ? 'Showing ' + cur().iso + ' sales' : 'Showing ' + tf().name.toLowerCase();
  });

  /* ── 3. KPIs ──────────────────────────────────────────────────── */
  function set(key, text) {
    $$('[data-kpi="' + key + '"]').forEach(function (el) {
      if (el.textContent !== text) {
        el.textContent = text;
        if (!REDUCED && el.dataset.ready) { el.classList.remove('cc-live__changed'); void el.offsetWidth; el.classList.add('cc-live__changed'); }
        el.dataset.ready = '1';
      }
    });
  }
  function yearDelta() {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth();
    /* Year to date against the same span last year (to this day), so a part-month compares fairly. */
    var cutLast = new Date(y - 1, m, now.getDate(), now.getHours(), now.getMinutes());
    var ytd = 0, last = 0;
    inCurrency().forEach(function (o) {
      if (o.created.getFullYear() === y) ytd += o.value;
      else if (o.created.getFullYear() === y - 1 && o.created < cutLast) last += o.value;
    });
    return { ytd: ytd, last: last, pct: last ? Math.round((ytd - last) / last * 100) : 0 };
  }
  function renderKpis(rows) {
    var total = rows.reduce(function (s, o) { return s + o.value; }, 0);
    set('window', money(total, true));
    set('orders', NUM.format(rows.length));
    set('average', rows.length ? money(total / rows.length, true) : '—');
    var top = personRows(rows)[0];
    set('person', top ? top.person.name : '—');
    set('personValue', top ? money(top.value, true) : '—');
    set('personOrders', top ? NUM.format(top.orders) : '—');
  }
  function renderYearKpis() {
    var y = new Date().getFullYear(), d = yearDelta(), m = monthly(y), best = 0;
    m.forEach(function (v, i) { if (v > m[best]) best = i; });
    set('year', money(d.ytd, true));
    set('delta', (d.pct >= 0 ? '+' : '−') + Math.abs(d.pct) + '%');
    set('best', m[best] ? MONTHS_LONG[best] : '—');
    var el = $('[data-kpi="delta"]');
    el.classList.toggle('cc-live__up', d.pct >= 0);
    el.classList.toggle('cc-live__down', d.pct < 0);
    $('[data-kpi-meta="year"]').textContent = '1 January to today, ' + y;
  }

  /* ── 4. Chart ─────────────────────────────────────────────────── */
  var chart = null;
  function thisYearData() {
    var y = new Date().getFullYear(), m = new Date().getMonth();
    return monthly(y).map(function (v, i) { return i <= m ? v : null; });
  }
  var labelsPlugin = {
    id: 'ccSalesLabels',
    afterDatasetsDraw: function (c) {
      var ctx = c.ctx, area = c.chartArea;
      ctx.save();
      var act = c.tooltip && c.tooltip.getActiveElements && c.tooltip.getActiveElements();
      if (act && act.length) {
        ctx.strokeStyle = tok('--ai-border-primary') || tok('--ai-text-contrast'); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(act[0].element.x, area.top); ctx.lineTo(act[0].element.x, area.bottom); ctx.stroke();
      }
      /* Direct labels at each line's last point: text in text ink, beside the coloured mark. */
      c.data.datasets.forEach(function (ds, di) {
        var meta = c.getDatasetMeta(di); if (meta.hidden) return;
        var last = -1; ds.data.forEach(function (v, j) { if (v !== null) last = j; });
        if (last < 0) return;
        var pt = meta.data[last];
        ctx.fillStyle = tok('--ai-text-secondary'); ctx.font = '600 11px Inter, sans-serif';
        var w = ctx.measureText(ds.label).width;
        ctx.textAlign = 'left';
        ctx.fillText(ds.label, Math.min(pt.x + 8, area.right - w), pt.y + (di === 0 ? -8 : 14));
      });
      ctx.restore();
    }
  };
  function drawChart() {
    if (!window.Chart) return;
    var y = new Date().getFullYear();
    var thisYear = tok('--ai-accent-lagoon-solid'), lastYear = tok('--ai-accent-purple-solid');
    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = tok('--ai-text-contrast');
    var fill = function (ctx) {
      var area = ctx.chart.chartArea;
      if (!area) return thisYear;
      var g = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
      g.addColorStop(0, thisYear + '40'); g.addColorStop(1, thisYear + '00');
      return g;
    };
    var point = { pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2, pointHoverBorderColor: tok('--ai-surface-primary') };
    chart = new Chart($('[data-canvas]'), {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [
          /* The current month is only part-way through: its segment is dotted, so the drop to a
             part-month total does not read as a collapse. */
          Object.assign({ label: String(y), data: thisYearData(), borderColor: thisYear, backgroundColor: fill, fill: true,
            tension: 0.35, borderWidth: 2, pointHoverBackgroundColor: thisYear, spanGaps: false,
            segment: { borderDash: function (ctx) { return ctx.p1DataIndex === new Date().getMonth() ? [2, 3] : undefined; } } }, point),
          Object.assign({ label: String(y - 1), data: monthly(y - 1), borderColor: lastYear, backgroundColor: lastYear, fill: false,
            borderDash: [5, 4], tension: 0.35, borderWidth: 2, pointHoverBackgroundColor: lastYear }, point)
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: REDUCED ? false : { duration: 400 },
        layout: { padding: { top: 16, right: 40 } },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tok('--ai-surface-invert'), titleColor: tok('--ai-text-invert'), bodyColor: tok('--ai-text-invert'),
            padding: 10, cornerRadius: 6, boxPadding: 4, usePointStyle: true,
            callbacks: {
              title: function (items) { return MONTHS_LONG[items[0].dataIndex] + (items[0].dataIndex === new Date().getMonth() ? ' (to date)' : ''); },
              label: function (c) { return ' ' + c.dataset.label + ': ' + (c.parsed.y === null ? '—' : money(c.parsed.y, true)); }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 } },
          y: { beginAtZero: true, grid: { color: tok('--ai-border-secondary') }, border: { display: false },
               ticks: { maxTicksLimit: 5, callback: function (v) { return short(v); } } }
        }
      },
      plugins: [labelsPlugin]
    });
  }
  function renderChartMeta() {
    var y = new Date().getFullYear(), d = yearDelta(), up = d.pct >= 0;
    var el = $('[data-chart-delta]');
    el.className = 'badge badge--' + (up ? 'success' : 'danger');
    el.innerHTML = '<i data-lucide="' + (up ? 'trending-up' : 'trending-down') + '" aria-hidden="true"></i>' +
      (up ? '+' : '−') + Math.abs(d.pct) + '% year to date';
    $('[data-chart-sub]').textContent = y + ' against ' + (y - 1) + ' · ' + cur().iso + ', excluding VAT';
    $('[data-key-partial]').textContent = MONTHS_LONG[new Date().getMonth()] + ' to date';
    $('[data-canvas]').setAttribute('aria-label', 'Line chart of monthly sales in ' + cur().iso + ': ' + y + ' against ' + (y - 1));
    $('[data-key-this]').textContent = y; $('[data-key-last]').textContent = y - 1;
    $('[data-th-this]').textContent = y; $('[data-th-last]').textContent = y - 1;
    var a = thisYearData(), b = monthly(y - 1);
    $('[data-months]').innerHTML = MONTHS_LONG.map(function (lab, i) {
      return '<tr><td>' + lab + (i === new Date().getMonth() ? ' (to date)' : '') + '</td><td class="cc-live__num">' + (a[i] === null ? '—' : money(a[i], true)) +
        '</td><td class="cc-live__num">' + money(b[i], true) + '</td></tr>';
    }).join('');
  }
  function renderYear() {
    renderYearKpis();
    if (chart) {
      var y = new Date().getFullYear();
      chart.data.datasets[0].data = thisYearData();
      chart.data.datasets[1].data = monthly(y - 1);
      chart.update(REDUCED ? 'none' : undefined);
    }
    renderChartMeta();
    if (window.lucide) window.lucide.createIcons();
  }

  /* ── 5. Lists ─────────────────────────────────────────────────── */
  var LINKS = {
    team: function (code) { return '/control/sales-team?SalesTeamCode=' + code; },
    person: function (code) { return '/control/contacts?screen=UserView&UserCode=' + code; },
    product: function (code) { return '/control/catalogue-item?CatalogueItemCode=' + code; }
  };
  function link(href, inner) {
    return '<a class="cc-live__link" href="' + esc(href) + '" target="_blank" rel="noopener">' + inner + '</a>';
  }
  function avatar(src) {
    return '<span class="avatar avatar--size-1"><img class="portrait" src="' + esc(src) + '" alt="" loading="lazy"></span>';
  }
  function paging(key, total) {
    $('[data-empty="' + key + '"]').hidden = total > 0;
    $('[data-more="' + key + '"]').parentElement.hidden = total <= shown[key];
  }
  function renderTeams(rows) {
    var all = teamRows(rows), top = all.length ? all[0].value : 1;
    paging('team', all.length);
    $('[data-list="team"]').innerHTML = all.slice(0, shown.team).map(function (r, i) {
      var pct = Math.max(2, Math.round(r.value / top * 100));
      return '<li class="cc-live__row">' +
        '<span class="cc-live__pos" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="cc-live__row-main"><span class="cc-live__row-line">' +
          link(LINKS.team(r.code), '<span class="cc-live__row-name">' + esc(r.name) + '</span>') +
          '<span class="cc-live__views">' + money(r.value) + '</span></span>' +
          '<span class="cc-live__bar" aria-hidden="true"><span class="cc-live__bar-fill" style="--cc-live-share:' + pct + '%"></span></span>' +
        '</span></li>';
    }).join('');
  }
  function renderPeople(rows) {
    var all = personRows(rows);
    paging('person', all.length);
    $('[data-list="person"]').innerHTML = all.slice(0, shown.person).map(function (r) {
      return '<tr><td class="cc-live__title-cell">' + link(LINKS.person(r.person.code),
          '<span class="cc-live__author">' + avatar(r.person.avatar) + '<span>' + esc(r.person.name) + '</span></span>') + '</td>' +
        '<td class="cc-live__nowrap">' + esc(teamName(r.person.teams)) + '</td>' +
        '<td class="cc-live__nowrap">' + esc(unitName(r.person.teams)) + '</td>' +
        '<td class="cc-live__num">' + NUM.format(r.orders) + '</td>' +
        '<td class="cc-live__num cc-live__nowrap">' + money(r.value) + '</td></tr>';
    }).join('');
  }
  var fresh = {};   // order codes added by a refresh, highlighted once
  function renderRecent(rows) {
    var all = recentRows(rows);
    paging('recent', all.length);
    $('[data-list="recent"]').innerHTML = all.slice(0, shown.recent).map(function (r) {
      var p = r.line.product, o = r.order;
      return '<tr' + (fresh[o.code] ? ' class="cc-sales__new"' : '') + '><td class="cc-live__title-cell">' + link(LINKS.product(p.code), esc(p.name)) + '</td>' +
        '<td class="cc-live__nowrap">' + o.code + '</td>' +
        '<td class="cc-live__nowrap"><time datetime="' + o.created.toISOString() + '">' + DATE.format(o.created) + '</time></td>' +
        '<td class="cc-live__nowrap">' + esc(p.category) + '</td>' +
        '<td class="cc-live__nowrap">' + esc(p.line) + '</td>' +
        '<td class="cc-live__nowrap">' + esc(o.account) + '</td>' +
        '<td class="cc-live__num cc-live__nowrap">' + money(r.line.value) + '</td></tr>';
    }).join('');
    fresh = {};
  }
  function renderWindow() {
    var rows = inWindow();
    $$('[data-window-name]').forEach(function (el) { el.textContent = tf().name; });
    $('[data-window-range]').textContent = rangeText();
    renderKpis(rows);
    renderTeams(rows);
    renderPeople(rows);
    renderRecent(rows);
    if (window.lucide) window.lucide.createIcons();
  }

  page.addEventListener('click', function (e) {
    var more = e.target.closest('[data-more]');
    if (!more) return;
    var key = more.getAttribute('data-more');
    shown[key] = Math.min(shown[key] + SL.paging[key][1], SL.paging.max);
    var rows = inWindow();
    if (key === 'team') renderTeams(rows); else if (key === 'person') renderPeople(rows); else renderRecent(rows);
    if (window.lucide) window.lucide.createIcons();
  });

  /* ── 6. Refresh ───────────────────────────────────────────────── */
  var lastUpdate = Date.now();
  function tick() {
    var s = Math.round((Date.now() - lastUpdate) / 1000);
    $('[data-updated]').textContent = s < 60 ? 'Updated just now' : 'Updated ' + Math.floor(s / 60) + 'm ago';
  }
  /* Mock: sometimes a new order has come in since the last call. */
  function refresh() {
    if (Math.random() < 0.6) {
      var o = SL.orders[SL.orders.length - 1], p = SL.products[Math.floor(Math.random() * SL.products.length)];
      var value = state.currency === 1 ? Math.round(p.price * 100) / 100 : Math.round(p.price * 1.2);
      var order = { code: o.code + 1, created: new Date(), currency: state.currency, owner: SL.people[Math.floor(Math.random() * 6)],
        account: o.account, lines: [{ product: p, value: value }], value: value };
      SL.orders.push(order);
      fresh[order.code] = true;
    }
    renderWindow();
    renderYear();
    lastUpdate = Date.now();
    tick();
  }
  setInterval(function () { if (document.visibilityState === 'visible') refresh(); }, SL.refreshMs);
  setInterval(tick, 15000);

  renderWindow();
  renderYearKpis();
  drawChart();
  renderChartMeta();
  if (window.lucide) window.lucide.createIcons();
  /* Demo only: ?refresh=now runs one refresh at once, so the refresh can be checked. */
  if (/[?&]refresh=now/.test(location.search)) refresh();
})();
