/* Articles — the second screen on the Listing template.
 *
 * Adding a listing screen means adding a config, not touching the template:
 * this file appends one entry to LISTING_SCREENS and nothing else. The Orders
 * entry in listing-data.js is the sibling, and everything the template does —
 * the measured column fit, Edit Columns, saved views, the pickers, the row and
 * pencil routes, the demo's localStorage — comes for free.
 *
 * ── PROVENANCE ────────────────────────────────────────────────
 * Read from the live screen (ControlProfileCode 1097) 2026-09-21, two ways:
 * the CFML source directly (AfcStandard/CC/StandardItemQDef.cfm and
 * StandardItems.cfm) and a second reading of the responsive controllers by
 * `claudemain-04`, which is the authority for the definitions below because
 * that screen is already a "cc2" one and declares them properly:
 *
 *   columns  → c-article-definition.cfc :: getTableDefinition()
 *   filters  → v-article-listing.cfc :: BuildFilters()
 *
 * WHAT IS REAL: the column set and its order, the filter catalogue and its
 * order, the enums, the default sort, and the 50 rows' titles, publish dates,
 * live flags, view counts, authors and article IDs (Comrz, 3,570 articles).
 *
 * WHAT IS INVENTED, and must not be read as data: SECTION, STYLE, ZONE and
 * CHANNEL per row. The articles feed does not join section names and does not
 * expose the presentation style at all, and per-zone/per-style counts need a
 * GROUP BY the read tools cannot run. The section NAMES are real (the ten
 * largest of 216); which article sits in which is not.
 *
 * ── ONE THING THE LIVE SCREEN ALREADY HAS ─────────────────────
 * Unlike Orders, Articles already pages server-side against a real total
 * (`row_number() OVER(ORDER BY …)`) and already has a working Edit Columns
 * with drag-reorder. So on this screen those two are not new capabilities the
 * prototype is proposing — they are existing ones it is re-dressing.
 */

/* Columns in DEFINITION ORDER, which is also priority order: the table fills
 * from the left until the next column will not fit, so this list is the order
 * they earn their place in (see listing-data.js for the full rationale).
 *
 * SORTING: every column sorts. Orders gates `hs` to seven whitelisted values;
 * Articles has no whitelist at all — whatever the client sends as `SOColumn`
 * is interpolated straight into the ORDER BY. So `sort` here is set on every
 * data column rather than on a chosen few, which is fidelity, not laxity.
 * Default is Publish Start, descending. */
var LISTING_ARTICLES_COLUMNS = [
  { key: 'select',       type: 'select', label: '',                   hug: true },
  /* 250px and an ellipsis on the live screen, which truncates most of these
     titles to about their first 30 characters — and the set is full of
     question-form titles that share their opening words ("What is the…"), so
     that is exactly where it costs most. Fluid here, and the only column
     allowed to grow, so it takes the slack the way Customer does on Orders. */
  { key: 'title',        type: 'text',   label: 'Title',              sort: 'Title', truncate: true, cellClass: 'datatables__article-title' },
  { key: 'section',      type: 'chip',   label: 'Section',            snug: true, sort: 'StandardSection' },
  { key: 'style',        type: 'text',   label: 'Presentation Style', snug: true, sort: 'PresentationStyle', shortLabel: 'Style' },
  { key: 'live',         type: 'text',   label: 'Live',               hug: true, sort: 'Live' },
  { key: 'createdBy',    type: 'text',   label: 'Created By',         snug: true, sort: 'CreatedBy' },
  { key: 'publishStart', type: 'text',   label: 'Publish Start',      hug: true, sort: 'PublishStart' },
  { key: 'views',        type: 'text',   label: 'Views',              hug: true, sort: 'Views', cellClass: 'table__cell--right' },
  /* Not on the live screen's list, and carried here because the template's
     own affordances need somewhere to live — the article ID is what the row
     and pencil routes key on. */
  { key: 'articleId',    type: 'text',   label: 'Article ID',         hug: true },
  { key: 'zone',         type: 'text',   label: 'Zone',               snug: true },
  { key: 'channel',      type: 'text',   label: 'Channel',            snug: true },
  { key: 'created',      type: 'text',   label: 'Created',            hug: true, sort: 'Created' },
  { key: 'edit',         type: 'edit',   label: '',                   hug: true },
  { key: 'kebab',        type: 'kebab',  label: '',                   hug: true }
];

/* Real enums, from the filter definitions. */
var ARTICLE_ACTIVE_STATUS = ['Active', 'Inactive'];
var ARTICLE_TAG_STATUS    = ['Not Tagged', 'Auto Tagged', 'Manual Tagged'];
var ARTICLE_EXPIRES       = ['All Expired', 'Past Month', 'Past 3 months', 'Past 6 months',
                             'This Month', 'Next 3 months', 'Next 6 months'];
/* All seven Zone rows on this instance. */
var ARTICLE_ZONES         = ['Affino', 'Cookie Armageddon', 'Events', 'Funding', 'Intranet', 'Jobs', 'Video Store'];
/* The ten largest of 216 sections — REAL names, and the long tail is the
   point: the top ten hold 63% of 3,570 articles and the other 206 average 6.4
   each. A select with 216 options would be the wrong control, which is why
   the live screen uses a lookup and this one uses the table picker. */
var ARTICLE_SECTIONS = [
  { name: "Stefan's Naturally Aspirated Blog", count: '729' },
  { name: 'Add Review',                        count: '596' },
  { name: 'Affino Social Commerce Blog',       count: '258' },
  { name: 'Useful Resources',                  count: '200' },
  { name: 'Media COs',                         count: '144' },
  { name: 'Insights',                          count: '73' },
  { name: 'Glance',                            count: '67' },
  { name: 'Affino Featured Clients',           count: '63' },
  { name: "What's Cool",                       count: '60' },
  { name: 'Affino Features',                   count: '58' }
];
/* INVENTED. The presentation style is not exposed by any read available here;
   the live filter's own option list self-prunes to styles actually in use, so
   the real set is unknowable without a GROUP BY. */
var ARTICLE_STYLES   = ['Standard Article', 'Long Read', 'FAQ Answer', 'Release Note', 'Landing Page', 'Gallery'];
/* INVENTED names; the feed carries channel CODES only. */
var ARTICLE_CHANNELS = ['Affino Knowledge Base', 'Affino Insights', 'Affino Blog', 'Cookie Armageddon', 'Video Store'];
/* REAL: the 22 distinct authors are the whole population; these are the four
   who wrote the 50 rows below. At 22 a list is legible, which is why this is a
   multi-select here rather than the live screen's type-ahead. */
var ARTICLE_CREATORS = ['Markus Karlsson', 'Zachariah Markusson', 'Quang Luong', 'Stefan Karlsson'];

function articleOpts(names) {
  return names.map(function (n) { return { name: n }; });
}

/* The five chips on the bar: the live screen's first FOUR in declaration
 * order, then Presentation Style promoted from sixth (designer, 2026-09-21).
 * Multi-displayed, which sits fifth live, moves into More Filters. */
var LISTING_ARTICLES_FILTERS = [
  { name: 'Title',   type: 'predictive', field: 'title',   label: 'Filter by Title',   placeholder: 'Search titles' },
  { name: 'Zone',    type: 'select-options', field: 'zone', label: 'Filter by Zone',   placeholder: 'Any',
    options: articleOpts(ARTICLE_ZONES) },
  { name: 'Channel', type: 'multi-select', field: 'channel', label: 'Filter by Channel',
    options: articleOpts(ARTICLE_CHANNELS) },
  /* A TABLE, not a list: 216 sections with a long tail, and the count is what
     tells two similar names apart. The live screen opens a lookup modal here
     for the same reason. */
  { name: 'Section', type: 'multi-select-table', field: 'section', label: 'Filter by Section',
    facets: [
      { name: 'Name', type: 'text', field: 'name', placeholder: 'Search by name' }
    ],
    tableColumns: ['Section', 'Articles'],
    tableFields: ['count'],
    tableColClasses: ['datatables__col--name', 'datatables__col--date'],
    sortable: ['Section', 'Articles'],
    options: ARTICLE_SECTIONS },
  { name: 'Presentation Style', type: 'select-options', field: 'style', label: 'Filter by Presentation Style',
    placeholder: 'Any', options: articleOpts(ARTICLE_STYLES) }
];

/* The rest of the live catalogue, alphabetical in the panel (the panel sorts
 * itself). `Articles Per Screen` is deliberately NOT here: it is the page-size
 * control, which this template already carries in the datatable toolbar, and
 * shipping it twice would be two controls for one setting. Note the live
 * screen disagrees with itself about the sizes — the filter offers
 * 10/20/50/100/300 and the DataTables lengthMenu offers 100/50/25/10. The
 * toolbar here follows the FILTER's list, which is the one an operator sees. */
var LISTING_ARTICLES_MORE_FILTERS = [
  { name: 'Publish Start', type: 'date-range', field: 'publishStart', label: 'Filter by Publish Start' },
  { name: 'Created',       type: 'date-range', field: 'created',      label: 'Filter by Created' },

  { name: 'Active Status', type: 'select-options', field: 'activeStatus', label: 'Filter by Active Status',
    placeholder: 'Any', options: articleOpts(ARTICLE_ACTIVE_STATUS) },
  { name: 'Tag Status',    type: 'select-options', field: 'tagStatus',    label: 'Filter by Tag Status',
    placeholder: 'Any', options: articleOpts(ARTICLE_TAG_STATUS) },
  { name: 'Expires',       type: 'select-options', field: 'expires',      label: 'Filter by Expiry',
    placeholder: 'Any', options: articleOpts(ARTICLE_EXPIRES) },
  { name: 'Live',          type: 'select-options', field: 'live',         label: 'Filter by Live',
    placeholder: 'Any', options: articleOpts(['Live', 'Not live']) },

  { name: 'Creator', type: 'multi-select', field: 'createdBy', label: 'Filter by Creator',
    options: articleOpts(ARTICLE_CREATORS) },

  { name: 'Multi-displayed',  type: 'checkbox', field: 'multiDisplayed', label: 'Multi-displayed',
    checkboxLabel: 'Only articles displayed in more than one place' },
  { name: 'Archived Content', type: 'checkbox', field: 'archived',       label: 'Archived Content',
    checkboxLabel: 'Include archived content' },

  /* The live screen opens ContentLookup.cfm for these three — a different
     modal from the one the Orders bar uses, with its own contract. Modelled as
     multi-selects until that contract is read. */
  { name: 'Account',        type: 'multi-select', field: 'account',  label: 'Filter by Account',
    options: articleOpts(['Affino', 'Jacobs Media', 'The Stage', 'Beckenham FC']) },
  { name: 'Security Group', type: 'multi-select', field: 'security', label: 'Filter by Security Group',
    options: articleOpts(['Public', 'Members', 'Subscribers', 'Staff']) },
  { name: 'Keywords',       type: 'multi-select', field: 'keywords', label: 'Filter by Keyword',
    options: articleOpts(['AI', 'Commerce', 'Events', 'Security', 'Integration']) }
];

/* 50 REAL articles, newest first — the live screen's own default order.
 * Titles, publish dates, live flags, views, authors and IDs are the Comrz
 * data as read on 2026-09-21. Section / Style / Zone / Channel are invented,
 * per the provenance note at the top.
 *
 * Three of the fifty are not live and two of those are QA test articles: the
 * list contains debris, not only published work, and a prototype that only
 * ever shows tidy rows hides what the screen is really for. Article 626281
 * also sorts by DATE well away from where its ID would put it, which makes it
 * the row that proves the sort is on the date and not the id. */
var LISTING_ARTICLES_ROWS = [
  { articleId: '626357', title: 'Bot Detection Guide', section: 'Stefan\'s Naturally Aspirated Blog', style: 'Standard Article', live: 'Live',
    createdBy: 'Zachariah Markusson', publishStart: '2026-09-17', created: '2026-09-17', views: '4',
    zone: 'Affino', channel: 'Affino Knowledge Base' },
  { articleId: '626356', title: 'Orders API Guide', section: 'Add Review', style: 'Long Read', live: 'Live',
    createdBy: 'Zachariah Markusson', publishStart: '2026-09-16', created: '2026-09-16', views: '3',
    zone: 'Cookie Armageddon', channel: 'Affino Insights' },
  { articleId: '626355', title: 'Staging Channel Content Security Guide', section: 'Affino Social Commerce Blog', style: 'FAQ Answer', live: 'Live',
    createdBy: 'Zachariah Markusson', publishStart: '2026-09-16', created: '2026-09-16', views: '2',
    zone: 'Events', channel: 'Affino Blog' },
  { articleId: '626354', title: 'Article Audio Version Guide', section: 'Useful Resources', style: 'Release Note', live: 'Live',
    createdBy: 'Zachariah Markusson', publishStart: '2026-09-16', created: '2026-09-16', views: '2',
    zone: 'Funding', channel: 'Cookie Armageddon' },
  { articleId: '626353', title: 'Affino 9.0.11.25 - The Refinement Update', section: 'Media COs', style: 'Landing Page', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-09-02', created: '2026-09-02', views: '88',
    zone: 'Intranet', channel: 'Video Store' },
  { articleId: '626352', title: 'Native Unsubscribe Guide', section: 'Insights', style: 'Gallery', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-09-02', created: '2026-09-02', views: '8',
    zone: 'Jobs', channel: 'Affino Knowledge Base' },
  { articleId: '626351', title: 'Email Test Tool Guide', section: 'Glance', style: 'Standard Article', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-09-02', created: '2026-09-02', views: '8',
    zone: 'Video Store', channel: 'Affino Insights' },
  { articleId: '626350', title: 'Product Terms and Conditions Guide', section: 'Affino Featured Clients', style: 'Long Read', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-09-02', created: '2026-09-02', views: '7',
    zone: 'Affino', channel: 'Affino Blog' },
  { articleId: '626349', title: 'Win-Back Campaign Guide', section: 'What\'s Cool', style: 'FAQ Answer', live: 'Live',
    createdBy: 'Zachariah Markusson', publishStart: '2026-07-22', created: '2026-07-22', views: '26',
    zone: 'Cookie Armageddon', channel: 'Cookie Armageddon' },
  { articleId: '626348', title: 'Analytics Dashboard FAQs', section: 'Affino Features', style: 'Release Note', live: 'Live',
    createdBy: 'Zachariah Markusson', publishStart: '2026-07-21', created: '2026-07-21', views: '22',
    zone: 'Events', channel: 'Video Store' },
  { articleId: '626347', title: 'Affino 9.0.11.24 - The Autonomy Update', section: 'Stefan\'s Naturally Aspirated Blog', style: 'Landing Page', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '70',
    zone: 'Funding', channel: 'Affino Knowledge Base' },
  { articleId: '626346', title: 'Agent Access - Best Practice and Safe Use', section: 'Add Review', style: 'Gallery', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '28',
    zone: 'Intranet', channel: 'Affino Insights' },
  { articleId: '626345', title: 'Agent Access - Getting Started', section: 'Affino Social Commerce Blog', style: 'Standard Article', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '17',
    zone: 'Jobs', channel: 'Affino Blog' },
  { articleId: '626344', title: 'How to Keep Original Images When Converting to WebP', section: 'Useful Resources', style: 'Long Read', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '17',
    zone: 'Video Store', channel: 'Cookie Armageddon' },
  { articleId: '626343', title: 'Media Listing Design Element Guide', section: 'Media COs', style: 'FAQ Answer', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '10',
    zone: 'Affino', channel: 'Video Store' },
  { articleId: '626342', title: 'Event QR Code Email Guide', section: 'Insights', style: 'Release Note', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '15',
    zone: 'Cookie Armageddon', channel: 'Affino Knowledge Base' },
  { articleId: '626341', title: 'CRM Account and Contact Record Guide', section: 'Glance', style: 'Landing Page', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '18',
    zone: 'Events', channel: 'Affino Insights' },
  { articleId: '626340', title: 'How to use spreadsheets and Excel files as Affino AI sources', section: 'Affino Featured Clients', style: 'Gallery', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '23',
    zone: 'Funding', channel: 'Affino Blog' },
  { articleId: '626339', title: 'QA TASK-324468 Step-Only Full-Article Test 2026-07-20', section: 'What\'s Cool', style: 'Standard Article', live: 'Not live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '0',
    zone: 'Intranet', channel: 'Cookie Armageddon' },
  { articleId: '626338', title: 'QA TASK-324468 Multi-Step Full-Article Test 2026-07-20', section: 'Affino Features', style: 'Long Read', live: 'Not live',
    createdBy: 'Markus Karlsson', publishStart: '2026-07-20', created: '2026-07-20', views: '0',
    zone: 'Jobs', channel: 'Video Store' },
  { articleId: '626337', title: 'Writing AI Profile Prompts — Field-by-Field', section: 'Stefan\'s Naturally Aspirated Blog', style: 'FAQ Answer', live: 'Live',
    createdBy: 'Zachariah Markusson', publishStart: '2026-07-07', created: '2026-07-07', views: '52',
    zone: 'Video Store', channel: 'Affino Knowledge Base' },
  { articleId: '626331', title: 'Zapier Integration - Method & Field Reference', section: 'Add Review', style: 'Release Note', live: 'Live',
    createdBy: 'Quang Luong', publishStart: '2026-06-30', created: '2026-06-30', views: '38',
    zone: 'Affino', channel: 'Affino Insights' },
  { articleId: '626330', title: 'Why have my Conversion Events become Customer Signals, and what is a custom signal?', section: 'Affino Social Commerce Blog', style: 'Landing Page', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-22', created: '2026-06-22', views: '17',
    zone: 'Cookie Armageddon', channel: 'Affino Blog' },
  { articleId: '626329', title: 'How do I recover a forum post draft after a timeout?', section: 'Useful Resources', style: 'Gallery', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-22', created: '2026-06-22', views: '9',
    zone: 'Events', channel: 'Cookie Armageddon' },
  { articleId: '626328', title: 'What does the RemoveYN column do in the Redirect Import?', section: 'Media COs', style: 'Standard Article', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-19', created: '2026-06-19', views: '10',
    zone: 'Funding', channel: 'Video Store' },
  { articleId: '626323', title: 'What is the External User ID and how is it used?', section: 'Insights', style: 'Long Read', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-19', created: '2026-06-19', views: '15',
    zone: 'Intranet', channel: 'Affino Knowledge Base' },
  { articleId: '626322', title: 'What is the limit of zaps on Affino?', section: 'Glance', style: 'FAQ Answer', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-19', created: '2026-06-19', views: '11',
    zone: 'Jobs', channel: 'Affino Insights' },
  { articleId: '626321', title: 'How do I create an Account List?', section: 'Affino Featured Clients', style: 'Release Note', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-19', created: '2026-06-19', views: '6',
    zone: 'Video Store', channel: 'Affino Blog' },
  { articleId: '626320', title: 'What is a Brand Plan, and how do I create one?', section: 'What\'s Cool', style: 'Landing Page', live: 'Not live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-18', created: '2026-06-18', views: '1',
    zone: 'Affino', channel: 'Cookie Armageddon' },
  { articleId: '626319', title: 'Where can I see statistics for shareline clicks?', section: 'Affino Features', style: 'Gallery', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-18', created: '2026-06-18', views: '6',
    zone: 'Cookie Armageddon', channel: 'Video Store' },
  { articleId: '626318', title: 'How do I change colours or borders on a listing design element?', section: 'Stefan\'s Naturally Aspirated Blog', style: 'Standard Article', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-18', created: '2026-06-18', views: '13',
    zone: 'Events', channel: 'Affino Knowledge Base' },
  { articleId: '626317', title: 'What are Connections in Affino, and what are they for?', section: 'Add Review', style: 'Long Read', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-18', created: '2026-06-18', views: '11',
    zone: 'Funding', channel: 'Affino Insights' },
  { articleId: '626316', title: 'Can I export sections and channels to a spreadsheet?', section: 'Affino Social Commerce Blog', style: 'FAQ Answer', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-18', created: '2026-06-18', views: '3',
    zone: 'Intranet', channel: 'Affino Blog' },
  { articleId: '626315', title: 'What is the Alternative Page Title used for?', section: 'Useful Resources', style: 'Release Note', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-18', created: '2026-06-18', views: '5',
    zone: 'Jobs', channel: 'Cookie Armageddon' },
  { articleId: '626314', title: 'Security FAQs', section: 'Media COs', style: 'Landing Page', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-18', created: '2026-06-18', views: '14',
    zone: 'Video Store', channel: 'Video Store' },
  { articleId: '626313', title: 'Opportunities & Opportunity Management Reference Guide', section: 'Insights', style: 'Gallery', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-18', created: '2026-06-18', views: '11',
    zone: 'Affino', channel: 'Affino Knowledge Base' },
  { articleId: '626312', title: 'How charities can use Affino AI plugins', section: 'Glance', style: 'Standard Article', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-16', created: '2026-06-16', views: '52',
    zone: 'Cookie Armageddon', channel: 'Affino Insights' },
  { articleId: '626310', title: 'AI Advisory Service for Charities', section: 'Affino Featured Clients', style: 'Long Read', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-12', created: '2026-06-12', views: '53',
    zone: 'Events', channel: 'Affino Blog' },
  { articleId: '626309', title: 'Five AI workflows every charity can start with', section: 'What\'s Cool', style: 'FAQ Answer', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-12', created: '2026-06-12', views: '36',
    zone: 'Funding', channel: 'Cookie Armageddon' },
  { articleId: '626308', title: 'How charities are getting real value from AI', section: 'Affino Features', style: 'Release Note', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-12', created: '2026-06-12', views: '81',
    zone: 'Intranet', channel: 'Video Store' },
  { articleId: '626303', title: 'The Operator\'s AI Playbook: Turning Proprietary Intelligence into Live Customer Value', section: 'Stefan\'s Naturally Aspirated Blog', style: 'Landing Page', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-09', created: '2026-06-09', views: '55',
    zone: 'Jobs', channel: 'Affino Knowledge Base' },
  { articleId: '626281', title: 'Affino 9.0.11.23 - The Capability Update', section: 'Add Review', style: 'Gallery', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-03', created: '2026-06-03', views: '120',
    zone: 'Video Store', channel: 'Affino Insights' },
  { articleId: '626302', title: 'Social Profiles Guide', section: 'Affino Social Commerce Blog', style: 'Standard Article', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-03', created: '2026-06-03', views: '27',
    zone: 'Affino', channel: 'Affino Blog' },
  { articleId: '626301', title: 'Event Attendee Check-In Guide', section: 'Useful Resources', style: 'Long Read', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-03', created: '2026-06-03', views: '20',
    zone: 'Cookie Armageddon', channel: 'Cookie Armageddon' },
  { articleId: '626300', title: 'Dynamic Forms in Articles Guide', section: 'Media COs', style: 'FAQ Answer', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-03', created: '2026-06-03', views: '31',
    zone: 'Events', channel: 'Video Store' },
  { articleId: '626299', title: 'Preview Mode Guide', section: 'Insights', style: 'Release Note', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-06-03', created: '2026-06-03', views: '27',
    zone: 'Funding', channel: 'Affino Knowledge Base' },
  { articleId: '626296', title: 'Smarter Events, Registrations, and Attendee Journeys', section: 'Glance', style: 'Landing Page', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-05-30', created: '2026-05-30', views: '135',
    zone: 'Intranet', channel: 'Affino Insights' },
  { articleId: '626295', title: 'The Agentic Revolution for Content and Audience Engagement', section: 'Affino Featured Clients', style: 'Gallery', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-05-30', created: '2026-05-30', views: '216',
    zone: 'Jobs', channel: 'Affino Blog' },
  { articleId: '626294', title: 'Transforming Content with New AI Interactive Experiences', section: 'What\'s Cool', style: 'Standard Article', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-05-30', created: '2026-05-30', views: '110',
    zone: 'Video Store', channel: 'Cookie Armageddon' },
  { articleId: '626293', title: 'Affino & Zapier - Connected Workflows Across the Ecosystem', section: 'Affino Features', style: 'Long Read', live: 'Live',
    createdBy: 'Markus Karlsson', publishStart: '2026-05-30', created: '2026-05-30', views: '178',
    zone: 'Affino', channel: 'Video Store' }
];

LISTING_SCREENS.articles = {
  title: 'Articles',
  view: 'All Articles',
  columns: LISTING_ARTICLES_COLUMNS,
  defaultFilters: LISTING_ARTICLES_FILTERS,
  moreFilters: LISTING_ARTICLES_MORE_FILTERS,
  rows: LISTING_ARTICLES_ROWS,
  /* The primary action from the CCHeader pattern's own actions cluster
     (Figma 4105:3640): plus icon, the word Add, Primary/Base. */
  headerActions: [{ label: 'Add', icon: 'plus', variant: 'primary' }],
  /* REAL, and the whole list: `this.CMethods = "copy,move,delete,
     listmakelive,listmakenotlive"` — the first line of v-article-listing.cfc.
     Five verbs and no selects, which is why this screen's bar looks nothing
     like Orders'. */
  bulkActions: [
    { label: 'Copy',          icon: 'copy' },
    { label: 'Move',          icon: 'folder-input' },
    { label: 'Make Live',     icon: 'eye' },
    { label: 'Make Not Live', icon: 'eye-off' },
    { label: 'Delete',        icon: 'trash-2' }
  ],
  /* The article ID is what the row and pencil routes key on — this file said
     so from the start, but the template had `orderNo` hard-coded, so every
     Articles row shipped `href="#order//edit"` and an aria-label reading
     "Edit order " with nothing after it. Found while building Article
     Archive, which needed the same knob. */
  rowKey: 'articleId',
  routeNoun: 'article',
  /* Only the TITLE is guaranteed. Orders keeps two identity columns because
     its pair is an order number and a name; Articles' pair would be two long
     text columns, which does not fit a phone — see fitColumns. */
  identityColumns: 1,
  /* The live filter's own list. 20 is its default too. */
  perPage: 20,
  perPageOptions: [10, 20, 50, 100, 300],
  /* PublishStart DESC — the live default, set in the controller rather than
     in a whitelist. */
  sort: { by: 'PublishStart', dir: 'desc' }
};
