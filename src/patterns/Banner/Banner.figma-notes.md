# Banner — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set / container:** `2550:2225` ("Container" frame)
- **Tier:** `Pattern` (built into `src/patterns/Banner/`)
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2550-2225

## Variant matrix (12 variants)

Properties: **Type** × **Device** × **Position** = 3 × 2 × 2 = 12.

| Node ID | Type | Device | Position | Built |
|---|---|---|---|---|
| 2550:2224 | Announcement | Desktop | Floating | ✅ via `.banner--announcement.banner--floating` |
| 2550:2220 | Announcement | Desktop | Fixed | ✅ via `.banner--announcement.banner--fixed` |
| 2550:2218 | Announcement | Mobile | Floating | ✅ via `@media (max-width: 767px)` |
| 2550:2222 | Announcement | Mobile | Fixed | ✅ via `@media (max-width: 767px)` |
| 2550:2219 | Marketing | Desktop | Floating | ✅ via `.banner--marketing.banner--floating` |
| 2550:2216 | Marketing | Desktop | Fixed | ✅ via `.banner--marketing.banner--fixed` |
| 2550:2223 | Marketing | Mobile | Floating | ✅ via `@media (max-width: 767px)` |
| 2550:2215 | Marketing | Mobile | Fixed | ✅ via `@media (max-width: 767px)` |
| 2550:2217 | Information | Desktop | Floating | ✅ via `.banner--information.banner--floating` |
| 2550:2214 | Information | Desktop | Fixed | ✅ via `.banner--information.banner--fixed` |
| 2550:2221 | Information | Mobile | Floating | ✅ via `@media (max-width: 767px)` |
| 2550:2213 | Information | Mobile | Fixed | ✅ via `@media (max-width: 767px)` |

Device variants are handled responsively in CSS — there are no `.banner--mobile` modifier classes. Resize the viewport below 768px to see mobile layout.

## CSS Class Mapping

| Figma element | CSS class | Notes |
|---|---|---|
| Container (root) | `.banner` | Base flex row, white bg, secondary border |
| Position=Floating | `.banner--floating` | Adds `--ai-radius-md` (Announcement) or `--ai-radius-lg` (Marketing/Information) + `--ai-shadow-md` |
| Position=Fixed | `.banner--fixed` | Square corners, bottom-border only, no shadow |
| Type=Announcement | `.banner--announcement` | Single-row icon-bubble + text + close |
| Type=Marketing | `.banner--marketing` | Logo + body + dual-CTA + close (close is absolute top-right) |
| Type=Information | `.banner--information` | Body + Sign Up + close (inline desktop / absolute top-right mobile) |
| Icon bubble (Announcement) | `.banner__icon` | 40px, brand-soft-extra bg, full radius |
| Logo square (Marketing) | `.banner__logo` | 56px, brand bg, radius-md, accepts a Lucide icon at 32px |
| Heading | `.banner__title` | `--ai-font-fixed-md` (18px) bold |
| Paragraph / announcement text | `.banner__text` | `--ai-font-fixed-xs` (14px) regular |
| Inline link (Announcement) | `.banner__link` | Semibold, brand-coloured, underlined |
| Action group | `.banner__actions` | Flex row of buttons |
| Dismiss button | `.banner__close` | Default inline; positioned absolute for Marketing (always) and Information (mobile only) |

## Token Mapping

| Figma variable | CSS variable | Used for |
|---|---|---|
| `surface/elevated-1` | `--ai-surface-elevated-1` | Banner background (steps up properly in dark mode vs `surface/primary`) |
| `border/secondary` | `--ai-border-secondary` | Border (full when Floating, bottom-only when Fixed) |
| `surface/brand-soft-extra` | `--ai-surface-brand-soft-extra` | Announcement icon bubble background |
| `surface/brand` | `--ai-surface-brand` | Marketing logo background AND announcement icon fill (Figma binds the icon stroke to surface-brand, not icon-brand) |
| `text/primary` | `--ai-text-primary` | Heading + announcement body text |
| `text/contrast` | `--ai-text-contrast` | Marketing/Information paragraph |
| `text/brand` | `--ai-text-brand` | Announcement inline link |
| `btn/primary-text` | `--ai-btn-primary-text` | Marketing logo content (icon/letter) — supersedes the older `text/invert` binding |
| `icon/contrast` | `--ai-icon-contrast` | Close button icon |
| `radius/md` | `--ai-radius-md` | Announcement floating, button corners, close button |
| `radius/lg` | `--ai-radius-lg` | Marketing/Information floating |
| `radius/full` | `--ai-radius-full` | Announcement icon bubble |
| `light/shadow-md` | `--ai-shadow-md` | Floating drop shadow |
| `spacing/2` (6px) | `--ai-spacing-2` | Title→paragraph gap |
| `spacing/3` (8px) | `--ai-spacing-3` | Action gap, close button corner offset |
| `spacing/4` (12px) | `--ai-spacing-4` | Default banner gap, announcement padding-y |
| `spacing/5` (16px) | `--ai-spacing-5` | Mobile padding |
| `spacing/6` (24px) | `--ai-spacing-6` | Information desktop padding, announcement padding-x |
| `spacing/7` (32px) | `--ai-spacing-7` | Marketing desktop padding + gap |
| `spacing/8` (40px) | `--ai-spacing-8` | Announcement icon bubble size |
| `spacing/10` (56px) | `--ai-spacing-10` | Marketing logo size |
| `font/title` | `--ai-font-title` | Heading + Marketing logo letter font |
| `font/fixed-md` (18px) | `--ai-font-fixed-md` | Heading |
| `font/fixed-xs` (14px) | `--ai-font-fixed-xs` | Body text |
| `font/fixed-xl` (22px) | `--ai-font-fixed-xl` | Marketing logo letter |
| `leading/sm` (20px) | `--ai-leading-sm` | Heading; mobile announcement text |
| `leading/md` (24px) | `--ai-leading-md` | Desktop announcement & paragraph text |

## Token Gaps

None — every design value maps to an existing `--ai-*` token.

**Note on shadow:** the `light/shadow-md` Figma effect resolves to a 10px blur in the Variables panel but Figma's design-context CSS export emits `0 2px 5px rgba(0,0,0,0.1)` (5px blur). The component uses `var(--ai-shadow-md)` since that is the bound token — a small visual delta versus the in-Figma rendering may exist. Flag to the designer if the effect token needs reconciling.

## Notes

- **Tier=Pattern → `src/patterns/`.** The Figma component property is `Tier=Pattern`, so the file lives in `src/patterns/Banner/` per project convention even though the user's request mentioned `src/components/`.
- **Close button positioning is per-type:**
  - Announcement: always inline at end of row.
  - Marketing: always absolute top-right.
  - Information: inline at end of row on desktop; absolute top-right on mobile.
- **Marketing mobile drops "Learn more".** The mobile variant only shows Sign Up (full-width). The CSS hides `.btn--tertiary` inside `.banner--marketing .banner__actions` at mobile widths so the same HTML works for both desktop and mobile.
- **Marketing logo content is flexible.** The `.banner__logo` slot accepts either a Lucide icon (sized at `--ai-icon-size-xl`/32px), a single letter, or a small image. The demo uses a Lucide `award` icon as a placeholder for the brand mark in Figma.
- **Fixed height.** Figma marks Announcement at `h-[66px]`. The component lets natural padding + content height drive the height instead — this avoids hardcoding a non-token pixel value and the result is visually equivalent (~64–66px depending on borders).
- **Subpixel padding values in Figma** (e.g. `pb-[13px]`/`pt-[12px]`) are sub-pixel rounding artefacts of the bound `--ai-spacing-4` token (12px). The CSS uses the canonical token value.
- **Announcement Mobile uses `--ai-leading-sm` (20px)** instead of `--ai-leading-md` (24px) for the body text — a deliberate Figma-specified difference, applied via the `@media (max-width: 767px)` block.

## Dependencies

- `Button` (`src/components/Button/`) — used inside `.banner__actions` for the Sign Up / Learn more CTAs.
- Lucide icons via CDN — `megaphone` (announcement), `award` (marketing logo placeholder), `x` (close).
