/* Long Running Queries — the fifth screen on the Listing template, for TASK-470994 (no-design).
 *
 * ── PROVENANCE ────────────────────────────────────────────────
 * /control/long-running-queries is ControlProfileCode 2172, menu Custom. Template
 * /AcuSystem/CC/LongQueryLog.cfm on affino.com (the screen exists only there: every Affino
 * instance writes to ONE shared table, CF_LongQuery, in the ComrzExtensions2 Postgres database).
 * Read directly on 2026-10-05:
 *
 *   /AcuSystem/CC/LongQueryLog.cfm   → the filter form, the view tabs, Top 5, the delete actions
 *   /AcuSystem/CC/LongQueryLog.js    → both jqGrid column sets, the badge values, the Top 5 call
 *   /AcuSystem/cfc/LongQueryLog.cfc  → the SELECTs, both sort whitelists, the value formats
 *
 * WHAT IS REAL: both column sets and their order, all eight filters with their option lists and
 * defaults (Date Frame opens on Last 7 Days), the page sizes and default (50), both sort
 * whitelists and defaults (Individual Date ↓, Grouped Avg Exec Time ↓), the formats ("1,234ms",
 * "yyyy-mm-dd HH:nn:ss", Template:Line with no ":0"), the Type labels (Slow / Large / Both) and
 * the Guest rule (AppUser empty or ending "(2)").
 *
 * WHAT IS NOT REAL: every ROW. CF_LongQuery lives in ComrzExtensions2, which no read available
 * here reaches, so the rows below are generated: real Affino template paths and real client
 * names, invented timings and users. Dates are generated RELATIVE TO TODAY so the Date Frame
 * presets always have something to find.
 *   TODO(backend:Listing) long-queries-rows: mock rows → GetQueryData / GetGroupedData.
 */

/* ── Rows ─────────────────────────────────────────────────── */

var LQ_SITES = [
  { website: 'www.affino.com',            clientId: 'Comrz',     dataSource: 'AffinoComrz' },
  { website: 'www.thestage.co.uk',        clientId: 'Stage',     dataSource: 'AffinoStage' },
  { website: 'charitydigital.org.uk',     clientId: 'Charity',   dataSource: 'AffinoCharity' },
  { website: 'www.thebookseller.com',     clientId: 'Bookseller', dataSource: 'AffinoBookseller' },
  { website: 'www.crm-agri.com',          clientId: 'CRMAgri',   dataSource: 'AffinoCRMAgri' },
  { website: 'www.greenstarmedia.co.uk',  clientId: 'GreenStar', dataSource: 'AffinoGreenStar' }
];

/* Real template paths from the affino.com tree; the line numbers are invented. Weighted so a few
   templates dominate, which is what a slow-query log looks like and what Grouped exists for. */
var LQ_TEMPLATES = [
  { t: '/AfcCommunityMgr/CC/MonthlyReview.cfm',      l: 412, w: 9, base: 2400 },
  { t: '/AfcMediaLibrary/CC/MediaInbox.cfm',         l: 188, w: 7, base: 1300 },
  { t: '/AfcCommunityMgr/CC/ContractTopAccounts.cfm', l: 96, w: 6, base: 1800 },
  { t: '/AfoSiteAnalysis/cfc/SiteUsage.cfc',         l: 1207, w: 5, base: 900 },
  { t: '/AfcControl/CC/Update.cfm',                  l: 233, w: 3, base: 4200 },
  { t: '/AfcStore/cfc/Orders.cfc',                   l: 640, w: 5, base: 700 },
  { t: '/AfcNewsletter/cfc/SendQueue.cfc',           l: 77, w: 4, base: 3100 },
  { t: '/AfcCommunityMgr/CC/ContractOverview.cfm',   l: 151, w: 3, base: 1100 },
  { t: '/AfcSearch/cfc/SiteSearch.cfc',              l: 0, w: 4, base: 600 },
  { t: '/AcuSystem/CC/LongQueryLog.cfm',             l: 0, w: 1, base: 300 }
];

/* Invented people; "(2)" is the guest user, which is how the classic SQL tells Guest from Logged In. */
var LQ_USERS = ['Guest (2)', 'Guest (2)', 'Guest (2)', '', 'Laura Fanni (10482)', 'James Bolesworth (22817)',
                'Kevin Barrow (31140)', 'Maria Mellor (9044)', 'Quang Luong (17723)', 'Mark Foster (4410)'];

var LQ_TYPES = { 1: 'Slow', 2: 'Large', 3: 'Both' };

function lqPad(n) { return (n < 10 ? '0' : '') + n; }
function lqStamp(d) {
  return d.getFullYear() + '-' + lqPad(d.getMonth() + 1) + '-' + lqPad(d.getDate()) + ' ' +
    lqPad(d.getHours()) + ':' + lqPad(d.getMinutes()) + ':' + lqPad(d.getSeconds());
}
/* numberFormat(n) & 'ms' — ColdFusion's numberFormat groups thousands with a comma. */
function lqMs(n) { return Math.round(n).toLocaleString('en-GB') + 'ms'; }
function lqIsGuest(user) { return !user || /\(2\)$/.test(user); }

var LISTING_LQ_ROWS = (function () {
  var seed = 470994;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function pick(list) { return list[Math.floor(rnd() * list.length)]; }
  var weighted = [];
  LQ_TEMPLATES.forEach(function (t) { for (var i = 0; i < t.w; i++) weighted.push(t); });

  var now = Date.now();
  var rows = [];
  for (var i = 0; i < 260; i++) {
    var tpl = pick(weighted);
    /* Skewed towards recent: a log is busiest today, and older rows have mostly been deleted. */
    var ageDays = Math.pow(rnd(), 2.2) * 45;
    var created = new Date(now - ageDays * 86400000);
    var type = rnd() < 0.62 ? 1 : (rnd() < 0.6 ? 2 : 3);
    /* A "Large" row is about rows returned, not time — it can be quick. */
    var ms = type === 2 ? 30 + rnd() * 400 : tpl.base * (0.4 + rnd() * 1.8);
    var site = pick(LQ_SITES);
    var user = pick(LQ_USERS);
    rows.push({
      code: String(918204 - i),
      created: created.getTime(),
      date: lqStamp(created),
      website: site.website,
      clientId: site.clientId,
      dataSource: site.dataSource,
      appUser: user,
      userType: lqIsGuest(user) ? 'Guest' : 'Logged In',
      type: LQ_TYPES[type],
      execMs: Math.round(ms),
      execTime: lqMs(ms),
      template: tpl.t,
      line: tpl.l,
      templateLine: tpl.t + (tpl.l > 0 ? ':' + tpl.l : '')
    });
  }
  return rows.sort(function (a, b) { return b.created - a.created; });
})();

/* Grouped = GetGroupedData: GROUP BY Template, Line, Website, ClientID and Guest/Logged In.
   Built from the same rows so the two views agree. Each group keeps its members, which is what
   the Date Frame / Min Exec Time / Type filters test (see lqMatchAny). */
var LISTING_LQ_GROUPS = (function (rows) {
  var by = {};
  rows.forEach(function (r) {
    var k = [r.templateLine, r.userType, r.website, r.clientId].join('|');
    (by[k] = by[k] || { members: [] }).members.push(r);
  });
  return Object.keys(by).map(function (k) {
    var m = by[k].members;
    var sum = 0, max = 0, latest = 0;
    m.forEach(function (r) { sum += r.execMs; max = Math.max(max, r.execMs); latest = Math.max(latest, r.created); });
    var avg = Math.round(sum / m.length);
    return {
      groupKey: k,
      templateLine: m[0].templateLine,
      userType: m[0].userType,
      website: m[0].website,
      clientId: m[0].clientId,
      dataSource: m[0].dataSource,
      avgMs: avg, avgExecTime: lqMs(avg),
      maxMs: max, maxExecTime: lqMs(max),
      issueCount: String(m.length),
      latestAt: latest,
      latestDate: lqStamp(new Date(latest)),
      members: m
    };
  }).sort(function (a, b) { return b.avgMs - a.avgMs; });
})(LISTING_LQ_ROWS);


/* ── Filters ─────────────────────────────────────────────────
 * Eight controls in classic's two-row form: Website, Client ID, Template, DataSource / Date
 * Frame, Min Exec Time, Type, Limit. Limit is the toolbar's page size, so it is not a filter.
 * The five chips are the first five in form order (the house rule): Website, Client ID,
 * Template, DataSource, Date Frame. Min Exec Time and Type are in More Filters. */

function lqOpts(names) { return names.map(function (n) { return { name: n }; }); }
function lqUnique(field) {
  var seen = {};
  LISTING_LQ_ROWS.forEach(function (r) { seen[r[field]] = true; });
  return Object.keys(seen).sort();
}

/* DateFilter 1–4. Overlapping by design: Today is also inside Last 7 Days. */
var LQ_DATE_FRAMES = ['Today', 'Last 7 Days', 'Last 30 Days', 'Older than 30 days'];
function lqInFrame(created, frame) {
  var now = new Date();
  var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var day = 86400000;
  if (frame === 'Today') return created >= startOfToday;
  if (frame === 'Last 7 Days') return created >= now.getTime() - 7 * day;
  if (frame === 'Last 30 Days') return created >= now.getTime() - 30 * day;
  if (frame === 'Older than 30 days') return created < now.getTime() - 30 * day;
  return true;
}

/* MinExecTime presets, "ExecutionTime >= n". */
var LQ_MIN_EXEC = [{ label: '30ms', ms: 30 }, { label: '100ms', ms: 100 }, { label: '500ms', ms: 500 },
                   { label: '1s', ms: 1000 }, { label: '5s', ms: 5000 }];
function lqMinMs(label) {
  var hit = LQ_MIN_EXEC.filter(function (p) { return p.label === label; })[0];
  return hit ? hit.ms : 0;
}

/* Type 1–3, labelled as the classic select labels them; the grid shows the short form. */
var LQ_TYPE_FILTER = { 'Slow Query': 'Slow', 'Large Dataset': 'Large', 'Both': 'Both' };

/* One row test per filter, applied to a log row. A group passes when ANY member does.
   TODO(backend:Listing) long-queries-grouped-filters: classic filters BEFORE it groups, so a
   group's Count / Avg / Max cover only the matching rows. Here a group passes or fails whole;
   the backend's GetGroupedData already does it properly. */
function lqMatchAny(test) {
  return function (row, values) {
    var list = row.members || [row];
    return list.some(function (r) { return test(r, values); });
  };
}
var LQ_TEST = {
  frame: lqMatchAny(function (r, v) { return v.some(function (f) { return lqInFrame(r.created, f); }); }),
  minExec: lqMatchAny(function (r, v) { return r.execMs >= lqMinMs(v[0]); }),
  type: lqMatchAny(function (r, v) { return v.some(function (t) { return r.type === LQ_TYPE_FILTER[t]; }); })
};

var LISTING_LQ_FILTERS = [
  { name: 'Website', type: 'select-options', field: 'website',
    label: 'Filter by Website', placeholder: 'All', options: lqOpts(lqUnique('website')) },
  { name: 'Client ID', type: 'select-options', field: 'clientId',
    label: 'Filter by Client ID', placeholder: 'All', options: lqOpts(lqUnique('clientId')) },
  /* Classic's placeholder, verbatim. The backend accepts "path:line"; matching the joined
     Template:Line string does the same here. */
  { name: 'Template', type: 'text', field: 'templateLine',
    label: 'Filter by Template', placeholder: 'Filter by template path (or path:line)...' },
  { name: 'DataSource', type: 'select-options', field: 'dataSource',
    label: 'Filter by DataSource', placeholder: 'All', options: lqOpts(lqUnique('dataSource')) },
  /* `<cfparam name="url.DateFilter" default=2>`, so the screen opens on Last 7 Days. */
  { name: 'Date Frame', type: 'select-options', field: 'created',
    label: 'Filter by Date Frame', placeholder: 'All', options: lqOpts(LQ_DATE_FRAMES),
    defaultValues: ['Last 7 Days'], match: LQ_TEST.frame }
];

var LISTING_LQ_MORE_FILTERS = [
  { name: 'Min Exec Time', type: 'select-options', field: 'execMs',
    label: 'Filter by Min Exec Time', placeholder: 'All',
    options: LQ_MIN_EXEC.map(function (p) { return { name: p.label }; }), match: LQ_TEST.minExec },
  { name: 'Type', type: 'select-options', field: 'type',
    label: 'Filter by Type', placeholder: 'All', options: lqOpts(Object.keys(LQ_TYPE_FILTER)),
    match: LQ_TEST.type }
];


/* ── Columns ─────────────────────────────────────────────────
 * Classic tones (`.type-slow` amber, `.type-large` blue, `.type-both` red; Guest green, Logged In
 * blue) mapped to the DS Badge tones. No number alignment: listing demos stay left-aligned. */
var LQ_TYPE_TONES = { Slow: 'warning', Large: 'info', Both: 'danger' };
var LQ_USER_TONES = { 'Guest': 'success', 'Logged In': 'info' };

/* Individual — GetQueryData. Classic's first column is a details icon linking to
   LongQueryLogDetail.cfm; here Date is the record link and the whole row clicks through.
   ORDER CHANGED from classic (Date, Website, Client ID, User, Type, Exec Time, Template:Line):
   column order is the fit's priority order, so classic's order dropped Template:Line — the one
   value that says WHICH query — into the kebab first, even at 1440. What and how slow come
   first; where and who after. Template:Line is the fluid column (the Articles title's class), and
   it truncates from the START so the file and line survive (`path` cell + `.cc-lq__path`). */
var LISTING_LQ_COLUMNS = [
  { key: 'date',         type: 'text',  label: 'Date',          hug: true, link: true, sort: 'Date', sortKey: 'created' },
  { key: 'templateLine', type: 'path',  label: 'Template:Line', truncate: true, cellClass: 'datatables__article-title cc-lq__path', sort: 'Template' },
  { key: 'execTime',     type: 'text',  label: 'Exec Time',     hug: true, sort: 'ExecTime', sortKey: 'execMs' },
  { key: 'type',         type: 'badge', label: 'Type',          hug: true, sort: 'Type', badges: LQ_TYPE_TONES },
  { key: 'website',      type: 'text',  label: 'Website',       snug: true, sort: 'Website' },
  { key: 'clientId',     type: 'text',  label: 'Client ID',     hug: true, sort: 'ClientID' },
  { key: 'appUser',      type: 'text',  label: 'User',          snug: true, sort: 'AppUser' },
  { key: 'kebab',        type: 'kebab', label: '',              hug: true }
];

/* Grouped — GetGroupedData. Template:Line drills into the Individual view for that line.
   ORDER CHANGED from classic (Template:Line, User Type, Website, Client ID, Avg, Max, Count,
   Latest) for the same reason as Individual: at 820 classic's order kept User Type and dropped
   Avg Exec Time, the column the view is sorted by. */
var LISTING_LQ_GROUP_COLUMNS = [
  { key: 'templateLine', type: 'path',  label: 'Template:Line', truncate: true, link: true, cellClass: 'datatables__article-title cc-lq__path', sort: 'Template' },
  { key: 'avgExecTime',  type: 'text',  label: 'Avg Exec Time', hug: true, sort: 'AvgExecTime', sortKey: 'avgMs' },
  { key: 'maxExecTime',  type: 'text',  label: 'Max Exec Time', hug: true, sort: 'MaxExecTime', sortKey: 'maxMs' },
  { key: 'issueCount',   type: 'text',  label: 'Count',         hug: true, sort: 'IssueCount' },
  { key: 'userType',     type: 'badge', label: 'User Type',     hug: true, sort: 'UserType', badges: LQ_USER_TONES },
  { key: 'website',      type: 'text',  label: 'Website',       snug: true, sort: 'Website' },
  { key: 'clientId',     type: 'text',  label: 'Client ID',     hug: true, sort: 'ClientID' },
  { key: 'latestDate',   type: 'text',  label: 'Latest',        hug: true, sort: 'LatestDate', sortKey: 'latestAt' },
  { key: 'kebab',        type: 'kebab', label: '',              hug: true }
];


/* ── Screens ─────────────────────────────────────────────── */

var LQ_SHARED = {
  title: 'Long Running Queries',
  /* No bulk actions and no row selection: classic has neither — its two deletes act on the
     filter, not on picked rows, and they live in the header kebab here. */
  /* LimitBy: 20,50,100,200,500, default 50. */
  perPage: 50,
  perPageOptions: [20, 50, 100, 200, 500],
  identityColumns: 1
};

LISTING_SCREENS['long-queries'] = Object.assign({}, LQ_SHARED, {
  view: 'Individual Queries',
  /* Date AND Template:Line always show: on a phone, a list of timestamps alone says nothing about
     which query was slow. Measured at 390 before shipping (no overflow). */
  identityColumns: 2,
  columns: LISTING_LQ_COLUMNS,
  defaultFilters: LISTING_LQ_FILTERS,
  moreFilters: LISTING_LQ_MORE_FILTERS,
  rows: LISTING_LQ_ROWS,
  rowKey: 'code',
  /* TODO(backend:Listing) long-queries-detail: the row opens LongQueryLogDetail.cfm
     (?LongQueryCode=n), which is not built — the route is the hash placeholder every listing uses. */
  routeNoun: 'long-query',
  rowNoun: 'query',
  sort: { by: 'Date', dir: 'desc' }
});

LISTING_SCREENS['long-queries-grouped'] = Object.assign({}, LQ_SHARED, {
  view: 'Grouped by Query',
  columns: LISTING_LQ_GROUP_COLUMNS,
  defaultFilters: LISTING_LQ_FILTERS,
  moreFilters: LISTING_LQ_MORE_FILTERS,
  rows: LISTING_LQ_GROUPS,
  rowKey: 'groupKey',
  rowNoun: 'query group',
  /* Classic's templateDrillFormatter: the Individual view filtered to this Template:Line, keeping
     the row's own Website and Client ID. */
  rowHref: function (row) {
    var p = new URLSearchParams();
    p.set('Template', row.templateLine);
    p.set('Website', row.website);
    p.set('ClientID', row.clientId);
    return '?' + p.toString();
  },
  sort: { by: 'AvgExecTime', dir: 'desc' }
});
