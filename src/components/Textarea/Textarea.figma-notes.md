# Textarea

## Overview

Multi-line text input for longer form content. Mirrors the Input component's token usage and patterns (label, help text, error state, sizing) for form consistency.

## Figma Reference

- **Component set:** [Textarea](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2458-433)
- **File:** Affino AI — Design System (`Lus07xi8pPXLN87sQIyrEt`)

## Variant Matrix

| Node ID | Type | Size |
|---------|------|------|
| 2458:432 | Default | Base |
| 2458:430 | Default | sm |
| 2458:428 | Character Count | Base |
| 2460:434 | Character Count | sm |
| 2458:427 | Error | Base |
| 2460:451 | Error | sm |
| 2458:431 | Disabled | Base |
| 2460:457 | Disabled | sm |

## CSS Class Mapping

| Variant | CSS Class |
|---------|-----------|
| Container | `.textarea` |
| Label | `.textarea__label` |
| Control | `.textarea__control` |
| Help text | `.textarea__help` |
| Footer (char count) | `.textarea__footer` |
| Char count text | `.textarea__char-count` |
| Error state | `.textarea--error` |
| Small size | `.textarea--sm` |

## Token Usage

| Property | Token | Matches Input? |
|----------|-------|----------------|
| Background | `--ao-surface-primary` | Yes |
| Border | `--ao-border-secondary` | Yes |
| Border radius | `--ao-radius-md` | Yes |
| Hover border | `--ao-border-brand` | Yes |
| Focus ring | `--ao-surface-brand-soft` (3px) | Yes |
| Error border | `--ao-border-error` | Yes |
| Error ring | `--ao-surface-error-soft` (3px) | Yes |
| Disabled bg | `--ao-surface-minimal` | Yes |
| Label font | `--ao-font-title` / `--ao-font-fixed-xs` / `--ao-font-semibold` | Yes |
| Control font | `--ao-font-body` / `--ao-font-fixed-xs` / `--ao-font-regular` | Yes |
| Help font | `--ao-font-body` / `--ao-font-fixed-xxs` / `--ao-font-regular` | Yes |
| Placeholder | `--ao-text-contrast` | Yes |
| Padding (base) | `--ao-spacing-4` top/bottom, `--ao-spacing-5` left/right | — |
| Padding (sm) | `--ao-spacing-3` top/bottom, `--ao-spacing-4` left/right | — |

## Dependencies

None — standalone component.

## Notes

- Min-height values (120px base, 80px sm) are hardcoded layout dimensions with no token match.
- All form-facing tokens intentionally match the Input component for visual consistency across forms.
- Character count is optional — add `.textarea__footer` with `.textarea__char-count` when needed.
- `resize: vertical` by default; disabled state sets `resize: none`.
