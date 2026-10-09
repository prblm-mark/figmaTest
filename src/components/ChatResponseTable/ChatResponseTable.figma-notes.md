# ChatResponseTable

**Figma URL:** [node 2160:3648](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-1434) (Default), [node 2160:3996](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-1434) (Desktop)

**Tier:** Component

## Variants

| Variant | Node | Description |
|---------|------|-------------|
| Default (Mobile) | 2160:3648 | Smaller font sizes (xxs headers, xs body) |
| Desktop | 2160:3996 | Larger font sizes (xs headers, sm body) |

## Property Mapping

| Figma Property | CSS Token |
|---|---|
| Outer border | `--ao-border-secondary` |
| Outer radius | `--ao-radius-lg` |
| Header font-family | `--ao-font-title` |
| Header font-weight | `--ao-font-semibold` |
| Header font-size (mobile) | `--ao-font-fixed-xxs` |
| Header font-size (desktop) | `--ao-font-fixed-xs` |
| Header line-height | `--ao-leading-xs` |
| Header color | `--ao-text-secondary` |
| Header border-bottom | `--ao-border-secondary` |
| Header cell padding | `--ao-spacing-4` / `--ao-spacing-5` |
| Body font-family | `--ao-font-title` |
| Body font-weight | `--ao-font-regular` |
| Body font-size (mobile) | `--ao-font-fixed-xs` |
| Body font-size (desktop) | `--ao-font-fixed-sm` |
| Body line-height | `--ao-leading-md` |
| Body color | `--ao-text-primary` |
| Body row separator | `--ao-surface-minimal` |
| Body cell padding | `--ao-spacing-4` / `--ao-spacing-5` |

## Notes

- Wrapped in `.chat-response-table-scroll` for horizontal overflow on narrow viewports.
- Row separators use `--ao-surface-minimal` (not `--ao-border-secondary`).
- Last row has no bottom border.
- Responsive: font sizes step up at 640px breakpoint.
