# CRM Record Screens: Contact, Order and Account (View and Edit). Handover

> **Who this is for:** the agent or developer building the Control Centre's Contact, Order and
> Account record screens.
> **Status:** all six screens are **built and tested in this repo**: Contact View, Contact Edit,
> Order View, Order Edit, Account View, Account Edit. **Use them. Don't design or build these
> screens again.** Port them, then wire the data.
> **Read first:** [`record-screens-handover.md`](record-screens-handover.md), the v1 (Article)
> build rules. These three record types run on the **same kit**, so every rule there applies here
> unchanged: generated HTML, tokens only, field rows, pickers, sidebar panels, responsive and
> accessibility. This document covers only what is new or different.
> **Data/API contracts:** [`HANDOVER.md` § Surface: RecordScreen](../HANDOVER.md#surface-recordscreen)
> and [`handover-manifest.json`](handover-manifest.json) → `surfaces.RecordScreen`. The items for
> these screens are prefixed `contact-*`, `order-*` and `account-*` (listed in §6).
>
> Written 2026-10-13. Where this document and the code disagree, **the code wins.** Please report
> the gap.

**Run it:** `npm install && npm run tokens && npm start`, then open
`http://localhost:8080/src/cc/templates/RecordScreen/<page>`. Add `?template=full` to any page
for the full-width layout.

| Screen | Page(s) | Generator | Live screen it reproduces |
|---|---|---|---|
| Contact View | `ContactView.html` + one page per tab (`ContactViewTasks`, `…Communication`, `…Commerce`, `…Events`, `…Demographic`, `…Analysis`, `…PageAnalysis`, `…DigitalAssets`, `…Permissions`). `ContactViewSparse*.html` = the same contact with little data (empty states) | `record_contact.py` | `/control/contacts?screen=UserView` (tabs via `&showTab=`) |
| Contact Edit | `ContactEdit.html` | `record_contact.py` (`edit_sections`) | the contact edit form (`CRMUserDef.cfm`) |
| Order View | `OrderView.html` + `OrderView.js` | `record_order.py` | `/control/order-processing?OrderCode=…` |
| Order Edit | `OrderEdit.html` + `OrderEdit.js` | `record_order.py` | `OrderProcessingEdit.cfm` / `OrderProcessingDef.cfm` + `PaymentDetailsInclude.cfm` |
| Account View | `AccountView.html` + `AccountViewContacts`, `…Tasks`, `…Communication`, `…Commerce`, `…Events`, `…UserAnalysis`, `…PageAnalysis` | `record_account.py` | the account view (13 live tabs) |
| Account Edit | `AccountEdit.html` | `record_account.py` | `CRMAccountDef.cfm` |

Everything is generated: `python3 src/cc/templates/RecordScreen/_generate.py`. **Edit the `.py`,
never the `.html`.** Shared behaviour lives in `RecordScreen.js` / `RecordScreen.css` and the kit
under `src/cc/components` and `src/cc/patterns`.

**Figma:** design system file `Lus07xi8pPXLN87sQIyrEt`. The screens are on page
**"Screens — code-first"** (`4114:4847`), section **Record screens** (`4143:4847`), each at 1440 and
390. These were **built code first and then pushed to Figma**, so the code is the reference. The kit
components (FieldRow, RecordTabs, EditGrid, QuickLinks, ContactCell, RecordTabCard, AvatarGroup) are
native on the View & Edit page and have Code Connect published.

**Demo data is invented.** Live contact records are personal data and this repo is public, so the
people, the account (Northbridge Media) and the order customer are made up. Field sets, labels,
order, options, required marks and help text are taken **verbatim** from the live definitions.

---

## 1. What is shared across all three

- **Header.** View: one primary action and one secondary action, with everything else in the
  kebab (max two buttons, then kebab). Edit: **Cancel** (tertiary; a bordered × on mobile) ·
  **Delete** (`btn--alert`, with a confirm modal) · **Save**, the same as Article Edit.
- **Tabs.** The live tab sets, in their live order. Each tab is its own page in the demo. In the
  build they are one screen with a tab switch.
- **Sidebar** (View): FactPanels like Article's, with CRM activity in place of SEO. Panels reorder
  by dragging the header (`record-sidebar-order`).
- **Counts sit in chips.** A total beside a card title is a neutral count chip, never "48 notes"
  text. Card heads are the same height with or without an Add button.
- **Viewer and contact names are links** in the text colour (not brand teal), underlined on hover
  only (`record-viewer-contact`).
- **Help text (Edit).** Most CC edit screens carry help, so Contact, Order and Account Edit use the
  tabs bar's **"Show help"** switch. It is off by default and remembered per user (localStorage
  `cc-help-text` in the demo; `record-help-preference` asks for a user setting). Mark compared four
  options and chose this one. Reveal-on-focus, tooltips and inline reveal were built and removed,
  so don't bring them back.
- **Read-only rows on Edit** use the `static` edit kind: plain text, not a disabled input.
- **Editable grids** (`m.edit_grid()`): Order Payment / Refund Details, Account Assign Paid / Free
  Subscriptions, Event Credits. Add row / Delete selected run in memory (`record-edit-grid`).
- **Long values** collapse after 6 lines (Paragraph) or 12 (Rich text), with Show more / less
  (FieldRow.js).

## 2. Contact

**View.** All 10 tabs: Details, Tasks, Communication, Commerce, Events, Demographic, Analysis,
Page analysis, Digital assets, Permissions.
- Sidebar: Record / Events / Engagement facts, **Customer signals** (AvatarGroup: five, then a +N
  toggle with a "show less" chevron), Latest activity, Open tasks, Contact notes, Opportunities.
- Analysis tab: stat tiles plus two bar charts (`ContactCharts.js`). Permissions: preferences
  shown as read-only switches, accepted terms (the latest badged Current) and one merged history
  trail.
- Header: Add note (secondary) · Edit (primary) · kebab (Add task, Add pro forma, Add to topic,
  Add to contact list, My contact, Send message, …).
- The **Sparse** pages are the empty-state reference. Build them too.

**Edit.** Nine sections, Contact Details → Service Credits, with fields and help verbatim from the
live definition. **No sidebar.** Accounts are TagBoxes. **Not built:** Custom fields.

## 3. Order

**View** is the "view + processing actions" screen. The actions work in memory (modal → toast), so
you can try every flow:
- **Update status** (+ note, + notify): badges and Status history update (`order-status`,
  `order-history`).
- **Send receipt** / with invoice / message with invoice: validates recipients and counts invoices
  sent (`order-send`).
- **Despatch notification**: courier + AWB, sets Shipped (`order-despatch`).
- **Add attendee** on event lines ("1 of 1 assigned") (`order-items`).
- View invoice and Generate shipping label are stubs (`order-invoice`, `order-shipping-label`).
- In full width the order cards sit flush (`order-card--full`, the FULL map in `RecordScreen.js`).

**Edit.** 67 rows, all with help, on a single Details tab with the Show help switch.
- **Payment / Refund grids are status-driven** (`OrderEdit.js`). Paid Full locks Payment Status,
  which is **disabled, not hidden**.
- **Line items are not editable on orders.** Only pro formas allow that, which matches live.
- **Addresses are three sections.** Column and tab variants were built and rejected.

## 4. Account

**View.** 13 live tabs. The core 8 are built: Details, Contacts, Tasks, Communication, Commerce,
Events, User Analysis, Page Analysis. They reuse Contact's tab builders.
- Sidebar works like Contact's: Record, Contacts, Open tasks, Contact notes, Opportunities and
  Engagement. The Record panel opens with the live **quick links** row: X and LinkedIn when set,
  then Google / ChatGPT / Perplexity on the account name and the address on Google Maps
  (`m.quick_links`).
- Contacts tab: Account contacts with Primary / Marketing / Invoice roles, plus Former and Pending.
- Header: Add contact (secondary) + kebab (Add topic, Add opportunity, Add pro forma, Add to
  account list, Merge account, Generate account security, Audit account, View public account).
- **Not built (live has them):** the other 5 tabs. Within the built tabs these aren't built
  either: account forms, recent AI questions, pro forma orders, order line items, service credits,
  bills, event speakers and award judges. Each is noted on its `account-*` row.

**Edit.** 81 fields with help, verbatim. All profile-gated sections are built: Main, Account
Address, Social Media, Public Information, Subscriptions, Assign Paid / Free Subscriptions,
Overflow Notifications, Event Credits. **Not built:** Advanced.

## 5. Not built yet

- **Account Lookup** on edit screens is still inert, as it is on Article (`record-lookup`).
- Contact Edit Custom fields. Account Edit Advanced. Five Account View tabs.

## 6. Backend items (HANDOVER.md → RecordScreen)

- **Contact:** `contact-record`, `contact-actions`, `contact-sidebar`, `contact-signals`,
  `contact-activity`, `contact-tasks`, `contact-notes`, `contact-opportunities`,
  `contact-demographic`, `contact-events`, `contact-analysis`, `contact-page-analysis`,
  `contact-digital-assets`, `contact-permissions`, `contact-edit`
- **Order:** `order-record`, `order-items`, `order-status`, `order-history`, `order-send`,
  `order-despatch`, `order-invoice`, `order-shipping-label`, `order-notes`, `order-edit`
- **Account:** `account-record`, `account-sidebar`, `account-actions`, `account-contacts`,
  `account-tasks`, `account-notes`, `account-threads`, `account-opportunities`,
  `account-commerce`, `account-events`, `account-analysis`, `account-page-analysis`,
  `account-edit`
- **Shared:** `record-edit-grid`, `record-help-preference`, `record-viewer-contact`,
  `record-sidebar-order`, `record-lookup`, plus the Article-era `record-load` / `record-save`
  pattern

Find every marker: `grep -rn "TODO(backend:RecordScreen)" src/`.
