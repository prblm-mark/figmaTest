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
 * v1's shape (Mark, 2026-10-20): a name-only tree, and the selected topic's facts in the FactPanel beside
 * it. The tree draws the SAME result the table does — the chips and the search narrow both, and every
 * match is shown with the path to it. Levels load as they are opened.
 * TODO(backend:TopicManager) topic-tree-data: see topic-tree-data.js. */
var TOPIC_TREE = null;
var TOPIC_TREE_LOADED = { root: TOPICS.children.root };

function topicEsc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* v1's details panel (TaxonomyManagerInclude.cfm), field for field: Topic Code, Name (the title here),
 * Screen Name, Child Topics, then each count that is not zero as a link to that listing filtered to the
 * topic, then Created. Empty fields are left out, as on every view screen. */
var TOPIC_PANEL_COUNTS = [
  ['channels', 'Channels'], ['articles', 'Articles'], ['accounts', 'Accounts'], ['contacts', 'Contacts'],
  ['trendingViews', 'Trending Views'], ['liveCampaigns', 'Live Campaigns'], ['campaignViews', 'Campaign Views'],
  ['editions', 'Editions'], ['events', 'Events'], ['seminars', 'Seminars'], ['products', 'Products'],
  ['opportunities', 'Opportunities'], ['proformaOrders', 'Pro forma Orders']
];

function topicRow(label, html) {
  return '<div class="field-row field-row--compact"><dt class="field-row__label">' + topicEsc(label) +
    '</dt><dd class="field-row__value">' + html + '</dd></div>';
}

function renderTopicPanel(panel, t) {
  var kids = (TOPICS.children[t.code] || []).map(function (c) { return TOPICS.topics[c].name; });
  var rows = [
    topicRow('Topic Code', topicEsc(t.code)),
    /* TODO(backend:TopicManager) topic-manager-rows: Screen Name is derived here — the real field is
       TaxonomyCategory's screen name. */
    topicRow('Screen Name', topicEsc(t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')))
  ];
  if (t.parents) rows.push(topicRow('Parents', topicEsc(t.parents)));
  if (kids.length) rows.push(topicRow('Child Topics', topicEsc(kids.join(', '))));
  TOPIC_PANEL_COUNTS.forEach(function (c) {
    if (!t[c[0]]) return;
    /* TODO(backend:TopicManager) topic-manager-routes: each count opens that listing filtered to the topic. */
    rows.push(topicRow(c[1], '<a class="btn btn--tertiary btn--xs" href="#" data-backend-todo="topic-manager-routes">' +
      '<span>' + Number(t[c[0]]).toLocaleString('en-GB') + '</span></a>'));
  });
  if (t.created) rows.push(topicRow('Created', topicEsc(new Date(t.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))));

  panel.innerHTML =
    '<div class="fact-panel__header">' +
      '<div class="fact-panel__title-block"><h2 class="fact-panel__title" id="topic-panel-title">' + topicEsc(t.name) + '</h2></div>' +
      /* v1's Edit acts on the selected topic. TODO(backend:TopicManager) topic-manager-routes. */
      '<div class="fact-panel__trailing"><a class="btn btn--secondary btn--xs" href="#topic/edit" data-backend-todo="topic-manager-routes">' +
        '<i data-lucide="pencil" aria-hidden="true"></i><span>Edit</span></a></div>' +
    '</div>' +
    '<dl class="fact-list">' + rows.join('') + '</dl>';
  if (window.lucide) window.lucide.createIcons();

  /* Stacked (narrow page), the panel is below a long tree — bring it to the topic just picked. */
  var wrap = panel.parentElement;
  if (getComputedStyle(wrap).gridTemplateColumns.split(' ').length === 1) {
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function renderTopicHierarchy(root, result) {
  var list = root.querySelector('[data-listing-tree]');
  var panel = root.querySelector('[data-listing-tree-panel]');
  if (!list) return;
  if (!TOPIC_TREE) {
    TOPIC_TREE = window.TopicTree.mount(list, {
      label: TOPICS.taxonomy + ' topics',
      topics: TOPICS.topics,
      children: TOPIC_TREE_LOADED,
      parents: TOPICS.parents,
      loadChildren: function (code) {
        return new Promise(function (resolve) {
          setTimeout(function () { TOPIC_TREE_LOADED[code] = TOPICS.children[code] || []; resolve(); }, 500);
        });
      },
      onSelect: function (t) { if (panel) renderTopicPanel(panel, t); },
      emptyHtml: '<li class="cc-listing__tree-hint" role="none">No topics match the filters you have applied. Try removing one, or clearing them all.</li>'
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
