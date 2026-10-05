/* LiveDashboard — behaviour for /control/live-dashboard (TASK-471013).
 *
 *   1. Full width: the cards go flush, following `cc:width` (as UpdateScreen).
 *   2. KPIs (StatCard Xl): Online now (Members / Guests), Page views today (vs average to this hour,
 *      this hour), Busiest channel in the sampled window (views, share).
 *   3. Page views chart (Chart pattern + Chart.js): today (blue, filled) against the average day
 *      (orange, dashed), a "Now" marker, a hover crosshair + tooltip, direct labels at each line's
 *      end, a legend, and a table view. Blue / orange is the only accent pair that passes the
 *      palette validator in both themes (see the notes).
 *   4. Lists with classic's paging (index.cfm strSettings): online 10 +10, authors 4 +8, channels
 *      5 +10, topics 5 +10, articles 5 +10. Leaderboards show each item's share of the top as a bar.
 *   5. Live: refreshes every 30s (classic's setTimeout 3E4); "Updated n s ago" ticks; Pause stops it.
 *
 * TODO(backend:LiveDashboard) live-refresh: the refresh is mock drift. Live: poll classic's
 *   AfoSiteAnalysis/cfc/Dashboard.cfc data call every 30s (what dashboard.js does) and re-render.
 */
(function () {
  'use strict';

  var page = document.querySelector('.cc-live');
  if (!page || typeof LD === 'undefined') return;

  var NUM = new Intl.NumberFormat('en-GB');
  var DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var REFRESH_MS = 30000;
  var shown = {};
  Object.keys(LD.paging).forEach(function (k) { shown[k] = LD.paging[k][0]; });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function $(sel) { return page.querySelector(sel); }

  /* ── 1. Full width ────────────────────────────────────────────── */
  var shell = document.querySelector('.cc-control');
  function mirror(mode) { page.classList.toggle('cc-live--full', mode === 'full'); }
  document.addEventListener('cc:width', function (e) { mirror(e.detail.mode); if (chart) chart.resize(); });
  mirror(shell ? shell.getAttribute('data-cc-width') : 'standard');

  /* ── helpers ──────────────────────────────────────────────────── */
  function nowHour() { return new Date().getHours(); }
  function sumTo(arr, h) { var s = 0; for (var i = 0; i <= h; i++) s += arr[i]; return s; }
  function set(key, text) {
    page.querySelectorAll('[data-kpi="' + key + '"]').forEach(function (el) {
      if (el.textContent !== text) {
        el.textContent = text;
        if (!REDUCED && el.dataset.ready) {
          el.classList.remove('cc-live__changed'); void el.offsetWidth; el.classList.add('cc-live__changed');
        }
        el.dataset.ready = '1';
      }
    });
  }
  function delta() {
    var h = nowHour();
    var t = sumTo(LD.pageViews.today, h), a = sumTo(LD.pageViews.average, h);
    return a ? Math.round((t - a) / a * 100) : 0;
  }
  function deltaBadge(pct) {
    var up = pct >= 0;
    return { cls: 'badge badge--' + (up ? 'success' : 'danger'),
             html: '<i data-lucide="' + (up ? 'trending-up' : 'trending-down') + '" aria-hidden="true"></i>' +
                   (up ? '+' : '−') + Math.abs(pct) + '% vs average' };
  }

  /* ── 2. KPIs ──────────────────────────────────────────────────── */
  function renderKpis() {
    var h = nowHour();
    set('online', NUM.format(LD.members + LD.guests));
    set('members', NUM.format(LD.members));
    set('guests', NUM.format(LD.guests));
    set('views', NUM.format(sumTo(LD.pageViews.today, h)));
    var d = delta();
    set('delta', (d >= 0 ? '+' : '−') + Math.abs(d) + '%');
    set('hour', NUM.format(LD.pageViews.today[h]));
    var ch = LD.channels.slice().sort(function (a, b) { return b.views - a.views; });
    var total = ch.reduce(function (s, c) { return s + c.views; }, 0);
    set('channel', ch[0].name);
    set('channelViews', NUM.format(ch[0].views));
    set('channelShare', Math.round(ch[0].views / total * 100) + '%');
    page.querySelector('[data-kpi="delta"]').classList.toggle('cc-live__up', d >= 0);
    page.querySelector('[data-kpi="delta"]').classList.toggle('cc-live__down', d < 0);
  }

  /* ── 3. Chart ─────────────────────────────────────────────────── */
  var chart = null;
  var HOURS = []; for (var i = 0; i < 24; i++) HOURS.push((i < 10 ? '0' : '') + i + ':00');

  /* Plugins: the "Now" marker, the hover crosshair, and a direct label at each line's last point. */
  var markers = {
    id: 'ccLiveMarkers',
    afterDatasetsDraw: function (c) {
      var ctx = c.ctx, area = c.chartArea, x = c.scales.x, h = nowHour();
      var line = tok('--ai-border-primary') || tok('--ai-text-contrast');
      ctx.save();
      /* Now */
      var nx = x.getPixelForValue(h);
      ctx.strokeStyle = tok('--ai-text-contrast'); ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(nx, area.top); ctx.lineTo(nx, area.bottom); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = tok('--ai-text-secondary'); ctx.font = '600 11px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Now', nx, area.top - 6);
      /* Crosshair */
      var act = c.tooltip && c.tooltip.getActiveElements && c.tooltip.getActiveElements();
      if (act && act.length) {
        var ax = act[0].element.x;
        ctx.strokeStyle = line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax, area.top); ctx.lineTo(ax, area.bottom); ctx.stroke();
      }
      /* Direct labels: text in text ink, beside the mark that carries the colour. */
      c.data.datasets.forEach(function (ds, di) {
        var meta = c.getDatasetMeta(di); if (meta.hidden) return;
        var last = -1; ds.data.forEach(function (v, j) { if (v !== null) last = j; });
        if (last < 0) return;
        var pt = meta.data[last];
        ctx.fillStyle = tok('--ai-text-secondary'); ctx.font = '600 11px Inter, sans-serif';
        var label = ds.label, w = ctx.measureText(label).width;
        var lx = Math.min(pt.x + 8, area.right - w), ly = pt.y + (di === 0 ? -8 : 14);
        ctx.textAlign = 'left'; ctx.fillText(label, lx, ly);
      });
      ctx.restore();
    }
  };

  function chartData() {
    var h = nowHour();
    return LD.pageViews.today.map(function (v, i) { return i <= h ? v : null; });
  }

  function drawChart() {
    if (!window.Chart) return;
    var canvas = $('[data-canvas]');
    var blue = tok('--ai-accent-blue-solid'), orange = tok('--ai-accent-orange-solid');
    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = tok('--ai-text-contrast');
    var fill = function (ctx) {
      var c = ctx.chart, area = c.chartArea;
      if (!area) return blue;
      var g = c.ctx.createLinearGradient(0, area.top, 0, area.bottom);
      g.addColorStop(0, blue + '40'); g.addColorStop(1, blue + '00');
      return g;
    };
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: HOURS,
        datasets: [
          { label: 'Today', data: chartData(), borderColor: blue, backgroundColor: fill, fill: true, tension: 0.35,
            borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2,
            pointHoverBorderColor: tok('--ai-surface-primary'), pointHoverBackgroundColor: blue, spanGaps: false },
          { label: 'Average', data: LD.pageViews.average.slice(), borderColor: orange, backgroundColor: orange, fill: false,
            borderDash: [5, 4], tension: 0.35, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2,
            pointHoverBorderColor: tok('--ai-surface-primary'), pointHoverBackgroundColor: orange }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: REDUCED ? false : { duration: 400 },
        layout: { padding: { top: 16, right: 56 } },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tok('--ai-surface-invert'), titleColor: tok('--ai-text-invert'), bodyColor: tok('--ai-text-invert'),
            padding: 10, cornerRadius: 6, boxPadding: 4, usePointStyle: true,
            callbacks: {
              title: function (items) { return items[0].label; },
              label: function (c) { return ' ' + c.dataset.label + ': ' + (c.parsed.y === null ? '—' : NUM.format(c.parsed.y)); }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false },
               /* Every 3 hours; every 6 on a narrow chart so labels never collide. */
               ticks: { maxRotation: 0, autoSkip: false, callback: function (v, i) {
                 var step = this.chart.width < 520 ? 6 : 3;
                 return i % step === 0 ? HOURS[i] : '';
               } } },
          y: { beginAtZero: true, grid: { color: tok('--ai-border-secondary') }, border: { display: false },
               ticks: { precision: 0, maxTicksLimit: 5, callback: function (v) { return v >= 1000 ? (v / 1000) + 'k' : v; } } }
        }
      },
      plugins: [markers]
    });
    renderChartMeta();
  }

  function renderChartMeta() {
    var b = deltaBadge(delta()), el = $('[data-chart-delta]');
    el.className = b.cls; el.innerHTML = b.html;
    var h = nowHour();
    $('[data-hours]').innerHTML = HOURS.map(function (lab, i) {
      var t = i <= h ? NUM.format(LD.pageViews.today[i]) : '—';
      return '<tr><td>' + lab + '</td><td class="cc-live__num">' + t + '</td><td class="cc-live__num">' + NUM.format(LD.pageViews.average[i]) + '</td></tr>';
    }).join('');
  }

  /* ── 4. Lists ─────────────────────────────────────────────────── */
  var LINKS = {
    online: function (r) { return '/control/contacts?Action=View&UserCode=' + r.code; },
    creator: function (r) { return '/control/contacts?Action=View&UserCode=' + r.code; },
    channel: function (r) { return '/control/channel?ChannelCode=' + r.code; },
    taxonomy: function (r) { return '/control/taxonomy-manager-screen?TaxonomyCategoryCode=' + r.code; },
    article: function (r) { return '/control/standard-item-edit?Action=view&StandardItemCode=' + r.code; }
  };
  var SOURCE = { online: function () { return LD.online; }, creator: function () { return LD.authors; },
    channel: function () { return LD.channels; }, taxonomy: function () { return LD.topics; }, article: function () { return LD.articles; } };

  function avatar(src, size) {
    return '<span class="avatar avatar--size-' + size + '"><img class="portrait" src="' + esc(src) + '" alt="" loading="lazy"></span>';
  }
  function link(key, r, inner) {
    return '<a class="cc-live__link" href="' + esc(LINKS[key](r)) + '" target="_blank" rel="noopener">' + inner + '</a>';
  }

  function renderList(key) {
    var rows = SOURCE[key]();
    if (key !== 'online') rows = rows.slice().sort(function (a, b) { return b.views - a.views; });
    var vis = rows.slice(0, shown[key]);
    var host = page.querySelector('[data-list="' + key + '"]');
    page.querySelector('[data-empty="' + key + '"]').hidden = rows.length > 0;
    var more = page.querySelector('[data-more="' + key + '"]');
    more.parentElement.hidden = rows.length <= shown[key];

    if (key === 'online') {
      host.innerHTML = vis.map(function (r) {
        return '<li class="cc-live__person">' + link(key, r, avatar(r.avatar, 2) +
          '<span class="cc-live__who"><span class="cc-live__name">' + esc(r.name) + '</span>' +
          (r.company ? '<span class="cc-live__sub">' + esc(r.company) + '</span>' : '') + '</span>') + '</li>';
      }).join('');
      var c = page.querySelector('[data-count="online"]');
      c.textContent = NUM.format(LD.members);
      c.setAttribute('aria-label', LD.members + ' members online');
      return;
    }
    if (key === 'article') {
      host.innerHTML = vis.map(function (r) {
        return '<tr><td class="cc-live__title-cell">' + link(key, r, esc(r.title)) + '</td>' +
          '<td><span class="cc-live__author">' + avatar(r.avatar, 1) + '<span>' + esc(r.author) + '</span></span></td>' +
          '<td class="cc-live__nowrap">' + DATE.format(new Date(r.published)) + '</td>' +
          '<td class="cc-live__num">' + NUM.format(r.views) + '</td></tr>';
      }).join('');
      return;
    }
    var top = rows.length ? rows[0].views : 1;
    host.innerHTML = vis.map(function (r, i) {
      var pct = Math.max(2, Math.round(r.views / top * 100));
      return '<li class="cc-live__row">' +
        '<span class="cc-live__pos" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="cc-live__row-main">' +
          '<span class="cc-live__row-line">' +
            link(key, r, (r.avatar ? avatar(r.avatar, 1) : '') + '<span class="cc-live__row-name">' + esc(r.name) + '</span>') +
            '<span class="cc-live__views">' + NUM.format(r.views) + '<span class="cc-live__visually-hidden"> views</span></span>' +
          '</span>' +
          '<span class="cc-live__bar" aria-hidden="true"><span class="cc-live__bar-fill" style="--cc-live-share:' + pct + '%"></span></span>' +
        '</span></li>';
    }).join('');
  }

  function renderAll() {
    renderKpis();
    ['online', 'creator', 'channel', 'taxonomy', 'article'].forEach(renderList);
    $('[data-timeframe]').textContent = LD.timeframe + (LD.timeframe === 1 ? ' hour' : ' hours');
    if (window.lucide) window.lucide.createIcons();
  }

  page.addEventListener('click', function (e) {
    var more = e.target.closest('[data-more]');
    if (!more) return;
    var key = more.getAttribute('data-more');
    shown[key] += LD.paging[key][1];
    renderList(key);
    if (window.lucide) window.lucide.createIcons();
  });

  /* ── 5. Live ──────────────────────────────────────────────────── */
  var lastUpdate = Date.now(), timer = null, paused = false;
  var updatedEl = $('[data-live-updated]') || document.querySelector('[data-live-updated]');
  var badge = document.querySelector('[data-live-badge]');
  var stateEl = document.querySelector('[data-live-state]');
  var pauseBtn = document.querySelector('[data-live-pause]');
  var announce = document.querySelector('[data-live-announce]');

  function jitter(n, spread) { return Math.max(0, Math.round(n + (Math.random() - 0.5) * 2 * spread)); }

  /* Mock drift: what a 30s poll would bring back on a moderately busy site. */
  function refresh() {
    LD.members = jitter(LD.members, 3);
    LD.guests = jitter(LD.guests, 9);
    var h = nowHour();
    LD.pageViews.today[h] += Math.round(LD.pageViews.average[h] / 120 * (0.8 + Math.random() * 0.6));
    [LD.authors, LD.channels, LD.topics, LD.articles].forEach(function (set) {
      set.forEach(function (r) { r.views += Math.random() < 0.6 ? Math.round(Math.random() * 6) : 0; });
    });
    renderAll();
    if (chart) { chart.data.datasets[0].data = chartData(); chart.update(REDUCED ? 'none' : undefined); renderChartMeta(); }
    lastUpdate = Date.now();
    tick();
  }

  function tick() {
    if (!updatedEl) return;
    var s = Math.round((Date.now() - lastUpdate) / 1000);
    updatedEl.textContent = paused ? 'Paused · updated ' + (s < 5 ? 'just now' : s < 60 ? s + 's ago' : Math.floor(s / 60) + 'm ago')
      : (s < 5 ? 'Updated just now' : s < 60 ? 'Updated ' + s + 's ago' : 'Updated ' + Math.floor(s / 60) + 'm ago');
  }

  function start() { timer = setInterval(refresh, REFRESH_MS); }
  function stop() { clearInterval(timer); timer = null; }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      paused = !paused;
      if (paused) stop(); else { refresh(); start(); }
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pauseBtn.innerHTML = '<i data-lucide="' + (paused ? 'play' : 'pause') + '" aria-hidden="true"></i><span class="cc-header__btn-label">' + (paused ? 'Resume' : 'Pause') + '</span>';
      badge.className = 'badge cc-live__live ' + (paused ? 'badge--neutral cc-live__live--paused' : 'badge--success');
      stateEl.textContent = paused ? 'Paused' : 'Live';
      announce.textContent = paused ? 'Live updates paused' : 'Live updates resumed';
      tick();
      if (window.lucide) window.lucide.createIcons();
    });
  }

  renderAll();
  drawChart();
  start();
  setInterval(tick, 1000);
  /* Demo only: ?refresh=now runs one refresh at once, so the live behaviour can be checked. */
  if (/[?&]refresh=now/.test(location.search)) refresh();
})();
