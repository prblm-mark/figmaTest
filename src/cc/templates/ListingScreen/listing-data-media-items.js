/* Media Items — the fourth screen on the Listing template.
 *
 * Adding a listing screen means adding a config. This one also adds two CELL
 * renderers and their CSS, because it is the first screen with a THUMBNAIL and
 * the first whose Type column is a glyph rather than text — see the notes at
 * the bottom of ListingScreen.figma-notes.md.
 *
 * ── PROVENANCE ────────────────────────────────────────────────
 * Read from the live screen on 2026-09-22. /control/media-items is
 * ControlProfileCode 461, under Media, security code 94, template
 * /AfcMediaLibrary/CC/MediaItems.cfm. Like Article Archive and unlike
 * Articles it is NOT a "cc2" screen — `ResponsiveTemplatePath` is empty — and
 * unlike either of them it does not use the generic ControlSearch module
 * either: it hand-rolls its own three-row search form. Two files, read
 * directly:
 *
 *   /AfcMediaLibrary/CC/MediaItems.cfm  → the search form (the filter catalogue)
 *   /AfcMediaLibrary/CC/MediaInbox.cfm  → the Listing layout's CProperties,
 *                                         CMethods, paging and sort
 *
 * WHAT IS REAL: the six columns and their order (including the blank-headed
 * thumbnail), all sixteen filters with their control types and option lists,
 * the Media Type groupings, the three MediaTemplate styles, the page sizes,
 * the absence of header sorting, the default order, and all 50 rows below —
 * names, sections, creators, created dates, mimetypes and item codes, as read
 * from AffinoComrz (96,493 media items).
 *
 * WHAT IS NOT REAL: the thumbnail IMAGES. The live screen builds them from
 * MediaItem.ImageThumb through an internal DAM path (`../AcuCustom/Sitename/
 * DAM/<n>/`) and no read available here returns a usable URL, so the box is a
 * generated placeholder. Everything about the box — its size, its aspect, its
 * position, what it does when the table narrows — is real; only the picture is
 * missing. Also invented: the Topics option list is the first twenty of 437
 * real taxonomy categories, and no row is tagged with any of them.
 */

/* Columns in CProperties order, which is also priority order.
 *
 * SORTING: `variables.headerSort = ""` — this screen has NO header sorting at
 * all, which is the third different answer from four screens (Orders
 * whitelists seven, Articles has no whitelist and sorts on anything, Article
 * Archive whitelists seven, Media Items sorts on nothing). So not one column
 * here carries a `sort` token, and that is fidelity rather than an omission.
 * The order is fixed at PublishStart DESC, passed to GetMediaItems as
 * `sOrderBy`. PublishStart is not one of the six columns, so — exactly as on
 * Article Archive — the screen opens on an order no header can claim. */
var LISTING_MEDIA_COLUMNS = [
  { key: 'select',    type: 'select', label: '',            hug: true },
  /* Header deliberately BLANK: CProperties[1][2] is an empty string. The live
     screen renders the thumbnail under no heading at all. */
  { key: 'thumb',     type: 'thumb',  label: '',            hug: true, cellClass: 'datatables__col--thumb' },
  { key: 'title',     type: 'text',   label: 'Title',       truncate: true, cellClass: 'datatables__article-title', link: true },
  { key: 'format',    type: 'media',  label: 'Type',        snug: true },
  { key: 'section',   type: 'chip',   label: 'Section',     snug: true },
  { key: 'createdBy', type: 'text',   label: 'Created By',  snug: true },
  { key: 'created',   type: 'text',   label: 'Created',     hug: true },
  /* Not one of the six. The row and pencil routes key on it — `uidCodes` is
     MediaItemCode — and the live Title search matches it directly when the
     term is numeric, so it earns a column of its own. */
  { key: 'itemId',    type: 'text',   label: 'Item ID',     hug: true },
  { key: 'edit',      type: 'edit',   label: '',            hug: true },
  { key: 'kebab',     type: 'kebab',  label: '',            hug: true }
];

/* ── The filter catalogue, in form order ──────────────────────
 *
 * Sixteen controls across three rows of the live search form, plus the Search
 * submit. Row 1: Title, Zone, Channel, Section, Style, My Media. Row 2: Type,
 * Show Original Image, Archive Content, Live, Outdated, Media Per Screen.
 * Row 3: Creator, Created Dates (Range), Topics, Layout.
 *
 * The five chips are the first five in that order — Title, Zone, Channel,
 * Section, Style — which is the house rule landing on a clean boundary again:
 * they are exactly row 1 minus its trailing checkbox.
 *
 * TWO of the sixteen are not filters and do not appear in More Filters:
 *   - `Media Per Screen` (LimitBy) is the page-size control the toolbar
 *     already carries. Same call as Articles' Articles Per Screen.
 *   - `Layout` (MediaLayOut) is the Grid/Listing view switch. This build is
 *     the LISTING half; the Grid half is the next screen, so shipping a chip
 *     that swaps to a view that does not exist yet would be a dead control.
 *     Note the live default is GRID, not Listing — the URL this was built from
 *     forces `MediaLayOut=Listing`.
 *     TODO(backend:Listing) media-layout-switch: the Grid view is not built. */

/* Real: the five Media Type groups, and the mimetype codes each one maps to
   are in MediaInbox.cfm's <cfswitch> — Image 4,5,14,44,50; Video 2,8,11,18,
   20,21,22,24,25,26,27,30,37,41,48; Audio 9,13,19,23; Document 15,16,17,29,
   33,34,40,42,45,46,47,49. That grouping is why the Type column can show four
   family glyphs without inventing a taxonomy. */
var MEDIA_TYPES  = ['All', 'Image', 'Video', 'Audio', 'Document'];
/* Real: every MediaTemplate row on this instance. THREE, against 63
   StandardTemplates on the article side — which is why Style is a plain
   select here where Articles needed more. */
var MEDIA_STYLES = ['Media Default Presentation Style', 'Video Presentation Style', 'Podcast Presentation Style'];
/* Real: all seven Zone rows on this instance. */
var MEDIA_ZONES  = ['Affino', 'Cookie Armageddon', 'Events', 'Funding', 'Intranet', 'Jobs', 'Video Store'];
/* Real: the live Live select is `<option value="">All</option>` plus a
   two-item array, so its values are 1 and 2 against these labels. */
var MEDIA_LIVE   = ['Live', 'Non-Live'];
/* Real section names, with the media-item count in the 50 rows below. Media
   lives overwhelmingly in per-client forum buckets rather than editorial
   sections, which is what the counts show and why this is a table picker. */
var MEDIA_SECTIONS = [
  { name: 'Affino Forum Media',             count: '18' },
  { name: 'CRM AgriCommodities Forum Media', count: '5' },
  { name: 'The Stage Forum Media',          count: '5' },
  { name: 'Charity Digital Forum Media',    count: '3' },
  { name: 'The Payment Fintech Club',       count: '3' },
  { name: 'Green Star Media Forum Media',   count: '3' },
  { name: 'Contracts',                      count: '2' },
  { name: 'Wyvex forum media',              count: '2' },
  { name: 'The Bookseller Forum Media',     count: '2' },
  { name: 'Athene Forum Media',             count: '1' }
];
/* Real channel names from AffinoComrz. The live control is a lookup modal for
   the same reason Section is — there are more than 200. */
var MEDIA_CHANNELS = [
  { name: 'Affino Media',    count: '18' },
  { name: 'Members',         count: '9' },
  { name: 'Support',         count: '7' },
  { name: 'Store',           count: '6' },
  { name: 'Media',           count: '5' },
  { name: 'Industries',      count: '3' },
  { name: 'About',           count: '2' }
];
/* REAL people — every creator of the 50 rows below. */
var MEDIA_CREATORS = ['Alexandra Lima', 'Laura Fanni', 'Laura Stanley', 'Kevin Barrow', 'Simon Hassell',
                      'James Bolesworth', 'James Corcoran', 'Maria Mellor', 'Janice Johnston',
                      'Zachariah Markusson', 'Denise Rattray', 'Susan Kerrigan', 'Jose Claramunt',
                      'Quang Luong', 'Luis Montiel', 'Markus Karlsson', 'Julius Metyko', 'Mark Foster',
                      'Erika Simpson'];
/* REAL names, the first twenty of 437 taxonomy categories. The live control is
   a webOS multi-select lookup; at 437 a flat checkbox list is the wrong widget,
   so this is the table picker — the same call Articles' Section got, for the
   same reason. No row below is tagged, so the facet filters to nothing: it is
   here because it is in the catalogue, not because the mock data exercises it.
   TODO(backend:Listing) media-topics: no row carries topic tags. */
var MEDIA_TOPICS = ['A to Z', 'Access', 'Accessibility', 'Action', 'Actionable Intelligence',
                    'Ad Blocking', 'Ad Serving', 'Address', 'Admin', 'Administration',
                    'Affiliate Commerce', 'Affino', 'Affino 9 Product', 'Affino 9 Projects',
                    'Affino Brand Design', 'Affino Design', 'Affino Elements',
                    'Affino Featured Client', 'Affino Features', 'Affino Help'];

function mediaOpts(names) {
  return names.map(function (n) { return { name: n }; });
}

var LISTING_MEDIA_FILTERS = [
  /* 1. Title — a text box, FieldName Title.
     Matched against THREE things by the live query, not one:
       MediaItem.Name LIKE %term%
       OR MediaFileItem.FileName LIKE %term%
       OR MediaItemCode = term          (when the term is numeric)
     The filename is the one that matters — a media library is full of items
     whose display name has been tidied ("Screenshot 2023 09 01 at 11.15.17")
     while the file underneath still carries the original. Searching only the
     visible title would silently miss it, so this uses the template's fixed
     multi-field form: `scopeFields` with no `scopedBy`. */
  { name: 'Title', type: 'text', field: 'title',
    label: 'Filter by Title', placeholder: 'Name, filename or item ID',
    scopeFields: { Name: 'title', FileName: 'fileName', Code: 'itemId' } },

  /* 2. Zone — a select, "Any" plus the zone rows. */
  { name: 'Zone', type: 'select-options', field: 'zone',
    label: 'Filter by Zone', placeholder: 'Any', options: mediaOpts(MEDIA_ZONES) },

  /* 3. Channel — live opens a lookup modal (readonly field + hidden
     ChannelCode). A table picker here, same as Section: 200+ channels is past
     the size where a flat list is readable, and the count is what separates
     two similar names. */
  { name: 'Channel', type: 'multi-select-table', field: 'channel',
    label: 'Filter by Channel',
    facets: [{ name: 'Name', type: 'text', field: 'name', placeholder: 'Search by name' }],
    tableColumns: ['Channel', 'Items'],
    tableFields: ['count'],
    tableColClasses: ['datatables__col--name', 'datatables__col--date'],
    sortable: ['Channel', 'Items'],
    options: MEDIA_CHANNELS },

  /* 4. Section — the other lookup modal, and 647 sections on this instance. */
  { name: 'Section', type: 'multi-select-table', field: 'section',
    label: 'Filter by Section',
    facets: [{ name: 'Name', type: 'text', field: 'name', placeholder: 'Search by name' }],
    tableColumns: ['Section', 'Items'],
    tableFields: ['count'],
    tableColClasses: ['datatables__col--name', 'datatables__col--date'],
    sortable: ['Section', 'Items'],
    options: MEDIA_SECTIONS },

  /* 5. Style — MediaTemplateCode, "Any" plus the templates. Three of them, so
     a plain select is right where the article side needed something bigger. */
  { name: 'Style', type: 'select-options', field: 'style',
    label: 'Filter by Presentation Style', placeholder: 'Any', options: mediaOpts(MEDIA_STYLES) }
];

/* The rest of the catalogue. The panel sorts itself alphabetically. */
var LISTING_MEDIA_MORE_FILTERS = [
  /* Row 1's trailing checkbox. */
  { name: 'My Media', type: 'checkbox', mode: 'only', field: 'myMedia',
    label: 'My Media', checkboxLabel: 'Only media I uploaded' },

  /* Row 2. */
  { name: 'Type', type: 'select-options', field: 'family',
    label: 'Filter by Type', placeholder: 'All',
    /* The live select's first option is literally "All", not a blank — so the
       chip's placeholder carries it and the values are the four families
       behind it; picking All is clearing the chip. */
    options: mediaOpts(MEDIA_TYPES.slice(1)) },
  { name: 'Show Original Image', type: 'checkbox', mode: 'only', field: 'hasOriginal',
    label: 'Show Original Image',
    /* TASK-171948, named in the source: items that kept their original
       alongside the WebP master. */
    checkboxLabel: 'Only items keeping an original beside the WebP master' },
  { name: 'Archive Content', type: 'checkbox', mode: 'include', field: 'archived',
    label: 'Archive Content', checkboxLabel: 'Include archived content' },
  { name: 'Live', type: 'select-options', field: 'live',
    label: 'Filter by Live', placeholder: 'All', options: mediaOpts(MEDIA_LIVE) },
  { name: 'Outdated', type: 'checkbox', mode: 'only', field: 'outdated',
    label: 'Outdated', checkboxLabel: 'Only items past their publish end' },

  /* Row 3. */
  { name: 'Creator', type: 'multi-select', field: 'createdBy',
    label: 'Filter by Creator', options: mediaOpts(MEDIA_CREATORS) },
  { name: 'Created Dates', type: 'date-range', field: 'created',
    label: 'Filter by Created date' },
  { name: 'Topics', type: 'multi-select-table', field: 'topics',
    label: 'Filter by Topic',
    facets: [{ name: 'Name', type: 'text', field: 'name', placeholder: 'Search by name' }],
    tableColumns: ['Topic'],
    tableFields: [],
    tableColClasses: ['datatables__col--name'],
    sortable: ['Topic'],
    options: mediaOpts(MEDIA_TOPICS) }
];

/* 50 REAL media items, read from AffinoComrz on 2026-09-22 (96,493 total).
 * Names, filenames, item codes, sections, creators, created dates and
 * mimetypes are the live values. `family` and `format` are derived from the
 * mimetype by the same grouping MediaInbox.cfm's <cfswitch> uses.
 *
 * Worth reading before the tidy ones. This is what a real media library looks
 * like and a prototype that only ever shows well-named assets misrepresents
 * the screen the thumbnail column exists for:
 *   - The names are machine-generated. "Screenshot 2023-09-01 at 09-16-05 My
 *     second article dolor sit amet" is one title; another is "Screenshotfrom
 *     2026 09 1513 51 38". The Title column is the one that has to take it.
 *   - Twelve of the fifty are near-duplicate screenshots taken minutes apart,
 *     which is the case the thumbnail is there to disambiguate and the one a
 *     placeholder cannot.
 *   - Publish End is publish start plus TEN YEARS on most rows and plus a
 *     HUNDRED on the PDFs, so "Outdated" almost never fires.
 *   - Two sections hold more than half the rows.
 */
var LISTING_MEDIA_ROWS = [
  { itemId: '130167', title: 'Screen Recording 2026 09 21 at 14', fileName: 'ScreenRecording2026-09-21at14.mp4', family: 'video', thumbUrl: 'https://picsum.photos/seed/media130167/128', format: 'MP4', section: 'Athene Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Video Presentation Style', createdBy: 'Alexandra Lima', created: '2026-09-21', live: 'Live' },
  { itemId: '130166', title: 'StripeUS', fileName: 'StripeUS.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130166/128', format: 'WebP', section: 'The Payment Fintech Club', channel: 'Members', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Laura Fanni', created: '2026-09-21', live: 'Live' },
  { itemId: '130165', title: 'StripeUK', fileName: 'StripeUK.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130165/128', format: 'WebP', section: 'The Payment Fintech Club', channel: 'Members', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Laura Fanni', created: '2026-09-21', live: 'Live' },
  { itemId: '130164', title: 'image3', fileName: 'image3.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130164/128', format: 'WebP', section: 'Charity Digital Forum Media', channel: 'Members', zone: 'Cookie Armageddon', style: 'Media Default Presentation Style', createdBy: 'Laura Stanley', created: '2026-09-21', live: 'Live' },
  { itemId: '130163', title: 'Screenshot 18 9 2026 162747 elitesoccercoaching.net', fileName: 'Screenshot_18-9-2026_162747_elitesoccercoaching.net.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130163/128', format: 'WebP', section: 'Green Star Media Forum Media', channel: 'Support', zone: 'Events', style: 'Media Default Presentation Style', createdBy: 'Kevin Barrow', created: '2026-09-18', live: 'Live' },
  { itemId: '130162', title: 'Screenshot 18 9 2026 162732 elitesoccercoaching.net', fileName: 'Screenshot_18-9-2026_162732_elitesoccercoaching.net.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130162/128', format: 'WebP', section: 'Green Star Media Forum Media', channel: 'Support', zone: 'Events', style: 'Media Default Presentation Style', createdBy: 'Kevin Barrow', created: '2026-09-18', live: 'Live' },
  { itemId: '130161', title: 'Screenshot 18 9 2026 162739 elitesoccercoaching.net', fileName: 'Screenshot_18-9-2026_162739_elitesoccercoaching.net.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130161/128', format: 'WebP', section: 'Green Star Media Forum Media', channel: 'Support', zone: 'Events', style: 'Media Default Presentation Style', createdBy: 'Kevin Barrow', created: '2026-09-18', live: 'Live' },
  { itemId: '130160', title: 'People Project', fileName: 'PeopleProject.zip', family: 'document', format: 'ZIP', section: 'The Stage Forum Media', channel: 'Support', zone: 'Funding', style: 'Media Default Presentation Style', createdBy: 'Simon Hassell', created: '2026-09-18', live: 'Live' },
  { itemId: '130159', title: 'People Project brief', fileName: 'PeopleProjectbrief.pdf', family: 'document', format: 'PDF', section: 'The Stage Forum Media', channel: 'Support', zone: 'Funding', style: 'Media Default Presentation Style', createdBy: 'Simon Hassell', created: '2026-09-18', live: 'Live' },
  { itemId: '130158', title: 'Screenshot2026 09 17091959', fileName: 'Screenshot2026-09-17091959.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130158/128', format: 'WebP', section: 'CRM AgriCommodities Forum Media', channel: 'Members', zone: 'Intranet', style: 'Media Default Presentation Style', createdBy: 'James Bolesworth', created: '2026-09-17', live: 'Live' },
  { itemId: '130157', title: 'Screenshot2026 09 17085914', fileName: 'Screenshot2026-09-17085914.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130157/128', format: 'WebP', section: 'Charity Digital Forum Media', channel: 'Members', zone: 'Cookie Armageddon', style: 'Media Default Presentation Style', createdBy: 'James Corcoran', created: '2026-09-17', live: 'Live' },
  { itemId: '130156', title: 'Screenshot2026 09 16161248', fileName: 'Screenshot2026-09-16161248.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130156/128', format: 'WebP', section: 'CRM AgriCommodities Forum Media', channel: 'Members', zone: 'Intranet', style: 'Media Default Presentation Style', createdBy: 'James Bolesworth', created: '2026-09-16', live: 'Live' },
  { itemId: '130155', title: 'Screenshot2026 09 16161236', fileName: 'Screenshot2026-09-16161236.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130155/128', format: 'WebP', section: 'CRM AgriCommodities Forum Media', channel: 'Members', zone: 'Intranet', style: 'Media Default Presentation Style', createdBy: 'James Bolesworth', created: '2026-09-16', live: 'Live' },
  { itemId: '130154', title: 'Screenshot2026 09 16143300', fileName: 'Screenshot2026-09-16143300.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130154/128', format: 'WebP', section: 'The Payment Fintech Club', channel: 'Members', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Laura Fanni', created: '2026-09-16', live: 'Live' },
  { itemId: '130153', title: 'Screenshotfrom2026 09 1612 04 21', fileName: 'Screenshotfrom2026-09-1612-04-21.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130153/128', format: 'WebP', section: 'The Stage Forum Media', channel: 'Support', zone: 'Funding', style: 'Media Default Presentation Style', createdBy: 'Zachariah Markusson', created: '2026-09-16', live: 'Live' },
  { itemId: '130152', title: 'Screenshot2026 09 16091012', fileName: 'Screenshot2026-09-16091012.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130152/128', format: 'WebP', section: 'CRM AgriCommodities Forum Media', channel: 'Members', zone: 'Intranet', style: 'Media Default Presentation Style', createdBy: 'James Bolesworth', created: '2026-09-16', live: 'Live' },
  { itemId: '130151', title: 'Screenshot2026 09 15173234', fileName: 'Screenshot2026-09-15173234.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130151/128', format: 'WebP', section: 'CRM AgriCommodities Forum Media', channel: 'Members', zone: 'Intranet', style: 'Media Default Presentation Style', createdBy: 'James Bolesworth', created: '2026-09-15', live: 'Live' },
  { itemId: '130150', title: 'Screenshot2026 09 15at16.28.54', fileName: 'Screenshot2026-09-15at16.28.54.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130150/128', format: 'WebP', section: 'Jacobs Media Forum Media Library', channel: 'Media', zone: 'Jobs', style: 'Media Default Presentation Style', createdBy: 'Maria Mellor', created: '2026-09-15', live: 'Live' },
  { itemId: '130149', title: 'Screenshot2026 09 15142029', fileName: 'Screenshot2026-09-15142029.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130149/128', format: 'WebP', section: 'Wyvex forum media', channel: 'Media', zone: 'Jobs', style: 'Media Default Presentation Style', createdBy: 'Janice Johnston', created: '2026-09-15', live: 'Live' },
  { itemId: '130148', title: 'Screenshot2026 09 15141611', fileName: 'Screenshot2026-09-15141611.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130148/128', format: 'WebP', section: 'Wyvex forum media', channel: 'Media', zone: 'Jobs', style: 'Media Default Presentation Style', createdBy: 'Janice Johnston', created: '2026-09-15', live: 'Live' },
  { itemId: '130147', title: 'Screenshot2026 09 15141311', fileName: 'Screenshot2026-09-15141311.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130147/128', format: 'WebP', section: 'Charity Digital Forum Media', channel: 'Members', zone: 'Cookie Armageddon', style: 'Media Default Presentation Style', createdBy: 'James Corcoran', created: '2026-09-15', live: 'Live' },
  { itemId: '130146', title: 'Screenshotfrom2026 09 1513 51 38', fileName: 'Screenshotfrom2026-09-1513-51-38.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130146/128', format: 'WebP', section: 'The Stage Forum Media', channel: 'Support', zone: 'Funding', style: 'Media Default Presentation Style', createdBy: 'Zachariah Markusson', created: '2026-09-15', live: 'Live' },
  { itemId: '130143', title: 'category topic withintopics', fileName: 'category-topic-withintopics.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130143/128', format: 'WebP', section: 'OMG Forum Media', channel: 'Members', zone: 'Video Store', style: 'Media Default Presentation Style', createdBy: 'Denise Rattray', created: '2026-09-15', live: 'Live' },
  { itemId: '130142', title: 'tbs2', fileName: 'tbs2.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130142/128', format: 'WebP', section: 'The Bookseller Forum Media', channel: 'Store', zone: 'Video Store', style: 'Media Default Presentation Style', createdBy: 'Susan Kerrigan', created: '2026-09-14', live: 'Live' },
  { itemId: '130141', title: 'tbs1', fileName: 'tbs1.webp', family: 'image', thumbUrl: 'https://picsum.photos/seed/media130141/128', format: 'WebP', section: 'The Bookseller Forum Media', channel: 'Store', zone: 'Video Store', style: 'Media Default Presentation Style', createdBy: 'Susan Kerrigan', created: '2026-09-14', live: 'Live' },
  { itemId: '113092', title: 'bandicam 2023-09-01 16-36-38-665 - Trim', fileName: 'bandicam2023-09-0116-36-38-665-Trim.mp4', family: 'video', thumbUrl: 'https://picsum.photos/seed/media113092/128', format: 'MP4', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Video Presentation Style', createdBy: 'Jose Claramunt', created: '2023-09-01', live: 'Live' },
  { itemId: '113091', title: 'Screenshot 2023-09-01 at 15.48.23', fileName: 'Screenshot2023-09-01at15.48.23.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113091/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Quang Luong', created: '2023-09-01', live: 'Live' },
  { itemId: '113090', title: 'Screenshot 2023-09-01 at 14-55-26 Recruitment', fileName: 'Screenshot2023-09-01at14-55-26Recruitment.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113090/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' },
  { itemId: '113089', title: 'Screenshot 2023-09-01 at 15-08-55 Recruitment', fileName: 'Screenshot2023-09-01at15-08-55Recruitment.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113089/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' },
  { itemId: '113088', title: 'Screenshot 2023-09-01 at 15-30-24 Recruitment', fileName: 'Screenshot2023-09-01at15-30-24Recruitment.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113088/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' },
  { itemId: '113087', title: 'Screenshot 2023-09-01 at 14-45-05 Noticeboard Manager Demo', fileName: 'Screenshot2023-09-01at14-45-05NoticeboardManagerDemo.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113087/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' },
  { itemId: '113086', title: 'Screenshot 2023-09-01 at 14-45-24 Noticeboard Manager Demo', fileName: 'Screenshot2023-09-01at14-45-24NoticeboardManagerDemo.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113086/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' },
  { itemId: '113085', title: 'The Stage Affino 64 GB Data Service Proposal Sep 2023 v2', fileName: 'TheStageAffino64GBDataServiceProposalSep2023v2.pdf', family: 'document', format: 'PDF', section: 'Contracts', channel: 'About', zone: 'Funding', style: 'Media Default Presentation Style', createdBy: 'Markus Karlsson', created: '2023-09-01', live: 'Live' },
  { itemId: '113084', title: 'Screenshot 2023-09-01 at 13-08-20 Sponsored Directory', fileName: 'Screenshot2023-09-01at13-08-20SponsoredDirectory.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113084/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' },
  { itemId: '113083', title: 'Screenshot 2023-09-01 at 13-08-48 Online Directory', fileName: 'Screenshot2023-09-01at13-08-48OnlineDirectory.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113083/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' },
  { itemId: '113082', title: 'Screenshot 2023-09-01 at 13-09-05 Advanced Directory', fileName: 'Screenshot2023-09-01at13-09-05AdvancedDirectory.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113082/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' },
  { itemId: '113081', title: 'Screenshot 2023-09-01 at 11-33-13 Design Style Edit - Default DS', fileName: 'Screenshot2023-09-01at11-33-13DesignStyleEdit-DefaultDS.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113081/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' },
  { itemId: '113080', title: 'Screenshot 2023-09-01 at 11.27.58', fileName: 'Screenshot2023-09-01at11.27.58.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113080/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Julius Metyko', created: '2023-09-01', live: 'Live' },
  { itemId: '113079', title: 'Screenshot 2023-09-01 at 11.26.03', fileName: 'Screenshot2023-09-01at11.26.03.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113079/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Mark Foster', created: '2023-09-01', live: 'Live' },
  { itemId: '113078', title: 'BASD Affino Service Renewal Proposal Sep v2', fileName: 'BASDAffinoServiceRenewalProposalSepv2.pdf', family: 'document', format: 'PDF', section: 'Contracts', channel: 'About', zone: 'Funding', style: 'Media Default Presentation Style', createdBy: 'Markus Karlsson', created: '2023-09-01', live: 'Live' },
  { itemId: '113077', title: 'Screenshot 2023-09-01 at 11.15.17', fileName: 'Screenshot2023-09-01at11.15.17.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113077/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Quang Luong', created: '2023-09-01', live: 'Live' },
  { itemId: '113076', title: 'Screenshot 2023-09-01 at 10.31.24', fileName: 'Screenshot2023-09-01at10.31.24.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113076/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Quang Luong', created: '2023-09-01', live: 'Live' },
  { itemId: '113075', title: 'Banner correct', fileName: 'Bannercorrect.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113075/128', format: 'PNG', section: 'The Stage Forum Media', channel: 'Support', zone: 'Funding', style: 'Media Default Presentation Style', createdBy: 'Erika Simpson', created: '2023-09-01', live: 'Live' },
  { itemId: '113074', title: 'Banner missing', fileName: 'Bannermissing.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113074/128', format: 'PNG', section: 'The Stage Forum Media', channel: 'Support', zone: 'Funding', style: 'Media Default Presentation Style', createdBy: 'Erika Simpson', created: '2023-09-01', live: 'Live' },
  { itemId: '113073', title: '2023-09-01 10 10 39', fileName: '2023-09-01101039.jpg', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113073/128', format: 'JPEG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Jose Claramunt', created: '2023-09-01', live: 'Live' },
  { itemId: '113072', title: '2023-09-01 10 12 47', fileName: '2023-09-01101247.jpg', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113072/128', format: 'JPEG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Jose Claramunt', created: '2023-09-01', live: 'Live' },
  { itemId: '113071', title: 'UserPreferencesExport V2', fileName: 'UserPreferencesExportV2.xlsx', family: 'document', format: 'XLSX', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Jose Claramunt', created: '2023-09-01', live: 'Live' },
  { itemId: '113070', title: '2023-09-01 09 46 47', fileName: '2023-09-01094647.jpg', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113070/128', format: 'JPEG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Jose Claramunt', created: '2023-09-01', live: 'Live' },
  { itemId: '113069', title: '2023-09-01 09 43 48', fileName: '2023-09-01094348.jpg', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113069/128', format: 'JPEG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Jose Claramunt', created: '2023-09-01', live: 'Live' },
  { itemId: '113068', title: 'Screenshot 2023-09-01 at 09-16-05 My second article dolor sit amet', fileName: 'Screenshot2023-09-01at09-16-05Mysecondarticledolorsitamet.png', family: 'image', thumbUrl: 'https://picsum.photos/seed/media113068/128', format: 'PNG', section: 'Affino Forum Media', channel: 'Affino Media', zone: 'Affino', style: 'Media Default Presentation Style', createdBy: 'Luis Montiel', created: '2023-09-01', live: 'Live' }
];

/* TODO(backend:Listing) listing-checkbox-fields: MOCK booleans for the four
 * checkbox filters. The 50 rows above are REAL media items; these flags are
 * not — none of the reads returns them — and the real values are untouched.
 * `hasOriginal` is only ever set on images, since only an image has an
 * original beside its WebP master. */
LISTING_MEDIA_ROWS.forEach(function (row, i) {
  row.myMedia = i % 3 === 0;
  row.hasOriginal = row.family === 'image' && i % 4 === 1;
  row.archived = i % 9 === 4;
  row.outdated = i % 6 === 2;
});

LISTING_SCREENS['media-items'] = {
  title: 'Media Items',
  view: 'All Media Items',
  columns: LISTING_MEDIA_COLUMNS,
  defaultFilters: LISTING_MEDIA_FILTERS,
  moreFilters: LISTING_MEDIA_MORE_FILTERS,
  rows: LISTING_MEDIA_ROWS,
  /* `uidCodes = "MediaItemCode"`, and the noun a screen reader says is two
     words where the URL slug is hyphenated. */
  rowKey: 'itemId',
  routeNoun: 'media-item',
  rowNoun: 'media item',
  /* `CMethods = "add,change,delete,list,view,all,comment,move"` — this screen
     really does add, and MediaInbox.cfm renders its own add button above the
     grid. The widest method set of the four screens built. */
  headerActions: [{ label: 'Add', icon: 'plus', variant: 'primary' }],
  /* ONE, and the reason is worth reading because it is not the reason the
     other screens have one.

     The thumbnail has a BLANK header — CProperties declares it that way — and
     the fit treats a label-less column as STRUCTURE: always drawn, always
     charged to the budget, never dropped. That is exactly right for a
     thumbnail, and it also means the thumbnail is not an identity column at
     all. So `identityColumns` starts counting at Title, and 2 forced Title
     AND Type: measured, that overflowed a 239px table by 207px and pushed the
     kebab off the edge. 1 forces Title alone and Type becomes droppable,
     which is what the narrow widths need. */
  identityColumns: 1,
  /* Both halves of the live MediaLayOut switch. Declaring `layouts` is what
     puts the SegmentedControl in the toolbar; the other three screens have one
     rendering and no control. First entry is the default — live's own default
     is Grid, and the divergence is recorded in the HTML beside the switch. */
  layouts: ['listing', 'grid'],
  /* `variables.directAction = "move,delete"` in MediaLightbox.cfm, and
     CMethods carries both. The live Grid shows these under the thumbnails
     with a Select-all above; here they are the shared selection bar. */
  bulkActions: [
    { type: 'select', label: 'Actions', options: ['Move', 'Delete'] }
  ],
  /* The live LimitBy list, and 25 is its default — the only one of the four
     screens whose page size does not default to 20. */
  perPage: 25,
  perPageOptions: [25, 50, 100, 200, 500],
  /* `sOrderBy = "PublishStart"`, and there is no header sorting to change it.
     PublishStart is not a column, so no header shows as sorted — see the
     columns note above. */
  sort: { by: 'PublishStart', dir: 'desc' }
};
