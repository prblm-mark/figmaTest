# EventPicker (CC) — Figma Notes

Control Centre event chooser for **Control > CRM > Seating Planner**. Shown on entering the
module and again via the "Change event" action. Lists the latest live events with the
last-used one pinned to the top.

## Figma Node

| | |
|---|---|
| File key | `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System) |
| Component set | `3108:6662` — "Seat Planner" |
| Tier | Pattern |
| Category | Control Centre (`src/cc/patterns/`) |

The set is named **Seat Planner** because Event Picker is the first of several Seating Planner
screens. The remaining screens are expected as their own component sets, not as more `Type`
values here — the four `Type` values below are all content states of the picker itself.

## Variant × Device × State Matrix

| Node ID | Device | Type | Implemented as |
|---|---|---|---|
| `3108:6661` | Desktop | Event Picker | default markup, Live ticked |
| `3108:6660` | Desktop | Event Picker (search) | `data-ep-search` has a value; JS filters + highlights |
| `3108:6659` | Desktop | Event Picker (no results) | `.event-picker__empty` shown, list hidden |
| `3108:6656` | Desktop | Event Picker (all statuses) | Live unticked; every row gains a `.badge` |
| `3108:6658` | Mobile | Event Picker | `@media (max-width: 767px)` |
| `3108:6655` | Mobile | Event Picker (search) | as above + search state |
| `3108:6654` | Mobile | Event Picker (no results) | as above + empty state |
| `3108:6657` | Mobile | Event Picker (all statuses) | as above + badges |

All 8 variants are represented. The four `Type` values are **runtime states driven by
`event-picker.js`**, not separate markup — one picker instance moves between all four as the
user types and toggles the checkbox. The demo renders four instances so each state is
reviewable side by side.

Device=Mobile is a `@media (max-width: 767px)` block per the DS breakpoint convention (Figma
draws mobile at 382px). No `--mobile` modifier class. See **Responsive amends beyond Figma**
below — Figma only draws one mobile width, so the intermediate behaviour was specified directly
by the designer.

Interactive states not drawn as variants: card `:hover` comes from ActionCard
(`--ai-border-primary`), `:focus-visible` uses the standard brand outline. Note that in
`3108:6660` (Desktop / search) the first card is drawn **in its hover state** — that is a
depiction of hover, not a static style, so it is not baked into the markup.

## Composition

Figma contains no nested component instances (the set was built from flattened prototype
captures, then bound with the tokenise plugin). The build composes the real DS components
instead, since every value matched:

| Element | Component | Verified against Figma |
|---|---|---|
| Shell, header, close, footer | `patterns/Modal` (`.modal --lg`) | header padding, title type, 32px close, 20px icon, footer padding |
| Predictive search | `components/SearchInput` (`.search`) | 40px min-height, gap-3, 16px icon, `--ai-text-contrast` placeholder |
| "Live events only" | `components/Checkbox` | 16px indicator, `--ai-radius-sm`, 14px tick, gap-3, label + helper type |
| Event row | `components/ActionCard` (`.action-card --chevron`) | `--ai-surface-primary`, 1px `--ai-border-secondary`, `--ai-radius-md`, 56px min-height, `--ai-spacing-4` padding |
| Status pills | `components/Badge` (`--pill --sm --success/warning/neutral`) | exact bg/text pairs + transparent `--ai-btn-primary-border` |
| Cancel / Clear search | `components/Button` (`.btn--secondary`) | 40px min-height, `--ai-spacing-5` padding, `--ai-radius-md`, transparent bg |

### Contextual overrides (Case B — scoped to this pattern, not added to the children)

| Child | Base value | EventPicker value | Why |
|---|---|---|---|
| `.modal` | no border | `1px solid --ai-border-secondary` | Figma shell |
| `.modal` | `--ai-shadow-lg` (inline) | `var(--ai-shadow-md)` | Figma binds `light/shadow-md` |
| `.modal__footer` | `justify-content: flex-end` | `space-between` | count sits left of Cancel |
| `.action-card` | `gap: --ai-spacing-6` | `gap: --ai-spacing-5` | Figma card gap |

`.modal`'s background stays `--ai-surface-elevated-1` rather than Figma's
`--ai-surface-primary`: identical in light (`#ffffff`), but elevated-1 is correctly lighter in
dark (`#212123` vs `#1b1b1f`), and Figma has no dark variant.

## CSS Class Mapping

| Figma layer | CSS class |
|---|---|
| Seat Planner (root) | `.modal.modal--lg.event-picker` |
| Container (filters) | `.event-picker__filters` |
| Container (list) | `.event-picker__list` |
| Paragraph (Last used / Latest events) | `.event-picker__group` |
| Button (event row) | `.action-card.action-card--chevron.event-picker__event` |
| — pinned row | `.event-picker__event--pinned` |
| Text (name) | `.event-picker__event-name` |
| Text (meta row) | `.event-picker__meta` / `__meta-item` |
| Text (stats column) | `.event-picker__stats` |
| Text (plans count) | `.event-picker__plans` (`--none` when 0) |
| Text (meter) | `.event-picker__seated` / `__seated-track` / `__seated-fill` / `__seated-label` |
| Highlighted Text | `.event-picker__mark` |
| Container (no results) | `.event-picker__empty` + `__empty-icon` / `__empty-title` / `__empty-desc` |
| Container (footer) | `.modal__footer.event-picker__footer` + `.event-picker__count` |

## Token Mapping

| Figma variable | CSS token | Role |
|---|---|---|
| `--ai-border-secondary` | same | shell border, section dividers, card border, meter track edge |
| `--ai-radius-lg` / `--ai-radius-md` / `--ai-radius-sm` / `--ai-radius-full` | same | shell / card + field / mark / pill + meter |
| `--ai-spacing-6` / `--ai-spacing-5` | same | section px / py, list py, card gap |
| `--ai-spacing-4` | same | filters gap, card padding, meta column gap |
| `--ai-spacing-3` | same | list gap, checkbox gap, mobile card gap |
| `--ai-spacing-2` | same | meta item gap, stats gap |
| `--ai-spacing-1` | same | card main gap, meter height (4px), first group padding-top |
| `--ai-spacing-8` | same | no-results icon circle (40px) |
| `--ai-spacing-9` | same | no-results block padding (48px) |
| `--ai-size-1` | same | stats column width (128px) |
| `--ai-size-6` | same | no-results description max-width (320px) |
| `--ai-size-7` | same | list scroll cap — see Token Gaps |
| `--ai-font-fixed-md` | same | modal title (18px) |
| `--ai-font-fixed-sm` | same | event name (16px) |
| `--ai-font-fixed-xs` | same | checkbox label, no-results title, button text (14px) |
| `--ai-font-fixed-xxs` | same | meta, plans, seated, count, badges, group label (12px) |
| `--ai-leading-md` / `--ai-leading-sm` / `--ai-leading-xs` | same | title + name / meta + desc / labels |
| `--ai-tracking-7` | same | group label letter-spacing — see Token Gaps |
| `--ai-text-primary` / `--ai-text-secondary` / `--ai-text-contrast` | same | name + title / meta + count / group label + 0-plans |
| `--ai-icon-contrast` | same | 12px meta and plans icons |
| `--ai-icon-size-xs` / `--ai-icon-size-sm` / `--ai-icon-size-md` | same | meta 12px / chevron 16px / no-results 20px |
| `--ai-surface-brand-soft-extra` | same | pinned row tint |
| `--ai-border-brand` | same | pinned row border |
| `--ai-surface-brand-soft` | same | search match highlight |
| `--ai-surface-secondary` | same | meter track |
| `--ai-surface-success` | same | meter fill |
| `--ai-surface-minimal` | same | no-results icon circle |
| `--ai-surface-success-soft` + `--ai-text-success` | same | Live badge |
| `--ai-surface-warning-soft` + `--ai-text-warning` | same | Draft badge |
| `--ai-surface-neutral-soft` + `--ai-text-neutral` | same | Archived badge |
| `light/shadow-md` (effect style) | `--ai-shadow-md` | shell — see Token Gaps |

## Token Gaps

Every gap below was raised and resolved with the designer on 2026-07-27.

1. **`light/shadow-md` ≠ `--ai-shadow-md`.** Figma's style is two layers
   (`0 3px 10px #0000001A` + `0 1px 4px #00000029`); the token was a single
   `0 2px 10px rgba(0,0,0,0.1)`. **Resolved:** `--ai-shadow-md` was reshaped to two layers in
   `css/tokens-shadows.css`, then the designer **softened the contact layer to `0.05`**
   (2026-07-28) — so the token is now deliberately lighter than the Figma style, which is
   unchanged at `#00000029`. Final values:
   - light: `0 3px 10px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)`
   - dark: `0 3px 10px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.125)` (Figma defines no dark
     style; derived by this file's documented 2.5× convention, tracking the softened light value)

   This affects every component using the token — Toast, Dropdown, Tooltip, ButtonGroup,
   AudioPlayer, Banner, StatCard, MessageInput, StyleSettings, UpgradeCard, FilterDropdowns,
   AssistantPopover, ActionsInfoPanel.
2. **`Neutral/0` primitive (`#ffffff`).** The only primitive in the bindings; it is the
   checkbox tick fill. **Resolved:** already `--ai-text-invert` (`#ffffff`) in the Checkbox
   component — no change, no substitution made.
3. **List scroll cap 360px** maps to no token (22.5rem). **Resolved:** use `--ai-size-7`
   (384px), the nearest token, in place of an untokenised value.
4. **Group-label letter-spacing inconsistent.** `--ai-tracking-7` (0.8px) in Desktop/default;
   raw `0.96px` (0.08em, inherited from the prototype capture) in the other 7 variants. The
   tracking scale stops at 0.05em. **Resolved:** use `--ai-tracking-7` everywhere.
5. **No-results description lost its bindings** — raw `#3c3c3f`, `12px`, `20px` line-height and
   `Inter:Bold` (a mixed-style text node the tokenise plugin could not bind). **Resolved:**
   mapped to the semantic equivalents `--ai-text-secondary` / `--ai-font-fixed-xxs` /
   `--ai-leading-sm` / `--ai-font-bold`.

## Deviations & inconsistencies

### Deliberate deviations from Figma

| Figma | Code | Decision |
|---|---|---|
| Pinned card (`3087:5104`) is tinted `--ai-surface-brand-soft-extra` with a `--ai-border-brand` border | Pinned card is styled exactly like any other card | **Brand bg/border removed** at the designer's request (2026-07-28). The last-used event is identified by the "Last used" group heading and its position at the top of the list. `.event-picker__event--pinned` is retained as a markup hook with no styling — do not re-add the tint from Figma. |
| `light/shadow-md` contact layer `#00000029` | `rgba(0,0,0,0.05)` | Softened by the designer — see Token Gaps #1 |

### Cross-variant inconsistencies

The set was built from prototype captures, so several differences between variants were
capture artifacts rather than design intent. Each was raised and decided:

| Inconsistency | Decision |
|---|---|
| Desktop shell has border + `shadow-md`; Mobile has neither (Mobile carried the prototype's `shadow-lg`) | **Unify on desktop** — border + `shadow-md` at both sizes |
| "Clear search" is secondary on Desktop, tertiary on Mobile | **Secondary** (bordered) at both sizes |
| Group-label icon present only in Desktop/search (12px calendar) | **Drop the icons** — matches the other 7 variants |
| Meter fill is 4px tall except three rows in Desktop/all-statuses at 2px | **4px** — the 2px rows are a Figma slip |

Zero-visual-impact differences deliberately **not** changed, because the DS component is the
authority and the token values resolve identically:

- Buttons: Figma `--ai-font-title` + `--ai-font-fixed-xs`; `.btn` uses `--ai-font-body` +
  `--ai-font-fluid-xs`. Both are Inter at 14px on every breakpoint.
- Checkbox checked fill: Figma `--ai-btn-primary-bg`; component uses `--ai-surface-brand`.
  Both `#2563eb`.

## Responsive amends beyond Figma

Figma draws exactly two widths (768px desktop, 382px mobile). These rules were specified
directly by the designer on 2026-07-28 and have no Figma counterpart:

| Breakpoint | Element | Rule |
|---|---|---|
| all | `.event-picker__list` | `scrollbar-width: thin` + `scrollbar-color: var(--ai-surface-secondary) transparent` (plus `overscroll-behavior: contain`, so scroll doesn't chain to the page behind) |
| `max-width: 767px` (below `--ai-bp-md`) | `.event-picker__stats` | `border-top: 1px solid var(--ai-border-secondary)` + `padding-top: var(--ai-spacing-3)` — the stats wrap onto their own row here, so they read as a divided section |
| `max-width: 639px` (below `--ai-bp-sm`) | `.event-picker__filters`, `.event-picker__list`, `.event-picker__empty` | `padding: var(--ai-spacing-5)` (from `--ai-spacing-5 --ai-spacing-6`; the empty block drops from `--ai-spacing-9` vertical) |
| `max-width: 639px` | `.modal__header`, `.modal__footer` | `padding: var(--ai-spacing-4) var(--ai-spacing-5)` — **lives in `patterns/Modal`, not here**: applied to every modal by request, so it is not duplicated in this file |

`--ai-bp-sm` (40rem/640px) and `--ai-bp-md` (48rem/768px) are the token values behind those
media queries; `@media` uses px per CLAUDE.md §2.

## Brand mode

The Figma component set is authored in the **standard theme** (`--ai-btn-primary-bg` `#2563eb`),
not the Control Centre palette (`#3391a4`) — confirmed as intentional by the designer
(2026-07-27).

The demo nevertheless sets `data-brand="cc"` like every other CC demo, because the pattern
ships inside the Control Centre and the demo should preview the palette it will actually
render in — teal, not the blue of the Figma frames. To keep the Figma comparison available,
the demo toolbar carries a **"CC brand" toggle** (on by default) that removes/reapplies
`data-brand` at runtime.

This is a demo-wrapper concern only: the CSS uses semantic `--ai-*` tokens throughout and is
brand-agnostic, so the pattern re-themes automatically wherever it is placed (e.g. inside
ControlScreen). Both palettes were verified in light and dark.

## JS API

`event-picker.js` wires search, the Live checkbox, selection, clear and close. It emits events
rather than owning state, so the host app keeps routing and persistence:

| Event | Detail | Meaning |
|---|---|---|
| `event-picker:select` | `{ id, name }` | an event row was chosen |
| `event-picker:close` | — | Cancel, the close button, or Esc |

"Remember the last event per user" is **deliberately not implemented here** — the pinned row is
driven by markup (`data-group="pinned"`), and persistence belongs to the host. See the
`TODO(backend:SeatingPlanner)` markers in `event-picker.js`.

## Notes

- Lucide names used: `x`, `search`, `check`, `calendar`, `map-pin`, `users`, `layout-grid`,
  `chevron-right`, `search-x`.
- `--event-picker-seated` is an inline custom property carrying a per-row **data** value
  (seated ÷ capacity), not a style decision.
- Figma's root carries `max-h-[1227px]` and `p-px`; both are capture artifacts (viewport height
  and border compensation) and are not implemented.
- Badges appear only in the "all statuses" state: when the list is filtered to live events a
  per-row "Live" badge would be redundant.
