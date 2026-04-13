# Radio — Figma Notes

## Figma Source

- **URL:** https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2030-1622
- **File:** Affino AI — Design System
- **Node:** `2030:1622`

## Variant Matrix

| Variant  | Description                  |
| -------- | ---------------------------- |
| Initial  | Unchecked, default state     |
| Checked  | Selected radio indicator     |
| Disabled | Non-interactive, 50% opacity |

## CSS Class Mapping

| Figma Variant | CSS Class(es)                        |
| ------------- | ------------------------------------ |
| Initial       | `.radio`                             |
| Checked       | `.radio` + native `checked` attr     |
| Disabled      | `.radio` + native `disabled` attr    |

## Token Mapping

| Figma Property       | CSS Token                        |
| -------------------- | -------------------------------- |
| Indicator bg         | `--ai-surface-minimal`           |
| Indicator border     | `--ai-border-secondary`          |
| Checked indicator bg | `--ai-surface-primary`           |
| Checked border       | `--ai-border-brand`              |
| Checked border width | `--ai-spacing-1` (4px)           |
| Focus ring inner     | `--ai-surface-primary`           |
| Focus ring outer     | `--ai-surface-brand-contrast`    |
| Label text color     | `--ai-text-primary`              |
| Helper text color    | `--ai-text-contrast`             |
| Label font size      | `--ai-font-fixed-xs`             |
| Helper font size     | `--ai-font-fixed-xxs`            |
| Indicator radius     | `--ai-radius-full`               |
| Wrapper gap          | `--ai-spacing-3`                 |
| Label gap            | `--ai-spacing-1`                 |
| Transition           | `--ai-transition-default`        |

## Notes

- Uses native `<input type="radio">` — no JavaScript needed for selection behaviour
- The `name` attribute on radio inputs handles single-select group behaviour natively
- Checked state uses a thick 4px border (`--ai-spacing-1`) to create the filled ring effect
- Disabled state applies `opacity: 0.5` and `cursor: not-allowed`
