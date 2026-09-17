/* Listing Screen — data layer
 * ---------------------------------------------------------------
 * The Listing Screen template backs ~400 Control Centre screens. They
 * differ in only two things: which datatable TYPE they render, and
 * which filters are shown by default. Both live here as data, so a new
 * screen is a new config object — not a new template.
 *
 * SHAPE IS THE CONTRACT. The renderer (ListingScreen.js) only ever
 * reads `columns`, `rows` and `page`, so swapping these mock rows for a
 * real /control/orders payload is a data change, not a rebuild. Keep
 * the field names below stable and map the API onto them.
 *
 * TODO(backend:Listing): every value in this file is mock. The real
 * screen is https://www.affino.com/control/orders — see HANDOVER.md.
 *   → GET  /control/orders?view=&filters[]=&sort=&dir=&page=&per_page=
 *          { columns[], rows[], page:{ from,to,total,current,pages } }
 *   → The backend supplies the first 5 filters for the screen; the
 *     `defaultFilters` array below stands in for that.
 */

/* Column config ---------------------------------------------------
 * type      how the cell renders (see ListingScreen.js CELL_RENDERERS)
 * hug       shrink-to-fit column (adds .datatables__col--hug)
 * primary   survives the mobile collapse; everything else moves into
 *           the kebab detail row
 * sortable  renders the sort control in the header
 */
var LISTING_ORDERS_COLUMNS = [
  { key: 'select',      type: 'select', label: '',             hug: true, primary: true },
  { key: 'orderNo',     type: 'text',   label: 'Order No',     hug: true, primary: true, sortable: true, cellClass: 'datatables__order-no', shortLabel: 'Order' },
  { key: 'customer',    type: 'user',   label: 'Customer',                primary: true, sortable: true },
  { key: 'account',     type: 'chip',   label: 'Account',                                sortable: true },
  { key: 'accountCode', type: 'text',   label: 'Account Code',                           sortable: true },
  { key: 'qty',         type: 'text',   label: 'Qty',          hug: true,                sortable: true },
  { key: 'orderTotal',  type: 'text',   label: 'Order Total',                            sortable: true },
  { key: 'edit',        type: 'edit',   label: '',             hug: true, primary: true, mobileOnly: true },
  { key: 'kebab',       type: 'kebab',  label: '',             hug: true, primary: true }
];

/* The five filters the backend surfaces for this screen, in order, followed by
 * the always-present "Add Filters" affordance.
 *
 * `type` names the FilterDropdowns Type each chip opens (designer, 2026-09-17).
 * The renderer maps it to that pattern's markup — see ListingScreen.js
 * FILTER_PANELS. Every Type here is already built in
 * src/patterns/FilterDropdowns/; nothing new was drawn for this screen.
 *
 *   select-options  -> Type=Select Options w/subtext  (3039:5628)
 *   predictive      -> Type=Predictive Text Options   (3039:5625)
 *   multi-select    -> Type=Multi Select              (3039:5629)
 *   text            -> Type=Text                      (3039:5633)
 *
 * TODO(backend:Listing): every option list below is mock. Each is a lookup the
 * backend owns -> GET /control/orders/filters/<name>/options?q= returning
 * [{ value, label, sub? }]. The predictive ones should query on keystroke
 * rather than ship the list up front. */
var LISTING_ORDERS_FILTERS = [
  {
    name: 'Customer', type: 'select-options',
    label: 'Filter by Customer', placeholder: 'Select customer',
    options: [
      { name: 'Maria Mellor',     sub: 'Jacobs Media · 1201' },
      { name: 'David Jacobson',   sub: 'Beckenham FC · 1129' },
      { name: 'Sophia Anderson',  sub: 'The Stage · 902' },
      { name: 'Emma Thompson',    sub: 'The Creative Hub · 1881' },
      { name: 'Michael Thompson', sub: 'Innovate Solutions · 1755' }
    ]
  },
  {
    name: 'User Code', type: 'predictive',
    label: 'Filter by User Code', placeholder: 'Type to search',
    options: [
      { name: 'USR-1201' }, { name: 'USR-1129' }, { name: 'USR-0902' },
      { name: 'USR-1881' }, { name: 'USR-1755' }
    ]
  },
  {
    name: 'Account', type: 'multi-select',
    label: 'Filter by Account',
    options: [
      { name: 'Jacobs Media', checked: true },
      { name: 'Beckenham FC' },
      { name: 'The Stage' },
      { name: 'The Creative Hub', checked: true },
      { name: 'Innovate Solutions' },
      { name: 'Synergy Dynamics' }
    ]
  },
  {
    name: 'Account Code', type: 'predictive',
    label: 'Filter by Account Code', placeholder: 'Type to search',
    options: [
      { name: '1201' }, { name: '1129' }, { name: '902' },
      { name: '1881' }, { name: '1755' }, { name: '749' }
    ]
  },
  {
    name: 'Order No.', type: 'text',
    label: 'Filter by Order No.', placeholder: 'Enter order number'
  }
];

/* The "Add Filters" chip opens FilterDropdowns Type=More Filters (3039:5637):
 * the filters NOT already on the bar, as empty chips. Order-domain facets —
 * the pattern's own demo already ships this exact set. */
var LISTING_ORDERS_MORE_FILTERS = [
  'Order Date', 'Payment Date', 'External Order ID', 'Order Status',
  'Order Method', 'Order Type', 'Sub Order Type', 'Payment Status',
  'Catalogue Item'
];

/* Rows — transcribed from Figma 3648:164786 so the built screen and the
 * design can be compared cell for cell. `customer.initials` renders the
 * letter avatar (Figma row 2); `customer.avatar` renders a photo.
 * `customer.role` is optional — several rows omit it by design. */
var LISTING_ORDERS_ROWS = [
  { orderNo: '100412', customer: { name: 'Maria Mellor',     role: 'Digital Project Manager', avatar: 'https://picsum.photos/seed/female1/96' }, account: 'Jacobs Media',          accountCode: '1201', qty: '1', orderTotal: '£15.00'  },
  { orderNo: '100413', customer: { name: 'David Jacobson',   initials: 'D' },                                                                    account: 'Beckenham FC',          accountCode: '1129', qty: '1', orderTotal: '£99.00'  },
  { orderNo: '100414', customer: { name: 'Sophia Anderson',  avatar: 'https://picsum.photos/seed/female2/96' },                                   account: 'The Stage',             accountCode: '902',  qty: '1', orderTotal: '£595.00' },
  { orderNo: '100415', customer: { name: 'Emma Thompson',    role: 'Creative Director',       avatar: 'https://picsum.photos/seed/female3/96' },  account: 'The Creative Hub',      accountCode: '1881', qty: '1', orderTotal: '£41.95'  },
  { orderNo: '100416', customer: { name: 'Michael Thompson', role: 'Marketing Executive',     avatar: 'https://picsum.photos/seed/male1/96' },    account: 'Innovate Solutions',    accountCode: '1755', qty: '1', orderTotal: '£9.95'   },
  { orderNo: '100417', customer: { name: 'James Anderson',   role: 'CEO/Owner',               avatar: 'https://picsum.photos/seed/male2/96' },    account: 'The System Hive',       accountCode: '749',  qty: '1', orderTotal: '£144.00' },
  { orderNo: '100418', customer: { name: 'Robert Johnson',   avatar: 'https://picsum.photos/seed/male3/96' },                                     account: 'Synergy Dynamics',      accountCode: '207',  qty: '1', orderTotal: '£95.40'  },
  { orderNo: '100419', customer: { name: 'William Smith',    role: 'Digital Lead',            avatar: 'https://picsum.photos/seed/male4/96' },    account: 'Pinnacle Technologies', accountCode: '449',  qty: '1', orderTotal: '£119.40' },
  { orderNo: '100420', customer: { name: 'David Williams',   avatar: 'https://picsum.photos/seed/male5/96' },                                     account: 'Nexus Innovations',     accountCode: '2099', qty: '1', orderTotal: '£108.00' },
  { orderNo: '100420', customer: { name: 'Olivia Martinez',  avatar: 'https://picsum.photos/seed/female4/96' },                                   account: 'Catalyst Enterprises',  accountCode: '972',  qty: '1', orderTotal: '£12.00'  }
];

/* One screen = one config. Adding a listing screen means adding an
 * entry here, not touching the template. */
var LISTING_SCREENS = {
  orders: {
    title: 'Orders',
    view: 'All Orders',
    columns: LISTING_ORDERS_COLUMNS,
    defaultFilters: LISTING_ORDERS_FILTERS,
    moreFilters: LISTING_ORDERS_MORE_FILTERS,
    rows: LISTING_ORDERS_ROWS,
    page: { from: 1, to: 10, total: 296, current: 1, pages: 3 }
  }
};
