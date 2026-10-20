/* Topic Manager — a topic list's topics, as a Hierarchy (TopicTree) and a List (this template's table).
 *
 * Code-first (Mark, 2026-10-20, Hub TASK-571925, asked by Luismi): the v3 Taxonomy View's "Click here to
 * manage" opened v1's /control/taxonomy-manager-screen, and v3 had no tree to build it with.
 *
 * ── PROVENANCE ────────────────────────────────────────────────
 * Read from v1 on 2026-10-20: ControlProfileCode 850, security code 190, template
 * /AfoTaxonomyMgr/CC/TaxonomyManager.cfm, which includes
 *   TaxonomyManagerInclude.cfm           → the two tabs (Hierarchy, default; List), the search form, A–Z
 *   TaxonomyManagerDisplayHierarchy.cfm  → the tree: top level = topics with no parent, a level at a time
 *   TaxonomyManagerDisplayListing.cfm    → the List's CProperties (the columns below, in order)
 *   TaxonomyManagerDisplaySearch.cfm     → the search: "Letter" is the Topic box
 *
 * The rows are TopicTree's demo data (topic-tree-data.js) — real names and links from AffinoComrz's
 * "Affino Taxonomy", invented counts. See that file's header.
 */

var TOPICS = window.TOPIC_TREE_DATA;

/* One row per topic. `parents` is the joined names, as v1's List shows them. */
var LISTING_TOPIC_ROWS = Object.keys(TOPICS.topics).map(function (code) {
  return TOPICS.topics[code];
}).sort(function (a, b) {
  return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
});

/* v1's List CProperties, in order. "le" columns show; "le2" ship switched off (defaultHiddenColumns
 * below) and stay in Edit Columns. Live Campaigns / Campaign Views drop out entirely on a site with
 * no campaign channel (CProperties[3] = "n") — they are shown here.
 *
 * The first column is "Topic", not v1's "Name", so the List and the Hierarchy head the same column
 * the same way. The Children count links to the List filtered to that parent in v1; here it is a
 * number, and the Hierarchy is where children are browsed. Counts stay LEFT-aligned in the demo
 * (designer's call; the build right-aligns numbers). */
var LISTING_TOPIC_COLUMNS = [
  { key: 'name',           type: 'text', label: 'Topic',            sort: 'Name', truncate: true, cellClass: 'datatables__article-title', link: true },
  { key: 'parents',        type: 'text', label: 'Parents',          snug: true },
  { key: 'children',       type: 'text', label: 'Children',         hug: true, sort: 'TotalChilds' },
  { key: 'channels',       type: 'text', label: 'Channels',         hug: true, sort: 'TotalChannels' },
  { key: 'articles',       type: 'text', label: 'Articles',         hug: true, sort: 'TotalArticles' },
  { key: 'accounts',       type: 'text', label: 'Accounts',         hug: true, sort: 'TotalAccounts' },
  { key: 'contacts',       type: 'text', label: 'Contacts',         hug: true, sort: 'TotalContacts' },
  { key: 'trendingViews',  type: 'text', label: 'Trending Views',   hug: true, sort: 'TotalTrendingViews' },
  { key: 'liveCampaigns',  type: 'text', label: 'Live Campaigns',   hug: true, sort: 'TotalLiveCampaigns' },
  { key: 'campaignViews',  type: 'text', label: 'Campaign Views',   hug: true, sort: 'TotalCampaignViews' },
  { key: 'editions',       type: 'text', label: 'Editions',         hug: true, sort: 'TotalEditions' },
  { key: 'events',         type: 'text', label: 'Events',           hug: true, sort: 'TotalEvents' },
  { key: 'seminars',       type: 'text', label: 'Seminars',         hug: true, sort: 'TotalSeminars' },
  { key: 'products',       type: 'text', label: 'Products',         hug: true, sort: 'TotalProducts' },
  { key: 'opportunities',  type: 'text', label: 'Opportunities',    hug: true, sort: 'TotalOpportunities' },
  { key: 'proformaOrders', type: 'text', label: 'Pro forma Orders', hug: true, sort: 'TotalProformaOrders' },
  { key: 'created',        type: 'text', label: 'Created',          hug: true, sort: 'Created' },
  { key: 'edit',           type: 'edit', label: '',                 hug: true },
  { key: 'kebab',          type: 'kebab', label: '',                hug: true }
];

/* ── Filters ──────────────────────────────────────────────────
 * v1's search form is three things: a Topic box (named "Letter"), a Parent box, and an A–Z strip.
 * Here they are three chips, and the A–Z strip is a "Starts with" chip rather than 26 buttons: one
 * control on the bar, the same choice, and the bar keeps the Flowbite benchmark's few controls. */
var TOPIC_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var LISTING_TOPIC_FILTERS = [
  /* v1's own rule (TaxonomyManagerDisplaySearch.cfm): ONE character is "starts with", more is
     "contains" — on the name or the External ID. */
  { name: 'Topic', type: 'text', field: 'name',
    label: 'Filter by Topic', placeholder: 'Name or External ID',
    match: function (row, values) {
      var term = String(values[0] || '').toLowerCase();
      if (!term) return true;
      var hay = [row.name, row.externalId || ''].map(function (s) { return s.toLowerCase(); });
      return term.length === 1
        ? hay[0].indexOf(term) === 0
        : hay.some(function (s) { return s.indexOf(term) !== -1; });
    } },
  { name: 'Parent', type: 'text', field: 'parents',
    label: 'Filter by Parent', placeholder: 'Parent topic name',
    match: function (row, values) {
      var term = String(values[0] || '').toLowerCase();
      return !term || row.parents.toLowerCase().indexOf(term) !== -1;
    } },
  { name: 'Starts with', type: 'select-options', field: 'name',
    label: 'Topic starts with', placeholder: 'Any',
    options: TOPIC_LETTERS.map(function (l) { return { name: l }; }),
    match: function (row, values) {
      return values.some(function (l) { return row.name.charAt(0).toUpperCase() === l; });
    } }
];

/* ── Hierarchy ────────────────────────────────────────────────
 * The tree draws the SAME result the table does: the chips and the search narrow both, and in the
 * Hierarchy every match is shown with the path to it. Levels load as they are opened.
 * TODO(backend:TopicManager) topic-tree-data: see topic-tree-data.js. */
var TOPIC_TREE = null;
var TOPIC_TREE_LOADED = { root: TOPICS.children.root };

function renderTopicHierarchy(root, result) {
  var table = root.querySelector('[data-listing-tree]');
  if (!table) return;
  if (!TOPIC_TREE) {
    TOPIC_TREE = window.TopicTree.mount(table, {
      label: TOPICS.taxonomy + ' topics',
      topics: TOPICS.topics,
      children: TOPIC_TREE_LOADED,
      parents: TOPICS.parents,
      columns: [
        { key: 'name', label: 'Topic', type: 'name' },
        { key: 'children', label: 'Children', type: 'count' },
        { key: 'articles', label: 'Articles', type: 'count' },
        { key: 'contacts', label: 'Contacts', type: 'count' },
        { key: 'accounts', label: 'Accounts', type: 'count' },
        { key: 'edit', label: '', type: 'edit', hug: true }
      ],
      /* Every row opens the one demo topic record, like the other listings' rows.
         TODO(backend:TopicManager) topic-manager-routes: the topic's View / Edit routes. */
      href: function () { return '#topic'; },
      editHref: function () { return '#topic/edit'; },
      loadChildren: function (code) {
        return new Promise(function (resolve) {
          setTimeout(function () { TOPIC_TREE_LOADED[code] = TOPICS.children[code] || []; resolve(); }, 500);
        });
      },
      emptyHtml: '<tr class="cc-listing__empty-row"><td class="cc-listing__empty-cell" colspan="6">' +
        '<div class="cc-listing__empty">' +
          '<span class="cc-listing__empty-icon"><i data-lucide="search-x" aria-hidden="true"></i></span>' +
          '<p class="cc-listing__empty-title">No matching topics</p>' +
          '<p class="cc-listing__empty-desc">No topics match the filters you have applied. Try removing one, or clearing them all.</p>' +
        '</div></td></tr>'
    });
  }
  if (!result.filtered) {
    TOPIC_TREE.filter(null);
    return;
  }
  var hit = {};
  result.rows.forEach(function (row) { hit[row.code] = true; });
  TOPIC_TREE.filter(function (t) { return hit[t.code]; }, { children: TOPICS.children, parents: TOPICS.parents });
}

LISTING_SCREENS.topics = {
  title: 'Topics',
  view: 'All Topics',
  columns: LISTING_TOPIC_COLUMNS,
  defaultFilters: LISTING_TOPIC_FILTERS,
  moreFilters: [],
  rows: LISTING_TOPIC_ROWS,
  /* `uidCodes = "TaxonomyCategoryCode,TaxonomyCode"`. */
  rowKey: 'code',
  routeNoun: 'topic',
  rowNoun: 'topic',
  rowHref: function () { return '#topic'; },
  rowEditHref: function () { return '#topic/edit'; },
  /* `CMethods = "add,change,origin"`: Add here; origin (v1's back button) is the breadcrumb. */
  headerActions: [{ label: 'Add', icon: 'plus', variant: 'primary' }],
  identityColumns: 1,
  /* v1's tabs, Hierarchy first because it is v1's default (`url.showtab` defaults to "Hierarchy").
     `listing` is the table — the name the template's Edit Columns and Settings key on. */
  layouts: ['hierarchy', 'listing'],
  renderLayout: renderTopicHierarchy,
  defaultHiddenColumns: ['trendingViews', 'liveCampaigns', 'campaignViews', 'editions', 'events',
    'seminars', 'products', 'opportunities', 'proformaOrders'],
  perPage: 20,
  perPageOptions: [20, 50, 100, 200],
  sort: { by: 'Name', dir: 'asc' }
};
