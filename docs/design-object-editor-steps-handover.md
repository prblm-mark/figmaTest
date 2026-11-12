# Design Object Editor: UI enhancements (steps 1–7). Handover

> **Who this is for:** Luismi (via Lynx). These are follow-ups to the v3 Design Object Editor in **Hub TASK-597158**
> (signed off, with Bat for review, branch commit `7cd488d96`).
> **Status:** designed and built as a front-end prototype in this repo, 2026-11-09 → 11-11. Mark has signed off
> every step ("all the new enhancements are good now", 2026-11-11).
> **What it is:** your editor as the baseline, with seven improvements layered on top. Each one is a separate
> switch, so you can see every change on its own against the baseline.
> **Data contract:** surface `DesignObjectEditor` in [`HANDOVER.md`](../HANDOVER.md) and
> [`handover-manifest.json`](handover-manifest.json).
> Where this document and the code disagree, **the code wins.** Please report the gap.

## Run it

`npm install && npm run tokens && npm start`, then open:

| State | URL |
|---|---|
| All seven steps (the target) | `http://localhost:8080/src/prototypes/DesignObjectEditorSteps/design-object-editor.html?steps=1,2,3,4,5,6,7` |
| Baseline (your editor, all steps off) | `http://localhost:8080/src/prototypes/DesignObjectEditorSteps/design-object-editor.html` |
| Any combination | `?steps=1,4,6` … The demo gear menu toggles each step, and the URL keeps up, so every state can be linked |

Other parameters open a state directly: `select=<cell id>`, `panel=cellProps|rowProps|content|addCell`,
`modal=1`, `menu=<cell id>`, `nested=<cell id>`, `narrow=1` (narrow sample cells), `floor=wide` (16rem floor, for comparison).

| What | Where |
|---|---|
| Logic: rendering, rules, history, length fields, breakpoint cascade | `src/prototypes/DesignObjectEditorSteps/doe-steps.js` (vanilla JS; string templates; state in `S`) |
| Styles: the `cc-p-doe__*` classes (your names) and the steps | `src/prototypes/DesignObjectEditorSteps/DesignObjectEditorSteps.css` |
| Docked inspector look | `src/prototypes/DesignObjectEditorSteps/doe-inspector.css` |
| Mock data: rows, cells, element categories, design objects | `src/prototypes/DesignObjectEditor/doe-data.js` (plus overrides at the top of `doe-steps.js`) |
| Token notes | `src/prototypes/DesignObjectEditorSteps/DesignObjectEditorSteps.token-gaps.md` |

**About the baseline.** Your build wasn't up on 2026-11-10, so the baseline was rebuilt from the 2026-11-09 visit
(DO 99, "2018 Simple DO"): your class names, field lists, menu items, and rules from `design-object-editor.js` §4, §6
and §12. Your build has moved on since then (3px gaps, the "Design Object Editor" title, the rebuilt pickers).
Keep your current behaviour wherever a step below doesn't change it.

---

## The seven steps

### 1. Cell headers and tool buttons
- Each cell header shows an **element icon** for its kind (element, design object or script) and the **given name
  only**. The element type appears in the icon's tooltip and in the panel header. The DCC code no longer shows on
  the canvas or in the panel subtitle.
- **Bordered tool buttons**: 24px, `--ao-border-secondary` (soft), `--ao-border-primary` on hover, 12px icons.
  Order: Properties · Edit content (pencil) · Go into (`log-in`, nested design objects only) · Clear (eraser, only
  when the cell has content) · ⋮.

### 2. Cell Content picker
- The radio list is replaced by a **Element | Design object | Script** segmented control and a **searchable
  3-column tile grid**. Elements sit in **collapsible categories** that remember whether they are open. The current
  choice shows as a tick and highlight on its tile.
- **Tiles can be dragged onto a cell** on the canvas, which shows a clear drop target.
- When a cell takes content, its name becomes the content's name. **Clear Content** puts the name back to
  "Blank Cell" and opens Cell Content.
- The settings modal gets a **Change element** button.

### 3. Settings modal (edit cell content)
- **Search** across all settings, a **Changed only (n)** filter, and **Collapse all**.
- Sections **collapse**, with a "n changed" badge and a count on each. Changed rows are marked.
- Checkboxes become **switches** (DS Toggle).

### 4. Selection and status
- A clear **selected** state on the cell.
- Status **chips** on the title line: **Incomplete** (click to mark complete), **Empty**, **Hidden at …**, and
  **Used in n** for design objects.
- "Complete" is the normal state, so it shows nothing. A **flag** to mark a cell incomplete appears on hover or
  selection. It leads the chip group, in the slot that Incomplete takes, so nothing jumps. The toggle is written
  straight away, as your build does, not held until Save.

### 5. Row structure
- Each row is a **labelled, filled box**. The property-panel groups are boxed the same way.

### 6. Editor layout (the big one)
- **Compact editor bar** in place of the CC top nav and page header:
  - **Left:** breadcrumb `Design Objects › <design object ▾>`. The chevron opens a **design object switcher**
    (search, recent, all). Inside a nested design object, the breadcrumb names the nested one and its menu leads
    back up to the parent.
  - **Centre:** one **breakpoint dropdown** (current icon + width; the icon is worked out from the width, so custom
    widths work). The prototype adds 1440 and 375 as examples of custom breakpoints.
  - **Right:** save status ("Unsaved changes" with a dot, or "Saving…"; nothing when there is nothing to save) ·
    **Undo / Redo** · **Save** · ⋮ (design object actions).
  - **Save** is disabled until something changes. Then: spinner and "Saving…" → tick and "Saved" + success toast →
    disabled again.
- The **properties panel docks full height on the right** instead of floating as a card:
  - **Resizable** from 320 to 720px (capped at 60% of the shell). It opens at its narrowest, 320. The width is
    remembered per browser (`localStorage` key `doe-steps-panel-w2`).
  - The panel **follows the selection**: clicking another cell retargets the open panel instead of closing it.
    A blank cell keeps Cell Content open.
  - The shell keeps **no scrollbar gutters**: the editor page sets `scrollbar-gutter: auto`.
- **Inspector fields are yours** (the same fields as your Cell / Row Properties), in the full prototype's visual
  builders. Sections:
  - Main: Name, Custom ID, Custom class, Sticky, Design frame/style
  - Align
  - Size
  - Margin
  - Padding
  - Background
  - Custom CSS (outer/inner)
  - Show at breakpoints (click a tile to hide the cell there)
  - Security: Content security right, plus **Exclude for** chips beside their label
  - Row only: Outer row CSS / Inner row CSS

  The Wrap checkbox is **left out on purpose**. Mark says it is deprecated.
- **Every length input takes real CSS** (see §Behaviour 2) and **drives the canvas** (see §Behaviour 3).
- **Per-breakpoint values** with inheritance (see §Behaviour 4).

### 7. Add cells on the canvas
- **+ buttons** sit on the edges of a hovered or selected cell. They are 16px, square, with the cell's border
  colour (brand when the cell is selected) and a 44px hit area. They are quiet on cell hover and turn lagoon only
  when the button itself is hovered.
- They offer only the allowed directions, using your §12 rules:
  - **Above / Below**: unless the design object being edited is a Cell type.
  - **Left / Right**: unless the cell is a lone Row-type design object.
- A new cell is a **Blank Cell**, selected, and opens **Cell Content**.
- The **cell ⋮ menu** is now sectioned and compact (`.dropdown-item--xs` rows, 12px text):
  - **Add cell** and **Move cell** are each a **2×2 grid of direction buttons**. All four always show; a direction
    that isn't allowed is disabled, with a tooltip saying why.
  - **Content**: Cut / Copy / Paste. Paste is disabled until something has been copied.
  - **Mark incomplete/complete** · **Delete cell** (warning style).
- With step 7 on, the Add Cell radio panel is no longer needed.

---

## Behaviour to port

### 1. Undo / redo
- A **snapshot history** of the layout (rows and cells) and all property values. It holds up to 100 entries, and
  a new edit clears redo.
- Typing in a field is **one** history entry: keystrokes less than 1s apart are merged.
- Recorded actions: move, add, delete, cut, paste, clear, content change, incomplete toggle and property edits.
- **⌘/Ctrl+Z** undoes; **⇧⌘Z / Ctrl+Y** redoes. Shortcuts are ignored while typing in a text field, so the field's
  own undo still works.
- After an undo, a selection or nested view that no longer exists is dropped.
- Undo and Redo are disabled when their stack is empty.

### 2. CSS length fields
Applies to width, min and max width, height, min height, margins, padding and the row sizes.
- Accepts **px, %, em, rem, vw, vh, keywords (auto / none / fit-content where valid), calc(), min(), max() and clamp()**.
- A **bare number takes the field's unit**. The unit sits in a small dropdown in the field; changing it keeps the
  number.
- Each value is **validated with `CSS.supports(property, value)`** for that field's real property:
  - padding refuses negative values and `auto`;
  - margin allows negative values;
  - max-width allows `none` and refuses `auto`.

  An invalid value shows the DS Input error state, with a hint listing what the field accepts.
- **↑ / ↓** step by 1, **⇧** by 10 and **⌥** by 0.1. Stepping stops at 0 where a negative value is invalid.
- Values are kept **as typed CSS strings**, for example `50%`, `calc(100% - 2rem)` or `auto`.

### 3. The canvas follows the sizes
- A cell's **Width / Min / Max / Height** at the breakpoint being edited set its box on the canvas, live as you type.
  Rows wrap like the page does.
- A **% width allows for the gap**, so 50% + 50% sit side by side:
  `calc(W - var(--cell-gap) * (1 - p/100))`.
- No width means full width, and `auto` also means full width.
- Height only ever grows the card, so the cell's own controls stay visible.
- A **width tag** (↔ value) shows in the header of any cell that has a width.
- Narrow cells: see **3a** below (replaces the old "wrap their tools and clip their header").

### 3a. Narrow cells: true widths, compact cells, small floor (added 2026-11-12, TASK-612796)
**Replaces the 16rem cell minimum.** A 16rem floor fixed the cramped tools but made a row of 100px / 50px cells
look like a row of 16rem cells, so the canvas stopped showing the real structure. Instead:

1. **Floor: 5rem (`--ao-spacing-13`).** A cell never draws under it; it's room for the element icon and the width
   tag. It sits *under* the cell's own Min: `min-inline-size: max(var(--cell-min, 0px), var(--doe-cell-floor))`.
   The JS passes a length Min as `--cell-min` (a keyword Min such as `fit-content` goes straight on the box).
2. **Compact cell under 160px of content width.** Each cell is a container (`container: doe-cell / inline-size`);
   `@container doe-cell (max-width: 160px)` shows **only the element icon and the width value** (no arrow). The
   name is visually hidden (still read by screen readers); chips, status, grip and the whole tool row are hidden.
   Container queries measure the content box, so the JS mirrors the same 160px (`COMPACT_MAX`) on
   `clientWidth − padding`.
3. **Selection bar.** Selecting a compact cell raises a bar **above** the cell (absolute, `bottom: 100%`), after the
   first prototype's row toolbar: a brand tag (element icon + name + width; purple for a design object) and a
   raised strip with the **drag handle and the cell's own tools** (properties, edit, go into, clear, ⋮). The cell
   itself keeps its true width. Near the canvas's right edge the bar opens leftwards (`.is-end`). The top "+"
   is hidden while the bar shows (Add above is in the ⋮ menu). Every tool works from the bar, including drag.
4. **"Drawn wider" mark.** When the floor is what's holding a cell open (e.g. a 50px cell drawn at 80px), its end
   border goes dashed, the width value gets a dotted underline, and the tooltip reads
   "Width 50px — drawn at 80px so its controls fit". Measured with a `ResizeObserver` on the canvas, since the
   column changes with the panel and side menu, not only the window.
5. Cells wider than 160px are unchanged: full head, chips and tool row as before.

**Against your current build:** drop the 16rem minimum and the "chips icon-only under 22rem" rule; the compact
cell replaces both. Keep the width tag's Min/Max (≥ / ≤) in the full head and the selection bar. Hidden-at-this-
breakpoint cells are a separate open question for Mark; until he decides, draw them at their own width (floored
at 5rem), dimmed, as any other cell.

Compare in the prototype (demo gear menu, or URL):
- Compact cells: `?steps=1,2,3,4,5,6,7&narrow=1&select=c-contacts`
- The 16rem floor, for comparison: add `&floor=wide`
- `narrow=1` sets Row 3's cells to 100px / 50px to show the problem.

### 4. Per-breakpoint overrides (cascade)
- The breakpoint-specific properties are stored per breakpoint:
  - align (horizontal and vertical), float, clear
  - w, minW, maxW, h, minH
  - margin and padding sides
  - background colour and image
  - outer and inner CSS
- Fluid is the base. A value at a breakpoint is read from the **nearest breakpoint at or above it, then Fluid**.
  Editing at 1200 applies to 1200 and smaller.
- At a breakpoint, a field holds **only that breakpoint's override**. The inherited value shows as its
  **placeholder**. Overridden labels are highlighted (brand colour, semibold).
- A **scope note** at the top of the panel says where you're editing ("Editing at 1200px. Changes apply to 1200px
  and smaller."), with a live **n override(s)** count. At Fluid it reads "Changes cascade to every breakpoint".
- Cells hidden at the current breakpoint render dimmed.

### 5. Move rules (unchanged from yours, kept for reference)
- Left / Right swap the cell with its neighbour.
- Up / Down send the cell to the end of the nearest row that takes cells.
- A Row-type design object alone in its row moves the whole row.
- A row left empty is removed.
- Drag and drop follows the same rules.

---

## Needs backend (surface `DesignObjectEditor`)

| id | What it needs |
|---|---|
| `doe-load` | GET the design object's rows and cells: id, name, kind (de / do / script), type, DCC, incomplete, hiddenAt, nested design object and its type (Row / Cell), usedIn. Already served by your build; the prototype reads mock data. |
| `doe-save` | PUT the whole design object (layout + per-cell properties) from **Save**. The prototype uses a 1.2s timer. On failure, keep "Unsaved changes" and show an error toast. |
| `doe-bp-overrides` | Store the breakpoint-specific properties **per breakpoint** (Fluid + one value per breakpoint id) and return them the same way. The editor resolves the cascade itself. |
| `doe-length-values` | Store length values as **CSS strings** (`50%`, `calc(…)`, `auto`), not numbers + px. Check that the skin's CSS writer passes them through unchanged. |
| `doe-incomplete` | The incomplete toggle writes straight away, as it does now. |
| `doe-switcher` | Design object switcher: recent design objects (per user) + search over all of them. |
| `doe-clipboard` | Cut / Copy / Paste works in memory, within one session, and carries the cell's properties. A server copy is only needed if pasting across design objects is wanted. |
| `doe-breakpoints` | The breakpoint list comes from the profile, including custom widths. The icon is worked out from the width. |

Undo / redo, the panel width and section open/closed state are **client-only**. Nothing is stored server-side.

`grep -rn "TODO(backend:DesignObjectEditor)" src/prototypes/DesignObjectEditorSteps/`
