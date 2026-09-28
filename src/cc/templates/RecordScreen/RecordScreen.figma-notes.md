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
| Standard | page padding | `--ai-spacing-5` top/sides, `--ai-spacing-6` bottom; tabs → content gap `--ai-spacing-5` |
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
| TagBox × / Select | remove tag · Multi Select Modal (pre-ticked, Apply writes back) | `TagBox.js` |
| Show details | expands every step row | `StepsTable.js` + `Toggle.js` |
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
  columns — sidebar panels go below main, two across while each keeps 384, one across under that
  (`auto-fit`/`minmax`, no second breakpoint); the resize handle is hidden; in full width the main
  divider moves from its right edge to under it. Tier 2 lives in RecordSection: a self-container
  that stacks field rows label-over-value at ≤559 (192 label + ~45ch value + padding). The record
  header keeps its button labels on mobile (Header.css). Verified 390 / 820 / 1024–1600:
  no page h-scroll; Steps table scrolls inside `datatables__body`.
- The dark top navigation bar in the Figma screens is still the drawn frame (CC TopNavigation lives
  in the CC file); code uses the real shell.
