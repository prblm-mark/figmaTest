# TableType — Figma Notes

**Tier:** Component
**Built:** 2026-08-25 (Seating Planner module, wave 1)
**Files:** `TableType.css`, `TableType.html`, `TableType.figma-notes.md`

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Page:** Seat Planner (`3087:5050`)
- **Component set:** `3470:85494`

## Variant matrix (5 variants)

Axes are **Type × Tier**. Tier has a single value (`Component`), so it produces no CSS.

| Type | Tier | Node | CSS | Figma width |
|---|---|---|---|---|
| VIP | Component | `3470:85488` | `.table-type.table-type--vip` | 35px |
| Head Table | Component | `3470:85489` | `.table-type.table-type--head-table` | 82px |
| Gold | Component | `3470:85485` | `.table-type.table-type--gold` | 47px |
| Silver | Component | `3470:85492` | `.table-type.table-type--silver` | 53px |
| Bronze | Component | `3470:85484` | `.table-type.table-type--bronze` | 60px |

All five are 18px tall; widths are content-driven, which the CSS reproduces with
`display: inline-flex` + `white-space: nowrap` rather than fixed widths. Verified: the built
component renders 18px tall for every variant.

VIP is Figma's default variant, so `.table-type` with no modifier resolves to the VIP colour.

## Colour model

The tier colour is **picked by the user from a colour picker in the product**, so it is a runtime
value, not a design token (confirmed by the designer 2026-08-24). One custom property drives all
three paints, per the designer's rule:

| Paint | Rule | CSS |
|---|---|---|
| background | 80% white over the tier colour | `color-mix(in srgb, #ffffff 80%, var(--table-type-color))` |
| border | 70% white over the tier colour | `color-mix(in srgb, #ffffff 70%, var(--table-type-color))` |
| text | 25% black over the tier colour | `color-mix(in srgb, #000000 25%, var(--table-type-color))` |

Figma expresses the background as two stacked linear-gradients — `rgba(255,255,255,0.8)` over a
solid tier colour — which composites to the same result as the 80% mix.

Setting `--table-type-color` on an instance recolours the whole pill. The five modifiers are
presets only.

### Verification against Figma

12 of 15 computed values are **exact**. The rest:

| Tier | Part | Built | Figma | Δ |
|---|---|---|---|---|
| VIP | border | `#B3D5E2` | `#B2D5E2` | 1 — sub-pixel rounding |
| Bronze | border | `#E2D6CB` | `#E3D6CB` | 1 — sub-pixel rounding |
| **Silver** | **text** | **`#80858A`** | **`#8B8D98`** | **14 — real deviation** |

Silver's text is the one place Figma departs from the formula: it uses `#8B8D98`
(= `--sp-table-silver` / Slate/9) rather than the derived `#80858A`. The designer chose to keep the
pure formula rather than special-case it, so the built component renders `#80858A`. Both are
mid-greys and the difference is barely perceptible, but it is a known divergence — either fix
Figma's Silver text to the derived value, or reinstate an override here.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-spacing-0-5` | `padding` block | 2px vertical |
| `--ai-spacing-3` | `padding` inline | 8px horizontal |
| `--ai-radius-full` | `border-radius` | fully rounded |
| `--ai-font-title` | `font-family` | Inter |
| `--ai-font-bold` | `font-weight` | 700 — **CSS leads Figma**, see below |
| `--ai-font-fixed-5xs` | `font-size` | 10px |
| `--ai-tracking-7` | `letter-spacing` | 0.05em — **CSS leads Figma**, see below |
| (none) | `border-width: 1px` | allowed raw-px exception |

### Typography: the CSS deliberately leads Figma

Amended 2026-08-25 at the designer's request, ahead of Figma being updated to match:

| Property | Figma still has | CSS now uses |
|---|---|---|
| `font-weight` | `--ai-font-semibold` (600) | **`--ai-font-bold` (700)** |
| `letter-spacing` | `--ai-tracking-5` (0.0125em) | **`--ai-tracking-7` (0.05em)** |

**Do not "correct" these back from a Figma fetch.** A future audit that re-reads
`get_design_context` will see 600 / 0.0125em and flag the CSS as wrong — it is not. Figma is the
side that is behind until the designer pushes the change. Once Figma is updated, delete this
section and the matching comment block in `TableType.css`.

## Token gaps

**All five tier colours are raw hex — user-approved 2026-08-24**, on the grounds that they are
picker-set runtime values rather than design values:

`#00749e` VIP · `#991b1b` Head Table · `#d97706` Gold · `#abb2b8` Silver · `#a07553` Bronze

The compositing bases `#ffffff` and `#000000` are also raw, deliberately. They are **not**
`--ai-surface-primary` / a text token: Figma composites against pure white, and using a
theme-aware token would change the formula in dark mode and break the match.

### Divergence from the `--sp-*` seating palette — worth reconciling in Figma

Three of the five tier colours are exactly the Seating Planner tokens; two are not:

| Tier | Figma base | `--sp-*` equivalent | Match? |
|---|---|---|---|
| VIP | `#00749E` | `--sp-table-vip` `#00749E` | yes |
| Head Table | `#991B1B` | `--sp-table-head` `#991B1B` | yes |
| Bronze | `#A07553` | `--sp-table-bronze` `#A07553` | yes |
| Gold | `#D97706` (Amber/600) | `--sp-table-gold` `#CC4E00` | **no** |
| Silver | `#ABB2B8` | `--sp-table-silver` `#8B8D98` | **no** — and `#8B8D98` appears here as Silver's *text* |

Left as raw hex for all five so the tiers behave identically. If Gold and Silver are repointed
at their `--sp-*` values in Figma, all five could bind tokens uniformly and the presets would
then follow the `data-seating` mode (Muted / Radix Soft / Radix Vivid).

Also note `--sp-table-press` `#5C7C2F` exists in the palette but has **no Type variant** in this
component — six table tiers in the tokens, five in the component.

## Notes

- **Dark mode is undefined.** Figma ships only a light treatment, and the formula composites
  against pure white, so the pill renders identically under `[data-theme="dark"]` — a pale tint
  on a dark surface. Not invented here per the no-fallback rule. Needs a Figma dark variant or an
  explicit decision. The demo page includes an on-tinted-ground row to make the issue visible.
- **Structure simplified to one element.** Figma nests a text node inside a wrapper; the wrapper
  carries padding/border/radius/background and the child carries typography. Nothing requires two
  elements, so the component is a single `<span class="table-type">`.
- **Semantics:** a non-interactive label, so `<span>`. No ARIA needed — the text is the content.
  If it ever becomes a filter control it should become a `<button>` and gain states.
- **No interactive states in Figma** — no hover, focus, selected or disabled variants exist, so
  none are implemented.
- **Figma's inline px fallbacks are off by one** in the design-context output:
  `px-[var(--ai-spacing-3,9px)]` where the token is 8px, and
  `py-[var(--ai-spacing-0-5,3px)]` where the token is 2px. The tokens are authoritative and were
  used; the built height matches Figma's 18px exactly, which confirms the tokens are right and
  the fallbacks are the artefact.
- **Axis-name discrepancy in tooling:** `list_file_components_for_code_connect` reports the axis
  as `Property 1`, but the variant names are `Type=…, Tier=…`. The variant names are
  authoritative — there is no unnamed axis on this component.
- **No `.figma.ts`** yet. Code Connect mapping was deliberately declined during the build (there
  was no code component to map to); it can be added now the component exists.
