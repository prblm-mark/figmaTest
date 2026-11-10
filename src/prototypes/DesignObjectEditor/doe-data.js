/* Design Object Editor prototype: mock data.
 * Mirrors "2018 Simple DO" (DesignObjectCode 99) on lion.comrzdev.com as read on 2026-11-09:
 * same rows, cell names, element types and DCC ids. Spans are illustrative only (the live
 * editor shows every cell full-width, so it never says how a row actually lays out).
 * TODO(backend:DesignObjectEditor): static tree → GET design object (rows/cells/DCC/type/status). */
window.DOE_DATA = (function () {
  /* The 41 Design Element types from the live "Cell Content" radio list, grouped and iconed. */
  var CATEGORIES = [
    { id: 'content', label: 'Content', items: [
      ['Prime Content', 'file-text', 'The main item for the page'],
      ['Text', 'type', 'Rich text block'],
      ['Text & Image', 'letter-text', 'Text alongside an image'],
      ['Image', 'image', 'A single image'],
      ['Button', 'rectangle-horizontal', 'Link styled as a button'],
      ['News', 'newspaper', 'Latest news feed']
    ] },
    { id: 'listings', label: 'Listings', items: [
      ['Article Listing', 'list', 'Articles from channels or sections'],
      ['Channel Listing', 'layout-list', 'A list of channels'],
      ['Contact Listing', 'contact', 'People and profiles'],
      ['Event Listing', 'calendar-days', 'Upcoming events'],
      ['Job Listing', 'briefcase', 'Job vacancies'],
      ['Media Listing', 'clapperboard', 'Video, audio and galleries'],
      ['Converting Articles Listing', 'target', 'Articles that convert best']
    ] },
    { id: 'carousels', label: 'Carousels & scrollers', items: [
      ['Article Carousel', 'gallery-horizontal-end', 'Sliding article cards'],
      ['Media Carousel', 'images', 'Sliding media cards'],
      ['Feature Scroller', 'gallery-thumbnails', 'Large featured slides'],
      ['Article Feature Scroller', 'gallery-horizontal', 'Featured article slides'],
      ['Section Feature Scroller', 'panels-top-left', 'Featured section slides'],
      ['Prime Related Carousel', 'file-stack', 'Items related to the page item']
    ] },
    { id: 'related', label: 'Related & highlights', items: [
      ['Topic Related Content', 'tags', 'Items sharing a topic'],
      ['Manually Related Content', 'link', 'Hand-picked related items'],
      ['Contact/Account Related', 'users', 'Items for a contact or account'],
      ['Article Highlights', 'highlighter', 'Smart article highlights'],
      ['Edition Highlights', 'book-marked', 'Highlights from an edition']
    ] },
    { id: 'navigation', label: 'Navigation & search', items: [
      ['Menu', 'menu', 'A site menu'],
      ['Blog Navigation', 'book-open', 'Archive and category links'],
      ['Channel/Section Details', 'panel-top', 'Title and intro for the channel'],
      ['Search', 'search', 'Site search box'],
      ['Recruitment Search', 'user-search', 'Search jobs']
    ] },
    { id: 'members', label: 'Forms & membership', items: [
      ['Login', 'log-in', 'Sign-in box'],
      ['Dynamic Form', 'clipboard-pen-line', 'A form built in Forms'],
      ['Online Form', 'clipboard-list', 'A classic online form'],
      ['Mailing List', 'mail-plus', 'Newsletter sign-up'],
      ['Content Subscriptions', 'bell-ring', 'Follow topics and sections'],
      ['Levels', 'award', 'Membership levels'],
      ['Rewards', 'gift', 'Points and rewards'],
      ['On Page Feedback', 'message-square-heart', 'Was this page useful?']
    ] },
    { id: 'commerce', label: 'Commerce & targeting', items: [
      ['Shopping Basket', 'shopping-basket', 'Basket summary'],
      ['Currency Selector', 'badge-pound-sterling', 'Switch display currency'],
      ['Campaign Placement Area', 'megaphone', 'Ad and campaign slot'],
      ['Geo Targeting', 'map-pin', 'Show by visitor location']
    ] }
  ];

  var ELEMENTS = {};
  CATEGORIES.forEach(function (c) {
    c.items.forEach(function (i) { ELEMENTS[i[0]] = { name: i[0], icon: i[1], desc: i[2], cat: c.id }; });
  });

  /* kind: de = design element, do = nested design object, script = design script, empty */
  function cell(id, name, kind, type, dcc, span, extra) {
    var c = { id: id, name: name, kind: kind, type: type, dcc: dcc, span: span };
    for (var k in extra || {}) c[k] = extra[k];
    return c;
  }

  var HEADER_DO = {
    name: '2016 RB Navigation',
    usedIn: 14,
    rows: [
      { id: 'n1', name: 'Row 1', cells: [
        cell('n-logo', 'Logo', 'de', 'Image', 1022, 3),
        cell('n-menu', 'Main Menu', 'de', 'Menu', 1023, 5),
        cell('n-search', 'Search', 'de', 'Search', 1024, 2),
        cell('n-login', 'Sign in', 'de', 'Login', 1025, 2)
      ] },
      { id: 'n2', name: 'Row 2', cells: [
        cell('n-strap', 'Section strap', 'de', 'Menu', 1031, 12)
      ] }
    ]
  };

  var ROWS = [
    { id: 'r1', name: 'Row 1', wrap: false, cells: [
      cell('c-header', 'Header', 'do', '2016 RB Navigation', 2092, 12, { nested: HEADER_DO })
    ] },
    { id: 'r2', name: 'Row 2', cells: [
      cell('c-channel', 'Channel Details', 'de', 'Channel/Section Details', 4153, 12)
    ] },
    { id: 'r3', name: 'Row 3', wrap: true, cells: [
      cell('c-prime', 'Prime Content', 'de', 'Prime Content', 2079, 8, { incomplete: true }),
      cell('c-al', 'AL DE', 'de', 'Article Listing', 3663, 4),
      cell('c-contacts', 'Contacts', 'de', 'Contact Listing', 4169, 4),
      cell('c-el', 'EL DE', 'de', 'Event Listing', 3637, 4),
      cell('c-artcar', 'Article Carousel', 'de', 'Article Carousel', 3201, 4),
      cell('c-medcar', 'Media Carousel', 'de', 'Article Carousel', 4156, 12)
    ] },
    { id: 'r4', name: 'Row 4', wrap: true, cells: [
      cell('c-topic', 'Topic related Content', 'de', 'Topic Related Content', 4085, 6),
      cell('c-topicmz', 'Topic related Content Multi Zone', 'de', 'Topic Related Content', 3870, 6, { hiddenAt: ['480px', '600px'] }),
      cell('c-textimg', 'Text & Image', 'de', 'Text & Image', 3409, 4),
      cell('c-edition', 'Edition Highlights', 'de', 'Edition Highlights', 3447, 4),
      cell('c-convert', 'Converting Articles', 'de', 'Converting Articles Listing', 3425, 4)
    ] },
    { id: 'r5', name: 'Row 5', cells: [
      cell('c-media', 'Media Listing DE', 'de', 'Media Listing', 2432, 8),
      cell('c-script', 'Design Script', 'script', 'Promo strip script', 4248, 4)
    ] },
    { id: 'r6', name: 'Row 6', wrap: true, cells: [
      cell('c-sfs', 'Section Feature Scroller', 'de', 'Section Feature Scroller', 2843, 12),
      cell('c-prc', 'Prime related carousel', 'de', 'Prime Related Carousel', 3439, 6),
      cell('c-smart', 'Smart HL Article', 'de', 'Article Highlights', 2406, 6),
      cell('c-manual', 'Manually Related Content', 'de', 'Manually Related Content', 2634, 3),
      cell('c-rewards', 'Rewards', 'de', 'Rewards', 3871, 3),
      cell('c-mail', 'Mailing list', 'de', 'Mailing List', 3932, 3),
      cell('c-subs', 'Content Subs', 'de', 'Content Subscriptions', 4050, 3)
    ] },
    { id: 'r7', name: 'Row 7', cells: [
      cell('c-footer', 'FOOTER MENU', 'do', '2016 Footer', 2138, 12, { usedIn: 22 })
    ] }
  ];

  var DESIGN_OBJECTS = [
    ['2016 RB Navigation', 14], ['2016 Footer', 22], ['Newsletter promo', 6], ['Article sidebar', 9],
    ['Event detail header', 3], ['Two-column landing', 4]
  ];
  var SCRIPTS = [['Promo strip script', 'Updated 3 days ago'], ['Cookie banner', 'Updated 2 months ago'],
    ['GA4 events', 'Updated 5 months ago'], ['Sponsor logos', 'Updated 1 year ago']];

  return { CATEGORIES: CATEGORIES, ELEMENTS: ELEMENTS, ROWS: ROWS, DESIGN_OBJECTS: DESIGN_OBJECTS, SCRIPTS: SCRIPTS,
    BREAKPOINTS: [
      { id: 'fluid', label: 'Fluid', icon: 'monitor', width: null },
      { id: '1200', label: '1200px', icon: 'laptop', width: 1200 },
      { id: '1024', label: '1024px', icon: 'tablet', width: 1024, rotate: true },
      { id: '800', label: '800px', icon: 'tablet', width: 800 },
      { id: '600', label: '600px', icon: 'smartphone', width: 600, rotate: true },
      { id: '480', label: '480px', icon: 'smartphone', width: 480 }
    ] };
})();
