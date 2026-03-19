# ChatResponseTable

**Figma URL:** [node 2160:3648](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2160-3648) (Default), [node 2160:3996](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2160-3996) (Desktop)

**Tier:** Component

## Variants

| Variant | Node | Description |
|---------|------|-------------|
| Default (Mobile) | 2160:3648 | Smaller font sizes (xxs headers, xs body) |
| Desktop | 2160:3996 | Larger font sizes (xs headers, sm body) |

## Property Mapping

| Figma Property | CSS Token |
|---|---|
| Outer border | `--ai-border-secondary` |
| Outer radius | `--ai-radius-lg` |
| Header font-family | `--ai-font-title` |
| Header font-weight | `--ai-font-semibold` |
| Header font-size (mobile) | `--ai-font-fixed-xxs` |
| Header font-size (desktop) | `--ai-font-fixed-xs` |
| Header line-height | `--ai-leading-xs` |
| Header color | `--ai-text-secondary` |
| Header border-bottom | `--ai-border-secondary` |
| Header cell padding | `--ai-spacing-4` / `--ai-spacing-5` |
| Body font-family | `--ai-font-title` |
| Body font-weight | `--ai-font-regular` |
| Body font-size (mobile) | `--ai-font-fixed-xs` |
| Body font-size (desktop) | `--ai-font-fixed-sm` |
| Body line-height | `--ai-leading-md` |
| Body color | `--ai-text-primary` |
| Body row separator | `--ai-surface-minimal` |
| Body cell padding | `--ai-spacing-4` / `--ai-spacing-5` |

## Notes

- Wrapped in `.chat-response-table-scroll` for horizontal overflow on narrow viewports.
- Row separators use `--ai-surface-minimal` (not `--ai-border-secondary`).
- Last row has no bottom border.
- Responsive: font sizes step up at 640px breakpoint.
