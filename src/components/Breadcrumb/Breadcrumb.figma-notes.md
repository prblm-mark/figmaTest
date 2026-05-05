# Breadcrumb — Figma Notes

**Figma:** [`node 2580:11309`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2580-11309) (frame is mislabelled "Numbered List" in Figma — the variants are clearly breadcrumb patterns)
**Tier:** Component
**Files:** `Breadcrumb.css`, `Breadcrumb.html`, `Breadcrumb.figma.ts`, `Breadcrumb.figma-notes.md`

---

## Variant matrix (verified from Figma `get_metadata` 2026-05-05)

Single Type axis, 4 variants:

| Type | Node ID | Description |
|---|---|---|
| Default | 2580:11308 | Text-only crumbs (e.g. "Affino > Solutions > For Event Organisers") |
| Home Icon | 2580:11306 | First crumb is a home icon, then text crumbs |
| Solid Background | 2580:11307 | Same as Home Icon, wrapped in a soft-bg / bordered pill container |
| Dropdown | 2580:11305 | Home icon + dropdown-trigger items (text + chevron-down) + final current page |

No State, Size, or Device axis.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| `Type=Default` | (no modifier — base `.breadcrumb`) |
| `Type=Home Icon` | (no modifier — first child is `.breadcrumb__link--home`) |
| `Type=Solid Background` | `.breadcrumb--solid` |
| `Type=Dropdown` | (no modifier — middle items use `.breadcrumb__dropdown` instead of `.breadcrumb__link`) |
| `List Item` (text crumb) | `.breadcrumb__item` containing `.breadcrumb__link` |
| `List Item` (current page, semibold) | `.breadcrumb__item.breadcrumb__item--current` (with `aria-current="page"`) |
| `List Item` (chevron-right separator) | `.breadcrumb__separator` (with `aria-hidden="true"`) |
| `Link - Home` | `.breadcrumb__link.breadcrumb__link--home` |
| `Button` (dropdown trigger) | `.breadcrumb__dropdown` (`<button type="button" aria-haspopup="menu">`) |

---

## Token mapping

### Typography (all link / current items)

| Property | Token |
|---|---|
| font-family | `var(--ai-font-title)` |
| font-size | `var(--ai-font-fixed-xs)` (14px) |
| line-height | `var(--ai-leading-md)` (24px) |
| font-weight (link) | `var(--ai-font-medium)` |
| font-weight (current) | `var(--ai-font-semibold)` |
| color (link) | `var(--ai-text-secondary)` |
| color (link hover) | `var(--ai-text-primary)` |
| color (current) | `var(--ai-text-primary)` |

### Layout

| Property | Token |
|---|---|
| List gap | `var(--ai-spacing-2)` (6px) |
| Item height | `var(--ai-leading-md)` (24px — matches text line-height) |

### Icons

| Icon | Lucide name | Size token | Colour token |
|---|---|---|---|
| Separator | `chevron-right` | `--ai-icon-size-sm` (16px) | `--ai-icon-contrast` |
| Home | `house` | `--ai-icon-size-sm` (16px) | `--ai-icon-secondary` |
| Dropdown trigger | `chevron-down` | `--ai-icon-size-sm` (16px) | `currentColor` (inherits the button's text-secondary; see Token gap notes) |

### Type=Solid Background container

| Property | Token |
|---|---|
| background-color | `var(--ai-surface-minimal)` |
| border | `1px solid var(--ai-border-secondary)` |
| border-radius | `var(--ai-radius-md)` (8px) |
| padding | `var(--ai-spacing-3) var(--ai-spacing-5)` (8px 16px) |

The padding/bg/border live on the inner `.breadcrumb__list` (the `<ol>`) so the
`<nav>` itself stays a transparent inline-block. This keeps the chrome scoped to the visible
list without affecting external siblings.

---

## Token gap notes

| Item | Figma binding | Resolution |
|---|---|---|
| Dropdown chevron-down colour | No explicit Figma variable bound to the chevron-down icon (variable defs on the icon node return empty). | Used `currentColor` so it inherits from the dropdown button's `--ai-text-secondary`. Visually matches the text and adjusts on hover with the button. Worth raising with the designer. |
| Frame name | Figma frame is named "Numbered List" — clearly the wrong name for what is structurally a breadcrumb pattern. | Component code-named `Breadcrumb` per established convention. Worth raising with the designer to rename the Figma frame. |

No primitive Tailwind colours used. No hardcoded px / hex values (border widths stay 1px per the project rule).

---

## Sub-elements

| Element | Class | Notes |
|---|---|---|
| Wrapper | `<nav class="breadcrumb">` | `aria-label="Breadcrumb"`. Optional `--solid` modifier. |
| List | `<ol class="breadcrumb__list">` | Holds the `<li>` items. Solid bg lives on this element. |
| Item (link) | `<li class="breadcrumb__item"><a class="breadcrumb__link">…</a></li>` | Default state. |
| Item (home) | `<li class="breadcrumb__item"><a class="breadcrumb__link breadcrumb__link--home" aria-label="Home"><i data-lucide="house"></i></a></li>` | First crumb in Home Icon / Solid Background / Dropdown variants. |
| Separator | `<li class="breadcrumb__separator" aria-hidden="true"><i data-lucide="chevron-right"></i></li>` | Between every item. Hidden from screen readers. |
| Current page | `<li class="breadcrumb__item breadcrumb__item--current" aria-current="page">…</li>` | No `<a>` — non-interactive. Last item only. |
| Dropdown trigger | `<div class="dropdown"><button class="breadcrumb__dropdown dropdown__trigger" aria-haspopup="menu" aria-expanded="false">…<i data-lucide="chevron-down"></i></button><div class="dropdown__panel" role="menu">…</div></div>` | Used in Type=Dropdown for items 2..n-1. Composes the Dropdown component for behaviour; the breadcrumb only contributes the trigger visual style. |

---

## Interaction model

- **Links and home icon:** standard `<a>` navigation. Hover changes colour from
  `text-secondary` → `text-primary` via `--ai-transition-default`.
- **Current page:** non-interactive — rendered as plain text inside the `<li>` with
  `aria-current="page"`. No href, no hover.
- **Dropdown triggers:** rendered as `<button type="button" class="breadcrumb__dropdown
  dropdown__trigger" aria-haspopup="menu" aria-expanded="false">` wrapped in
  `<div class="dropdown">` with a sibling `<div class="dropdown__panel" role="menu">`. The
  Breadcrumb supplies the visual style via `.breadcrumb__dropdown`; the Dropdown component
  supplies the open/close behaviour, panel positioning, click-outside, Escape handling, and
  chevron rotation via the `.dropdown__trigger` hook. Breadcrumb ships no JS of its own —
  `Dropdown.js` (auto-init on `DOMContentLoaded`) manages all interaction. Hover styling
  (`text-secondary → text-primary`) lives on `.breadcrumb__dropdown`; rotation
  (`chevron-down` 180°) is provided by Dropdown's `[aria-expanded="true"]` rule.

---

## Accessibility

- Wrapper is `<nav aria-label="Breadcrumb">` so screen-reader users get a clear landmark.
- Separators are decorative — `<li aria-hidden="true">` and the icons inside have no
  accessible name (no `aria-label` on the `<i>`). They are not announced.
- Current page uses `aria-current="page"` instead of being a link, signalling "this is where
  you are."
- Home icon link has `aria-label="Home"` since it has no visible text.
- Dropdown triggers have `aria-haspopup="menu"`. When wired to a real dropdown component the
  consumer should also manage `aria-expanded` and `aria-controls` on the button.

---

## Dependencies

- **Dropdown** (`src/components/Dropdown/`) — composed by the Type=Dropdown variant. The
  breadcrumb dropdown trigger uses both `.breadcrumb__dropdown` (visual) and
  `.dropdown__trigger` (behaviour hook). Pages using Type=Dropdown must include
  `Dropdown.css` and `Dropdown.js`.
- Lucide icons (`chevron-right`, `house`, `chevron-down`) — included via the page's existing
  Lucide setup.

---

## History

- 2026-05-05: First Figma-verified spec. `get_metadata` on component set `2580:11309` enumerated
  all 4 Type variants; `get_design_context` on each variant resolved tokens; targeted
  `get_variable_defs` on the separator (`2580:11172`) and home icon (`2580:11192`) nodes
  pinpointed `--ai-icon-contrast` vs `--ai-icon-secondary` respectively. The dropdown chevron
  icon node had no token binding — fell back to `currentColor` (documented in Token gap notes).
