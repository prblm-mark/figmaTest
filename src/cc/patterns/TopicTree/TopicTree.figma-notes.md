# TopicTree (CC) — figma notes

**Tier:** Pattern · **Status:** CODE-FIRST (Mark, 2026-10-20, Hub TASK-571925). Not in Figma yet. The code is
the reference. Flagged for Figma; check with Mark before any push.

A topic list's hierarchy, as a tree-table: the **Hierarchy** view of the v3 Topic Manager
(`src/cc/templates/ListingScreen/TopicManager.html`), which replaces v1's
`/control/taxonomy-manager-screen` (ControlProfile 850, `AfoTaxonomyMgr/CC/TaxonomyManager.cfm`). Luismi asked for
it on v3; the kit had no tree.

**What v1 does (read from source, 2026-10-20).** `TaxonomyManagerDisplayHierarchy.cfm`: the top level is every
topic with no parent, A–Z; a level loads when you open its parent (a page reload per click), capped at 300. Topics
are a **graph**, not a tree: `TaxonomyCategoryBTNT` is many-to-many, so a topic can have several parents (the
List's "Parents" column is plural).

## Variants / states

| State | What shows |
|---|---|
| Collapsed | chevron `›` on a topic with children; a leaf keeps an empty chevron-width slot so names align |
| Expanded | chevron rotated 90°, children indented one step |
| Loading a level | a row under the parent: Spinner `--sm --neutral` + "Loading topics…" (`role="status"`) |
| Multi-parent | Lucide `link-2` after the name; the DS Tooltip (Arrow=Top) reads "Also under: X, Y" |
| Search | matches + every ancestor on a path to them, opened; context-only ancestors muted |
| Show more | past the per-level cap (v1: 300): "Show N more" (Button Tertiary sm) + "n of N" |
| Empty search | the host's empty row (Topic Manager: the listing's own empty state) |

## Interaction

- **Chevron** expands / collapses (Button Tertiary xs icon-only, as OrderedList's ↑ ↓). Anywhere else on the row
  opens the topic, as a listing row does; the **name** is the real link and the **pencil** edits.
- **Keyboard** (APG treegrid, row focus): ↑ ↓ move, → expands or steps into the first child, ← collapses or steps
  out to the parent, Home / End, Enter opens. One row is in the tab order; only that row's link and pencil are
  tabbable. The "also under" tooltip shows while its row has focus.
- **Multi-parent:** a topic appears under **each** parent (each placement is a row keyed by its path) — Mark,
  2026-10-20, over showing it once.
- **Search:** the chevrons still fold a branch of the result. Clearing the search returns to what was open.
- **Narrow card** (`@container`, ≤767px, the `.datatables` card): Topic and Children stay; Articles, Contacts and
  Accounts drop (the List view and the topic's page carry them). Topic never goes below 160px.

**Why a tree-table, not an indented list:** the List view is a table, so the Hierarchy keeps its columns and its
card; switching views changes the rows, not the furniture (Mark, 2026-10-20). **Why the SegmentedControl:** it
is a view of the same result, as Media Items' Listing / Grid.

## Tokens

| Property | Value | Source |
|---|---|---|
| Indent per level | `--ao-spacing-7` (32px) | Mark, 2026-10-20: chevron (spacing-6) + gap (spacing-3), so a child's chevron sits under its parent's name |
| Name gap (chevron · name · hint) | `--ao-spacing-3` | the same 8px, which is what makes the indent line up |
| Leaf slot | `--ao-spacing-6` | the xs icon button's width |
| Chevron border | `--ao-border-secondary`, held on hover / focus | OrderedList / Selector treatment for a tertiary xs control in a row |
| Search ancestors | `--ao-text-secondary` | Mark, 2026-10-20 (matches keep the cell colour) |
| "Also under" icon | `--ao-icon-size-sm`, `--ao-icon-contrast` | Mark, 2026-10-20 |
| Row focus | `2px solid --ao-surface-brand`, inset | CLAUDE.md §9 |
| Topic floor | `--ao-size-2` (160px) | Datatables' own truncate cap |
| Everything else | Datatables / Table / Button / Tooltip / Spinner | unchanged |

No token gaps.

## CSS / layout notes

- Lives in `.datatables.datatables--orders`. That card renders tables `table-layout: fixed` at widths
  ListingScreen.js measures; the tree has no fit, so `.table.topic-tree` is `auto`.
- Topic column: `width: 100%; max-width: 0` (the table-cell way to take the slack). **Physical** `max-width`:
  the logical `max-inline-size` is ignored on a cell and the table overflowed by 90px.
- Indent is `padding-inline-start` on `.topic-tree__name` by `data-level` (2–10; v1 walks 10 levels).

## Files

| File | |
|---|---|
| `TopicTree.js` | `TopicTree.mount(table, opts)` → `{ filter, expandAll, collapseAll, open, render }`; contract in the header |
| `TopicTree.css` | the above |
| `TopicTree.html` | demo: every state |
| `topic-tree-data.js` | demo data, generated from AffinoComrz "Affino Taxonomy": real names, links and order; invented counts and one invented second parent |

## Backend

`TODO(backend:TopicManager)` markers: `topic-tree-data` (a level per call), `topic-tree-search` (matches with their
ancestor paths), `topic-manager-routes`. See `docs/topic-manager-handover.md`.

## Needs Figma

Not drawn. When it is: a TopicTreeRow set (Level 1–3 shown, State = Collapsed / Expanded / Leaf / Context,
Hint on/off) composed from Button Tertiary xs icon-only, Datatables cells and Tooltip; then Code Connect.
