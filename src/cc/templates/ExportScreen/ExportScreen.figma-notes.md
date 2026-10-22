# ExportScreen (CC) — Figma Notes

The v3 **Export pattern** (TASK-575621; Markus via Cat; decision #77485 "both"). One page for the Control
exports (18 core exports in Cat's inventory, dataset 184076). Sibling of ImportScreen. Pages are generated:
edit `_generate.py`, then run it.

| Page | Screen | v1 template |
|---|---|---|
| `UserExport.html` | `/control/user-export` (612) | `AfcSecurity/CC/UserExport.cfm` + `UserExportDef.cfm` |
| `ArticleExport.html` | `/control/article-export` (610) | `AfcStandard/CC/StandardItemExport.cfm` |

User Export is already on v3 as v1's own form on the record kit (TASK-574226, Cat). This page is the
pattern's version: same fields and v1 help text, laid out as below.

## Figma Node

**None yet: code-first.** Built from v1's source (affino.com tree). Push to Figma for design review.

## v1's shape (every export read)

A filter form, often split by "Comment" rows into titled groups; a **File Format** select (xlsx, csv, tsv);
Export creates a **scheduled task** and says "…has been scheduled and you will be emailed once it is
complete"; v1's TaskProgress panel lists runs in progress. No v1 export lets you pick columns; User Export
has two presets (All / Contact details only).

## The page (Mark's choices, 22 Oct 2026)

1. **One page + a sticky summary**, no stepper: an export is one decision.
2. **Columns: presets + "Choose columns"** (new): a checklist grouped by area, with search, a per-group
   All, and a running "n of N columns chosen".
3. **Email + "Your recent exports"** (new): finished files can be downloaded on the page for 7 days; a
   running export shows its progress in the same card (this replaces v1's in-progress panel).
4. **Live count** (new): "27,480 contacts match these filters", recounted 350ms after any change; at 0
   the summary says so and Export is disabled.

| Region | Content |
|---|---|
| Result slot | "Export started…" (success Alert) after a run |
| Your recent exports | File (name + "From … · n filters · n columns"), count, Format, Run by, Started, Status (progress bar / Ready + "Kept until …" / Expired), Download |
| Filters card | A one-line rule ("Leave a filter empty…"), the **scope** (Registration zone / Zone), then v1's groups as a flush **Accordion**; each group head shows a count chip when any of its filters is set |
| Columns card | Preset radios with what they hold and how many columns; the picker for "Choose columns"; **Also include** rows (v1 "Include …" options that add columns) |
| Your export (summary) | Count · From · Filters (each with ×, Clear all) · Columns (+ Change, jumps to the card) · Format (SegmentedControl XLSX / CSV / TSV, plus the export's format options) · Export N contacts + a note on how it runs |

**Converting a v1 export:** "cm" rows → group titles; filter rows → FieldRows in that group; rows that add
columns ("Include Activity Data", "Include All Subscription Plans", "Include Reviews") → Columns › Also
include; "File Format" and "Pipe delimit…" → the summary's Format block. v1's "Filter by Created Dates" tick
box is dropped: a date in From / To is the filter.

## Composition

ControlScreen shell (cloned from ExportSystem) · RecordSection · Accordion `--flush` · FieldRow (Input,
Select, DatePicker, Checkbox, Radio, lookup) · Radio (presets) · Checkbox (columns) · Input (search) ·
SegmentedControl · Button (primary / secondary / tertiary xs) · Badge · Alert · Spinner · Table.

## Layout values (all borrowed; no new tokens)

| Property | Token | Borrowed from |
|---|---|---|
| Page and layout gap | `spacing-5` | Record screens' card gap |
| Summary width | `size-7` (384px) | — (fits a filter line and three format buttons) |
| Summary position | sticky, `top: 0`; static under 1024 | — |
| Top-level cards | `border/card`, `shadow/2xs` | CC top-level card rule |
| Scope / group padding | `spacing-6` (`spacing-5` under 767) | RecordSection body padding |
| Field rows in a group | `spacing-6` apart | RecordSection row gap |
| Accordion `--flush` side padding | `spacing-6` | **Contextual override (Case B)**: flush has none; inside a card it lines up with the card |
| Count value | `font-fixed-3xl` semibold, `leading-xl` | — (Import's tiles are a size down) |
| Summary blocks | `spacing-5` above, `1px border/secondary` top, head min height `spacing-7` | FactList dividers; xs button height |
| Column grid | `auto-fill`, min `size-3`, gap `spacing-4` × `spacing-6` | ExportSystem target grid |
| Picker box | `1px border/secondary`, `radius-md`, padding `spacing-5` | Inner-card rule |
| Progress bar | Import's meter | ImportScreen |

## Responsive (`cs-page`)

Under 1024 the summary drops below the work column (not sticky). Under 767 scope / groups pad `spacing-5`;
Recent exports keep File, Status and Download (count, Format, Run by, Started give way); Download goes
icon-only. Checked headless at 1440 and 500.

## Demo switches

`?count=0` · `?cols=custom` · `?recent=0`. Lookups' **Select** buttons are not wired (backend: v1's pickers);
Contact lists (User Export) and Sections (Article Export) are prefilled so the summary has a filter to show.

## Backend

`HANDOVER.md` § Surface: ExportScreen, and `grep -rn "TODO(backend:ExportScreen)" src/`.
