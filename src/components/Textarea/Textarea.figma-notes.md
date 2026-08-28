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
| Background | `--ai-surface-primary` | Yes |
| Border | `--ai-border-secondary` | Yes |
| Border radius | `--ai-radius-md` | Yes |
| Hover border | `--ai-border-brand` | Yes |
| Focus ring | `--ai-surface-brand-soft` (3px) | Yes |
| Error border | `--ai-border-error` | Yes |
| Error ring | `--ai-surface-error-soft` (3px) | Yes |
| Disabled bg | `--ai-surface-minimal` | Yes |
| Label font | `--ai-font-title` / `--ai-font-fixed-xs` / `--ai-font-semibold` | Yes |
| Control font | `--ai-font-body` / `--ai-font-fixed-xs` / `--ai-font-regular` | Yes |
| Help font | `--ai-font-body` / `--ai-font-fixed-xxs` / `--ai-font-regular` | Yes |
| Placeholder | `--ai-text-contrast` | Yes |
| Padding (base) | `--ai-spacing-4` top/bottom, `--ai-spacing-5` left/right | — |
| Padding (sm) | `--ai-spacing-3` top/bottom, `--ai-spacing-4` left/right | — |

## Dependencies

None — standalone component.

## Notes

- Min-height values (120px base, 80px sm) are hardcoded layout dimensions with no token match.
- All form-facing tokens intentionally match the Input component for visual consistency across forms.
- Character count is optional — add `.textarea__footer` with `.textarea__char-count` when needed.
- `resize: vertical` by default; disabled state sets `resize: none`.
