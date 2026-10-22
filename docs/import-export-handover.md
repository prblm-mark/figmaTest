# Import & Export patterns: handover

> **For:** Cat (converting the Control import/export screens to v3 for Affino 10, epic TASK-575540) and Lynx.
> **Task:** TASK-575621 · decision #77485 "both" (Mark, 22 Oct 2026).
> **Status:** **Import pattern: built.** Export pattern: next (it will start from User Export on v3).
> **Source of truth:** the code. Spec and decision log: `src/cc/templates/ImportScreen/ImportScreen.figma-notes.md`.
> Backend contracts: [`HANDOVER.md` § Surface: ImportScreen](../HANDOVER.md#surface-importscreen) (11 items).

## Run it

```
npm install && npm run tokens && npm start
```

| Page | URL |
|---|---|
| Contact List Import (4 steps, no options) | http://localhost:8080/src/cc/templates/ImportScreen/ContactListImport.html |
| User Import (5 steps, with Options) | http://localhost:8080/src/cc/templates/ImportScreen/UserImport.html |
| User Batch Delete | http://localhost:8080/src/cc/templates/ImportScreen/UserBatchDelete.html |
| Stepper (new component) | http://localhost:8080/src/components/Stepper/Stepper.html |

Jump to a step with `?step=map|options|review|results`. Other switches: `?run=now` (inline run instead of
scheduled), `?progress=0`, `?upload=type|size` (upload errors), `?clean=1`. Picking any .xlsx/.csv loads
the page's demo rows (Contact List uses Cat's sample with its awkward rows).

## 1. The rules that matter most

1. **One flow for every import:** Upload → Map columns → [Options] → Review → Results, one page, one card,
   a **Stepper** under the card head, **Back + one primary action** in the card footer. Options is left out
   when an import has no settings.
2. **Map columns is new.** The user's file no longer has to use the config's column names. Each column in
   the file gets a Select of the import's fields (+ Don't import). Matching ignores case, spaces and
   punctuation, then aliases. Nothing is saved between runs.
3. **Bad rows are skipped, not fatal.** v1 rejects the whole file. v3 imports the good rows, lists the bad
   ones with their reason, and lets the user download them (their own columns + an Error column) to fix
   and re-import.
4. **Safe fixes are applied and shown** ("Fixed for you"): trim + lower-case emails; `;` or `,` between
   IDs → `|`. "Note" rows change nothing (e.g. the same contact twice).
5. **XLSX and CSV**, 100MB. CSV is new for backend.
6. **Most imports are scheduled** (as v1): Results says so and names the email address; the run appears
   in **Imports in progress** (v1's TaskProgress), a card above the flow shown only when there's a run.
   An import that runs immediately uses the inline progress bar instead (`run: 'now'`).
7. **Batch delete is its own screen, not an import.** Table of the batches previous imports created →
   tick → "Delete N users" (Alert button) → confirm modal that stays disabled until **N is typed** →
   "Delete scheduled". Deleted batches listed below. The six batch-delete screens share it.
8. **Header:** one secondary (Sample file); anything else in the kebab.

## 2. Converting a screen

The pages are generated: copy a block in `src/cc/templates/ImportScreen/_generate.py` and run it.
Each import supplies only:

| Config | From v1 |
|---|---|
| `fields` (key, label, type n/e/t, length, required, hint, aliases) | the import's `AfcAutomation/ImportConfig/<Name>Config.cfc` (Columns + ColumnTypes) |
| `rules` (e.g. `anyOf: [UserCode, Email]`) and `check()` row rules | the import's `Automation/<Name>.cfm` row checks |
| Options (FieldRows via `record_markup.edit_row`) | the v1 screen's CProperties, in order, with their help text |
| `steps` (drop `options` if none), `run` (`scheduled` / `now`) | whether v1 calls `createScheduledTask` |
| `progress` Types | the v1 screen's `TaskProgress` `Type` list |

Everything else (upload checks, mapping, review, results, in-progress card, responsive) is shared in
`ImportScreen.js` / `ImportScreen.css`.

## 3. Needs backend (summary; full table in HANDOVER.md)

`import-upload` · `import-config` · **`import-map` (new behaviour)** · `import-validate` (skip, don't
reject; return ok / fixed / error per row) · `import-run` · `import-progress` · `import-error-file` ·
`import-sample` · `batch-list` · `batch-delete` (re-check the confirmed count server-side) · `batch-audit`.

`grep -rn "TODO(backend:ImportScreen)" src/`

## 4. Not done yet

- **Export pattern** (filters + fields → format → run → download), starting from User Export on v3.
- Figma frames for both patterns and the Stepper (code-first; will be pushed for design review).
- Live comparison on lion.comrzdev.com: it didn't load in the browser on 22 Oct, so this was built from
  v1's source on the affino.com tree.
