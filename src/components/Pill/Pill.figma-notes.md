# Pill — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: node `68:4503` — "Pill"

## Variant Matrix

| Node | Variant | Background | Text | CSS modifier |
|---|---|---|---|---|
| 68:4508 | Type=Success | `Aqua/500` → `--ai-surface-success` | `--ai-btn-primary-text` | _(base `.pill`)_ |
| 68:4502 | Type=Default | `--ai-surface-invert` | `--ai-text-invert` | `.pill--default` |
| 68:4504 | Type=Contrast | `--ai-surface-contrast` | `--ai-text-primary` | `.pill--contrast` |
| 68:4511 | Type=Warning | `--ai-surface-error` | `--ai-btn-primary-text`* | `.pill--warning` |
| 68:4515 | Type=Brand | `--ai-surface-brand` | `--ai-btn-primary-text`* | `.pill--brand` |

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Pill container (Success) | `.pill` |
| Pill container (Default) | `.pill.pill--default` |
| Pill container (Contrast) | `.pill.pill--contrast` |
| Pill container (Warning) | `.pill.pill--warning` |
| Pill container (Brand) | `.pill.pill--brand` |
| Label text | `.pill__label` |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Background (Success) | `Aqua/500` → `--ai-surface-success` | `--ai-surface-success` |
| Background (Default) | `--ai-surface-invert` | `--ai-surface-invert` |
| Background (Contrast) | `--ai-surface-contrast` | `--ai-surface-contrast` |
| Background (Warning) | `--ai-surface-error` | `--ai-surface-error` |
| Background (Brand) | `--ai-surface-brand` | `--ai-surface-brand` |
| Text color (Success) | `--ai-text-invert` | `--ai-btn-primary-text`* |
| Text color (Default) | `--ai-text-invert` | `--ai-text-invert` |
| Text color (Contrast) | `--ai-text-primary` | `--ai-text-primary` |
| Text color (Warning) | `--ai-text-invert` | `--ai-btn-primary-text`* |
| Text color (Brand) | `--ai-text-invert` | `--ai-btn-primary-text`* |
| Height | `h-[24px]` = `--ai-spacing-6` | `--ai-spacing-6` |
| Horizontal padding | `--ai-spacing-3` | `--ai-spacing-3` |
| Border radius | `--ai-radius-full` | `--ai-radius-full` |
| Font size | `--ai-font-fixed-xxs` | `--ai-font-fixed-xxs` |
| Font weight | `--ai-font-medium` | `--ai-font-medium` |
| Line height | `--ai-leading-1` | `--ai-leading-1` |

## Token Gaps / Substitutions

*`--ai-text-invert` substituted with `--ai-btn-primary-text` for Success, Warning, and Brand:

- `--ai-surface-success`, `--ai-surface-error`, and `--ai-surface-brand` are all theme-invariant
  (same colour in light and dark mode).
- `--ai-text-invert` flips to near-black (`#111928`) in dark mode, which would produce dark
  text on a coloured background — failing contrast.
- `--ai-btn-primary-text` is always `#ffffff` in both themes, preserving white-on-colour legibility.
- Type=Default uses `--ai-text-invert` correctly: its background (`--ai-surface-invert`) also
  inverts in dark mode, so the combination stays legible in both themes.

## Notes
- The base `.pill` class carries Success colours — VersionHistoryRow and VersionHistory
  use `.pill` without a modifier and must not be broken.
- Text content is dynamic (e.g. "Live", "2 minutes ago").
