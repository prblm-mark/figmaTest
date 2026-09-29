# Selector (CC) — figma notes

**Tier:** Pattern · **Status:** CODE-FIRST (designer, 2026-09-29). **No Figma node yet.** Flagged for
Figma; check with Mark before any Figma push.

The record screens' four pickers as one pattern. The mode is `data-selector` on the overlay:

| Type | Used by | Interaction |
|---|---|---|
| `single` | Section, Creator | Click a row to choose it and close. The current value is ticked and pinned to the top on open. **Clear selection** empties the field. The name cell is a `<button>`, so the keyboard reaches it. |
| `multi` | Multi Display, Topics, Countries, Related Authors | The FilterDropdowns Multi Select Modal. TagBox.js still owns open / Apply; Selector.js adds the name search and the "n selected" count. |
| `media` | Thumbnail, Main Image, Alternative Thumbnail, … (every MediaPicker **Edit**) | The Media Items listing's grid as a one-pick picker. Click a tile (brand ring + tick), then **Use image**, or double-click the tile. Filters, My media, Upload and Load more are inert (handover). |
| `sort` | Sort Order | **Drag** by the grip (Edit Columns' handle model: draggable only from the grip, and the insertion line is a border). **↑ ↓** moves one place; **⤒ ⤓** moves to the top or bottom; or **type a position** and press Enter. **Search** narrows the list, and drag pauses while it does (a hint says so) because a drop between non-neighbours means nothing. The arrows and positions still work. **This article** is tinted, badged, and scrolled into view on open, and **Jump to this article** brings it back. **Reset** restores the order it opened with; **Cancel** or Escape discards; **Save order** writes "Position n of N" into the field. |

## Why these long-list aids (sort)

The live screen is drag-only. With the 73 articles in Insight, moving one article from 40 to 1 is a long
drag with auto-scroll. The typed position and the ⤒ ⤓ buttons make that one action. Search finds the
item. The pinned-and-scrolled current article removes the hunt, because on a record screen it is almost
always the one being placed. The auto-scroll near the list's edges keeps a long drag possible.

## Narrow (≤559, `@media`: the overlay is `position: fixed`, so it is viewport-sized)

- **Sort:** the thumbnail, ⤒ ⤓ and the grip drop out. HTML5 drag does not exist on touch (`(hover: none)` hides the grip too), so ↑ ↓ and the typed position are the mobile way. A typed 1 means "top".
- The footer wraps: the status line first, then the buttons.

## Tokens (all `--ai-*`)

| Element | Token |
|---|---|
| Search cap / basis | `--ai-size-7` max, `--ai-size-5` basis (a cap, not a floor) |
| Selected row (single), current row (sort) | `--ai-surface-brand-soft-extra` |
| Tick, tile ring, drop line, moved flash | `--ai-icon-brand`, `--ai-border-brand` |
| Media modal / sort modal width | `--ai-size-12` (960) / `--ai-size-11` (768) |
| Scroll region cap | `--ai-size-10` |
| Tile min | `--ai-size-1` (the Media Items grid's own is `--ai-size-2`; smaller because a picker wants more choices per screen) |
| Sort thumb / position input | `--ai-spacing-8` square / `--ai-spacing-9` × `--ai-spacing-7` |
| Hint bar | `--ai-surface-info-soft` |
| Sort row move buttons (tertiary sm) | `--ai-border-secondary` border, the listing account chip's Case B override (designer, 2026-09-29), restated for hover / focus |

## Needs Figma

A Selector component set with `Type=Single|Multi|Media|Sort`. Sort also needs a row sub-component
(`State=Default|Current|Dragging|Drop-before|Drop-after`), the filtered state (grip hidden plus the hint),
and a Mobile variant. Media needs a tile (`State=Default|Hover|Selected`).

## Handover

`selector-single-source`, `selector-media-source`, `selector-media-upload`, `selector-sort-order`
(HANDOVER.md, RecordScreen surface).

## Files

Selector.css, Selector.js. `Selector.html` is **generated** by
`src/cc/templates/RecordScreen/_generate.py` from the same builders as ArticleEdit (`record_markup.py`):
edit the `.py`, not the HTML.
