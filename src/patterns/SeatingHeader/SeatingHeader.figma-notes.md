# SeatingHeader — Figma Notes

**Tier:** Pattern
**Built:** 2026-08-26 (Seating Planner module, wave 6)
**Files:** `SeatingHeader.css`, `SeatingHeader.html`, `SeatingHeader.js`, `SeatingHeader.figma.ts`, `SeatingHeader.figma-notes.md`
**Composes:** Button (base, `--sm`, `--icon --xs`, `--icon --2xs` via RoomCard), Toggle (`toggle--xs`, label-less), RoomCard (one per plan)
**JS:** `SeatingHeader.js` (drag-to-scroll for the plans carousel) + `Toggle.js`

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Page:** Seat Planner (`3087:5050`)
- **Component set:** `3474:90519`

> **Figma calls this component `Header`.** It is filed as **SeatingHeader** because
> `src/patterns/Header` already exists and is a completely different component (the AI-Chat
> header, node `68:5443`). Worth renaming the Figma component to `Seating Header` so the two
> are not confusable in the property panel or in Code Connect.

## Variant matrix (4 variants)

| Tier | Type | Device | Node | Figma size | CSS |
|---|---|---|---|---|---|
| Pattern | Has Plans | Desktop | `3474:90518` | 1552×288 | full markup |
| Pattern | Has Plans | Mobile | `3484:186300` | 392×317 | `@media (max-width: 767px)` |
| Pattern | No Plans | Desktop | `3474:90517` | 1552×99 | `__bar` only |
| Pattern | No Plans | Mobile | `3484:186449` | 392×146 | `__bar` only + media query |

`Tier` is single-valued (`Pattern`). Note that Device is implemented as **two** breakpoints, not one — the toolbar reverts at 1024px while everything else reverts at 768px. See *The toolbar has its own breakpoint*.

### The Type axis is data, not CSS

`No Plans` is the event bar **on its own**; `Has Plans` adds the room selector and the toolbar.
Confirmed structurally, not inferred: `get_metadata` on `3474:90517` returns an `Event-Info-Bar`
and nothing else, and its bar is byte-identical to Has Plans' — same 900px details block, same
`Item` wrapper, same 128/116 buttons. The No Plans heights (99 desktop, 146 mobile) are exactly
the Has Plans bar heights.

So which one renders is markup the caller supplies and there are **no Type modifiers**. This is
the **fifth** component in this module where that holds — RoomCard, TableCard, TableDetail and
Unassigned all did the same.

## Structure

```
.seating-header                     root: bg, 1px border, radius-lg, overflow hidden, fluid
├── .seating-header__bar            Event-Info-Bar   — border-b
│   ├── .seating-header__details      Event-Details  — fluid (Figma 900px)
│   │   ├── .seating-header__title-row  Title-Row    — title + swap Button
│   │   └── .seating-header__meta       User Details — <ul>, 3 facts, wraps
│   └── .seating-header__actions      Global-Actions — Copy Plans / New Plan
├── .seating-header__rooms          Room-Selector-Bar (a Figma SLOT) — border-b, carousel
│   └── .room-card …                  one RoomCard per plan
└── .seating-header__toolbar        Toolbar — no border
    ├── .seating-header__toolbar-actions
    │   ├── .seating-header__room       room name + unassigned count
    │   ├── .seating-header__toggle-group  Toggle + "Show unassigned"
    │   ├── .seating-header__divider    16px hairline
    │   └── .seating-header__buttons    Room Layout / Add Table / Export
    └── .seating-header__more         the kebab — a real <button>
```

Figma splits `Toolbar-Actions` into two equal `flex-1` columns (537px each in a 1468px row) with
the toggle group right-aligned inside the second — **exactly** TableListing's toolbar arrangement,
so the same nesting is used.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-primary` | root, rooms, toolbar `background-color` | |
| `--ai-border-secondary` | root `border`, bar + rooms `border-block-end`, divider `background-color` | |
| `--ai-radius-lg` | root `border-radius` (16px) | |
| `--ai-radius-md` | mobile global-action buttons (from `btn--sm`) | |
| `--ai-radius-sm` | kebab focus ring radius | |
| `--ai-spacing-6` | bar `padding`, rooms + toolbar `padding-inline` (24px) | |
| `--ai-spacing-5` | rooms + toolbar `padding-block`, rooms + toolbar `gap`, divider `block-size` (16px) | |
| `--ai-spacing-4` | title-row `gap`, meta `column-gap`, mobile bar `gap` + `padding-inline`, mobile rooms + toolbar `padding` (12px) | |
| `--ai-spacing-3` | details `gap`, actions `gap`, room `gap`, toggle-group `gap`, buttons `gap`, mobile rooms `gap`, **mobile toolbar `gap`** (8px) | |
| `--ai-spacing-2` | meta `row-gap`, meta-item `gap`, compact-toolbar buttons `gap` (6px) | |
| `--ai-spacing-0-5` | compact-toolbar room `gap` (2px) | Figma binds `--ai-spacing-1` — see below |
| `--ai-spacing-7` | **bar `gap` (32px)**, compact export button + mobile global-action `min-height` | |
| `--ai-size-5` | desktop room-card `flex-basis` (280px) | Figma draws 290 — see below |
| `--ai-font-title` | every text node | |
| `--ai-font-fixed-xl` / `-md` | title, desktop / mobile (22 / 18px) | |
| `--ai-font-fixed-md` / `-sm` | room name, desktop / mobile (18 / 16px) | |
| `--ai-font-fixed-xs` / `-2xs` | meta items + room count, desktop / mobile (14 / 12px) | |
| `--ai-font-fixed-xxs` | "Show unassigned" (12px, both breakpoints) | |
| `--ai-font-fluid-xxs` | mobile global-action font size (from `btn--sm`) | |
| `--ai-font-bold` / `-medium` | title + room name / meta + count + toggle label | |
| `--ai-text-primary` / `--ai-text-contrast` | title + room name / meta + count + toggle label | |
| `--ai-leading-xs` | meta items (16px) | |
| `--ai-icon-size-sm` | meta icons (16px) | |
| `--ai-icon-size-md` | kebab (20px) | |
| `--ai-icon-size-xs` | swap button icon (12px, from `btn--xs`) | |
| `--ai-icon-contrast` | meta icons | |
| `--ai-icon-secondary` | kebab | **a different icon colour — see below** |
| `--ai-surface-brand` | kebab `:focus-visible` outline | |

### Two different icon colours in one component

The three meta icons are `--ai-icon-contrast` (#94a3b8); the kebab is `--ai-icon-secondary`
(#64748b). Both appear in the variant's variable list, so they were disambiguated with scoped
`get_variable_defs` calls on `3474:90247` and `3515:330387` rather than guessed. Worth a designer
glance — a one-step difference between two icons in the same header may be intentional (the kebab
is interactive, the meta icons are decoration) or may be drift.

## Token gaps and decisions

| Figma | Decision |
|---|---|
| root `w-[1552px]`, `Event-Details` `w-[900px]` — both unbound, matching no `--ai-size-*` token | **Both fluid** (designer, 2026-08-26): root `inline-size: 100%`, details `flex: 1 0 0` + `min-inline-size: 0`. The bar is `justify-between`, so the details block is simply its left column, and 1552/900 are just the frame Figma drew. Same call already taken for AttendeeCard, TableCard and TableListing. |
| Room Card instance `w-[290px]` (desktop) | **`--ai-size-5`** (280px). 290 has no token; 280 is the one that exists **and is the `min-inline-size` RoomCard itself binds** — the identical call made when RoomCard was built, so the two components agree rather than disagree by 10px. |
| Toolbar room-label `gap-[8px]`, unbound | **`--ai-spacing-3`**, which is exactly 8px, so binding it is visually a no-op. Same treatment as TableListing's 12px filter label. **Worth binding in Figma.** |
| `Event-Info-Bar` has no gap (Figma relies on `space-between` against a fixed 900px block) | **`--ai-spacing-7`** (32px) added (designer, 2026-08-26). With the details block fluid, this gap is what replaces the fixed width and keeps a long event title off the buttons. Overridden to `--ai-spacing-4` in the stacked mobile layout. |
| Figma's mobile `Toolbar-Actions` room block binds `gap: --ai-spacing-1` (4px) | **`--ai-spacing-0-5`** (2px) below 1024px (designer, 2026-08-26). Two lines of stacked text read as one block at 2px and as two separate things at 4px. The identical tightening was taken on TableDetail's legend row gap, so it is a consistent preference rather than a one-off. `--ai-spacing-1` is now unused in this component. |
| Figma's mobile `Toolbar` binds `gap: --ai-spacing-5` (16px) | **`--ai-spacing-3`** (8px) below 768px (designer, 2026-08-26) — a deliberate override rather than a Figma value. Scoped to the 767px block, so the 768–1023 tablet band keeps Figma's 16px. It is the gap between the actions group and the kebab. |
| Kebab is a bare `Icon/24px/EllipsisVertical` layer, not a Button instance | **Built as a real `<button>`** (designer, 2026-08-26) with `aria-label="More seating actions"` and a stretched `::after` giving the 44×44 touch target, while the icon stays 20px as drawn. A bare `<i>` is neither focusable nor keyboard-operable (CLAUDE.md §9). Same stretched-trigger pattern RoomCard uses. |
| Divider `line` node stroke, invisible in design context | **`--ai-border-secondary`**, resolved by `get_variable_defs` on the node itself (`3474:90290`). Not a gap — the same element, and the same resolution, as TableListing's divider. |

### `text-[22px]` is NOT a gap — design context under-reported it

The desktop title reads as a raw `text-[22px]` in `get_design_context`, which looks like an unbound
value. But `get_variable_defs` on the variant lists **`--ai-font-fixed-xl: 22`**, and nothing else in
the variant is 22px — so the title *is* bound and the design context simply did not report it.

Worth recording as a method note: **a raw-looking value in design context is not evidence of an
unbound value.** Cross-check `get_variable_defs` before raising a token gap. The same
under-reporting was hit earlier in this module.

## Device=Mobile deltas

> **Read with the breakpoint section below.** The rows from `__room` down are *toolbar* rows, and
> they now apply from **1023px**, not 767px — so they are already in effect at tablet widths.

| Property | Desktop | Mobile |
|---|---|---|
| `__bar` direction | `row`, `justify-content: space-between` | **`column`**, three stacked rows, gap `--ai-spacing-4` |
| `__bar` padding | `--ai-spacing-6` all round (24) | **`--ai-spacing-4` inline / `--ai-spacing-5` block** (12/16) — asymmetric, *not* a step-down |
| `__title` | 22px, `flex: 0 1 auto`, ellipsis | 18px, `flex: 1 0 0`, **wraps** (`overflow-wrap: break-word`) |
| `__title-row` align | `center` | `flex-start` |
| `__meta` | one row | **wraps to two** (date + attendees, then venue) |
| `__meta-item` font | 14px | 12px |
| `__actions` order | secondary, then primary | **primary first** — see below |
| `__actions` button size | base (40 tall) | `btn--sm` (32 tall) |
| `__rooms` padding / gap | 24/16, gap 16 | 12 all round, gap 8 |
| room cards | `flex: 0 0 280px` | `flex: 1 0 0` on RoomCard's own 240px floor |
| `__toolbar` padding | 24 inline / 16 block | 12 all round |
| `__toolbar` gap | `--ai-spacing-5` (16) | **`--ai-spacing-3` (8)** — a designer call, not Figma; see below |
| `__room` direction | `row`, gap 8 | **`column`**, gap **2** (Figma draws 4) |
| `__room-name` / `__room-count` | 18 / 14px | 16 / 12px |
| `__toggle-group`, `__divider` | present | **`display: none`** — absent from the variant, not rearranged |
| `__buttons` gap | 8 | 6 |
| Room Layout button | present | **hidden** |
| Add Table button | "Add Table" | **"Add"** |
| Export button | icon + text + chevron (111×32) | **icon only, 32×32** |

### Three of those deltas are content, not styling

Figma's mobile toolbar has **two** buttons where desktop has three: `Room Layout` is gone,
`Add Table` reads `Add`, and `Export` is icon-only. Read off the mobile screenshot, not guessed —
the 64×32 and 32×32 geometry alone would not have identified which buttons survived.

They are handled in CSS rather than by shipping two markups:

- `Room Layout` → `display: none`.
- The dropped words (`" Table"`, `"Export"`) are wrapped in `.seating-header__btn-shrink` and
  **clipped** with `clip-path: inset(50%)`, not `display: none`, so the full label stays in the
  accessibility tree and the icon-only export button keeps an accessible name. Same technique
  RoomCard uses to drop the word "seated". Being out of flow, they contribute no flex gap.
- **`Add Table`'s label is wrapped in a single `.seating-header__btn-label` span**, which carries no
  CSS and exists purely for layout: `.btn` is a flex container with its own gap, so leaving
  `Add` and `<span> Table</span>` as two separate children rendered **"Add&nbsp;&nbsp;Table"** —
  the button's gap *plus* the span's leading space. Caught by looking at the render, not by
  measuring. Export needs no such wrapper: its text is one child between two icons, which is
  exactly the spacing Figma draws.
- The export button gets `btn--icon btn--sm`'s 32×32 geometry inline, and the two global-action
  buttons get `btn--sm`'s four geometry properties, because **a size class cannot be added from a
  media query**.

### The mobile button order is reversed — worth confirming

Desktop leads with the secondary `Copy Plans` (x=0) and puts the primary `New Plan` second. Mobile
puts **`New Plan` first** (x=0) and `Copy Plans` second — confirmed on both the node positions and
the rendered screenshot, so it is not a misreading.

Built as drawn, via `order: -1` on the primary at mobile. **Flagged because it may be a layer-order
slip rather than a decision.** Leading with the primary CTA on a phone is a recognised pattern, so
it may well be deliberate — but it does mean the visual order and the DOM/tab order disagree at one
breakpoint, and there is no way to satisfy both without shipping two markups. DOM order follows
desktop.

## The room selector is a carousel, with no scrollbar

Figma's **own mobile variant overflows its own frame**: 12 + 240 + 8 + 240 + 12 = 512 in a 392px
frame, with the second card visibly clipped in the screenshot. So "more plans than fit" is the drawn
state, and a horizontal scroller is the faithful reading of it — the alternative would be to invent
wrapping Figma does not show.

**No scrollbar** (designer, 2026-08-26). This is *closer* to Figma than the thin bar it replaced:
Figma draws the second card simply clipped, with no scrollbar anywhere. It is deliberately **not**
the treatment TableDetail's seat list has — that is a long vertical list where the bar doubles as a
position indicator worth keeping, whereas a two-or-three-card horizontal carousel is a different
interaction. Removing it also brought the rendered mobile height from 335px to **320px** against
Figma's 317.

Only the *bar* is hidden; scrolling itself is untouched. So the three input paths are:

| Input | How | Needs JS? |
|---|---|---|
| **Touch** | native swipe, with the platform's own momentum and rubber-banding | **No** — and deliberately not reimplemented, which is how carousels end up feeling wrong |
| **Mouse** | click-and-drag, `cursor: grab` | **Yes** — `SeatingHeader.js`; no browser does this natively |
| **Keyboard** | Tab to a card and focus scrolls it into view | **No** |

The rail is deliberately **not** given a `tabindex`. The cards inside are real `<button>`s, so the
keyboard path already works, and a focusable rail would add a stop that announces nothing.

`is-scrollable` (and so the grab cursor) is applied **only when the content actually overflows**, so
a bar holding one plan does not advertise a drag that goes nowhere. It is kept in sync on resize and
on plan add/remove — a `MutationObserver`, because adding a card resizes nothing (the rail is
already full width) and a `ResizeObserver` alone would miss it. Both are coalesced to one pass per
frame, since `scrollWidth` forces layout and `lucide.createIcons()` alone fires ~40 mutations at
startup.

### Two things the drag has to get right

1. **A drag must not activate what it ends on.** Every card is a select trigger and carries
   edit/delete buttons, so a 200px drag finishing over "Delete" must not delete anything. A 5px
   movement threshold separates the two: under it the press stays an ordinary click, over it the
   click is swallowed in the **capture** phase, before the card's own handlers run. The
   suppression flag is cleared on the next `pointerdown` *and* after being used, rather than on a
   timer — a drag released outside the window fires no click at all, and a timer-cleared flag would
   still be set when the user's next genuine click arrived.
2. **`preventDefault()` is not called on `pointerdown`.** It would stop the card buttons taking
   focus and break the keyboard path. Text selection is suppressed with `user-select` during the
   drag instead.

`overscroll-behavior-x: contain` stops a swipe past the end chaining to the page, which on iOS and
in Chrome otherwise triggers back-navigation.

Verified: drag moves `scrollLeft` by exactly the pointer delta; a 2px press still clicks; a click
straight after a drag does not fire the card's handler while the next one does; and a `touch`
pointer is ignored entirely, leaving native scrolling alone.

`flex-basis` is used rather than `inline-size` on the cards because RoomCard sets its own
`inline-size: 100%`, which as a flex item would otherwise resolve against the whole bar.

## The toolbar has its own breakpoint: 1024px

Everything else reverts to the desktop layout at 768px, but **the toolbar keeps its compact form up
to 1023px** (designer, 2026-08-26). It carries far more than the bars above it — room name,
unassigned count, the switch, a divider, three buttons and the kebab — so it runs out of room long
before the event bar does.

**1024 is not invented.** It is the Seating Planner shell's own layout boundary: the prototype's
`SeatingPlannerShell.css` switches to the worklist at `max-width: 1023px`, so the DS pattern now
changes shape at the same width as the app it belongs to.

So there are **three** bands, not two — and the middle one is a state neither Figma variant shows,
which is why the demo previews it at 900px:

| | < 768 | 768–1023 | ≥ 1024 |
|---|---|---|---|
| event bar | column, 12/16 padding, 18px title | **row, 24 padding, 22px title** | row, 24 padding, 22px title |
| room label | stacked, 16px | **stacked, 16px** | row, 18px |
| toggle + divider | hidden | **hidden** | visible |
| toolbar buttons | 2 (Add, icon Export) | **2 (Add, icon Export)** | 3 (Room Layout, Add Table, Export) |
| inline padding | 12 everywhere | **24 everywhere** | 24 everywhere |

**The toolbar's `padding` deliberately stays in the 767px block**, not the 1023px one. Moving it
would indent the toolbar 12px against the event bar's 24px between 768 and 1023, which reads as a
misalignment defect rather than a compact layout. Verified aligned at 800px and 900px
(`padding-left: 24px` on both regions). **Easy to change if the tighter padding is actually wanted.**

## Border handling

Only `Event-Info-Bar` and `Room-Selector-Bar` carry a `border-b` in Figma; `Toolbar` has none. That
works out on `Has Plans`, where the toolbar is last — but on **`No Plans` the bar IS last**, and its
rule would sit directly on top of the root's own border, reading as a 2px line at the rounded bottom
edge. Suppressed with `.seating-header > :last-child { border-block-end: 0 }`, so the rule always
does its actual job of separating a bar from what follows.

## Interaction model

- **The toggle flips itself** — `Toggle` gained `Toggle.js` on 2026-08-26, so the component owns its
  own `.toggle--active` and `aria-checked`. This page just includes the script. Verified: click
  flips and restores, and clicking the "Show unassigned" text flips it too via `label[for]` +
  `aria-labelledby`.
- **Showing/hiding the unassigned tray is deliberately absent.** That belongs to the parent module —
  a consumer listens for `toggle:change` and reads `detail.active`.
- **Everything else is presentational.** Switching event, copying plans, creating a plan, selecting a
  room, the room layout / add table / export actions and the kebab menu are all the parent's job.
  RoomCard brings its own selection contract; the parent toggles `--selected` on it.
- The kebab and the swap button are real `<button>`s with `aria-label`s, since neither has visible
  text.
- `__meta` is a real `<ul>`, so the three event facts are a list to a screen reader too.

## Verification

Measured in headless Chrome at 1600px, and at a **true 390px viewport via an iframe** — note that
`--window-size=390` does *not* work, because Chrome enforces a ~500px minimum window width and
silently reports `innerWidth: 500`. An early mobile pass was measured at 500px because of it.

| | Figma | Rendered | |
|---|---|---|---|
| swap button | 32×24, icon 12×12 | **32×24, 12×12** | exact — `btn--icon btn--xs` |
| Toggle track / knob | 32×16 / 12×12 | **32×16 / 12×12** | exact — `toggle--xs` needed no change |
| divider | 1×16 `--ai-border-secondary` | **1×16, #e2e8f0** | exact |
| kebab | 20×20 `--ai-icon-secondary` | **20×20, #64748b** | exact |
| meta icons | 16×16 `--ai-icon-contrast` | **16×16, #94a3b8** | exact |
| mobile `__details` | 368×70 | 364×**70** | height exact |
| mobile `__meta` | 368×38 (2 rows) | 364×**38**, 2 rows | height exact |
| mobile global buttons | 103×32 / 114×32 | 104×32 / 115×32 | 1px |
| mobile `__bar` | 392×146 | 388×**147** | 1px (border) |
| mobile `__toolbar` | 392×62 | 388×**63** | 1px (border) |
| desktop root | 1552×288 | 1552×**291** | +3px border arithmetic |
| desktop `__bar` | 1552×99 | 1550×**98** | 1px |
| mobile root | 392×317 | 390×**320** | +3, once the scrollbar gutter went. Was 335 with the bar |
| mobile `__rooms` | 392×109 | 388×**111** | 2px — RoomCard's own 1px on each card |

Desktop toolbar/global button *widths* run 4–9px wider than Figma (126.7 vs 118, 134.3 vs 128).
That is text metrics in a headless render, not layout — every height is exact and the mobile widths
land within 1px.

Also verified: all 12 Lucide names resolve (37 `<svg>`s, zero unconverted `<i>`s), no horizontal
page overflow at either width, and the kebab is a focusable `BUTTON`.

## Notes and things to raise

- **`Icon` is the layer name for all three meta icons**, so their identities are not in the metadata
  at all — `calendar`, `users` and `map-pin` were read off a screenshot. Worth naming those layers
  `Icon/16px/Calendar` etc., as the rest of the module does, so the next build does not need a
  picture.
- **Figma's `Icon/24px/Export` has no Lucide equivalent by that name.** Built as `download`, which
  is what `FilterBar` already uses for its own Export button — the house precedent.
- **Code Connect omits the size class on two instances.** The 32×24 swap button emits
  `btn btn--secondary btn--icon` with no `btn--xs`, and the base-size Global-Actions buttons emit no
  size either. The geometry resolved both unambiguously (`.btn--icon.btn--xs` *is* 32×24), but the
  mapping is incomplete. It does correctly resolve `btn--sm` and primary/secondary elsewhere.
- **A single-child `Item` frame** wraps the desktop meta list, carrying its own `--ai-spacing-5` gap
  that does nothing with one child. Dropped. The mobile variant has no such wrapper, which is what
  confirms it is noise rather than structure — the same one-child-wrapper pattern already dropped in
  Unassigned and noted in TableDetail.
- **The desktop title carries `shrink-0` together with ellipsis rules** — an inert pair, since a
  box that cannot shrink never truncates. It only made sense against the fixed 900px parent. With
  the block now fluid the ellipsis is honoured (`flex: 0 1 auto`), which is what the rules were
  there to express.
- **The swap button needs its own `flex-shrink: 0`.** It sits directly in the title row rather than
  in a group, so unlike `__actions`, `__buttons` and `__more` — whose containers all carry it — it
  was an ordinary shrinkable flex item. Because `.btn--icon` sets `width` rather than a minimum, a
  long event title crushed it well below its 32px instead of truncating itself. Figma has the
  instance at a fixed 32×24. Fixed 2026-08-26; verified 32×24 with a 12×12 icon at 1552, 1100, 900,
  700, 500, 390 and 320px, with the title ellipsising on desktop and wrapping below 768 instead.
- **`Frame 248` / `Frame 252` are the layer names** for the room-label group and the mobile button
  group. Default Figma names; worth renaming, and the same layer-naming noise flagged on
  TableCard, TableDetail and Unassigned.
- **The `Toolbar` frame has no bottom border** while both bars above it do — verified, not assumed.
- **No hover, focus, pressed or disabled variants** for the pattern itself, and no dark-mode variant.
- **`get_design_context` on a full variant expands every RoomCard.** Fetch `Event-Info-Bar`
  (`3474:90242`), `Room-Selector-Bar` (`3474:90271`) and `Toolbar` (`3474:90282`) separately.
- **Figma MCP has a per-seat tool-call limit** that was hit partway through this build. Scoped
  `get_variable_defs` calls and screenshots are the cheap way to resolve values hidden inside SVG
  assets; a full-variant `get_design_context` is the expensive one.


---

## Responsive: container queries (2026-08-27)

**Self-container.** `.seating-header` sets `container-type: inline-size; container-name:
seating-header`, and both former media queries — the 767 mobile block and the 1023 toolbar band —
now key on it. Correct as a self-container because this pattern spans the page column, so its own
inline size *is* the available width.

**Two intrinsic fixes, independent of any breakpoint.** `.seating-header__room-name` and
`__room-count` had `white-space: nowrap` with no ellipsis and no zero min-size, so they could not
shrink and simply spilled out of their flex parent — measured a 130px box holding 243px of text,
running over the Show-unassigned toggle. Both now truncate. The container query stacks that row far
earlier now, but the guard matters at every width, which a breakpoint alone would not give.

Rationale and the decision rule live in **CLAUDE.md §4a**. The short version: a docked
SidebarMenu shrinks the CC content column with no window resize, so a viewport query cannot see
the real available width — measured 820px of column at a 2239px viewport, with no query firing.

### Room cards are capped (2026-08-27)

The narrow block sets `.seating-header__rooms > .room-card { flex: 1 0 0 }`, which Figma draws so a
single plan fills the row while two or more hold RoomCard's 240px mobile floor and scroll. With no
maximum that was harmless while the block only fired on a phone — but it now fires on **container**
width, so a squeezed desktop column produced one absurdly wide plan chip.

`max-inline-size: var(--ai-size-6)` (320) caps it. 320 sits just above Figma's mobile card (302), so
a real phone still fills the row exactly as drawn — verified at a genuine 402px viewport: one plan
renders 285px in a 285px row, four plans render 240px each and the carousel scrolls (1008 vs 309).
The cap only engages once the row is wider than the design ever intended.

**Flagged:** if plans should never exceed their 280px desktop pin, this becomes `--ai-size-5` — a
one-token change. 320 was chosen to preserve the mobile frame's fill; neither token is Figma's 302.

### The header must never shrink (fixed 2026-08-27)

Reported: "planner header all broken, no plan showing and height cropping content." Reproduced and
measured inside the Seating Planner — at a 402px column the header rendered **2px** against a
natural 251, so the room carousel was 25px and the toolbar and half the action buttons were simply
gone. At 700px it rendered 101 of 211, which is the sliced-buttons screenshot.

**The component itself was never at fault** — its own demo measured a correct 299px (bar 125 +
rooms 112 + toolbar 60) with both room cards visible, because there the parent is `display: block`
and nothing can shrink it. The failure only appears where it is a flex item.

**Mechanism, and the part worth remembering.** `.cc-control__page` is a height-constrained flex
column. SeatingPlanner had just been changed to `.seating-plan { flex: 0 0 auto }` so the stacked
row could take its natural height and let the page scroll — but `flex-shrink: 0` means the row
refuses to give anything back, so when the column ran short the **entire** shortfall (1026px at
mobile) had to come out of the only shrinkable sibling: this header, at its default
`flex: 0 1 auto`.

The usual protection did not apply, and that is the subtle bit: a flex item's automatic minimum
size (`min-height: auto`) **only protects items whose `overflow` is `visible`**. This root sets
`overflow: hidden` to keep the room carousel inside its radius, so its automatic minimum is
**zero** — it collapsed all the way and clipped, rather than refusing to shrink.

Fix: `flex-shrink: 0` on `.seating-header`. A header's height is its content, and crushing it
destroys information rather than tightening it; with this the overflow goes to the scroll container
instead, which is the correct failure mode. Inert in the standalone demo, where the parent is not
a flex container.

**A hypothesis worth recording as wrong:** the obvious suspect was `container-type: inline-size`,
since layout containment can zero an automatic minimum size. Tested directly by setting
`container-type: normal` on the live element — the header stayed at 2px. The container query had
nothing to do with it.

Verified after the fix at columns 1800 / 1400 / 1100 / 900 / 700 / 500 / 402: header always at its
natural height (294–341), room card always visible, toolbar always present, and all content
reachable — the grid scrolling at 1100 and the page scrolling at ≤700.

## Toolbar overlap and the icon-only Add (2026-08-28)

Reported: at small sizes the room label overlapped the Add button; and the principle behind it —
**a layout should never overlap, it should reflow.** The designer suspected absolute positioning.

**It was not absolute positioning.** The two `position: absolute` uses here are a 44×44 touch
target on the kebab (a pseudo-element) and the visually-hidden label pattern — neither affects
sibling layout. The cause was `align-items`.

### `align-items` becomes a WIDTH policy the moment you flip to column

`.seating-header__room` is a row on desktop and a column below 1023. The column block set
`align-items: flex-start`, which reads as harmless alignment — but in a column flex container the
cross axis is horizontal, so anything other than `stretch` **shrink-wraps each child to its own
content**. The room name therefore held a fixed 111px while its parent shrank, escaping the box by
up to **+72px** and painting over the buttons — a **56px overlap** at a 260px column.

The `overflow: hidden` + `text-overflow: ellipsis` added earlier were present the whole time and
could never fire: a shrink-wrapped box is never narrower than its own text.

`align-items: stretch` fixes it — measured at a 260px column, name 111 → 39, escape +72 → none,
56px overlap → 16px of clearance. Visually identical to `flex-start`, because the text is
left-aligned either way.

**Generalise this:** whenever a rule flips `flex-direction` to `column`, re-check `align-items`. A
value that only described alignment in the row layout silently becomes a width policy, and it is
precisely why a layout overlaps instead of reflowing.

### Add Table is icon-only on mobile (Figma updated)

Mobile frame `3515:213426` now draws the buttons group at **96 wide** — two 32×32 icon buttons plus
the 20px kebab, down from 128 — and the room block took the 16px it freed, 158 → **190**. So Add
joins Export as icon-only.

There are now three steps, because Figma has only two frames (desktop 1552, mobile 402) and the
band between is ours to degrade: **"Add Table" → "Add" (≤1023) → icon (≤767)**. The label is
CLIPPED, not removed, so "Add Table" stays the button's accessible name — verified at every width.

### A second overlap, in hit targets rather than pixels

While checking the first, hit-testing found the kebab stealing Export's rightmost ~4px: its 44×44
`::after`, centred on a 20px button, overhangs 12px each side while Figma's gap is only 8. Export
owned 9 of 10 sampled pixels.

Reduced to **36 × 44** — 20 + 8 + 8, so it fills the gap on both sides and stops exactly where the
neighbour begins. Every button now owns all of its own pixels at both breakpoints.

**Flagged:** 36 is a deliberate deviation from the 44 in CLAUDE.md §9. It still clears WCAG 2.2's
AA target-size minimum (2.5.8, 24×24) — the 44 figure is Apple HIG / WCAG 2.5.5 AAA. The
alternative is either overlapping a sibling control or widening Figma's 8px gap, which is a
designer call.

## Two designer-directed divergences from the mobile frame (2026-08-28)

Both applied on explicit instruction, and both currently differ from what `3515:213426` draws.
Recorded so the next audit reads them as intentional rather than as drift to be corrected back —
if the frames are updated to match, delete this section.

| Property | Code | Frame `3515:213426` | How the frame value was read |
|---|---|---|---|
| `.seating-header__meta` `row-gap` | `--ai-spacing-1` (4px) | **6px** | Its three meta items sit at y=0 and y=22 at 16px tall → 22 − 16 = 6 |
| `.seating-header__bar` `gap` (mobile) | `--ai-spacing-5` (16px) | **12px** | Inside the 170px Event-Info-Bar, Event-Details occupies y=16..110 and Global-Actions starts at y=122 → 122 − 110 = 12 |

Everything else in the mobile bar still matches the frame: `padding-inline` 12px and
`padding-block` 16px (block-start reads y=16, block-end reads 170 − 154 = 16), and the asymmetry
is real rather than a step-down of the desktop 24.

`align-items: flex-start` alongside `flex-direction: column` is only safe because
`.seating-header__details` sets `inline-size: 100%` two rules below. When the direction flips,
`align-items` stops being a cross-axis alignment and becomes a WIDTH policy — anything but
`stretch` shrink-wraps every child. The explicit width is what neutralises that here; do not
remove it while leaving `flex-start` in place.

### Measuring this component: there are TWO `.seating-header` in the Seating Planner

One is `display: none` (the no-plans state) and one is live. An unscoped
`querySelector('.seating-header__bar')` returns the hidden one first, which reports
`width: 0`, `flex-direction: row` and the DESKTOP gap — indistinguishable from "the mobile
container query never fired". That reading cost a diagnosis during this change. Select the first
match with a non-zero box, and kill transitions (`*{transition:none!important}`) because they do
not advance under headless Chrome's `--virtual-time-budget`.

## The toolbar's Add button has TWO label states, not three (2026-08-28)

`.seating-header__btn--add` was degrading in three steps — **"Add Table" → "Add" → icon-only** —
because the ≤1023 block clipped `.seating-header__btn-shrink` unscoped, and that class catches
both toolbar buttons while wrapping different content in each:

| Button | Markup | Effect of clipping `__btn-shrink` |
|---|---|---|
| Add | `Add<span class="__btn-shrink"> Table</span>` | leaves the bare word **"Add"** |
| Export | `<span class="__btn-shrink">Export</span>` | leaves **nothing** → icon-only |

One selector, two outcomes. The clip is now scoped to
`.seating-header__btn--export .seating-header__btn-shrink`, so Add holds its full label down to
767 and then goes icon-only, matching the only two states Figma draws (desktop 1552, mobile 402).

The intermediate "Add" was never a design state — it relieved a real overflow in the 768–1023 band
back when this pattern used viewport media queries that could not see the docked SidebarMenu
narrowing the column. With the self-container reflowing correctly there is nothing to relieve, and
a button labelled just "Add" is less clear than either state Figma specifies.

Measured across the whole band on the live screen, by CONTAINER width (which is what the queries
key on, not the viewport):

| container | Add | Export | room ↔ buttons |
|---|---|---|---|
| 1224 | "Add Table" 108px | "Export" 112px | clear 651px |
| 909 / 833 / 832 | "Add Table" 108px | icon 32px | clear 16px |
| 709 → 269 | icon 32px | icon 32px | clear 16px |

No overlap at any width and no horizontal overflow; clearance is a steady 16px from 1100 down.

**Reading that table:** the label is CLIPPED, not `display: none`, so "Add Table" stays in the
accessibility tree at every size and `innerText` still reports it when the button is visually
icon-only. The 32px width is the signal that the label is hidden — do not use text content to
test which state the button is in.

## Toolbar tightened, and its inline padding made asymmetric (2026-08-28)

Designer-directed. Three changes to two rules:

| Rule | Property | Was | Now |
|---|---|---|---|
| `.seating-header__toolbar` | `gap` | `--ai-spacing-5` 16px | `--ai-spacing-3` 8px |
| `.seating-header__toolbar` | `padding-inline-end` | (24px, from the shorthand) | `--ai-spacing-4` 12px |
| `.seating-header__toolbar-actions` | `gap` | `--ai-spacing-5` 16px | `--ai-spacing-3` 8px |

**The asymmetric padding relies on declaration order.** `padding-inline-end` must stay AFTER
`padding-inline`; reversed, the shorthand resets the end side back to 24px. It reads like a
redundant pair and is not. It happens to be alphabetical, so a property sorter leaves it alone.

**A ≤767 override became dead and was removed.** That block used to re-declare
`gap: var(--ai-spacing-3)`, scoped there deliberately so the tablet band kept Figma's 16px. With
the base rule now 8px it restated the inherited value, and its comment ("the tablet band keeps
Figma's 16px") had become false. Its `padding: var(--ai-spacing-4)` remains real — it flattens the
base rule's 24/12 inline and 16 block into 12px on all four sides, confirmed on mobile frame
`3515:213426` where a 326px Toolbar holds a 302px Toolbar-Actions at x=12.

**FLAGGED:** the `__toolbar-actions` 8px diverges from that frame, which still draws 16px — its
room block occupies x=0..190 and the button cluster starts at x=206. Third such divergence recorded
today, alongside the meta row-gap and the bar gap.

### The 8px gap halves the safety margin — stress-tested, and it holds

Room ↔ buttons clearance drops from 16px to 8px, a direct consequence of the actions gap. That is
now the tightest margin in the toolbar, and this component has a history of overlapping exactly
there, so it was tested rather than assumed. With a 60-character room name forced in at five
widths:

| viewport | name box | its `scrollWidth` | clipped? | gap | hit-test at buttons' left edge |
|---|---|---|---|---|---|
| 1024 | 613 | 613 | no | 8px | `btn` |
| 900 | 577 | 577 | no | 8px | `btn` |
| 768 | 485 | 502 | **yes** | 8px | `btn` |
| 500 | 277 | 502 | **yes** | 8px | `btn` |
| 390 | 167 | 502 | **yes** | 8px | `btn` |

The gap never goes negative, and `elementFromPoint` at the buttons' leading edge returns the
button at every width — the room name never paints over it. Below 768 the name clips with a
working ellipsis. So it reflows rather than overlaps, which is the standing requirement for this
pattern. `elementFromPoint` is the check that matters here; reasoning from the cascade is what
missed the original overlap.

## Toolbar overflow menu + the 1200 band (2026-08-28)

Two new variants on the set (`3474:90519`, now **6** variants — Type has 4 values):

| Node | Type | Frame | Management-Buttons | Dropdowns |
|---|---|---|---|---|
| `3585:110311` | `Menu >1200` | 1552 | **3** — 118 Room Layout, 101 Add, 111 Export | 176×**64**, 1 item |
| `3585:110436` | `Menu <1024` | 1100 | **2** — 101 Add, 111 Export | 176×**96**, 2 items |

The delta is exactly one 32px menu row, so Room Layout is what relocates. Menu items read
**Room Layout** and **Table Types**; Table Types is the permanent entry.

> **These two Types are NOT data.** `No Plans` / `Has Plans` are markup the caller picks; these two
> describe how the toolbar reflows, which is CSS. They are deliberately **not** mapped in
> `SeatingHeader.figma.ts` — mapping them would publish a second and third markup for what is one
> component at different widths.

### The resulting model

| container | Room Layout | Add | Export | toggle/divider | menu |
|---|---|---|---|---|---|
| ≥1200 | toolbar button | ✓ | ✓ | shown | Table Types |
| 1024–1199 | **menu item** | ✓ | ✓ | shown | Room Layout, Table Types |
| ≤1023 | menu item | ✓ | icon | hidden | Room Layout, Table Types |

Below 1024 the menu keeps both items and Add/Export stay visible (designer, 2026-08-28) — the
mobile layout is unchanged from the existing build.

**Before this, Room Layout was simply lost.** Measured on the old code: at container 1054 it was a
125px button; at 963 it was `display: none` with nowhere to go, i.e. unreachable. The menu is what
makes the collapse non-destructive.

**CSS cannot move a node,** so the button and the menu item are two copies of one action whose
visibility swaps. Anything wiring Room Layout must bind BOTH.

### Container queries measure the CONTENT box — this header's border shifts every breakpoint by 2px

`max-width: 1199px` is correct, but it does not fire at a 1199px *element*. `container-type:
inline-size` queries the content box, and this root has `border: 1px` per side:

| border-box | content box | Room Layout |
|---|---|---|
| 1202 | 1200 | toolbar |
| **1201** | **1199** | **menu** |

So the switch lands at border-box 1201. The 1023 and 767 blocks carry the same 2px offset and
always have, so 1199 was kept rather than compensated — compensating would make this one
breakpoint inconsistent with its siblings for a 2px difference nobody can see.

Worth knowing when measuring: `getBoundingClientRect().width` is the border box, so a probe will
always look 2px out of step with the query. Subtract the border before comparing.

### The root's `overflow: hidden` had to go

Figma draws the panel **48px below the header's bottom edge** (`3585:110311`: Toolbar y=224..288 in
a 288-tall symbol, Dropdowns y=272..336). An absolutely-positioned panel inside a clipped ancestor
is invisible, so the clip was removed.

It was only ever protecting the radius. The room-selector carousel — the thing the old comment said
it was for — clips itself with its own `overflow-x: auto`. The corners are now held by the first and
last rows carrying their own radii, which also survives Type=No Plans where the bar is both.
Verified after the change: root `overflow: visible`, bar top corners 16px, toolbar bottom corners
16px with `border-bottom: 0`, carousel still scrollable, panel 51px clear of the header.

That also invalidated the `flex-shrink: 0` rationale at the top of the file, which cited the clip as
the reason `min-height: auto` could not protect this element. The comment is corrected; the
declaration is kept, because stating the intent beats relying on a default that the next `overflow`
change would silently switch off again — which is how the original 2px collapse happened.

### Composition: Dropdown, not a bespoke menu

The kebab is now a `.dropdown__trigger` inside a `.dropdown` root, so open/close, outside-click
dismiss, Escape and focus return all come from `Dropdown.js`. Verified `aria-expanded` toggles and
Escape closes at every width. Dropdown.js does not require its trigger to be a `.btn`, so the kebab
keeps its icon-only look and 36×44 hit area.

Adds two page requirements: **`Dropdown.css`** and **`Dropdown.js` as `type="module"`**. Both were
already on SeatingPlanner.html; both had to be added to this component's own demo.

Only two things are set locally — the root must not shrink in the toolbar row, and the panel is
flipped to `inset-inline-end: 0` because Dropdown's default `left: 0` would push it off-screen from
a trigger at the end of the row.

**FLAGGED — panel size is Dropdown's, not Figma's.** Ours renders **240px** wide (Dropdown's own
`min-width: var(--ai-size-4)`) where Figma's instance is **176px**; heights are 66/106 against
Figma's 64/96. Figma has resized the Dropdown instance in this context — a contextual override on
*that* component. Not applied here: narrowing Dropdown globally, or scoping an override onto it from
this pattern, are both decisions about Dropdown rather than SeatingHeader.

**Both menu actions already exist as prototypes** — this menu is the trigger they never had:
`seating-room-layout` (TASK-344760, `SeatingPlannerLayout.js`) and `seating-table-types`
(TASK-342308, `SeatingPlannerTableTypes.js`). So the remaining work is wiring, and persistence is
already tracked on those two manifest rows — do not log a third.

## Verifying the breakpoints: measure the HEADER, not the window

The thresholds are the header's **own** width, confirmed with the designer 2026-08-28. Mobile-first,
the intent is: *Show unassigned is hidden until 1024; Room Layout is in the overflow menu until
1200.* Measured on `SeatingPlanner.html?state=plan`, keyed to the header's content box:

| header content width | Room Layout button | Show unassigned |
|---|---|---|
| 1202 and up | **shown** | shown |
| 1122 → 1032 | in the menu | **shown** |
| 1022 and down | in the menu | hidden |

Both fire exactly where intended. **But the browser window is a different number**, and that is what
makes this look broken when resizing:

| viewport | header container | |
|---|---|---|
| 1380 | 1202 | Room Layout still a button |
| 1300 | 1122 | Room Layout drops to the menu |
| 1210 | 1032 | Show unassigned still visible |
| 1200 | 1022 | Show unassigned disappears |

The CC shell costs a consistent **178px** — icon rail, sidebar, ActionsMenu rail, 24px page padding
each side, and this header's own 2px border. So a 1024px browser window gives the header **831px**,
and the transitions land near browser 1378 and 1202 *in this shell, in this state*.

**That offset is not fixed and is not meant to be.** It changes the moment the SidebarMenu docks or
the ActionsMenu rail opens — with no window resize at all. Keying these to the viewport was
considered and rejected: it is exactly the bug the 2026-08-27 container conversion fixed, where a
2239px viewport with the menu docked left the column at 820px, no viewport query fired, and the
toolbar text ran over the toggle.

**So when checking these thresholds, read the header's own width** — `getBoundingClientRect().width`
minus its 2px border, or the container width in DevTools' container-query badge. A browser width
tells you nothing directly, and the 178px offset is a property of the current shell state rather
than a constant to memorise.

