# Unassigned — Figma Notes

**Tier:** Pattern
**Built:** 2026-08-25 (Seating Planner module, wave 4b)
**Files:** `Unassigned.css`, `Unassigned.html`, `Unassigned.figma.ts`, `Unassigned.figma-notes.md`
**Composes:** AttendeeCard (both booleans off), Input (`input input--sm`, label-less)
**JS:** none

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Page:** Seat Planner (`3087:5050`)
- **Component set:** `3478:111942`

## Variant matrix (2 variants)

| Type | Node | Figma size | CSS |
|---|---|---|---|
| Default (empty state) | `3478:111940` | 321×297 | `.unassigned` + `.unassigned__empty` |
| `Unassiged` [sic] (populated) | `3478:111941` | 321×472 | `.unassigned` + `.unassigned__list` |

> **Figma typo.** The populated variant is named **`Unassiged`**, missing the second `n`. Worth
> correcting — it will read back into any Code Connect enum and into the property panel.

**There is no Tier axis and no Device axis** — the only property is Type. Every other component in
this module carries `Tier=Component` or `Tier=Pattern`, so its absence here is an inconsistency
rather than a statement. It composes two components, so CLAUDE.md §4 puts it in `src/patterns/`.

**Mobile safety net checked.** With no Device variant, the word "mobile" was searched for across the
design context and `get_variable_defs` output for the whole set — **zero occurrences**. There is
genuinely no mobile layout to implement, so no media query. The panel is a fixed 320px rail at every
width, as TableDetail is.

### The Type axis is data, not CSS

`Default` is the empty state and `Unassiged` is the populated list. Which one renders is markup the
caller supplies, so there are **no Type modifiers** — `__empty` and `__list` are simply different
children of `__body`. Same finding as TableCard and TableDetail.

The header is byte-identical between the two variants apart from the count (`0` vs `6`).

## Composition

**AttendeeCard with BOTH booleans off.** Verified on `3478:111764`: no `seat` frame and no actions
frame, just the accent bar and the name/meta block. That is exactly what AttendeeCard's
`Show Seat Number` and `Show Actions` booleans are for — an unseated person has no seat to number
and nothing to reorder. Nothing about AttendeeCard needed changing.

**Input, label-less, `input--sm`, leading search icon.** `Input`'s own demo already ships label-less
instances, so this is precedented rather than a new usage. Given there is no visible label, the
field carries `aria-label="Search unassigned attendees"` — a placeholder is not an accessible name.
Built as `<input type="search">`, which is the correct type for the control.

> **The PUBLISHED Code Connect for Input is stale.** Figma's snippet for this instance emits
> `class="input__field"`, but `input__field` appears **zero** times in `Input.css` — the class is
> `input__control`, and `Input.figma.ts` in the repo says `input__control` correctly. So the repo is
> right and Figma is serving an old publish. **`npm run code-connect:publish` would fix it**; until
> then a designer copying that snippet gets markup that does not style. Left for the designer, since
> publishing writes to Figma.

## The search field spans the sheet

`inline-size: 100%` on both `.input` and its `.input__wrap`, per the designer 2026-08-25.

This originally needed a `max-inline-size: none` override as well, because `Input`'s `--sm` size
capped the wrap at 192px so the field rendered narrower than the attendee rows beneath it. **That cap
was removed from Input on 2026-08-25** — this was its second consumer in two days, and the third
workaround overall — so the override is gone and only the width remains. See
`Input.figma-notes.md` for the removal and the before/after measurements that proved it safe.

Verified: the wrap measures 286px in all three demo panels, matching the body's content box and the
rows below.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-primary` | panel `background-color` | |
| `--ai-border-secondary` | panel + empty-state `border-color` | |
| `--ai-radius-lg` | panel `border-radius` (16px) | |
| `light/shadow-xxs` → `--ai-shadow-xxs` | panel `box-shadow` | |
| `--ai-size-6` | panel `inline-size` (320px) | Figma draws 321 — see below |
| `--ai-spacing-5` | header `padding`, body `padding-inline` + `padding-block-end`, empty `padding-inline` | |
| `--ai-spacing-2` | header `gap`, empty `gap` | |
| `--ai-spacing-3` | header-row `gap`, body `gap`, list `gap` | |
| `--ai-spacing-1` | count `padding-block` | |
| `--ai-spacing-4` | count `padding-inline` (12px) | |
| `--ai-spacing-7` | empty `padding-block` (32px) | |
| `--ai-font-title` | every text node | |
| `--ai-font-fixed-md` | panel title (18px) | |
| `--ai-font-fixed-4xs` | count (11px) | |
| `--ai-font-fixed-2xs` | hint, empty body copy (12px) | |
| `--ai-font-fixed-xs` | empty-state heading (14px) | |
| `--ai-font-bold` / `-semibold` / `-regular` | title / count + empty heading / hint + empty copy | |
| `--ai-leading-xs` | hint, empty body copy (16px) | see below |
| `--ai-leading-sm` | empty-state heading (20px) | |
| `--ai-text-primary` / `--ai-text-contrast` | title + empty heading / hint + count + empty copy | |
| `--ai-surface-secondary` | count `background-color` | |
| `--ai-radius-full` | count `border-radius` | |
| `--ai-radius-md` | empty-state `border-radius` (8px) | |
| `--ai-icon-size-sm` | empty-state tick (16px) | |
| `--ai-surface-success` | empty-state tick colour | a SURFACE token on an icon — see below |

## Token gaps and decisions

All resolved with the designer 2026-08-25 rather than invented.

| Figma | Decision |
|---|---|
| panel `w-[321px]`, unbound | **`--ai-size-6`** (320px). 321 has no token and is 1px off the one that exists, which TableDetail's identical rail *is* bound to. Treated as a Figma slip; worth nudging the frame to 320 and binding it. |
| empty body copy `line-height: 1.4` (unitless), unbound | **`--ai-leading-xs`** (16px, i.e. 1.33). No `--ai-leading-*` token matches 1.4 — the scale is all px, and 1.4 × 12px is 16.8px. 0.8px tighter per line, ~2.4px over this three-line paragraph. |
| empty tick coloured `--ai-surface-success` | **Used as drawn.** A *surface* token doing an icon's job, because **the icon scale has no success entry at all** — it stops at primary / secondary / contrast / invert / invert-secondary / brand, while surfaces and text both have success/error/warning. 3.16:1 on white clears the 3:1 WCAG asks of a graphical object, so this is safe; but **`--ai-icon-success` is a genuine hole in the scale** and worth filling. |
| `Orange/600` (`#ea580c`) in the set's variable list | **Not a gap.** Present in `get_variable_defs` but used by nothing in this component — the same phantom seen on TableDetail. Likely bound on a hidden layer or in another Seating Planner mode. |

## Height: grows with content

Figma sets **no height** on either variant, so the panel is as tall as its contents — built that way.

**This differs from TableDetail deliberately**, where Figma *did* pin a height (698px) and the
designer replaced it with fill-the-column plus a scrolling list. Here there is nothing to replace.

> **Worth a decision before this goes in the module template.** A tray with fifty unseated people
> will grow unbounded and take the page scroll with it, where TableDetail's equivalent list scrolls
> inside a fixed header. Nothing was invented here — Figma is unambiguous — but the two side rails
> will behave differently until someone says which is right.

## Interaction model

- **Presentational only, no JS.** In the real module these rows are the drag **sources** that the
  seat rows (AttendeeCard's `--dragged-over`) receive. The parent owns dragging on both sides, so
  neither component ships it.
- The search field filters the list — also the parent's job. No JS here.
- The count is supplied, not computed. See the handover note.

## Notes

- **`Seating Status Badge` is an inline frame, not a component instance.** `get_metadata` reports it
  as `<frame>` where `Input` and `Attendee Card` report as `<instance>`, so it is correctly scoped
  as `.unassigned__count`. Renders 31×22 against Figma's 32×21 — within text-metric noise.
- **The body slot has two names**: `Body` on Type=Default, `guest-list` on Type=Unassiged. The same
  container modelled twice — the identical inconsistency TableDetail has.
- **`Left-Footer-Area` is the frame name for the hint line.** That name has now been reused for
  three unrelated things across the module (TableCard's count+badge group, TableDetail's meta line,
  this hint). Figma layer-naming noise; worth a sweep.
- **A single-child flex wrapper around the hint** was dropped — `Left-Footer-Area` has one child and
  a gap, which does nothing.
- Rendered panel heights are **296 / 480** against Figma's 297 / 472. The empty state is 1px under;
  the populated one is 8px over, which is exactly the panel's 2px border plus 1px of `box-sizing:
  border-box` on each of the six cards. Cosmetic arithmetic in an auto-height panel.
- **No hover, focus, pressed or disabled variants** in the set, and no dark-mode variant. The
  `--sp-*` role colours on the rows are **not** theme-aware.
- The Lucide names match Figma's layer names: `circle-check` for `Icon/24px/CircleCheck`, `search`
  for the Input icon.
