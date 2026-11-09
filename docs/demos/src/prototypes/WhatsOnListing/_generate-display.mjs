/* WhatsOnListing — display-side screen generator
 * ────────────────────────────────────────────────────────────────────────────
 * Emits the nine promoter-facing screens of the What's On paid listing flow
 * (TASK-344419), from the Hub prototype v13 rev14 screens 1–9:
 *
 *   display-listing.html      1  What's On listing
 *   display-credits.html      2  Listing credits (buy)
 *   display-product.html      3  Product
 *   display-basket.html       4  Basket
 *   display-checkout.html     5  Checkout
 *   display-order.html        6  Order acknowledgement
 *   display-account.html      7  My account › My listings & credits
 *   display-submit.html       8  Submit event
 *   display-received.html     9  Submission received
 *
 * PROTOTYPE-SCOPED (Mark, 2026-09-23): the display side has no Figma source and
 * the design system has no public-site shell, so the site chrome and the new
 * pieces (event row, product card, tabs, order summary, address choice, account
 * nav, result card) are built here as `wod-*` prototype CSS on existing tokens.
 * They are candidates for components once designed — not components.
 *
 * ONE STORY across all nine, and it matches the Control screens: Fiona MacLeod
 * buys a 5-pack on 17 Sep (screens 2–6). Since then one listing went live and
 * one was rejected (credit returned), and today she submits the regatta
 * (screens 8–9). So before submitting: 4 available · 0 held · 1 spent; after:
 * 3 · 1 · 1 — the same numbers as Commerce › Service Credits.
 *
 * Run:  node src/prototypes/WhatsOnListing/_generate-display.mjs
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const icon = (n) => `<i data-lucide="${n}" aria-hidden="true"></i>`;
const go = (file) => `onclick="location.href='${file}'"`;

/* ══ Shared atoms (existing component markup) ══════════════════════════════ */

function btn(label, { variant = 'primary', size = '', ic = '', href = '', attrs = '' } = {}) {
  const cls = `btn btn--${variant}${size ? ' btn--' + size : ''}`;
  return `<button type="button" class="${cls}"${href ? ' ' + go(href) : ''}${attrs ? ' ' + attrs : ''}>${ic ? icon(ic) : ''}${esc(label)}</button>`;
}

function select(label, value, opts, id) {
  return `<div class="sel" data-sel>
            <label class="sel__label" for="${id}">${esc(label)}</label>
            <button id="${id}" class="sel__control" type="button" data-sel-trigger>
              <span class="sel__value">${esc(value)}</span>
              <span class="sel__chevron">${icon('chevron-down')}</span>
            </button>
            <ul class="sel__menu" role="listbox">${opts
              .map((o) => `<li><button type="button" class="sel__menu-item${o === value ? ' sel__menu-item--selected' : ''}" role="option"${o === value ? ' aria-selected="true"' : ''}>${esc(o)}</button></li>`)
              .join('')}</ul>
          </div>`;
}

function input(label, { id, value = '', placeholder = '', type = 'text', help = '', req = false, ic = '' }) {
  return `<div class="input">
            <label class="input__label" for="${id}">${esc(label)}${req ? ' <span class="wod-req" aria-hidden="true">*</span>' : ''}</label>
            <div class="input__wrap">${ic ? `<i data-lucide="${ic}" class="input__icon" aria-hidden="true"></i>` : ''}
              <input id="${id}" class="input__control" type="${type}" value="${esc(value)}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}>
            </div>${help ? `\n            <p class="wod-help">${esc(help)}</p>` : ''}
          </div>`;
}

function checkbox(label, { checked = false, name = '' } = {}) {
  return `<label class="checkbox"><input class="checkbox__input" type="checkbox"${checked ? ' checked' : ''}${name ? ` name="${name}"` : ''}><span class="checkbox__indicator">${icon('check')}</span><span class="checkbox__label"><span class="checkbox__label-text">${esc(label)}</span></span></label>`;
}

function stepper(label, id, value) {
  return `<div class="input input--stepper input--sm">
            <label class="input__label wod-sr" for="${id}">${esc(label)}</label>
            <div class="input__wrap">
              <button type="button" class="input__step input__step--dec" data-input-step="-1" aria-controls="${id}" aria-label="Decrease ${esc(label)}">${icon('minus')}</button>
              <input id="${id}" class="input__control" type="number" value="${value}" min="1" step="1">
              <button type="button" class="input__step input__step--inc" data-input-step="1" aria-controls="${id}" aria-label="Increase ${esc(label)}">${icon('plus')}</button>
            </div>
          </div>`;
}

function badge(label, variant) {
  return `<span class="badge badge--${variant} badge--pill">${esc(label)}</span>`;
}

function breadcrumb(trail) {
  const items = trail
    .map((t, i) =>
      i < trail.length - 1
        ? `<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">${esc(t)}</a></li><li class="breadcrumb__separator" aria-hidden="true">${icon('chevron-right')}</li>`
        : `<li class="breadcrumb__item breadcrumb__item--current" aria-current="page">${esc(t)}</li>`
    )
    .join('');
  return `<nav class="breadcrumb wod-crumbs" aria-label="Breadcrumb"><ol class="breadcrumb__list">${items}</ol></nav>`;
}

/* ══ Money — ex VAT, 20% VAT, LAUNCH20 = 20% off ═══════════════════════════ */
const PRICE = { single: 10, pack: 40 };
const gbp = (n) => '£' + n.toFixed(2);
const BASKET = { name: 'Listing credit 5-pack', qty: 1, unit: PRICE.pack };
const SUB = BASKET.qty * BASKET.unit;
const DISC = SUB * 0.2;
const NET = SUB - DISC;
const VAT = NET * 0.2;
const TOTAL = NET + VAT;

function summaryRows({ totalLabel = 'Grand Total', vatLabel = 'VAT' } = {}) {
  return `<dl class="wod-summary">
            <div class="wod-summary__row"><dt>Subtotal</dt><dd>${gbp(SUB)}</dd></div>
            <div class="wod-summary__row wod-summary__row--discount"><dt>Promotional code <span class="wod-muted">LAUNCH20</span></dt><dd>−${gbp(DISC)}</dd></div>
            <div class="wod-summary__row"><dt>${esc(vatLabel)} (20%)</dt><dd>${gbp(VAT)}</dd></div>
            <div class="wod-summary__row wod-summary__row--total"><dt>${esc(totalLabel)}</dt><dd>${gbp(TOTAL)}</dd></div>
          </dl>`;
}

/* ══ Site shell ════════════════════════════════════════════════════════════ */

const NAV = ['News', 'Sport', 'Community', 'What’s On', 'Leisure', 'Jobs', 'Property'];

function account(state) {
  if (!state.signedIn) {
    return `<div class="wod-account">${btn('Sign in', { variant: 'tertiary', size: 'sm', ic: 'user' })}</div>`;
  }
  const c = state.credits;
  const label = c.held ? `${c.avail} credits · ${c.held} held` : `${c.avail} credit${c.avail === 1 ? '' : 's'}`;
  return `<div class="wod-account">
          <a class="wod-account__credits" href="display-account.html"><span class="pill pill--brand"><span class="pill__label">${esc(label)}</span></span></a>
          <a class="wod-account__who" href="display-account.html">${icon('circle-user')}<span>Fiona MacLeod</span></a>
        </div>`;
}

function header(state) {
  return `  <header class="wod-site">
    <div class="wod-site__bar">
      <a class="wod-site__brand" href="display-listing.html">West Coast Today</a>
      <div class="input wod-site__search">
        <div class="input__wrap"><i data-lucide="search" class="input__icon" aria-hidden="true"></i><input class="input__control" type="search" placeholder="Search" aria-label="Search the site"></div>
      </div>
      ${account(state)}
    </div>
    <nav class="wod-site__nav" aria-label="Sections">
      <ul class="wod-site__nav-list">${NAV.map(
        (n) => `<li><a class="wod-site__nav-link${n === 'What’s On' ? ' wod-site__nav-link--active' : ''}" href="${n === 'What’s On' ? 'display-listing.html' : '#'}"${n === 'What’s On' ? ' aria-current="page"' : ''}>${esc(n)}</a></li>`
      ).join('')}</ul>
    </nav>
  </header>`;
}

const FOOTER = `  <footer class="wod-footer">
    <div class="wod-footer__in">
      <span class="wod-footer__brand">West Coast Today</span>
      <ul class="wod-footer__links"><li><a href="#">About us</a></li><li><a href="#">Contact</a></li><li><a href="#">What’s On listing terms</a></li><li><a href="#">Privacy</a></li></ul>
    </div>
  </footer>`;

/* ══ 1 · What's On listing ═════════════════════════════════════════════════ */
const EVENTS = [
  { d: '26', m: 'Sep', t: 'Taynuilt Highland Games', meta: 'Taynuilt Village Park, Taynuilt · Highland Games · 11:00' },
  { d: '3', m: 'Oct', t: 'Fort William food & drink weekend', meta: 'High Street, Fort William · Food Festivals · 2 days' },
  { d: '3', m: 'Oct', t: 'Lochgilphead farmers’ market', meta: 'Front Green, Lochgilphead · Farmers’ Markets · 09:00' },
  { d: '10', m: 'Oct', t: 'Kintyre Way guided walk', meta: 'Tayinloan car park, Kintyre · Guided Walks & Hikes · 10:00' },
  { d: '11', m: 'Oct', t: 'Bute Highland Games fun run', meta: 'Rothesay Pavilion, Isle of Bute · Sporting Events · 10:30' },
];

function eventRow(e) {
  return `<li class="wod-event">
              <div class="wod-event__date" aria-hidden="true"><span class="wod-event__day">${esc(e.d)}</span><span class="wod-event__month">${esc(e.m)}</span></div>
              <div class="wod-event__text">
                <a class="wod-event__title" href="#">${esc(e.t)}</a>
                <p class="wod-event__meta">${esc(e.meta)}</p>
              </div>
            </li>`;
}

const LISTING = {
  file: 'display-listing', name: 'What’s On listing', state: { signedIn: false },
  crumbs: ['Home', 'Community', 'What’s On'],
  body: () => `      <div class="wod-heading">
        <h1 class="wod-title">What’s On</h1>
        <p class="wod-lede">Community events across Argyll, Lochaber and the islands.</p>
      </div>
      <div class="wod-layout">
        <div class="wod-main">
          <div class="wod-card wod-filters">
            ${select('Area', 'All areas', ['All areas', 'Oban', 'Mid Argyll', 'Fort William', 'Isle of Bute', 'Kintyre'], 'f-area')}
            ${select('Type', 'All types', ['All types', 'Music & Nightlife', 'Sports & Outdoor', 'Family & Kids', 'Fundraisers & Charity', 'Food & Drink'], 'f-type')}
            ${select('When', 'Upcoming', ['Upcoming', 'This weekend', 'Next 7 days', 'This month'], 'f-when')}
          </div>
          <ul class="wod-card wod-events">
            ${EVENTS.map(eventRow).join('\n            ')}
          </ul>
        </div>
        <aside class="wod-aside" aria-label="List your event">
          <div class="wod-card wod-cta">
            <h2 class="wod-cta__title">List your event</h2>
            <p class="wod-cta__text">From £10 a listing (ex VAT). Reviewed by our editors before it goes live.</p>
            ${btn('Buy listing credits', { href: 'display-credits.html' })}
            <a class="wod-link" href="#" data-wod-terms>Listing terms</a>
          </div>
          <div class="wod-ad wod-ad--skyscraper" role="img" aria-label="Advert placeholder, 300 by 600">Advert · 300 × 600</div>
        </aside>
      </div>`,
};

/* ══ 2 · Listing credits ═══════════════════════════════════════════════════ */
function productCard(p) {
  return `<article class="wod-card wod-product">
              <div class="wod-product__media" aria-hidden="true">${icon(p.ic)}</div>
              <div class="wod-product__body">
                <h2 class="wod-product__name"><a href="display-product.html">${esc(p.name)}</a></h2>
                <p class="wod-product__desc">${esc(p.desc)}</p>
                <p class="wod-product__price">${gbp(p.price)} <span class="wod-muted">ex VAT</span></p>
              </div>
              <div class="wod-product__foot">
                ${btn('Add to basket', { href: 'display-basket.html' })}
                <span class="wod-muted wod-small">What’s On listing terms apply</span>
              </div>
            </article>`;
}

const CREDITS = {
  file: 'display-credits', name: 'Listing credits', state: { signedIn: false },
  crumbs: ['Home', 'Store', 'Listing credits'],
  body: () => `      <div class="wod-heading"><h1 class="wod-title">Listing credits</h1></div>
      <div class="wod-layout wod-layout--refine">
        <aside class="wod-card wod-refine" aria-label="Refine products">
          <div class="input"><div class="input__wrap"><i data-lucide="search" class="input__icon" aria-hidden="true"></i><input class="input__control" type="search" placeholder="Search products" aria-label="Search products"></div></div>
          <div class="wod-refine__head"><h2 class="wod-refine__title">Refine</h2><a class="wod-link wod-small" href="#">Clear all</a></div>
          <div class="acc acc--flush" data-acc="multi">
            <div class="acc__item acc__item--open">
              <h3 class="acc__heading"><button type="button" class="acc__trigger" data-acc-trigger><span>Price</span><span class="acc__chevron">${icon('chevron-down')}</span></button></h3>
              <div class="acc__panel wod-stack wod-stack--sm">
                ${checkbox('£0 – £20')}
                ${checkbox('£20 – £40')}
                ${checkbox('£40 – £60')}
              </div>
            </div>
            <div class="acc__item">
              <h3 class="acc__heading"><button type="button" class="acc__trigger" data-acc-trigger><span>Promotions</span><span class="acc__chevron">${icon('chevron-down')}</span></button></h3>
              <div class="acc__panel">${checkbox('Special offers')}</div>
            </div>
            <div class="acc__item acc__item--open">
              <h3 class="acc__heading"><button type="button" class="acc__trigger" data-acc-trigger><span>Category</span><span class="acc__chevron">${icon('chevron-down')}</span></button></h3>
              <div class="acc__panel wod-stack wod-stack--sm">
                ${checkbox('Listing credits', { checked: true })}
                ${checkbox('Digital editions')}
                ${checkbox('Gift shop')}
              </div>
            </div>
          </div>
        </aside>
        <div class="wod-main">
          <div class="wod-toolbar">
            <p class="wod-toolbar__count"><strong>2</strong> products</p>
            <div class="wod-toolbar__sort">${select('Sort by', 'Relevance', ['Relevance', 'Price – low to high', 'Price – high to low'], 'sort')}</div>
          </div>
          <div class="wod-products">
            ${productCard({ ic: 'ticket', name: 'Listing credit', desc: 'Publishes one community event on What’s On once approved by our editors.', price: PRICE.single })}
            ${productCard({ ic: 'tickets', name: 'Listing credit 5-pack', desc: 'Five listings for the price of four. For venues, clubs and promoters who list regularly.', price: PRICE.pack })}
          </div>
        </div>
      </div>`,
};

/* ══ 3 · Product ═══════════════════════════════════════════════════════════ */
const PRODUCT = {
  file: 'display-product', name: 'Product', state: { signedIn: false },
  crumbs: ['Home', 'Store', 'Listing credits', 'Listing credit 5-pack'],
  body: () => `      <div class="wod-card wod-pd">
        <div class="wod-pd__media" aria-hidden="true">${icon('tickets')}</div>
        <div class="wod-pd__info">
          <h1 class="wod-title">Listing credit 5-pack</h1>
          <p class="wod-pd__price">${gbp(PRICE.pack)} <span class="wod-muted">ex VAT</span></p>
          ${badge('Available', 'success')}
          <div class="wod-pd__buy">
            ${stepper('Quantity', 'pd-qty', 1)}
            ${btn('Add to basket', { href: 'display-basket.html', ic: 'shopping-basket' })}
          </div>
          <p class="wod-help"><a class="wod-link" href="#" data-wod-terms>Terms &amp; Conditions</a> for this item, including the no-cash-refund and 12-month expiry rules, are shown here before purchase and agreed again at checkout.</p>
        </div>
      </div>
      <div class="wod-card">
        <div class="wod-tabs" role="tablist" aria-label="Product information">
          <button type="button" class="wod-tab wod-tab--active" role="tab" id="tab-desc" aria-controls="panel-desc" aria-selected="true">Description</button>
          <button type="button" class="wod-tab" role="tab" id="tab-terms" aria-controls="panel-terms" aria-selected="false" tabindex="-1">Terms &amp; Conditions</button>
        </div>
        <div class="wod-tabpanel" role="tabpanel" id="panel-desc" aria-labelledby="tab-desc">
          <p>Five listing credits for the price of four. Each credit publishes one community event on West Coast Today’s What’s On once an editor has approved it.</p>
          <p>Submit your events from My account whenever you like. A credit is held when you submit and only deducted when the listing is approved; if we cannot publish it, the credit goes back to your balance.</p>
        </div>
        <div class="wod-tabpanel" role="tabpanel" id="panel-terms" aria-labelledby="tab-terms" hidden>
          <ol class="wod-terms">
            <li>One credit publishes one event listing once approved.</li>
            <li>A credit is held when you submit and only deducted on approval; a declined listing returns its credit.</li>
            <li>Credits have no cash value and are not refundable, except where a listing fails because of a platform fault.</li>
            <li>Credits expire 12 months after purchase. A 5-pack is not transferable.</li>
          </ol>
        </div>
      </div>`,
};

/* ══ 4 · Basket ════════════════════════════════════════════════════════════ */
const BASKET_SCREEN = {
  file: 'display-basket', name: 'Basket', state: { signedIn: false },
  crumbs: ['Home', 'Store', 'Basket'],
  body: () => `      <div class="wod-heading wod-heading--row">
        <h1 class="wod-title">Shopping basket</h1>
        <div class="wod-actions">${btn('Continue shopping', { variant: 'secondary', href: 'display-credits.html' })}${btn('Checkout', { href: 'display-checkout.html' })}</div>
      </div>
      <div class="wod-layout">
        <div class="wod-main">
          <div class="wod-card wod-card--flush">
            <table class="table wod-table">
              <thead><tr><th scope="col">Product</th><th scope="col">Quantity</th><th scope="col" class="wod-num">Price</th><th scope="col"><span class="wod-sr">Remove</span></th></tr></thead>
              <tbody>
                <tr>
                  <td class="wod-td--full"><div class="wod-line"><span class="wod-line__thumb" aria-hidden="true">${icon('tickets')}</span><span class="wod-line__name">${esc(BASKET.name)}</span></div></td>
                  <td data-label="Quantity">${stepper('Quantity', 'b-qty', BASKET.qty)}</td>
                  <td class="wod-num" data-label="Price">${gbp(SUB)}</td>
                  <td class="wod-num"><button type="button" class="btn btn--tertiary btn--icon btn--sm" aria-label="Remove ${esc(BASKET.name)}">${icon('trash-2')}</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="acc acc--separated" data-acc="multi">
            <div class="acc__item acc__item--open">
              <h3 class="acc__heading"><button type="button" class="acc__trigger" data-acc-trigger><span>Add promotional code</span><span class="acc__chevron">${icon('chevron-down')}</span></button></h3>
              <div class="acc__panel wod-stack">
                <div class="wod-inline">
                  ${input('Promotional code', { id: 'promo', value: 'LAUNCH20' })}
                  ${btn('Apply', { variant: 'secondary' })}
                </div>
                <div class="alert alert--success">
                  <div class="alert__header">
                    <span class="alert__icon">${icon('circle-check')}</span>
                    <div class="alert__text"><span class="alert__title">LAUNCH20 applied.</span><span class="alert__message"> 20% off listing credits.</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="acc__item">
              <h3 class="acc__heading"><button type="button" class="acc__trigger" data-acc-trigger><span>Use store credit</span><span class="acc__chevron">${icon('chevron-down')}</span></button></h3>
              <div class="acc__panel"><p>No store credit on this account.</p></div>
            </div>
          </div>
        </div>
        <aside class="wod-aside" aria-label="Basket total">
          <div class="wod-card wod-stack">
            <h2 class="wod-card__title">Order summary</h2>
            ${summaryRows()}
            ${btn('Checkout', { href: 'display-checkout.html' })}
          </div>
        </aside>
      </div>`,
};

/* ══ 5 · Checkout ══════════════════════════════════════════════════════════ */
function addressChoice(name, lines, checked) {
  return `<label class="wod-choice${checked ? ' wod-choice--selected' : ''}">
                  <span class="radio"><input type="radio" class="radio__input" name="addr"${checked ? ' checked' : ''}><span class="radio__indicator"></span></span>
                  <span class="wod-choice__body"><strong>${esc(name)}</strong>${lines.map((l) => `<span>${esc(l)}</span>`).join('')}</span>
                </label>`;
}

function orderLines() {
  return `<ul class="wod-lines"><li class="wod-lines__row"><span>${esc(BASKET.name)} × ${BASKET.qty}</span><span>${gbp(SUB)}</span></li></ul>`;
}

const CHECKOUT = {
  file: 'display-checkout', name: 'Checkout', state: { signedIn: true, credits: { avail: 0, held: 0 } },
  crumbs: ['Home', 'Store', 'Checkout'],
  body: () => `      <div class="wod-heading wod-heading--row">
        <h1 class="wod-title">Checkout</h1>
        ${btn('Back to basket', { variant: 'tertiary', ic: 'arrow-left', href: 'display-basket.html' })}
      </div>
      <div class="wod-layout">
        <div class="wod-main">
          <section class="wod-card wod-step" aria-labelledby="st-1">
            <div class="wod-step__head"><h2 class="wod-card__title" id="st-1"><span class="wod-step__num">1</span>Invoice address</h2></div>
            <div class="wod-stack">
              <p class="wod-help">Choose an address you have used before.</p>
              <div class="wod-choices" role="radiogroup" aria-label="Invoice address">
                ${addressChoice('Ms Fiona MacLeod, Oban Sailing Club', ['Gallanach Road', 'Oban, Argyll PA34 4LS', 'fiona@obansailing.example'], true)}
                ${addressChoice('Fiona MacLeod', ['12 Combie Street', 'Oban, Argyll PA34 4HN', 'fiona@obansailing.example'], false)}
              </div>
              <div class="wod-actions">${btn('Add new address', { variant: 'secondary', ic: 'plus' })}</div>
            </div>
          </section>
          <section class="wod-card wod-step" aria-labelledby="st-2">
            <div class="wod-step__head"><h2 class="wod-card__title" id="st-2"><span class="wod-step__num">2</span>Final review</h2></div>
            <div class="wod-stack">
              <p>By placing your order you confirm that you have read and agree to the <a class="wod-link" href="#" data-wod-terms>What’s On listing terms</a>, including the no-cash-refund and 12-month expiry rules.</p>
              ${checkbox('I agree to the What’s On listing terms', { checked: true })}
            </div>
          </section>
        </div>
        <aside class="wod-aside" aria-label="Order summary">
          <div class="wod-card wod-stack">
            <h2 class="wod-card__title">Summary</h2>
            ${orderLines()}
            ${summaryRows()}
            ${btn('Place your order', { href: 'display-order.html', ic: 'lock' })}
          </div>
        </aside>
      </div>`,
};

/* ══ 6 · Order acknowledgement ═════════════════════════════════════════════ */
const ORDER = {
  file: 'display-order', name: 'Order acknowledgement', state: { signedIn: true, credits: { avail: 5, held: 0 } },
  crumbs: ['Home', 'Store', 'Order acknowledgement'],
  body: () => `      <div class="wod-heading"><h1 class="wod-title">Order acknowledgement</h1></div>
      <div class="wod-layout">
        <div class="wod-main">
          <section class="wod-card wod-card--accent wod-stack" aria-labelledby="next">
            <h2 class="wod-card__title" id="next">What happens next</h2>
            <p><strong>5 listing credits</strong> have been added to your account and are ready to use.</p>
            <p>Go to My account to submit your event. A credit is held when you submit and only deducted once an editor approves the listing.</p>
            <p class="wod-muted">Your acceptance of the What’s On listing terms is recorded against this order.</p>
            <div class="wod-actions">${btn('Go to My account', { href: 'display-account.html' })}${btn('Submit an event now', { variant: 'secondary', href: 'display-submit.html' })}${btn('Continue shopping', { variant: 'tertiary', href: 'display-credits.html' })}</div>
          </section>
          <section class="wod-card wod-stack" aria-labelledby="thanks">
            <div class="wod-result__head">
              <span class="wod-result__icon wod-result__icon--success" aria-hidden="true">${icon('check')}</span>
              <div>
                <h2 class="wod-card__title" id="thanks">Thank you for your order, Fiona</h2>
                <p class="wod-muted">A confirmation email has been sent to <strong>fiona@obansailing.example</strong>.</p>
              </div>
            </div>
            <dl class="wod-facts">
              <div><dt>Order number</dt><dd>WCT-10482</dd></div>
              <div><dt>Order date</dt><dd>17 Sep 2026</dd></div>
              <div><dt>Invoice address</dt><dd>Ms Fiona MacLeod, Oban Sailing Club, Gallanach Road, Oban, Argyll PA34 4LS</dd></div>
              <div><dt>Payment</dt><dd>Card ending 4242</dd></div>
            </dl>
          </section>
          <div class="wod-card wod-card--flush">
            <table class="table wod-table">
              <thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col" class="wod-num">Price</th></tr></thead>
              <tbody><tr><td class="wod-td--full">${esc(BASKET.name)}</td><td data-label="Qty">${BASKET.qty}</td><td class="wod-num" data-label="Price">${gbp(SUB)}</td></tr></tbody>
            </table>
          </div>
        </div>
        <aside class="wod-aside" aria-label="Order summary">
          <div class="wod-card wod-stack">
            <h2 class="wod-card__title">Order summary</h2>
            ${summaryRows({ totalLabel: 'Total paid' })}
            <p class="wod-help">A VAT invoice is attached to the confirmation email and is available under My account › My orders.</p>
          </div>
        </aside>
      </div>`,
};

/* ══ 7 · My account › My listings & credits ════════════════════════════════ */
const ACCOUNT_NAV = ['My dashboard', 'My details', 'My orders', 'My listings & credits', 'My newsletters', 'Change password'];

function accountNav(active) {
  return `<nav class="wod-card wod-accnav" aria-label="My account">
          <p class="wod-accnav__title">My account</p>
          <ul>${ACCOUNT_NAV.map(
            (n) => `<li><a class="wod-accnav__link${n === active ? ' wod-accnav__link--active' : ''}" href="${n === 'My listings & credits' ? 'display-account.html' : '#'}"${n === active ? ' aria-current="page"' : ''}>${esc(n)}</a></li>`
          ).join('')}</ul>
        </nav>`;
}

function stat(ic, title, value) {
  return `<div class="stat-card">
              <div class="stat-card__icon-wrap">${icon(ic)}</div>
              <div class="stat-card__text"><p class="stat-card__title">${esc(title)}</p><p class="stat-card__value">${value}</p></div>
            </div>`;
}

const LISTINGS = [
  { title: 'Oban Sailing Club open regatta', when: 'Sat 10 Oct 2026 · 10:00', to: 'to Sun 11 Oct · 17:00', status: ['Pending', 'warning'], credit: ['Held', 'warning'], acts: ['Copy', 'Withdraw'] },
  { title: 'Oban Winter Festival ceilidh', when: 'Sat 12 Dec 2026 · 19:30', to: 'until 23:30', status: ['Rejected', 'danger'], credit: ['Returned', 'neutral'], reason: 'Duplicate of an existing listing', acts: ['Copy', 'Edit & resubmit'] },
  { title: 'Argyll Rally spectator day', when: 'Sun 20 Sep 2026 · 09:00', to: 'until 17:00', status: ['Live', 'success'], credit: ['Spent', 'neutral'], acts: ['Copy'] },
];

const ACCOUNT = {
  file: 'display-account', name: 'My listings & credits', state: { signedIn: true, credits: { avail: 3, held: 1 } },
  crumbs: ['Home', 'My account', 'My listings & credits'],
  body: () => `      <div class="wod-layout wod-layout--nav">
        ${accountNav('My listings & credits')}
        <div class="wod-main">
          <div class="wod-heading wod-heading--row">
            <h1 class="wod-title">My listings &amp; credits</h1>
            <div class="wod-actions">${btn('Submit an event', { href: 'display-submit.html', ic: 'plus' })}${btn('Buy more credits', { variant: 'secondary', href: 'display-credits.html' })}</div>
          </div>
          <div class="wod-stats">
            ${stat('ticket', 'Available credits', 3)}
            ${stat('hourglass', 'Held against pending listings', 1)}
            ${stat('circle-check', 'Spent on live listings', 1)}
          </div>
          <div class="wod-card wod-card--flush">
            <h2 class="wod-card__title wod-card__title--pad">My listings</h2>
            <table class="table wod-table">
              <thead><tr><th scope="col">Event</th><th scope="col">Start / end</th><th scope="col">Status</th><th scope="col">Credit</th><th scope="col"><span class="wod-sr">Actions</span></th></tr></thead>
              <tbody>
${LISTINGS.map(
  (l) => `                <tr>
                  <td class="wod-wrap wod-td--full"><strong>${esc(l.title)}</strong>${l.reason ? `<span class="wod-cell-meta">Reason: ${esc(l.reason)}</span>` : ''}</td>
                  <td class="wod-td--full" data-label="Start / end">${esc(l.when)}<span class="wod-cell-meta">${esc(l.to)}</span></td>
                  <td data-label="Status">${badge(l.status[0], l.status[1])}</td>
                  <td data-label="Credit">${badge(l.credit[0], l.credit[1])}</td>
                  <td class="wod-td--full"><div class="wod-actions wod-actions--tight">${l.acts
                    .map((a) => btn(a, { variant: a === 'Withdraw' ? 'alert-outline' : 'secondary', size: 'sm', href: a === 'Copy' || a === 'Edit & resubmit' ? 'display-submit.html' : '' }))
                    .join('')}</div></td>
                </tr>`
).join('\n')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`,
};

/* ══ 8 · Submit event ══════════════════════════════════════════════════════ */
function panel(title, body) {
  return `<section class="wod-card wod-stack" aria-labelledby="p-${title.replace(/\W+/g, '-').toLowerCase()}">
            <h2 class="wod-card__title" id="p-${title.replace(/\W+/g, '-').toLowerCase()}">${esc(title)}</h2>
${body}
          </section>`;
}

function datePick(label, id, iso, shown) {
  return `<div class="datepicker" data-datepicker data-mode="single" data-initial="${iso}">
              <div class="input">
                <label class="input__label" for="${id}">${esc(label)} <span class="wod-req" aria-hidden="true">*</span></label>
                <div class="input__wrap">
                  <input id="${id}" class="input__control" type="text" readonly value="${esc(shown)}" data-datepicker-input>
                  <i data-lucide="calendar" class="datepicker__field-icon" data-datepicker-toggle aria-hidden="true"></i>
                </div>
              </div>
            </div>`;
}

function timePick(label, id, value) {
  return `<div class="tp tp--single">
              <label class="tp__label" for="${id}">${esc(label)} <span class="wod-req" aria-hidden="true">*</span></label>
              <div class="tp__field"><span class="tp__icon">${icon('clock')}</span><input id="${id}" class="tp__control" type="text" value="${esc(value)}"></div>
            </div>`;
}

function multi(label, chosen, all, id) {
  return `<div class="wod-field">
              <span class="input__label" id="${id}">${esc(label)} <span class="wod-req" aria-hidden="true">*</span></span>
              <div class="sel" data-sel-multi>
                <ul class="sel__list" role="listbox" aria-multiselectable="true" aria-labelledby="${id}">${all
                  .map((o) => `<li class="sel__list-item${chosen.includes(o) ? ' sel__list-item--selected' : ''}" role="option"${chosen.includes(o) ? ' aria-selected="true"' : ' aria-selected="false"'} data-multi tabindex="0">${esc(o)}</li>`)
                  .join('')}</ul>
              </div>
            </div>`;
}

const DESC = 'Two days of dinghy and keelboat racing in Oban Bay, open to visiting boats. Spectators welcome on the club slipway; bar and food from 12:00.';

const SUBMIT = {
  file: 'display-submit', name: 'Submit an event', state: { signedIn: true, credits: { avail: 4, held: 0 } },
  crumbs: ['Home', 'My account', 'Submit an event'],
  body: () => `      <div class="wod-heading wod-heading--row">
        <div>
          <h1 class="wod-title">Submit an event</h1>
          <p class="wod-lede">Uses 1 credit once approved. You have <strong>4</strong> available. Editors usually review within 2 working days.</p>
        </div>
        ${btn('Back to my listings', { variant: 'tertiary', ic: 'arrow-left', href: 'display-account.html' })}
      </div>
      <div class="wod-layout">
        <form class="wod-main" onsubmit="return false">
          ${panel('Event details', `            ${input('Event title', { id: 's-title', value: 'Oban Sailing Club open regatta', req: true })}
            <div class="wod-grid-2">
              ${datePick('Start date', 's-start', '2026-10-10', '10 Oct 2026')}
              ${timePick('Start time', 's-start-t', '10:00')}
              ${datePick('End date', 's-end', '2026-10-11', '11 Oct 2026')}
              ${timePick('End time', 's-end-t', '17:00')}
            </div>
            ${input('Venue', { id: 's-venue', value: 'Gallanach Road, Oban', req: true, placeholder: 'Venue name and town' })}
            <p class="wod-help">Times are UK time. Multi-day events are fine, up to 7 days. The listing leaves What’s On automatically after the end date and time. There is no limit on how far ahead you can submit.</p>`)}
          ${panel('Categorisation', `            <div class="wod-grid-2">
              ${multi('Areas (up to 2)', ['Oban'], ['Oban', 'Taynuilt', 'Mid Argyll', 'Inveraray', 'Fort William', 'Isle of Bute', 'Kintyre', 'Isle of Arran'], 's-areas')}
              ${multi('Event types (up to 2)', ['Sports & Outdoor › Water Sports'], ['Sports & Outdoor › Water Sports', 'Sports & Outdoor › Sporting Events', 'Music & Nightlife › Live Music', 'Family & Kids › Highland Games', 'Fundraisers & Charity Events', 'Food & Drink › Farmers’ Markets'], 's-types')}
            </div>
            <p class="wod-help">Pick the town and its wider area so the event shows in both.</p>`)}
          ${panel('About the event', `            <div class="textarea">
              <label class="textarea__label" for="s-desc">Description <span class="wod-req" aria-hidden="true">*</span></label>
              <textarea class="textarea__control" id="s-desc" rows="5" data-wod-words="200">${esc(DESC)}</textarea>
              <div class="textarea__footer"><span class="textarea__char-count"><span data-wod-wordcount>${DESC.split(/\s+/).length}</span> / 200 words</span></div>
            </div>
            <div class="wod-field">
              <span class="input__label">Image</span>
              <div class="drag-drop" data-drag-drop>
                <div class="drag-drop__icon-wrap">${icon('upload-cloud')}</div>
                <div class="drag-drop__text">
                  <p class="drag-drop__title"><strong>Click to upload</strong> or drag and drop</p>
                  <p class="drag-drop__subtitle">One image, JPG or PNG, up to 5 MB. You confirm you have the right to use it.</p>
                </div>
                <input type="file" class="drag-drop__native" data-drag-native accept="image/jpeg,image/png" aria-label="Upload an image">
              </div>
            </div>
            <div class="wod-grid-2">
              ${input('Event website', { id: 's-web', value: 'https://obansailing.example/regatta', ic: 'globe', help: 'The event’s own page or booking page.' })}
              ${input('Facebook page', { id: 's-fb', value: 'https://facebook.com/obansailingclub', ic: 'link', help: 'The event’s Facebook page or Facebook event.' })}
            </div>`)}
          ${panel('Contact information', `            <p class="wod-help">Published on the event page so people can ask about the event. We don’t ask for a phone number.</p>
            <div class="wod-grid-2">
              ${input('Contact first name', { id: 's-first', value: 'Fiona' })}
              ${input('Contact last name', { id: 's-last', value: 'MacLeod' })}
            </div>
            ${input('Email', { id: 's-email', value: 'fiona@obansailing.example', type: 'email' })}`)}
          <div class="wod-card wod-submitbar">
            <p class="wod-help">By submitting you agree to the <a class="wod-link" href="#" data-wod-terms>What’s On listing terms</a> you accepted at purchase.</p>
            <div class="wod-actions">${btn('Cancel', { variant: 'secondary', href: 'display-account.html' })}${btn('Submit for review', { href: 'display-received.html', ic: 'send' })}</div>
          </div>
        </form>
        <aside class="wod-aside" aria-label="About submitting">
          <div class="wod-card wod-card--accent wod-stack">
            <h2 class="wod-card__title">What happens next</h2>
            <p><strong>1 credit is held</strong> when you submit. It is only deducted when an editor approves.</p>
            <p>An approved listing appears 60 days before the event at the earliest, or straight away if the event is sooner.</p>
            <p>If we cannot publish it you get the reason by email and the credit goes back to your balance.</p>
            <p>You can withdraw or edit while it is pending.</p>
          </div>
          <div class="wod-card wod-stack">
            <h2 class="wod-card__title">Your credits</h2>
            <div class="wod-inline wod-inline--wrap">${badge('4 available', 'success')}${badge('0 held', 'neutral')}</div>
          </div>
        </aside>
      </div>`,
};

/* ══ 9 · Submission received ═══════════════════════════════════════════════ */
const RECEIVED = {
  file: 'display-received', name: 'Submission received', state: { signedIn: true, credits: { avail: 3, held: 1 } },
  crumbs: ['Home', 'My account', 'Submission received'],
  body: () => `      <div class="wod-card wod-result">
        <span class="wod-result__icon wod-result__icon--pending" aria-hidden="true">${icon('hourglass')}</span>
        <h1 class="wod-title">Thanks, your event is with our editors</h1>
        <p>1 credit is held for <strong>Oban Sailing Club open regatta</strong>. We usually review within 2 working days and will email you either way. Nothing is deducted until it is approved.</p>
        <p class="wod-muted">It will appear on What’s On as soon as an editor approves it.</p>
        <div class="wod-actions wod-actions--center">${btn('View my listings', { href: 'display-account.html' })}${btn('Submit another', { variant: 'secondary', href: 'display-submit.html' })}${btn('Withdraw and release the credit', { variant: 'tertiary' })}</div>
      </div>`,
};

const SCREENS = [LISTING, CREDITS, PRODUCT, BASKET_SCREEN, CHECKOUT, ORDER, ACCOUNT, SUBMIT, RECEIVED];

/* ══ Terms modal (shared) ══════════════════════════════════════════════════ */
const TERMS_MODAL = `  <div class="modal-overlay" id="wod-terms" role="dialog" aria-modal="true" aria-labelledby="wod-terms-title">
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title" id="wod-terms-title">What’s On listing terms</h2>
        <button class="modal__close" type="button" aria-label="Close" data-wod-close>${icon('x')}</button>
      </div>
      <div class="modal__body">
        <ol class="wod-terms">
          <li>One credit publishes one event listing once approved.</li>
          <li>A credit is held when you submit and only deducted on approval; a declined listing returns its credit.</li>
          <li>Credits have no cash value and are not refundable, except where a listing fails because of a platform fault.</li>
          <li>Credits expire 12 months after purchase. A 5-pack is not transferable.</li>
          <li>Listings must be for a real event in our area; editors may decline any listing.</li>
        </ol>
      </div>
      <div class="modal__footer">${btn('Close', { variant: 'secondary', attrs: 'data-wod-close' })}</div>
    </div>
  </div>`;

/* ══ Assembly ═════════════════════════════════════════════════════════════ */

function screen(spec, i) {
  return `<!doctype html>
<html lang="en" data-capture-name="${esc(`${i + 1} ${spec.name}`)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- GENERATED by _generate-display.mjs — edit the spec there, not this file. -->
  <script src="../../styles/theme-param.js"></script>
  <title>${esc(spec.name)} · What’s On — West Coast Today (prototype)</title>

  <link rel="stylesheet" href="../../styles/base.css">
  <link rel="stylesheet" href="../../components/Button/Button.css">
  <link rel="stylesheet" href="../../components/Breadcrumb/Breadcrumb.css">
  <link rel="stylesheet" href="../../components/Input/Input.css">
  <link rel="stylesheet" href="../../components/Select/Select.css">
  <link rel="stylesheet" href="../../components/Checkbox/Checkbox.css">
  <link rel="stylesheet" href="../../components/Radio/Radio.css">
  <link rel="stylesheet" href="../../components/Textarea/Textarea.css">
  <link rel="stylesheet" href="../../components/DatePicker/DatePicker.css">
  <link rel="stylesheet" href="../../components/TimePicker/TimePicker.css">
  <link rel="stylesheet" href="../../components/DragDropFile/DragDropFile.css">
  <link rel="stylesheet" href="../../components/Accordion/Accordion.css">
  <link rel="stylesheet" href="../../components/Alert/Alert.css">
  <link rel="stylesheet" href="../../components/Badge/Badge.css">
  <link rel="stylesheet" href="../../components/Pill/Pill.css">
  <link rel="stylesheet" href="../../components/Table/Table.css">
  <link rel="stylesheet" href="../../patterns/StatCard/StatCard.css">
  <link rel="stylesheet" href="../../patterns/Modal/Modal.css">
  <link rel="stylesheet" href="WhatsOnDisplay.css">
</head>
<body class="wod-body">

${header(spec.state)}

  <main class="wod-page" id="main">
      ${breadcrumb(spec.crumbs)}
${spec.body()}
  </main>

${FOOTER}

${TERMS_MODAL}

  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <script>lucide.createIcons();</script>
  <script src="../../components/Select/Select.js"></script>
  <script src="../../components/Input/Input.js"></script>
  <script src="../../components/DatePicker/DatePicker.js"></script>
  <script src="WhatsOnDisplay.js"></script>
</body>
</html>
`;
}

const OUT = [];
SCREENS.forEach((spec, i) => {
  const name = `${spec.file}.html`;
  writeFileSync(join(DIR, name), screen(spec, i));
  OUT.push(name);
});
console.log(`Generated ${OUT.length} screens:\n  ${OUT.join('\n  ')}`);
