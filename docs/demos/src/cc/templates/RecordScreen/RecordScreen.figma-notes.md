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

Full width is the shell's ONE switch (`control-width.js`), not separate pages — driven by the rail's Minimise button, or `?template=full` for demo links.
Every screen frame was swapped to kit instances in Figma on 2026-09-28; the pre-swap drafts are kept
below them as "… — draft backup (pre-swap)".

## Composition
Shell = ControlScreen/ListingScreen app shell, ported as a bundle by `_generate.py` (sidebar menu,
TopNavigation, HeaderGroup, ActionsMenu rail, theme + width scripts). Page body:

- **CC Header Type=Record** (`.cc-header--record`) — Figma RecordHeader `3867:2138`
- **RecordTabs** — Details / Article steps are links between screens; Steps adds Lookup / + Add
- View / Edit: **RecordSection** × 6 (FieldRow view or edit types) + sidebar **FactPanel** × 7
  (PerformanceSummary, ViewerList, FactList × 4, AdvisoryList)
- Steps: **StepsTable** (Datatables) — Show details expands every row
- Edit: two FilterDropdowns **Multi Select Modals** (Multi Display, Topics and Keywords) for TagBox

## Shell paint table (Step 3a — read from the frames 2026-09-28)

| Layout | Wrapper | Value |
|---|---|---|
| Standard | page bg | shell `--cc-ui-primary-bg` (screen frame `#E7EDF0`; the body's own white fill is hidden) |
| Standard | page padding | **= the Listing screen's** (designer, 2026-09-29, for consistency): `.cc-control__page` base — `--ai-spacing-6` desktop, `--ai-spacing-4` <768, same scrollbar-gutter trims. Was `--ai-spacing-5`/5/6 on `.record-screen`. Figma content containers updated: `spacing/6` on the 7 desktop/narrow frames, `spacing/4` on the 2 mobile frames. Tabs → content gap `--ai-spacing-5` |
| Standard | columns | gap `--ai-spacing-5`; sidebar `max-width: --ai-size-7` (384) |
| Standard | main / sidebar | section gap `--ai-spacing-5` / panel gap `--ai-spacing-5` |
| Full | page | flush (ccWidth), `--ai-surface-primary` |
| Full | columns | gap 0; main column right border `--ai-border-secondary` |
| Full | sidebar | padding `--ai-spacing-5`, gap `--ai-spacing-5`, max-width `--ai-size-7` |

## Interactions (designer, 2026-09-28)
| Element | Behaviour | Owner |
|---|---|---|
| Details / Article steps tabs | navigate between screens; menu open/closed and width persist | links + `RecordScreen.js` |
| Sidebar edge (View / Edit) | drag to resize the sidebar (designer, 2026-09-28 — the Seating Planner model): invisible `role="separator"` strip on the sidebar's leading edge, col-resize cursor; full width tints the main column's border `--ai-surface-contrast` on hover/drag. Min `--ai-size-7` (384, Figma's width — designer), max half the row, ←/→ 16px, Home/End, double-click resets. Width kept per viewer (`localStorage cc-record-sidebar-w`) across View ↔ Edit | `RecordScreen.js` |
| Actions-rail **Minimise** | toggles full width (designer, 2026-09-28): `aria-pressed`, rail active look, choice saved (`localStorage cc-width`) and followed on every record screen; `?template=` still wins when present | `control-width.js` (`data-cc-width-toggle`, opt-in per screen) |
| Edit / Cancel | View ↔ Edit screens | links |
| SEO Health ± / Expand all | expand inline | `AdvisoryItem.js` |
| Image details (View) | file facts hidden by default; "Image details" opens them in a Dropdown panel (layout B, designer 2026-09-29) | `Dropdown.js` |
| TagBox × / Select | remove tag · Multi Select Modal (pre-ticked, Apply writes back) | `TagBox.js` |
| Show details | reveals the step body on every row (only) | `StepsTable.js` + `Toggle.js` |
| Step kebab | reveals only that row's columns that did not fit | Datatables / `ListingScreen.js` |
| **Show sidebar** switch (far right of the tabs, View / Edit) | hides / shows the sidebar; **View on, Edit off** by default (in the markup — no flash); desktop only — at a ≤1023 page the switch goes and the sidebar stacks under the content (designer, 2026-09-29; code-first, flag for Figma) | Toggle.js + `RecordScreen.js` (`.record-screen--no-sidebar`) |
| Steps Edit Columns / Settings | the listing's own — the steps table runs on ListingScreen.js (`article-steps` config) | `ListingScreen.js` |
| Step checkboxes, pencil, Read the full step, Lookup, + Add | visual only — backend later | HANDOVER |
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
  header keeps its button labels on mobile (Header.css). Verified 390 / 820 / 1024–1600:
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
