# ExportSystem (CC) — Figma Notes

`/control/export-system-json-and-css` on the v3 framework, for **TASK-470995** (Lynx / Luismi,
`no-design`). Classic: `/AcuSystem/CC/ExportSystemXML.cfm` (affino.com copy read 2026-10-05), and
lion.comrzdev.com for the current screen (screenshot from Mark, 2026-10-05). The affino.com copy
predates the **ControlCentreCSS** target, which lion and the release note "Control Centre: CSS
Compilation and Minification" both have.

The task was `blocked` by Lynx with no comment. Mark asked for the demo anyway (2026-10-05): it
doesn't touch any live site.

## Figma Node

**None.** Assembled from existing, Figma-built parts on the ControlScreen shell (cloned from
UpdateScreen).

## Composition

| Part | From | Notes |
|---|---|---|
| Shell | ControlScreen | Breadcrumb Zone Selector › System Management › Export System JSON and CSS (lion's); header title only. The screen is not in the sidebar menu data |
| Result | Alert `--success` / `--danger` / `--warning` (`--fixed` in full width), with `alert__list` | Success lists each target and the file(s) it writes; warning carries ControlProfileHelp's broken references (classic's ISSUES block); danger names a failed target (`?fail=<Target>`) |
| Export card | RecordSection (`--full` in full width) | Title "Export" (classic's own label) |
| Targets | Checkbox with helper text, in a grid | lion's nine, in its order (classic sorts them). The helper names the output file(s) |
| Actions | Button `--primary` "Export" (counts: "Export 3") + `--tertiary` "Select all" / "Clear all" | Export is disabled until something is ticked. While running: Spinner `--sm` + "Exporting…", and the checkboxes lock |
| Files card | RecordSection + Table | Classic's two files only (its `cfdirectory` filter), with lion's sizes and dates. Download is Button `--secondary --sm` with the download icon |

## Decisions that differ from classic

- **Checkboxes, not a multi-select listbox.** Classic needs ctrl-click to pick more than one. Each
  box also names the file it writes.
- **Export counts and disables.** Classic submits with nothing picked and shows nothing.
- **The result says what was written, per target**, rather than "Saved following data in JSON
  format: - X". It also isn't all JSON any more (cc-styles.css).
- **Issues are their own warning banner**, worded per entry ("Article Archive — HelpRelated item
  not found: Archive Settings"). Classic shows "ISSUES:" in red under the status line.
- **The files table drops the row number** and the separate "Action" heading. Each row has its own
  labelled Download button. The Download column header is visually hidden.
- **Not shown: the affino.com restriction.** On www.affino.com classic offers only ControlProfile
  and ControlProfileHelp. The demo shows lion's full list; the restriction is a backend rule.

## Layout values (all borrowed, no new tokens)

| Property | Token | Borrowed from |
|---|---|---|
| Page gap (banners, cards) | `spacing-5` (0 in full width) | UpdateScreen / the record screens' card gap |
| Target grid columns | `auto-fill`, min `size-4` (240px) | The listing's fluid column floor |
| Target grid row / column gap | `spacing-4` / `spacing-6` | `.cc-listing`'s gap / RecordSection's body padding |
| Export ↔ Select all gap | `spacing-3` | UpdateScreen's action column |
| Card border / shadow | `border/card`, `shadow/2xs` (standard only) | The CC top-level card rule |
| Files table | edge to edge in the card (`padding: 0`), file name column fluid and wrapping | The Table component's own cell padding |
| Hidden Download header | FieldRow's visually-hidden rule | `FieldRow.css` |

## Responsive (`cs-page`, 767)

The target grid reflows intrinsically (no breakpoint). Below 767 the Download buttons go icon-only
(their aria-label still says it). The Exported files columns are fitted by DatatablesFit.js (see the
note at the end), not by breakpoints.
Measured at 390: document 390/390, files table 309/309. The first pass overflowed to 538px because
the visually-hidden header was positioned outside the table's scroll box; it is now anchored to its
own cell.

## Backend (`TODO(backend:ExportSystem)`)

| id | What |
|---|---|
| `export-system-run` | Export → POST `{thisDoc}` `SystemDB=<1-based indexes into the SORTED list>`. Each target writes `AfcEngine/<Target>.json` (TextItem writes 13). ControlCentreCSS builds `cc-styles.css`; confirm its path. Return the result as data `[{target, files[], ok}]` and the help issues as `[{profile, kind, items[]}]`. Keep the affino.com restriction (ControlProfile + ControlProfileHelp only) |
| `export-system-files` | The two files' real size and `DateLastModified` from `AfcEngine/`; a Download route per file |
| `export-system-download-path` | **Security.** Classic's `?fmAction=download&path=…&file=…` serves any file the server can read, because both the folder and the name come from the URL. The v3 route takes a file name from a fixed allow-list and resolves it under `AfcEngine/` itself |

**Care (from the task):** this screen produces `ControlProfile.json`, which the CC inventory tooling
reads. The demo changes no output. The backend must keep every file byte-for-byte the same as
classic's (`serializeJSON` of the same SELECTs, with `],` followed by CRLF).

**Exported files at narrow widths (2026-10-07, Mark):** Size hides below a 520px `cs-page` and Modified
wraps below 420px — measured thresholds, not the house 767. At 767 a ~660px card dropped Size and wrapped
the date with room to spare: all four columns need 529px (name 185 · size 95 · modified 175 · icon-only
Download 74) and the file name wraps below that. Swept 340–1600px: no overflow.

**Superseded the same day — DatatablesFit (2026-10-07, Mark: "apply the same table fit to the export system
table"):** the table is now Datatables markup (`datatables datatables--orders cc-export__table`, frame
removed since it sits in the section card; rows at natural height) with `data-fit="even"`: File name
(×2, wraps) and Download always show; Size then Modified drop into the kebab's detail row. The 519 / 419
breakpoint rules above are gone. Swept 340–1600px: no overflow; at a 420px page the opened row shows
Size and Modified.
