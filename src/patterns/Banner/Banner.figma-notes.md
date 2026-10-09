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
| Position=Floating | `.banner--floating` | Adds `--ao-radius-md` (Announcement) or `--ao-radius-lg` (Marketing/Information) + `--ao-shadow-md` |
| Position=Fixed | `.banner--fixed` | Square corners, bottom-border only, no shadow |
| Type=Announcement | `.banner--announcement` | Single-row icon-bubble + text + close |
| Type=Marketing | `.banner--marketing` | Logo + body + dual-CTA + close (close is absolute top-right) |
| Type=Information | `.banner--information` | Body + Sign Up + close (inline desktop / absolute top-right mobile) |
| Icon bubble (Announcement) | `.banner__icon` | 40px, brand-soft-extra bg, full radius |
| Logo square (Marketing) | `.banner__logo` | 56px, brand bg, radius-md, accepts a Lucide icon at 32px |
| Heading | `.banner__title` | `--ao-font-fixed-md` (18px) bold |
| Paragraph / announcement text | `.banner__text` | `--ao-font-fixed-xs` (14px) regular |
| Inline link (Announcement) | `.banner__link` | Semibold, brand-coloured, underlined |
| Action group | `.banner__actions` | Flex row of buttons |
| Dismiss button | `.banner__close` | Default inline; positioned absolute for Marketing (always) and Information (mobile only) |

## Token Mapping

| Figma variable | CSS variable | Used for |
|---|---|---|
| `surface/elevated-1` | `--ao-surface-elevated-1` | Banner background (steps up properly in dark mode vs `surface/primary`) |
| `border/secondary` | `--ao-border-secondary` | Border (full when Floating, bottom-only when Fixed) |
| `surface/brand-soft-extra` | `--ao-surface-brand-soft-extra` | Announcement icon bubble background |
| `surface/brand` | `--ao-surface-brand` | Marketing logo background AND announcement icon fill (Figma binds the icon stroke to surface-brand, not icon-brand) |
| `text/primary` | `--ao-text-primary` | Heading + announcement body text |
| `text/contrast` | `--ao-text-contrast` | Marketing/Information paragraph |
| `text/brand` | `--ao-text-brand` | Announcement inline link |
| `btn/primary-text` | `--ao-btn-primary-text` | Marketing logo content (icon/letter) — supersedes the older `text/invert` binding |
| `icon/contrast` | `--ao-icon-contrast` | Close button icon |
| `radius/md` | `--ao-radius-md` | Announcement floating, button corners, close button |
| `radius/lg` | `--ao-radius-lg` | Marketing/Information floating |
| `radius/full` | `--ao-radius-full` | Announcement icon bubble |
| `light/shadow-md` | `--ao-shadow-md` | Floating drop shadow |
| `spacing/2` (6px) | `--ao-spacing-2` | Title→paragraph gap |
| `spacing/3` (8px) | `--ao-spacing-3` | Action gap, close button corner offset |
| `spacing/4` (12px) | `--ao-spacing-4` | Default banner gap, announcement padding-y |
| `spacing/5` (16px) | `--ao-spacing-5` | Mobile padding |
| `spacing/6` (24px) | `--ao-spacing-6` | Information desktop padding, announcement padding-x |
| `spacing/7` (32px) | `--ao-spacing-7` | Marketing desktop padding + gap |
| `spacing/8` (40px) | `--ao-spacing-8` | Announcement icon bubble size |
| `spacing/10` (56px) | `--ao-spacing-10` | Marketing logo size |
| `font/title` | `--ao-font-title` | Heading + Marketing logo letter font |
| `font/fixed-md` (18px) | `--ao-font-fixed-md` | Heading |
| `font/fixed-xs` (14px) | `--ao-font-fixed-xs` | Body text |
| `font/fixed-xl` (22px) | `--ao-font-fixed-xl` | Marketing logo letter |
| `leading/sm` (20px) | `--ao-leading-sm` | Heading; mobile announcement text |
| `leading/md` (24px) | `--ao-leading-md` | Desktop announcement & paragraph text |

## Token Gaps

None — every design value maps to an existing `--ao-*` token.

**Note on shadow:** the `light/shadow-md` Figma effect resolves to a 10px blur in the Variables panel but Figma's design-context CSS export emits `0 2px 5px rgba(0,0,0,0.1)` (5px blur). The component uses `var(--ao-shadow-md)` since that is the bound token — a small visual delta versus the in-Figma rendering may exist. Flag to the designer if the effect token needs reconciling.

## Notes

- **Tier=Pattern → `src/patterns/`.** The Figma component property is `Tier=Pattern`, so the file lives in `src/patterns/Banner/` per project convention even though the user's request mentioned `src/components/`.
- **Close button positioning is per-type:**
  - Announcement: always inline at end of row.
  - Marketing: always absolute top-right.
  - Information: inline at end of row on desktop; absolute top-right on mobile.
- **Marketing mobile drops "Learn more".** The mobile variant only shows Sign Up (full-width). The CSS hides `.btn--tertiary` inside `.banner--marketing .banner__actions` at mobile widths so the same HTML works for both desktop and mobile.
- **Marketing logo uses the Affino brand SVG** — a 24×24 inline SVG with `currentColor` fill, identical to the one used by the `WorkingIntro` component. The `.banner__logo` slot accepts either an inline SVG or a Lucide icon, both sized at `--ao-icon-size-xl` (32px) via the CSS selector.
- **Fixed height.** Figma marks Announcement at `h-[66px]`. The component lets natural padding + content height drive the height instead — this avoids hardcoding a non-token pixel value and the result is visually equivalent (~64–66px depending on borders).
- **Subpixel padding values in Figma** (e.g. `pb-[13px]`/`pt-[12px]`) are sub-pixel rounding artefacts of the bound `--ao-spacing-4` token (12px). The CSS uses the canonical token value.
- **Announcement Mobile uses `--ao-leading-sm` (20px)** instead of `--ao-leading-md` (24px) for the body text — a deliberate Figma-specified difference, applied via the `@media (max-width: 767px)` block.

## Dependencies

- `Button` (`src/components/Button/`) — used inside `.banner__actions` for the Sign Up / Learn more CTAs.
- Lucide icons via CDN — `megaphone` (announcement), `x` (close).
- Affino brand SVG — inline in HTML (Marketing logo). Single 24×24 path using `currentColor` fill so the Marketing logo colour follows `--ao-btn-primary-text` from the parent `.banner__logo`. Same SVG markup as `WorkingIntro`.
