# CCHeader — Figma Notes

**Figma file:** [`ETKqleZdpertwFEo40YB5n`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4105-3641) (CC Hybrid Design System)
**Tier:** Pattern
**Component set node:** `4105:3641` (frame name `CCHeader`)
**Files:** `CCHeader.css`, `CCHeader.html`, `CCHeader.figma.ts`, `CCHeader.figma-notes.md`

---

## Variant matrix (verified from Figma `get_metadata` 2026-05-15)

Two axes: **Type** × **Device** = 6 variants.

| Node ID | Device | Type | Min-height | Title | Has avatar | Has user details |
|---|---|---|---|---|---|---|
| `4105:3640` | Desktop | Default | 64px | "Page name" (22px) | — | — |
| `4105:3638` | Desktop | Control | 64px | "Susan Kerrigan" (22px) | 48px | Affino, Lead Project Manager |
| `4105:3636` | Desktop | Sub Text | 64px | "Page name" (22px) + "Sub text" | — | — |
| `4105:3637` | Mobile | Default | 56px | "Page name" (16px) | — | — |
| `4105:3639` | Mobile | Control | 56px | "Susan Kerrigan" (16px) | 32px | hidden |
| `4105:3635` | Mobile | Sub Text | 56px | "Page name" (16px) + "Sub text" | — | — |

Mobile responsiveness is **container-query based** — the header is wrapped in
`.cc-header-cq` (`container: cc-header / inline-size`) and rules use
`@container cc-header (max-width: 767px)`, so it reflows on its own column width,
not the viewport. (The container must be a separate wrapper: an element cannot
query its own container — see `feedback_container_self_query_trap`.) Single HTML
structure collapses to mobile; no `--mobile` modifier class.

**Greeting prefix removed (per design direction):** Figma shows the desktop Control title
as "Hi Susan Kerrigan", but the "Hi " greeting prefix has been removed — the title shows the
name only. **Mobile content changes (Control):** the user details rows (Affino / Lead Project
Manager) hide on mobile via `.cc-header__user-details`.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Container-query wrapper | `.cc-header-cq` (`<div>`, wraps every `.cc-header`) |
| Wrapper (`CCHeader`) | `.cc-header` (`<header>`) |
| Type=Default | (base — no modifier) |
| Type=Sub Text | `.cc-header--sub-text` |
| Type=Control | `.cc-header--control` |
| `Tilte Block` (typo) | `.cc-header__title-block` |
| Title text column | `.cc-header__title-block-text` (used in Sub Text + Control) |
| `Title` | `.cc-header__title` (`<h1>`) |
| Subtitle ("Sub text") | `.cc-header__subtitle` (`<p>`) |
| `Avatars` | (wrapper omitted; portrait sits directly inside title-block) |
| `Female 1` | `.portrait` (existing Portraits component) |
| `User Details` | `.cc-header__user-details` |
| `Item` (icon + label) | `.cc-header__user-item` (`<span>`) |
| `Actions` | `.cc-header__actions` |
| `Notification` | NotificationBadge component (composed) |
| Button (Edit / Add / Logout / View Site) | `.btn.btn--secondary` / `.btn.btn--primary` (Button) |
| Button label text wrapper | `.cc-header__btn-label` (`<span>`, hidden on mobile) |
| `Icon/24px/EllipsisVertical` | `.cc-header__kebab` (`<button>`) wrapping a Dropdown |

---

## Token mapping

### Wrapper

| Property | Desktop | Mobile |
|---|---|---|
| Background | `var(--cc-header-secondary-bg)` | (same) |
| Min-height | `var(--ai-spacing-11)` (64px) | `var(--ai-spacing-10)` (56px) |
| Padding | `var(--ai-spacing-5)` (16px) | `var(--ai-spacing-3) var(--ai-spacing-4)` (8px / 12px) |

### Title

| Property | Desktop | Mobile |
|---|---|---|
| Font-family | `var(--ai-font-title)` | (same) |
| Font-weight | `var(--ai-font-bold)` (700) | (same) |
| Font-size | `var(--ai-font-fixed-xl)` (22px) | `var(--ai-font-fixed-sm)` (16px) |
| Line-height | `1` | `1.1` (Control only) |
| Colour | `var(--ai-text-primary)` | (same) |
| Letter-spacing | `var(--ai-tracking-3)` | (same) |
| Font-feature-settings | `'calt' 0` | (same) |

### Subtitle

| Property | Token |
|---|---|
| Font-family | `var(--ai-font-body)` |
| Font-weight | `var(--ai-font-medium)` |
| Font-size | `var(--ai-font-fixed-xs)` (14px) |
| Line-height | `var(--ai-leading-sm)` (20px) |
| Colour | `var(--ai-text-contrast)` |
| Letter-spacing | `var(--ai-tracking-4)` |

### Actions cluster

| Property | Desktop | Mobile |
|---|---|---|
| Gap (Default / Sub Text) | `var(--ai-spacing-3)` (8px) | `var(--ai-spacing-2)` (6px) |
| Gap (Control) | `var(--ai-spacing-3)` (8px) | `var(--ai-spacing-1)` (4px) |

### Mobile button collapse

Buttons inside `.cc-header__actions` collapse to icon-only 32×32 squares on mobile via:

```css
@container cc-header (max-width: 767px) {
  .cc-header__actions .btn {
    padding: 0;
    width: var(--ai-spacing-7); /* 32px */
    min-height: var(--ai-spacing-7);
    gap: 0;
  }
  .cc-header__actions .cc-header__btn-label { display: none; }
}
```

This mirrors the Figma Mobile variants where Edit/Add/Logout/View Site all become 32px
square icon-only buttons.

### Control variant — title-block layout

| Property | Desktop | Mobile |
|---|---|---|
| `title-block` gap (avatar → text) | `var(--ai-spacing-4)` (12px) | `var(--ai-spacing-3)` (8px) |
| `title-block-text` gap (title → details) | `var(--ai-spacing-3)` (8px) | (n/a — details hidden) |
| Portrait size | `var(--ai-spacing-9)` (48px) | `var(--ai-spacing-7)` (32px) |
| User details gap | `var(--ai-spacing-5)` (16px) | (n/a — details hidden) |
| User item gap (icon → text) | `var(--ai-spacing-2)` (6px) | (n/a) |

### Kebab

| Property | Token |
|---|---|
| Size | `var(--ai-icon-size-lg)` (24px) |
| Background | `transparent` |
| Border | none |
| Icon colour | `var(--ai-icon-secondary)` |
| Icon colour (hover) | `var(--ai-text-primary)` |
| Icon size | `var(--ai-icon-size-lg)` (24px) |

---

## Token gaps

| Gap | Figma value | Resolution |
|---|---|---|
| Notification badge red | Red 500 (#ef4444) | Use `--ai-surface-error` (Red 600). See NotificationBadge figma-notes. |

No additional CCHeader-specific gaps — all sizes and tokens map cleanly via the existing
`--ai-spacing-*`, `--ai-font-*`, `--ai-tracking-*` scale.

---

## Interactions

| Element | Behaviour | Status |
|---|---|---|
| NotificationBadge bell | `<button>` with `aria-label`. Click handler not wired (consumer's responsibility). | Visual only |
| Edit / Add / Logout / View Site buttons | Standard `<button>` actions. Click handlers not wired. | Visual only |
| Kebab menu | Wrapped as `<button class="cc-header__kebab dropdown__trigger">` inside a `.dropdown`. Composes existing Dropdown component for the overflow menu. `Dropdown.js` handles open/close. | **Wired** |

---

## Responsive behaviour

`@container cc-header (max-width: 767px)`:
- Wrapper min-height: 64px → 56px
- Wrapper padding: 16px → 8px/12px (vert/horiz)
- Title font-size: 22px → 16px
- Actions gap: 8px → 6px (or 4px on Control)
- Buttons in `.cc-header__actions`: text labels hide, buttons become 32px square (icon-only)
- Control variant:
  - title-block gap shrinks to 8px
  - Portrait shrinks to 32px
  - `.cc-header__user-details` hides (Affino / Lead Project Manager)
  - title line-height becomes 1.1

---

## Dependencies

- **NotificationBadge** (`src/components/NotificationBadge/`) — supplies the bell + badge.
- **Button** (`src/components/Button/`) — supplies Edit / Add / Logout / View Site styling.
- **Dropdown** (`src/components/Dropdown/`) — required for the kebab overflow menu.
  Include both `Dropdown.css` and `Dropdown.js` on pages using this pattern.
- **Portraits** (`src/components/Portraits/`) — supplies the `.portrait` class for the
  Control variant avatar.
- **Lucide** icons — `bell`, `pencil`, `plus`, `log-out`, `external-link`,
  `ellipsis-vertical`, `building`, `briefcase-business`.

---

## History

- 2026-05-15: Initial pattern scaffold. Built from Figma component set `4105:3641`
  (CC Hybrid Design System). 6 variants (3 Types × 2 Devices) reduced to a single
  responsive HTML structure with `@container cc-header (max-width: 767px)` for mobile collapses.
  Content changes on mobile Control (greeting / user details hidden) handled with
  scoped class hides. Buttons in `.cc-header__actions` collapse from full-text to
  icon-only 32px square on mobile via the documented Mobile child-component sizing
  pattern.
