/* WhatsOnListing — Control-side screen generator
 * ────────────────────────────────────────────────────────────────────────────
 * Emits the four Control Centre screens of the What's On paid listing flow
 * (TASK-344419) from ONE spec:
 *
 *   control-inbox.html                    Content › Inbox           (listing)
 *   control-service-credits.html          Commerce › Service Credits (listing)
 *   control-service-credit-profile.html   Commerce › Service Credit Profile (edit)
 *   control-workflow-profile.html         Content › Workflow Profile (edit)
 *
 * SOURCE: the Hub prototype `whats-on-listing-credits` v13 / revision 14
 * (18 Sep 2026), which draws all four on one page (its screen 10). They are
 * split here because they are four screens in Control.
 *
 * PROTOTYPE-SCOPED BY DESIGN (Mark, 2026-09-23): none of this is signed off by
 * the client, so the core ListingScreen template and Datatables are NOT
 * amended. The two listings are static markup using the listing's own classes
 * (so they look the same) rather than configs on ListingScreen.js, which has
 * no cell type for a status badge or per-row buttons.
 *
 * Shared, read-only dependencies:
 *   ../ControlRecordScreen/_shell/*      the real CC shell, extracted verbatim
 *                                        from ListingScreen/Articles.html
 *   ../ControlRecordScreen/ControlRecordScreen.css   the crs-* edit layout
 * Neither is edited from here. If ControlRecordScreen's layout changes, rerun
 * this generator and the two edit screens follow.
 *
 * Design annotations ("where the new panel goes", "new field") are NOT drawn
 * in the screens — they live in WhatsOnListing.annotations.md and go onto the
 * Figma frames as annotations.
 *
 * Run:  node src/prototypes/WhatsOnListing/_generate.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const shell = (n) =>
  readFileSync(join(DIR, '..', 'ControlRecordScreen', '_shell', n), 'utf8').replace(/\s+$/, '');

const SIDEBARS = shell('sidebars.html');
const CHROME_OPEN = shell('chrome-open.html');
const CHROME_CLOSE = shell('chrome-close.html');
const RAIL = shell('rail.html');
const TOAST_MODAL = shell('toast-modal.html');
const SCRIPTS = shell('scripts.html');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let uid = 0;
const nextId = () => `wol-f-${++uid}`;

/* ══ Sample data ══════════════════════════════════════════════════════════
 * From v13's `state`, with ONE deliberate change: v13's first queue row shows
 * the event contact as "Morag Campbell · 01546 000000". Plan decision 8 (and
 * Lynx, 23 Sep, query 6) is that no phone number is collected or published,
 * so the number is dropped here. Fiona's regatta is the submission the display
 * flow creates (v13 screen 8's own placeholder), so the two halves meet.
 * Today is taken as 23 Sep 2026.
 */
const QUEUE = [
  { id: 101, title: "Lochgilphead farmers' market", from: 'Mid Argyll Producers', contact: 'Morag Campbell',
    email: 'hello@midargyllproducers.example', when: 'Sat 3 Oct 2026 · 09:00 until 14:00', area: 'Mid Argyll',
    type: "Food & Drink › Farmers' Markets", venue: 'Front Green, Lochgilphead', submitted: '20 Sep · 09:14', age: 3,
    desc: 'Monthly producers’ market on the Front Green: Argyll beef and lamb, smoked fish, baking, cheese and plants. Free entry, dogs welcome.',
    publishStart: '3 Aug 2026 → now' },
  { id: 102, title: 'Bute Highland Games fun run', from: 'Rothesay Athletics', contact: '', email: '',
    when: 'Sun 11 Oct 2026 · 10:30 until 13:00', area: 'Isle of Bute', type: 'Family & Kids › Highland Games',
    venue: 'Rothesay Pavilion, Isle of Bute', submitted: '22 Sep · 09:14', age: 1,
    desc: '3k and 5k fun runs along the Rothesay seafront. Juniors free, adults £5 on the day, all proceeds to the club’s junior section.',
    publishStart: 'now' },
  { id: 103, title: 'Oban Sailing Club open regatta', from: 'Fiona MacLeod', contact: 'Fiona MacLeod',
    email: 'fiona@obansailing.example', when: 'Sat 10 Oct 2026 · 10:00 to Sun 11 Oct 2026 · 17:00', area: 'Oban',
    type: 'Sports & Outdoor › Water Sports', venue: 'Gallanach Road, Oban', submitted: '23 Sep · 09:14', age: 0,
    desc: 'Two days of dinghy and keelboat racing in Oban Bay, open to visiting boats. Spectators welcome on the club slipway; bar and food from 12:00.',
    fb: 'facebook.com/obansailingclub', web: 'obansailing.example/regatta', publishStart: 'now' },
];

/* One contact's 5-pack split by state, as v13 draws it, plus Morag's single
 * credit held against the market. Whether a held credit is its OWN row or a
 * status on the purchase row is still open (Lynx 18 Sep query 1, with Julius)
 * — see the annotations file. */
const LEDGER = [
  { contact: 'Fiona MacLeod', plan: 'What’s On listing credit', start: '17 Sep 26', end: '17 Sep 27', qty: 3, status: 'Available', against: '' },
  { contact: 'Fiona MacLeod', plan: 'What’s On listing credit', start: '17 Sep 26', end: '17 Sep 27', qty: 1, status: 'Held', against: 'Oban Sailing Club open regatta' },
  { contact: 'Fiona MacLeod', plan: 'What’s On listing credit', start: '17 Sep 26', end: '17 Sep 27', qty: 1, status: 'Spent', against: 'Argyll Rally spectator day' },
  { contact: 'Morag Campbell', plan: 'What’s On listing credit', start: '19 Sep 26', end: '19 Sep 27', qty: 1, status: 'Held', against: "Lochgilphead farmers' market" },
];

const STATUS_BADGE = { Available: 'success', Held: 'warning', Spent: 'neutral' };

/* ══ Shared listing pieces ═════════════════════════════════════════════════ */

function chip(name, value) {
  if (!value) {
    return `              <div class="filter-item filter-item--rounded filter-item--empty" data-filter-name="${esc(name)}">
                <button type="button" class="filter-item__trigger" aria-expanded="false">
                  <i data-lucide="plus" class="filter-item__add" aria-hidden="true"></i>
                  <span class="filter-item__name">${esc(name)}</span>
                </button>
              </div>`;
  }
  return `              <div class="filter-item filter-item--rounded filter-item--selected" data-filter-name="${esc(name)}">
                <button type="button" class="filter-item__clear" aria-label="Clear ${esc(name)} filter"><i data-lucide="x" aria-hidden="true"></i></button>
                <button type="button" class="filter-item__trigger" aria-expanded="false">
                  <i data-lucide="plus" class="filter-item__add" aria-hidden="true"></i>
                  <span class="filter-item__name">${esc(name)}</span>
                  <span class="filter-item__sep" aria-hidden="true">·</span>
                  <span class="filter-item__values">${esc(value)}</span>
                  <i data-lucide="chevron-down" class="filter-item__chevron" aria-hidden="true"></i>
                </button>
              </div>`;
}

function filterBar(view, chips) {
  return `        <div class="filter-bar">
          <div class="filter-bar__row filter-bar__row--top">
            <div class="filter-bar__lead">
              <div class="dropdown filter-bar__views" data-dropdown>
                <button type="button" class="dropdown__trigger filter-bar__views-trigger" aria-haspopup="menu" aria-expanded="false">
                  <span class="filter-bar__views-label">${esc(view)}</span>
                  <i data-lucide="chevron-down" class="filter-bar__views-chevron" aria-hidden="true"></i>
                </button>
              </div>
              <div class="input filter-bar__search">
                <div class="input__wrap">
                  <i data-lucide="search" class="input__icon" aria-hidden="true"></i>
                  <input type="search" class="input__control" placeholder="Search" aria-label="Search">
                </div>
              </div>
            </div>
            <div class="filter-bar__actions">
              <button type="button" class="filter-bar__icon-btn" aria-label="Search"><i data-lucide="search" aria-hidden="true"></i></button>
            </div>
          </div>
          <div class="filter-bar__row">
            <div class="filter-bar__chips">
${chips.map((c) => chip(c[0], c[1])).join('\n')}
            </div>
          </div>
        </div>`;
}

function datatable({ cols, rows, total, noun }) {
  const head = cols
    .map((c) => `<th scope="col"${c.cls ? ` class="${c.cls}"` : ''}>${c.label ? esc(c.label) : `<span class="wol-sr">${esc(c.sr || '')}</span>`}</th>`)
    .join('');
  return `        <div class="datatables datatables--orders">
          <div class="datatables__toolbar">
            <span class="datatables__meta">
              <span class="datatables__meta-label">Show</span>
              <button type="button" class="datatables__select" aria-label="Rows per page"><span>20</span><i data-lucide="chevron-down" aria-hidden="true"></i></button>
              <span>of <strong>${total}</strong></span>
            </span>
          </div>
          <div class="datatables__body">
            <table class="table">
              <thead><tr>${head}</tr></thead>
              <tbody data-wol-rows>
${rows.join('\n')}
              </tbody>
            </table>
          </div>
          <div class="datatables__footer">
            <span class="datatables__count"><span class="datatables__count-word">Showing </span><strong>1&#8211;${total}</strong> of <strong>${total}</strong><span class="datatables__count-word"> ${esc(noun)}</span></span>
          </div>
        </div>`;
}

/* ══ Screen: Content › Inbox ═══════════════════════════════════════════════ */

function inboxRow(q) {
  const late = q.age >= 2;
  const waiting = q.age === 0 ? 'Just now' : `${q.age} day${q.age > 1 ? 's' : ''}`;
  return `                <tr data-wol-id="${q.id}">
                  <td class="wol-cell-title wol-td--full"><a class="datatables__record-link" href="#">${esc(q.title)}</a><span class="wol-cell-meta">What’s On › Events · Event · ${esc(q.area)}</span></td>
                  <td class="wol-td--full">${esc(q.from)}${q.contact && q.contact !== q.from ? `<span class="wol-cell-meta">Event contact: ${esc(q.contact)}</span>` : ''}</td>
                  <td class="datatables__col--hug" data-label="Submitted">${esc(q.submitted)}</td>
                  <td class="datatables__col--hug" data-label="Credit"><span class="badge badge--warning badge--pill">1 held</span></td>
                  <td class="datatables__col--hug" data-label="Waiting">${late ? `<span class="badge badge--danger badge--pill">${waiting} · past SLA</span>` : `<span class="wol-waiting">${waiting}</span>`}</td>
                  <td class="datatables__col--hug wol-td--full">
                    <div class="wol-row-actions">
                      <button type="button" class="btn btn--secondary btn--sm" data-wol-detail="${q.id}">Details</button>
                      <button type="button" class="btn btn--primary btn--sm" data-wol-approve="${q.id}">Save &amp; Publish</button>
                      <button type="button" class="btn btn--alert-outline btn--sm" data-wol-reject="${q.id}">Reject</button>
                    </div>
                  </td>
                </tr>`;
}

function detailBody(q) {
  const row = (k, v) => `            <div class="wol-detail__row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`;
  const contact = q.contact
    ? `${esc(q.contact)}${q.email ? ` · ${esc(q.email)}` : ''}<span class="wol-cell-meta">Published on the event page</span>`
    : '<span class="wol-muted">No event contact given</span>';
  return `          <dl class="wol-detail">
${[
  row('Event', `<strong>${esc(q.title)}</strong><span class="wol-cell-meta">${esc(q.when)} · UK time</span>`),
  row('Venue', esc(q.venue)),
  row('Areas and event types', `${esc(q.area)} · ${esc(q.type)}`),
  row('Description', esc(q.desc)),
  row('Image', '<span class="wol-muted">One image attached</span>'),
  row('Event website', q.web ? esc(q.web) : '<span class="wol-muted">None supplied</span>'),
  row('Facebook page', q.fb ? esc(q.fb) : '<span class="wol-muted">None supplied</span>'),
  row('Contact', contact),
  row('Submitted', `${esc(q.from)}<span class="wol-cell-meta">${q.age === 0 ? 'Just now' : `${q.age} day${q.age > 1 ? 's' : ''} ago`}${q.age >= 2 ? ' · past SLA' : ''}</span>`),
  row('Credit', '<span class="badge badge--warning badge--pill">1 held</span>'),
  row('On approval', `Publish Start <strong>${esc(q.publishStart)}</strong><span class="wol-cell-meta">Publish End becomes the event end.</span>`),
].join('\n')}
          </dl>`;
}

function inboxModals() {
  /* One Details modal per row, pre-rendered — the page has no templating at
     runtime, and pre-rendering keeps each one inspectable in the DOM. */
  const details = QUEUE.map(
    (q) => `  <div class="modal-overlay" id="wol-detail-${q.id}" role="dialog" aria-modal="true" aria-labelledby="wol-detail-${q.id}-title">
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title" id="wol-detail-${q.id}-title">${esc(q.title)}</h2>
        <button class="modal__close" type="button" aria-label="Close" data-wol-close><i data-lucide="x" aria-hidden="true"></i></button>
      </div>
      <div class="modal__body">
${detailBody(q)}
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary" type="button" data-wol-close>Close</button>
      </div>
    </div>
  </div>`
  ).join('\n\n');

  const reasons = ['Not a real event', 'Outside our area', 'Duplicate of an existing listing', 'Image rights not confirmed', 'Breaches listing terms', 'Needs more detail'];
  const reject = `  <div class="modal-overlay" id="wol-reject" role="dialog" aria-modal="true" aria-labelledby="wol-reject-title">
    <div class="modal modal--sm">
      <div class="modal__header">
        <h2 class="modal__title" id="wol-reject-title">Reject article</h2>
        <button class="modal__close" type="button" aria-label="Close" data-wol-close><i data-lucide="x" aria-hidden="true"></i></button>
      </div>
      <div class="modal__body wol-stack">
        <div class="wol-field">
          <span class="wol-field__label" id="wol-reason-label">Reason</span>
          <div class="sel" data-sel>
            <button class="sel__control" type="button" data-sel-trigger aria-labelledby="wol-reason-label">
              <span class="sel__value" data-wol-reason>${esc(reasons[0])}</span>
              <span class="sel__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>
            </button>
            <ul class="sel__menu" role="listbox">${reasons
              .map((r, i) => `<li><button type="button" class="sel__menu-item${i === 0 ? ' sel__menu-item--selected' : ''}" role="option"${i === 0 ? ' aria-selected="true"' : ''}>${esc(r)}</button></li>`)
              .join('')}</ul>
          </div>
        </div>
        <div class="wol-field">
          <label class="wol-field__label" for="wol-reject-msg">Message to the creator</label>
          <div class="textarea"><textarea class="textarea__control" id="wol-reject-msg" rows="4" placeholder="Explain what would make the listing publishable"></textarea></div>
        </div>
        <label class="checkbox"><input class="checkbox__input" type="checkbox" checked><span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span><span class="checkbox__label"><span class="checkbox__label-text">Notify creator</span></span></label>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary" type="button" data-wol-close>Cancel</button>
        <button class="btn btn--alert" type="button" data-wol-reject-confirm>Reject</button>
      </div>
    </div>
  </div>`;
  return `${details}\n\n${reject}`;
}

const INBOX = {
  file: 'control-inbox',
  name: 'Inbox',
  crumbs: ['Content', 'Inbox'],
  kind: 'listing',
  body: () => `      <div class="cc-listing wol-listing">
${filterBar('Awaiting approval', [['Channel', 'What’s On'], ['Status', 'Submitted'], ['Section', ''], ['Style', ''], ['From', '']])}
${datatable({
  cols: [
    { label: 'Title' },
    { label: 'From' },
    { label: 'Submitted', cls: 'datatables__col--hug' },
    { label: 'Credit', cls: 'datatables__col--hug' },
    { label: 'Waiting', cls: 'datatables__col--hug' },
    { label: '', sr: 'Actions', cls: 'datatables__col--hug' },
  ],
  rows: QUEUE.map(inboxRow),
  total: QUEUE.length,
  noun: 'articles',
})}
      </div>`,
  extra: inboxModals,
};

/* ══ Screen: Commerce › Service Credits ═══════════════════════════════════ */

function ledgerRow(r, i) {
  const acts = [];
  if (r.status !== 'Spent') acts.push('<button type="button" class="btn btn--secondary btn--sm" data-wol-toast="Use Credits is the existing action, unchanged.">Use Credits</button>');
  if (r.status === 'Held') acts.push(`<button type="button" class="btn btn--alert-outline btn--sm" data-wol-release="${i}">Release Hold</button>`);
  return `                <tr data-wol-ledger="${i}">
                  <td class="wol-cell-title wol-td--full"><strong>${esc(r.contact)}</strong><span class="wol-cell-meta">${esc(r.plan)}</span></td>
                  <td class="datatables__col--hug" data-label="Start">${esc(r.start)}</td>
                  <td class="datatables__col--hug" data-label="End">${esc(r.end)}</td>
                  <td class="datatables__col--hug" data-label="Qty">${r.qty}</td>
                  <td class="datatables__col--hug" data-label="Status" data-wol-status><span class="badge badge--${STATUS_BADGE[r.status]} badge--pill">${esc(r.status)}</span></td>
                  <td class="wol-td--full" data-label="Held against" data-wol-against>${r.against ? esc(r.against) : '<span class="wol-muted">—</span>'}</td>
                  <td class="datatables__col--hug wol-td--full"><div class="wol-row-actions" data-wol-actions>${acts.join('')}</div></td>
                </tr>`;
}

const CREDITS = {
  file: 'control-service-credits',
  name: 'Service Credits',
  crumbs: ['Commerce', 'Service Credits'],
  kind: 'listing',
  headerActions: '            <button class="btn btn--primary" type="button"><i data-lucide="plus" aria-hidden="true"></i><span class="cc-header__btn-label">Add</span></button>',
  body: () => `      <div class="cc-listing wol-listing">
${filterBar('All Service Credits', [['Plan', 'What’s On listing credit'], ['Contact', ''], ['Status', ''], ['Start', ''], ['End', '']])}
${datatable({
  cols: [
    { label: 'Contact' },
    { label: 'Start', cls: 'datatables__col--hug' },
    { label: 'End', cls: 'datatables__col--hug' },
    { label: 'Qty', cls: 'datatables__col--hug' },
    { label: 'Status', cls: 'datatables__col--hug' },
    { label: 'Held against' },
    { label: '', sr: 'Actions', cls: 'datatables__col--hug' },
  ],
  rows: LEDGER.map(ledgerRow),
  total: LEDGER.length,
  noun: 'records',
})}
      </div>`,
};

/* ══ Edit screens — crs-* markup from ControlRecordScreen ══════════════════ */

function control(f, id) {
  const v = f.value;
  switch (f.control) {
    case 'toggle':
      /* Track + knob are required: ControlRecordScreen's generator emits a bare
         <button class="toggle">, which renders nothing (flagged, not fixed there). */
      return `<button id="${id}" class="toggle${v ? ' toggle--active' : ''}" type="button" role="switch" aria-checked="${!!v}"><span class="toggle__track"><span class="toggle__knob"></span></span></button>`;
    case 'select':
    case 'picker': {
      const opts = f.opts || (v ? [v] : []);
      return `<div class="sel" data-sel>
                <button id="${id}" class="sel__control" type="button" data-sel-trigger>
                  <span class="sel__value">${v ? esc(v) : esc(f.placeholder || 'Select…')}</span>
                  <span class="sel__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>
                </button>
                <ul class="sel__menu" role="listbox">${opts
                  .map((o) => `<li><button type="button" class="sel__menu-item${o === v ? ' sel__menu-item--selected' : ''}" role="option"${o === v ? ' aria-selected="true"' : ''}>${esc(o)}</button></li>`)
                  .join('')}</ul>
              </div>`;
    }
    case 'textarea':
      return `<div class="textarea"><textarea class="textarea__control" id="${id}" rows="3">${esc(v || '')}</textarea></div>`;
    case 'number':
      return `<div class="input"><div class="input__wrap"><input id="${id}" type="number" class="input__control" value="${esc(v)}"></div></div>`;
    default:
      return `<div class="input"><div class="input__wrap"><input id="${id}" type="text" class="input__control" value="${esc(v || '')}"${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}></div></div>`;
  }
}

function field(f) {
  const id = nextId();
  const mods = [f.full ? 'crs-field--full' : '', f.control === 'textarea' ? 'crs-field--textarea' : ''].filter(Boolean).join(' ');
  const req = f.required ? ' <span class="crs-field__req" aria-hidden="true">*</span>' : '';
  return `          <div class="crs-field${mods ? ' ' + mods : ''}">
            <label class="crs-field__label" for="${id}">${esc(f.label)}${req}</label>
            <div class="crs-field__value">${control(f, id)}</div>${f.help ? `\n            <p class="crs-field__help">${esc(f.help)}</p>` : ''}
          </div>`;
}

function card(sec, i) {
  return `      <section class="crs-card" aria-labelledby="wol-s-${i}">
        <div class="crs-card__head">
          <h2 class="crs-card__title" id="wol-s-${i}">${esc(sec.name)}</h2>
        </div>
        <div class="crs-card__body">
          <div class="crs-fields">
${sec.fields.map(field).join('\n')}
          </div>
        </div>
      </section>`;
}

function factBlock(b) {
  const rows = b.items
    .map((it) => `            <div class="crs-fact__item"><dt>${esc(it[0])}</dt><dd>${esc(it[1])}</dd></div>`)
    .join('\n');
  return `        <section class="crs-fact" aria-labelledby="wol-fact-${b.id}">
          <h2 class="crs-fact__title" id="wol-fact-${b.id}">${esc(b.name)}</h2>
          <dl class="crs-fact__list">
${rows}
          </dl>
        </section>`;
}

function editBody(spec) {
  return `      <div class="crs-record" data-mode="edit">
        <div class="crs-main">
${spec.main.map(card).join('\n\n')}
        </div>

      <aside class="crs-aside" aria-label="Record information">
${spec.facts.map(factBlock).join('\n\n')}
      </aside>
      </div>`;
}

/* Values are v13's own. Help text is condensed from v13's in-screen notes;
 * the long "why" versions of those notes are annotations, not help text. */
const PROFILE = {
  file: 'control-service-credit-profile',
  name: 'Service Credit Profile',
  subtitle: 'What’s On listing credit',
  crumbs: ['Commerce', 'Service Credit Profiles', 'Service Credit Profile'],
  kind: 'edit',
  main: [
    {
      name: 'Main',
      fields: [
        { label: 'Name', control: 'text', value: 'What’s On listing credit', required: true },
        { label: 'Service Credit Plans', control: 'picker', value: 'What’s On listing credit' },
        { label: 'Service Credits To Create Content', control: 'number', value: '1' },
        { label: 'Related Catalogue Item', control: 'picker', value: 'Listing credit' },
        { label: 'Administrators', control: 'picker', value: 'What’s On Editors' },
        { label: 'Default Low Service Credits', control: 'number', value: '1' },
      ],
    },
    {
      name: 'Approval and Limits',
      fields: [
        { label: 'Unanswered submission period (days)', control: 'number', value: '7',
          help: 'How long a submission can wait in the Inbox before the unanswered action runs.' },
        { label: 'Unanswered action', control: 'select', value: 'Return credit and expire', opts: ['Return credit and expire', 'Publish automatically'] },
        { label: 'Unanswered subject', control: 'text', value: 'Your What’s On listing was not reviewed in time', full: true },
        { label: 'Unanswered email', control: 'textarea', value: 'Your listing was not reviewed in time; your credit is back in your balance.', full: true },
        { label: 'Maximum event length (days)', control: 'number', value: '7', help: 'Checked when the promoter submits.' },
        { label: 'Listing lead time (days)', control: 'number', value: '60',
          help: 'Caps Publish Start at approval. Not a submission rule: an early listing waits rather than being refused.' },
      ],
    },
    {
      name: 'Listing Fields',
      fields: [
        { label: 'Event contact block', control: 'select', value: 'Yes, collect and publish', opts: ['Yes, collect and publish', 'No, do not collect'],
          help: 'Asks for the contact first name, last name and email, and publishes them on the event page.' },
        { label: 'Description word limit', control: 'number', value: '200', help: 'Maximum words in the event description.' },
        { label: 'Default content creator', control: 'picker', value: '', placeholder: 'Submitting contact',
          help: 'Recorded as Creator on the article. Leave empty to use the submitting contact.' },
      ],
    },
  ],
  facts: [
    { id: 'use', name: 'Applies to', items: [['Channel', 'What’s On'], ['Workflow Profile', 'What’s On approval'], ['Credit path', 'Held at submit, deducted on approval']] },
    { id: 'audit', name: 'Audit', items: [['Created', '17 Sep 2026 at 10:02'], ['Created by', 'George Graham'], ['Last updated', '18 Sep 2026 at 16:40'], ['Last updated by', 'George Graham']] },
  ],
};

const WORKFLOW = {
  file: 'control-workflow-profile',
  name: 'Workflow Profile',
  subtitle: 'What’s On approval',
  crumbs: ['Content', 'Workflow Profiles', 'Workflow Profile'],
  kind: 'edit',
  main: [
    {
      name: 'Main',
      fields: [
        { label: 'Name', control: 'text', value: 'What’s On approval', required: true },
        { label: 'Creation group', control: 'picker', value: 'Event Promoter' },
        { label: 'Publish group', control: 'picker', value: 'What’s On Editors' },
      ],
    },
    {
      name: 'Options',
      fields: [
        { label: 'Hide Publication panel', control: 'toggle', value: true },
        { label: 'Auto Assign Security', control: 'toggle', value: true },
        { label: 'Re-queue on edit of a live article', control: 'toggle', value: true },
      ],
    },
    {
      name: 'Notifications',
      fields: [
        { label: 'Publishers on submission', control: 'toggle', value: true },
        { label: 'Creator on submission', control: 'toggle', value: true },
        { label: 'Creator on approval', control: 'toggle', value: true },
        { label: 'Creator on rejection', control: 'toggle', value: true },
      ],
    },
  ],
  facts: [
    { id: 'use', name: 'Applies to', items: [['Channel', 'What’s On'], ['Inbox owner', 'George Graham'], ['Backup', 'Nicky Murphy'], ['Review target', '2 working days']] },
    { id: 'audit', name: 'Audit', items: [['Created', '17 Sep 2026 at 10:15'], ['Created by', 'George Graham'], ['Last updated', '17 Sep 2026 at 10:15'], ['Last updated by', 'George Graham']] },
  ],
};

const SCREENS = [INBOX, CREDITS, PROFILE, WORKFLOW];

/* ══ Assembly ═════════════════════════════════════════════════════════════ */

function header(spec) {
  const actions =
    spec.kind === 'edit'
      ? `            <button class="btn btn--tertiary" type="button"><i data-lucide="x" aria-hidden="true"></i><span class="cc-header__btn-label">Cancel</span></button>
            <button class="btn btn--primary" type="button" data-wol-toast="Saved."><i data-lucide="check" aria-hidden="true"></i><span class="cc-header__btn-label">Save</span></button>`
      : spec.headerActions || '';
  return `        <div class="cc-header-cq">
        <header class="cc-header cc-header--control">
          <div class="cc-header__title-block">
            <div class="cc-header__title-block-text">
              <h1 class="cc-header__title">${esc(spec.name)}</h1>${spec.subtitle ? `\n              <p class="cc-header__subtitle">${esc(spec.subtitle)}</p>` : ''}
            </div>
          </div>${actions ? `\n          <div class="cc-header__actions">\n${actions}\n          </div>` : ''}
        </header>
        </div>`;
}

function chromeFor(spec) {
  const trail = spec.crumbs;
  return CHROME_OPEN
    .replace(
      '<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Level 1</a></li>',
      trail
        .slice(0, -1)
        .map((c) => `<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">${esc(c)}</a></li>`)
        .join('\n              <li class="breadcrumb__separator" aria-hidden="true"><i data-lucide="chevron-right" aria-hidden="true"></i></li>\n              ')
    )
    .replace('aria-current="page">Level 2</li>', `aria-current="page">${esc(trail[trail.length - 1])}</li>`);
}

const LISTING_CSS = `  <link rel="stylesheet" href="../../components/FilterItem/FilterItem.css">
  <link rel="stylesheet" href="../../patterns/FilterBar/FilterBar.css">`;

function screen(spec) {
  uid = 0;
  const listing = spec.kind === 'listing';
  return `<!doctype html>
<html lang="en" data-brand="cc" data-capture-name="${esc(spec.name)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- GENERATED by _generate.mjs — edit the spec there, not this file. -->
  <!-- Theme resolution only — not dark-mode-toggle.js, whose demo gear tab
       would float over a product screen (same call as ListingScreen). -->
  <script src="../../styles/theme-param.js"></script>
  <title>${esc(spec.name)} · What’s On — Affino Control Centre</title>

  <link rel="stylesheet" href="../../styles/base.css">

  <link rel="stylesheet" href="../../components/Button/Button.css">
  <link rel="stylesheet" href="../../components/Breadcrumb/Breadcrumb.css">
  <link rel="stylesheet" href="../../components/Dropdown/Dropdown.css">
  <link rel="stylesheet" href="../../components/DropdownItem/DropdownItem.css">
  <link rel="stylesheet" href="../../components/Portraits/Portraits.css">
  <link rel="stylesheet" href="../../components/Avatar/Avatar.css">
  <link rel="stylesheet" href="../../components/NotificationBadge/NotificationBadge.css">
  <link rel="stylesheet" href="../../components/Toggle/Toggle.css">
  <link rel="stylesheet" href="../../components/ThemeToggle/ThemeToggle.css">
  <link rel="stylesheet" href="../../components/Input/Input.css">
  <link rel="stylesheet" href="../../components/Select/Select.css">
  <link rel="stylesheet" href="../../components/Textarea/Textarea.css">
  <link rel="stylesheet" href="../../components/Checkbox/Checkbox.css">
  <link rel="stylesheet" href="../../components/Badge/Badge.css">
  <link rel="stylesheet" href="../../components/Table/Table.css">
  <link rel="stylesheet" href="../../components/Datatables/Datatables.css">
  <link rel="stylesheet" href="../../components/Toast/Toast.css">
${listing ? LISTING_CSS + '\n' : ''}
  <link rel="stylesheet" href="../../patterns/Modal/Modal.css">

  <link rel="stylesheet" href="../../cc/components/MainMenuItem/MainMenuItem.css">
  <link rel="stylesheet" href="../../cc/patterns/Sidebar/Sidebar.css">
  <link rel="stylesheet" href="../../cc/patterns/Menu/Menu.css">
  <link rel="stylesheet" href="../../cc/patterns/SidebarMenu/SidebarMenu.css">
  <link rel="stylesheet" href="../../cc/patterns/TopNavigation/TopNavigation.css">
  <link rel="stylesheet" href="../../cc/patterns/Header/Header.css">
  <link rel="stylesheet" href="../../cc/patterns/HeaderGroup/HeaderGroup.css">
  <link rel="stylesheet" href="../../cc/patterns/IconNavigation/IconNavigation.css">
  <link rel="stylesheet" href="../../cc/patterns/ActionsMenu/ActionsMenu.css">
  <link rel="stylesheet" href="../../cc/patterns/ActionsInfoPanel/ActionsInfoPanel.css">
  <link rel="stylesheet" href="../../cc/components/FontSizeSlider/FontSizeSlider.css">

  <!-- Template shells, read-only. Then the prototype's own CSS last. -->
  <link rel="stylesheet" href="../../cc/templates/ControlScreen/ControlScreen.css">
${listing
  ? '  <link rel="stylesheet" href="../../cc/templates/ListingScreen/ListingScreen.css">'
  : '  <link rel="stylesheet" href="../ControlRecordScreen/ControlRecordScreen.css">'}
  <link rel="stylesheet" href="WhatsOnListing.css">
</head>
<body class="cc-control">

${SIDEBARS}

${chromeFor(spec)}

${header(spec)}

${CHROME_CLOSE}

    <div class="cc-control__page${listing ? ' cc-control__page--listing' : ''}">
${listing ? spec.body() : editBody(spec)}
    </div>

  </main>

${RAIL}

${TOAST_MODAL}
${spec.extra ? '\n' + spec.extra() + '\n' : ''}
${SCRIPTS}

  <script src="../../components/Select/Select.js"></script>
  <script src="WhatsOnListing.js"></script>
</body>
</html>
`;
}

const OUT = [];
for (const spec of SCREENS) {
  const name = `${spec.file}.html`;
  writeFileSync(join(DIR, name), screen(spec));
  OUT.push(name);
}
console.log(`Generated ${OUT.length} screens:\n  ${OUT.join('\n  ')}`);
