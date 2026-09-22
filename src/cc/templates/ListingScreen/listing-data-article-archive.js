/* Article Archive — the third screen on the Listing template.
 *
 * Adding a listing screen means adding a config, not touching the template:
 * this file appends one entry to LISTING_SCREENS. The Orders entry in
 * listing-data.js and the Articles entry in listing-data-articles.js are the
 * siblings, and everything the template does — the measured column fit, Edit
 * Columns, saved views, the pickers, the row and pencil routes, the demo's
 * localStorage — comes for free.
 *
 * ── PROVENANCE ────────────────────────────────────────────────
 * Read from the live screen on 2026-09-22. /control/article-archive is
 * ControlProfileCode 921, under Content, security code 213, and — unlike
 * /control/articles — it is NOT a "cc2" screen: `ResponsiveTemplatePath` is
 * empty, so there are no responsive controllers to read and the legacy CFML
 * IS the definition. Three files, read directly:
 *
 *   /AfoWave/CC/ArchiveManagement.cfm      → the filter catalogue (aCS)
 *   /AfoWave/CC/ArchiveManagementDef.cfm   → the columns (CProperties)
 *   /AfoWave/CC/ArchiveManagementQDef.cfm  → the query, sort whitelist, paging
 *
 * WHAT IS REAL: the six columns and their order; all six filters, their
 * control types, their option lists and their defaults; the sort whitelist and
 * the default sort; the TOP 500 paging; the two-entity Type switch; the
 * Presentation Style option lists (StandardTemplate / MediaTemplate, read from
 * AffinoComrz); the Section and Channel names; and the eight rows marked REAL
 * below, which are the archived items visible in the 200-row sample the read
 * tools allow.
 *
 * WHAT IS SYNTHESISED, and must not be read as data: the rows marked
 * SYNTHESISED, and the whole Media row set. See the ROWS note below — the
 * shape is measured, the values are not data.
 */

/* Columns in DEFINITION ORDER, which is also priority order: the table fills
 * from the left until the next column will not fit, so this list is the order
 * they earn their place in (see listing-data.js for the full rationale).
 *
 * ArchiveManagementDef.cfm declares exactly six, and they are the same six for
 * both entities — the Type switch changes the TABLE the screen reads, not the
 * shape of it. `select`, `edit` and `kebab` are the template's own affordances
 * rather than the live screen's columns.
 *
 * SORTING: Article Archive DOES have a whitelist, and that is worth recording
 * because Articles has none. `url.hs` goes through a <cfswitch> with seven
 * cases — Title, Alphabetical, Channel, Section, PresentationStyle, CreatedBy,
 * Chronological, PublishEnd — and anything else falls to the default. So the
 * `sort` tokens below are the whitelist, not every column: `itemId` carries
 * none because the live screen cannot sort on it.
 *
 * Note what the whitelist implies: the default order is PublishStart DESC, and
 * PublishStart is NOT one of the six columns. The screen opens sorted on a
 * date it never shows; the date it DOES show is Publish End. */
var LISTING_ARCHIVE_COLUMNS = [
  { key: 'select',       type: 'select', label: '',                   hug: true },
  /* Free text, and the only column allowed to grow — it takes the slack the
     way Orders' Customer and Articles' Title do. Truncating for the same
     reason Articles' Title truncates: an archived title is unbounded, and one
     long one otherwise eats two columns' worth of budget on its own. */
  { key: 'title',        type: 'text',   label: 'Title',              sort: 'Title', truncate: true, cellClass: 'datatables__article-title' },
  { key: 'channel',      type: 'chip',   label: 'Channel',            snug: true, sort: 'Channel' },
  { key: 'section',      type: 'chip',   label: 'Section',            snug: true, sort: 'Section' },
  { key: 'style',        type: 'text',   label: 'Presentation Style', snug: true, sort: 'PresentationStyle', shortLabel: 'Style' },
  { key: 'publishEnd',   type: 'text',   label: 'Publish End',        hug: true, sort: 'PublishEnd' },
  { key: 'createdBy',    type: 'text',   label: 'Created By',         snug: true, sort: 'CreatedBy' },
  /* Not one of the six. Carried because the template's row and pencil routes
     key on it — `uidCodes` is StandardItemCode for Type=Article and the
     cl/ccs pair for Type=Media, and the listing's own ListingLink column is
     built from it. */
  { key: 'itemId',       type: 'text',   label: 'Item ID',            hug: true },
  { key: 'edit',         type: 'edit',   label: '',                   hug: true },
  { key: 'kebab',        type: 'kebab',  label: '',                   hug: true }
];

/* ── The filter catalogue, in aCS declaration order ───────────────
 *
 * Six entries plus a Submit button, and that is the WHOLE catalogue — this
 * screen has no second tier. Five of the six become the bar's chips, which is
 * the house rule (the first five from the live screen) landing exactly on the
 * boundary here rather than by a cut. The sixth is Order By, and Order By is
 * not a filter: ArchiveManagementQDef.cfm assigns it straight to `url.hs`
 * —
 *     if( Len(Trim(Form.Order)) AND NOT StructKeyExists(URL,"hs") ) url.hs = Form.Order;
 *
 * — which is the table's own sort parameter. It ships as the sortable column
 * headers this template already has, the same call Articles made for its
 * Articles Per Screen: one setting, one control.
 *
 * That leaves the More Filters catalogue EMPTY, and the template now hides the
 * Add Filters chip when it is. Nothing has been invented to fill it. */

/* Real: the three Filter by boxes and the two Type radios, from their
   CodeList/NameList pairs. */
var ARCHIVE_SCOPES = ['Section', 'Article', 'Channel'];
var ARCHIVE_TYPES  = ['Article', 'Media'];
/* Real: the CustomDateSelector's own presets. Kept here because they are the
   live vocabulary even though the chip below is a from/to pair — see the
   note on the Date Range filter. */
var ARCHIVE_DATE_PRESETS = ['Any Time', 'Today', 'This Week', 'Last Week', 'This Month', 'Custom'];

var LISTING_ARCHIVE_FILTERS = [
  /* 1. Name — Type=Text, FieldName=FilterTerm.
     A plain text box, and deliberately NOT the predictive that Articles gives
     its Title chip. The distribution is not the reason; the SEMANTICS are.
     This term is LIKE-matched against up to three different fields at once,
     so a type-ahead offering titles would quietly hide the section and channel
     matches that the same term is finding. */
  { name: 'Name', type: 'text', field: 'title',
    label: 'Filter by Name', placeholder: 'Search archived items',
    /* One chip reading another — see `scopeFields` in ListingScreen.js. The
       map is the CFML's own: ListContains(FilterType,"Section") ORs a LIKE on
       StandardSection.Name, "Channel" one on Channel.Name, and "Article" one
       on StandardItem.Title (or MediaItem.Name on the Media branch, where the
       box is still labelled "Article" — a live mislabel, left as found). */
    scopedBy: 'Filter by',
    scopeFields: { Section: 'section', Article: 'title', Channel: 'channel' },
    /* What an UNTOUCHED "Filter by" means — the CFML's own
       `<cfparam name="FilterType" default="Section,Article">`. It lives here
       rather than on the chip as a `defaultValues` so the chip OPENS BARE: the
       screen should not look filtered before anyone has touched it (designer,
       2026-09-22). Emptying the chip deliberately is still a different thing
       and still matches nothing. */
    scopeDefault: ['Section', 'Article'] },

  /* 2. Filter by — Type=CheckBox, FieldName=FilterType,
        default "Section,Article".
     Not a row filter: it scopes the Name term above, which is why it carries
     no `field` and never narrows the table on its own. */
  { name: 'Filter by', type: 'multi-select',
    label: 'Filter by field', options: [{ name: 'Section' }, { name: 'Article' }, { name: 'Channel' }] },

  /* 3. Type — Type=Radio, FieldName=Type, CodeList "1,26", default 1.
     The one thing this screen does that neither sibling does: Type does not
     narrow a list, it swaps the ENTITY. Type=1 queries StandardItem, Type=26
     queries MediaItem, through two near-identical queries with the same six
     columns. Modelled as a filter over a `type` field so the existing
     machinery carries it.
     This one DOES keep its default, unlike the scope chip above: Type is a
     mode rather than a filter, the live screen always holds one, and opening
     on Article is what it does (designer, 2026-09-22).
     KNOWN DIVERGENCE: live is a radio, so it always holds exactly one value.
     This chip can be cleared, which shows both entities at once — a state the
     live screen has no way to reach. */
  { name: 'Type', type: 'select-options', field: 'type',
    label: 'Filter by Type', placeholder: 'Article',
    options: [{ name: 'Article' }, { name: 'Media' }],
    defaultValues: ['Article'] },

  /* 4. Date Range — Type=CustomDateSelector, FieldName=DateRange,
        plus DateRangeStart / DateRangeEnd.
     Filters PUBLISH START, not the Publish End the table shows — the WHERE
     clause is on PublishStart in both branches. So this chip and the date
     column are about different dates, which is live behaviour and not a slip
     here.
     KNOWN DIVERGENCE: live offers five presets and a Custom pair; this is the
     Custom pair only, because a preset row is a control the FilterBar has no
     Figma variant for. The presets are recorded in ARCHIVE_DATE_PRESETS.
     TODO(backend:Listing) archive-date-presets: the preset row is not built. */
  { name: 'Date Range', type: 'date-range', field: 'publishStart',
    label: 'Filter by Publish Start' },

  /* 5. Creator — Type=Text, FieldName=Creator.
     A text box, matching live, and the distribution agrees for once rather
     than pushing the other way. Articles made Creator a multi-select because
     22 authors fit in a legible list; the archived set is far narrower than
     that — every archived row read on 2026-09-22 was created by one of two
     users — and a two-option list dressed as a picker would overstate the
     choice. The live LIKE is across FirstName, LastName and the two joined,
     which a substring match on the rendered name reproduces. */
  { name: 'Creator', type: 'text', field: 'createdBy',
    label: 'Filter by Creator', placeholder: 'Search creators' }
];

/* Empty, and that is the finding rather than an omission — see the catalogue
   note above. The template hides Add Filters when this is empty. */
var LISTING_ARCHIVE_MORE_FILTERS = [];

/* ── ROWS ──────────────────────────────────────────────────────
 *
 * The first eight rows are REAL: they are every `ArchivedYN = 1` StandardItem
 * in the 200-row sample that the read tools allow (`client_db_table_sample`
 * caps at 200 and takes no WHERE clause, so the archive's own query cannot be
 * run from here). Titles, item codes, publish dates, sections, channels,
 * presentation styles and creators are as read on 2026-09-22.
 *
 * They are worth reading before the synthesised ones, because they are not
 * what a tidy archive looks like:
 *
 *   - Every one is `Live = 0`. Archived content is unpublished content.
 *   - Seven were created by UserCode 3, whose FirstName is EMPTY and whose
 *     LastName is "Former Member" — and the live query builds the name as
 *     `FirstName + ' ' + LastName`, so the cell really does render with a
 *     LEADING SPACE. Kept verbatim: it is exactly the kind of value a column
 *     has to survive, and trimming it here would hide it.
 *   - The titles are 'Golf VI', 'Um Bongo', 'Temp Review', 'Temp Test' and
 *     'meh'. The archive is where test content goes to sit, so a prototype
 *     that only ever shows well-formed editorial misrepresents the screen.
 *   - Two are a record and its copy ('Christina Testing Rated' and 'Copy of
 *     Christina Testing Rated'), one second apart.
 *   - All eight share one section and one channel, both called "Add Review".
 *     The Section and Channel columns are not independent here, which is what
 *     makes the Filter by scope chip demonstrable: the same term hits both.
 *   - Their Presentation Style is 'Emojo Rated (Deprecated)' — a real
 *     StandardTemplate, and 40 of the 63 on this instance carry "(Deprecated)"
 *     in the name.
 *
 * The rows marked SYNTHESISED extend that shape to a pageable set. They are
 * NOT data: the item codes, titles and dates are invented, though every
 * section, channel, presentation style and creator name in them is a real
 * value from AffinoComrz. Shaz is running the listing's own query; when those
 * rows land they replace everything below the REAL block.
 * TODO(backend:Listing) archive-rows: rows 9+ are synthesised, pending the
 * real query → GET /control/article-archive?Type=1&…
 */
var LISTING_ARCHIVE_ROWS_ARTICLE = [
  /* ── REAL ── ArchivedYN = 1, read from AffinoComrz 2026-09-22 ── */
  { type: 'Article', itemId: '5568', title: 'meh', channel: 'Add Review', section: 'Add Review',
    style: 'Advanced Article', publishStart: '2009-02-05', publishEnd: '2009-02-05', createdBy: 'Chris Bristow' },
  { type: 'Article', itemId: '5512', title: 'Temp Test', channel: 'Add Review', section: 'Add Review',
    style: 'Emojo Rated (Deprecated)', publishStart: '2008-12-19', publishEnd: '2009-01-22', createdBy: ' Former Member' },
  { type: 'Article', itemId: '5510', title: 'Temp Review', channel: 'Add Review', section: 'Add Review',
    style: 'Emojo Rated (Deprecated)', publishStart: '2008-12-19', publishEnd: '2008-12-19', createdBy: ' Former Member' },
  { type: 'Article', itemId: '5509', title: 'Um Bongo', channel: 'Add Review', section: 'Add Review',
    style: 'Emojo Rated (Deprecated)', publishStart: '2008-12-19', publishEnd: '2008-12-19', createdBy: ' Former Member' },
  { type: 'Article', itemId: '5503', title: 'Copy of Christina Testing Rated', channel: 'Add Review', section: 'Add Review',
    style: 'Emojo Rated (Deprecated)', publishStart: '2008-12-19', publishEnd: '2008-12-19', createdBy: ' Former Member' },
  { type: 'Article', itemId: '5502', title: 'Christina Testing Rated', channel: 'Add Review', section: 'Add Review',
    style: 'Emojo Rated (Deprecated)', publishStart: '2008-12-19', publishEnd: '2008-12-19', createdBy: ' Former Member' },
  { type: 'Article', itemId: '5417', title: 'Tropic Thunder', channel: 'Add Review', section: 'Add Review',
    style: 'Emojo Rated (Deprecated)', publishStart: '2008-11-25', publishEnd: '2009-09-06', createdBy: ' Former Member' },
  { type: 'Article', itemId: '5361', title: 'Golf VI', channel: 'Add Review', section: 'Add Review',
    style: 'Emojo Rated (Deprecated)', publishStart: '2008-10-07', publishEnd: '2009-09-06', createdBy: ' Former Member' }
];

/* The Media branch. SYNTHESISED IN FULL, and the reason is itself a finding:
 * zero of 200 sampled MediaItems carry `ArchivedYN = 1`, and every one has a
 * NULL `ArchivedSectionCode`, which the second WHERE branch tests with
 * `> 0` — NULL > 0 is UNKNOWN in T-SQL, so those rows can never qualify.
 * Type=Media may well return nothing at all on this instance.
 *
 * The SHAPE is real and is why the branch is worth showing at all — it looks
 * nothing like the Article one:
 *   - Names are raw filenames turned into titles: "Screenshot2026 09 16143300".
 *   - Sections are forum-media buckets, not editorial sections.
 *   - Publish End is publish start plus TEN YEARS, so the column that holds
 *     2008 dates on one branch holds 2030s dates on the other, and a column
 *     sized to one is not sized to the other.
 *   - There are only THREE MediaTemplate presentation styles on this instance
 *     (Media Default, Video, Podcast) against 63 StandardTemplates, and every
 *     sampled media item used the first.
 * TODO(backend:Listing) archive-rows-media: synthesised in full.
 */
var LISTING_ARCHIVE_ROWS_MEDIA = [
  { type: 'Media', itemId: '38214', title: 'Screenshot2019 03 14 111207.png', channel: 'Affino Media', section: 'Affino Forum Media',
    style: 'Media Default Presentation Style', publishStart: '2019-03-14', publishEnd: '2029-03-14', createdBy: ' Former Member' },
  { type: 'Media', itemId: '38102', title: 'old-affino-logo-lockup.png', channel: 'Branding Archive', section: 'Branding Archive',
    style: 'Media Default Presentation Style', publishStart: '2018-11-02', publishEnd: '2028-11-02', createdBy: 'Chris Bristow' },
  { type: 'Media', itemId: '37788', title: 'Comrz2011-brand-guidelines.pdf', channel: 'Branding Archive', section: 'Branding Archive',
    style: 'Media Default Presentation Style', publishStart: '2018-06-21', publishEnd: '2028-06-21', createdBy: ' Former Member' },
  { type: 'Media', itemId: '36940', title: 'affino-intro-2017.mp4', channel: 'News Archive', section: 'News Archive',
    style: 'Video Presentation Style', publishStart: '2017-09-08', publishEnd: '2027-09-08', createdBy: 'Chris Bristow' },
  { type: 'Media', itemId: '36512', title: 'quick-smart-episode-01.mp3', channel: 'Quick Smart Archive', section: 'Quick Smart Archive',
    style: 'Podcast Presentation Style', publishStart: '2017-02-13', publishEnd: '2027-02-13', createdBy: ' Former Member' },
  { type: 'Media', itemId: '35990', title: 'Web capture 11-08-2016 xtremevideo.co.uk', channel: 'News Archive', section: 'News Archive',
    style: 'Media Default Presentation Style', publishStart: '2016-08-11', publishEnd: '2026-08-11', createdBy: ' Former Member' },
  { type: 'Media', itemId: '35441', title: 'careers-2015-web-developer.docx', channel: 'Careers Archive', section: 'Careers Archive',
    style: 'Media Default Presentation Style', publishStart: '2015-11-30', publishEnd: '2025-11-30', createdBy: 'Chris Bristow' },
  { type: 'Media', itemId: '34877', title: 'affino-features-listing-2014.xlsx', channel: 'Affino Features - Archived', section: 'Affino Features - Archived',
    style: 'Media Default Presentation Style', publishStart: '2014-07-16', publishEnd: '2024-07-16', createdBy: ' Former Member' }
];

LISTING_SCREENS['article-archive'] = {
  title: 'Article Archive',
  view: 'All Archived Items',
  columns: LISTING_ARCHIVE_COLUMNS,
  defaultFilters: LISTING_ARCHIVE_FILTERS,
  moreFilters: LISTING_ARCHIVE_MORE_FILTERS,
  /* Both entities in one set; the Type chip picks between them. The live
     screen runs two queries and this runs one filter, which is the same thing
     from the operator's side and a great deal less machinery on this one. */
  rows: LISTING_ARCHIVE_ROWS_ARTICLE.concat(LISTING_ARCHIVE_ROWS_MEDIA),
  /* Rows and the pencil key on the item code, and the noun is what a screen
     reader announces: "Edit archived item 5361". Orders' default noun would
     have announced "Edit order 5361" here. */
  rowKey: 'itemId',
  routeNoun: 'archived-item',   // the URL slug
  rowNoun: 'archived item',     // what a screen reader says
  /* NO header action. Orders and Articles both carry an Add button; this
     screen cannot — ArchiveManagementDef.cfm declares
     `CMethods = "list,change,viewonly"`, with no `add`. You archive an item
     from the item, never from the archive. */
  headerActions: [],
  /* Title only. Title and Channel are both free text and forcing the pair
     overflows a phone, which is the same measurement that gave Articles its
     1 — see the Articles note in ListingScreen.figma-notes.md. */
  identityColumns: 1,
  /* The live screen has NO page-size control and no paging at all: the query
     is `SELECT TOP 500` and ListForm.cfm renders what it gets. 20 follows the
     two sibling screens rather than the live screen, because the template's
     toolbar has the control either way and 500 unpaged rows is the thing this
     prototype is proposing to replace.
     TODO(backend:Listing) archive-paging: live is TOP 500, unpaged. Its total
     is only counted when exactly 500 come back, and that count reads
     `WHERE ArchivedYN = 1` — which does NOT match the listing's own WHERE, so
     the total silently omits the auto-archived branch. */
  perPage: 20,
  perPageOptions: [10, 20, 50, 100],
  /* PublishStart DESC — the <cfdefaultcase> of the sort switch, on a column
     the screen does not show. */
  sort: { by: 'PublishStart', dir: 'desc' }
};
