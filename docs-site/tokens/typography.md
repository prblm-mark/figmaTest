# Typography

Font: **Inter** (loaded via Google Fonts in `base.css`).

## Font Families

| Token | Value | Use |
|---|---|---|
| `--ai-font-title` | `'Inter', sans-serif` | Headings, labels, component titles |
| `--ai-font-body` | `'Inter', sans-serif` | Body text, descriptions, inputs |

Both resolve to Inter — the distinction exists so a future rebrand could swap title to a different typeface without touching body text.

## Font Weights

| Token | Value | Use |
|---|---|---|
| `--ai-font-regular` | `400` | Body text, descriptions |
| `--ai-font-medium` | `500` | Emphasis, pill labels, sidebar text |
| `--ai-font-semibold` | `600` | Buttons, subheadings, labels |
| `--ai-font-bold` | `700` | Headings, titles |
| `--ai-font-extrabold` | `800` | Display text (not currently used) |

## Font Sizes — Fixed

Fixed sizes do not change between breakpoints. Use for elements that should stay the same size regardless of viewport.

| Token | rem | px | Style name | Use |
|---|---|---|---|---|
| `--ai-font-fixed-xxs` | `0.75rem` | 12px | body/xxs | Labels, captions, disclaimer text |
| `--ai-font-fixed-xs` | `0.875rem` | 14px | body/xs | Small body, metadata, table cells |
| `--ai-font-fixed-sm` | `1rem` | 16px | body/sm | Body text default |
| `--ai-font-fixed-md` | `1.125rem` | 18px | — | Large body |
| `--ai-font-fixed-lg` | `1.25rem` | 20px | — | Small heading |
| `--ai-font-fixed-xl` | `1.375rem` | 22px | — | Mobile welcome title |
| `--ai-font-fixed-2xl` | `1.625rem` | 26px | — | Heading 3 |
| `--ai-font-fixed-3xl` | `1.75rem` | 28px | — | Desktop welcome title |
| `--ai-font-fixed-4xl` | `2rem` | 32px | — | Heading 1 |

## Font Sizes — Fluid (responsive)

Fluid tokens automatically shrink at mobile breakpoints via `tokens-mobile.css` (`@media max-width: 639px`). Use for text that should scale down on small screens.

| Token | Desktop | Mobile (≤639px) | Use |
|---|---|---|---|
| `--ai-font-fluid-xxs` | `0.75rem` | `0.75rem` | Button sm — no change |
| `--ai-font-fluid-xs` | `0.875rem` | `0.875rem` | Button base — no change |
| `--ai-font-fluid-sm` | `1rem` | `0.875rem` | Response prose |
| `--ai-font-fluid-md` | `1.125rem` | `1rem` | Subtitles |
| `--ai-font-fluid-lg` | `1.25rem` | `1.125rem` | — |
| `--ai-font-fluid-xl` | `1.375rem` | `1.25rem` | Section headings (Header, StyleSettings) |
| `--ai-font-fluid-2xl` | `1.625rem` | `1.5rem` | — |
| `--ai-font-fluid-3xl` | `1.75rem` | `1.625rem` | — |
| `--ai-font-fluid-4xl` | `2rem` | `1.875rem` | — |

### Minimised mode

The same fluid tokens also shrink in minimised layout (`data-layout="minimised"`). Values match the mobile breakpoint but are applied via a CSS selector, not a media query — allowing compact typography in a panel context independent of screen width.

## Line Heights

| Token | rem | px | Use |
|---|---|---|---|
| `--ai-leading-xs` | `1rem` | 16px | Caption/label, button text |
| `--ai-leading-sm` | `1.25rem` | 20px | Small body, suggested question title |
| `--ai-leading-md` | `1.5rem` | 24px | Body text default, response prose |
| `--ai-leading-lg` | `2rem` | 32px | Section headings |
| `--ai-leading-xl` | `2.5rem` | 40px | Large headings |
| `--ai-leading-2xl` | `3rem` | 48px | Display (not currently used) |

## Letter Spacing (Tracking)

Tracking tokens use `em` units (relative to element font size), not `rem`.

| Token | Value | Figma px | Use |
|---|---|---|---|
| `--ai-tracking-1` | `-0.05em` | -0.8px | Tightest (display headings) |
| `--ai-tracking-2` | `-0.025em` | -0.4px | Tight |
| `--ai-tracking-3` | `-0.0125em` | -0.2px | Slightly tight (WorkingIntro, code badges) |
| `--ai-tracking-4` | `0em` | 0 | Normal (default) |
| `--ai-tracking-5` | `0.0125em` | 0.2px | Slightly loose (ChatHeader selector, disclaimer) |
| `--ai-tracking-6` | `0.025em` | 0.4px | Loose |
| `--ai-tracking-7` | `0.05em` | 0.8px | Loosest |

## Named type styles

Figma uses named text styles that map to token combinations:

| Style name | Family | Weight | Size | Line height | Tracking |
|---|---|---|---|---|---|
| `title/xl` | `--ai-font-title` | `--ai-font-bold` | `--ai-font-fluid-xl` | `--ai-leading-lg` | `--ai-tracking-4` |
| `title/base` | `--ai-font-title` | `--ai-font-bold` | `--ai-font-fixed-sm` | `--ai-leading-xs` | `--ai-tracking-4` |
| `title/xs` | `--ai-font-title` | `--ai-font-semibold` | `--ai-font-fixed-xs` | `--ai-leading-xs` | `--ai-tracking-4` |
| `title/xxs` | `--ai-font-title` | `--ai-font-semibold` | `--ai-font-fixed-xxs` | `--ai-leading-xs` | `--ai-tracking-4` |
| `body/xs` | `--ai-font-body` | `--ai-font-regular` | `--ai-font-fixed-xs` | `--ai-leading-md` | `--ai-tracking-4` |
| `body/xxs` | `--ai-font-body` | `--ai-font-regular` | `--ai-font-fixed-xxs` | `--ai-leading-xs` | `--ai-tracking-5` |
| `body/xxs/medium` | `--ai-font-body` | `--ai-font-medium` | `--ai-font-fixed-xxs` | `--ai-leading-xs` | `--ai-tracking-5` |
| `button/base` | `--ai-font-body` | `--ai-font-semibold` | `--ai-font-fluid-xs` | `--ai-leading-xs` | `--ai-tracking-4` |
| `button/sm` | `--ai-font-body` | `--ai-font-semibold` | `--ai-font-fluid-xxs` | `--ai-leading-xs` | `--ai-tracking-4` |

## Figma source

Typography tokens live in the **Typography** collection in the Design System library with three modes: Desktop, Mobile, and Minimised.
