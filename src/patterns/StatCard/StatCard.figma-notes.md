# StatCard — Figma Notes

**Figma file:** [`Lus07xi8pPXLN87sQIyrEt`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System) (Affino AI Design System)
**Tier:** Pattern
**Parent frame:** `2758:3020`
**Files:** `StatCard.css`, `StatCard.html`, `StatCard.figma-notes.md`, `StatCard.figma.ts`

---

## Variant matrix

52 Figma variants: 3 Sizes (Sm added 2026-09-28) × 5 Types with `Fill=Blue`, plus all 38 Fill values (19 accents ×
solid/soft) on **Base / Default**. Other Size × Type combos exist in Blue only in Figma; code
supports every Fill on every Size × Type.

| Node | Size | Type | Notes |
|---|---|---|---|
| `2758:3019` | Base | Default | h-64, icon-wrap 40, icon 16 |
| `2758:3029` | Base | Chevron Down | + chevron-down 16 on right |
| `2758:3039` | Base | Chevron Right | + chevron-right 16 on right |
| `2758:3049` | Base | No card | no border/shadow/padding, h-40 |
| `2758:3057` | Base | Number First | value above title |
| `3900:1754` | Sm | Default | h-56 (min spacing-10), gap + padding spacing-3, title 2xs (13px) |
| `3900:1762` | Sm | Chevron Down | Sm + chevron |
| `3900:1772` | Sm | Chevron Right | Sm + chevron |
| `3900:1782` | Sm | No card | Sm + no card (h-40, padding 0) |
| `3900:1790` | Sm | Number First | Sm + swapped order |
| `2758:3076` | Lg | Default | h-80, icon-wrap 48, icon 20 |
| `2758:3082` | Lg | Chevron Down | Lg + chevron |
| `2758:3089` | Lg | Chevron Right | Lg + chevron |
| `2758:3096` | Lg | No card | Lg + no card (h-48) |
| `2758:3102` | Lg | Number First | Lg + swapped order |
| `3821:130490…` + `3850:185…465` | Base | Default, Fill=`<Colour>` / `<Colour> Soft` | 37 variants — Fill value = colour name (e.g. `Teal Radix Soft`) → `stat-card--teal-radix stat-card--soft` |

All 10 `Fill=Blue` variants = `stat-card--blue` (the default — no modifier needed).

### Fill axis (code)

| Modifier | Square | Icon |
|---|---|---|
| `stat-card--<colour>` | `--ao-accent-<colour>-solid` | `--ao-accent-<colour>-solid-fg` |
| `+ stat-card--soft` | `--ao-accent-<colour>-soft` | `--ao-accent-<colour>-soft-fg` |

Colours (19): `blue` (default), `mid-blue`, `dark-blue`, `emerald`,
`orange`, `pink`, `red`, `green`, `purple`, `indigo`, `blue-radix`, `teal-radix`, `green-radix`,
`jade`, `lagoon`, `orange-radix`, `red-radix`, `violet-radix`, `lime-radix`.

Each colour modifier only re-points four component props (`--stat-card-solid`, `-solid-fg`,
`-soft`, `-soft-fg`); `.stat-card__icon-wrap` reads solid, `.stat-card--soft` switches it to soft.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Root frame | `.stat-card` (`<div>`) |
| Sm size | `.stat-card--sm` |
| Lg size | `.stat-card--lg` |
| Type=No card | `.stat-card--no-card` |
| Type=Number First | `.stat-card--number-first` (uses `order` to swap) |
| `Fill=<colour>` | `.stat-card--<colour>` |
| `Fill=<colour> Soft` | `.stat-card--<colour>.stat-card--soft` |
| Brand icon square | `.stat-card__icon-wrap` |
| Lucide icon (inside square) | `<i data-lucide="..." aria-hidden="true">` |
| Text column | `.stat-card__text` |
| Title (label) | `.stat-card__title` (`<p>`) |
| Number (value) | `.stat-card__value` (`<p>`) |
| Chevron icon (right) | `.stat-card__chevron` + Lucide |

For Chevron Down/Right variants, add `<div class="stat-card__chevron">` as a sibling after `.stat-card__text`.

---

## Token mapping

| Property | Token | Notes |
|---|---|---|
| Card bg | `var(--ao-surface-primary)` | white (transparent on `--no-card`) |
| Card border | `1px solid var(--ao-border-secondary)` | (none on `--no-card`) |
| Card shadow | `var(--ao-shadow-md)` | maps to Figma `light/shadow-md`; removed on `--no-card` |
| Card radius | `var(--ao-radius-md)` | 8px (Figma bound `--ao-spacing-3` — designer-approved swap) |
| Card gap (Base) | `var(--ao-spacing-4)` | 12px |
| Card gap / padding (Sm) | `var(--ao-spacing-3)` | 8px |
| Card min-height (Sm + card) | `var(--ao-spacing-10)` | 56px |
| Title font-size (Sm) | `var(--ao-font-fixed-2xs)` | 13px |
| Card gap (Lg) | `var(--ao-spacing-5)` | 16px |
| Card padding (Base) | `var(--ao-spacing-4)` | 12px |
| Card padding (Lg) | `var(--ao-spacing-5)` | 16px |
| Card min-height (Base + card) | `var(--ao-spacing-11)` | 64px |
| Card min-height (Lg + card) | `var(--ao-spacing-13)` | 80px |
| Card min-height (Base + no-card) | `var(--ao-spacing-8)` | 40px |
| Card min-height (Lg + no-card) | `var(--ao-spacing-9)` | 48px |
| Icon-wrap bg (solid) | `var(--ao-accent-<colour>-solid)` | via `--stat-card-solid`; default `--ao-accent-blue-solid` |
| Icon colour (solid) | `var(--ao-accent-<colour>-solid-fg)` | white, or Grey/850 on light squares |
| Icon-wrap bg (soft) | `var(--ao-accent-<colour>-soft)` | via `--stat-card-soft` |
| Icon colour (soft) | `var(--ao-accent-<colour>-soft-fg)` | |
| Icon-wrap size (Base) | `var(--ao-spacing-8)` | 40px |
| Icon-wrap size (Lg) | `var(--ao-spacing-9)` | 48px |
| Icon-wrap radius | `var(--ao-radius-md)` | 8px |
| Inner icon size (Base) | `var(--ao-icon-size-sm)` | 16px |
| Inner icon size (Lg) | `var(--ao-icon-size-md)` | 20px |
| Chevron icon size | `var(--ao-icon-size-sm)` | 16px (same in Base + Lg) |
| Chevron colour | `var(--ao-icon-secondary)` | |
| Text column gap | `var(--ao-spacing-1)` | 4px |
| Title font | `var(--ao-font-body)` + `var(--ao-font-medium)` | Inter Medium |
| Title size | `var(--ao-font-fixed-xs)` | 14px |
| Title colour | `var(--ao-text-contrast)` | |
| Value font | `var(--ao-font-title)` + `var(--ao-font-bold)` | Inter Bold |
| Value size | `var(--ao-font-fixed-sm)` | 16px |
| Value colour | `var(--ao-text-primary)` | |

---

## Token gaps

| # | Property | Figma | Resolution |
|---|---|---|---|
| 1 | Icon-wrap bg | ~~`Blue/600` primitive `#2563eb`~~ | **RESOLVED 2026-09-28** — `accent/*` semantic set added to Figma (84 vars); Figma variants rebound; CSS uses `--ao-accent-*`. |
| 2 | Card radius binding | Figma binds `--ao-spacing-3` (8px) | User-approved: use `--ao-radius-md` instead (same value, correct semantic). |
| 3 | Card width | Figma frame width 339px (no token) | User-approved: width is consumer-controlled — `width: 100%`. |
| 4 | No card bg | Figma keeps `--ao-surface-primary` (white) | User-approved: render as `background: transparent` so the "no card" variant has no chrome whatsoever (literally just icon + text on the parent bg). |

---

## Dependencies

None — self-contained. Uses Lucide icons (`mail` default + `chevron-down` / `chevron-right` for the chevron variants) but does not depend on any other code-side component.

---

## Notes

- Width is intentionally **100% of parent** — Figma frame uses 339px but the production component is layout-agnostic.
- **Number First** swaps title and value order via CSS `order` (no HTML restructuring needed) — markup stays consistent across all variants.
- **No card** transparent background diverges from Figma (which keeps the white surface-primary) so the variant works on any parent surface. User-approved.
- Chevron variants are **static decorations** — no JS, no expand/collapse, no click handler. Consumer wraps the card in `<a>` or `<button>` if interaction is needed.
- **Accent tokens** (`accent/<colour>/{solid,solid-fg,soft,soft-fg}`, Semantic collection) alias
  primitives: Radix ramps use steps 9 / 3 / 11 (dark soft 12 / 9); the 100–900 ramps use 600 / 100 /
  700 (dark soft 900 / 400). Contrast-driven exceptions: dark (Grey/850) icon on solid Orange Radix,
  Lime Radix, Bright Teal, Green; soft icon 800 on Bright Teal, Green; dark soft square 13 on Orange
  Radix; dark soft icon 8 on Violet Radix. All 42 fills ≥ 3:1 in all 6 modes (verified headless).
- Solid squares keep the light value in dark mode; soft squares move to a dark step.
- The Figma soft variants originally bound the external "Radix Full" collection (`purple`,
  `crimson`, `grass` have no ramp of ours) — rebound to `purple` / `pink` / `green-radix`, and every
  soft icon moved from step 9 (2.6–2.9:1, failing) to step 11. Fill values renamed to match the
  code slugs: Blue Soft → Blue Radix Soft, Aqua Soft → Teal Radix Soft, Green Soft → Green Radix Soft.
- Soft squares on the palest ramps moved up for legibility on a white card: `mid-blue`,
  `dark-blue` → 200; `green` → 300.
- **Muted Teal and Bright Teal removed** (2026-09-28) from StatCard in Figma and code — use `lagoon`
  / `teal-radix`. Their `--ao-accent-*` tokens still exist (Lagoon-sourced) but nothing uses them.
- Solid Blue changed colour: stale `#2563eb` → current `Blue/600` `#0071d8`.

---

## History

- 2026-09-28: Fill axis — 21 accent colours × solid/soft via new `--ao-accent-*` tokens; all 42 fills added to Figma on Base/Default (51 variants); icon-wrap primitive gap resolved; Figma variants rebound to `accent/*`.
- 2026-05-28: Initial build from Figma frame `2758:3020`. All 10 variants implemented. 4 STOPs resolved (icon-wrap bg primitive, radius rebind, consumer-controlled width, transparent no-card bg).


## Sm size (designer, 2026-09-28)
From the designer's live amends on Article Edit: gap + padding `--ao-spacing-3`, min-height `--ao-spacing-10`, title `--ao-font-fixed-2xs`. Icon block (32 / 16px icon), value and radius unchanged from Base. Built in Figma as 5 Blue variants like Lg; first consumer = the record screens' PerformanceSummary.

## Size=Xl — code-first (2026-10-02)

Added at the designer's request for the Orders totals panel (ListingScreen). The designer chose
the compact "v2" layout. **Built in Figma 2026-10-02:** `Size=Xl, Type=Default` × Fill Lagoon `3976:1810` / Jade `3976:1830` / Violet Radix `3976:1850`,
every value bound to its variable. New set booleans **Meta** (`Meta#3976:0`) and **Breakdown** (`Breakdown#3976:53`) toggle the
optional parts; Title, Number and Icon reuse the set's properties. The set now hugs its width (500px). Code Connect has a
separate `variant: { Size: 'Xl' }` mapping (published). Values:

| Part | Class | Desktop | Narrow (`cs-page` ≤ 767px) |
|---|---|---|---|
| Card | `stat-card--xl` | grid `head head / value breakdown`, gap `spacing-4` × `spacing-6`, padding `spacing-5` | single column, gap `spacing-3`, padding `spacing-4` |
| Head | `stat-card__head` | gap `spacing-4` | gap `spacing-3` |
| Text column | `__text` | gap `0` (title + meta tight) | — |
| Icon block | `__icon-wrap` | `spacing-9` square, icon `icon-size-lg` | `spacing-8`, icon `icon-size-md` |
| Title | `__title` | `font-fixed-sm` semibold, `leading-md`, `text-primary` | `font-fixed-xs`, `leading-sm` |
| Meta | `stat-card__meta` | `font-fixed-2xs`, `leading-sm`, `text-contrast` | — |
| Value | `__value` | `font-fixed-xl` bold (title font), `leading-lg`, tabular nums, gap `spacing-2` to unit | `font-fixed-lg`, `leading-md` |
| Unit | `stat-card__unit` | `font-fixed-xs` medium, `text-contrast` | — |
| Breakdown | `stat-card__breakdown` (`<dl>`) | beside value: left rule `border-secondary`, padding-left `spacing-6`, gap `spacing-3` × `spacing-6` | under value: top rule, padding-top `spacing-3`, gap `spacing-3` × `spacing-5` |
| Breakdown label | `__breakdown-label` (`<dt>`) | `font-fixed-xxs` semibold uppercase, 0.5px tracking, `text-contrast` | — |
| Breakdown value | `__breakdown-value` (`<dd>`) | `font-fixed-sm` semibold, `leading-md`, tabular nums | `font-fixed-xs` |

Breakdown and meta are optional. Money icons use `*-pound-sterling` Lucide variants (GBP is primary).
The narrow rules key on `cs-page`, so the demo's body establishes that container.

## Border (2026-10-02)

The default edge stays `--ao-border-secondary`, matching Figma: StatCard is usually a card inside a panel. **Border rule (designer, 2026-10-02):** top-level panels use `border/card`, and cards INSIDE a panel keep the more prominent `border/secondary`.
Where a StatCard IS a top-level card (the Orders totals tiles), the screen sets `--ao-border-card`
(ListingScreen.css).
