/* Long Running Queries — page behaviour on top of the Listing template (TASK-470994).
 *
 * Loaded AFTER listing-data-long-queries.js and BEFORE ListingScreen.js, which renders on
 * DOMContentLoaded. So the synchronous part below runs first and decides what the template sees:
 *
 *   1. View: `?View=grouped` (classic's own parameter) picks the Grouped config; anything else is
 *      Individual. The SegmentedControl navigates and carries the filters across, as classic's
 *      tab links do.
 *   2. URL filters: classic's GET parameters (Website, ClientID, DataSource, Template, DateFilter,
 *      MinExecTime, Type) seed the chips, so the Grouped drill-down and shared links land
 *      filtered.
 *
 * After render:
 *   3. Top 5 slowest: Individual view only. Follows the Website / Client ID / DataSource chips
 *      (the three classic passes) and its own timeframe Select.
 *   4. Delete filtered / Delete all: header kebab → confirm → mock delete + toast.
 */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var grouped = params.get('View') === 'grouped';
  var root = document.querySelector('[data-listing]');
  if (!root || typeof LISTING_SCREENS === 'undefined') return;

  /* ── 1. View ─────────────────────────────────────────── */
  var screenKey = grouped ? 'long-queries-grouped' : 'long-queries';
  root.setAttribute('data-listing', screenKey);
  var config = LISTING_SCREENS[screenKey];

  var viewGroup = document.querySelector('[data-lq-view]');
  if (viewGroup) {
    viewGroup.querySelectorAll('[data-lq-view-value]').forEach(function (btn) {
      var on = (btn.getAttribute('data-lq-view-value') === 'grouped') === grouped;
      btn.classList.toggle('seg-control__btn--active', on);
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    viewGroup.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-lq-view-value]');
      if (!btn || btn.getAttribute('aria-checked') === 'true') return;
      location.search = carryParams(btn.getAttribute('data-lq-view-value') === 'grouped').toString();
    });
  }

  /* ── 2. URL filters → chip values ────────────────────── */
  var FILTER_PARAMS = {
    Website: 'Website',
    ClientID: 'Client ID',
    DataSource: 'DataSource',
    Template: 'Template'
  };
  function filterByName(name) {
    return config.defaultFilters.concat(config.moreFilters || []).filter(function (f) { return f.name === name; })[0];
  }
  function seed(name, value) {
    var f = filterByName(name);
    if (f && value) f.defaultValues = [value];
  }
  Object.keys(FILTER_PARAMS).forEach(function (p) { seed(FILTER_PARAMS[p], params.get(p)); });
  /* DateFilter is an index: 0 All, 1–4 the frames. Present-but-0 clears the Last 7 Days default. */
  if (params.has('DateFilter')) {
    var di = parseInt(params.get('DateFilter'), 10);
    var frame = filterByName('Date Frame');
    if (frame) frame.defaultValues = di >= 1 && di <= 4 ? [LQ_DATE_FRAMES[di - 1]] : [];
  }
  var minMs = parseInt(params.get('MinExecTime'), 10);
  LQ_MIN_EXEC.forEach(function (p) { if (p.ms === minMs) seed('Min Exec Time', p.label); });
  var ti = parseInt(params.get('Type'), 10);
  if (ti >= 1 && ti <= 3) seed('Type', Object.keys(LQ_TYPE_FILTER)[ti - 1]);

  /* The live filter state as classic's GET parameters. Read from the template's own state once
     it exists; before that, from the URL. */
  function liveValues() {
    var ls = window.listingScreen;
    return ls ? ls.config.filterValues : {};
  }
  function carryParams(toGrouped) {
    var v = liveValues();
    var out = new URLSearchParams();
    if (toGrouped) out.set('View', 'grouped');
    Object.keys(FILTER_PARAMS).forEach(function (p) {
      var val = (v[FILTER_PARAMS[p]] || [])[0];
      /* Classic's tab links keep everything except Template. */
      if (val && p !== 'Template') out.set(p, val);
    });
    var f = (v['Date Frame'] || [])[0];
    out.set('DateFilter', String(f ? LQ_DATE_FRAMES.indexOf(f) + 1 : 0));
    var m = (v['Min Exec Time'] || [])[0];
    if (m) out.set('MinExecTime', String(lqMinMs(m)));
    var t = (v['Type'] || [])[0];
    if (t) out.set('Type', String(Object.keys(LQ_TYPE_FILTER).indexOf(t) + 1));
    return out;
  }

  /* ── 3. Top 5 slowest queries ────────────────────────── */
  var top = document.querySelector('[data-lq-top]');
  var topFrame = '1';
  /* Classic's Timeframe: 1 Today, 2 This Week, 3 This Month, 0 All Time. Read as rolling windows
     (7 / 30 days) — GetTopQueries' SQL was not readable here, so calendar week / month is
     possible. TODO(backend:Listing) long-queries-top5. */
  function inTopFrame(created) {
    if (topFrame === '1') return lqInFrame(created, 'Today');
    if (topFrame === '2') return lqInFrame(created, 'Last 7 Days');
    if (topFrame === '3') return lqInFrame(created, 'Last 30 Days');
    return true;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderTop() {
    if (!top) return;
    var v = liveValues();
    var site = (v['Website'] || [])[0], client = (v['Client ID'] || [])[0], ds = (v['DataSource'] || [])[0];
    var groups = {};
    LISTING_LQ_ROWS.forEach(function (r) {
      if (site && r.website !== site) return;
      if (client && r.clientId !== client) return;
      if (ds && r.dataSource !== ds) return;
      if (!inTopFrame(r.created)) return;
      var g = groups[r.templateLine] || (groups[r.templateLine] = { t: r.templateLine, sum: 0, max: 0, n: 0, latest: 0 });
      g.sum += r.execMs; g.n += 1; g.max = Math.max(g.max, r.execMs); g.latest = Math.max(g.latest, r.created);
    });
    var rows = Object.keys(groups).map(function (k) {
      var g = groups[k]; g.avg = g.sum / g.n; return g;
    }).sort(function (a, b) { return b.avg - a.avg; }).slice(0, 5);

    var body = top.querySelector('[data-lq-top-body]');
    body.innerHTML = rows.length ? rows.map(function (g, i) {
      return '<tr><td class="cc-lq-top__rank">' + (i + 1) + '</td>' +
        '<td class="cc-lq-top__path"><span title="' + esc(g.t) + '"><bdi dir="ltr">' + esc(g.t) + '</bdi></span></td>' +
        '<td class="cc-lq-top__exec">' + esc(lqMs(g.avg)) + '</td>' +
        '<td class="cc-lq-top__extra">' + esc(lqMs(g.max)) + '</td>' +
        '<td class="cc-lq-top__extra">' + g.n.toLocaleString('en-GB') + '</td>' +
        '<td class="cc-lq-top__extra">' + esc(lqStamp(new Date(g.latest))) + '</td></tr>';
    }).join('')
      /* Classic's own empty text. */
      : '<tr><td class="cc-lq-top__empty" colspan="6">No entries found for this timeframe.</td></tr>';

    /* Classic's "(filtered by Website: …, Client: …, DS: …)", so a narrowed Top 5 says so. */
    var scope = [];
    if (site) scope.push('Website: ' + site);
    if (client) scope.push('Client: ' + client);
    if (ds) scope.push('DS: ' + ds);
    top.querySelector('[data-lq-top-scope]').textContent = scope.length ? 'Filtered by ' + scope.join(', ') : '';
  }

  if (top) {
    if (grouped) {
      top.hidden = true;
    } else {
      /* Select.js marks the picked option and fires no event of its own (UpdateScreen does the
         same), so read the option's code from the click. */
      top.addEventListener('click', function (e) {
        var opt = e.target.closest('[data-frame]');
        if (!opt) return;
        topFrame = opt.getAttribute('data-frame');
        renderTop();
      });
      document.addEventListener('listing:results', renderTop);
    }
  }

  /* ── 4. Delete filtered / Delete all ─────────────────── */
  var modal = document.getElementById('lq-confirm');
  var titleEl = document.getElementById('lq-confirm-title');
  var bodyEl = document.getElementById('lq-confirm-body');
  var goBtn = modal && modal.querySelector('[data-lq-go]');
  var pending = null;
  var returnFocus = null;

  function entryCount(list) {
    var n = 0;
    list.forEach(function (r) { n += r.members ? r.members.length : 1; });
    return n;
  }

  function openConfirm(kind, trigger) {
    var ls = window.listingScreen;
    if (!ls || !modal) return;
    var count = kind === 'all' ? LISTING_LQ_ROWS.length : entryCount(ls.matched());
    var noun = count === 1 ? 'entry' : 'entries';
    pending = kind;
    returnFocus = document.querySelector('.cc-header__kebab') || trigger;
    titleEl.textContent = kind === 'all' ? 'Delete all entries?' : 'Delete filtered entries?';
    bodyEl.textContent = (kind === 'all'
      ? 'This deletes every long query entry, from every site — ' + count.toLocaleString('en-GB') + ' ' + noun + '.'
      : 'This deletes the ' + count.toLocaleString('en-GB') + ' ' + noun + ' that match the current filters.') +
      ' It can’t be undone.';
    goBtn.textContent = kind === 'all' ? 'Delete all' : 'Delete ' + count.toLocaleString('en-GB');
    goBtn.disabled = count === 0;
    modal.classList.add('modal-overlay--open');
    goBtn.focus();
  }

  function closeConfirm() {
    modal.classList.remove('modal-overlay--open');
    if (returnFocus) returnFocus.focus();
    pending = null;
  }

  /* Mock: removes the rows from the in-memory data and re-renders. Classic redirects back to the
     screen after its DELETE; the toast is new. */
  function doDelete(kind) {
    var ls = window.listingScreen;
    var gone;
    if (kind === 'all') {
      gone = LISTING_LQ_ROWS.length;
      LISTING_LQ_ROWS.length = 0;
    } else {
      var drop = {};
      ls.matched().forEach(function (r) {
        (r.members || [r]).forEach(function (m) { drop[m.code] = true; });
      });
      gone = Object.keys(drop).length;
      for (var i = LISTING_LQ_ROWS.length - 1; i >= 0; i--) {
        if (drop[LISTING_LQ_ROWS[i].code]) LISTING_LQ_ROWS.splice(i, 1);
      }
    }
    ls.config.rows = grouped
      ? ls.config.rows.filter(function (g) {
          g.members = g.members.filter(function (m) { return LISTING_LQ_ROWS.indexOf(m) !== -1; });
          return g.members.length > 0;
        })
      : LISTING_LQ_ROWS.slice();
    ls.render();
    toast(gone.toLocaleString('en-GB') + ' long query ' + (gone === 1 ? 'entry' : 'entries') + ' deleted');
  }

  /* The page's own Toast stack (#cc-toasts), same markup as the rail's status toasts. */
  function toast(message) {
    var stack = document.getElementById('cc-toasts');
    if (!stack) return;
    var t = document.createElement('div');
    t.className = 'toast toast--danger toast--color';
    t.setAttribute('role', 'status');
    t.innerHTML = '<span class="toast__icon"><i data-lucide="trash-2" aria-hidden="true"></i></span>' +
      '<p class="toast__message"></p>' +
      '<button type="button" class="toast__close" aria-label="Dismiss"><i data-lucide="x" aria-hidden="true"></i></button>';
    t.querySelector('.toast__message').textContent = message;
    stack.appendChild(t);
    if (window.lucide) window.lucide.createIcons();
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('toast--in'); }); });
    function dismiss() {
      t.classList.remove('toast--in');
      t.classList.add('toast--leaving');
      t.addEventListener('transitionend', function () { t.remove(); }, { once: true });
    }
    t.querySelector('.toast__close').addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  }

  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-lq-delete]');
    if (item) openConfirm(item.getAttribute('data-lq-delete'), item);
  });
  if (modal) {
    modal.querySelectorAll('[data-lq-cancel]').forEach(function (b) { b.addEventListener('click', closeConfirm); });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeConfirm(); });
    goBtn.addEventListener('click', function () {
      var kind = pending;
      closeConfirm();
      if (kind) doDelete(kind);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('modal-overlay--open')) closeConfirm();
    });
  }
})();
