# Pill — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt`
- Component set: node `68:4503` — "Pill"

## Variant Matrix

| Node | Variant | Background | Text | CSS modifier |
|---|---|---|---|---|
| 68:4508 | Type=Success | `Aqua/500` → `--ao-surface-success` | `--ao-btn-primary-text` | _(base `.pill`)_ |
| 68:4502 | Type=Default | `--ao-surface-invert` | `--ao-text-invert` | `.pill--default` |
| 68:4504 | Type=Contrast | `--ao-surface-contrast` | `--ao-text-primary` | `.pill--contrast` |
| 68:4511 | Type=Warning | `--ao-surface-error` | `--ao-btn-primary-text`* | `.pill--warning` |
| 68:4515 | Type=Brand | `--ao-surface-brand` | `--ao-btn-primary-text`* | `.pill--brand` |

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
| Background (Success) | `Aqua/500` → `--ao-surface-success` | `--ao-surface-success` |
| Background (Default) | `--ao-surface-invert` | `--ao-surface-invert` |
| Background (Contrast) | `--ao-surface-contrast` | `--ao-surface-contrast` |
| Background (Warning) | `--ao-surface-error` | `--ao-surface-error` |
| Background (Brand) | `--ao-surface-brand` | `--ao-surface-brand` |
| Text color (Success) | `--ao-text-invert` | `--ao-btn-primary-text`* |
| Text color (Default) | `--ao-text-invert` | `--ao-text-invert` |
| Text color (Contrast) | `--ao-text-primary` | `--ao-text-primary` |
| Text color (Warning) | `--ao-text-invert` | `--ao-btn-primary-text`* |
| Text color (Brand) | `--ao-text-invert` | `--ao-btn-primary-text`* |
| Height | `h-[24px]` = `--ao-spacing-6` | `--ao-spacing-6` |
| Horizontal padding | `--ao-spacing-3` | `--ao-spacing-3` |
| Border radius | `--ao-radius-full` | `--ao-radius-full` |
| Font size | `--ao-font-fixed-xxs` | `--ao-font-fixed-xxs` |
| Font weight | `--ao-font-medium` | `--ao-font-medium` |
| Line height | `--ao-leading-xs` | `--ao-leading-xs` |

## Token Gaps / Substitutions

*`--ao-text-invert` substituted with `--ao-btn-primary-text` for Success, Warning, and Brand:

- `--ao-surface-success`, `--ao-surface-error`, and `--ao-surface-brand` are all theme-invariant
  (same colour in light and dark mode).
- `--ao-text-invert` flips to near-black (`#111928`) in dark mode, which would produce dark
  text on a coloured background — failing contrast.
- `--ao-btn-primary-text` is always `#ffffff` in both themes, preserving white-on-colour legibility.
- Type=Default uses `--ao-text-invert` correctly: its background (`--ao-surface-invert`) also
  inverts in dark mode, so the combination stays legible in both themes.

## Notes
- The base `.pill` class carries Success colours — VersionHistoryRow and VersionHistory
  use `.pill` without a modifier and must not be broken.
- Text content is dynamic (e.g. "Live", "2 minutes ago").
