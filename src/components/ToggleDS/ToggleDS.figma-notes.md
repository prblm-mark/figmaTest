# ToggleDS — Figma Notes

## Figma Source

- **URL:** https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2025-1080
- **File:** Affino AI — Design System
- **Node:** `2025:1080`

## Variant Matrix

| Size    | State    | Description                           |
| ------- | -------- | ------------------------------------- |
| SM      | Initial  | Small toggle, inactive                |
| SM      | Active   | Small toggle, active (brand bg)       |
| SM      | Disabled | Small toggle, non-interactive         |
| Default | Initial  | Medium toggle, inactive               |
| Default | Active   | Medium toggle, active (brand bg)      |
| Default | Disabled | Medium toggle, non-interactive        |
| LG      | Initial  | Large toggle, inactive                |
| LG      | Active   | Large toggle, active (brand bg)       |
| LG      | Disabled | Large toggle, non-interactive         |

## Size Dimensions

| Size    | Track W | Track H | Knob W | Knob H | Knob Offset |
| ------- | ------- | ------- | ------ | ------ | ----------- |
| SM      | 40px    | 20px    | 16px   | 16px   | 2px / 2.5px |
| Default | 44px    | 24px    | 19px   | 19px   | 2.5px / 2.75px |
| LG      | 56px    | 28px    | 22px   | 22px   | 3px / 3.5px |

## CSS Class Mapping

| Figma Variant      | CSS Class(es)                                    |
| ------------------ | ------------------------------------------------ |
| SM / Initial       | `.toggle-ds`                                     |
| SM / Active        | `.toggle-ds.toggle-ds--active`                   |
| SM / Disabled      | `.toggle-ds.toggle-ds--disabled`                 |
| Default / Initial  | `.toggle-ds.toggle-ds--default`                  |
| Default / Active   | `.toggle-ds.toggle-ds--default.toggle-ds--active` |
| Default / Disabled | `.toggle-ds.toggle-ds--default.toggle-ds--disabled` |
| LG / Initial       | `.toggle-ds.toggle-ds--lg`                       |
| LG / Active        | `.toggle-ds.toggle-ds--lg.toggle-ds--active`     |
| LG / Disabled      | `.toggle-ds.toggle-ds--lg.toggle-ds--disabled`   |

## Token Mapping

| Figma Property       | CSS Token                        |
| -------------------- | -------------------------------- |
| Track bg (inactive)  | `--ai-surface-contrast`          |
| Track bg (active)    | `--ai-surface-brand`             |
| Knob bg              | `--ai-surface-primary`           |
| Track/knob radius    | `--ai-radius-full`               |
| Focus ring inner     | `--ai-surface-primary`           |
| Focus ring outer     | `--ai-surface-brand-contrast`    |
| Label text color     | `--ai-text-primary`              |
| Helper text color    | `--ai-text-contrast`             |
| SM label font size   | `--ai-font-fixed-xs`             |
| SM helper font size  | `--ai-font-fixed-xxs`            |
| Default/LG label     | `--ai-font-fixed-sm`             |
| Default/LG helper    | `--ai-font-fixed-xs`             |
| Wrapper gap          | `--ai-spacing-3`                 |
| Transition           | `--ai-transition-default`        |

## Notes

- This is the **Design System toggle**, distinct from the AI Chat Toggle at `src/components/Toggle/`
- Uses `<button>` element with JavaScript click handler to toggle `.toggle-ds--active` class
- `aria-pressed` attribute is toggled for accessibility
- SM is the base/default size (no modifier class needed)
- Active state slides the knob to the right using `left: calc(100% - knobSize - offset)`
- Disabled state applies `opacity: 0.5` and `cursor: not-allowed`
