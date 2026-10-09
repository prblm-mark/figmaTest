# RecordScreen — Figma Notes

CC record screens: **Article View**, **Article Edit**, **Article Steps**. First record type built; the
kit is generic so other record types (Shaz's inventory, ViewOnlyInventory prototype) reuse it.

## Figma Node
- File `Lus07xi8pPXLN87sQIyrEt` · page **View & Edit** `3842:146669` · kit section `3861:1902`

| Screen | Standard | Full width | Code |
|---|---|---|---|
| Article View | `3842:147640` | `3842:152666` | `ArticleView.html` |
| Article Edit | `3842:147155` | `3842:146670` | `ArticleEdit.html` |
| Article Steps | `3842:150779`, `3852:65392` | `3842:154798` | `ArticleSteps.html` |
| Article Steps · Show Detail | `3842:148092` | `3842:153114` | `ArticleSteps.html` + Show details on |
| Article · Import step | — (code-first, 2026-09-30; flag for Figma) | ← same switch | `ArticleStepImport.html` |
| Article steps · Add a step chooser | — (code-first, 2026-09-30) | — | `ArticleSteps.html` modal (`?form=exists` = Dynamic Form unavailable) |
| Article · Add content step | — (code-first, 2026-09-30) | ← same switch | `ArticleStepContent.html` |
| Article · Add dynamic form step | — (code-first, 2026-09-30) | ← same switch | `ArticleStepForm.html` |

Full width is the shell's ONE switch (`control-width.js`), not separate pages — driven by the rail's full-width button, or `?template=full` for demo links.
Every screen frame was swapped to kit instances in Figma on 2026-09-28; the pre-swap drafts are kept
below them as "… — draft backup (pre-swap)".

## Composition
Shell = ControlScreen/ListingScreen app shell, ported as a bundle by `_generate.py` (sidebar menu,
TopNavigation, HeaderGroup, ActionsMenu rail, theme + width scripts). Page body:

- **CC Header Type=Record** (`.cc-header--record`) — Figma RecordHeader `3867:2138`
- **RecordTabs** — Details / Article steps are links between screens; Steps adds Import / + Add
- View / Edit: **RecordSection** × 6 (FieldRow view or edit types) + sidebar **FactPanel** × 7
  (PerformanceSummary, ViewerList, FactList × 4, AdvisoryList)
- Steps: **StepsTable** (Datatables) — Show details expands every row
- Import step (designer, 2026-09-30): the Steps screen with the table replaced by one edit-mode
  **RecordSection** "Import step" — Article Step (lookup → Selector `single`, two columns Article ·
  Article step) + Sort Order (lookup → Selector `sort` over this article's steps, the new step
  appended last and badged "Importing"; default position = steps + 1). The tabs stay — Details
  still leads back to the article — and the tab actions become **Cancel / Save** (both return to
  Article steps). Replaces the legacy "add Article Step Lookup" form + its two popups.
- Add step (designer, 2026-09-30): **+ Add** opens "Add a step" — a Modal `--sm` of two **ActionCards**
  (Right Chevron + the new code-first description line), Content Step / Dynamic Form Step with the
  legacy descriptions. Each links to its screen: the Import frame (tabs stay, Cancel / Save) with four
  stacked RecordSections — the legacy tabs Main / Layout / Background / Publication, the first titled
  by the step type. Fields, order, required flags, defaults and options are affino.com's
  `StepByStepFormDef.cfm` + `LiveEditStepByStepForm.cfm` (2026-09-30), built by `record_step.py`:
  Content = 32 fields; Dynamic Form = Dynamic Form + the file's own shared list (12). Legacy's
  one-Dynamic-Form-Step-per-article rule: `?form=exists` disables that card and says why.
- Edit: two FilterDropdowns **Multi Select Modals** (Multi Display, Topics and Keywords) for TagBox

## Shell paint table (Step 3a — read from the frames 2026-09-28)

| Layout | Wrapper | Value |
|---|---|---|
| Standard | page bg | shell `--cc-ui-primary-bg` (screen frame `#E7EDF0`; the body's own white fill is hidden) |
| Standard | page padding | **= the Listing screen's** (designer, 2026-09-29, for consistency): `.cc-control__page` base — `--ao-spacing-6` desktop, `--ao-spacing-4` <768, same scrollbar-gutter trims. Was `--ao-spacing-5`/5/6 on `.record-screen`. Figma content containers updated: `spacing/6` on the 7 desktop/narrow frames, `spacing/4` on the 2 mobile frames. Tabs → content gap `--ao-spacing-5` (`--ao-spacing-4` below 768, designer amend 2026-09-30) |
| Standard | columns | gap `--ao-spacing-5`; sidebar `max-width: --ao-size-7` (384) |
| Standard | main / sidebar | section gap `--ao-spacing-5` / panel gap `--ao-spacing-5` |
| Full | page | flush (ccWidth), `--ao-surface-primary` |
| Full | columns | gap 0; main column right border `--ao-border-secondary` |
| Full | sidebar | padding `--ao-spacing-5`, gap `--ao-spacing-5`, max-width `--ao-size-7` |

## Interactions (designer, 2026-09-28)
| Element | Behaviour | Owner |
|---|---|---|
| Details / Article steps tabs | navigate between screens; menu open/closed and width persist | links + `RecordScreen.js` |
| Sidebar edge (View / Edit) | drag to resize the sidebar (designer, 2026-09-28 — the Seating Planner model): invisible `role="separator"` strip on the sidebar's leading edge, col-resize cursor; full width tints the main column's border `--ao-surface-contrast` on hover/drag. Min `--ao-size-7` (384, Figma's width — designer), max half the row, ←/→ 16px, Home/End, double-click resets. Width kept per viewer (`localStorage cc-record-sidebar-w`) across View ↔ Edit | `RecordScreen.js` |
| Actions-rail **Minimise** (`fold-vertical` / `unfold-vertical` when on, 2026-10-01) | condensed density, wired client-side (2026-10-09): `data-cc-density="condensed"` via control-width.js, spacing only (ControlScreen.css) | `TODO(backend:ControlScreen) [condensed-preference]` |
| Actions-rail **Full width** (`unfold-horizontal` / `fold-horizontal`, 2026-10-01) | toggles full width (designer, 2026-09-28): `aria-pressed`, rail active look, choice saved (`localStorage cc-width`) and followed on every record screen; `?template=` still wins when present | `control-width.js` (`data-cc-width-toggle`, opt-in per screen) |
| Edit / Cancel | View ↔ Edit screens | links |
| SEO Health ± / Expand all | expand inline | `AdvisoryItem.js` |
| Image details (View) | file facts hidden by default; "Image details" opens them in a Dropdown panel (layout B, designer 2026-09-29) | `Dropdown.js` |
| TagBox × / Select | remove tag · Multi Select Modal (pre-ticked, Apply writes back) | `TagBox.js` |
| Show details | reveals the step body on every row (only) | `StepsTable.js` + `Toggle.js` |
| Step kebab | reveals only that row's columns that did not fit | Datatables / `ListingScreen.js` |
| **Show sidebar** switch (far right of the tabs, View / Edit) | hides / shows the sidebar; **View on, Edit off** by default (in the markup — no flash), then the viewer's own choice **per mode** (localStorage `cc-record-sidebar-view` / `-edit`; handover `record-sidebar-preference`); desktop only — at a ≤1023 page the switch goes and the sidebar stacks under the content (designer, 2026-09-29; code-first, flag for Figma) | Toggle.js + `RecordScreen.js` (`.record-screen--no-sidebar`) |
| Steps Edit Columns / Settings | the listing's own — the steps table runs on ListingScreen.js (`article-steps` config) | `ListingScreen.js` |
| Import (Steps tab actions) | opens the Import step screen | link |
| Header kebab (View, Steps and its Import / Add screens) | the CC header rule — one primary + one secondary, the rest in the kebab: Live view, Related items, Go to list (→ Articles listing), Copy. Edit mode has none (Cancel + Save only) | `Dropdown.js`; `record_kebab()` in `record_markup.py`; HANDOVER `record-live-view` / `record-related-items` / `record-copy` |
| + Add (Steps tab actions) | opens the Add a step chooser; ×, Escape or backdrop closes, focus returns to + Add | `RecordScreen.js` (`data-record-modal-open`) |
| Add step: Cancel / Save | return to Article steps; Save creates nothing (mock) | links + HANDOVER `steps-add-save` |
| Colour rows | swatch + hex follow the native picker | `RecordScreen.js` |
| Import step: Cancel / Save | return to Article steps; Save adds nothing (mock) | links + HANDOVER `steps-import-save` |
| Step checkboxes, pencil, Read the full step, + Add | visual only — backend later | HANDOVER |
| View full analytics, Add to Contact List, Save | backend | HANDOVER |

## Verified (headless Chrome, 2026-09-28)
- All 16 pages' 361 CSS/JS/image refs resolve (HTTP 200).
- Probe: Show details reveals detail rows; select-all ticks 20; advisory ±, Expand all ↔ Collapse
  all; tag remove; modal opens pre-ticked (2) and Apply writes 4 tags back; `?template=full` sets
  `data-cc-width="full"`, 6 `record-section--full`, flat tabs, and Edit keeps `?template=full`.
- Measured: label column 192 / compact term 128; sidebar 384 in both widths.
- Resize probe (both widths): drag −158px → 542; End → 384; Home → half the row; → −16; double-click → 384 + storage cleared; `elementFromPoint` on the edge hits the handle.
- **Open:** max (half the row) and the 16px step are carried from the Seating Planner, not a Figma value; standard width has no hover paint (cursor only) — no edge line exists between the two card columns to tint.
- Light and dark (CC Dark) screenshots checked.

## Open questions / known gaps
- **Tab count 8 vs table total 21** — the Figma draft disagrees with itself; both kept as drawn.
- **Labels differ between View and Edit** as drawn: "Alt Title" / "Alternative Title",
  "Topic & Keywords" / "Topics and Keywords".
- **Advisory descriptions** exist in the design for the first advisory only. The other two expanded blank, so they carry placeholder copy written in the same voice (2026-09-28) — replace with designer/backend copy (the real text comes from the SEO check, `data-backend-todo="seo-advisory-detail"` stays on empty descriptions).
- **Narrow layout (designer-approved 2026-09-28, no Figma frames):** container queries only.
  Tier 1 `@container cs-page (max-width: 1023px)` (the Seating Planner's stack point) stacks the
  columns — sidebar panels go below main in ONE full-width column (a two-up grid left holes beside
  short panels; masonry would make panels jump columns on expand — designer, 2026-09-28); the resize handle is hidden; in full width the main
  divider moves from its right edge to under it. Tier 2 lives in RecordSection: a self-container
  that stacks field rows label-over-value at ≤559 (192 label + ~45ch value + padding). The record
  header goes icon-only below 768 like every CC header (2026-09-30: Add plus, Edit pencil, Cancel x,
  Save check; labels in `.cc-header__btn-label`, names kept by `aria-label`; was labels-kept 2026-09-28). Verified 390 / 820 / 1024–1600:
  no page h-scroll; Steps table scrolls inside `datatables__body`.
- The dark top navigation bar in the Figma screens is still the drawn frame (CC TopNavigation lives
  in the CC file); code uses the real shell.

## Narrow frames in Figma (2026-09-28)
| Frame | Node | Shows |
|---|---|---|
| Article View — Narrow (page ≤1023) | `3905:142428` | 1024 wide: columns stacked, rows side by side |
| Article View — Mobile (390) | `3905:143091` | all stacked, FieldRow `Layout=Stacked`, actions rail hidden, header mobile dress |
| Article Edit — Narrow (page ≤1023) | `3907:17461` | as View |
| Article Edit — Mobile (390) | `3907:17632` | as View |
Built from duplicates of the standard frames (kit instances kept). Mobile header: RecordHeader padding spacing/3 · spacing/4, title font/size-fixed/sm, buttons Size=sm; drawn top-nav breadcrumb clipped and user name hidden, as the code renders.

## The record: affino.com Article 626312 (2026-09-29, code-first)
**`ArticleView.html` / `ArticleEdit.html` ARE affino.com Standard Item 626312**, "How charities can use
Affino AI plugins" (designer, 2026-09-29 — it replaced sf.affino.com 10007 because it is fully written).
Read from `/control/standard-item-edit?Action=view&StandardItemCode=626312` with a logged-in session,
READ ONLY. Data + provenance: `record_article.py` (one table drives both screens). The Figma draft's
six-section 9.0.11.25 content stays in `record_markup.py` for the component demos, and is still what
Figma draws.
- **Main column:** every live section in the live order — 15 sections, 79 fields (Presentation Style,
  Navigation, Introduction, Topics, SEO, Main Body, Geo Targeting, Comments And Ratings, Options,
  Advanced, Social, Article Questions, Summary, Security, Publication). Real copy throughout.
- **Sidebar = the live side sections:** Performance (56 impressions · 28 consumed · 0 bookmarked, top
  accounts Affino + Burning Nights CRPS Support), Recent Viewers (the 5 live viewers), Record (code
  626312), Meta Information (Topics), Index Status (3), Audit. SEO Health stays demo (not on the live view).
- Check-marks read from the live icons (TBY = yes, TBN = no): only **Live** is on. Embargo End's live
  `01/01/1900 00:00` is the platform's "not set" and renders unset.
- **Known gaps:** the thumbnail / main image is the repo placeholder (the real asset was not copied);
  the Performance chart series is still the demo series (its scale does not match 56 impressions);
  "Impression Per Day" 0.15 is derived (56 / 365). Viewer avatars are generated placeholders.
- **New FieldRow kinds, code-first — FLAG FOR FIGMA:** `rich`, `checkbox`, `date` / `datetime`,
  `lookup`, `image`, `file` (see FieldRow.figma-notes.md). FactPanel gained `.fact-panel__empty`.
- Handover: `record-lookup`, `record-datetime`, `record-rich-text`, `record-media-file`.

## Selectors (2026-09-29)

Section, Creator and Sort Order (lookup rows) and every MediaPicker **Edit** open the Selector pattern (`src/cc/patterns/Selector/`, code-first): Type=Single / Media / Sort. Multi Display, Topics, Countries and Authors keep the TagBox Multi Select Modal, which now has search and a count. Account is still an inert lookup (`record-lookup`).

## Sidebar chips border (designer, 2026-09-29)

Tertiary chips in the sidebar (FactPanel values, Recent Viewers companies) carry the subtle `--ao-border-secondary` line of the listing account chip. This is a Case B override in RecordScreen.css, scoped to `.record-screen__sidebar` and restated for hover and focus.

## Figma build 2026-09-30 — ColorPickerInput
**ColorPickerInput `3929:19338`** (State Empty | Filled), View & Edit kit "Code-first components". Empty reads None.

## Figma build 2026-09-30 — the code-first screens
View & Edit page, right of the kit: **Import step `3933:19459`**, **Add content step `3933:149547`** (its 20-row main section is a
detached RecordSection — the set has 8 row slots), **Add dynamic form step `3933:150608`**, **Add a step chooser `3933:147201`** and
its **Dynamic Form unavailable** state `3933:147334` (the modal is composed from ModalHeader + the Modal Small look: its slot cannot
be laid out from an instance). Still not in Figma: Selector (all types), RichTextEditor, PromptModifier.

**Card border + shadow (designer, 2026-10-02):** RecordTabs, RecordSection and the sidebar FactPanels use
`--ao-border-card` + `--ao-shadow-2xs` (RecordScreen.css), the same as the listing cards. In standard width
only for tabs and sections, since full width keeps their flush rules. FactPanels keep `border/card` in full
width but drop the shadow. Nested cards inside them are unchanged. The Steps table gets it from the listing
rule (it sits in `.cc-listing`).

## Contact View (code-first "build first", 2026-10-07)

`ContactView.html` (a fully filled contact) and `ContactViewSparse.html` (a sparse one), generated by
`_generate.py` from **`record_contact.py`**: the kit's second record type. The structure is the live contact screen's
(`/control/contacts?screen=UserView`, read 2026-10-07 from two real contacts); **the people are invented**: the live
records hold personal details and these demos are public (Ofcom drama phone ranges, `.example` email domains).
No Figma frame yet.

- **Header:** Record type "Contact" + name; **Edit** (primary) + **Add note** (secondary), the live screen's other twelve
  quick actions / action links in the kebab (CC header rule), plus Go to list.
- **Tabs:** the live ten: Details, Demographic, Tasks, Communication, Commerce, Events, Analysis, Page analysis, Digital
  assets, Permissions; all built (see below). "Badges" and "Assign customer signal" sit beside the live tabs but are
  actions: Badges is in the kebab, Assign on the Customer signals panel. The list scrolls sideways when tight.
- **Main:** Contact (Photo = Avatar Size=4, Name, Job title, Email, Telephone, Mobile, Address) · Accounts (Account,
  Former accounts, Connections as chips) · Interests and lists (Topics, Mailing lists, Contact lists). Empty = "-".
- **Sidebar (CRM activity, designer 2026-10-07):** Record facts · Customer signals (AvatarGroup, five then +N) ·
  Latest activity · Open tasks · Contact notes · Opportunities (open / closed / won value + latest) · Events ·
  Engagement. Panels link "View all" to the matching (unbuilt) tab.
- **Kit additions** (Article output byte-identical): `view_row(kind="html")`; `record_header(secondary=, more=)`;
  `record_tabs(tabs=)`; `record_list()` + `.record-list*` CSS (ViewerItem's type and spacing, the card border as divider);
  `build(crumbs=)`.
- **Backend:** `contact-record`, `-actions`, `-signals`, `-activity`, `-tasks`, `-notes`, `-opportunities`, `-crm-tabs`,
  `-sidebar` (HANDOVER.md, RecordScreen).
- Checked: no overflow 340–1600px (page swept in 20px steps); kebab opens with the 13 actions.

### Contact tabs: Communication and Commerce (2026-10-07)

`ContactViewCommunication.html` / `ContactViewCommerce.html` (+ the `Sparse` pair for the empty states): the tab bar,
then full-width Datatables cards (as Article Steps), each a `data-fit="even"` table (DatatablesFit.js). The sidebar
panels' "View all" now link here; the other tabs are still labels.
- **Communication** = "Contact notes 48" + Add note: Note (title + summary, keep, ×3), Created (keep); drop order
  Updated by → Last updated → Opportunity → Account → By → Type. Footer "Showing 8 of 48" + Show more.
- **Commerce** = "Open opportunities" + Add opportunity, then "Closed opportunities": Opportunity (keep, ×2), Stage
  (badge), Value (keep); drop order Next task → Notes → Owner → Contract → Close date → Last touch.
- DatatablesFit fixes found here: when every column's content is wider than an even share, keep natural widths and
  share the rest by weight (unset widths had split the row equally, kebab included); the kebab always gets its own
  width; and once nothing more can drop, a fluid column wraps below its 192px floor before the row overflows.
  Re-swept Live Dashboard, Sales Leaderboard and Export System afterwards: no overflow at 340–1600px.

### All ten contact tabs built (2026-10-07)

`ContactView{Tab}.html` and `ContactViewSparse{Tab}.html` for Demographic, Tasks, Communication, Commerce, Events, Analysis,
PageAnalysis, DigitalAssets, Permissions (content read from the live tabs, `&showTab=…`). Each tab page = the tab bar +
full-width cards; related cards pair up in `.contact-tab-grid` (two ≥512px columns, one when narrow).
- **Demographic:** a RecordSection per demographic set (named by the sites / areas it covers), values as chips.
- **Tasks:** Open tasks (+ Add task) and Closed tasks tables: Task (keep ×3), Due / Completed (keep), Assigned to,
  Priority (badge), Related to, Created.
- **Events:** Event attendance + Award entries tables, side by side.
- **Analysis:** Activity statistics (facts) + Engagement points by type; All customer signals + Latest activity;
  Views per day + Top views (empty states, as live).
- **Page analysis:** Profile page stats (three StatCards) with "View on Site Analysis"; Recent viewers + Referring URLs.
- **Digital assets:** Subscriptions (+ Subscription history / Edition circulation / Service credits links); Digital
  assets + Service credit entries.
- **Permissions:** User preferences + Terms and conditions; User permissions; the four subscription / download histories.
- **Card head:** title + **count chip** (house rule: a count sits in a neutral chip, never in running text; the sidebar's
  Contact notes / Customer signals counts moved into chips too, via `fact_panel(count=)` + `count_chip()`), min-height
  = the Add button's 32px so heads match with or without a button; the Add button goes icon-only below 767 (cs-page)
  so it never wraps under the title.
- **Fix:** the sidebar's saved panel order was keyed `:article` for every record type, so Contact's order rearranged
  Article's; it is now keyed per `data-record-type` (`page(record_type=)`).
- Checked: all 20 contact pages at 390 / 1024 / 1600px in iframes: no overflow, matching head heights side by side.

### Analysis made visual + equal panel heights (2026-10-07, designer)

- **Equal heights:** cards in a `.contact-tab-grid` row stretch to the tallest (`align-items: stretch`), on every tab.
- **Analysis:** four StatCard tiles (Logins 365 days, Page views 365 days, Message opens, Forum posts; lagoon-first
  accents) · **Engagement points by type** as a sorted horizontal bar chart · **Activity by month** (customer-signal
  events, 12 months, the current month soft + edged "to date") · **All customer signals** as a ranked list: each
  signal's icon, name, count and a share-of-top bar (Live Dashboard's leaderboard) · **Latest activity** with each
  event's signal icon · the remaining statistics as facts · Content views (empty state, as live).
- Charts: `ContactCharts.js` draws any `canvas[data-contact-chart]` (one lagoon series, house bar shape, tooltip, no
  legend; values in a "View as table" under each). Dataviz rules: single hue, sorted bars, no dual axis.
- **Signal icons in timelines:** `record_list` takes an optional glyph per row; the sidebar's Latest activity uses it too.
- Checked all 20 contact pages at 390 / 1024 / 1600: no overflow; side-by-side cards and heads match; all 12 charts draw.
- **Trail layout (2026-10-07, designer, Flowbite Timeline):** Latest activity (sidebar + Analysis) is `record_list(timeline=True)`:
  a 1px border-secondary line runs behind the 32px signal-icon circles (centred, first to last; the house VersionHistory
  timeline pattern), the time sits above the event in contrast ink, no row dividers; each circle has a surface-primary
  ring so the line reads as a trail between events. Measured: icon centres and the line share one x.
- **Permissions reworked (2026-10-07, designer picked ideas 1, 2, 4):** yes / no preferences as read-only switches
  (Toggle xxs, `aria-disabled` so Toggle.js leaves them, not greyed) with On / Off in words; Terms and conditions sorted
  newest first, the latest badged **Current** and older versions muted; the four subscription / download histories
  merged into one **Subscription and download history** trail (timeline layout, newest first, an icon per kind:
  mailing list, content subscription, media download, forum subscription).
- **Signal icon colours (demo only, 2026-10-07, designer):** the glyph circles standing in for customer-signal badge
  images take the StatCard soft scheme (`accent-*-soft` background, `accent-*-soft-fg` glyph), one fixed hue per glyph
  (`record_markup.signal_hue`, lagoon first, blue last, no red) so a signal is the same colour everywhere: the sidebar
  AvatarGroup, the Analysis ranked list, the activity and history trails, and Article View's Recent Viewers signals.
  Live builds replace the circles with each signal's Badge On image.
- **Rings follow the surface (2026-10-07):** the AvatarGroup ring and the timeline icon ring read `--ring-surface`,
  set by AvatarGroup.js from the surface they sit on (the timeline list carries `data-ring-surface`).

## Order View (code-first "build first", 2026-10-07) — NOT in Figma yet

`OrderView.html`, generated from `record_order.py` (content) + `OrderView.js` (processing flows).
Structure from the live `/control/order-processing?OrderCode=100412`; the order, product and dates are
the live order's, the **customer is invented** (Thomas Reid, Harbour Lane Publishing; Ofcom drama
phone range, `.example` email, documentation IP range).

- **Header:** Edit (primary) + Update status (secondary); the live receipt / invoice / label / despatch
  links in the kebab, then Go to list (the Orders listing).
- **Main column:** Order · Line items card (DatatablesFit table, attendee block "0 of 1 assigned" +
  Add attendees, right-aligned totals) · Payment · Payment details card · Customer (+ end user) ·
  Addresses (invoice / billing / delivery) · Delivery (AWB, Invoices sent) · Additional information.
- **Sidebar:** Status (badge + Change, order facts) · Status history (trail timeline) · Customer ·
  Contact notes · Next task · Audit.
- **Processing modals (working demo, in memory):** Update status (all 16 listing statuses, note,
  notify) · Send receipt · Send receipt with invoice · Send message with invoice · Despatch
  notification (courier + AWB → Shipped) · Add attendee ("Use the customer's details" prefill).
  Each validates required / email fields inline, closes, updates the page, appends history, toasts.
- Status badge tones: done = success, waiting = warning, moving = info, stopped = neutral
  (`STATUS_TONE` in both the .py and the .js).
- Backend rows: `order-*` in HANDOVER.md.

## Contact Edit (code-first, 2026-10-09) — no Figma frame

`ContactEdit.html`, generated from `record_contact.edit_sections()`. It follows ArticleEdit's
pattern (header Cancel · Delete · Save, the Contact tab bar) with **no sidebar** (Mark). Fields,
order, required marks and help text are verbatim from the live `AfcCommunityMgr/CC/CRMUserDef.cfm`
(CProperties slot [8] = help, [13] = required), plus its `AvatarField.cfm` and `CountryFields.cfm`
includes. There are nine sections: Contact Details, Accounts (the contact's accounts as TagBoxes),
Topics, Social Media, Profile & Subscriptions, Main Address, Additional Information, Job Seeker and
Service Credits. Custom (a DesignScript include) is not built.

Kit additions:
- **Help on every edit type.** `edit_row(help_text=)` now renders a help line under any control,
  not only Input, wired with `aria-describedby`.
- **The `radio` edit type:** DS Radio options in a wrapping row, aligned as a checkbox row.
- **The `file_icon=` parameter** for the `file` type (the CV upload uses `file-text`).
- **"Show help" switch:** `record_tabs(help_toggle=True)` + `page(help_mode="switch")`. Help lines are
  hidden until the switch is on, which is saved per viewer (FieldRow.js). Mark chose it on
  2026-10-09 from four options compared on this screen. The rejected three were an info button that
  revealed the line, the same button with a tooltip, and help on focus. ArticleEdit sets no mode, so
  its help line always shows, as before.

## Order Edit (code-first, 2026-10-09) — no Figma frame

`OrderEdit.html` is generated by `record_order.edit_sections()` from the live
`AfoECommerce/CC/OrderProcessingDef.cfm` (edit = `OrderProcessingEdit.cfm`, Action=change) and
`PaymentDetailsInclude.cfm`. All 67 rows carry help, so the screen has the Show help switch, on a
single Details tab since Order View has no tab bar. There is no sidebar.

- **Read-only rows** (Order No., Customer, End User, Gateway Reference, Payment ID) are the new
  `static` edit kind: text, aligned like a checkbox row (Mark: plain text rows).
- **Payment / Refund Details grids:** an editable DS Table with Add row / Delete selected.
  `OrderEdit.js` shows them by status: payment at Paid Partial / Paid Full, refund at Partially
  Refunded / Refunded. Paid Full locks Payment Status at Paid; live hides the select, here it is
  disabled so the value stays readable.
- **Addresses:** one section each for Invoice, Billing and Delivery, as live. Mark chose this on
  2026-10-09 over one section with three columns or with tabs, which were built and removed.
- **Left out for this order:** Pro Forma, Purchase Order, Delivery Date. Line items aren't editable
  on an order; they are edited on the Pro Forma.

## Account View + Edit (code-first, 2026-10-09) — no Figma frame

These pages are generated from `record_account.py`, built on the live account screens:
`AfcCommunityMgr/CC/Accounts.cfm` routes AccountView to `CRMAccountView.cfm` and AccountEdit to
`CRMAccountEdit.cfm`, both driven by `CRMAccountDef.cfm`. The account is Northbridge Media, Olivia
Bennett's account on Contact View, with invented people.

- **View:** all 13 live tabs, in their live order. Mark's core set is built:
  - **Built:** Details, Contacts, Tasks, Communication, Commerce, Events, User Analysis and Page
    Analysis. Tasks, Communication notes, Commerce opportunities, Events and Page Analysis reuse
    Contact View's tab builders, with their markers retagged `account-*`.
  - **New:** the Contacts tab (avatar, name and job cell, role chips) and User Analysis.
  - **Labels only:** Content, Digital Assets, Projects, Campaign Dashboards and Engagement Report.
  - **Defaults:** Details leads. Live defaults to Communication and remembers the last tab per user.
  - **Sidebar, as Contact View:** the live header's info and data blocks become the Record, Contacts,
    Open tasks, Contact notes, Opportunities and Engagement panels.
- **Edit:** 81 fields with help verbatim from the source (80 have help; Website has none), behind
  the Show help switch. Every CRM-profile-gated section is built (Mark). Advanced (DesignScript) is
  not.
- **New kit piece:** `record_markup.edit_grid()`. It is the editable grid now shared by the Order
  Payment / Refund grids and the Account Paid / Free Subscriptions and Event Credits grids. Display
  columns render as text, and Add row / Delete selected live in `RecordScreen.js`. Use
  `show_title=False` when the grid is a section's only content.

- **Quick links** (`record_markup.quick_links`, 2026-10-09) sit at the top of the sidebar Record
  panel on Contact View and Account View. This is the live view header's insight row: X and LinkedIn
  when set, Google / ChatGPT / Perplexity searches, and (accounts) Google Maps. The brand marks are
  the live SVGs in `img/quick-links/`, an approved exception to Lucide-only (Mark).
