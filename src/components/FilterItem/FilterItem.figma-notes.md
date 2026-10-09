# Filter Item — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set:** `2972:1058` ("Filter Item")
- **Tier:** `Component` → built into `src/components/FilterItem/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2972-1058

A faceted filter chip: a resting "+ Name" affordance that opens a value picker, and a
selected treatment that lists the chosen values (`× Name · Affino, Display ⌄`) with a count
rollup at 4+.

## Variant matrix (22 = 8 State × Rounded × Device)

| Node ID | State | Rounded | bg | border | content | Built |
|---|---|---|---|---|---|---|
| 2972:1056 | Default | False | `surface-primary` | `border-secondary` solid | `+ Name` | ✅ |
| 2972:1059 | Default | True | `surface-primary` | `border-secondary` solid | `+ Name` | ✅ |
| 2972:1057 | Empty | False | `surface-primary` | `border-contrast` **dashed** | `+ Name` | ✅ |
| 2972:1072 | Empty | True | `surface-primary` | `border-contrast` **dashed** | `+ Name` | ✅ |
| 2972:1055 | 1 Selected | False | `surface-info-soft` | `border-info` solid | `× Name · Affino ⌄` | ✅ |
| 2972:1063 | 1 Selected | True | `surface-info-soft` | `border-info` solid | `× Name · Affino ⌄` | ✅ |
| 2972:1185 | 2 Selected | False | `surface-info-soft` | `border-info` solid | `× Name · Affino, Display ⌄` | ✅ |
| 2972:1194 | 2 Selected | True | `surface-info-soft` | `border-info` solid | `× Name · Affino, Display ⌄` | ✅ |
| 2972:1209 | 3 Selected | False | `surface-info-soft` | `border-info` solid | `× Name · Affino, Display, QA9 ⌄` | ✅ |
| 2972:1218 | 3 Selected | True | `surface-info-soft` | `border-info` solid | `× Name · Affino, Display, QA9 ⌄` | ✅ |
| 2972:1242 | 4+ Selected | False | `surface-info-soft` | `border-info` solid | `× Name · Affino, and 3 more ⌄` | ✅ |
| 2972:1233 | 4+ Selected | True | `surface-info-soft` | `border-info` solid | `× Name · Affino, and 3 more ⌄` | ✅ |
| 3664:14429 | **MOuseover** | True | **`surface-minimal`** | `border-secondary` solid | `+ Name` | ✅ `:hover` |
| 3664:14425 | **MOuseover** | True *(Mobile)* | **`surface-minimal`** | `border-secondary` solid | `+ Name` | ⚠ paint ✅ / geometry ✗ |
| 3664:14437 | **Filter Dropdown Active** | True | **`surface-info-soft`** | **`border-info`** solid | `+ Name` | ✅ `.filter-item--open` |
| 3664:14441 | **Filter Dropdown Active** | True *(Mobile)* | **`surface-info-soft`** | **`border-info`** solid | `+ Name` | ⚠ paint ✅ / geometry ✗ |

**Axis independence (verified, not assumed):** `Rounded` changes only the radius — confirmed on
Default False (`--ao-radius-md`) vs Default True (`--ao-radius-full`); design context is otherwise
identical. `State` changes only fill/border/content — confirmed across the False column
(Default / Empty / 1 / 4+ fetched in full). The True selected variants therefore compose as
`--rounded` + `--selected` + value text. CSS represents the cross-product via two independent
modifier classes rather than 12 rules.

### Mouseover and Filter Dropdown Active (added 2026-09-17)

Figma added two states on the **Rounded=True shape only** — there is no
Rounded=False counterpart for either, so the shape axis and these two states do
not cross in the design.

| State | What moves | Implemented as |
|---|---|---|
| `MOuseover` *(Figma's typo, kept here so the name matches)* | background only → `--ao-surface-minimal`. Border, text, icon, padding, radius all unchanged — verified on Desktop **and** Mobile, not carried across | `:hover` |
| `Filter Dropdown Active` | `--ao-surface-info-soft` + `--ao-border-info` | `.filter-item--open` |

**Hover is scoped with `:not()`** to exclude `--selected`, `--open` and `--empty`.
The first two carry the info palette in Figma and a hover passing over them must
not wash it out; `--empty` is excluded because Figma defines no Empty+Mouseover
variant and its Mouseover chip draws a **solid** border where `--empty` is
dashed — they are not the same chip. The `transition` sits on the companion rest
rule, not inside `:hover`, so it plays on the way out too.

**`Filter Dropdown Active` needed its own rule** even though `--selected`
already paints this way: Figma's Active variant shows an **unselected** chip —
leading `+`, no values — wearing the info palette, so a chip takes it the moment
its picker opens, whether or not anything is chosen.

Two combinations Figma does not define, and what the code does:
- **Empty + hover** — no hover feedback (excluded, as above). The "Add Filters"
  chip is a button, so this may be worth a Figma variant.
- **Empty + open** — `--open` wins the paint (it is later in the file) but
  `--empty`'s dashed border survives, giving a dashed chip in the info palette.

### Device=Mobile is NOT implemented (pre-existing gap)

The set carries 10 `Device=Mobile` variants — height `--ao-spacing-6` (24px) vs
32, gap `--ao-spacing-0-5` (2px) vs `--ao-spacing-1`, padding
`--ao-spacing-2`/`--ao-spacing-3` vs `--ao-spacing-3`/`--ao-spacing-4`, and font
`--ao-font-fixed-4xs` (11px) vs `--ao-font-fixed-xxs` (12px). `FilterItem.css`
has **no `@media` or `@container` block at all**, so chips render at desktop
geometry on every screen. Predates this change and is not addressed by it.

## Interaction (confirmed with user, 2026-06-22)

- **Scope:** visual states + a small JS state API. No real value picker is built — the consumer
  mounts one on the `filter-item:toggle` event. (Option "Visual + state API".)
- **Empty vs Default:** Empty (dashed) is an *add-a-filter placeholder*; Default (solid) is a
  configured filter with no values selected yet, whose chevron opens the picker.
- **Label rollup:** 1–3 selected list every value comma-joined; 4+ shows `<first>, and N more`.
  Filter name in `--ao-font-medium`, values in `--ao-font-semibold`.

## CSS Class Mapping

| Figma element | CSS class | Notes |
|---|---|---|
| Chip container | `.filter-item` | inline-flex, gap `--ao-spacing-1`, height `--ao-spacing-7`, padding `--ao-spacing-2 --ao-spacing-4 --ao-spacing-2 --ao-spacing-3` (py6 / pr12 / pl8), `--ao-radius-md`. Base = Default. |
| Rounded=True | `.filter-item--rounded` | `border-radius: var(--ao-radius-full)` |
| Empty | `.filter-item--empty` | `border-style: dashed; border-color: var(--ao-border-contrast)` |
| Selected | `.filter-item--selected` | `background: var(--ao-surface-info-soft); border-color: var(--ao-border-info)` |
| Open (chevron flipped) | `.filter-item--open` | JS-toggled; rotates `.filter-item__chevron` 180° |
| Trigger (Name · values + chevron) | `.filter-item__trigger` | `<button>`, transparent reset, opens the picker |
| Clear (×) | `.filter-item__clear` | `<button>`, selected-only, resets the chip |
| Leading add icon (+) | `.filter-item__add` | Lucide `plus`; hidden when `--selected` |
| Filter name | `.filter-item__name` | `--ao-font-medium`, `--ao-font-fixed-xxs` |
| Separator | `.filter-item__sep` | `·` — `--ao-font-fixed-sm` / `--ao-font-regular` / `--ao-icon-contrast` |
| Selected values | `.filter-item__values` | `--ao-font-semibold`, `--ao-font-fixed-xxs`; text set by JS rollup |
| Chevron | `.filter-item__chevron` | Lucide `chevron-down`, 12px |

## Token Mapping

| Figma variable | CSS variable | Role |
|---|---|---|
| `surface/primary` | `--ao-surface-primary` | Default / Empty bg |
| `surface/info-soft` | `--ao-surface-info-soft` | Selected bg (#f0f3ff) |
| `border/secondary` | `--ao-border-secondary` | Default border (#e2e2e3) |
| `border/contrast` | `--ao-border-contrast` | Empty dashed border (#c2c2c4) |
| `border/info` | `--ao-border-info` | Selected border (#bfd1ff) |
| `text/primary` | `--ao-text-primary` | Name + values text |
| `icon/contrast` | `--ao-icon-contrast` | All icons (+, ×, chevron) + separator (#929295) |
| `icon-size/xs` (12px) | `--ao-icon-size-xs` | Plus / × / chevron size |
| `font/title` | `--ao-font-title` | All text (Inter) |
| `font/medium` | `--ao-font-medium` | Filter name weight |
| `font/semibold` | `--ao-font-semibold` | Selected values weight |
| `font/regular` | `--ao-font-regular` | Separator weight |
| `font/fixed-xxs` (12px) | `--ao-font-fixed-xxs` | Name + values size |
| `font/fixed-sm` (16px) | `--ao-font-fixed-sm` | Separator glyph size |
| `leading/xs` (16px) | `--ao-leading-xs` | Name + values line-height |
| `leading/md` (24px) | `--ao-leading-md` | Separator line-height |
| `spacing/1` (4px) | `--ao-spacing-1` | Inter-element gap |
| `spacing/2` (6px) | `--ao-spacing-2` | Vertical padding |
| `spacing/3` (8px) | `--ao-spacing-3` | Left padding |
| `spacing/4` (12px) | `--ao-spacing-4` | Right padding |
| `spacing/7` (32px) | `--ao-spacing-7` | Chip height |
| `radius/md` (8px) | `--ao-radius-md` | Rounded=False corner |
| `radius/full` | `--ao-radius-full` | Rounded=True corner |

## Token Gaps

None. Every design value resolves to an `--ao-*` token (verified via `get_variable_defs`):
the 12px icons map to `--ao-icon-size-xs`, and `--ao-surface-info-soft` / `--ao-border-info` /
`--ao-border-contrast` all exist in `css/tokens.css`.

The only raw px value is `letter-spacing: -0.3125px` on the separator `·` — an allowed optical
typographic exception (matches Figma `tracking-[-0.3125px]`).

## Notes

- **The × is a -45°-rotated Plus in Figma** (same 12px glyph, rotated so a 12px square's bounding
  box becomes ~16.97px). Implemented with the dedicated Lucide `x` icon rather than a rotated
  plus — visually equivalent, no hardcoded `16.971px` box needed.
- **Icon naming mismatch:** Figma icons are named `Icon/24px/Plus`, `Icon/24px/ChevronDown` but
  are *placed* at 12px. Design context reports the base 24px name; the placed `size-[12px]` is the
  real size → `--ao-icon-size-xs`. Lucide names: `plus`, `x`, `chevron-down`.
- **No Figma hover/focus state.** The component set defines only the 12 static variants. A
  `:focus-visible` outline (`--ao-surface-brand`) is added for WCAG 2.1 AA; no hover colour is
  invented (per the no-fallback rule).
- **Touch target.** The chip is a fixed 32px tall per Figma — below the 44px WCAG AAA target.
  Kept at the Figma height; consumers placing it in dense filter bars should be aware.
- **Always-full markup.** The HTML always renders every slot (clear / add / name / sep / values /
  chevron); CSS hides what the current state doesn't use, so JS can move a chip Default ⇄ Selected
  without re-rendering.

## Backend handover

`TODO(backend:Filters)` — the value picker, the source list of filterable values, and persistence
of the active filter are out of scope for this front-end chip. Wire them on the
`filter-item:toggle` custom event (the chip owns only its own visual state).

## Dependencies

- Lucide icons via CDN — `plus`, `x`, `chevron-down`.
- No project-component dependencies (the Figma "Icon/*" nodes are icon primitives, not components).
- Button (`.btn--secondary .btn--sm`) is used **only in the demo** to drive the live `setFilterValues` example.


## The value truncates; the count does not

Reported on a phone, 2026-09-21: a chip reading "Countries · United Kingdom,
and 3 more" ran past the filter bar and off the screen.

A chip has to give somewhere, and WHERE matters. Ellipsising the whole rollup
takes the count with it — "United Kingdom, and 3 …" reads as one country
selected, which is worse than useless. So the rollup is now rendered as two
spans:

| Span | Behaviour |
|---|---|
| `.filter-item__values-lead` | the first value (or the 1–3 comma list) — **shrinks, ellipsises** |
| `.filter-item__values-rest` | `, and N more` — **never shrinks** |

`textContent` on `.filter-item__values` is still the whole rollup, so nothing
that reads the chip changes, and a screen reader hears all of it.

### The chain that makes it possible

A flex item will not shrink below its content unless every box between it and
the row says it may. Four rules, and it needs all four:

- `.filter-item { max-inline-size: 100% }`
- `.filter-item__trigger { min-inline-size: 0 }`
- `.filter-item__values { min-inline-size: 0; overflow: hidden }`
- `.filter-bar__chip { max-inline-size: 100%; min-inline-size: 0 }` (FilterBar)

The last one is the one that was actually load-bearing: with the wrapper still
at its default `min-width: auto`, the chip's own `max-inline-size: 100%`
resolved against a box that had already grown to fit the text, so it measured
501px inside a 314px bar and nothing else in the chain could bite.

`.filter-item__name` is explicitly `flex: none` — a chip that truncates its own
NAME says nothing at all.

Measured at a 360px viewport: a four-value chip with a 51-character first value
stops at 255px, the lead ellipsises, ", and 3 more" stays whole, and the name
is intact. A short value is unaffected.
