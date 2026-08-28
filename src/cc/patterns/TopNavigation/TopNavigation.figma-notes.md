# CCTopNavigation — Figma Notes

**Figma file:** [`ETKqleZdpertwFEo40YB5n`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4099-3634) (CC Hybrid Design System)
**Tier:** Pattern
**Component set node:** `4099:3634` (frame name `CCTopNavigation`)
**Files:** `CCTopNavigation.css`, `CCTopNavigation.html`, `CCTopNavigation.figma.ts`, `CCTopNavigation.figma-notes.md`

---

## Variant matrix (verified from Figma `get_metadata` 2026-05-15)

Two axes: **Type** × **Device** = 4 variants.

| Node ID | Device | Type | Width | Description |
|---|---|---|---|---|
| `4099:3631` | Desktop | Default | 1280 | "Zone name > Level 1" |
| `4099:3633` | Desktop | Multizone | 1280 | "Zone Selector ▾ > Level 1 > Level 2" |
| `4099:3632` | Mobile | Default | 390 | "Zone name > Level 1", avatar-only user |
| `4099:3630` | Mobile | Multizone | 390 | "Zone Selector ▾ > Level 1", avatar-only user |

Mobile responsiveness handled via `@container (max-width: 767px)` (the bar is a
`container-type: inline-size` context) — single HTML structure collapses to the mobile
layout. No `--mobile` modifier class.

> **Two Device deltas were missing until 2026-08-28** and were added at the designer's
> direction, both verified against the mobile variants:
>
> | | Desktop (`4099:3633`) | Mobile (`4099:3630` / `:3632`) |
> |---|---|---|
> | bar padding-x | `--ai-spacing-5` 16px | **`--ai-spacing-4` 12px** |
> | bar min-height | `--ai-spacing-9` 48px | `--ai-spacing-8` 40px (already correct) |
> | breadcrumb font | `--ai-font-fixed-xs` 14px | **`--ai-font-fixed-2xs` 13px** |
>
> Padding was read geometrically rather than from a class: the Breadcrumb child sits at `x=12`
> with 12px clear on the right in both mobile variants, and at `x=16` in the desktop one.
>
> The font override is scoped `.cc-top-navigation .breadcrumb__item` — **not** the list or the
> nav — because that is the element Breadcrumb.css sizes; `__link` and `__dropdown` both declare
> `font-size: inherit`, so setting it anywhere else silently does nothing.
>
> **Token-name hazard, recorded because it will recur:** 13px is `--ai-font-fixed-2xs` in this
> codebase, but the CC Hybrid Figma file binds 13px to a variable it still calls
> `--ai-font-fixed-xxs`. That file's typography variables predate the 28 Aug 2026 swap, after
> which `xxs` = 12px and `2xs` = 13px in `css/tokens.css` and in the Affino AI file. **The two
> Figma files now disagree about what `xxs` means.** Match on the pixel value, never the name —
> copying the name out of the CC Hybrid file yields 12px.
>
> One subtlety about the mobile block, unchanged but worth knowing: `.cc-top-navigation`
> declares its own `container-type`, so rules inside `@container` that target the BAR ITSELF
> resolve against the nearest ancestor container (`cs-main`), while rules targeting descendants
> resolve against the bar. Both signals agree in practice — measured 2026-08-28, the bar and
> `cs-main` are the same width (1008px desktop, 338px mobile) because the bar spans the chrome —
> so the padding and min-height overrides do fire. It is not a bug today, but the block's
> original comment ("whenever the bar itself is narrower than 768px") is only true of the
> descendant rules.

**Breadcrumb item budget:** max **2 items** below MD (768px), **3 items** at ≥768px. The
breadcrumb keeps the zone selector + 1 level (or 2 levels when there's no zone selector).
Any trailing crumb beyond that budget carries `breadcrumb__item--collapse` (and its leading
separator `breadcrumb__separator--collapse`); the `@container (max-width: 767px)` block hides
them, and the crumb that becomes last is promoted to the current-page colour. So Multizone
renders "Zone Selector > Level 1 > Level 2" at ≥768px and collapses to "Zone Selector >
Level 1" below it (Figma 4099:3630). The 2-item Default variant carries no `--collapse`
markers, so it is unaffected.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Wrapper (`CCTopNavigation`) | `.cc-top-navigation` (`<header>`) |
| `Breadcrumb` | Composes existing `.breadcrumb` (see `src/components/Breadcrumb/`) |
| `Top Nav Actions` | `.cc-top-navigation__actions` |
| `User` block | `.cc-top-navigation__user` |
| Portrait (ellipse4) | `.portrait` (existing Portraits component) |
| Username text | `.cc-top-navigation__user-name` |
| Chevron-down on user | `.cc-top-navigation__user-chevron` |
| `Desktop` (monitor icon) | `.cc-top-navigation__preview` |

---

## Token mapping

### Wrapper

| Property | Token |
|---|---|
| Background | `var(--cc-header-primary-bg)` (#0f3b53 in CC light) |
| Min height | `var(--ai-spacing-9)` (48px) |
| Padding (x) — desktop | `var(--ai-spacing-5)` (16px) |
| Padding (x) — mobile | `var(--ai-spacing-4)` (12px) — **added 2026-08-28** |
| Breadcrumb font — desktop | `var(--ai-font-fixed-xs)` (14px), from Breadcrumb's own CSS |
| Breadcrumb font — mobile | `var(--ai-font-fixed-2xs)` (13px) — **added 2026-08-28**, scoped override |
| Gap | `var(--ai-spacing-5)` (16px) |

### Breadcrumb (contextual override — dark bg)

| Element | Token | Notes |
|---|---|---|
| `.breadcrumb__link` | `var(--ai-text-invert-secondary)` | Inverted from default `--ai-text-secondary` |
| `.breadcrumb__link:hover` | `var(--ai-text-invert)` | Inverted from default `--ai-text-primary` |
| `.breadcrumb__dropdown` | `var(--ai-text-invert-secondary)` | Same as link |
| `.breadcrumb__dropdown:hover` | `var(--ai-text-invert)` | |
| `.breadcrumb__item--current` | `var(--ai-text-invert)` | Inverted from default `--ai-text-primary` |
| `.breadcrumb__separator` | `var(--ai-icon-invert-secondary)` | Inverted from default `--ai-icon-contrast` |

Case B contextual override per CLAUDE.md — scoped to `.cc-top-navigation .breadcrumb__*`,
does not modify the Breadcrumb component itself.

### User block

| Property | Token | Notes |
|---|---|---|
| Gap | `var(--ai-spacing-3)` (8px) | Between portrait and name |
| Portrait size | `var(--ai-spacing-7)` (32px) | **Figma uses 28px** — see Token gaps |
| Username font-family | `var(--ai-font-title)` | Inter |
| Username font-weight | `var(--ai-font-medium)` (500) | |
| Username font-size | `var(--ai-font-fixed-xs)` (14px) | |
| Username colour | `var(--ai-text-invert-secondary)` | |
| Username letter-spacing | `0.28px` | Optical — letter-spacing is a documented px exception |
| Username font-feature-settings | `'salt' 1` | Inter stylistic alternates |
| User chevron wrapper | `var(--ai-icon-size-lg)` (24px) | Click-target padding |
| User chevron icon | `var(--ai-icon-size-sm)` (16px) | |
| User chevron colour | `var(--ai-icon-invert-secondary)` | |

### Preview button (monitor icon)

| Property | Token |
|---|---|
| Size | `var(--ai-icon-size-md)` (20px) |
| Background | `transparent` |
| Border | none |
| Icon size | `var(--ai-icon-size-md)` (20px) |
| Icon colour | `var(--cc-header-icon)` |
| Icon colour (hover) | `var(--ai-text-invert)` |
| Transition | `color var(--ai-transition-default)` |

---

## Token gaps

| Gap | Figma value | Resolution |
|---|---|---|
| User portrait size | 28px | Approved: use `var(--ai-spacing-7)` (32px) — closest existing token. 4px larger than Figma. |
| Mobile container gap | 18px (Figma `--size-4-5`) | Approved: use `var(--ai-spacing-5)` (16px) for both desktop and mobile — token-clean and consistent. 2px deviation from Figma on mobile. |

---

## Interactions

| Element | Behaviour | Status |
|---|---|---|
| Zone Selector dropdown (Multizone) | Composes existing `Dropdown` component (`.dropdown` + `.dropdown__trigger` + `.dropdown__panel`). `Dropdown.js` auto-init handles open/close/click-outside/Escape. | **Wired** |
| User block (portrait + name + chevron) | Rendered as `<button>` with `aria-haspopup="true"` and `aria-label="User menu"` but the click handler is intentionally **not wired**. Per user direction: build visual chrome only, leave interaction TODO. | **Visual only** |
| Preview button (monitor icon) | Rendered as `<button aria-label="Preview as desktop">` for accessibility. Click handler is **not wired** — purpose pending designer confirmation. | **Visual only** |

---

## Responsive behaviour

`@media (max-width: 767px)`:
- `.cc-top-navigation__user-name` → `display: none`
- `.cc-top-navigation__user-chevron` → `display: none`

Result: mobile shows only the portrait in the User block. Preview button stays visible.

---

## Dependencies

- **Breadcrumb** (`src/components/Breadcrumb/`) — supplies the breadcrumb list / link /
  dropdown trigger CSS. CCTopNavigation supplies a contextual colour override only.
- **Dropdown** (`src/components/Dropdown/`) — required for Multizone (Zone Selector
  dropdown). Include both `Dropdown.css` and `Dropdown.js` on pages using this pattern.
- **Portraits** (`src/components/Portraits/`) — supplies the `.portrait` class for the
  user image.
- **Lucide** icons — `chevron-right` (breadcrumb separator), `chevron-down` (user
  chevron + breadcrumb dropdown chevron), `monitor` (preview button).

---

## History

- 2026-05-15: Initial pattern scaffold. Built from Figma component set `4099:3634`
  (CC Hybrid Design System). 4 variants (Default × Desktop, Multizone × Desktop,
  Default × Mobile, Multizone × Mobile) reduced to a single responsive HTML structure
  with `@media (max-width: 767px)` for mobile collapses. Token gaps documented:
  28px portrait → 32px, 18px mobile gap → 16px. Contextual override scoped to
  `.cc-top-navigation .breadcrumb__*` for invert colours on the dark navy bg.
