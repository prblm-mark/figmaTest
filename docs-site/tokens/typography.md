# Typography

Font: **Inter** (loaded via Google Fonts in `base.css`).

## Font Families

| Token | Value | Use |
|---|---|---|
| `--ao-font-title` | `'Inter', sans-serif` | Headings, labels, component titles |
| `--ao-font-body` | `'Inter', sans-serif` | Body text, descriptions, inputs |

Both resolve to Inter — the distinction exists so a future rebrand could swap title to a different typeface without touching body text.

## Font Weights

| Token | Value | Use |
|---|---|---|
| `--ao-font-regular` | `400` | Body text, descriptions |
| `--ao-font-medium` | `500` | Emphasis, pill labels, sidebar text |
| `--ao-font-semibold` | `600` | Buttons, subheadings, labels |
| `--ao-font-bold` | `700` | Headings, titles |
| `--ao-font-extrabold` | `800` | Display text (not currently used) |

## Font Sizes — Fixed

Fixed sizes do not change between breakpoints. Use for elements that should stay the same size regardless of viewport.

| Token | rem | px | Style name | Use |
|---|---|---|---|---|
| `--ao-font-fixed-5xs` | `0.625rem` | 10px | — | Micro labels, dense table chrome |
| `--ao-font-fixed-4xs` | `0.6875rem` | 11px | — | Micro labels |
| `--ao-font-fixed-3xs` | `0.75rem` | 12px | — | Labels, captions |
| `--ao-font-fixed-xxs` | `0.75rem` | 12px | body/xxs | **The 12px token components use** — labels, captions, disclaimer text |
| `--ao-font-fixed-2xs` | `0.8125rem` | 13px | — | One step up from 12px |
| `--ao-font-fixed-xs` | `0.875rem` | 14px | body/xs | Small body, metadata, table cells |
| `--ao-font-fixed-sm` | `1rem` | 16px | body/sm | Body text default |
| `--ao-font-fixed-md` | `1.125rem` | 18px | — | Large body |
| `--ao-font-fixed-lg` | `1.25rem` | 20px | — | Small heading |
| `--ao-font-fixed-xl` | `1.375rem` | 22px | — | Mobile welcome title |
| `--ao-font-fixed-2xl` | `1.625rem` | 26px | — | Heading 3 |
| `--ao-font-fixed-3xl` | `1.75rem` | 28px | — | Desktop welcome title |
| `--ao-font-fixed-4xl` | `2rem` | 32px | — | Heading 1 |
| `--ao-font-fixed-5xl` | `2.25rem` | 36px | — | Display |
| `--ao-font-fixed-6xl` | `3rem` | 48px | — | Display |
| `--ao-font-fixed-7xl` | `3.75rem` | 60px | — | Display |
| `--ao-font-fixed-8xl` | `4.5rem` | 72px | — | Display |

::: warning `xxs` and `2xs` have swapped TWICE — read the table, not your memory
The Aug 2026 export moved the 12px step from `xxs` to `2xs` and 318 references were repointed.
The **28 Aug 2026 export reversed it**: `xxs` is 12px again, `2xs` is the 13px step, and all 361
references were swapped back (the handful that genuinely wanted 13px were moved the other way, so
nothing shifted visually).
**Use `--ao-font-fixed-xxs` for 12px**; reach for `2xs` only when you want 13px.

Because both names have carried both values, any older comment or commit message that quotes only
the token name may describe the value it had at the time.
:::

## Font Sizes — Fluid (responsive)

Fluid tokens automatically shrink at mobile breakpoints via `tokens-mobile.css` (`@media max-width: 639px`). Use for text that should scale down on small screens.

| Token | Desktop | Mobile (≤639px) | Use |
|---|---|---|---|
| `--ao-font-fluid-xxs` | `0.75rem` | `0.75rem` | Button sm — no change |
| `--ao-font-fluid-xs` | `0.875rem` | `0.875rem` | Button base — no change |
| `--ao-font-fluid-sm` | `1rem` | `0.875rem` | Response prose |
| `--ao-font-fluid-md` | `1.125rem` | `1rem` | Subtitles |
| `--ao-font-fluid-lg` | `1.25rem` | `1.125rem` | — |
| `--ao-font-fluid-xl` | `1.375rem` | `1.25rem` | Section headings (Header, StyleSettings) |
| `--ao-font-fluid-2xl` | `1.625rem` | `1.5rem` | — |
| `--ao-font-fluid-3xl` | `1.75rem` | `1.625rem` | — |
| `--ao-font-fluid-4xl` | `2rem` | `1.875rem` | — |

### Minimised mode

The same fluid tokens also shrink in minimised layout (`data-layout="minimised"`). Values match the mobile breakpoint but are applied via a CSS selector, not a media query — allowing compact typography in a panel context independent of screen width.

## Line Heights

| Token | rem | px | Use |
|---|---|---|---|
| `--ao-leading-xs` | `1rem` | 16px | Caption/label, button text |
| `--ao-leading-sm` | `1.25rem` | 20px | Small body, suggested question title |
| `--ao-leading-md` | `1.5rem` | 24px | Body text default, response prose |
| `--ao-leading-lg` | `2rem` | 32px | Section headings |
| `--ao-leading-xl` | `2.5rem` | 40px | Large headings |
| `--ao-leading-2xl` | `3rem` | 48px | Display (not currently used) |

## Letter Spacing (Tracking)

Tracking tokens use `em` units (relative to element font size), not `rem`.

| Token | Value | Figma px | Use |
|---|---|---|---|
| `--ao-tracking-1` | `-0.05em` | -0.8px | Tightest (display headings) |
| `--ao-tracking-2` | `-0.025em` | -0.4px | Tight |
| `--ao-tracking-3` | `-0.0125em` | -0.2px | Slightly tight (WorkingIntro, code badges) |
| `--ao-tracking-4` | `0em` | 0 | Normal (default) |
| `--ao-tracking-5` | `0.0125em` | 0.2px | Slightly loose (ChatHeader selector, disclaimer) |
| `--ao-tracking-6` | `0.025em` | 0.4px | Loose |
| `--ao-tracking-7` | `0.05em` | 0.8px | Loosest |

## Named type styles

Figma uses named text styles that map to token combinations:

| Style name | Family | Weight | Size | Line height | Tracking |
|---|---|---|---|---|---|
| `title/xl` | `--ao-font-title` | `--ao-font-bold` | `--ao-font-fluid-xl` | `--ao-leading-lg` | `--ao-tracking-4` |
| `title/base` | `--ao-font-title` | `--ao-font-bold` | `--ao-font-fixed-sm` | `--ao-leading-xs` | `--ao-tracking-4` |
| `title/xs` | `--ao-font-title` | `--ao-font-semibold` | `--ao-font-fixed-xs` | `--ao-leading-xs` | `--ao-tracking-4` |
| `title/xxs` | `--ao-font-title` | `--ao-font-semibold` | `--ao-font-fixed-xxs` | `--ao-leading-xs` | `--ao-tracking-4` |
| `body/xs` | `--ao-font-body` | `--ao-font-regular` | `--ao-font-fixed-xs` | `--ao-leading-md` | `--ao-tracking-4` |
| `body/xxs` | `--ao-font-body` | `--ao-font-regular` | `--ao-font-fixed-xxs` | `--ao-leading-xs` | `--ao-tracking-5` |
| `body/xxs/medium` | `--ao-font-body` | `--ao-font-medium` | `--ao-font-fixed-xxs` | `--ao-leading-xs` | `--ao-tracking-5` |
| `button/base` | `--ao-font-body` | `--ao-font-semibold` | `--ao-font-fluid-xs` | `--ao-leading-xs` | `--ao-tracking-4` |
| `button/sm` | `--ao-font-body` | `--ao-font-semibold` | `--ao-font-fluid-xxs` | `--ao-leading-xs` | `--ao-tracking-4` |

## Figma source

Typography tokens live in the **Typography** collection in the Design System library with three modes: Desktop, Mobile, and Minimised.
