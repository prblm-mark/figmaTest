# Chart — Figma Notes

**Figma URL:** [node 2527:2215](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-2215)

## Component Set

Chart is a Tier=Pattern component (in `src/patterns/Chart/`) because it composes an external charting library (Chart.js) for the visualisation. The card chrome — header (big metric + sub label + optional delta pill), canvas, footer (filter + report link) — is built in our own tokens; only the chart area is rendered via Chart.js with brand colours pulled from `--ao-*` tokens at runtime.

## Variant Matrix

| Node | Type | Notes |
|---|---|---|
| `2527:2214` | Multiple Lines | Two-series line chart, with delta pill in header |
| `2527:2212` | Single Line | Area chart (line + gradient fill), with delta pill |
| `2527:2211` | Bar Chart | Two-series vertical bars, no delta pill, legend at bottom |
| `2527:2213` | Doughnut | Four segments, no delta pill, legend at bottom |

## CSS Class Mapping

| Figma element | CSS class |
|---|---|
| Card | `.chart` |
| Header | `.chart__head` |
| Title block (big + sub) | `.chart__title` + `.chart__big` + `.chart__sub` |
| Delta pill | `.chart__delta` (only on Multiple Lines / Single Line) |
| Chart area | `.chart__canvas` (contains `<canvas>` element) |
| Footer | `.chart__foot` |
| Filter button | `.chart__filter` |
| Report link | `.chart__report-link` |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Card bg | `--ao-surface-primary` | #ffffff |
| Card border | `--ao-border-secondary` | #e2e2e3 |
| Card radius | `--ao-radius-md` | 8px |
| Card padding | `--ao-spacing-6` | 24px |
| Card stack gap | `--ao-spacing-5` | 16px |
| Big metric font | `--ao-font-title` bold + `--ao-font-fixed-lg` | Inter 700 / 20px (Figma binding) |
| Big metric line-height | `--ao-leading-sm` | 20px |
| Big metric color | `--ao-text-primary` | #212123 |
| Sub label font | `--ao-font-title` regular + `--ao-font-fixed-xs` | Inter 400 / 14px |
| Sub label line-height | `--ao-leading-md` | 24px |
| Sub label color | `--ao-text-contrast` | #67676c |
| Title gap | `--ao-spacing-1` | 4px |
| Delta pill bg | `--ao-surface-success` | #30cb90 |
| Delta pill text | `--ao-text-invert` | #ffffff |
| Delta pill font | `--ao-font-title` semibold + `--ao-font-fixed-xxs` | Inter 600 / 12px |
| Delta pill padding | `--ao-spacing-1` v / `--ao-spacing-3` h | 4/8px |
| Delta pill gap | `--ao-spacing-1` | 4px |
| Delta pill radius | `--ao-radius-full` | rounded |
| Footer border-top | `--ao-border-secondary` | 1px |
| Footer padding-top | `--ao-spacing-5` | 16px |
| Filter font | `--ao-font-title` medium + `--ao-font-fixed-xs` | Inter 500 / 14px |
| Filter color | `--ao-text-contrast` | #67676c |
| Filter hover bg | `--ao-surface-minimal` | #f6f6f7 |
| Filter hover text | `--ao-text-primary` | #212123 |
| Filter padding | `--ao-spacing-2` v / `--ao-spacing-0` h | 6/0px |
| Filter gap | `--ao-spacing-2` | 6px |
| Filter radius | `--ao-radius-md` | 8px |
| Report link font | `--ao-font-title` semibold + `--ao-font-fixed-xs` | Inter 600 / 14px |
| Report link color | `--ao-text-brand` | #0071d8 |
| Report link gap | `--ao-spacing-2` | 6px |
| Icon size | `--ao-icon-size-sm` | 16px |
| Chart line color | `--ao-surface-brand` | #0071d8 |
| Chart secondary line | `--ao-surface-success` | #30cb90 |
| Chart bar 3rd colour | `#75A5FF` | (Blue/FB/400 primitive — explicitly approved) |
| Chart bar 4th colour | `--ao-surface-brand-soft` | #bfd1ff |
| Chart grid lines | `--ao-border-secondary` | #e2e2e3 |
| Chart axis text | `--ao-text-contrast` | #67676c |
| Chart tooltip bg | `--ao-text-primary` | #212123 (dark tooltip) |

## Token Gaps

- **`#75A5FF` (Blue/FB/400)** — used as the third colour in the doughnut palette. No semantic token exists for "third brand-family colour". Approved as a primitive use; if more chart colours are needed across components, consider adding `--ao-chart-color-1/2/3/4` semantic tokens.

## Icons

| Element | Lucide name |
|---|---|
| Delta indicator | `trending-up` |
| Filter chevron | `chevron-down` |
| Report link arrow | `arrow-right` |

## Dependencies

- **Chart.js v4.4.0** via CDN (`cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`). The only external JS library used in any component or pattern. Chart colours are pulled from CSS custom properties at runtime via `getComputedStyle`, so the chart updates automatically when tokens change or dark-mode is toggled.
- **Lucide** for header / footer icons (already used throughout the design system).

No internal component dependencies — Chart's chrome (card, header, footer) is self-contained.

## Notes

- This is the only component/pattern in the system that uses an external charting library. The decision is documented in CLAUDE.md / component-registry to avoid surprise next session.
- Each variant uses Chart.js with brand-token colours set globally via `Chart.defaults`, then overridden per-chart for series colours. This means swapping the brand colour (`--ao-surface-brand`) automatically reflects in every chart on the page.
- The "Single Line" variant uses a `linear-gradient` painted on each draw frame (Chart.js plugin pattern) to render the area fill below the line — fades from `brand + alpha 0xaa` at the top to `brand + alpha 0x00` at the bottom.
- Doughnut uses `cutout: '65%'` to match the Figma ring width.
- Only Multiple Lines and Single Line have the green delta pill in the header. Bar Chart and Doughnut do not — pill markup omitted in those variants.
- Chart canvas uses `flex: 1; min-height: 12rem` so all four cards in a 2×2 grid stretch to equal heights (the bar/doughnut cards would otherwise be shorter than the line cards which include the delta pill).
- All variants of the card chrome use the same CSS — type differs only in chart content + presence/absence of the delta pill.
