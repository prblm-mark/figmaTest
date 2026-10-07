/* ContractAnalysis — /control/contract-analysis on the v3 framework (TASK-470978).
 *
 * Four tabs, as classic (?Navigation=Contract | TopAccounts | Outstanding | Review), each built
 * from existing parts: RecordTabs, StatCard, Chart (Chart.js), Input, Select, DatePicker, Badge,
 * Datatables + Table. Everything is computed here from contract-analysis-data.js, so the filters
 * really filter and every figure traces to one rule (Data rules, figma-notes).
 *
 * Classic problems fixed here (all flagged in the notes for the backend to match):
 *   - "Ave. contract value" was total ÷ customers → labelled "Ave. value per customer"
 *   - Top 10 Accounts was a line chart over account names → horizontal bar
 *   - Contract Type (Top Accounts) and Account Type (Outstanding) were shown but never applied → applied
 *   - "New Business / Renewals Percentage" was each month's share of the YEAR → per-month 100% split
 *   - By-industry / by-owner charts were TOP 20 unordered → top 6 by value + "Other"
 *   - tabs disagreed on cancelled / archived → one rule: not cancelled, not archived, everywhere
 *   - Date From / Date To + a preset list → one Date range control with a Custom range option
 *   - Outstanding's "Amounts" cell crammed amount + (outstanding), unformatted → two £ columns
 *   - counts are bars, values are filled lines (classic drew all six as identical grey lines)
 *
 * TODO(backend:ContractAnalysis) [contract-analysis-tabs]: each tab is server-rendered in v3 from
 * its classic include; the client-side filtering here stands in for the GET form. See the
 * manifest for the per-tab contracts.
 */
(function () {
  'use strict';

  var D = window.CONTRACT_ANALYSIS_DATA, L = window.CONTRACT_ANALYSIS_LOOKUPS, TODAY = window.CONTRACT_ANALYSIS_TODAY;
  var page = document.querySelector('.cc-analysis');
  if (!page || !D) return;

  /* ── Formatting ───────────────────────────────────────────── */
  var GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  var NUM = new Intl.NumberFormat('en-GB');
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function money(n) { return GBP.format(n); }
  function d(dt) { return dt ? dt.getDate() + ' ' + MON[dt.getMonth()] + ' ' + dt.getFullYear() : '—'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sum(rows, k) { return rows.reduce(function (a, r) { return a + r[k]; }, 0); }
  function monthStart(y, m) { return new Date(y, m, 1); }

  /* ── Data rules: one definition of "counted", every tab ───── */
  var COUNTED = D.contracts.filter(function (c) { return !c.cancelled && !c.archived; });

  /* ── Tabs ─────────────────────────────────────────────────── */
  var tabs = page.querySelectorAll('[data-tab]');
  var panels = page.querySelectorAll('[data-panel]');
  function showTab(key) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === key;
      t.classList.toggle('record-tab--active', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== key; });
    var url = new URL(window.location.href);
    url.searchParams.set('Navigation', key);
    window.history.replaceState(null, '', url);
    renderTab(key);
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) { e.preventDefault(); showTab(t.getAttribute('data-tab')); });
  });

  /* ── Filters: one spec, every tab (classic copy-pasted it three times) ── */
  var FILTERS = {
    TopAccounts: ['account', 'accountType', 'contractType', 'industry', 'dateRange'],
    Outstanding: ['account', 'accountType', 'contractType'],
    Review: ['account', 'accountType', 'contractType', 'owner', 'industry']
  };
  var FIELD = {
    accountType: { label: 'Account type', all: 'All account types', options: L.accountTypes },
    contractType: { label: 'Contract type', all: 'All contract types', options: L.contractTypes },
    industry: { label: 'Industry', all: 'All industries', options: L.industries },
    owner: { label: 'Opportunity owner', all: 'All owners', options: L.owners },
    dateRange: { label: 'Date range', all: 'All time',
      options: ['Today', 'This week', 'Last 7 days', 'This month', 'Last 30 days', 'Last 90 days', 'This year', 'Last 12 months', 'Custom range…'] }
  };
  var state = { TopAccounts: {}, Outstanding: {}, Review: {} };

  function selectHtml(tab, key) {
    var f = FIELD[key];
    var items = ['<li><button type="button" class="sel__menu-item sel__menu-item--selected" role="option" aria-selected="true" data-value="">' + esc(f.all) + ' <i data-lucide="check"></i></button></li>']
      .concat(f.options.map(function (o) { return '<li><button type="button" class="sel__menu-item" role="option" data-value="' + esc(o) + '">' + esc(o) + '</button></li>'; }));
    return '<div class="sel cc-analysis__filter" data-sel data-filter="' + key + '">' +
      '<button type="button" class="sel__control sel__control--sm" data-sel-trigger aria-haspopup="listbox" aria-label="' + esc(f.label) + '">' +
        '<span class="sel__value">' + esc(f.all) + '</span><span class="sel__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>' +
      '</button><ul class="sel__menu" role="listbox">' + items.join('') + '</ul></div>';
  }

  function buildFilters(tab) {
    var host = page.querySelector('[data-filters="' + tab + '"]');
    var html = FILTERS[tab].map(function (key) {
      if (key === 'account') {
        return '<div class="input input--sm cc-analysis__search"><div class="input__wrap">' +
          '<i data-lucide="search" class="input__icon" aria-hidden="true"></i>' +
          '<input type="search" class="input__control" placeholder="Search accounts" aria-label="Search accounts" data-filter="account">' +
          '</div></div>';
      }
      return selectHtml(tab, key);
    }).join('');
    if (FILTERS[tab].indexOf('dateRange') !== -1) {
      /* Custom range: one range DatePicker in place of classic's Date From + Date To fields. */
      html += '<div class="datepicker cc-analysis__range" data-datepicker data-mode="range" data-months="2" hidden>' +
        '<div class="input input--sm"><div class="input__wrap">' +
        '<input class="input__control" type="text" readonly placeholder="Choose dates" data-datepicker-input aria-label="Custom date range">' +
        '<i data-lucide="calendar" class="datepicker__field-icon" data-datepicker-toggle aria-hidden="true"></i>' +
        '</div></div></div>';
    }
    html += '<button type="button" class="btn btn--tertiary btn--sm cc-analysis__reset" data-filter-reset hidden>Reset</button>';
    host.innerHTML = html;

    var search = host.querySelector('[data-filter="account"]');
    var t;
    if (search) search.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { state[tab].account = search.value.trim().toLowerCase(); changed(tab); }, 200);
    });
    host.querySelector('[data-filter-reset]').addEventListener('click', function () {
      state[tab] = {};
      buildFilters(tab);
      if (window.lucide) window.lucide.createIcons();
      changed(tab);
    });
  }

  /* Select.js sets the value on a document click listener; this one runs after it. */
  document.addEventListener('click', function (e) {
    var item = e.target.closest('.cc-analysis__filters [data-filter] .sel__menu-item');
    if (!item) return;
    var wrap = item.closest('[data-filter]'), tab = item.closest('[data-filters]').getAttribute('data-filters');
    var key = wrap.getAttribute('data-filter'), val = item.getAttribute('data-value');
    state[tab][key] = val || null;
    if (key === 'dateRange') {
      var range = page.querySelector('[data-filters="' + tab + '"] .cc-analysis__range');
      range.hidden = val !== 'Custom range…';
      if (val !== 'Custom range…') state[tab].custom = null;
    }
    changed(tab);
  });

  /* DatePicker has no change event: read its selection label after a click in it. */
  page.addEventListener('click', function (e) {
    var picker = e.target.closest('.cc-analysis__range');
    if (!picker) return;
    setTimeout(function () {
      var lbl = picker.querySelector('.datepicker__selected');
      var m = lbl && /(\d+) (\w{3}) (\d{4}) — (\d+) (\w{3}) (\d{4})/.exec(lbl.textContent);
      if (!m) return;
      var from = new Date(+m[3], MON.indexOf(m[2]), +m[1]), to = new Date(+m[6], MON.indexOf(m[5]), +m[4]);
      var input = picker.querySelector('[data-datepicker-input]');
      if (input) input.value = d(from) + ' – ' + d(to);
      var tab = picker.closest('[data-filters]').getAttribute('data-filters');
      state[tab].custom = { from: from, to: new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1) };
      changed(tab);
    }, 0);
  });

  function presetStart(p) {
    var y = TODAY.getFullYear(), m = TODAY.getMonth(), dd = TODAY.getDate();
    var dow = (TODAY.getDay() + 6) % 7;
    return { 'Today': new Date(y, m, dd), 'This week': new Date(y, m, dd - dow), 'Last 7 days': new Date(y, m, dd - 7),
      'This month': new Date(y, m, 1), 'Last 30 days': new Date(y, m, dd - 30), 'Last 90 days': new Date(y, m, dd - 90),
      'This year': new Date(y, 0, 1), 'Last 12 months': new Date(y, m - 11, 1) }[p] || null;
  }

  function applyFilters(tab, rows) {
    var s = state[tab];
    return rows.filter(function (c) {
      if (s.account && c.account.toLowerCase().indexOf(s.account) === -1) return false;
      if (s.accountType && c.accountType !== s.accountType) return false;
      if (s.contractType && c.type !== s.contractType) return false;
      if (s.industry && c.industry !== s.industry) return false;
      if (s.owner && c.owner !== s.owner) return false;
      if (s.dateRange && s.dateRange !== 'Custom range…') {
        var from = presetStart(s.dateRange);
        if (from && c.created < from) return false;
      }
      if (s.dateRange === 'Custom range…' && s.custom) {
        if (c.created < s.custom.from || c.created >= s.custom.to) return false;
      }
      return true;
    });
  }

  function changed(tab) {
    var s = state[tab];
    var active = Object.keys(s).some(function (k) { return s[k]; });
    var reset = page.querySelector('[data-filters="' + tab + '"] [data-filter-reset]');
    if (reset) reset.hidden = !active;
    renderTab(tab);
  }

  /* ── KPIs (StatCard) ──────────────────────────────────────── */
  function kpi(size, colour, icon, title, value, meta) {
    if (size === 'xl') {
      return '<div class="stat-card stat-card--xl stat-card--' + colour + '">' +
        '<div class="stat-card__head"><div class="stat-card__icon-wrap"><i data-lucide="' + icon + '" aria-hidden="true"></i></div>' +
        '<div class="stat-card__text"><p class="stat-card__title">' + esc(title) + '</p>' + (meta ? '<p class="stat-card__meta">' + esc(meta) + '</p>' : '') + '</div></div>' +
        '<p class="stat-card__value">' + esc(value) + '</p></div>';
    }
    return '<div class="stat-card stat-card--' + colour + '"><div class="stat-card__icon-wrap"><i data-lucide="' + icon + '" aria-hidden="true"></i></div>' +
      '<div class="stat-card__text"><p class="stat-card__title">' + esc(title) + '</p><p class="stat-card__value">' + esc(value) + '</p></div></div>';
  }
  function setKpis(name, html) { page.querySelector('[data-kpis="' + name + '"]').innerHTML = html; }

  /* ── Charts ───────────────────────────────────────────────── */
  var charts = {};
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  /* Lagoon/9 + Purple/600 for any two-series chart (designer, 2026-10-07; was blue + orange, and
   * blue + purple before that, which was ΔE 2.5 to a deuteranope). Lagoon + purple passes the dataviz
   * validator in both themes (deutan ΔE 16.0). Groups continue emerald, orange, blue, pink, then grey
   * for "Other": the order passes both themes (worst adjacent protan ΔE 10.1, normal 28.6). Emerald
   * and pink are ΔE 1.1 deutan and emerald/lagoon 11.9 normal, so neither pair sits together.
   * Purple is 2.72:1 on the dark card — relieved by the legend and the month tables. */
  var PAIR = ['--ai-accent-lagoon-solid', '--ai-accent-purple-solid'];
  var SERIES = ['--ai-accent-lagoon-solid', '--ai-accent-purple-solid', '--ai-accent-emerald-solid', '--ai-accent-orange-solid',
    '--ai-accent-blue-solid', '--ai-accent-pink-solid', '--ai-text-contrast'];

  function chartCard(id, big, sub) {
    var host = page.querySelector('[data-chart="' + id + '"]');
    host.querySelector('.chart__big').textContent = big;
    host.querySelector('.chart__sub').textContent = sub;
    return host.querySelector('canvas');
  }

  function draw(id, cfg) {
    if (!window.Chart) return;
    if (charts[id]) charts[id].destroy();
    var canvas = page.querySelector('[data-chart="' + id + '"] canvas');
    var grid = tok('--ai-border-secondary'), text = tok('--ai-text-contrast');
    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = text;
    var horizontal = cfg.indexAxis === 'y';
    charts[id] = new Chart(canvas, {
      type: cfg.type,
      data: { labels: cfg.labels, datasets: cfg.datasets },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: cfg.indexAxis || 'x',
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: !!cfg.legend, position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } },
          tooltip: {
            backgroundColor: tok('--ai-surface-invert'), titleColor: tok('--ai-text-invert'), bodyColor: tok('--ai-text-invert'),
            padding: 10, cornerRadius: 6,
            callbacks: { title: cfg.tooltipTitle ? function (items) { return items.length ? cfg.tooltipTitle(items[0].dataIndex) : ''; } : undefined,
              label: function (c) {
              var v = horizontal ? c.parsed.x : c.parsed.y;
              return (c.dataset.label ? c.dataset.label + ': ' : '') + (cfg.percent ? v.toFixed(0) + '%' : cfg.money ? money(v) : NUM.format(v));
            } }
          }
        },
        scales: {
          x: { stacked: !!cfg.stacked, grid: { display: horizontal, color: grid }, border: { display: false },
               ticks: horizontal ? { callback: function (v) { return cfg.money ? GBP.format(v).replace(/,000$/, 'k') : v; } } : { maxRotation: 0, autoSkip: true } },
          y: { stacked: !!cfg.stacked, beginAtZero: true, max: cfg.percent ? 100 : undefined,
               grid: { display: !horizontal, color: grid }, border: { display: false },
               ticks: horizontal ? {} : { precision: 0, callback: function (v) { return cfg.percent ? v + '%' : cfg.money ? compactMoney(v) : v; } } }
        }
      }
    });
  }
  function compactMoney(v) { return v >= 1e6 ? '£' + (v / 1e6).toFixed(1) + 'm' : v >= 1e3 ? '£' + Math.round(v / 1e3) + 'k' : '£' + v; }

  function fill(colour) {
    return function (ctx) {
      var c = ctx.chart, area = c.chartArea;
      if (!area) return colour;
      var g = c.ctx.createLinearGradient(0, area.top, 0, area.bottom);
      g.addColorStop(0, colour + '55');
      g.addColorStop(1, colour + '00');
      return g;
    };
  }
  function line(label, data, colour, filled) {
    return { label: label, data: data, borderColor: colour, backgroundColor: filled ? fill(colour) : colour, fill: !!filled,
             tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 };
  }
  /* One bar shape everywhere (designer, 2026-10-02), Flowbite-style: the outer end is rounded
   * (the top, or the right on horizontal bars) and the base is flat. On stacked charts only the
   * topmost visible segment of each column is rounded, so a stack reads as one bar, not a pile
   * of pills. */
  var BAR_RADIUS = 4;
  function bar(label, data, colour) {
    return { label: label, data: data, backgroundColor: colour, maxBarThickness: 28, borderSkipped: 'start',
      borderRadius: function (ctx) {
        var chart = ctx.chart, stacked = chart.options.scales && chart.options.scales.x && chart.options.scales.x.stacked;
        if (!stacked) return BAR_RADIUS;
        var i = ctx.dataIndex, sets = chart.data.datasets, top = -1;
        for (var j = 0; j < sets.length; j++) if (chart.isDatasetVisible(j) && sets[j].data[i] > 0) top = j;
        return ctx.datasetIndex === top ? BAR_RADIUS : 0;
      } };
  }

  /* Buckets */
  function byDayThisMonth(rows, k) {
    var y = TODAY.getFullYear(), m = TODAY.getMonth(), n = new Date(y, m + 1, 0).getDate(), out = [];
    for (var i = 1; i <= n; i++) out.push(0);
    rows.forEach(function (c) { if (c.created.getFullYear() === y && c.created.getMonth() === m) out[c.created.getDate() - 1] += k ? c[k] : 1; });
    return { labels: out.map(function (_, i) { return String(i + 1); }), data: out };
  }
  /* Month-to-date pace: the running count of contracts per day of this month, against last month's
   * running count by the same day. This month stops at today (no flat line into the future); last
   * month runs the full length of this month, so "by this day" always has a value to compare with. */
  function paceThisMonth(rows) {
    var y = TODAY.getFullYear(), m = TODAY.getMonth(), n = new Date(y, m + 1, 0).getDate();
    var prev = new Date(y, m - 1, 1), py = prev.getFullYear(), pm = prev.getMonth();
    var cur = [], last = [], a = 0, b = 0;
    for (var d = 1; d <= n; d++) {
      a += rows.filter(function (c) { return c.created.getFullYear() === y && c.created.getMonth() === m && c.created.getDate() === d; }).length;
      b += rows.filter(function (c) { return c.created.getFullYear() === py && c.created.getMonth() === pm && c.created.getDate() === d; }).length;
      cur.push(d <= TODAY.getDate() ? a : null);
      last.push(b);
    }
    return { labels: cur.map(function (_, i) { return String(i + 1); }), current: cur, previous: last,
             today: TODAY.getDate(), month: m, prevMonth: pm };
  }
  /* Running count of contracts month by month over the last n months (this month included, to
   * date), against the n months before it, cut at the same day. Feeds the 12-month pace chart. */
  function paceMonths(rows, n) {
    function run(shift) {
      var out = [], a = 0;
      for (var i = n - 1; i >= 0; i--) {
        var s = monthStart(TODAY.getFullYear(), TODAY.getMonth() - i - shift), e = monthStart(s.getFullYear(), s.getMonth() + 1);
        // The last month is to date, so the comparison stops at the same day: like for like.
        if (i === 0) e = new Date(s.getFullYear(), s.getMonth(), TODAY.getDate() + 1);
        a += rows.filter(function (c) { return c.created >= s && c.created < e; }).length;
        out.push(a);
      }
      return out;
    }
    var months = [];
    for (var i = n - 1; i >= 0; i--) months.push(monthStart(TODAY.getFullYear(), TODAY.getMonth() - i));
    return { months: months, current: run(0), previous: run(n) };
  }
  function byMonth(rows, k, offsetYears) {
    var labels = [], data = [];
    for (var i = 11; i >= 0; i--) {
      var s = monthStart(TODAY.getFullYear() - (offsetYears || 0), TODAY.getMonth() - i);
      var e = monthStart(s.getFullYear(), s.getMonth() + 1);
      labels.push(MON[s.getMonth()] + ' ' + String(s.getFullYear()).slice(2));
      data.push(rows.reduce(function (a, c) { return a + (c.created >= s && c.created < e ? (k ? c[k] : 1) : 0); }, 0));
    }
    return { labels: labels, data: data };
  }
  function byYear(rows, k) {
    var labels = [], data = [];
    for (var i = 4; i >= 0; i--) {
      var y = TODAY.getFullYear() - i;
      labels.push(String(y) + (i === 0 ? ' YTD' : ''));
      data.push(rows.reduce(function (a, c) { return a + (c.created.getFullYear() === y ? (k ? c[k] : 1) : 0); }, 0));
    }
    return { labels: labels, data: data };
  }
  function total(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

  /* ── Tables (Datatables + Table) ──────────────────────────── */
  var tables = {};
  var STATUS_TONE = { 'Paid': 'success', 'In Arrears': 'danger', 'Written Off': 'neutral' };
  function payBadge(s) { return '<span class="badge badge--' + (STATUS_TONE[s] || 'warning') + '">' + esc(s) + '</span>'; }
  function expiry(c) {
    if (!c.renewable || !c.endDate) return 'One-off';
    var days = Math.round((c.endDate - TODAY) / 86400000);
    return days < 0 ? 'Expired' : days <= 7 ? 'Imminent expiry' : days <= 30 ? 'Upcoming expiry' : 'OK';
  }
  var EXPIRY_TONE = { 'OK': 'success', 'One-off': 'neutral', 'Upcoming expiry': 'warning', 'Imminent expiry': 'danger', 'Expired': 'danger' };
  function expiryBadge(c) { var s = expiry(c); return '<span class="badge badge--' + EXPIRY_TONE[s] + '">' + s + '</span>'; }
  function acctLink(c) {
    /* TODO(backend:ContractAnalysis): live → /control/accounts?Action=View&AccountCode=<code> */
    return '<a class="datatables__record-link" href="#account/' + c.accountCode + '">' + esc(c.account) + '</a>';
  }
  function contractLink(c) {
    /* TODO(backend:ContractAnalysis): live → the contract's view screen */
    return '<a class="datatables__record-link" href="#contract/' + c.code + '">' + esc(c.name) + '</a>';
  }

  /* Classic ContractDef showed 10 columns. Type, Renewal and Media are dropped from the table: the
   * contract name carries the type, Term says "One-off", and Media is on the contract itself. */
  var CONTRACT_COLS = [
    { key: 'name', label: 'Contract', sort: function (r) { return r.name; }, html: contractLink },
    { key: 'account', label: 'Account', sort: function (r) { return r.account; }, html: acctLink },
    { key: 'amount', label: 'Amount', num: true, sort: function (r) { return r.amount; }, html: function (r) { return money(r.amount); } },
    { key: 'paymentStatus', label: 'Payment status', sort: function (r) { return r.paymentStatus; }, html: function (r) { return payBadge(r.paymentStatus); } },
    { key: 'term', label: 'Term', sort: function (r) { return r.startDate; }, html: function (r) { return d(r.startDate) + ' – ' + (r.renewable && r.endDate ? d(r.endDate) : 'One-off'); } },
    { key: 'status', label: 'Status', sort: function (r) { return expiry(r); }, html: expiryBadge },
    { key: 'created', label: 'Created', sort: function (r) { return r.created; }, html: function (r) { return d(r.created); } }
  ];

  function table(id, cols, rows, opts) {
    var host = page.querySelector('[data-table="' + id + '"]');
    var t = tables[id] = tables[id] || { sort: opts.sort, dir: opts.dir || 'desc', shown: opts.page || rows.length };
    if (opts.resetPaging) t.shown = opts.page || rows.length;
    var col = cols.filter(function (c) { return c.key === t.sort; })[0];
    var sorted = rows.slice();
    if (col) sorted.sort(function (a, b) {
      var x = col.sort(a), y = col.sort(b);
      return (x > y ? 1 : x < y ? -1 : 0) * (t.dir === 'asc' ? 1 : -1);
    });
    var vis = sorted.slice(0, t.shown);
    var head = cols.map(function (c) {
      var active = c.key === t.sort;
      var icon = !active ? 'chevrons-up-down' : t.dir === 'asc' ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow';
      var aria = active ? (t.dir === 'asc' ? 'ascending' : 'descending') : 'none';
      return '<th' + (c.num ? ' class="cc-analysis__num"' : '') + ' aria-sort="' + aria + '"><button type="button" class="datatables__sort' +
        (active ? ' datatables__sort--active' : '') + '" data-sort="' + c.key + '">' + esc(c.label) + ' <i data-lucide="' + icon + '" aria-hidden="true"></i></button></th>';
    }).join('');
    var body = vis.length ? vis.map(function (r) {
      return '<tr>' + cols.map(function (c) { return '<td' + (c.num ? ' class="cc-analysis__num"' : '') + '>' + c.html(r) + '</td>'; }).join('') + '</tr>';
    }).join('') : '<tr><td class="cc-analysis__empty" colspan="' + cols.length + '">No contracts match these filters.</td></tr>';
    host.innerHTML =
      '<div class="datatables__toolbar">' +
        '<span class="datatables__meta">' + (opts.title ? '<strong class="cc-analysis__table-title">' + esc(opts.title) + '</strong>' : '') +
          '<span>' + (opts.title ? NUM.format(rows.length) + ' contracts' : 'Showing <strong>' + NUM.format(vis.length) + '</strong> of <strong>' + NUM.format(rows.length) + '</strong>') + '</span></span>' +
        (opts.totalLabel ? '<span class="cc-analysis__table-total">' + esc(opts.totalLabel) + '</span>' : '') +
      '</div>' +
      '<div class="datatables__body"><table class="table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      (sorted.length > vis.length ? '<div class="cc-analysis__more"><button type="button" class="btn btn--secondary btn--sm" data-more>Show ' +
        NUM.format(Math.min(opts.page, sorted.length - vis.length)) + ' more</button></div>' : '');
    /* Re-renders from a header or "Show more" keep the current paging; only a tab render (new
     * data, new filters) resets it. */
    var keep = Object.assign({}, opts, { resetPaging: false });
    host.onclick = function (e) {
      var s = e.target.closest('[data-sort]');
      if (s) {
        var k = s.getAttribute('data-sort');
        if (t.sort === k) t.dir = t.dir === 'asc' ? 'desc' : 'asc'; else { t.sort = k; t.dir = 'desc'; }
        table(id, cols, rows, keep);
        if (window.lucide) window.lucide.createIcons();
        return;
      }
      if (e.target.closest('[data-more]')) { t.shown += opts.page; table(id, cols, rows, keep); if (window.lucide) window.lucide.createIcons(); }
    };
  }

  /* ── Tab: Contract Overview ───────────────────────────────── */
  function overview() {
    var value = sum(COUNTED, 'amount');
    var customers = new Set(COUNTED.map(function (c) { return c.accountCode; })).size;
    setKpis('overview',
      kpi('xl', 'lagoon', 'receipt-pound-sterling', 'Total contract value', money(value), 'All time · ' + NUM.format(COUNTED.length) + ' contracts') +
      kpi('xl', 'jade', 'users', 'Customers', NUM.format(customers), 'Accounts with a contract') +
      kpi('xl', 'violet-radix', 'badge-pound-sterling', 'Ave. value per customer', money(customers ? value / customers : 0), 'Total value ÷ customers'));

    /* The Monthly review pair: value charts lagoon, count charts purple (designer, 2026-10-07). */
    var valueC = tok(PAIR[0]), countC = tok(PAIR[1]);
    var mv = byDayThisMonth(COUNTED, 'amount');
    var yv = byMonth(COUNTED, 'amount');
    var fv = byYear(COUNTED, 'amount'), fc = byYear(COUNTED);
    var mName = MONTH[TODAY.getMonth()];
    chartCard('ov-month-value', money(total(mv.data)), 'Contract value · ' + mName + ' to date');
    draw('ov-month-value', { type: 'line', labels: mv.labels, datasets: [line('Value', mv.data, valueC, true)], money: true });
    /* Month-to-date contracts as a running total against last month by the same day (designer,
     * 2026-10-07). A daily bar chart of a 0/1 count was six identical full-height bars; the pace
     * line answers "ahead of or behind last month?". Last month is the recessive reference: grey,
     * dashed, behind. */
    var paceLine = function (label, data, colour, dashed) {
      return { label: label, data: data, borderColor: colour, backgroundColor: colour, stepped: 'after', fill: false,
               borderWidth: 2, borderDash: dashed ? [4, 4] : [], pointRadius: 0, pointHoverRadius: 4, spanGaps: false,
               order: dashed ? 2 : 1 };
    };
    var pace = paceThisMonth(COUNTED), pName = MONTH[pace.prevMonth];
    var soFar = pace.current[pace.today - 1], lastBy = pace.previous[pace.today - 1];
    chartCard('ov-month-count', NUM.format(soFar), 'Contracts · ' + mName + ' to date · ' + pName + ' by day ' + pace.today + ': ' + NUM.format(lastBy));
    draw('ov-month-count', { type: 'line', labels: pace.labels, legend: true,
      tooltipTitle: function (i) { return (i + 1) + ' ' + MONTH[pace.month].slice(0, 3); },
      datasets: [paceLine(mName, pace.current, countC), paceLine(pName, pace.previous, tok('--ai-text-contrast'), true)] });
    chartCard('ov-12-value', money(total(yv.data)), 'Contract value · last 12 months');
    draw('ov-12-value', { type: 'line', labels: yv.labels, datasets: [line('Value', yv.data, valueC, true)], money: true });
    /* The 12-month count uses the same pace form (designer, 2026-10-07): a running total
     * against the previous period of the same length. The reference is drawn only when that period
     * has contracts — an all-zero grey line would claim a comparison the data can't make. */
    var grey = tok('--ai-text-contrast');
    function paceChart(id, n, label, prevLabel) {
      var p = paceMonths(COUNTED, n), now = p.current[n - 1], before = p.previous[n - 1];
      chartCard(id, NUM.format(now), 'Contracts · ' + label + (before ? ' · ' + prevLabel + ': ' + NUM.format(before) : ''));
      var sets = [paceLine(label.charAt(0).toUpperCase() + label.slice(1), p.current, countC)];
      if (before) sets.push(paceLine(prevLabel.charAt(0).toUpperCase() + prevLabel.slice(1), p.previous, grey, true));
      draw(id, { type: 'line', labels: p.months.map(function (d) { return MON[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2); }),
        legend: sets.length > 1,
        tooltipTitle: function (i) { var d = p.months[i]; return MONTH[d.getMonth()] + ' ' + d.getFullYear() + (i === n - 1 ? ' (to date)' : ''); },
        datasets: sets });
    }
    paceChart('ov-12-count', 12, 'last 12 months', 'previous 12 months');
    chartCard('ov-5-value', money(total(fv.data)), 'Contract value · last 5 years');
    draw('ov-5-value', { type: 'line', labels: fv.labels, datasets: [line('Value', fv.data, valueC, true)], money: true });
    // 5 years stays a bar per year (designer, 2026-10-07): a five-year running total only climbs.
    chartCard('ov-5-count', NUM.format(total(fc.data)), 'Contracts · last 5 years');
    draw('ov-5-count', { type: 'bar', labels: fc.labels, datasets: [bar('Contracts', fc.data, countC)] });
  }

  /* ── Tab: Top Accounts ────────────────────────────────────── */
  function topAccounts() {
    var rows = applyFilters('TopAccounts', COUNTED.filter(function (c) { return c.paymentStatus !== 'Cancelled'; }));
    var by = {};
    rows.forEach(function (c) {
      var a = by[c.accountCode] = by[c.accountCode] || { accountCode: c.accountCode, account: c.account, industry: c.industry,
        accountType: c.accountType, contracts: 0, total: 0, first: c.created, latest: c.created };
      a.contracts++; a.total += c.amount;
      if (c.created < a.first) a.first = c.created;
      if (c.created > a.latest) a.latest = c.created;
    });
    var accts = Object.keys(by).map(function (k) {
      var a = by[k];
      var months = (a.latest.getFullYear() - a.first.getFullYear()) * 12 + a.latest.getMonth() - a.first.getMonth();
      a.monthly = months > 0 ? a.total / months : a.total;
      return a;
    });
    setKpis('top',
      kpi('base', 'lagoon', 'building-2', 'Accounts', NUM.format(accts.length)) +
      kpi('base', 'jade', 'file-text', 'Contracts', NUM.format(rows.length)) +
      kpi('base', 'violet-radix', 'receipt-pound-sterling', 'Value', money(sum(rows, 'amount'))));

    var top = accts.slice().sort(function (a, b) { return b.total - a.total; }).slice(0, 10);
    chartCard('top-10', top.length ? top[0].account : '—', top.length ? 'Top account · ' + money(top[0].total) : 'No accounts match these filters');
    draw('top-10', { type: 'bar', indexAxis: 'y', labels: top.map(function (a) { return a.account; }),
      datasets: [bar('Total value', top.map(function (a) { return a.total; }), tok('--ai-surface-brand'))], money: true });

    table('top', [
      { key: 'account', label: 'Account', sort: function (r) { return r.account; }, html: acctLink },
      { key: 'industry', label: 'Industry', sort: function (r) { return r.industry; }, html: function (r) { return esc(r.industry); } },
      { key: 'accountType', label: 'Account type', sort: function (r) { return r.accountType; }, html: function (r) { return esc(r.accountType); } },
      { key: 'contracts', label: 'Contracts', num: true, sort: function (r) { return r.contracts; }, html: function (r) { return NUM.format(r.contracts); } },
      { key: 'first', label: 'First', sort: function (r) { return r.first; }, html: function (r) { return d(r.first); } },
      { key: 'latest', label: 'Latest', sort: function (r) { return r.latest; }, html: function (r) { return d(r.latest); } },
      { key: 'monthly', label: 'Monthly ave.', num: true, sort: function (r) { return r.monthly; }, html: function (r) { return money(r.monthly); } },
      { key: 'total', label: 'Total', num: true, sort: function (r) { return r.total; }, html: function (r) { return money(r.total); } }
    ], accts, { sort: 'total', dir: 'desc', page: 20, resetPaging: true });
  }

  /* ── Tab: Outstanding Amounts ─────────────────────────────── */
  function outstanding() {
    var rows = applyFilters('Outstanding', COUNTED.filter(function (c) { return c.outstanding > 0 && c.paymentStatus !== 'Paid'; }));
    var arrears = rows.filter(function (c) { return c.paymentStatus === 'In Arrears'; });
    setKpis('outstanding',
      kpi('base', 'orange', 'receipt-pound-sterling', 'Outstanding', money(sum(rows, 'outstanding'))) +
      kpi('base', 'lagoon', 'file-text', 'Contracts', NUM.format(rows.length)) +
      kpi('base', 'red', 'circle-alert', 'In arrears', money(sum(arrears, 'outstanding'))));
    var cols = CONTRACT_COLS.slice();
    cols.splice(3, 0, { key: 'outstanding', label: 'Outstanding', num: true, sort: function (r) { return r.outstanding; },
      html: function (r) { return '<strong>' + money(r.outstanding) + '</strong>'; } });
    table('outstanding', cols, rows, { sort: 'outstanding', dir: 'desc', page: 20, resetPaging: true });
  }

  /* ── Tab: Monthly Review ──────────────────────────────────── */
  function review() {
    var s = state.Review;
    var rows = applyFilters('Review', COUNTED);
    var first = tok(PAIR[0]), second = tok(PAIR[1]);

    var cur = byMonth(rows, 'amount'), prev = byMonth(rows, 'amount', 1);
    chartCard('rv-yoy', money(total(cur.data)), 'Contract value · last 12 months vs the year before (' + money(total(prev.data)) + ')');
    draw('rv-yoy', { type: 'line', labels: cur.labels, legend: true, money: true,
      datasets: [line('Last 12 months', cur.data, first, true), line('Year before', prev.data, second, false)] });

    var nb = byMonth(rows.filter(function (c) { return c.origin === 1; }), 'amount');
    var rn = byMonth(rows.filter(function (c) { return c.origin === 2; }), 'amount');
    chartCard('rv-mix', money(total(nb.data)) + ' new', 'New business vs renewal value · renewals ' + money(total(rn.data)));
    draw('rv-mix', { type: 'line', labels: nb.labels, legend: true, money: true,
      datasets: [line('New business', nb.data, first, true), line('Renewal', rn.data, second, true)] });

    /* Per-month 100% split (classic divided by the whole year, so no month summed to 100). */
    var pctNb = nb.data.map(function (v, i) { var t = v + rn.data[i]; return t ? 100 * v / t : 0; });
    var pctRn = rn.data.map(function (v, i) { var t = v + nb.data[i]; return t ? 100 * v / t : 0; });
    var share = total(nb.data) + total(rn.data);
    chartCard('rv-split', (share ? Math.round(100 * total(nb.data) / share) : 0) + '% new business', 'Share of each month’s value · new business vs renewals');
    draw('rv-split', { type: 'bar', labels: nb.labels, stacked: true, percent: true, legend: true,
      datasets: [bar('New business', pctNb, first), bar('Renewals', pctRn, second)] });

    groupChart('rv-industry', rows, 'industry', 'Contract value by industry', !s.industry);
    groupChart('rv-owner', rows, 'owner', 'Contract value by opportunity owner', !s.owner);

    /* Six month tables, newest first, as classic. */
    var host = page.querySelector('[data-review-months]');
    if (!host.children.length) {
      var html = '';
      for (var i = 0; i < 6; i++) html += '<div class="datatables datatables--orders" data-table="month-' + i + '"></div>';
      host.innerHTML = html;
    }
    for (var j = 0; j < 6; j++) {
      var ms = monthStart(TODAY.getFullYear(), TODAY.getMonth() - j), me = monthStart(ms.getFullYear(), ms.getMonth() + 1);
      var mrows = rows.filter(function (c) { return c.created >= ms && c.created < me; });
      table('month-' + j, CONTRACT_COLS, mrows, { title: MONTH[ms.getMonth()] + ' ' + ms.getFullYear(),
        totalLabel: money(sum(mrows, 'amount')), sort: 'term', dir: 'asc', resetPaging: true });
    }
  }

  /* Top 6 groups by value + "Other" (classic: TOP 20, unordered). Hidden when filtered to one. */
  function groupChart(id, rows, key, title, show) {
    var host = page.querySelector('[data-chart="' + id + '"]');
    host.hidden = !show;
    if (!show) return;
    var totals = {};
    rows.forEach(function (c) { totals[c[key]] = (totals[c[key]] || 0) + c.amount; });
    var ranked = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; });
    var top = ranked.slice(0, 6), rest = ranked.slice(6);
    var datasets = top.map(function (g, i) {
      return bar(g, byMonth(rows.filter(function (c) { return c[key] === g; }), 'amount').data, tok(SERIES[i]));
    });
    if (rest.length) datasets.push(bar('Other', byMonth(rows.filter(function (c) { return rest.indexOf(c[key]) !== -1; }), 'amount').data, tok(SERIES[6])));
    chartCard(id, ranked.length ? ranked[0] : '—', title + (ranked.length ? ' · top: ' + money(totals[ranked[0]]) : ''));
    draw(id, { type: 'bar', labels: byMonth([], null).labels, stacked: true, legend: true, money: true, datasets: datasets });
  }

  /* ── Render + boot ────────────────────────────────────────── */
  var RENDER = { Contract: overview, TopAccounts: topAccounts, Outstanding: outstanding, Review: review };
  function renderTab(key) {
    if (RENDER[key]) RENDER[key]();
    if (window.lucide) window.lucide.createIcons();
  }

  Object.keys(FILTERS).forEach(buildFilters);
  var q = new URLSearchParams(window.location.search).get('Navigation');
  showTab(RENDER[q] ? q : 'Contract');

  /* Charts read colours from tokens: redraw the visible tab when the theme flips. */
  new MutationObserver(function () {
    var visible = page.querySelector('[data-panel]:not([hidden])');
    if (visible) renderTab(visible.getAttribute('data-panel'));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
