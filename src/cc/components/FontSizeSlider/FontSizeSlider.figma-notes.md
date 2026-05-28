# FontSizeSlider — Figma Notes

**Figma file:** [`ETKqleZdpertwFEo40YB5n`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System) (CC Hybrid Design System)
**Tier:** Component
**Files:** `FontSizeSlider.css`, `FontSizeSlider.html`, `FontSizeSlider.js`, `FontSizeSlider.figma-notes.md`, `FontSizeSlider.figma.ts`

---

## Variant matrix

Two sibling Figma symbols (not a true variant set). Theme is handled by
the existing `[data-theme="dark"]` cascade on top of `[data-brand="cc"]`,
so a single CSS implementation covers both.

| Node | Theme | Notes |
|---|---|---|
| `4146:6685` | CC Light | Wrapper bg `#d0dbe1`, brand `#3391a4` (Muted Teal), unfilled track `#e7edf0` |
| `4146:6687` | CC Dark | Wrapper bg `#334155`, brand `#33bfcb` (Bright Teal), unfilled track `#1e293b` |

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Wrapper (`FontSizeSlider`) | `.font-size-slider` (`<div>`) |
| Inner native input + track | `.font-size-slider__input` (`<input type="range">`) |
| Filled track portion | painted via JS gradient on `.font-size-slider__input` `background-image` |
| Thumb | native `::-webkit-slider-thumb` / `::-moz-range-thumb` (styled in CSS) |

---

## Token mapping

| Property | Token | Notes |
|---|---|---|
| Wrapper bg | `--cc-actions-menu-primary-bg` | `#d0dbe1` light / `#334155` dark |
| Wrapper padding (horizontal) | `var(--ai-spacing-4)` | 12px |
| Wrapper height | `var(--ai-spacing-8)` | 40px |
| Wrapper radius | `var(--ai-radius-md)` | 8px (Figma bound `--ai-spacing-3` — same value, but semantically `--ai-radius-md` is the correct token) |
| Inner input width | `var(--ai-size-1)` | 128px |
| Track height | `var(--ai-spacing-3)` | 8px (no Figma binding — derived) |
| Track radius | `var(--ai-radius-full)` | rounded |
| Track unfilled bg | `var(--cc-actions-menu-secondary-bg)` | `#e7edf0` light / `#1e293b` dark |
| Track filled bg (gradient) | `var(--ai-surface-brand)` | `#3391a4` / `#33bfcb` |
| Thumb size | `var(--ai-icon-size-sm)` | 16px (no Figma binding — derived) |
| Thumb bg | `var(--ai-surface-brand)` | matches filled portion |
| Thumb border | `2px solid var(--cc-actions-menu-secondary-bg)` | matches wrapper's secondary token |
| Thumb shadow | `0 1px 3px rgba(0, 0, 0, 0.1)` | static optical value |
| Thumb focus halo | `0 0 0 4px var(--ai-surface-brand-soft)` | brand-tinted ring (4px) |

---

## Values + behaviour

- **Input:** `<input type="range" min="1" max="4" step="1" value="2">`
- **Mapping:** 1 = S, 2 = M (default), 3 = L, 4 = XL
- **Snap:** the integer `step="1"` makes the thumb snap to four discrete
  positions (0%, 33.3%, 66.7%, 100%).
- **No tick marks / labels** — the visual matches the Figma design exactly.
- **No font-scale binding yet** — the slider currently emits `input` /
  `change` events only. Wire up to `--cc-font-scale` (or similar) when
  the CC font-scale system lands.

---

## Token gaps

| # | Property | Figma | Resolution |
|---|---|---|---|
| 1 | Unfilled track colour | Light raw `#f6f6f7`, Dark raw `#1e293b` (no variable binding) | Approved: use `--cc-actions-menu-secondary-bg` for both. Visually matches the dark Figma exactly; light will paint as `#e7edf0` (CC light value of the token) rather than the raw `#f6f6f7` in Figma. Designer to confirm Figma binding. |
| 2 | Wrapper radius | Bound to `--ai-spacing-3` (same value 8px) | Use semantic `--ai-radius-md` (also 8px). Approved. |
| 3 | Track height (8px) | No binding | Use `--ai-spacing-3`. Approved. |
| 4 | Thumb size (16px) | No binding | Use `--ai-icon-size-sm`. Approved. |

---

## Notes

- **Build is standalone, not a wrapper around `src/components/RangeSlider/`** —
  the markup is small enough (input + styled thumb) that a dedicated
  implementation is cleaner than overriding most of `.rs`. The existing
  `.rs` also carries the invisible-native-thumb + DOM-thumb overlay
  pattern, which is a Figma-capture workaround and not needed in
  production (already flagged in the project's `feedback_no_prototype_after_component.md`).
- **Thumb is the real native `::-webkit-slider-thumb` / `::-moz-range-thumb`** —
  no DOM overlay element required. All visual treatments (size, fill, border,
  shadow, focus halo) are achievable directly on the pseudo-element.
- **Track fill** uses the standard cross-browser pattern: Webkit gets a
  `background-image: linear-gradient(...)` painted by JS based on value;
  Firefox uses its native `::-moz-range-progress` (styled in CSS) so the
  JS gradient is harmless there.
- The wrapper is `display: inline-flex` — width is intrinsic from
  `--ai-size-1` (128px input) + `--ai-spacing-4` × 2 (24px padding) = 152px,
  matching the Figma frame exactly.

---

## History

- 2026-05-28: Initial build from Figma `4146:6685` (light) + `4146:6687`
  (dark). Standalone implementation (option B over reusing `.rs`).
  Designer-approved token swaps for the four token gaps documented above.
