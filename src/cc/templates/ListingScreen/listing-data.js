/* Listing Screen — data layer
 * ---------------------------------------------------------------
 * The Listing Screen template backs ~400 Control Centre screens. They
 * differ in only two things: which datatable TYPE they render, and
 * which filters are shown by default. Both live here as data, so a new
 * screen is a new config object — not a new template.
 *
 * SHAPE IS THE CONTRACT. The renderer (ListingScreen.js) only ever
 * reads `columns`, `rows` and `page`, so swapping these mock rows for a
 * real /control/orders payload is a data change, not a rebuild.
 *
 * ── PROVENANCE (2026-09-18) ────────────────────────────────────
 * The columns and filters below are the REAL ones, read out of the live
 * Affino source (client_key Comrz, /file1/hosting/AffinoComrz):
 *   AfoECommerce/CC/OrderProcessingDef.cfm   — column definitions (CProperties)
 *   AfoECommerce/CC/StoreOrderSearch.cfm     — the filter forms
 *   AfoECommerce/CC/OrderProcessings.cfm     — sort map, actions
 *   AfoECommerce/CC/OrderProcessingQDef.cfm  — the list query (GetOrders)
 *   AfoECommerce/Type/OrderStatus.cfc        — the status enum
 * Control profile 885, SecurityCode 205, Control > Commerce.
 *
 * The DATA is replicated; the PRESENTATION is deliberately not. Mark,
 * 2026-09-18: "we need to replicate what we have on the existing site in
 * terms of data (columns) and filters. But how they are displayed and how
 * we filter etc inc search can all (and should) change to the new
 * framework/design system — that is the task."
 *
 * So three things here are NEW, not reproductions, and are marked as such:
 *   - one filter BAR instead of the live screen's Simple/Advanced form swap
 *   - a free-text search (the live `Search` param is a submit BUTTON; the
 *     screen has no keyword field at all)
 *   - Edit Columns (no column picker or per-user preference exists today)
 *
 * TODO(backend:Listing): every VALUE is mock. The real screen is
 * https://www.affino.com/control/orders — see HANDOVER.md.
 *   → GET  /control/orders?hs=&hsorder=&ListingPerPage=&<filters>
 *          { columns[], rows[], page:{ from,to,total,current,pages } }
 *   → The live list query is SELECT TOP 500 and ListingPerPage (20/50/
 *     100/200, default 20) pages WITHIN those 500 — it is not unbounded
 *     pagination, and a prototype that implies otherwise misrepresents it.
 */

/* Column config ---------------------------------------------------
 * key       row property
 * type      how the cell renders (see ListingScreen.js CELL renderers)
 * label     header text, as OrderProcessingDef.cfm labels it
 * snug      shrink-to-fit, but the text may WRAP. For the enumerated
 *           columns — Order Status, Payment Method and so on. `hug` also
 *           sets `white-space: nowrap`, and a single long value
 *           ("Awaiting Payment Confirmation") then forces the whole table
 *           wider than its container: it overflowed to the right AND left
 *           Customer at its min-content width, which is what "Mari…" was.
 * hug       shrink-to-fit column. Nearly every column is one: they hold a
 *           code, a short enum or a money value, and `width: 1%` makes each
 *           take only what it needs. CUSTOMER is deliberately left fluid so
 *           it absorbs the slack — with eight fluid columns it was getting an
 *           eighth of the table and truncating to "Mari…" while Order Status
 *           and Account sat in space they did not need.
 * sort      the live screen's `hs` token — PRESENT ONLY ON THE SEVEN
 *           COLUMNS IT ACTUALLY SORTS BY. The whitelist is explicit in
 *           OrderProcessings.cfm and an unrecognised `hs` silently falls
 *           through, so Qty / Order Total / Tax are NOT sortable however
 *           much they look it. Default is Date, descending.
 *
 * ORDER IS PRIORITY. There is no tier field: the screen measures how wide each
 * column wants to be and fills the table in this order until the next one
 * would not fit, so the list below is the order columns earn their place in.
 * Dragging a column up in Edit Columns is therefore how a user says "show me
 * this one first".
 */
var LISTING_ORDERS_COLUMNS = [
  { key: 'select',        type: 'select', label: '',                hug: true },
  { key: 'orderNo',       type: 'order',  label: 'Order No.',       hug: true, sort: 'OrderNo.', cellClass: 'datatables__order-no', shortLabel: 'Order' },
  { key: 'customer',      type: 'user',   label: 'Customer', sort: 'Customer' },
  { key: 'orderTotal',    type: 'text',   label: 'Order Total',     hug: true, sort: 'Value' },
  { key: 'orderStatus',   type: 'text',   label: 'Order Status',    snug: true, sort: 'Status' },
  { key: 'account',       type: 'chip',   label: 'Account',         snug: true, sort: 'Account' },
  { key: 'created',       type: 'text',   label: 'Created',         hug: true, sort: 'Date' },
  { key: 'paymentStatus', type: 'text',   label: 'Payment Status',  snug: true, sort: 'PaymentStatus' },
  { key: 'qty',           type: 'text',   label: 'Qty',             hug: true },
  { key: 'accountCode',   type: 'text',   label: 'Account Code',    hug: true },
  { key: 'paymentMethod', type: 'text',   label: 'Payment Method',  snug: true },
  { key: 'orderType',     type: 'text',   label: 'Order Type',      snug: true },
  { key: 'subtotal',      type: 'text',   label: 'Subtotal',        hug: true },
  { key: 'tax',           type: 'text',   label: 'Tax',             hug: true },
  { key: 'catalogueItem', type: 'text',   label: 'Catalogue Item', snug: true },
  { key: 'userCode',      type: 'text',   label: 'User Code',       hug: true },
  { key: 'endUser',       type: 'text',   label: 'End User',        snug: true },
  { key: 'proformaId',    type: 'text',   label: 'Pro Forma ID',    hug: true },
  { key: 'coupon',        type: 'text',   label: 'Coupon',          hug: true },
  { key: 'discount',      type: 'text',   label: 'Discount',        hug: true },
  { key: 'invoicesSent',  type: 'text',   label: 'Invoices Sent',   hug: true },
  { key: 'edit',          type: 'edit',   label: '',                hug: true, mobileOnly: true },
  { key: 'kebab',         type: 'kebab',  label: '',                hug: true }
];

/* Static option lists — REAL values, from the CFC/CFM enums.
 *
 * Order Status labels and visibility are per-tenant: OrderStatus.cfm
 * relabels each from CRMProfileStatusColor and drops any row flagged
 * HideYN. So these sixteen are the SCHEMA; the labels are data. */
var ORDER_STATUSES = ['Incomplete', 'New', 'Paid Partial', 'Paid Full', 'Cancelled',
  'Shipped Partial', 'Shipped', 'Completed', 'On Hold', 'Released for Delivery',
  'Back Ordered', 'Pending Return', 'Returned', 'Partially Refunded', 'Refunded', 'Exported'];
var PAYMENT_STATUSES = ['Not Paid', 'Paid', 'Awaiting Payment Confirmation'];
var ORDER_TYPES = ['New Business', 'Renewal'];
var SUB_ORDER_TYPES = ['Complimentary', 'Corporate', 'Controlled', 'Free Trial', 'Personal', 'Regular', 'Un-assigned'];
var ORDER_METHODS = ['Online', 'Pro Forma'];
var SUBSCRIPTION_FORMATS = ['Digital', 'Digital and Print', 'Print'];
var THIRD_PARTY_ORDERS = ['End Users', 'Gift Orders', 'End Users/Gift Orders'];
var ARCHIVED_STATES = ['Not Archived', 'Archived'];
var COUPON_USAGE = ['Used', 'Returned'];

/* TODO(backend:Listing): these come from DB lookups on the live screen
 * (PaymentMethod, StoreProfile, Currency, Zone, TradingZone, CRMProductLine,
 * CRMProductCategory, CatalogueItem, Coupon, Countries, MemberType,
 * ContactList …). The filter NAMES and WIDGET TYPES are real; these option
 * VALUES are mock, per Mark: dummy data is fine, the schema is not. */
var LOOKUP = {
  paymentMethod: ['Credit Card', 'Invoice', 'PayPal', 'Direct Debit', 'Store Credit'],
  currency: ['GBP', 'USD', 'EUR'],
  store: ['Main Store', 'Trade Store'],
  zone: ['UK', 'EU', 'North America', 'Rest of World'],
  tradingZone: ['Default', 'Wholesale'],
  catalogueItem: ['Annual Membership', '1 Month Subs', 'Quarterly Pass', 'Student Plan', 'Corporate Seat', 'Trial Month'],
  catalogueAttribute: ['Digital Access', 'Print Edition', 'Event Entry'],
  catalogueGroup: ['Memberships', 'Subscriptions', 'Events'],
  country: ['United Kingdom', 'Ireland', 'United States', 'Germany', 'France'],
  coupon: ['WELCOME10', 'RENEW20', 'STUDENT50'],
  productLine: ['Membership', 'Subscription', 'Events'],
  productCategory: ['Core', 'Premium', 'Trial'],
  subscriptionPlan: ['Monthly', 'Quarterly', 'Annual'],
  edition: ['September 2026', 'August 2026', 'July 2026'],
  memberType: ['Individual', 'Corporate', 'Student'],
  contactList: ['Newsletter', 'Event Invites', 'Product Updates'],
  convertingArticle: ['Pricing page', 'Launch announcement', 'Case study']
};

function opts(names) {
  return names.map(function (n) { return { name: n }; });
}

/* The six filters the live screen shows by default — its "Simple Search"
 * form (StoreOrderSearch.cfm #SimpleSearch). Only the FIRST FIVE reach the
 * bar: every listing screen shows five chips and offers the rest behind "Add
 * Filters" (designer, 2026-09-18), so Order Owner heads the More Filters
 * panel rather than being dropped. The limit lives in ListingScreen.js
 * (DEFAULT_CHIPS) because it applies to all ~400 screens, not to this config.
 *
 * Customer and Order Owner are
 * jQuery-UI autocompletes against AjaxCustomerAutoComplete.cfm, which maps
 * to our Predictive type; the other four are plain text.
 *
 * Note Customer and User Code are DIFFERENT fields and both are visible at
 * once — Customer resolves to a CustomerCode, User Code is a numeric list.
 * Likewise Account (name match) and Account Code (numeric). Order No. is a
 * first-class numeric param, not part of any keyword search.
 *
 * `field` names the ROW property the filter tests, so filtering is config
 * rather than code. Dotted paths walk into an object. */
var LISTING_ORDERS_FILTERS = [
  { name: 'Customer',     type: 'predictive', field: 'customer.name', label: 'Filter by Customer',     placeholder: 'Type to search', options: opts(['Maria Mellor', 'David Jacobson', 'Sophia Anderson', 'Emma Thompson', 'Michael Thompson', 'James Anderson', 'Robert Johnson', 'William Smith', 'David Williams', 'Olivia Martinez']) },
  { name: 'User Code',    type: 'text',       field: 'userCode',      label: 'Filter by User Code',    placeholder: 'Enter user code' },
  { name: 'Account',      type: 'text',       field: 'account',       label: 'Filter by Account',      placeholder: 'Enter account name' },
  { name: 'Account Code', type: 'text',       field: 'accountCode',   label: 'Filter by Account Code', placeholder: 'Enter account code' },
  { name: 'Order No.',    type: 'text',       field: 'orderNo',       label: 'Filter by Order No.',    placeholder: 'Enter order number' },
  { name: 'Order Owner',  type: 'predictive', field: 'endUser',       label: 'Filter by Order Owner',  placeholder: 'Type to search', options: opts(['Sarah Kent', 'David Jacobson', 'Sophia Anderson', 'Emma Thompson', 'Anna Reid', 'James Anderson', 'Robert Johnson', 'Priya Shah', 'David Williams', 'Olivia Martinez']) }
];

/* Everything behind "Add Filters" — the live screen's Advanced Search form.
 *
 * NOT a reproduction of the interaction: the live screen SWAPS Simple for
 * Advanced behind a `+` button, showing one form or the other. The chip bar
 * is the new design. The FILTER SET, its widget types and its option lists
 * are the real ones.
 *
 * `TaxRule` is deliberately absent: the controller accepts it and the query
 * uses it, but no form renders a control for it — it is a URL-only deep
 * link, and building a widget would be inventing UI, not replicating it. */
var LISTING_ORDERS_MORE_FILTERS = [
  { name: 'Order Date',        type: 'date-range',   field: 'created',        label: 'Filter by Order Date' },
  { name: 'Payment Date',      type: 'date-range',   field: 'paymentDate',    label: 'Filter by Payment Date' },
  { name: 'Delivery Date',     type: 'date-range',   field: 'deliveryDate',   label: 'Filter by Delivery Date' },

  { name: 'Order Status',      type: 'multi-select', field: 'orderStatus',    label: 'Filter by Order Status',     options: opts(ORDER_STATUSES) },
  { name: 'Payment Status',    type: 'multi-select', field: 'paymentStatus',  label: 'Filter by Payment Status',   options: opts(PAYMENT_STATUSES) },
  { name: 'Sub Order Type',    type: 'multi-select', field: 'subOrderType',   label: 'Filter by Sub Order Type',   options: opts(SUB_ORDER_TYPES) },
  { name: 'Payment Method',    type: 'multi-select', field: 'paymentMethod',  label: 'Filter by Payment Method',   options: opts(LOOKUP.paymentMethod) },
  { name: 'Catalogue Item',    type: 'multi-select', field: 'catalogueItem',  label: 'Filter by Catalogue Item',   options: opts(LOOKUP.catalogueItem) },
  { name: 'Catalogue Attribute', type: 'multi-select', field: 'catalogueAttribute', label: 'Filter by Catalogue Attribute', options: opts(LOOKUP.catalogueAttribute) },
  { name: 'Countries',         type: 'multi-select', field: 'country',        label: 'Filter by Country',          options: opts(LOOKUP.country) },
  { name: 'Coupon',            type: 'multi-select', field: 'couponCode',     label: 'Filter by Coupon',           options: opts(LOOKUP.coupon) },
  { name: 'Product Line',      type: 'multi-select', field: 'productLine',    label: 'Filter by Product Line',     options: opts(LOOKUP.productLine) },
  { name: 'Product Category',  type: 'multi-select', field: 'productCategory', label: 'Filter by Product Category', options: opts(LOOKUP.productCategory) },
  { name: 'Subscription Plan', type: 'multi-select', field: 'subscriptionPlan', label: 'Filter by Subscription Plan', options: opts(LOOKUP.subscriptionPlan) },
  { name: 'Edition',           type: 'multi-select', field: 'edition',        label: 'Filter by Edition',          options: opts(LOOKUP.edition) },
  { name: 'Member Types',      type: 'multi-select', field: 'memberType',     label: 'Filter by Member Type',      options: opts(LOOKUP.memberType) },
  { name: 'Contact Lists',     type: 'multi-select', field: 'contactList',    label: 'Filter by Contact List',     options: opts(LOOKUP.contactList) },
  { name: 'Converting Articles', type: 'multi-select', field: 'convertingArticle', label: 'Filter by Converting Article', options: opts(LOOKUP.convertingArticle) },

  { name: 'Order Type',        type: 'select-options', field: 'orderType',    label: 'Filter by Order Type',       placeholder: 'All order types',    options: opts(ORDER_TYPES) },
  { name: 'Order Method',      type: 'select-options', field: 'orderMethod',  label: 'Filter by Order Method',     placeholder: 'All methods',        options: opts(ORDER_METHODS) },
  { name: 'Subscription Format', type: 'select-options', field: 'subscriptionFormat', label: 'Filter by Subscription Format', placeholder: 'All formats', options: opts(SUBSCRIPTION_FORMATS) },
  { name: 'End User/Gift Orders', type: 'select-options', field: 'thirdParty', label: 'Filter by End User/Gift Orders', placeholder: 'All orders',     options: opts(THIRD_PARTY_ORDERS) },
  { name: 'Coupon Usage',      type: 'select-options', field: 'couponUsage',  label: 'Filter by Coupon Usage',     placeholder: 'All',                options: opts(COUPON_USAGE) },
  { name: 'Archived',          type: 'select-options', field: 'archived',     label: 'Filter by Archive State',    placeholder: 'Not Archived',       options: opts(ARCHIVED_STATES) },
  { name: 'Currency',          type: 'select-options', field: 'currency',     label: 'Filter by Currency',         placeholder: 'All currencies',     options: opts(LOOKUP.currency) },
  { name: 'Store',             type: 'select-options', field: 'store',        label: 'Filter by Store',            placeholder: 'All stores',         options: opts(LOOKUP.store) },
  { name: 'Zone',              type: 'select-options', field: 'zone',         label: 'Filter by Zone',             placeholder: 'All zones',          options: opts(LOOKUP.zone) },
  { name: 'Trading Zone',      type: 'select-options', field: 'tradingZone',  label: 'Filter by Trading Zone',     placeholder: 'All trading zones',  options: opts(LOOKUP.tradingZone) },
  { name: 'Catalogue Group',   type: 'select-options', field: 'catalogueGroup', label: 'Filter by Catalogue Group', placeholder: 'All groups',        options: opts(LOOKUP.catalogueGroup) },

  { name: 'Order No. Range',   type: 'range', field: 'orderNo',     label: 'Order number between', fromPlaceholder: 'From', toPlaceholder: 'To' },
  { name: 'Price Range',       type: 'range', field: 'orderTotal',  label: 'Order value between',  fromPlaceholder: 'From', toPlaceholder: 'To' },

  { name: 'Exclude Tax',       type: 'checkbox', field: 'excludeTax',      label: 'Excluding Tax',       checkboxLabel: 'Exclude tax from totals' },
  { name: 'Invoice Sent',      type: 'checkbox', field: 'invoiceSent',     label: 'Invoice Sent',        checkboxLabel: 'Only orders with an invoice sent' },
  { name: 'Store Credits Used', type: 'checkbox', field: 'storeCredits',   label: 'Store Credits',       checkboxLabel: 'Only orders using store credit' },
  { name: 'First Time Buyer',  type: 'checkbox', field: 'firstTimeBuyer',  label: 'First Time Buyer',    checkboxLabel: 'Only first-time buyers' },
  { name: 'Zero Value Orders', type: 'checkbox', field: 'zeroValue',       label: 'Zero Value Orders',   checkboxLabel: 'Include zero value orders' },
  { name: 'Exclude Subscriptions', type: 'checkbox', field: 'excludeSubs', label: 'Subscriptions',       checkboxLabel: 'Exclude subscription orders' },
  { name: 'Show Attendee No.', type: 'checkbox', field: 'showAttendees',   label: 'Attendees',           checkboxLabel: 'Show attendee numbers' },
  { name: 'Show Contact Details', type: 'checkbox', field: 'showContact',  label: 'Contact Details',     checkboxLabel: 'Show email and telephone columns' },

  { name: 'External Code',     type: 'text', field: 'externalCode', label: 'Filter by External Code', placeholder: 'Enter external code' },
  { name: 'Payment ID',        type: 'text', field: 'paymentId',    label: 'Filter by Payment ID',    placeholder: 'Enter payment ID' },
  { name: 'Payment Reference', type: 'text', field: 'paymentRef',   label: 'Filter by Payment Provider Reference', placeholder: 'Enter reference' },
  { name: 'Batch Ref',         type: 'text', field: 'batchRef',     label: 'Filter by Batch Reference', placeholder: 'Enter batch reference' },
  { name: 'Order List',        type: 'text', field: 'orderList',    label: 'Filter by Order List',    placeholder: 'Enter list name' },
  { name: 'Campaign Source',   type: 'text', field: 'campaignSource', label: 'Filter by Campaign Source', placeholder: 'utm_source' },
  { name: 'Campaign Medium',   type: 'text', field: 'campaignMedium', label: 'Filter by Campaign Medium', placeholder: 'utm_medium' },
  { name: 'Campaign Code',     type: 'text', field: 'campaignCode', label: 'Filter by Campaign Code', placeholder: 'utm_campaign' }
];

/* Rows — mock, but shaped like the real list query (GetOrders). Order No.
 * is a two-line cell on the live screen: the order code with the external
 * code beneath it, which is why `externalCode` is a row field rather than
 * a column of its own. */
var ORDER_SEED_ROWS = [
  { orderNo: '100412', externalCode: 'EXT-0412', proformaId: 'PF-0412', customer: { name: 'Maria Mellor', role: 'Digital Project Manager', avatar: 'https://picsum.photos/seed/female1/96' }, endUser: 'Sarah Kent',
    userCode: 'USR-1201', account: 'Jacobs Media', accountCode: '1201', catalogueItem: 'Annual Membership', qty: '1',
    subtotal: '£12.00', tax: '£3.00', orderTotal: '£15.00', orderStatus: 'Paid Full', orderType: 'New Business',
    subOrderType: 'Regular', paymentMethod: 'Credit Card', paymentStatus: 'Paid', currency: 'GBP', store: 'Main Store',
    created: '2026-09-14', paymentDate: '2026-09-14', coupon: 'Yes', discount: 'No', invoicesSent: '2' },
  { orderNo: '100413', externalCode: '', proformaId: '', customer: { name: 'David Jacobson', initials: 'D' }, endUser: 'David Jacobson',
    userCode: 'USR-1129', account: 'Beckenham FC', accountCode: '1129', catalogueItem: '1 Month Subs', qty: '1',
    subtotal: '£79.20', tax: '£19.80', orderTotal: '£99.00', orderStatus: 'New', orderType: 'Renewal',
    subOrderType: 'Corporate', paymentMethod: 'Invoice', paymentStatus: 'Not Paid', currency: 'GBP', store: 'Main Store',
    created: '2026-09-14', paymentDate: '', coupon: 'No', discount: 'Yes', invoicesSent: '0' },
  { orderNo: '100414', externalCode: '', proformaId: '', customer: { name: 'Sophia Anderson', avatar: 'https://picsum.photos/seed/female2/96' }, endUser: 'Sophia Anderson',
    userCode: 'USR-0902', account: 'The Stage', accountCode: '902', catalogueItem: 'Quarterly Pass', qty: '1',
    subtotal: '£476.00', tax: '£119.00', orderTotal: '£595.00', orderStatus: 'Shipped', orderType: 'New Business',
    subOrderType: 'Regular', paymentMethod: 'Credit Card', paymentStatus: 'Paid', currency: 'GBP', store: 'Trade Store',
    created: '2026-09-13', paymentDate: '2026-09-13', coupon: 'No', discount: 'No', invoicesSent: '1' },
  { orderNo: '100415', externalCode: 'EXT-0415', proformaId: 'PF-0415', customer: { name: 'Emma Thompson', role: 'Creative Director', avatar: 'https://picsum.photos/seed/female3/96' }, endUser: 'Emma Thompson',
    userCode: 'USR-1881', account: 'The Creative Hub', accountCode: '1881', catalogueItem: 'Student Plan', qty: '1',
    subtotal: '£33.56', tax: '£8.39', orderTotal: '£41.95', orderStatus: 'Completed', orderType: 'Renewal',
    subOrderType: 'Personal', paymentMethod: 'PayPal', paymentStatus: 'Paid', currency: 'GBP', store: 'Main Store',
    created: '2026-09-13', paymentDate: '2026-09-13', coupon: 'Yes', discount: 'Yes', invoicesSent: '3' },
  { orderNo: '100416', externalCode: '', proformaId: '', customer: { name: 'Michael Thompson', role: 'Marketing Executive', avatar: 'https://picsum.photos/seed/male1/96' }, endUser: 'Anna Reid',
    userCode: 'USR-1755', account: 'Innovate Solutions', accountCode: '1755', catalogueItem: 'Corporate Seat', qty: '1',
    subtotal: '£7.96', tax: '£1.99', orderTotal: '£9.95', orderStatus: 'On Hold', orderType: 'New Business',
    subOrderType: 'Corporate', paymentMethod: 'Invoice', paymentStatus: 'Awaiting Payment Confirmation', currency: 'USD', store: 'Main Store',
    created: '2026-09-12', paymentDate: '', coupon: 'No', discount: 'No', invoicesSent: '0' },
  { orderNo: '100417', externalCode: '', proformaId: '', customer: { name: 'James Anderson', role: 'CEO/Owner', avatar: 'https://picsum.photos/seed/male2/96' }, endUser: 'James Anderson',
    userCode: 'USR-0749', account: 'The System Hive', accountCode: '749', catalogueItem: 'Annual Membership', qty: '1',
    subtotal: '£115.20', tax: '£28.80', orderTotal: '£144.00', orderStatus: 'Paid Partial', orderType: 'Renewal',
    subOrderType: 'Regular', paymentMethod: 'Direct Debit', paymentStatus: 'Paid', currency: 'GBP', store: 'Trade Store',
    created: '2026-09-12', paymentDate: '2026-09-12', coupon: 'No', discount: 'Yes', invoicesSent: '1' },
  { orderNo: '100418', externalCode: '', proformaId: '', customer: { name: 'Robert Johnson', avatar: 'https://picsum.photos/seed/male3/96' }, endUser: 'Robert Johnson',
    userCode: 'USR-0207', account: 'Synergy Dynamics', accountCode: '207', catalogueItem: 'Trial Month', qty: '1',
    subtotal: '£76.32', tax: '£19.08', orderTotal: '£95.40', orderStatus: 'Cancelled', orderType: 'New Business',
    subOrderType: 'Free Trial', paymentMethod: 'Credit Card', paymentStatus: 'Not Paid', currency: 'EUR', store: 'Main Store',
    created: '2026-09-11', paymentDate: '', coupon: 'No', discount: 'No', invoicesSent: '0' },
  { orderNo: '100419', externalCode: 'EXT-0419', proformaId: 'PF-0419', customer: { name: 'William Smith', role: 'Digital Lead', avatar: 'https://picsum.photos/seed/male4/96' }, endUser: 'Priya Shah',
    userCode: 'USR-0449', account: 'Pinnacle Technologies', accountCode: '449', catalogueItem: '1 Month Subs', qty: '1',
    subtotal: '£95.52', tax: '£23.88', orderTotal: '£119.40', orderStatus: 'Refunded', orderType: 'Renewal',
    subOrderType: 'Complimentary', paymentMethod: 'Credit Card', paymentStatus: 'Paid', currency: 'GBP', store: 'Main Store',
    created: '2026-09-11', paymentDate: '2026-09-11', coupon: 'No', discount: 'Yes', invoicesSent: '2' },
  { orderNo: '100420', externalCode: '', proformaId: '', customer: { name: 'David Williams', avatar: 'https://picsum.photos/seed/male5/96' }, endUser: 'David Williams',
    userCode: 'USR-2099', account: 'Nexus Innovations', accountCode: '2099', catalogueItem: 'Quarterly Pass', qty: '1',
    subtotal: '£86.40', tax: '£21.60', orderTotal: '£108.00', orderStatus: 'Released for Delivery', orderType: 'New Business',
    subOrderType: 'Controlled', paymentMethod: 'Invoice', paymentStatus: 'Paid', currency: 'GBP', store: 'Trade Store',
    created: '2026-09-10', paymentDate: '2026-09-10', coupon: 'Yes', discount: 'No', invoicesSent: '1' },
  { orderNo: '100421', externalCode: '', proformaId: '', customer: { name: 'Olivia Martinez', avatar: 'https://picsum.photos/seed/female4/96' }, endUser: 'Olivia Martinez',
    userCode: 'USR-0972', account: 'Catalyst Enterprises', accountCode: '972', catalogueItem: 'Student Plan', qty: '1',
    subtotal: '£9.60', tax: '£2.40', orderTotal: '£12.00', orderStatus: 'Back Ordered', orderType: 'New Business',
    subOrderType: 'Un-assigned', paymentMethod: 'PayPal', paymentStatus: 'Not Paid', currency: 'GBP', store: 'Main Store',
    created: '2026-09-10', paymentDate: '', coupon: 'No', discount: 'No', invoicesSent: '0' }
];

/* Expanded so paging, sorting and filtering are all demonstrable — ten rows
 * cannot show a second page. Deterministic: same rows every load, so a
 * screenshot or a test is reproducible.
 *
 * Only the fields that should VARY do: order number, dates, and the
 * enumerated values that filters target. Names, accounts and avatars rotate
 * through the seed so the data still looks like a customer base rather than
 * noise. */
var LISTING_ORDERS_ROWS = (function (seed) {
  var rows = [];
  var PASSES = 14;   // 14 x 10 = 140 orders, seven pages at the default 20

  for (var pass = 0; pass < PASSES; pass++) {
    for (var i = 0; i < seed.length; i++) {
      var base = seed[i];
      var n = pass * seed.length + i;
      var day = 28 - (n % 28);
      var month = 9 - Math.floor(n / 28) % 3;
      var date = '2026-0' + month + '-' + (day < 10 ? '0' + day : day);

      var row = {};
      for (var k in base) { if (Object.prototype.hasOwnProperty.call(base, k)) row[k] = base[k]; }

      row.orderNo = String(100412 + n);
      row.externalCode = base.externalCode ? 'EXT-' + row.orderNo.slice(-4) : '';
      row.proformaId = base.proformaId ? 'PF-' + row.orderNo.slice(-4) : '';
      row.created = date;
      row.paymentDate = base.paymentDate ? date : '';
      row.orderStatus = ORDER_STATUSES[n % ORDER_STATUSES.length];
      row.paymentStatus = PAYMENT_STATUSES[n % PAYMENT_STATUSES.length];
      row.orderType = ORDER_TYPES[n % ORDER_TYPES.length];
      row.subOrderType = SUB_ORDER_TYPES[n % SUB_ORDER_TYPES.length];
      row.paymentMethod = LOOKUP.paymentMethod[n % LOOKUP.paymentMethod.length];
      row.catalogueItem = LOOKUP.catalogueItem[n % LOOKUP.catalogueItem.length];
      row.currency = LOOKUP.currency[n % LOOKUP.currency.length];
      row.store = LOOKUP.store[n % LOOKUP.store.length];
      row.qty = String((n % 4) + 1);

      /* Spread the values so sorting by Order Total is visibly doing
         something, and keep subtotal/tax consistent with it. */
      var total = 9.95 + ((n * 37) % 940);
      row.orderTotal = '\u00a3' + total.toFixed(2);
      row.subtotal = '\u00a3' + (total * 0.8).toFixed(2);
      row.tax = '\u00a3' + (total * 0.2).toFixed(2);

      rows.push(row);
    }
  }
  return rows;
}(ORDER_SEED_ROWS));


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
    /* 20 is the live default and the page sizes are the live ones. The live
       query's SELECT TOP 500 cap is deliberately NOT reproduced — Mark,
       2026-09-18: the data is what we replicate, the display follows best
       practice, and paging that silently stops at 500 is not that. Here it
       pages the whole result set. */
    perPage: 20,
    perPageOptions: [20, 50, 100, 200],
    sort: { by: 'Date', dir: 'desc' }
  }
};
