# Design System Token Reference

Complete token tables for the Affino AI design system. All CSS variables use the `--ai-` prefix.

---

## Surface (backgrounds)

| Variable | Value | Use |
|---|---|---|
| `--ai-surface-primary` | `#FFFFFF` | Page/card background |
| `--ai-surface-minimal` | `#F3F4F6` | Very subtle background (Neutral/100) |
| `--ai-surface-secondary` | `#E5E7EB` | Subtle section background (Neutral/200) |
| `--ai-surface-contrast` | `#D1D5DB` | Divider areas, table stripes (Neutral/300) |
| `--ai-surface-invert` | `#111928` | Dark backgrounds |
| `--ai-surface-brand` | `#0071D8` | Brand/primary action bg |
| `--ai-surface-brand-light` | `#3A8FFF` | Hover state on brand |
| `--ai-surface-brand-dark` | `#0054A3` | Pressed state on brand |
| `--ai-surface-brand-contrast` | `#BFD1FF` | Light brand tint |
| `--ai-surface-brand-contrast-extra` | `#F0F3FF` | Very light brand tint |
| `--ai-surface-error` | `#EF4444` | Error backgrounds |
| `--ai-surface-error-contrast` | `#FBD5D5` | Error tint background |
| `--ai-surface-success` | `#30CB90` | Success backgrounds — theme-invariant |

## Text

| Variable | Value | Use |
|---|---|---|
| `--ai-text-primary` | `#1F2A37` | Body text, headings |
| `--ai-text-secondary` | `#4B5563` | Secondary/supporting text |
| `--ai-text-contrast` | `#6B7280` | Placeholder, captions |
| `--ai-text-invert` | `#FFFFFF` | Text on dark/brand backgrounds |
| `--ai-text-error` | `#EF4444` | Error messages |

## Border / Color

| Variable | Value | Use |
|---|---|---|
| `--ai-border-brand` | `#0071D8` | Brand-colored borders |
| `--ai-border-primary` | `#111928` | Strong dividers |
| `--ai-border-secondary` | `#D1D5DB` | Default input/card borders (Neutral/300) |
| `--ai-border-contrast` | `#D1D5DB` | Same as secondary (Neutral/300) |
| `--ai-border-error` | `#EF4444` | Error state borders |

## Border Radius

| Variable | Value | Use |
|---|---|---|
| `--ai-radius-sm` | `0.25rem` | Tags, badges, small inputs |
| `--ai-radius-md` | `0.5rem` | Buttons, cards, inputs |
| `--ai-radius-lg` | `1rem` | Large cards, modals |
| `--ai-radius-xl` | `1.5rem` | Drawers, bottom sheets |
| `--ai-radius-full` | `6.25rem` | Pills, avatars |

## Icon

| Variable | Value | Use |
|---|---|---|
| `--ai-icon-primary` | `#1F2A37` | Default icon color |
| `--ai-icon-secondary` | `#6B7280` | Secondary icon |
| `--ai-icon-contrast` | `#9CA3AF` | Muted/disabled icon |
| `--ai-icon-invert` | `#FFFFFF` | Icon on dark background |
| `--ai-icon-brand` | `#0071D8` | Brand-colored icon |

## Icon Sizes

| Variable | Value | Use |
|---|---|---|
| `--ai-icon-size-sm` | `1rem` (16px) | Small icons — buttons, labels, inputs, chevrons |
| `--ai-icon-size-md` | `1.25rem` (20px) | Medium icons — panel headings |
| `--ai-icon-size-lg` | `1.5rem` (24px) | Large icons — avatar checks (size 3-5), Lucide default |
| `--ai-icon-size-xl` | `2rem` (32px) | Extra-large icons |

**Rule:** Always use `--ai-icon-size-sm/md/lg` for icon `width`/`height` — never `--ai-spacing-*`.

## Button Component

| Variable | Value | Use |
|---|---|---|
| `--ai-btn-primary-bg` | `#0071D8` | Primary button background |
| `--ai-btn-primary-bg-hover` | `#3A8FFF` | Primary hover + focus background |
| `--ai-btn-primary-bg-pressed` | `#0054A3` | Primary pressed background |
| `--ai-btn-primary-text` | `#FFFFFF` | Primary text (theme-invariant) |
| `--ai-btn-primary-text-hover` | `#FFFFFF` | Primary hover text |
| `--ai-btn-primary-border` | `rgba(0,0,0,0)` | Primary default + hover border |
| `--ai-btn-primary-border-hover` | `rgba(0,0,0,0)` | Primary hover border |
| `--ai-btn-secondary-bg` | `transparent` | Secondary button background |
| `--ai-btn-secondary-bg-hover` | `#F3F4F6` | Secondary hover + focus background |
| `--ai-btn-secondary-bg-pressed` | `#E5E7EB` | Secondary pressed background |
| `--ai-btn-secondary-border` | `#D1D5DB` | Secondary default + pressed border; focus ring |
| `--ai-btn-secondary-border-hover` | `#D1D5DB` | Secondary hover border |
| `--ai-btn-secondary-text` | `#1F2A37` | Secondary text |
| `--ai-btn-secondary-text-hover` | `#1F2A37` | Secondary hover text |
| `--ai-btn-tertiary-bg` | `transparent` | Tertiary background |
| `--ai-btn-tertiary-bg-hover` | `#F3F4F6` | Tertiary hover + focus background |
| `--ai-btn-tertiary-bg-pressed` | `#E5E7EB` | Tertiary pressed background |
| `--ai-btn-tertiary-border` | `rgba(0,0,0,0)` | Tertiary default border |
| `--ai-btn-tertiary-border-hover` | `rgba(0,0,0,0)` | Tertiary hover border |
| `--ai-btn-tertiary-text` | `#1F2A37` | Tertiary text |
| `--ai-btn-tertiary-text-hover` | `#1F2A37` | Tertiary hover text |
| `--ai-btn-bg-disabled` | `#D1D5DB` | Disabled background (all variants) |
| `--ai-btn-text-disabled` | `#6B7280` | Disabled text (all variants) |

## Spacing

| Variable | Value | Use |
|---|---|---|
| `--ai-spacing-1` | `0.25rem` | Micro gaps |
| `--ai-spacing-2` | `0.375rem` | Tight padding |
| `--ai-spacing-3` | `0.5rem` | Small padding |
| `--ai-spacing-4` | `0.75rem` | Medium-small padding |
| `--ai-spacing-5` | `1rem` | Standard padding |
| `--ai-spacing-6` | `1.5rem` | Section padding |
| `--ai-spacing-7` | `2rem` | Large section gap |
| `--ai-spacing-8` | `2.5rem` | XL gap |
| `--ai-spacing-9` | `3rem` | 2XL gap |
| `--ai-spacing-10` | `3.5rem` | 3XL gap |
| `--ai-spacing-11` | `4rem` | Section break |
| `--ai-spacing-12` | `4.5rem` | Page section |
| `--ai-spacing-13` | `5rem` | Hero gap |

## Size Scale

Fixed-dimension tokens for component and layout widths/heights (not spacing).

| Variable | Value | px equiv |
|---|---|---|
| `--ai-size-1` | `8rem` | 128px |
| `--ai-size-2` | `10rem` | 160px |
| `--ai-size-3` | `12rem` | 192px |
| `--ai-size-4` | `15rem` | 240px |
| `--ai-size-5` | `17.5rem` | 280px |
| `--ai-size-6` | `20rem` | 320px |
| `--ai-size-7` | `24rem` | 384px |
| `--ai-size-8` | `28rem` | 448px |
| `--ai-size-9` | `32rem` | 512px |
| `--ai-size-10` | `40rem` | 640px |
| `--ai-size-11` | `48rem` | 768px |
| `--ai-size-12` | `60rem` | 960px |
| `--ai-size-13` | `70rem` | 1120px |
| `--ai-size-14` | `80rem` | 1280px |

## Chat Component

Component-specific tokens for the chat UI. Only relevant when building chat-related components.

| Variable | Light value | Dark value |
|---|---|---|
| `--ai-chat-surface-primary` | `#FFFFFF` | `#212123` |
| `--ai-chat-surface-secondary` | `#FFFFFF` | `#2E2E32` |
| `--ai-chat-surface-contrast` | `#F6F6F7` | `#1B1B1F` |
| `--ai-chat-surface-minimal` | `#E2E2E3` | `#2E2E32` |
| `--ai-chat-surface-invert` | `#1B1B1F` | `#F6F6F7` |
| `--ai-chat-border` | `#E2E2E3` | `#3C3C3F` |
| `--ai-chat-sidebar-bg` | `#F6F6F7` | (alias: `surface-primary`) |
| `--ai-chat-sidebar-text` | `#212123` | (alias: `text-primary`) |
| `--ai-chat-msg-bg` | `#F0F3FF` | `#0054A3` |
| `--ai-chat-msg-text` | `#0F406B` | `#F0F3FF` |
| `--ai-chat-brand` | `#0071D8` | `#0071D8` |
| `--ai-chat-sidebar-hover-bg` | — | — | computed (see §Computed Tokens) |
| `--ai-chat-sidebar-active-bg` | — | — | computed (see §Computed Tokens) |

## Skeleton Component

| Variable | Light value | Dark value |
|---|---|---|
| `--ai-skeleton-base` | `#E5E7EB` | `#111928` |
| `--ai-skeleton-highlight` | `#FFFFFF` | `#2B3644` |

## SourcesCarousel Component

| Variable | Light value | Dark value |
|---|---|---|
| `--ai-src-carousel-card-bg` | `#F3F4F6` | `#111928` |

## Shadow

| Variable | Light value | Dark value | Use |
|---|---|---|---|
| `--ai-shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | `0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)` | Small dropdowns, toggle thumbs |
| `--ai-shadow-md` | `0 2px 10px rgba(0,0,0,0.1)` | `0 2px 10px rgba(0,0,0,0.25)` | Tooltips, inputs, menus |
| `--ai-shadow-lg` | `0 0 20px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.1)` | `0 0 20px rgba(0,0,0,0.15), 0 2px 2px rgba(0,0,0,0.25)` | Modals, cards, panels |

**Source:** `css/tokens-shadows.css` (static, manually maintained). Dark mode uses stronger opacities.

## Gradient

| Variable | Pattern | Use |
|---|---|---|
| `--ai-gradient-surface-secondary` | `transparent(secondary) -> secondary` | Fade overlay, edge fade |
| `--ai-gradient-chat-surface-primary` | `transparent(chat-surface-primary) -> chat-surface-primary` (to bottom) | Chat content fade above input |

**Source:** `css/tokens-gradients.css` (static, manually maintained).

**Naming convention:**

| Figma style name | CSS variable | Formula |
|---|---|---|
| `gradient/surface/NAME` | `--ai-gradient-surface-NAME` | `linear-gradient(to right, rgb(from var(--ai-surface-NAME) r g b / 0), var(--ai-surface-NAME))` |
| `gradient/surface/A-B` | `--ai-gradient-surface-A-B` | `linear-gradient(to right, var(--ai-surface-A), var(--ai-surface-B))` |

- Single token name -> fade-out gradient (transparent left, full right). Direction: `to right`.
- Hyphenated name -> solid-to-solid gradient. Direction: `to right`.
- Dark mode: uses CSS Relative Color Syntax — no override needed.

**Adding a new gradient:**
1. Name it in Figma as `gradient/<group>/<name>`
2. Add `--ai-gradient-<group>-<name>` to `css/tokens-gradients.css`
3. Add a row to this table

## Breakpoints

Mobile-first scale (mirrors Tailwind defaults). All `@media` queries use `min-width`.

| Name | Variable | Value | @media usage |
|---|---|---|---|
| sm | `--ai-bp-sm` | `40rem` (640px) | `@media (min-width: 640px)` |
| md | `--ai-bp-md` | `48rem` (768px) | `@media (min-width: 768px)` |
| lg | `--ai-bp-lg` | `64rem` (1024px) | `@media (min-width: 1024px)` |
| xl | `--ai-bp-xl` | `80rem` (1280px) | `@media (min-width: 1280px)` |
| 2xl | `--ai-bp-2xl` | `96rem` (1536px) | `@media (min-width: 1536px)` |

**Rules:**
- Always mobile-first: base styles = mobile, add complexity via `min-width` queries.
- `@media` queries must use the px equivalent (CSS vars not supported in `@media`). `@container` queries CAN use the var.

---

## Dark Mode

**Activation:** Add `data-theme="dark"` to `<html>` or `<body>`.

**Generated file:** `css/tokens-dark.css` (rebuilt by `npm run tokens`; do not edit manually).

All `--ai-*` variables continue to work in dark mode. Brand, error, border, spacing, radius, and typography tokens are **theme-invariant**.

### Tokens that change in dark mode

| Variable | Light value | Dark value |
|---|---|---|
| `--ai-surface-primary` | `#FFFFFF` | `#111928` |
| `--ai-surface-minimal` | `#F3F4F6` | `#1F2A37` |
| `--ai-surface-secondary` | `#E5E7EB` | `#374151` |
| `--ai-surface-contrast` | `#D1D5DB` | `#4B5563` |
| `--ai-surface-invert` | `#111928` | `#F3F4F6` |
| `--ai-surface-brand-contrast` | `#BFD1FF` | `#75A5FF` |
| `--ai-surface-brand-contrast-extra` | `#F0F3FF` | `#BFD1FF` |
| `--ai-text-primary` | `#1F2A37` | `#FFFFFF` |
| `--ai-text-secondary` | `#4B5563` | `#E5E7EB` |
| `--ai-text-contrast` | `#6B7280` | `#9CA3AF` |
| `--ai-text-invert` | `#FFFFFF` | `#111928` |
| `--ai-border-primary` | `#111928` | `#F3F4F6` |
| `--ai-border-secondary` | `#D1D5DB` | `#4B5563` |
| `--ai-border-contrast` | `#D1D5DB` | `#4B5563` |
| `--ai-icon-primary` | `#1F2A37` | `#F3F4F6` |
| `--ai-icon-secondary` | `#6B7280` | `#9CA3AF` |
| `--ai-icon-invert` | `#FFFFFF` | `#111928` |
| `--ai-btn-secondary-bg-hover` | `#F3F4F6` | `#1F2A37` |
| `--ai-btn-secondary-bg-pressed` | `#E5E7EB` | `#374151` |
| `--ai-btn-secondary-border` | `#D1D5DB` | `#4B5563` |
| `--ai-btn-secondary-border-hover` | `#D1D5DB` | `#4B5563` |
| `--ai-btn-secondary-text` | `#1F2A37` | `#FFFFFF` |
| `--ai-btn-secondary-text-hover` | `#1F2A37` | `#FFFFFF` |
| `--ai-btn-tertiary-bg-hover` | `#F3F4F6` | `#1F2A37` |
| `--ai-btn-tertiary-bg-pressed` | `#E5E7EB` | `#374151` |
| `--ai-btn-tertiary-text` | `#1F2A37` | `#FFFFFF` |
| `--ai-btn-tertiary-text-hover` | `#1F2A37` | `#FFFFFF` |
| `--ai-btn-bg-disabled` | `#D1D5DB` | `#6B7280` |
| `--ai-btn-text-disabled` | `#6B7280` | `#D1D5DB` |

### Component dark-mode notes

- **Tooltip:** Fixed dark panel (`#0c121c` = Neutral/950) in both themes. Does **not** invert.

---

## Minimised Layout Mode

**Activation:** Add `data-layout="minimised"` to any container element.

**Generated file:** `css/tokens-minimised.css` (rebuilt by `npm run tokens`; do not edit manually).

CSS selector override, NOT a media query. Only `--ai-font-fluid-*` values differ:

| Variable | Desktop value | Minimised value |
|---|---|---|
| `--ai-font-fluid-sm` | `1rem` | `0.875rem` |
| `--ai-font-fluid-md` | `1.125rem` | `1rem` |
| `--ai-font-fluid-lg` | `1.25rem` | `1.125rem` |
| `--ai-font-fluid-xl` | `1.375rem` | `1.25rem` |
| `--ai-font-fluid-2xl` | `1.625rem` | `1.5rem` |
| `--ai-font-fluid-3xl` | `1.75rem` | `1.625rem` |
| `--ai-font-fluid-4xl` | `2rem` | `1.875rem` |

`--ai-font-fluid-xxs` and `--ai-font-fluid-xs` are unchanged.

---

## Computed Tokens

Some tokens depend on runtime context (e.g. client-customisable sidebar background). Figma represents these as `$type: "string"` variables.

### Dynamic background pattern

When a component's background is client-customisable, ALL derived colours must adapt to the actual background luminance — not follow the global theme.

1. **JS:** `initSidebarTheme(el)` reads the bg token, computes luminance, sets `data-sidebar-theme="light|dark"`.
2. **CSS:** `[data-sidebar-theme]` blocks set computed variables via `color-mix()`.
3. **Re-run** after theme toggles or bg customisation.

**Key rule:** Never use semantic tokens for text on a dynamic background — they flip with the global theme. Use fixed RGB values instead.

| Derived property | Light sidebar | Dark sidebar |
|---|---|---|
| Text | `rgb(31 42 55)` (fixed dark) | `rgb(229 231 235)` (fixed light) |
| Selected text | 15% darker — `color-mix(in srgb, text 85%, black)` | 15% lighter — `color-mix(in srgb, text 85%, white)` |
| Hover bg | 8% overlay — `color-mix(in srgb, bg 92%, rgb(38 55 88))` | `color-mix(in srgb, bg 92%, white)` |
| Selected bg | 12% overlay — `color-mix(in srgb, bg 88%, rgb(38 55 88))` | `color-mix(in srgb, bg 88%, white)` |
| Muted text (labels) | `color: var(--ai-chat-sidebar-text); opacity: 0.6` | same |

### Current computed tokens

| Token | Base | Technique |
|---|---|---|
| `--ai-chat-sidebar-text` | `--ai-chat-sidebar-bg` | Fixed RGB based on luminance detection |
| `--ai-chat-sidebar-selected-text` | `--ai-chat-sidebar-text` | 15% lighter via `color-mix()` |
| `--ai-chat-sidebar-hover-bg` | `--ai-chat-sidebar-bg` | 8% overlay via `color-mix()` |
| `--ai-chat-sidebar-active-bg` | `--ai-chat-sidebar-bg` | 12% overlay via `color-mix()` |

**Utility:** `src/utils/sidebar-colors.js`

---

## Typography

Font: **Inter** (loaded via Google Fonts in `src/styles/base.css`).

### Font Families

| Variable | Value |
|---|---|
| `--ai-font-title` | `'Inter', sans-serif` |
| `--ai-font-body` | `'Inter', sans-serif` |

### Font Weights

| Variable | CSS Value | Use |
|---|---|---|
| `--ai-font-regular` | `400` | Body text |
| `--ai-font-medium` | `500` | Emphasis |
| `--ai-font-semibold` | `600` | Buttons, subheadings |
| `--ai-font-bold` | `700` | Headings |
| `--ai-font-extrabold` | `800` | Display text |

### Font Sizes (Fixed)

| Variable | Value | Use |
|---|---|---|
| `--ai-font-fixed-xxs` | `0.75rem` | Labels, captions |
| `--ai-font-fixed-xs` | `0.875rem` | Small body, metadata |
| `--ai-font-fixed-sm` | `1rem` | Body text (default) |
| `--ai-font-fixed-md` | `1.125rem` | Large body |
| `--ai-font-fixed-lg` | `1.25rem` | Small heading |
| `--ai-font-fixed-xl` | `1.375rem` | Heading 5/4 |
| `--ai-font-fixed-2xl` | `1.625rem` | Heading 3 |
| `--ai-font-fixed-3xl` | `1.75rem` | Heading 2 |
| `--ai-font-fixed-4xl` | `2rem` | Heading 1 |

### Font Sizes (Fluid — responsive)

| Variable | Desktop | Mobile |
|---|---|---|
| `--ai-font-fluid-xxs` | `0.75rem` | `0.75rem` |
| `--ai-font-fluid-xs` | `0.875rem` | `0.875rem` |
| `--ai-font-fluid-sm` | `1rem` | `0.875rem` |
| `--ai-font-fluid-md` | `1.125rem` | `1rem` |
| `--ai-font-fluid-lg` | `1.25rem` | `1.125rem` |
| `--ai-font-fluid-xl` | `1.375rem` | `1.25rem` |
| `--ai-font-fluid-2xl` | `1.625rem` | `1.5rem` |
| `--ai-font-fluid-3xl` | `1.75rem` | `1.625rem` |
| `--ai-font-fluid-4xl` | `2rem` | `1.875rem` |

### Line Heights

| Variable | Value | Use |
|---|---|---|
| `--ai-leading-xs` | `1rem` | Caption/label |
| `--ai-leading-sm` | `1.25rem` | Small body |
| `--ai-leading-md` | `1.5rem` | Body default |
| `--ai-leading-lg` | `2rem` | Heading |
| `--ai-leading-xl` | `2.5rem` | Large heading |
| `--ai-leading-2xl` | `3rem` | Display |

### Letter Spacing (Tracking)

| Variable | Value | Figma px | Use |
|---|---|---|---|
| `--ai-tracking-1` | `-0.05em` | -0.8px | Tightest (display headings) |
| `--ai-tracking-2` | `-0.025em` | -0.4px | Tight |
| `--ai-tracking-3` | `-0.0125em` | -0.2px | Slightly tight |
| `--ai-tracking-4` | `0em` | 0 | Normal (default) |
| `--ai-tracking-5` | `0.0125em` | 0.2px | Slightly loose |
| `--ai-tracking-6` | `0.025em` | 0.4px | Loose |
| `--ai-tracking-7` | `0.05em` | 0.8px | Loosest (labels, captions) |

Tracking tokens use `em` units (relative to element font size), not `rem`.

---

## Transition Presets

| Variable | Value | Use |
|---|---|---|
| `--ai-transition-fast` | `100ms ease` | Quick micro-interactions (toggles, checkboxes) |
| `--ai-transition-default` | `150ms ease` | Standard hover / focus state changes |
| `--ai-transition-slow` | `250ms ease` | More deliberate transitions (panel reveals) |
| `--ai-transition-spring` | `200ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy/playful interactions |

Usage: `transition: background-color var(--ai-transition-default);`
