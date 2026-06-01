# ControlScreen — Figma Notes

## Figma Node

- **File:** [Affino CC Hybrid – Design System](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System) — file key `ETKqleZdpertwFEo40YB5n`
- **Component set:** `4187:21254` — *Control Screen*
- **Tier:** Template
- **Brand context:** `data-brand="cc"` on `<html>` activates CC palette tokens

### Variant matrix

| Node | Type | Device | Code mapping |
|---|---|---|---|
| 4187:21253 | Menu Open | Desktop | Default state on page load — Control panel docked open via `data-cc-target="control"` rail button carrying `cc-sidebar__btn--active` and the matching panel `aria-hidden="false"`. |
| 4187:21249 | Menu Collapsed | Desktop | User clicks the active rail button again → SidebarMenu collapses to rail-only. Handled by existing `sidebar-menu.js`. |
| 4187:21247 | Menu Open | Mobile | User taps a rail icon → menu panel slides in as overlay over the page content. Handled by existing `sidebar-menu.js`. |
| 4187:21248 | Menu Collapsed | Mobile | Default mobile state — rail-only, no panel docked. |

## Composed components

ControlScreen owns **only the app-shell layout**. Every visual block is rendered by an existing component or pattern via its own CSS:

| Source | Role in ControlScreen |
|---|---|
| `src/cc/patterns/SidebarMenu/` + `sidebar-menu.js` | Left app rail + menu panel. Desktop + Mobile composites both included in DOM, swapped via `@media (max-width: 767px)`. Both auto-bind on DOMContentLoaded. |
| `src/cc/patterns/HeaderGroup/` (composes `TopNavigation` + `Header`) | Top chrome. Uses the `cc-header--control` modifier — greeting + Logout/View Site CTAs. |
| `src/components/Alert/` (`alert--cta` + `alert--warning`) | Development-mode banner with Switch Mode CTA. |
| `src/patterns/StatCard/` × 2 | "Key Features" + "Help Guides" cards in the 3-col row. |
| `src/patterns/UpgradeCard/` | Version + Update CTA — third cell of the 3-col row. |
| `src/components/Select/` (`sel sel__control--sm`) | "Select Zone" dropdown. |
| `src/patterns/Chart/` × 2 + Chart.js CDN | "Page Views" (multi-line) + "Users" (single-line area). |
| `src/components/Datatables/` (Whos Online variant — base `.datatables`, no `--mobile-scroll`) | Members table. `--mobile-scroll` modifier is for fixed-width mobile mockups and pins `max-width: 24rem`; base `.datatables` fills 100% of its container and the inner `.datatables__body` auto-scrolls horizontally when the table is wider than the viewport. |

Transitive deps loaded via `<link>`: Button, Breadcrumb, Dropdown, DropdownItem, Portraits, Avatar, NotificationBadge, Toggle, ThemeToggle, Input, Table, MainMenuItem.

## CSS Class Mapping

Template-owned classes only (every other class belongs to a composed component):

| Class | Role |
|---|---|
| `.control-screen` | Body root. `display: flex; height: 100vh`. |
| `.control-screen__sidebar` | Wrapper for a SidebarMenu composite. `flex: 0 0 auto; height: 100vh`. |
| `.control-screen__sidebar--desktop` | Visible at ≥768px. |
| `.control-screen__sidebar--mobile` | Visible at <768px. |
| `.control-screen__main` | Flex column filling remainder. `overflow: hidden`. |
| `.control-screen__chrome` | Sticky-equivalent top band hosting `cc-header-group`. |
| `.control-screen__page` | Scroll container. `flex: 1 1 auto; overflow-y: auto`. |
| `.control-screen__cards` | 3-col → 1-col grid. UpgradeCard `order: -1` at mobile. |
| `.control-screen__zone-row` | Select Zone + Analysis Dashboard link, space-between. |
| `.control-screen__analysis-link` | Right-side text link (brand colour + arrow icon). Two copies in the DOM — `--desktop` (inside `.control-screen__zone-row`, visible ≥768px) and `--mobile` (standalone block after `.control-screen__charts`, visible <768px), matching the Figma's mobile placement (between charts and Whos Online). |
| `.control-screen__charts` | 2-col → 1-col grid for Chart cards. |
| `.control-screen__section` | Wrapper frame: section heading + section body. |
| `.control-screen__section-head` | Flex row: title left, meta right (stacks on mobile). |
| `.control-screen__section-title` | h2 — "Who's Online". |
| `.control-screen__section-meta` | Subtitle — "78 Members Online (…)". |

## Token Mapping

The template introduces no new tokens. Tokens used at template scope:

| Token | Where |
|---|---|
| `--ai-surface-secondary` | `.control-screen` body bg |
| `--ai-surface-primary` | `.control-screen__chrome` bg |
| `--ai-border-secondary` | `.control-screen__chrome` bottom border |
| `--ai-spacing-7` | Default page padding + gap (desktop) |
| `--ai-spacing-5` | Card row gap + mobile page padding/gap |
| `--ai-spacing-6` | Charts row gap |
| `--ai-spacing-4` | Section head gap |
| `--ai-spacing-2` | Mobile section head gap, link icon gap |
| `--ai-font-body` / `--ai-font-title` | Body / title font families |
| `--ai-font-fluid-lg` | Section heading size |
| `--ai-font-fixed-xs` | Section meta line size |
| `--ai-font-fixed-sm` + `--ai-font-semibold` | Analysis Dashboard link |
| `--ai-text-primary` / `--ai-text-contrast` / `--ai-text-brand` | Text colours |

## Token Gaps

None at template scope. Composed components carry their own approved gaps (see each component's `figma-notes.md`).

## JS / Interactivity

| Script | Role | Binding |
|---|---|---|
| `src/cc/patterns/SidebarMenu/sidebar-menu.js` | Rail-button → panel toggle, hover-flyout (desktop), mobile ellipsis expand, search filter, MainMenuItem submenu toggle, CRM "show more" toggle. | Auto-binds every `.cc-sidebar-menu` on DOMContentLoaded — both composites bind independently. |
| Chart.js (CDN) | Renders the two chart canvases. | Inline init in the template footer. |
| Lucide (CDN) | Icon rendering. | `lucide.createIcons()` after load. |
| `dark-mode-toggle.js` | Wires the `data-theme` toggle if any UI surfaces it. | Auto-init from head script. |

No new JS module is authored by the template.

## Notes

- **Default state on load:** the Desktop SidebarMenu has the Control panel docked open (`Menu Open` Desktop variant). Mobile defaults to rail-only (`Menu Collapsed` Mobile variant). These align with the four Figma variants.
- **Responsive breakpoint:** template-level layout reflow uses **`@container cs-page (max-width: 767px)`** — the page reacts to the actual content column's width, not the viewport. This matters because the docked SidebarMenu (rail + 280px panel ≈ 336px) can shrink the main column below 768px on a wide screen, and the page should still reflow.
- **Device-class swap stays on `@media`:** which SidebarMenu composite (`--desktop` vs `--mobile`) is rendered is a device-class decision (the mobile rail has structurally different children — Ellipsis-toggled extras), so the swap is keyed off viewport `@media (max-width: 767px)`. Even when the desktop column shrinks to <768px because its own menu panel is docked, the desktop rail stays.
- **Sidebar composite swap:** Desktop and Mobile SidebarMenu composites are both in the DOM with unique panel IDs (`cc-d-*` vs `cc-m-*`) so the auto-bound JS doesn't clash; CSS shows one and hides the other based on viewport.
- **Mobile content order:** UpgradeCard precedes the two StatCards on mobile per Figma (visible in `cs-mobile-collapsed.png`). Implemented via `order: -1` on `.control-screen__cards .upgrade-card` so the HTML order stays semantic.
- **No component CSS overrides:** the template uses every composed component verbatim with no scoped customisations. Future Figma changes to any composed component will surface here automatically.
- **Demo content sourcing:** every block reuses copy from its own demo for now — to be amended later with Figma-faithful labels (Susan Kerrigan / Maria Mellor / 78 Members / Version 8.0.33.10 etc. already match; chart numbers + StatCard icon choice may be refined).

## Known limitations (composed-component carryover)

- **Composed components still use viewport `@media`, not the container.** The template's own reflow is container-query driven, but every composed pattern it embeds (`alert`, `cc-top-navigation`, `cc-header` with `--control`, `Datatables`) carries its own internal `@media (max-width: 767px)` blocks. Those react to viewport width only. Practical effect: in a narrow-column-but-wide-viewport scenario (e.g. desktop with the menu panel docked) the template grids correctly stack to one column, but the embedded components stay in desktop dress — Alert keeps its CTA inline (not stacked under the message), `cc-header--control` keeps the "Hi" prefix and full button labels, Datatables keeps its full-width toolbar gap. Fully container-aware behaviour would require each component's `@media` blocks to be refactored to `@container` — a separate sweep, outside this template build.
- **StatCard icon-wrap colour does not theme to CC brand.** `StatCard.css` hardcodes the icon-square background to `#2563eb` (Blue/600 primitive, user-approved gap on the StatCard build). Figma's Control Screen renders the same square in a CC teal hue. Fixing this needs a StatCard-side change (replace the primitive with a `--ai-surface-brand`-aware token or introduce a `[data-brand="cc"]` override) — out of scope for the template build. Flagged here so the next StatCard review can address.
- **Select label-above-control on mobile.** Figma mobile shows the Select Zone label INLINE with the dropdown (label-left, control-right on the same row). The current Select component renders label above control. Matching the Figma exactly would require overriding the Select layout — kept default per "use built versions, no deviating".
