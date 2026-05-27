# Toggle — Figma Notes

**Figma:** [`node 2025:1080`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2025-1080)
**Tier:** Component
**Files:** `Toggle.css`, `Toggle.html`, `Toggle.figma.ts`, `Toggle.figma-notes.md`

---

## Variant matrix

Two axes: **Size** × **State** = 12 variants.

| Size | Initial | Active | Disabled | Track w×h | Thumb |
|---|---|---|---|---|---|
| xs | `2025:1081` | `2025:1095` | `2025:1088` | 32×16 | 12 |
| SM (default) | `2702:2223` | `2702:2230` | `2702:2237` | 40×20 | 16 |
| Default | `2025:1102` | `2025:1116` | `2025:1109` | 44×24 | 20 |
| LG | `2025:1123` | `2025:1137` | `2025:1130` | 56×28 | 24 |

SM is the implicit default (no CSS modifier). Other sizes via `.toggle--xs`,
`.toggle--default`, `.toggle--lg`.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Wrapper | `.toggle` (`<button role="switch">`) |
| Size=xs | `.toggle--xs` |
| Size=SM | (no modifier — default) |
| Size=Default | `.toggle--default` |
| Size=LG | `.toggle--lg` |
| State=Initial | (no modifier) |
| State=Active | `.toggle--active` |
| State=Disabled | `.toggle--disabled` (with `aria-disabled`) |
| Toggle track | `.toggle__track` |
| Toggle thumb | `.toggle__knob` |
| Label & Helper wrapper | `.toggle__label` |
| Label text | `.toggle__label-text` |
| Helper text | `.toggle__helper` |

---

## Token mapping

### Wrapper

| Property | Token |
|---|---|
| Gap | `var(--ai-spacing-3)` (8px) |
| Padding (vertical) | `1px` (raw — sub-token optical) |

### Track / thumb (all sizes)

| Property | Token |
|---|---|
| Track bg (Initial / Disabled) | `var(--ai-border-secondary)` |
| Track bg (Active) | `var(--ai-surface-brand)` — was `--ai-chat-brand`; switched on 2026-05-27 per the new Dropdown user-menu Figma spec. StyleSettings contextually overrides back to `--ai-chat-brand`. |
| Track radius | `var(--ai-radius-full)` |
| Thumb bg | `var(--ai-surface-primary)` |
| Thumb radius | `var(--ai-radius-full)` |
| Thumb position (Initial) | `top: 2px; left: 2.5px` (raw — sub-token optical) |
| Thumb position (Active) | `left: calc(100% - thumb-w - 2.5px)` |

### Per-size dimensions

| Size | Track w | Track h | Thumb |
|---|---|---|---|
| xs | `var(--ai-spacing-7)` (32px) | `var(--ai-spacing-5)` (16px) | `var(--ai-spacing-4)` (12px) |
| SM | `var(--ai-spacing-8)` (40px) | `20px` (raw) | `var(--ai-spacing-5)` (16px) |
| Default | `44px` (raw) | `var(--ai-spacing-6)` (24px) | `20px` (raw) |
| LG | `var(--ai-spacing-10)` (56px) | `28px` (raw) | `var(--ai-spacing-6)` (24px) |

### Label / helper

| Property | xs / SM | Default / LG |
|---|---|---|
| Label font-family | `var(--ai-font-title)` | (same) |
| Label font-weight | `var(--ai-font-medium)` | `var(--ai-font-regular)` |
| Label font-size | `var(--ai-font-fixed-xs)` (14px) | `var(--ai-font-fixed-sm)` (16px) |
| Label line-height | `1.25` | (same) |
| Label colour | `var(--ai-text-primary)` | (same) |
| Helper font-weight | `var(--ai-font-regular)` | (same) |
| Helper font-size | `var(--ai-font-fixed-xxs)` (12px) | `var(--ai-font-fixed-xs)` (14px) |
| Helper line-height | `1.5` | (same) |
| Helper colour | `var(--ai-text-contrast)` | (same) |
| Disabled label / helper colour | `var(--ai-icon-contrast)` | (same) |

### Focus

| Property | Token |
|---|---|
| Outline | `none` |
| Box-shadow | `0 0 0 1px var(--ai-surface-primary), 0 0 0 3px var(--ai-surface-brand-soft)` (on track) |

---

## Token gaps

| Gap | Where | Resolution |
|---|---|---|
| 20px (SM track height) | SM size | Approved raw — sub-token optical |
| 44px (Default track width) | Default size | Approved raw — sub-token optical |
| 20px (Default thumb) | Default size | Approved raw — sub-token optical |
| 28px (LG track height) | LG size | Approved raw — sub-token optical |
| 2px / 2.5px (thumb offsets) | All sizes | Approved raw — sub-token optical |

These are all visual-detail values that don't fit the `--ai-spacing-*` scale.
Same exception class as letter-spacing and border-widths.

---

## Cross-context notes

- The Toggle Active track colour switched from `--ai-chat-brand` to
  `--ai-surface-brand` on 2026-05-27 to align with the new Figma Dropdown
  User Menu spec. The Chat context (StyleSettings) preserves the original
  chat-brand colour via a contextual override scoped to `.style-settings`.

---

## Accessibility

- The toggle is a `<button role="switch">` with `aria-checked="true|false"`.
- Disabled toggles get `aria-disabled="true"` and the `.toggle--disabled`
  visual treatment (opacity + not-allowed cursor).
- Icon-only toggles need `aria-label`; label-bearing toggles use the
  `.toggle__label-text` as the accessible name (via implicit labelling).

---

## Dependencies

- None directly. Sits on top of base tokens.
- The contextual override lives in `src/patterns/StyleSettings/StyleSettings.css`.

---

## History

- 2026-05-07 (approx): Initial Toggle built — Size=SM only, Active track
  `--ai-chat-brand`.
- 2026-05-27: Figma expanded to 4 sizes (xs, SM, Default, LG) and switched
  Active track to `--ai-surface-brand`. CSS updated to match; StyleSettings
  retains `--ai-chat-brand` via contextual override.
