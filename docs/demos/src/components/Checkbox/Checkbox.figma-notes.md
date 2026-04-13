# Checkbox — Figma Notes

## Figma Source

- **URL:** https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2043-2985
- **File:** Affino AI — Design System
- **Node:** `2043:2985`

## Variant Matrix

| Variant  | Description                       |
| -------- | --------------------------------- |
| Initial  | Unchecked, default state          |
| Checked  | Checked with brand bg + check icon |
| Disabled | Non-interactive, 50% opacity      |

## CSS Class Mapping

| Figma Variant | CSS Class(es)                          |
| ------------- | -------------------------------------- |
| Initial       | `.checkbox`                            |
| Checked       | `.checkbox` + native `checked` attr    |
| Disabled      | `.checkbox` + native `disabled` attr   |

## Token Mapping

| Figma Property         | CSS Token                        |
| ---------------------- | -------------------------------- |
| Indicator bg           | `--ai-surface-minimal`           |
| Indicator border       | `--ai-border-secondary`          |
| Indicator radius       | `--ai-radius-sm`                 |
| Checked indicator bg   | `--ai-surface-brand`             |
| Checked border         | `--ai-border-brand`              |
| Check icon color       | `--ai-text-invert`               |
| Focus ring inner       | `--ai-surface-primary`           |
| Focus ring outer       | `--ai-surface-brand-contrast`    |
| Label text color       | `--ai-text-primary`              |
| Helper text color      | `--ai-text-contrast`             |
| Label font size        | `--ai-font-fixed-xs`             |
| Helper font size       | `--ai-font-fixed-xxs`            |
| Wrapper gap            | `--ai-spacing-3`                 |
| Label gap              | `--ai-spacing-1`                 |
| Transition             | `--ai-transition-default`        |

## Notes

- Uses native `<input type="checkbox">` — no JavaScript needed for toggle behaviour
- Checked state shows a Lucide `check` icon (14x14) inside the indicator
- Indicator uses `--ai-radius-sm` (rounded square) vs Radio's `--ai-radius-full` (circle)
- Checked background is `--ai-surface-brand` (solid brand fill) vs Radio's ring approach
