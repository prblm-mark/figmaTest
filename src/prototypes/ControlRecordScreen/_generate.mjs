/* ControlRecordScreen — screen generator
 * ────────────────────────────────────────────────────────────────────────────
 * Emits all six prototype screens from ONE spec.
 *
 * Why a generator and not six hand-written files:
 *
 *   The whole claim this prototype is testing is that a record's VIEW screen
 *   and its EDIT screen are the same layout, and that only the main column's
 *   row CONTENTS change. Hand-writing them makes that claim unverifiable —
 *   the two files drift on the first edit and the drift looks like a design
 *   decision. Here the section order, section titles, field order and the
 *   entire sidebar come from the same object for both modes, so parity is
 *   structural rather than something to remember.
 *
 *   It also makes the reconciliation step cheap. The view-only / view-and-edit
 *   split in SPEC is PROVISIONAL, read off the live v2 screens on 2026-09-22
 *   and pending Shaz's field inventory. When that lands, a row moves between
 *   `main` and `facts` here and all six screens regenerate consistently.
 *
 * Run:  node src/prototypes/ControlRecordScreen/_generate.mjs
 *
 * Shell partials in _shell/ are extracted verbatim from
 * src/cc/templates/ListingScreen/Articles.html with the relative paths
 * re-based one level up. They are not edited by hand — see _shell/README.md.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const shell = (n) => readFileSync(join(DIR, '_shell', n), 'utf8').replace(/\s+$/, '');

const SIDEBARS = shell('sidebars.html');
const CHROME_OPEN = shell('chrome-open.html');
const CHROME_CLOSE = shell('chrome-close.html');
const RAIL = shell('rail.html');
const TOAST_MODAL = shell('toast-modal.html');
const SCRIPTS = shell('scripts.html');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let uid = 0;
const nextId = () => `crs-f-${++uid}`;

/* ══ Field rendering ══════════════════════════════════════════════════════
 * One function per mode, same wrapper. The ONLY element-level difference is
 * dt/dd vs label/div: a <dt> cannot carry for=, so a <dl> wrapping form
 * controls would lose the label association that makes the row usable.
 * Everything below is written against classes, never against dt/dd/label.
 */

function viewValue(f) {
  const v = f.value;
  switch (f.control) {
    case 'toggle':
    case 'checkbox':
      return v
        ? '<span class="crs-bool crs-bool--on"><i data-lucide="check" aria-hidden="true"></i>Yes</span>'
        : '<span class="crs-bool"><i data-lucide="x" aria-hidden="true"></i>No</span>';
    case 'picker':
      return v
        ? `<span class="badge badge--info badge--pill">${esc(v)}</span>`
        : '<span class="crs-empty">—</span>';
    case 'multiselect':
      return v && v.length
        ? `<div class="crs-chips">${v
            .map((t) => `<span class="pill pill--contrast"><span class="pill__label">${esc(t)}</span></span>`)
            .join('')}</div>`
        : '<span class="crs-empty">—</span>';
    case 'file':
      if (!v) return '<span class="crs-empty">—</span>';
      return `<div class="crs-media">
              <div class="crs-media__thumb" aria-hidden="true"><i data-lucide="${f.icon || 'image'}"></i></div>
              <dl class="crs-media__meta">${v
                .map((m) => `<div><dt>${esc(m[0])}</dt><dd>${esc(m[1])}</dd></div>`)
                .join('')}</dl>
            </div>`;
    case 'richtext':
    case 'textarea':
      return v
        ? v.split('\n\n').map((p) => `<p>${esc(p)}</p>`).join('')
        : '<span class="crs-empty">—</span>';
    default:
      return v ? esc(v) : '<span class="crs-empty">—</span>';
  }
}

function editControl(f, id) {
  const v = f.value;
  switch (f.control) {
    case 'toggle':
      return `<button class="toggle${v ? ' toggle--active' : ''}" type="button" role="switch" aria-checked="${!!v}" aria-label="${esc(f.label)}"></button>`;
    case 'checkbox':
      return `<label class="checkbox"><input class="checkbox__input" type="checkbox"${v ? ' checked' : ''}><span class="checkbox__indicator"></span><span class="checkbox__label"><span class="checkbox__label-text">${esc(f.label)}</span></span></label>`;
    case 'select':
    case 'picker': {
      const opts = f.opts || (v ? [v] : []);
      return `<div class="sel" data-sel>
                <button id="${id}" class="sel__control" type="button" data-sel-trigger>
                  <span class="sel__value">${v ? esc(v) : 'Select…'}</span>
                  <span class="sel__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>
                </button>
                <ul class="sel__menu" role="listbox">${opts
                  .map(
                    (o) =>
                      `<li><button type="button" class="sel__menu-item${o === v ? ' sel__menu-item--selected' : ''}" role="option"${o === v ? ' aria-selected="true"' : ''}>${esc(o)}${o === v ? ' <i data-lucide="check"></i>' : ''}</button></li>`
                  )
                  .join('')}</ul>
              </div>`;
    }
    case 'multiselect': {
      const chosen = f.value || [];
      const all = f.opts || chosen;
      return `<div class="sel" data-sel-multi>
                <ul class="sel__list" role="listbox" aria-multiselectable="true" aria-label="${esc(f.label)}">${all
                  .map(
                    (o) =>
                      `<li class="sel__list-item${chosen.includes(o) ? ' sel__list-item--selected' : ''}" role="option"${chosen.includes(o) ? ' aria-selected="true"' : ''} data-multi>${esc(o)}</li>`
                  )
                  .join('')}</ul>
              </div>`;
    }
    case 'textarea':
    case 'richtext':
      return `<div class="textarea"><textarea class="textarea__control" id="${id}" rows="${f.control === 'richtext' ? 10 : 4}">${esc(v || '')}</textarea></div>`;
    case 'file':
      return `<div class="crs-media crs-media--edit">
                <div class="crs-media__thumb" aria-hidden="true"><i data-lucide="${f.icon || 'image'}"></i></div>
                <div class="crs-media__actions">
                  <button class="btn btn--secondary btn--sm" type="button"><i data-lucide="upload" aria-hidden="true"></i> Replace</button>
                  <button class="btn btn--tertiary btn--sm" type="button">Remove</button>
                </div>
              </div>`;
    case 'datetime':
      return `<div class="input input--sm"><div class="input__wrap"><input id="${id}" type="text" class="input__control" value="${esc(v || '')}" placeholder="dd/mm/yyyy hh:mm"></div></div>`;
    default:
      return `<div class="input"><div class="input__wrap"><input id="${id}" type="text" class="input__control" value="${esc(v || '')}"></div></div>`;
  }
}

function field(f, mode) {
  const mods = [f.full ? 'crs-field--full' : '', f.control === 'textarea' || f.control === 'richtext' ? 'crs-field--textarea' : '']
    .filter(Boolean)
    .join(' ');
  const cls = `crs-field${mods ? ' ' + mods : ''}`;
  const req = f.required ? ' <span class="crs-field__req" aria-hidden="true">*</span>' : '';

  if (mode === 'view') {
    return `          <div class="${cls}">
            <dt class="crs-field__label">${esc(f.label)}</dt>
            <dd class="crs-field__value">${viewValue(f)}</dd>
          </div>`;
  }
  const id = nextId();
  return `          <div class="${cls}">
            <label class="crs-field__label" for="${id}">${esc(f.label)}${req}</label>
            <div class="crs-field__value">${editControl(f, id)}</div>${f.help ? `\n            <p class="crs-field__help">${esc(f.help)}</p>` : ''}
          </div>`;
}

/* A section card. Identical in both modes bar the field-list element. */
function card(sec, mode, i) {
  const listTag = mode === 'view' ? 'dl' : 'div';
  return `      <section class="crs-card" aria-labelledby="crs-s-${i}">
        <div class="crs-card__head">
          <h2 class="crs-card__title" id="crs-s-${i}">${esc(sec.name)}</h2>
        </div>
        <div class="crs-card__body">
          <${listTag} class="crs-fields">
${sec.fields.map((f) => field(f, mode)).join('\n')}
          </${listTag}>
        </div>
      </section>`;
}

/* ══ Sidebar fact blocks — READ-ONLY IN BOTH MODES, so identical in both ══ */
function factBlock(b, model) {
  const rows = (b.items || [])
    .map((it) => `            <div class="crs-fact__item"><dt>${esc(it[0])}</dt><dd>${it[1] === '' ? '<span class="crs-empty">—</span>' : esc(it[1])}</dd></div>`)
    .join('\n');
  const list = rows ? `          <dl class="crs-fact__list">\n${rows}\n          </dl>` : '';
  const extra = b.html || '';
  const more = b.more
    ? `          <a class="crs-fact__more" href="#">${esc(b.more)}<i data-lucide="arrow-right" aria-hidden="true"></i></a>`
    : '';
  return `        <section class="crs-fact" aria-labelledby="crs-fact-${b.id}">
          <h2 class="crs-fact__title" id="crs-fact-${b.id}">${esc(b.name)}</h2>
${[list, extra, more].filter(Boolean).join('\n')}
        </section>`;
}

/* ══ Evidence panels — the wide read-only blocks ══════════════════════════ */

function perfPanel(e, compact) {
  const bars = [2, 3, 2, 4, 3, 5, 4, 6, 5, 9, 14, 22];
  const chart = `<div class="crs-spark" role="img" aria-label="Impressions over the last 12 months, rising to 22 in the most recent month">${bars
    .map((h) => `<span style="height:${Math.round((h / 22) * 100)}%"></span>`)
    .join('')}</div>`;
  if (compact) {
    return `${chart}
          <dl class="crs-fact__list">
            <div class="crs-fact__item"><dt>Impressions</dt><dd>89</dd></div>
            <div class="crs-fact__item"><dt>Per day</dt><dd>4.68</dd></div>
            <div class="crs-fact__item"><dt>Consumed</dt><dd>48</dd></div>
          </dl>`;
  }
  return `        <div class="crs-metrics">
          <div class="crs-metric"><p class="crs-metric__label">Total impressions</p><p class="crs-stat">89</p></div>
          <div class="crs-metric"><p class="crs-metric__label">Impressions per day</p><p class="crs-stat">4.68</p></div>
          <div class="crs-metric"><p class="crs-metric__label">Consumed</p><p class="crs-stat">48</p></div>
          <div class="crs-metric"><p class="crs-metric__label">Bookmarked</p><p class="crs-stat">0</p></div>
        </div>
        ${chart}
        <p class="crs-panel__note">Last 12 months</p>
        <h3 class="crs-panel__sub">Top account impressions</h3>
        <div class="crs-chips">${['Affino', 'Tiger - Lucas Dev Instance', 'Ocean Media Group Ltd', 'CRM AgriCommodities', 'Wyvex Media', 'The Bookseller', 'Green Star Media Ltd']
          .map((t) => `<span class="pill pill--contrast"><span class="pill__label">${esc(t)}</span></span>`)
          .join('')}</div>`;
}

const CONTACTS = [
  ['David Delawa', 'Junior Digital Producer', 'Ocean Media Group Ltd', '4 days 12 hours ago'],
  ['Janice Johnston', 'Commercial Manager', 'Wyvex Media', '7 days 12 hours ago'],
  ['Martin Stewart', 'IT Systems Engineer', 'Wyvex Media', '7 days 12 hours ago'],
  ['Jazz Aduhene', 'Digital Product Assistant', 'Ocean Media Group Ltd', '7 days 12 hours ago'],
  ['Quang Luong', 'Product Director', 'Affino', '14 Sept 2026 at 00:00'],
];

function contactsPanel(compact) {
  if (compact) {
    return `          <ul class="crs-mini">${CONTACTS.slice(0, 3)
      .map(
        (c) =>
          `<li class="crs-mini__row"><span class="crs-mini__name">${esc(c[0])}</span><span class="crs-mini__meta">${esc(c[3])}</span></li>`
      )
      .join('')}</ul>`;
  }
  return `        <div class="datatables">
          <div class="datatables__body">
            <table class="table">
              <thead><tr><th scope="col">Name</th><th scope="col">Account</th><th scope="col">Viewed</th></tr></thead>
              <tbody>${CONTACTS.map(
                (c) =>
                  `<tr><td><span class="crs-person"><span class="crs-person__name">${esc(c[0])}</span><span class="crs-person__role">${esc(c[1])}</span></span></td><td>${esc(c[2])}</td><td>${esc(c[3])}</td></tr>`
              ).join('')}</tbody>
            </table>
          </div>
          <div class="datatables__footer">
            <p class="datatables__count">5 contacts</p>
          </div>
        </div>`;
}

const STEPS = [
  ['Waiting Less - Faster Exports, Reports, and Listings', 1],
  ['Never Losing Your Place - Journeys That Remember', 2],
  ['Harder to Abuse - Stronger Defences Against Bots', 3],
  ['Fewer Spam Complaints - One-Tap Unsubscribe', 4],
  ['Awards and Dynamic Forms - Workflows That Fit', 5],
  ['Upgrade Guidance', 6],
  ['AI and Intelligence', 7],
  ['Marketing', 8],
  ['Content and Publishing', 9],
  ['Commerce', 10],
];

function stepsPanel(compact) {
  if (compact) {
    return `          <ul class="crs-mini">${STEPS.slice(0, 3)
      .map((s) => `<li class="crs-mini__row"><span class="crs-mini__name">${esc(s[0])}</span><span class="crs-mini__meta">${s[1]}</span></li>`)
      .join('')}</ul>`;
  }
  return `        <div class="datatables">
          <div class="datatables__body crs-scroll">
            <table class="table">
              <thead><tr><th scope="col">Title</th><th scope="col">Type</th><th scope="col">Order</th><th scope="col">Created by</th></tr></thead>
              <tbody>${STEPS.map(
                (s) =>
                  `<tr><td>${esc(s[0])}</td><td>Content</td><td>${s[1]}</td><td>Markus Karlsson</td></tr>`
              ).join('')}</tbody>
            </table>
          </div>
          <div class="datatables__footer">
            <p class="datatables__count">1 – 10 of 23</p>
            <nav class="datatables__pagination" aria-label="Article steps pages">
              <button class="datatables__page-btn" type="button" aria-label="Previous"><i data-lucide="chevron-left" aria-hidden="true"></i></button>
              <span class="datatables__page-numbers">
                <button class="datatables__page-btn datatables__page-btn--active" type="button" aria-current="page">1</button>
                <button class="datatables__page-btn" type="button">2</button>
                <button class="datatables__page-btn" type="button">3</button>
              </span>
              <button class="datatables__page-btn" type="button" aria-label="Next"><i data-lucide="chevron-right" aria-hidden="true"></i></button>
            </nav>
          </div>
        </div>`;
}

const PANELS = { perf: perfPanel, contacts: () => contactsPanel(false), steps: () => stepsPanel(false) };
const COMPACT = { perf: () => perfPanel(null, true), contacts: () => contactsPanel(true), steps: () => stepsPanel(true) };

export { };

/* ══ The spec ═════════════════════════════════════════════════════════════
 * PROVISIONAL — read off the live v2 screens 2026-09-22. `main` = a control
 * exists on the Edit screen. `facts` = no control anywhere. `evidence` = wide
 * read-only. Awaiting Shaz's inventory to confirm.
 */

const LOREM_INTRO =
  'Affino 9.0.11.25, The Refinement Update, puts the work into the platform you already run: exports and reports that finish on real data, screens that hold your place as you move through them, sharper defences in front of your site, a one-tap unsubscribe for your recipients, and a new Orders API your other systems can read.';

const LOREM_BODY =
  'Affino 9.0.11.25, The Refinement Update, puts the work into the platform you already run. Exports and reports finish on real data, screens hold your place as you move through them, the defences in front of your site are sharper, and your recipients get a one-tap unsubscribe.\n\nFive headline updates lead the release. We rebuilt more than twenty exports this release, spanning content, commerce, subscriptions, CRM, analytics, ad serving, events, and messaging, along with the listings and reports behind them.';

const SPEC = {
  article: {
    file: 'article',
    name: 'Article',
    title: 'Affino 9.0.11.25 — The Refinement Update',
    crumbs: ['Content', 'Articles', 'Article'],
    hasEvidence: true,
    main: [
      {
        name: 'Navigation',
        fields: [
          { label: 'Zone', control: 'picker', value: 'Affino', required: true },
          { label: 'Section', control: 'picker', value: 'Affino Social Commerce Blog', required: true },
          { label: 'Sort Order', control: 'text', value: '1' },
          { label: 'Multi Display', control: 'multiselect', value: ['Coronavirus Hub', 'AI', 'Insight & Blogs'], opts: ['Coronavirus Hub', 'AI', 'Insight & Blogs', 'Commercial Hub', 'Events'] },
          { label: 'Priority', control: 'select', value: '', opts: ['High', 'Normal', 'Low'] },
        ],
      },
      {
        name: 'Introduction',
        fields: [
          { label: 'Title', control: 'text', value: 'Affino 9.0.11.25 - The Refinement Update', required: true },
          { label: 'Screen Name', control: 'text', value: 'affino-901125-the-refinement-update', help: 'Used in the article URL.' },
          { label: 'Alternative Title', control: 'text', value: '' },
          { label: 'Thumbnail', control: 'file', icon: 'image', value: [['Alt text', 'Affino 9.0.11.25 - The Refinement Update']] },
        ],
      },
      {
        name: 'Main Body',
        fields: [
          { label: 'Alignment', control: 'select', value: 'Center', opts: ['Left', 'Center', 'Right'] },
          { label: 'Main Image', control: 'file', icon: 'image', value: [['Alt text', 'Affino 9.0.11.25 - The Refinement Update'], ['File name', 'ai-1786980189773-12-4bd8a8.jpg'], ['File size', '108 KB'], ['Dimensions', '800 × 800']] },
          { label: 'Audio Version (MP3)', control: 'file', icon: 'music', value: null },
          { label: 'Blog Intro', control: 'textarea', value: LOREM_INTRO, full: true },
          { label: 'Blog Entry', control: 'richtext', value: LOREM_BODY, full: true },
        ],
      },
      {
        name: 'Topics',
        fields: [
          { label: 'Category Topic', control: 'picker', value: '' },
          { label: 'Topics and Keywords', control: 'multiselect', value: [], opts: ['Platform', 'Release', 'Security'] },
        ],
      },
      {
        name: 'SEO',
        fields: [
          { label: 'Page Title', control: 'text', value: 'Affino 9.0.11.25 - The Refinement Update' },
          { label: 'Page Description', control: 'textarea', value: 'Exports and reports that finish on real data, screens that hold your place, sharper defences against bots and spoofing, a one-tap unsubscribe your recipients can actually find, and a new Orders API.', full: true },
        ],
      },
      {
        name: 'Social',
        fields: [
          { label: 'Shareline 1', control: 'text', value: '' },
          { label: 'Shareline 2', control: 'text', value: '' },
          { label: 'Shareline 3', control: 'text', value: '' },
        ],
      },
      {
        name: 'Article Questions',
        fields: [
          { label: 'Question 1', control: 'text', value: 'What does the new Orders API let connected systems read and update?' },
          { label: 'Question 2', control: 'text', value: 'How can recipients unsubscribe directly from Apple Mail, Gmail, or Yahoo?' },
          { label: 'Question 3', control: 'text', value: 'Which bot detection changes help block spoofed or high-velocity scraper traffic?' },
          { label: 'Question 4', control: 'text', value: 'How do per-award terms and shortlist notifications simplify awards management?' },
          { label: 'Question 5', control: 'text', value: 'Which exports and reports were rebuilt to handle large datasets faster?' },
        ],
      },
      {
        name: 'Summary',
        fields: [
          { label: 'Summary', control: 'textarea', full: true, value: 'Affino 9.0.11.25 - The Refinement Update - puts the work into the platform you already run. The new Orders API opens your order book to the systems and agents you run alongside Affino.' },
        ],
      },
      {
        name: 'Publication',
        fields: [
          { label: 'Creator', control: 'picker', value: 'Markus Karlsson' },
          { label: 'Related Authors', control: 'multiselect', value: [], opts: ['Luis Montiel', 'Quang Luong'] },
          { label: 'Publish Start', control: 'datetime', value: '02/09/2026 17:03' },
          { label: 'Publish End', control: 'datetime', value: '02/09/2126 17:03' },
          { label: 'Embargo End', control: 'datetime', value: '01/01/1900 00:00' },
          { label: 'Syndication', control: 'select', value: '', opts: ['None', 'Partial', 'Full'] },
          { label: 'Live', control: 'toggle', value: true },
          { label: 'Private', control: 'toggle', value: false },
          { label: 'Send Via Content / Interest Subscription', control: 'toggle', value: false },
          { label: 'Hide From Search Results', control: 'toggle', value: false },
          { label: 'Exclude From AI Index', control: 'toggle', value: false },
          { label: 'Moderated', control: 'toggle', value: false },
        ],
      },
      {
        name: 'Security',
        fields: [{ label: 'Content Security Right', control: 'select', value: '', opts: ['Public', 'Members', 'Subscribers'] }],
      },
      {
        name: 'Advanced',
        fields: [
          { label: 'External Article ID', control: 'text', value: '' },
          { label: 'Article Type', control: 'select', value: 'Blog', opts: ['Blog', 'News', 'Feature', 'Review'] },
          { label: 'Multimedia', control: 'file', icon: 'film', value: null },
        ],
      },
      {
        name: 'Geo Targeting',
        fields: [
          { label: 'Geo Targeting Type', control: 'select', value: 'None', opts: ['None', 'Include', 'Exclude'] },
          { label: 'Countries', control: 'multiselect', value: [], opts: ['United Kingdom', 'United States', 'Germany'] },
        ],
      },
      {
        name: 'Comments And Ratings',
        fields: [{ label: 'Hide Comments And Ratings', control: 'toggle', value: false }],
      },
    ],
    facts: [
      { id: 'rec', name: 'Record', items: [['Article Code', '626353'], ['Batch Reference', '']] },
      {
        id: 'seo',
        name: 'SEO health',
        html: `          <ul class="crs-advice">
            <li class="crs-advice__item"><i data-lucide="alert-circle" aria-hidden="true"></i>No social sharelines entered</li>
            <li class="crs-advice__item"><i data-lucide="alert-circle" aria-hidden="true"></i>No topics selected</li>
            <li class="crs-advice__item"><i data-lucide="alert-circle" aria-hidden="true"></i>Use subheadings (H2, H3) in the Main Body</li>
          </ul>`,
      },
      {
        id: 'meta',
        name: 'Meta information',
        items: [['Publisher', 'Affino'], ['Creator', 'Markus Karlsson'], ['Rights', '© Comrz Ltd 2009 – 2026'], ['Date', '17:03 02 September 2026'], ['Language', 'English']],
      },
      { id: 'idx', name: 'Index status', items: [['Site Search', '03/09/2026 08:32'], ['Affino.com Assistant', '03/09/2026 08:33']] },
      {
        id: 'audit',
        name: 'Audit',
        items: [['Created', '02/09/2026 17:03'], ['Created by', 'Markus Karlsson'], ['Last updated', '03/09/2026 08:32'], ['Last updated by', 'Luis Montiel'], ['Last view', '22/09/2026 03:21'], ['Impressions', '89']],
        more: 'View audit trail',
      },
    ],
    evidence: [
      { key: 'perf', label: 'Performance', name: 'Performance' },
      { key: 'contacts', label: 'Recent viewers', count: 5, name: 'Recent viewers', more: 'View all contacts' },
      { key: 'steps', label: 'Article steps', count: 23, name: 'Article steps', more: 'View all 23 steps' },
    ],
  },

  icon: {
    file: 'icon',
    name: 'Article Icon',
    title: 'Architecture',
    crumbs: ['Content', 'Article Icons', 'Article Icon'],
    hasEvidence: false,
    main: [
      {
        name: 'Main',
        fields: [
          { label: 'Name', control: 'text', value: 'Architecture', required: true },
          { label: 'Article Profile', control: 'picker', value: '2099 Comrz Rated Icons' },
          { label: 'Target Section', control: 'picker', value: '' },
          { label: 'Section', control: 'multiselect', value: ['Architecture', 'Design', 'Reviews'], opts: ['Architecture', 'Design', 'Reviews', 'Insight'] },
          { label: 'Icon', control: 'file', icon: 'image', value: [['File name', 'architecture-icon.png']] },
          { label: 'Description', control: 'textarea', value: 'Architecture', full: true },
        ],
      },
    ],
    facts: [
      {
        id: 'audit',
        name: 'Audit',
        items: [['Created', '16 Nov 2007 at 16:15'], ['Created by', 'Stefan Karlsson'], ['Last updated', '09 Oct 2013 at 03:29'], ['Last updated by', 'Stefan Karlsson']],
        more: 'View audit trail',
      },
    ],
    evidence: [],
  },
};

/* ══ Assembly ═════════════════════════════════════════════════════════════ */

function header(spec, mode) {
  const actions =
    mode === 'view'
      ? `            <button class="btn btn--tertiary btn--icon" type="button" aria-label="Preview on site"><i data-lucide="eye" aria-hidden="true"></i></button>
            <button class="btn btn--tertiary btn--icon" type="button" aria-label="Duplicate"><i data-lucide="copy" aria-hidden="true"></i></button>
            <button class="btn btn--secondary" type="button"><i data-lucide="plus" aria-hidden="true"></i> Add</button>
            <button class="btn btn--primary" type="button"><i data-lucide="pencil" aria-hidden="true"></i> Edit</button>`
      : `            <button class="btn btn--tertiary" type="button">Cancel</button>
            <button class="btn btn--primary" type="button"><i data-lucide="check" aria-hidden="true"></i> Save</button>`;
  return `        <div class="cc-header-cq">
        <header class="cc-header cc-header--control">
          <div class="cc-header__title-block">
            <div class="cc-header__title-block-text">
              <h1 class="cc-header__title">${esc(spec.name)}</h1>
              <p class="cc-header__subtitle">${esc(spec.title)}</p>
            </div>
          </div>
          <div class="cc-header__actions">
${actions}
          </div>
        </header>
        </div>`;
}

function mainColumn(spec, mode, model) {
  const cards = spec.main.map((s, i) => card(s, mode, i)).join('\n\n');

  /* Model A: the wide read-only evidence becomes tabs at the top of the main
   * column. Model B: it is compressed into the sidebar instead, so the main
   * column is nothing but the editable stack. */
  if (model !== 'a' || !spec.hasEvidence) return cards;

  const tabs = [{ key: 'details', label: 'Details' }, ...spec.evidence];
  const strip = tabs
    .map(
      (t, i) =>
        `            <button class="crs-tab${i === 0 ? ' crs-tab--active' : ''}" type="button" role="tab" id="crs-tab-${t.key}" aria-controls="crs-panel-${t.key}" aria-selected="${i === 0}">${esc(t.label)}${t.count ? ` <span class="crs-tab__count">${t.count}</span>` : ''}</button>`
    )
    .join('\n');

  const panels = spec.evidence
    .map(
      (e) => `      <section class="crs-card" role="tabpanel" id="crs-panel-${e.key}" aria-labelledby="crs-tab-${e.key}" hidden>
        <div class="crs-card__head"><h2 class="crs-card__title">${esc(e.name)}</h2>${e.more ? `<a class="crs-card__head-link" href="#">${esc(e.more)}<i data-lucide="arrow-right" aria-hidden="true"></i></a>` : ''}</div>
        <div class="crs-card__body">
${PANELS[e.key]()}
        </div>
      </section>`
    )
    .join('\n\n');

  return `      <div class="crs-tabs" role="tablist" aria-label="Record sections">
${strip}
      </div>

      <div class="crs-panel" id="crs-panel-details" role="tabpanel" aria-labelledby="crs-tab-details">
${cards}
      </div>

${panels}`;
}

function sidebar(spec, model) {
  const blocks = spec.facts.map((b) => factBlock(b, model));

  /* Model B only: the wide evidence is compressed into the sidebar as a
   * summary plus a link out to the full screen that already exists. */
  if (model === 'b' && spec.hasEvidence) {
    const compact = spec.evidence.map((e) =>
      factBlock({ id: e.key, name: e.name, html: COMPACT[e.key](), more: e.more || 'View full analytics' }, model)
    );
    blocks.unshift(...compact);
  }

  return `      <aside class="crs-aside" aria-label="Record information">
${blocks.join('\n\n')}
      </aside>`;
}

function page(spec, mode, model) {
  const wrapMods = model === 'b' ? ' crs-record--aside-all' : '';
  return `    <div class="cc-control__page">
      <div class="crs-record${wrapMods}" data-mode="${mode}">
        <div class="crs-main">
${mainColumn(spec, mode, model)}
        </div>

${sidebar(spec, model)}
      </div>
    </div>`;
}

function crumbs(spec) {
  return spec.crumbs.map((c) => esc(c)).join(' / ');
}

function screen(spec, mode, model) {
  uid = 0;
  const modelLabel = spec.hasEvidence ? (model === 'a' ? ' · Tabs' : ' · Wide sidebar') : '';
  const title = `${spec.name} · ${mode === 'view' ? 'View' : 'Edit'}${modelLabel} — Affino Control Centre`;

  /* The shell partial carries the listing screen's placeholder trail
   * ("Level 1 / Level 2"). Swap in this record's real path so the captured
   * frame shows where the screen actually sits, not the template's filler. */
  const trail = spec.crumbs;
  const chrome = CHROME_OPEN
    .replace(
      '<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Level 1</a></li>',
      trail
        .slice(0, -1)
        .map((c) => `<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">${esc(c)}</a></li>`)
        .join('\n              <li class="breadcrumb__separator" aria-hidden="true"><i data-lucide="chevron-right" aria-hidden="true"></i></li>\n              ')
    )
    .replace('aria-current="page">Level 2</li>', `aria-current="page">${esc(trail[trail.length - 1])}</li>`);

  return `<!doctype html>
<html lang="en" data-brand="cc">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Theme resolution only — NOT components/dark-mode-toggle.js, which also
       injects the fixed demo gear tab. Same reasoning as ListingScreen: this
       screen is the shell for hundreds of real CC screens and a demo
       affordance floating over it reads as part of the product. -->
  <script src="../../styles/theme-param.js"></script>
  <title>${esc(title)}</title>

  <!-- Base + tokens -->
  <link rel="stylesheet" href="../../styles/base.css">

  <!-- Atom-tier components -->
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
  <link rel="stylesheet" href="../../components/Pill/Pill.css">
  <link rel="stylesheet" href="../../components/Table/Table.css">
  <link rel="stylesheet" href="../../components/Datatables/Datatables.css">
  <link rel="stylesheet" href="../../components/DatePicker/DatePicker.css">
  <link rel="stylesheet" href="../../components/Alert/Alert.css">

  <!-- DS-tier patterns -->
  <link rel="stylesheet" href="../../patterns/Modal/Modal.css">

  <!-- CC-tier components + patterns -->
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
  <link rel="stylesheet" href="../../components/Toast/Toast.css">

  <!-- Template shell (read-only — this prototype adds no rule to it) then the
       prototype's own CSS last. -->
  <link rel="stylesheet" href="../../cc/templates/ControlScreen/ControlScreen.css">
  <link rel="stylesheet" href="ControlRecordScreen.css">
</head>
<body class="cc-control">

${SIDEBARS}

${chrome}

${header(spec, mode)}

${CHROME_CLOSE}

${page(spec, mode, model)}

  </main>

${RAIL}

${TOAST_MODAL}

${SCRIPTS}

  <script src="../../components/Select/Select.js"></script>
  <script src="ControlRecordScreen.js"></script>
</body>
</html>
`;
}

/* ══ Emit ═════════════════════════════════════════════════════════════════ */

const OUT = [];
for (const spec of Object.values(SPEC)) {
  const models = spec.hasEvidence ? ['a', 'b'] : ['a'];
  for (const model of models) {
    for (const mode of ['view', 'edit']) {
      const suffix = spec.hasEvidence ? `-${model}` : '';
      const name = `${spec.file}-${mode}${suffix}.html`;
      writeFileSync(join(DIR, name), screen(spec, mode, model));
      OUT.push(name);
    }
  }
}
console.log(`Generated ${OUT.length} screens:\n  ${OUT.join('\n  ')}`);
