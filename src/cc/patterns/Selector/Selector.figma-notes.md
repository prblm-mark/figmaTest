# Selector (CC) — figma notes

**Tier:** Pattern · **Status:** CODE-FIRST (designer, 2026-09-29). **Drawn in Figma 2026-09-30** (`3941:23874`). Flagged for
Figma; check with Mark before any Figma push.

The record screens' four pickers as one pattern. The mode is `data-selector` on the overlay:

| Type | Used by | Interaction |
|---|---|---|
| `single` | Section, Creator, Article Step (Import step) | Click a row to choose it and close. The current value is ticked and pinned to the top on open. **Clear selection** empties the field. The name cell is a `<button>`, so the keyboard reaches it. |
| `multi` | Multi Display, Topics, Countries, Related Authors | The FilterDropdowns Multi Select Modal. TagBox.js still owns open / Apply; Selector.js adds the name search and the "n selected" count. |
| `media` | Thumbnail, Main Image, Alternative Thumbnail, … (every MediaPicker **Edit**) | The Media Items listing's grid as a one-pick picker. Click a tile (brand ring + tick), then **Use image**, or double-click the tile. Filters, My media, Upload and Load more are inert (handover). The toolbar **Upload** is secondary. When a search or filter matches nothing, the no-results state shows a **primary Upload** (designer, 2026-09-29): there is nothing to pick, so uploading is the way forward. |
| `sort` | Sort Order | **Drag** by the grip (Edit Columns' handle model: draggable only from the grip, and the insertion line is a border). **↑ ↓** moves one place; **⤒ ⤓** moves to the top or bottom; or **type a position** and press Enter. **Search** narrows the list, and drag pauses while it does (a hint says so) because a drop between non-neighbours means nothing. The arrows and positions still work. **This article** is tinted, badged, and scrolled into view on open, and **Jump to this article** brings it back. **Reset** restores the order it opened with; **Cancel** or Escape discards; **Save order** writes the new position number into the field (its placeholder is the default position, 40). |

## Variations by field (builder parameters, `record_markup.py`)

- **single** takes its `columns`, `facets`, search placeholder and a `value(row)`. The Article Step lookup
  (Import step) is two columns, Article · Article step, with no facets; the field gets "Step — Article"
  so search matches either column and two same-named steps stay distinct. Two columns get
  `.selector__table--pair`: equal halves that wrap, because both are long free text. A `total` adds the
  "Showing n of N" line.
- **sort** takes the list noun, the badge label (`data-sort-this` on the overlay, which the status line
  reads), and the Jump / Find labels. Rows without an image drop the thumbnail. On Import step the current
  row is the step being imported, appended last and badged "Importing".

## Why these long-list aids (sort)

The live screen is drag-only. With the 73 articles in Insight, moving one article from 40 to 1 is a long
drag with auto-scroll. The typed position and the ⤒ ⤓ buttons make that one action. Search finds the
item. The pinned-and-scrolled current article removes the hunt, because on a record screen it is almost
always the one being placed. The auto-scroll near the list's edges keeps a long drag possible.

## Narrow (≤559, `@media`: the overlay is `position: fixed`, so it is viewport-sized)

- **Sort:** the thumbnail, ⤒ ⤓ and the grip drop out. HTML5 drag does not exist on touch (`(hover: none)` hides the grip too), so ↑ ↓ and the typed position are the mobile way. A typed 1 means "top".
- The footer wraps: the status line first, then the buttons.

## Tokens (all `--ao-*`)

| Element | Token |
|---|---|
| Search cap / basis | `--ao-size-7` max, `--ao-size-5` basis (a cap, not a floor) |
| Selected row (single), current row (sort) | `--ao-surface-brand-soft-extra` |
| Tick, tile ring, drop line, moved flash | `--ao-icon-brand`, `--ao-border-brand` |
| Media modal / sort modal width | `--ao-size-12` (960) / `--ao-size-11` (768) |
| Scroll region cap | `--ao-size-10` |
| Tile min | `--ao-size-1` (the Media Items grid's own is `--ao-size-2`; smaller because a picker wants more choices per screen) |
| Sort thumb / position input | `--ao-spacing-8` square / `--ao-spacing-9` × `--ao-spacing-7` |
| Hint bar | `--ao-surface-info-soft` |
| Sort footer Reset (tertiary) | transparent at rest only; hover / pressed / focus keep the tertiary tokens (designer, 2026-09-29) |
| Sort row move buttons (tertiary sm) | `--ao-border-secondary` border, the listing account chip's Case B override (designer, 2026-09-29), restated for hover / focus |

## Needs Figma

A Selector component set with `Type=Single|Multi|Media|Sort`. Sort also needs a row sub-component
(`State=Default|Current|Dragging|Drop-before|Drop-after`), the filtered state (grip hidden plus the hint),
and a Mobile variant. Media needs a tile (`State=Default|Hover|Selected`).

## Handover

`selector-single-source`, `steps-import-source`, `selector-media-source`, `selector-media-upload`, `selector-sort-order`
(HANDOVER.md, RecordScreen surface).

## Files

Selector.css, Selector.js. `Selector.html` is **generated** by
`src/cc/templates/RecordScreen/_generate.py` from the same builders as ArticleEdit (`record_markup.py`):
edit the `.py`, not the HTML.

## Figma build 2026-09-30
View & Edit kit, "Code-first components": **Selector `3941:23874`** — Type=Single `3941:23050`, Paired `3941:23172` (Article ·
Article step), Multi `3941:23243`, Media `3941:23429`, Sort `3941:23622` (960 wide; Sort 768). Built from **SelectorRow `3940:23025`**
(Type Single | Paired × State Default | Selected), **SelectorTile `3940:23047`** (Default | Selected) and **SelectorSortRow
`3940:23132`** (Default | Current). The modal shell copies the DS Modal's fill / border / radius / shadow; header, toolbar
(SearchInput with its button hidden, Filter Item chips), table, footer are composed. Not drawn: the filtered-sort hint, the
drag / drop-line states, the empty (no results) state, and Mobile.
