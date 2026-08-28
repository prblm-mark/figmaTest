# Filter Item — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set:** `2972:1058` ("Filter Item")
- **Tier:** `Component` → built into `src/components/FilterItem/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2972-1058

A faceted filter chip: a resting "+ Name" affordance that opens a value picker, and a
selected treatment that lists the chosen values (`× Name · Affino, Display ⌄`) with a count
rollup at 4+.

## Variant matrix (12 = 6 State × 2 Rounded)

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

**Axis independence (verified, not assumed):** `Rounded` changes only the radius — confirmed on
Default False (`--ai-radius-md`) vs Default True (`--ai-radius-full`); design context is otherwise
identical. `State` changes only fill/border/content — confirmed across the False column
(Default / Empty / 1 / 4+ fetched in full). The True selected variants therefore compose as
`--rounded` + `--selected` + value text. CSS represents the cross-product via two independent
modifier classes rather than 12 rules.

## Interaction (confirmed with user, 2026-06-22)

- **Scope:** visual states + a small JS state API. No real value picker is built — the consumer
  mounts one on the `filter-item:toggle` event. (Option "Visual + state API".)
- **Empty vs Default:** Empty (dashed) is an *add-a-filter placeholder*; Default (solid) is a
  configured filter with no values selected yet, whose chevron opens the picker.
- **Label rollup:** 1–3 selected list every value comma-joined; 4+ shows `<first>, and N more`.
  Filter name in `--ai-font-medium`, values in `--ai-font-semibold`.

## CSS Class Mapping

| Figma element | CSS class | Notes |
|---|---|---|
| Chip container | `.filter-item` | inline-flex, gap `--ai-spacing-1`, height `--ai-spacing-7`, padding `--ai-spacing-2 --ai-spacing-4 --ai-spacing-2 --ai-spacing-3` (py6 / pr12 / pl8), `--ai-radius-md`. Base = Default. |
| Rounded=True | `.filter-item--rounded` | `border-radius: var(--ai-radius-full)` |
| Empty | `.filter-item--empty` | `border-style: dashed; border-color: var(--ai-border-contrast)` |
| Selected | `.filter-item--selected` | `background: var(--ai-surface-info-soft); border-color: var(--ai-border-info)` |
| Open (chevron flipped) | `.filter-item--open` | JS-toggled; rotates `.filter-item__chevron` 180° |
| Trigger (Name · values + chevron) | `.filter-item__trigger` | `<button>`, transparent reset, opens the picker |
| Clear (×) | `.filter-item__clear` | `<button>`, selected-only, resets the chip |
| Leading add icon (+) | `.filter-item__add` | Lucide `plus`; hidden when `--selected` |
| Filter name | `.filter-item__name` | `--ai-font-medium`, `--ai-font-fixed-xxs` |
| Separator | `.filter-item__sep` | `·` — `--ai-font-fixed-sm` / `--ai-font-regular` / `--ai-icon-contrast` |
| Selected values | `.filter-item__values` | `--ai-font-semibold`, `--ai-font-fixed-xxs`; text set by JS rollup |
| Chevron | `.filter-item__chevron` | Lucide `chevron-down`, 12px |

## Token Mapping

| Figma variable | CSS variable | Role |
|---|---|---|
| `surface/primary` | `--ai-surface-primary` | Default / Empty bg |
| `surface/info-soft` | `--ai-surface-info-soft` | Selected bg (#f0f3ff) |
| `border/secondary` | `--ai-border-secondary` | Default border (#e2e2e3) |
| `border/contrast` | `--ai-border-contrast` | Empty dashed border (#c2c2c4) |
| `border/info` | `--ai-border-info` | Selected border (#bfd1ff) |
| `text/primary` | `--ai-text-primary` | Name + values text |
| `icon/contrast` | `--ai-icon-contrast` | All icons (+, ×, chevron) + separator (#929295) |
| `icon-size/xs` (12px) | `--ai-icon-size-xs` | Plus / × / chevron size |
| `font/title` | `--ai-font-title` | All text (Inter) |
| `font/medium` | `--ai-font-medium` | Filter name weight |
| `font/semibold` | `--ai-font-semibold` | Selected values weight |
| `font/regular` | `--ai-font-regular` | Separator weight |
| `font/fixed-xxs` (12px) | `--ai-font-fixed-xxs` | Name + values size |
| `font/fixed-sm` (16px) | `--ai-font-fixed-sm` | Separator glyph size |
| `leading/xs` (16px) | `--ai-leading-xs` | Name + values line-height |
| `leading/md` (24px) | `--ai-leading-md` | Separator line-height |
| `spacing/1` (4px) | `--ai-spacing-1` | Inter-element gap |
| `spacing/2` (6px) | `--ai-spacing-2` | Vertical padding |
| `spacing/3` (8px) | `--ai-spacing-3` | Left padding |
| `spacing/4` (12px) | `--ai-spacing-4` | Right padding |
| `spacing/7` (32px) | `--ai-spacing-7` | Chip height |
| `radius/md` (8px) | `--ai-radius-md` | Rounded=False corner |
| `radius/full` | `--ai-radius-full` | Rounded=True corner |

## Token Gaps

None. Every design value resolves to an `--ai-*` token (verified via `get_variable_defs`):
the 12px icons map to `--ai-icon-size-xs`, and `--ai-surface-info-soft` / `--ai-border-info` /
`--ai-border-contrast` all exist in `css/tokens.css`.

The only raw px value is `letter-spacing: -0.3125px` on the separator `·` — an allowed optical
typographic exception (matches Figma `tracking-[-0.3125px]`).

## Notes

- **The × is a -45°-rotated Plus in Figma** (same 12px glyph, rotated so a 12px square's bounding
  box becomes ~16.97px). Implemented with the dedicated Lucide `x` icon rather than a rotated
  plus — visually equivalent, no hardcoded `16.971px` box needed.
- **Icon naming mismatch:** Figma icons are named `Icon/24px/Plus`, `Icon/24px/ChevronDown` but
  are *placed* at 12px. Design context reports the base 24px name; the placed `size-[12px]` is the
  real size → `--ai-icon-size-xs`. Lucide names: `plus`, `x`, `chevron-down`.
- **No Figma hover/focus state.** The component set defines only the 12 static variants. A
  `:focus-visible` outline (`--ai-surface-brand`) is added for WCAG 2.1 AA; no hover colour is
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
