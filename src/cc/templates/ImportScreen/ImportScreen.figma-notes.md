# ImportScreen (CC) — Figma Notes

The v3 **Import pattern** (TASK-575621; Markus via Cat, 22 Oct 2026; decision #77485 "both"). One flow
for the Control imports (25 core imports in Cat's inventory, dataset 184076), plus the **Batch delete**
screen the six batch-delete tools share. Pages are generated: edit `_generate.py`, then run it.

| Page | Screen | v1 template |
|---|---|---|
| `ContactListImport.html` | `/control/contact-list-import` (1871) | `AfcCommunityMgr/CC/ContactListImport.cfm` |
| `UserImport.html` | `/control/user-import` (761) | `AfcSecurity/CC/UserImport.cfm` |
| `UserBatchDelete.html` | `/control/user-batch-delete` (2049) | `AfcCommunityMgr/CC/UserBatchDelete.cfm` + `AfcAutomation/cfc/BatchDelete.cfc` |

## Figma Node

**None yet: code-first.** Built from v1's source (affino.com tree) because lion.comrzdev.com didn't load in
the browser on 2026-10-22. Push to Figma for design review.

## The flow

`Upload → Map columns → [Options] → Review → Results`, on one page, in one card, with the new **Stepper**
under the card head and **Back / primary action** in the card footer. Options only appears when the
import has settings (User Import has 10; Contact List Import has none, so it has 4 steps).

| Step | What it shows | Leaves when |
|---|---|---|
| Upload | DragDropFile (XLSX or CSV, 100MB), then the file as a row: name, rows · columns · size, Replace / Remove. Wrong type / too big → DragDropFile Error + a sentence saying what to do. Sample-file link | a file is accepted |
| Map columns | One Table row per column **in the user's file**: name + two sample values → Select of the import's fields (+ Don't import), the field's type and help under it → status badge Matched / Changed / Not imported / Chosen twice. Fields with no column are listed under the table | no field is chosen twice, required fields have a column, and the import's own rule holds (Contact List: UserCode **or** Email) |
| Options | The import's settings as FieldRows (record-screen markup), v1's help text | always |
| Review | "Checking N rows…", then an Alert (all ready / some skipped / none can import), three counts (Ready · Fixed for you · Will be skipped) and **Rows to check**: Row, Column, Value in file (spaces shown as ·), Problem, Outcome badge Skipped / Fixed / Note. Download skipped rows | ≥ 1 row is ready → primary "Import N rows" |
| Results | Scheduled (default, v1's behaviour): "Import scheduled… we'll email you at …", the run appears in **Imports in progress**. `run: 'now'`: a progress bar, then "Import complete". Counts + Rows to check stay. "Import another file" | — |

**Imports in progress** (v1's TaskProgress panel) is a card above the flow, shown only when this user has
an unfinished run: ID, Progress (n of N + bar), Started by, Started, Last run.

## Decisions (Mark, 2026-10-22, unless noted)

1. **One page + a Stepper**, not stacked sections or separate pages. New component: `src/components/Stepper`.
2. **A column-mapping step**, new in v3: v1 needs the file's headers to be the config's column names.
   Auto-match ignores case, spaces and punctuation, then tries aliases. Mappings are not saved between runs.
3. **Bad rows are skipped, not fatal.** v1 rejects the whole file on any row error. Rows with errors are
   skipped and can be downloaded (the user's columns + an Error column), fixed and re-imported.
4. **"Fixed for you"** is new: safe corrections (trim + lower-case an email, `;` or `,` → `|` between list
   IDs) are applied and listed, rather than failing the row. **Note** = worth knowing, changes nothing
   (the same contact twice).
5. **XLSX and CSV.** v1 takes .xlsx only. CSV is new for backend.
6. **Batch delete is its own screen, not an import.** v1 doesn't take a file: it lists the batches earlier
   imports created. v3: a table of batches (tick, Batch reference, Users, Imported, Imported by) → Alert
   button "Delete N users" → confirm modal that names the batches and stays disabled until **N is typed**
   → "Delete scheduled". Deleted batches (v1's audit) below.
7. Header: one secondary (**Sample file**), anything else in the kebab (CC header rule). User Import's
   "Batch delete users" is in the kebab; the batch screen links back with **User import**.
8. Copy names the outcome and what to do next; no "Error!" headings; counts go in neutral chips.

## Composition

ControlScreen shell (cloned from ExportSystem) · RecordSection · **Stepper (new)** · DragDropFile ·
Button (primary / secondary / tertiary / alert) · Select · Table · Badge · Alert · Spinner · FieldRow +
Radio + Input + Select (Options) · Modal `--confirm` + Input (batch delete).

## Layout values (all borrowed; no new tokens)

| Property | Token | Borrowed from |
|---|---|---|
| Page card gap | `spacing-5` (0 full width) | ExportSystem / record screens |
| Top-level cards | `border/card`, `shadow/2xs` | CC top-level card rule |
| Stepper row / footer padding | `spacing-4` × `spacing-6` (`spacing-5` narrow) | RecordSection body padding |
| Panel inner gap | `spacing-5` | The page's card gap |
| Options row gap | `spacing-6` | RecordSection row gap (2026-09-29) |
| Lead text measure | `size-12` | Listing's widest column cap |
| File icon tile | `spacing-8` square, `radius-md`, `surface/brand-soft-extra` + `icon/brand` | DragDropFile icon circle + Button height |
| Inner cards (file row, tables, count tiles) | `1px border/secondary`, `radius-md` | Cards inside a top-level card rule |
| Mapping Select width | `size-3` … `size-6` | Listing column floors |
| Count tile min width | `size-2` | — |
| Count value | `font-fixed-2xl` semibold, `leading-lg` | StatCard scale |
| Progress bar | `spacing-1` high, `surface/secondary` track, `surface/brand` fill | Stepper connector colours |
| DragDropFile height | `min-height: 0` (component's 280px is for a bare page) | contextual override, scoped to `.cc-import` |

## Responsive (`cs-page`, 767)

Below 767: the Map table and the Rows-to-check table become one block per row (no sideways scroll); the
Stepper shows only the current label (its own container, 640); the footer stacks with the primary action
first and full width; Replace / Remove go icon-only. The Imports-in-progress and batch tables scroll inside
their cards. Checked headless at 1440 and 500 (Chrome's floor).

## Demo switches

`?step=map|options|review|results` · `?run=now` · `?progress=0` · `?upload=type|size` · `?clean=1`.
Any picked .xlsx/.csv loads the page's demo file (Cat's Contact List sample, with her awkward rows).

## Backend

`HANDOVER.md` § Surface: ImportScreen, and `grep -rn "TODO(backend:ImportScreen)" src/`.
