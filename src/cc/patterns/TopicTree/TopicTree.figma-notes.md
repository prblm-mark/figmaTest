# TopicTree (CC) — figma notes

**Tier:** Pattern · **Status:** CODE-FIRST (Mark, 2026-10-20, Hub TASK-571925). Not in Figma yet. The code is
the reference. Flagged for Figma; check with Mark before any push.

A topic list's hierarchy as a **site tree**: the **Hierarchy** view of the v3 Topic Manager
(`src/cc/templates/ListingScreen/TopicManager.html`), which replaces v1's `/control/taxonomy-manager-screen`
(ControlProfile 850). Names only. The selected topic's details are the host's job (Topic Manager puts them in
the FactPanel beside the tree, as v1 does).

**History.** The first pass (same day) was a tree-TABLE with count columns and an edit pencil per row. Mark:
"too complicated, it should be more like a site tree", pointing at v1, which is a plain name tree with a details
panel. This replaced it.

**What v1 does (read from source + the live page, 2026-10-20).** The top level is every topic with no parent,
A–Z; a level loads when you open its parent (a page reload per click), capped at 300. Topics are a **graph**:
`TaxonomyCategoryBTNT` is many-to-many, so a topic can have several parents.

## States

| State | What shows |
|---|---|
| Collapsed / expanded | Lucide `chevron-right`, rotated 90° when open |
| Leaf | an empty chevron-width slot, so names at one level align |
| Selected | `--ao-surface-brand-soft-extra` row, semibold (the Selector's current-row fill) |
| Hover | `--ao-surface-minimal` |
| Loading a level | a row: Spinner `--sm --neutral` + "Loading topics…" (`role="status"`) |
| Multi-parent | Lucide `link-2` after the name; DS Tooltip (Arrow=Top) "Also under: X, Y" |
| Search | matches + every ancestor on a path to them, opened; context-only ancestors in `--ao-text-secondary` |
| Show more | past the per-level cap (v1: 300): "Show N more" (Button Tertiary xs) + "n of N" |
| Empty search | the host's `emptyHtml` |

## Interaction

- **Chevron** opens / closes. **The rest of the row selects** (→ `onSelect(topic, path)`).
- **Keyboard** (APG tree view): ↑ ↓ move, → opens or steps into the first child, ← closes or steps out to the
  parent, Home / End, Enter / Space selects. One row is in the tab order. The "also under" text is the row's
  `aria-description`, and the tooltip also shows while the row has focus.
- **Multi-parent:** a topic appears under **each** parent (each placement is a row keyed by its path).
- **Search:** a result opens whole; the chevrons still fold it. Clearing the search returns to what was open.

## Tokens

| Property | Value | Source |
|---|---|---|
| Row min height | `--ao-spacing-7` (32px) | Mark, 2026-10-20 ("compact") |
| Row padding / radius | `--ao-spacing-3` inline, `--ao-radius-sm` | OrderedList row |
| Text | `--ao-font-fixed-xs`, `--ao-leading-xs`, `--ao-text-primary` | the table cell size |
| Chevron / leaf slot / hint | `--ao-icon-size-sm`, `--ao-icon-contrast` | |
| Gap | `--ao-spacing-2` | |
| Indent per level | `--ao-icon-size-sm` + `--ao-spacing-2` (22px) | Mark, 2026-10-20: a child's chevron sits under its parent's name |
| Hover | `--ao-surface-minimal` | OrderedList / Selector row hover |
| Selected | `--ao-surface-brand-soft-extra` + `--ao-font-semibold` | Selector current row |
| Search ancestors | `--ao-text-secondary` | Mark, 2026-10-20 |
| Focus | `2px solid --ao-surface-brand`, inset, on the ROW (the `<li>` holds its branch) | CLAUDE.md §9 |

No token gaps.

## Files

| File | |
|---|---|
| `TopicTree.js` | `TopicTree.mount(ul, opts)` → `{ filter, open, select, render }`; contract in the header |
| `TopicTree.css` | the above |
| `TopicTree.html` | demo: every state |
| `topic-tree-data.js` | demo data, generated from AffinoComrz "Affino Taxonomy": real names, links and order; invented counts and one invented second parent |

## Backend

`TODO(backend:TopicManager)` markers `topic-tree-data` (a level per call) and `topic-tree-search` (matches with
their ancestor paths). See `docs/topic-manager-handover.md`.

## Needs Figma

Not drawn. When it is: a TopicTreeItem set (Level, State = Default / Hover / Selected / Context, Expandable =
Open / Closed / Leaf, Hint on/off), then Code Connect.
