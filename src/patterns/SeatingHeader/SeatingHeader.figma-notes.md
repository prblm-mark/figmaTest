# SeatingHeader — Figma Notes

**Tier:** Pattern
**Built:** 2026-08-26 (Seating Planner module, wave 6)
**Files:** `SeatingHeader.css`, `SeatingHeader.html`, `SeatingHeader.figma.ts`, `SeatingHeader.figma-notes.md`
**Composes:** Button (base, `--sm`, `--icon --xs`, `--icon --2xs` via RoomCard), Toggle (`toggle--xs`, label-less), RoomCard (one per plan)
**JS:** `Toggle.js` only — the pattern itself ships none

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

`Tier` is single-valued (`Pattern`).

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
├── .seating-header__rooms          Room-Selector-Bar (a Figma SLOT) — border-b, scrolls
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
| `--ai-radius-full` | scrollbar thumb | |
| `--ai-spacing-6` | bar `padding`, rooms + toolbar `padding-inline` (24px) | |
| `--ai-spacing-5` | rooms + toolbar `padding-block`, rooms + toolbar `gap`, divider `block-size` (16px) | |
| `--ai-spacing-4` | title-row `gap`, meta `column-gap`, mobile bar `gap` + `padding-inline`, mobile rooms + toolbar `padding` (12px) | |
| `--ai-spacing-3` | details `gap`, actions `gap`, room `gap`, toggle-group `gap`, buttons `gap`, mobile rooms `gap` (8px) | |
| `--ai-spacing-2` | meta `row-gap`, meta-item `gap`, mobile buttons `gap`, scrollbar thickness (6px) | |
| `--ai-spacing-1` | mobile room `gap` (4px) | |
| `--ai-spacing-7` | mobile export button + global-action `min-height` (32px) | |
| `--ai-size-5` | desktop room-card `flex-basis` (280px) | Figma draws 290 — see below |
| `--ai-font-title` | every text node | |
| `--ai-font-fixed-xl` / `-md` | title, desktop / mobile (22 / 18px) | |
| `--ai-font-fixed-md` / `-sm` | room name, desktop / mobile (18 / 16px) | |
| `--ai-font-fixed-xs` / `-2xs` | meta items + room count, desktop / mobile (14 / 12px) | |
| `--ai-font-fixed-2xs` | "Show unassigned" (12px, both breakpoints) | |
| `--ai-font-fluid-xxs` | mobile global-action font size (from `btn--sm`) | |
| `--ai-font-bold` / `-medium` | title + room name / meta + count + toggle label | |
| `--ai-text-primary` / `--ai-text-contrast` | title + room name / meta + count + toggle label | |
| `--ai-leading-xs` | meta items (16px) | |
| `--ai-icon-size-sm` | meta icons (16px) | |
| `--ai-icon-size-md` | kebab (20px) | |
| `--ai-icon-size-xs` | swap button icon (12px, from `btn--xs`) | |
| `--ai-icon-contrast` | meta icons | |
| `--ai-icon-secondary` | kebab | **a different icon colour — see below** |
| `--ai-surface-secondary` | scrollbar thumb | |
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
| `__room` direction | `row`, gap 8 | **`column`**, gap 4 |
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

## The room selector scrolls

Figma's **own mobile variant overflows its own frame**: 12 + 240 + 8 + 240 + 12 = 512 in a 392px
frame, with the second card visibly clipped in the screenshot. So "more plans than fit" is the drawn
state, and a horizontal scroller is the faithful reading of it — the alternative would be to invent
wrapping Figma does not show.

Given the same thin-scrollbar treatment as TableDetail's seat list (transparent track,
`--ai-surface-secondary` thumb, `scrollbar-width: thin`), so the module's two scrollers match.

`flex-basis` is used rather than `inline-size` on the cards because RoomCard sets its own
`inline-size: 100%`, which as a flex item would otherwise resolve against the whole bar.

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
| desktop root | 1552×288 | 1600×**291** | fluid width by decision; +3px border arithmetic |
| mobile root | 392×317 | 390×**335** | +18: 11px scrollbar gutter + RoomCard's own 1px ×2 + borders |

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
