# RangeSlider — Figma Notes

**Figma URL:** [node 2527:1876](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-1876)

## Component Set

RangeSlider is a Tier=Component design-system component for selecting a numeric value (or range) on a horizontal track. Five variant types and three sizes; built around a native `<input type="range">` plus a real DOM thumb element overlaid for Figma fidelity.

## Variant × Size Matrix

| Node | Type | Size | Notes |
|---|---|---|---|
| `2527:1875` | Counter | Default | Label + value display + slider — value text in brand colour |
| `2527:1869` | Default | Default | Label + slider, 8px track, 16px thumb |
| `2527:1874` | Default | sm | 4px track, 12px thumb |
| `2527:1872` | Default | lg | 12px track, 24px thumb, 3px white thumb border |
| `2527:1870` | Disabled | Default | Greyed out — value text muted, thumb uses `--ai-btn-bg-disabled` |
| `2527:1871` | Steps | Default | Tick marks under track at integer positions |
| `2527:1873` | Labels | Default | Min/Max anchors + interval milestones under track |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Type=Counter | `.rs` (with `.rs__head` containing `.rs__value`) |
| Type=Default | `.rs` (no value display) |
| Type=Disabled | `.rs.rs--disabled` |
| Type=Steps | `.rs` + `.rs__steps` block underneath |
| Type=Labels | `.rs` + `.rs__labels` block underneath |
| Size=Default | `.rs` (base) |
| Size=sm | `.rs.rs--sm` |
| Size=lg | `.rs.rs--lg` |
| Slider wrap | `.rs__wrap` (positions visible thumb) |
| Native input | `.rs__input` (track painted via JS gradient on bg) |
| Visible thumb | `.rs__thumb` (real DOM element, JS-positioned) |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Track height (Default) | `--ai-spacing-3` | 8px |
| Track height (sm) | `--ai-spacing-1` | 4px |
| Track height (lg) | `--ai-spacing-4` | 12px |
| Track unfilled bg | `--ai-surface-minimal` | #f6f6f7 |
| Track fill | `--ai-surface-brand` | #0071d8 |
| Track radius | `--ai-radius-full` | rounded |
| Thumb size (Default) | `--ai-icon-size-sm` | 16px |
| Thumb size (sm) | `--ai-spacing-4` | 12px |
| Thumb size (lg) | `--ai-icon-size-lg` | 24px |
| Thumb bg | `--ai-surface-brand` | #0071d8 |
| Thumb border | `--ai-surface-primary` | white, 2px (3px on lg) |
| Thumb shadow | `0 1px 3px rgba(0,0,0,0.1)` | static (raw — optical) |
| Thumb hover/focus halo | `--ai-surface-brand-contrast` | 4px ring |
| Thumb (disabled) | `--ai-btn-bg-disabled` | grey |
| Label font | `--ai-font-title` semibold + `--ai-font-fixed-xs` | Inter 600 / 14px |
| Value font | `--ai-font-title` semibold + `--ai-font-fixed-sm` | Inter 600 / 16px |
| Value color | `--ai-surface-brand` | #0071d8 |
| Disabled value color | `--ai-text-contrast` | #67676c |
| Step/label text | `--ai-font-title` + `--ai-font-fixed-xxs` | Inter / 12px |
| Step/label color | `--ai-text-contrast` | #67676c |
| Tick mark | `--ai-border-secondary` | 1px |
| Field stack gap | `--ai-spacing-3` | 8px |

## Token Gaps

- **`--ai-text-error` Figma misbinding** — Figma reports `--ai-text-error: #0071d8` (brand blue) but the generated CSS has `#ef4444` (red). Counter variant's value text appears in brand blue in Figma, which is what we want visually. Used `--ai-surface-brand` instead of `--ai-text-error` since it both matches the visible color and uses a semantically appropriate token. Worth fixing the Figma binding to match `#ef4444` in a token sync.
- The thumb shadow `0 1px 3px rgba(0,0,0,0.1)` is a static optical value — not a token gap per CLAUDE rules.
- Border widths (`2px` on Default thumb, `3px` on lg thumb) and `1px` tick marks are optical units and stay as raw px.

## Icons

None. The slider uses no icons — track + thumb only.

## Dependencies

None — RangeSlider is self-contained. Native `<input type="range">` provides the interaction; JS positions the visible thumb element and paints the brand-fill gradient on the track.

## Notes

- The **invisible-native-thumb + DOM-thumb** pattern: the browser's `::-webkit-slider-thumb` pseudo-element doesn't survive Figma's html-to-design capture (it's rendered by the engine, not part of the DOM). To keep the thumb visible after capture, the native thumb is set to `background: transparent` (still draggable via the native input) and a real `.rs__thumb` `<span>` is positioned via JS based on the input's value. Hover/focus halo on the wrap propagates to the visible thumb.
- WebKit browsers don't support `::-moz-range-progress` for filling the track left of the thumb. The track fill is painted as a `linear-gradient` on the input's `background` via JS — calculated from the current value as a percentage. Firefox uses `::-moz-range-progress` natively as a backup, so the gradient style is also valid there.
- Token `--ai-text-error` appears bound to brand blue in Figma's variable defs but resolves to red in the generated CSS — flagged as a misbinding in the figma file.
- Type=Disabled additionally applies `opacity: 0.5` to the input and `0.7` to the thumb, plus `cursor: not-allowed` and a muted value color.
