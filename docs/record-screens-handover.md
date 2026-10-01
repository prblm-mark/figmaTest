# Record Screens (View / Edit / Article Steps) — v1 Build Rules for the Backend Team

> **Who this is for:** the team wiring the Control Centre record screens, starting with
> **Article**: View, Edit, and the Article steps tab (list, Import step, Add step).
> **What it is:** every rule, behaviour and design decision the v1 templates already encode, so
> that the next record type (and the next 400 fields) look and behave like Article.
> **What it is not:** the data/API contracts. Those live in
> [`HANDOVER.md` § Surface: RecordScreen](../HANDOVER.md#surface-recordscreen) (34 items) and
> [`docs/handover-manifest.json`](handover-manifest.json) → `surfaces.RecordScreen`. Read both.
>
> Written 2026-10-01 from the templates, their decision log
> (`src/cc/templates/RecordScreen/RecordScreen.figma-notes.md`) and each kit component's
> `*.figma-notes.md`. Where this document and the code disagree, **the code wins, and please
> report the gap.** Companion to [`listing-screens-handover.md`](listing-screens-handover.md);
> the Steps table *is* a listing screen, so everything there applies to it too.

**Reference screens** (run `npm install && npm run tokens && npm start`, then open
`http://localhost:8080/src/cc/templates/RecordScreen/<page>`):

| Screen | Page | Figma (file `Lus07xi8pPXLN87sQIyrEt`, page View & Edit) |
|---|---|---|
| Article View | `ArticleView.html` | `3842:147640` (full width `3842:152666`) · narrow `3905:142428` · mobile `3905:143091` |
| Article Edit | `ArticleEdit.html` | `3842:147155` (full width `3842:146670`) · narrow `3907:17461` · mobile `3907:17632` |
| Article steps | `ArticleSteps.html` (Show details toggle) | `3842:150779` / `3852:65392`; Show details `3842:148092` |
| Add a step chooser | `ArticleSteps.html` → **+ Add** (`?form=exists` = Dynamic Form unavailable) | `3933:147201` / `3933:147334` |
| Import step | `ArticleStepImport.html` | `3933:19459` |
| Add content step | `ArticleStepContent.html` | `3933:149547` |
| Add dynamic form step | `ArticleStepForm.html` | `3933:150608` |

Add `?template=full` to any of them for the full-width layout. Kit components live in section
`3861:1902` on the same Figma page; Code Connect is published for the kit.

> `src/prototypes/ArticleSteps/` (variants a–d) was the exploration that led to the Steps design.
> It is **not** the reference and is not part of this handover. Use the templates above.

---

## 1. The rules that matter most

1. **The HTML is generated. Never edit it.** Every record page *and* every kit demo is written by
   `src/cc/templates/RecordScreen/_generate.py` from `record_markup.py` (kit builders),
   `record_article.py` (Article 626312's field set and sidebar values), `record_step.py` (Add step
   field sets), `steps_data.py` and `record_sort_data.py`. Run
   `python3 src/cc/templates/RecordScreen/_generate.py` after any change. The demo and the screens
   come from the same functions, so they cannot drift. **That module is the render seam:** in the
   real build the record payload replaces the content constants, and nothing else should change.
2. **One kit, every record type.** Article is only the first. Header, tabs, sections, field rows,
   sidebar panels and pickers are generic. A new record type is new content constants, not new
   components. Do not fork the kit per record type.
3. **The demo article is real.** View and Edit are affino.com Standard Item **626312** ("How
   charities can use Affino AI plugins"), read-only from the live CC on 2026-09-29: 15 sections,
   79 fields, in the live order, with live labels, options and required flags. Treat field order
   and section order as the spec.
4. **The CC header rule: one primary + one secondary, everything else in the kebab.** View and
   Steps: **Add** (secondary, a new article) + **Edit** (primary), then a kebab holding *Live view · Related items · Go
   to list · Copy* (the legacy icon actions). Edit mode has **Cancel + Save only**, no kebab. Do
   not add icon-only buttons to the header (designer, 2026-09-30, Figma CC Header `4105:3640`).
5. **Save is the page's only primary button.** Generate, Select, Choose file, Use image and the
   like are secondary, so there is never a second primary competing with Save.
6. **Tabs are links between screens, not client-side tabs.** Details ↔ Article steps navigate.
   Sidebar open/closed, full width and the menu state persist across the switch.
7. **Container queries, never viewport queries, for layout.** The docked sidebar menu changes the
   content column with no window resize. Use `cs-page` and the components' own containers in CSS
   and a `ResizeObserver` in JS. **Never `matchMedia`.** (See §6 for the deliberate `@media` exceptions.)
8. **Tokens only.** Every colour, size, space and radius is an `--ai-*` token. Borders and shadow
   offsets are the only raw px. A value with no token is a question for the designer, not a hardcode.
9. **Permissions decide what renders.** Edit, Save, Copy, + Add, Import, the step pencil and each
   field's editability must only appear for an operator allowed to use them. The backend supplies that.
10. **Ids are submitted, names are displayed.** Every lookup, selector, tag and media slot shows a
    name but must submit the record's id/code (MediaItemCode, section code, member code, step id).
    The demo writes names into fields because it has no ids. Do not copy that.

---

## 2. Anatomy

```
CC Shell (ControlScreen / ListingScreen shell: sidebar menu, TopNavigation, ActionsMenu rail)
└── .record-screen
    ├── CC Header Type=Record  (.cc-header--record)  ← title, Edit / Cancel+Save, kebab
    ├── RecordTabs             ← Details · Article steps (links) + per-screen actions (far right)
    └── body
        ├── View / Edit:  main column  = RecordSection × n  (FieldRow view or edit kinds)
        │                 sidebar      = FactPanel × n      (PerformanceSummary, ViewerList,
        │                                                    FactList ×4, AdvisoryList)
        └── Steps:        StepsTable  (Datatables, run by ListingScreen.js)
            Import / Add: RecordSection(s) in edit mode, tabs kept, tab actions = Cancel / Save
```

**Kit** (all under `src/cc/`): components FieldRow, MediaMeta, MediaPicker, ViewerItem,
AdvisoryItem, RichTextEditor, ColorPickerInput · patterns RecordTabs, RecordSection, FactPanel +
FactList, ViewerList, AdvisoryList, PerformanceSummary, TagBox, StepsTable, Selector,
PromptModifier · plus the DS's Input, Select, Textarea, Checkbox, DatePicker, Toggle,
SegmentedControl, Dropdown, Modal, ActionCard, Button.

---

## 3. View and Edit

### Layout

- Main column + sidebar. Sidebar `max-width --ai-size-7` (384), gap `--ai-spacing-5`; sections
  and panels are `--ai-spacing-5` apart. Page padding **matches the listing screens**
  (`--ai-spacing-6`, `--ai-spacing-4` below 768; designer, 2026-09-29, for consistency).
- **Full width** (rail **Full width** button — `unfold-horizontal`, `fold-horizontal` when on — or `?template=full`; the **Minimise** button beside it is the separate condensed view, visual only): the page goes flush on
  `--ai-surface-primary`, sections lose their radius (bottom border only), the main column gets a
  right border. It is the shell's one switch (`control-width.js`), not a separate page; the
  choice is saved and followed on every CC screen. Handover `full-width-preference` (ControlScreen).
- **Show sidebar** switch (far right of the tabs): **View defaults on, Edit defaults off**, then
  the viewer's own choice **per mode**. The default must be rendered into the markup so it never
  flashes. Desktop only: at a ≤1023 page the switch goes and the sidebar stacks under the content.
  Handover `record-sidebar-preference`.
- **Resizable sidebar:** drag its leading edge (an invisible `role="separator"`, col-resize
  cursor). Min 384 (the Figma width), max half the row, ←/→ 16px, Home/End, double-click resets.
  Width is per viewer and shared by View and Edit. (Max and step are carried from the Seating
  Planner, not a Figma value.)

### Field rows (FieldRow)

- **Wide** rows: label column `--ai-size-3` (192), gap `--ai-spacing-5`. **Compact** (sidebar):
  term column `--ai-size-1` (128), uniform across every panel.
- Labels: **SemiBold, `--ai-text-primary`**, `--ai-font-fixed-xs`. They wrap, and the required
  `*` (`--ai-text-error`) stays beside the text. Values: Regular, `--ai-text-primary`.
- Edit kinds: Input, Select, Textarea, TagBox, MediaPicker, Rich text, Checkbox, Date, Datetime,
  Lookup, Image (MediaPicker + options), Multimedia, File, Colour. All are drawn in Figma.
- **Image options:** content images (Main Image, Intro, Image Top, Image 1/2) carry Alt text,
  Caption, **Alignment** (a SegmentedControl with icon + Left / Center / Right, still a
  radiogroup for assistive tech) and Width. Thumbnails (Thumbnail, Alternative Thumbnail) carry
  **Alt text only**. Options are hidden while the slot is empty. One column by default, two from a
  560px *value column*. That is its own container, because the value column, not the section, decides the fit.
- `01/01/1900 00:00` is the platform's "not set" date and must render as unset.

### Pickers: which one a field uses

| Field kind | Control | Rule |
|---|---|---|
| Section, Creator | Selector `single` | Click a row to choose it and close. The current value is ticked and pinned on open. **Clear selection** empties. |
| Sort Order | Selector `sort` | Drag by the grip, ↑ ↓, ⤒ ⤓, or type a position + Enter. "This article" is badged and scrolled into view. **Reset / Cancel / Save order**. Drag pauses while a search is narrowing the list. Save PUTs the **whole ordered id list** for the section. |
| Multi Display, Topics and Keywords, Countries, Related Authors | TagBox → Multi Select Modal | **The box shows selected items only.** Select opens the modal pre-ticked, with search + "n selected"; Apply writes back; × removes. |
| Every image slot | MediaPicker → Selector `media` | Thumb or pencil opens the picker; pick a tile then **Use image** (or double-click). Empty slot = **Choose file**; filled = pencil + trash. On no results the picker offers a **primary Upload**. |
| Multimedia | MediaPicker → Selector `media` across all media types | |
| Account | Lookup (read-only input + Select) | Still inert in v1. Needs an account search (`record-lookup`). |
| Rich text (Introduction, Main Body, Text 2–5) | RichTextEditor = **TinyMCE 8.8.2** | The live CC's version, toolbar, plugins and style formats. **Insert image** opens the media Selector. If the CDN fails it falls back to a plain textarea, which is always the form value. |
| Colour (Step Text / Background Color) | ColorPickerInput | Must allow **empty** (needs a Clear + typed hex; `record-color`). |

### AI prompts (PromptModifier)

- On **Social**, **Article Questions** and **Summary** (the sections live generates). The prompt
  text is live's own (ShareLineGenerationPrompt / QuestionGenerationPrompt / SummaryGenerationPrompt).
- At rest it is one row: icon, title + what it fills, one-line preview, **Edit prompt**,
  **Generate** (secondary). Generate shows a busy state, fills the fields *after* the panel in
  order, flashes them and offers **Undo**, because **Generate overwrites**. Keep Undo when wiring.
- Edited prompts are saved **per article** under the live field names (`record-prompt-save`).

### Sidebar panels

- Performance (impressions · consumed · bookmarked · top accounts + series), Recent Viewers (with
  **Add to Contact List**), Record, Meta Information, Index Status, Audit, SEO Health.
- SEO Health items expand inline (± and **Expand all**). Only advisory #1 has designer copy; the rest
  are placeholder text in the same voice. **Real descriptions must come from the SEO check.**
- Sidebar chips (FactPanel values, viewer companies) carry `--ai-border-secondary` at rest *and*
  on hover/focus, the listing account-chip treatment.
- View: image file facts are hidden behind an **Image details** dropdown (designer, 2026-09-29).

---

## 4. Article steps

### The list

- **The Steps table is a listing screen.** It is `LISTING_SCREENS['article-steps']` run by
  `ListingScreen.js`, with markup lifted from the Articles listing at build time. Column fit,
  Edit Columns, Settings (Expanding row / Horizontal scroll), paging, sort and persistence all
  follow [`listing-screens-handover.md`](listing-screens-handover.md).
- Columns in priority order: **Order · Title** (fluid, the record link) **· Type · Float ·
  Design frame · Lookup · Created by · Publish start · Live**, then edit + kebab.
  `identityColumns: 2` (Order + Title always show).
- **Two separate triggers, one detail row** (designer correction, 2026-09-29): the **kebab** reveals
  only that row's columns that did not fit; **Show details** reveals only the step body, on every
  row. Do not let the kebab open the step body.
- Checkboxes are kept, but **step bulk actions are not designed yet** (`steps-bulk`). Do not invent any.

### Tab actions

- Steps: **Import** + **+ Add** (far right of the tabs). Below 768 the Import action hides and + Add goes icon-only.
- Import / Add screens keep the tabs (Details still leads back to the article). Their tab actions
  become **Cancel / Save**, and both return to Article steps.

### Import step (replaces the legacy "add Article Step Lookup" form and its two popups)

- One edit-mode section with two rows. **Article Step** opens a Selector `single` with two
  columns, Article · Article step. The field shows "Step — Article", so two same-named steps stay
  distinct, and **submits the step id**. **Sort Order** opens a Selector `sort` over *this
  article's* steps, with the new step appended last and badged "Importing". The default position is steps + 1.

### Add a step

- **+ Add** opens "Add a step", a small modal with two ActionCards: **Content Step** /
  **Dynamic Form Step**, with the legacy descriptions. ×, Escape or the backdrop closes it, and focus returns to + Add.
- **One Dynamic Form Step per article** (legacy rule). When the article already has one, the card
  is disabled and **says why**. The server must still reject a second one (`steps-add-form-limit`).
- Each card opens its form screen: four stacked sections (Main / Layout / Background /
  Publication, the legacy tabs). The first is titled by the step type. Fields, order, required
  flags, defaults and options are affino.com's `StepByStepFormDef.cfm` + `LiveEditStepByStepForm.cfm`
  (read 2026-09-30): **Content = 32 fields; Dynamic Form = the form picker + 12 shared fields**.
  Required: Title, Sort Order, Step Width, and the Dynamic Form on type 2.
- Dynamic Form options must be **security-filtered** and shown as "Name [code]". Content Type is
  `ContentType WHERE TypeCode = 1` per site (`steps-add-options`).

---

## 5. Agreed decisions (the short list)

All designer-confirmed (Mark) unless noted.

| Area | Decision | Date |
|---|---|---|
| Kit | Fix bindings semantically; every panel gets the standard header ("your recommendations are the way to go") | 2026-09-28 |
| Header | One primary + one secondary, the rest in the kebab. Edit mode = Cancel + Save only. Icon-only header buttons below 768 (Add plus, Edit pencil, Cancel x, Save check), with `aria-label`s kept | 2026-09-30 |
| Tabs | Active tab **SemiBold**, others Medium; underline `--ai-border-brand` | 2026-09-29 |
| Labels | FieldRow labels SemiBold + `--ai-text-primary` (were Medium / secondary) | 2026-09-29 |
| Page padding | Same as the listing screens | 2026-09-29 |
| Sidebar | Show sidebar: View on / Edit off, then per user per mode; resizable from 384 | 2026-09-28/29 |
| Narrow | ≤1023 page: sidebar stacks **below** main in one column (no two-up, no masonry). ≤559 section: rows stack label over value | 2026-09-28 |
| Mobile | Section padding `--ai-spacing-4`, title `fixed-xs`; tab labels and Show details `2xs`; top nav collapses to two crumbs | 2026-09-29/30 |
| TagBox | Selected items only; picking happens in the Multi Select Modal | 2026-09-28 |
| MediaPicker | Edit is icon-only (pencil); the thumbnail itself opens the picker; empty = Choose file | 2026-09-29 |
| Image alignment | SegmentedControl (icon + text) replaces three radios | 2026-09-29 |
| Steps | No Edit Columns in the Figma draft, but code now has full listing parity (Edit Columns + Settings, designer 2026-09-29); kebab vs Show details are separate | 2026-09-29 |
| Steps columns | Follow the table resizing rule (Title fills, others hug). Figma's fixed pixel columns are a Figma limitation, not the spec | 2026-09-28 |
| Import step | Replaces the legacy lookup form + 2 popups with one section + two Selectors | 2026-09-30 |
| Add step | Chooser modal of ActionCards; the one-form-per-article rule is shown, not just enforced | 2026-09-30 |
| Rich text | TinyMCE 8.8.2 as live, themed from DS tokens | 2026-09-29 |
| Shadows | None added on these screens (the listing rule) | 2026-09-23 |

---

## 6. Responsive rules

- **Tier 1, `@container cs-page (max-width: 1023px)`:** columns stack, sidebar below main in ONE
  column, the resize handle and the Show sidebar switch go, and the full-width divider moves under the main column.
- **Tier 2, RecordSection is its own container:** at ≤559 its Wide rows stack label over value
  (gap `--ai-spacing-3`) and the section padding tightens.
- **≤767 `cs-page`:** icon-only header and tab actions, Import hidden, smaller tab labels.
- **Deliberate `@media` exceptions:** the Selector overlay (≤559). It is `position: fixed`, so it
  is viewport-sized. Touch (`hover: none`) hides the sort grip (HTML5 drag does not exist on touch,
  so ↑ ↓ and typed positions are the mobile way).
- Verified at 390 / 820 / 1024–1600: no page horizontal scroll; the Steps table scrolls inside `datatables__body`.

---

## 7. Accessibility checklist

- [ ] Header and tab icon-only buttons keep an `aria-label` (Add, Edit, Cancel, Save, Import).
- [ ] The sidebar resize handle is a focusable `role="separator"` with arrow / Home / End keys.
- [ ] Selector single rows are `<button>`s; sort moves work by keyboard (↑ ↓ ⤒ ⤓, typed position).
- [ ] Alignment SegmentedControl stays a radiogroup with roving tabindex; labels are visually
      hidden, not removed, when it goes icon-only.
- [ ] MediaPicker thumb is a `<button>` "Choose <field>"; after a trash, focus moves to Choose file.
- [ ] Modals: Escape closes and focus returns to the trigger.
- [ ] Generate's busy animation respects `prefers-reduced-motion`.
- [ ] Contrast ≥ 4.5:1 text / 3:1 UI; focus ring `2px solid --ai-surface-brand`; 44×44 targets.

---

## 8. Known issues and open questions

| # | Issue | Status |
|---|---|---|
| 1 | **Tab count 8 vs table total 21** on Article steps. The Figma draft disagrees with itself; both are kept as drawn. The real count is the steps total. | Wire to the data; confirm with design |
| 2 | **View and Edit labels differ** as drawn: "Alt Title" / "Alternative Title", "Topic & Keywords" / "Topics and Keywords". | Pick one wording (suggest the live label) |
| 3 | **SEO advisory copy** exists for advisory #1 only; the others are placeholder text. | Copy must come from the SEO check |
| 4 | **Performance chart series is still the demo series** (its scale doesn't match 56 impressions); "Impression Per Day" 0.15 is derived (56 / 365); thumbnail / main image and viewer avatars are placeholders. | Real analytics endpoint |
| 5 | **Account lookup is inert.** It is the only lookup with no Selector yet. | Needs an account search |
| 6 | **Dates are date-only.** Publish Start / End show the time as text; no time picker or timezone. | Needs a datetime control + record timezone |
| 7 | **Colour fields can't be emptied** once set (native picker limitation). | Clear action + typed hex |
| 8 | **TinyMCE is the jsDelivr GPL build.** It must be swapped for the product's own build, licence and config (site content_css, autosave keys, images as MediaItemCode). | Before production |
| 9 | **Step bulk actions are not designed**, but checkboxes render. | Waiting on design |
| 10 | **Selection on the Steps table** inherits the listing's behaviour (kept across page/sort/filter). | Same open decision as listing issue #7 |
| 11 | Still not in Figma: Selector filtered-sort hint, drag / drop-line states, empty state and Mobile; the Show sidebar switch. Figma rich-text row was a Textarea until 2026-09-30. | Design housekeeping, does not block the build |
| 12 | The sidebar max width (half the row) and 16px key step are carried from the Seating Planner, not a Figma value. | Accept or replace |
| 13 | **Header "Add" (new article) has no handover entry yet**: it renders on View / Steps but is unwired and unflagged. | Route to the Article add screen; marker + manifest item to follow |
| 14 | Narrow / mobile layouts were designer-approved **in code first**; Figma frames were drawn afterwards from duplicates. | The code is the reference |

---

## 9. Before you call a record screen done

- [ ] Rendered from the record payload through the `record_markup.py` builders (or their port),
      not hand-written HTML. Section and field order = the live screen's.
- [ ] Every lookup / selector / tag / media slot submits an **id**, displays a name.
- [ ] Header follows the two-buttons-then-kebab rule; Save is the only primary.
- [ ] Permission-gated: Edit, Save, Copy, + Add, Import, step pencil, editable fields.
- [ ] Required fields show `*` and server errors land on the right control (Input / Select /
      Textarea error states).
- [ ] Show sidebar default rendered server-side (no flash); full-width preference honoured.
- [ ] Steps: one Dynamic Form Step per article enforced server-side *and* shown on the card.
- [ ] Generate is undoable; prompts saved per article.
- [ ] No horizontal page scroll at 390 / 768 / 1024 / 1280 / 1600, sidebar docked and undocked,
      light and dark, standard and full width.
- [ ] `grep -rn "TODO(backend:RecordScreen)" src/` markers have manifest entries (34 today).
- [ ] Accessibility checklist (§7).
