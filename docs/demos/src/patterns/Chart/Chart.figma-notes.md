# Chart — Figma Notes

**Figma URL:** [node 2527:2215](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-2215)

## Component Set

Chart is a Tier=Pattern component (in `src/patterns/Chart/`) because it composes an external charting library (Chart.js) for the visualisation. The card chrome — header (big metric + sub label + optional delta pill), canvas, footer (filter + report link) — is built in our own tokens; only the chart area is rendered via Chart.js with brand colours pulled from `--ai-*` tokens at runtime.

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
| Card bg | `--ai-surface-primary` | #ffffff |
| Card border | `--ai-border-secondary` | #e2e2e3 |
| Card radius | `--ai-radius-md` | 8px |
| Card padding | `--ai-spacing-6` | 24px |
| Card stack gap | `--ai-spacing-5` | 16px |
| Big metric font | `--ai-font-title` bold + `--ai-font-fixed-2xl` | Inter 700 / 26px |
| Big metric line-height | `--ai-leading-sm` | 20px |
| Big metric color | `--ai-text-primary` | #212123 |
| Sub label font | `--ai-font-title` regular + `--ai-font-fixed-xs` | Inter 400 / 14px |
| Sub label line-height | `--ai-leading-md` | 24px |
| Sub label color | `--ai-text-contrast` | #67676c |
| Title gap | `--ai-spacing-1` | 4px |
| Delta pill bg | `--ai-surface-success` | #30cb90 |
| Delta pill text | `--ai-text-invert` | #ffffff |
| Delta pill font | `--ai-font-title` semibold + `--ai-font-fixed-xxs` | Inter 600 / 12px |
| Delta pill padding | `--ai-spacing-1` v / `--ai-spacing-3` h | 4/8px |
| Delta pill gap | `--ai-spacing-1` | 4px |
| Delta pill radius | `--ai-radius-full` | rounded |
| Footer border-top | `--ai-border-secondary` | 1px |
| Footer padding-top | `--ai-spacing-5` | 16px |
| Filter font | `--ai-font-title` medium + `--ai-font-fixed-xs` | Inter 500 / 14px |
| Filter color | `--ai-text-contrast` | #67676c |
| Filter hover bg | `--ai-surface-minimal` | #f6f6f7 |
| Filter hover text | `--ai-text-primary` | #212123 |
| Filter padding | `--ai-spacing-2` v / `--ai-spacing-3` h | 6/8px |
| Filter gap | `--ai-spacing-2` | 6px |
| Filter radius | `--ai-radius-md` | 8px |
| Report link font | `--ai-font-title` semibold + `--ai-font-fixed-xs` | Inter 600 / 14px |
| Report link color | `--ai-text-brand` | #0071d8 |
| Report link gap | `--ai-spacing-2` | 6px |
| Icon size | `--ai-icon-size-sm` | 16px |
| Chart line color | `--ai-surface-brand` | #0071d8 |
| Chart secondary line | `--ai-surface-success` | #30cb90 |
| Chart bar 3rd colour | `#75A5FF` | (Blue/FB/400 primitive — explicitly approved) |
| Chart bar 4th colour | `--ai-surface-brand-soft` | #bfd1ff |
| Chart grid lines | `--ai-border-secondary` | #e2e2e3 |
| Chart axis text | `--ai-text-contrast` | #67676c |
| Chart tooltip bg | `--ai-text-primary` | #212123 (dark tooltip) |

## Token Gaps

- **`#75A5FF` (Blue/FB/400)** — used as the third colour in the doughnut palette. No semantic token exists for "third brand-family colour". Approved as a primitive use; if more chart colours are needed across components, consider adding `--ai-chart-color-1/2/3/4` semantic tokens.

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
- Each variant uses Chart.js with brand-token colours set globally via `Chart.defaults`, then overridden per-chart for series colours. This means swapping the brand colour (`--ai-surface-brand`) automatically reflects in every chart on the page.
- The "Single Line" variant uses a `linear-gradient` painted on each draw frame (Chart.js plugin pattern) to render the area fill below the line — fades from `brand + alpha 0xaa` at the top to `brand + alpha 0x00` at the bottom.
- Doughnut uses `cutout: '65%'` to match the Figma ring width.
- Only Multiple Lines and Single Line have the green delta pill in the header. Bar Chart and Doughnut do not — pill markup omitted in those variants.
- Chart canvas uses `flex: 1; min-height: 12rem` so all four cards in a 2×2 grid stretch to equal heights (the bar/doughnut cards would otherwise be shorter than the line cards which include the delta pill).
- All variants of the card chrome use the same CSS — type differs only in chart content + presence/absence of the delta pill.
