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
| 4187:21247 | Menu Open | Mobile | User taps a rail icon → `sidebar-menu.js` un-hides the panel; below 768px the panel is lifted out of flow (`position: absolute; left: 100%`) so it **overlays** `.cc-control__main` instead of widening the rail and pushing content aside (the desktop docked behaviour). Rail stays in flow at the left. |
| 4187:21248 | Menu Collapsed | Mobile | Default mobile state — rail-only, no panel docked. |

## Composed components

ControlScreen owns **only the app-shell layout**. Every visual block is rendered by an existing component or pattern via its own CSS:

| Source | Role in ControlScreen |
|---|---|
| `src/cc/patterns/SidebarMenu/` + `sidebar-menu.js` | Left app rail + menu panel. Desktop + Mobile composites both included in DOM, swapped via `@media (max-width: 767px)`. Both auto-bind on DOMContentLoaded. |
| `src/cc/patterns/HeaderGroup/` (composes `TopNavigation` + `Header` + `IconNavigation`) | Top chrome. Uses the `cc-header--control` modifier — greeting + Logout/View Site CTAs. **IconNavigation strip** (Type=IconNavigation) sits between TopNavigation and Header, hidden by default; the User Menu "Icon Navigation" toggle (`data-cc-toggle="icon-nav"`) shows it via `HeaderGroup.js`, "Hide Labels" switches it to icons-only. Always hidden below 768 of the header-group's width (`@container cc-header-group`). |
| `src/components/Alert/` (`alert--cta` + `alert--warning`) | Development-mode banner with Switch Mode CTA. |
| `src/patterns/StatCard/` × 2 (`stat-card--number-first`) | "Key Features" + "Help Guides" cards in the 3-col row. Number First type — the bold label (`__value`) sits above the muted description (`__title`). |
| `src/patterns/UpgradeCard/` | Version + Update CTA — third cell of the 3-col row. |
| `src/components/Select/` (`sel sel__control--sm`) | "Select Zone" dropdown. |
| `src/patterns/Chart/` × 2 + Chart.js CDN | "Page Views" (multi-line) + "Users" (single-line area). |
| `src/components/Datatables/` (Whos Online — **two instances swapped at the cs-page breakpoint**) | Members table. **Desktop** (`.cc-control__table--desktop`, ≥768px): Whos Online · Scroll — 4 columns (User, Account, Login, Touch). **Mobile** (`.cc-control__table--mobile`, <768px): Whos Online · **Trigger** — User + Login + a kebab that expands a detail row holding Account + Touch (Figma mobile node `4183:14675` / instance `4183:14681`, component variant `2764:2980`). Both instances are in the DOM; `@container cs-page (max-width: 767px)` hides one and shows the other — the same device-swap pattern as the SidebarMenu composites. Scroll↔Trigger is a markup-level variant (different DOM), not a CSS toggle, so each is a verbatim use of its component variant rather than one responsive markup. Kebab reveal is pure CSS (`:has(.datatables__kebab__input:checked)`). |
| `src/cc/patterns/ActionsMenu/` | Full-height right-edge action rail (Figma node `4167:4879`, docked at `left: 1340px` of the 1396px Desktop frame). Wrapped in `.cc-control__actions` as the rightmost flex child of `.cc-control`. **Desktop only** — `display: none` below 768px (device-class swap, like the sidebar). |

Transitive deps loaded via `<link>`: Button, Breadcrumb, Dropdown, DropdownItem, Portraits, Avatar, NotificationBadge, Toggle, ThemeToggle, Input, Table, MainMenuItem, IconNavigation. JS: `HeaderGroup.js` (Icon Navigation toggle wiring).

## CSS Class Mapping

Template-owned classes only (every other class belongs to a composed component):

| Class | Role |
|---|---|
| `.cc-control` | Body root. `display: flex; height: 100vh`. |
| `.cc-control__sidebar` | Wrapper for a SidebarMenu composite. `flex: 0 0 auto; height: 100vh`. |
| `.cc-control__sidebar--desktop` | Visible at ≥768px. |
| `.cc-control__sidebar--mobile` | Visible at <768px. Its `.cc-menu` panel is `position: absolute; left: 100%` so the open menu overlays the page content rather than pushing it. |
| `.cc-control__main` | Flex column filling remainder. `overflow: hidden`. |
| `.cc-control__chrome` | Sticky-equivalent top band hosting `cc-header-group`. |
| `.cc-control__page` | Scroll container. `flex: 1 1 auto; overflow-y: auto`. |
| `.cc-control__cards` | 3-col → 1-col grid. UpgradeCard `order: -1` at mobile. |
| `.cc-control__panel` | Single bordered card (`--ai-datatable-table-border`, `radius-md`, `overflow:hidden`) wrapping the header bar + chart row — Figma node `4186:21107`. |
| `.cc-control__panel-head` | Header bar inside the panel: Select Zone (left) + Analysis Dashboard button (right), `padding: spacing-4 spacing-5`, `border-bottom` divider — Figma node `4186:21108`. Stacks to a column below 768px. |
| `.cc-control__dash-btn` | Analysis Dashboard control — a `btn btn--secondary` with a scoped borderless override (Case B contextual override, Figma node `4186:21110`). Rendered as `<a>` for navigation; trailing `arrow-right` only. Two copies in the DOM — `--desktop` (inside `.cc-control__panel-head`, visible ≥768px) and `--mobile` (inside `.cc-control__panel` as its last child, below the charts, centered, visible <768px — matches Figma mobile `4183:14668` where the button sits inside the card). |
| `.cc-control__charts` | 2-col → 1-col grid for Chart cards, inside the panel. `padding: spacing-5; gap: spacing-5` — Figma node `4186:21111`. Mobile (<768px, Figma `4183:14673`): chart card padding tightens to `spacing-4` and `.chart__big` title drops to `--ai-font-fixed-sm` (16px), both scoped here so the shared Chart pattern is unaffected. |
| `.cc-control__actions` | Wrapper for the right-edge ActionsMenu rail; rightmost flex child of `.cc-control`, full-height, `display: none` below 768px. |
| `.cc-control__section` | Wrapper frame: section heading + section body. |
| `.cc-control__section-head` | Flex row: title left, meta right (stacks on mobile). |
| `.cc-control__section-title` | h2 — "Who's Online". Bold (`--ai-font-bold`). |
| `.cc-control__section-meta` | Subtitle — "78 Members Online (…)" at `--ai-font-fixed-xxs`. The count is wrapped in `.cc-control__section-meta-strong` (bold, `--ai-text-primary`), inline with the guest/bot breakdown. |

## Token Mapping

The template introduces no new tokens. Tokens used at template scope:

| Token | Where |
|---|---|
| `--ai-surface-secondary` | `.cc-control` body bg |
| `--ai-surface-primary` | `.cc-control__chrome` bg |
| `--ai-border-secondary` | `.cc-control__chrome` bottom border |
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
| `src/cc/patterns/HeaderGroup/HeaderGroup.js` | User Menu "Icon Navigation" / "Hide Labels" toggles → show/hide the IconNavigation strip. | Document-delegated. |
| `src/components/Alert/Alert.js` | Alert close icon (`.alert__close`) removes the alert. | Document-delegated. |

No new JS module is authored by the template.

## Notes

- **Default state on load:** the Desktop SidebarMenu has the Control panel docked open (`Menu Open` Desktop variant). Mobile defaults to rail-only (`Menu Collapsed` Mobile variant). These align with the four Figma variants.
- **Responsive breakpoint:** template-level layout reflow uses **`@container cs-page (max-width: 767px)`** — the page reacts to the actual content column's width, not the viewport. This matters because the docked SidebarMenu (rail + 280px panel ≈ 336px) can shrink the main column below 768px on a wide screen, and the page should still reflow.
- **Device-class swap stays on `@media`:** which SidebarMenu composite (`--desktop` vs `--mobile`) is rendered is a device-class decision (the mobile rail has structurally different children — Ellipsis-toggled extras), so the swap is keyed off viewport `@media (max-width: 767px)`. Even when the desktop column shrinks to <768px because its own menu panel is docked, the desktop rail stays.
- **Sidebar composite swap:** Desktop and Mobile SidebarMenu composites are both in the DOM with unique panel IDs (`cc-d-*` vs `cc-m-*`) so the auto-bound JS doesn't clash; CSS shows one and hides the other based on viewport.
- **Alert + cards share a container:** per Figma Frame 229 (node `4183:14662`) the dev-mode Alert and the three-card row sit inside one wrapper (`.cc-control__alert-cards`), stacked with a `--ai-spacing-5` (16px) gap — tighter than the `--ai-spacing-7` (32px) gap between other top-level blocks in `.cc-control__page`.
- **Mobile content order:** UpgradeCard precedes the two StatCards on mobile per Figma (visible in `cs-mobile-collapsed.png`). Implemented via `order: -1` on `.cc-control__cards .upgrade-card` so the HTML order stays semantic.
- **Card size is container-responsive:** both StatCards and the UpgradeCard render at **base** size by default (mobile / narrow column) and upgrade to the **Lg** size variant at `@container cs-page (min-width: 768px)`. Because a component size modifier (`--lg`) can't be toggled by CSS, the min-width block in `ControlScreen.css` mirrors the `.stat-card--lg` / `.upgrade-card--lg` rules exactly (same `--ai-*` tokens) rather than adding the class in markup. This keeps the base/mobile size as the safe no-CQ fallback.
- **Mobile-only StatCard type sizing:** in `@container cs-page (max-width: 767px)` the StatCard text steps down — `__value` 16px → `--ai-font-fixed-xs` (14px), `__title` 14px → `--ai-font-fixed-xxs` (12px). This is a template override (the StatCard component keeps 16/14 at all sizes); standard sizes return at ≥768px where the block no longer applies.
- **Scoped component CSS overrides:** template-scoped customisations are limited to the card row — the container-query card-size block, the mobile-only StatCard font sizing, the per-card teal icon-square colours, and the `.cc-control__alert-cards` wrapper. Every composed component is otherwise used verbatim, so future Figma changes to any of them surface here automatically.
- **Demo content sourcing:** every block reuses copy from its own demo for now — to be amended later with Figma-faithful labels (Susan Kerrigan / Maria Mellor / 78 Members / Version 8.0.33.10 etc. already match; chart numbers + StatCard icon choice may be refined).

## Contextual overrides (Case B) — chrome dropdowns

The CC `TopNavigation.css` sets `overflow: hidden` on `.cc-top-navigation`, which clips dropdown panels (Zone Selector breadcrumb + User Menu) trying to extend downward from the bar. The HeaderGroup demo handles this with its `.demo-frame--dropdown` scoped overrides; the template replicates the same three rules:

```css
.cc-control__chrome .cc-top-navigation { overflow: visible; }
.cc-control__chrome .dropdown__panel { z-index: 20; }
.cc-control__chrome .cc-top-navigation__actions .dropdown__panel {
  left: auto;
  right: 0;
}
```

`.cc-control__main` has no `overflow: hidden` for the same reason (would clip the chrome's dropdowns into the page area).

## Contextual overrides (Case B) — Alert

The CC ControlScreen instance of the Warning CTA Alert (Figma `4168:5316`) applies two overrides vs the base Alert component:

1. **Alert left icon = `info`** (Lucide), not `alert-triangle`. Figma binds `Icon/24px/Info` on the warning CTA. Applied inline in the template's HTML by setting `data-lucide="info"`.
2. **Switch Mode button has no leading icon.** The base Button has icon slots; this instance clears the icon-left/icon-right. Applied by omitting the `<i data-lucide="…">` element from the button markup.

Both are HTML-only overrides — no new CSS in `ControlScreen.css`.

## Known limitations (composed-component carryover)

- **StatCard icon-wrap colour — overridden per-card in the template.** The component default is `#2563eb` (Blue/600, user-approved gap on the StatCard build), but Figma's Control Screen (node `4183:14664`) renders the two squares in CC teal hues: card 1 = `teal/500` (#14b8a6), card 2 = `muted-teal/600` (#3391a4). These are scoped overrides in `ControlScreen.css` (`.cc-control__cards .stat-card:nth-of-type(n) .stat-card__icon-wrap`). Both are Figma primitives with no `--ai-*` token — used on explicit instruction, with primitive-citing comments. A future StatCard-side brand-aware token could replace these.
- **Icons:** card 1 uses Lucide `spotlight` ("Key Features", Figma `Icon/24px/Spotlight`); card 2 uses `file-question-mark` ("Help Guides").
- **Select uses the Label Left variant.** Figma shows the Select Zone label INLINE with the dropdown (label-left, control-right on the same row), at all breakpoints. This is the formal `Type=Label Left` Select variant (`2755:2337`) — now implemented as `.sel.sel--label-left` with a `.sel__field` wrapper around the control + menu. The Select container grows to `max-width: var(--ai-size-5)` (280px) per the Figma instance (`flex:1 0 0; max-width:280px`). The dropdown is interactive (zone options: Affino, Staging, Production, Development, Sandbox) — wired by the shared `Select.js` module (open on click, choose option, close on click-outside / Esc) — the same behaviour the Select demo uses.

## AI Assistant panel (rail-triggered, initial-state view only)

The right-rail **AI Assistant** button (sparkles icon, `data-cc-ai-toggle`) opens the
floating `AiAssistant` panel (`src/cc/templates/AiAssistant/`). Per product decision
(2026-06-03) only the **initial-state view** is mounted here — the processing and response
states (ChatMain state machine + GSAP animations) are demo-only and stay on the standalone
AiAssistant page. So no `ChatMain.js`, no GSAP / ScrambleText / SplitText, no
ChatResponse/Skeleton/Carousel/QuickLinks CSS are loaded by ControlScreen.

**Markup.** The `.ai-assistant` subtree (root + resize handles + header + sidebar + the
`#chat-main.chat-main--initial` initial view) is copied verbatim from the standalone page,
with `.chat-main__scroll` dropped and `ai-assistant--hidden` added to the root. It is mounted
once, directly after the action rail. (Vanilla-static stack: no HTML partials, so markup is
duplicated; the JS is shared — see below.)

**Shared JS.** The static "shell" behaviours (sidebar toggle + kebab menus, message-input
active-state + duration-filter popover, drag-to-move, 4-edge resize, close button) were
extracted into `AiAssistant/AiAssistant.js` → `initAiAssistantShell(root, opts)`, scoped to
`root`. Both the standalone demo and ControlScreen import it. ControlScreen calls it with
`{ brandThemeTarget: panel }` (keeps the chat brand-theme scoped to the panel, not the CC
shell) and `{ onClose }` (resets the rail button's `aria-expanded`).

**Open/close.** Wired in a dedicated `<script type="module">` at the end of the body — NOT a
generic `[data-aa-toggle]` rail popover, so the large draggable panel is exempt from the rail
popovers' click-outside-close. The button toggles `.ai-assistant--hidden`, syncs
`aria-expanded`, and closes any open rail popover on open. The header close button hides it
again.

**CSS anchor.** `.cc-control .ai-assistant` overrides only the demo's bottom-right anchor →
top-right beside the rail: `top: var(--ai-spacing-6)`,
`right: calc(var(--ai-spacing-10) + var(--ai-spacing-3))` (clears the 56px rail + 8px gap),
`z-index: 60` (above chrome/rail-popovers, below the fav modal). Position stays `fixed` so the
shared drag/resize math is unchanged.

## AssistantPopover coachmark (rail call-out)

The `AssistantPopover` pattern (`src/cc/patterns/AssistantPopover/`, Figma `4218:5304`) is
mounted in ControlScreen as a **bottom-right coachmark** promoting the Affino Assistant. Spec
agreed 2026-06-03:

- **Show:** first visit only — slides up into view after a brief delay (`SHOW_DELAY_MS`, 500ms)
  with a slow ease-out glide (600ms). Once dismissed it persists via
  `localStorage['cc-assistant-popover-dismissed']` and does not return. If the key is already
  set on load, the markup is removed immediately.
- **Position:** `position: fixed`, bottom-right (`bottom/right: var(--ai-spacing-6)`),
  `z-index: 55` (above chrome/rail-popovers, below the AiAssistant panel z-60 and fav modal
  z-100). Scoped under `.cc-control` in ControlScreen.css so the pattern's own demo stays a
  static card.
- **Fade:** hidden + `pointer-events:none` (`opacity:0`, `translateY(var(--ai-spacing-3))`)
  until JS adds `.cc-assistant-popover--visible`; dismissal removes the class (fade out) then
  removes the node on `transitionend`.
- **✕ and Launch** both dismiss + persist. **Launch** additionally opens the AiAssistant panel
  via the shared `openAssistant()` helper (same open path as the rail button).
- Wired in the end-of-body module (alongside the AiAssistant wiring) — **not**
  `AssistantPopover.js`, whose instant DOM-removal would fight the fade-out. The standalone
  pattern demo still uses AssistantPopover.js.
