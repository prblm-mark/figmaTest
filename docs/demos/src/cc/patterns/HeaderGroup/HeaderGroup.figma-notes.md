# CCHeaderGroup — Figma Notes

**Figma file:** [`ETKqleZdpertwFEo40YB5n`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4105-4238) (CC Hybrid Design System)
**Tier:** Pattern (composed)
**Component set node:** `4105:4238` (frame name `CCHeaderGroup`)
**Files:** `CCHeaderGroup.css`, `CCHeaderGroup.html`, `CCHeaderGroup.figma.ts`, `CCHeaderGroup.figma-notes.md`

---

## Variant matrix (verified from Figma `get_metadata` 2026-05-27)

Two axes: **Device × Type** = 6 variants. **⚠ Figma variant names are partially
swapped vs the rendered widths** for the Default and Mobile/Zone Selector rows —
see Authoring Bugs.

| Node ID | Figma label | Width | Treated as | Type | Composes |
|---|---|---|---|---|---|
| `4105:4237` | "Device=Mobile, Default" | 1280 | **Desktop / Default** | Default | CCTopNavigation Multizone/Desktop + CCHeader Control/Desktop |
| `4105:4236` | "Device=Desktop, Default" | 390 | **Mobile / Default** | Default | CCTopNavigation Multizone/Mobile + CCHeader Control/Mobile |
| `4134:3452` | "Device=Desktop, Zone Selector" | 1280 | **Desktop / Zone Selector** | Zone Selector | Default Desktop + open basic Dropdown showing zone list |
| `4134:4066` | "Device=Desktop, Zone Selector" | 390 | **Mobile / Zone Selector** | Zone Selector | Default Mobile + same dropdown |
| `4134:4154` | "Device=Desktop, User Menu" | 1280 | **Desktop / User Menu** | User Menu | Default Desktop + open Dropdown Type=User menu (ThemeToggle + Icon Navigation Toggle + DropdownItems + Warning Sign Out) anchored to the user block |
| `4135:4114` | "Device=Mobile, User Menu" | 390 | **Mobile / User Menu** | User Menu | Default Mobile + same User-menu dropdown |

Per user decision, **width is the source of truth**. Demo HTML uses
`@media (max-width: 767px)` + `.demo-frame--mobile` for the collapse behaviour —
no `--mobile` modifier class.

The Zone Selector and User Menu variants are **showcase views**: they show the
composed HeaderGroup with a Dropdown component in its open state, overlaying the
header chrome. The dropdown markup uses `.is-open` plus `data-dropdown-init="1"`
so the Dropdown JS skips the toggle/click-outside logic and leaves the panel
visible. In production these would behave like any other Dropdown — closed by
default, open on trigger click, close on outside click / Escape.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Wrapper (`CCHeaderGroup`) | `.cc-header-group` (`<div>`) |
| `CCTopNavigation` instance | `.cc-top-navigation` (CCTopNavigation pattern) |
| `CCHeader` instance | `.cc-header.cc-header--control` (CCHeader pattern) |
| Zone Selector dropdown | Existing `.dropdown` inside the Breadcrumb's first list item (composed from Dropdown component). Demo applies `.is-open` to force open. |
| User Menu dropdown | New: the topNav's `.cc-top-navigation__user` button is wrapped in `.dropdown.dropdown--user-menu` with a sibling `.dropdown__panel` containing ThemeToggle + Toggle + DropdownItems. Demo applies `.is-open` to force open. |

CCHeaderGroup itself owns minimal CSS — it's a thin vertical-stack wrapper around two
existing patterns. The Zone Selector and User Menu types reuse the existing Dropdown
component; no new CSS in HeaderGroup.css for those variants — they are entirely a
composition + open-state demo.

---

## Token mapping

| Property | Token |
|---|---|
| Flex direction | `column` |
| Width | `100%` |
| Item alignment | `stretch` |

### Notes on composed height

Figma shows the CCHeader nested inside CCHeaderGroup Mobile at `min-h-[48px]`, vs the
standalone CCHeader Mobile at `min-h-[56px]`. **By project decision the composed
Header uses the standalone 56px** — the original 48px contextual override was removed
(Figma may have been authored inconsistently). The composed children retain their
standalone CSS unchanged.

---

## Authoring bugs (to flag to designer)

| Issue | Where | Resolution |
|---|---|---|
| Variant labels swapped | Component set `4105:4238`. The 1280px-wide variant is named `Device=Mobile` (should be Desktop); the 390px-wide variant is named `Device=Desktop` (should be Mobile). | Code uses **width as truth**. Designer to rename Figma variants. |
| Component composed from only the Control type and Multizone topNav | Figma only ships one composed variant per device (Multizone+Control). Other compositions (Default topNav + Default header, Default topNav + Sub Text header, etc.) are not represented as compiled variants. | Documented. Consumers compose CCTopNavigation + CCHeader directly for other combinations. |

---

## Token gaps

None unique to CCHeaderGroup. Inherits gaps from child patterns (see CCTopNavigation
figma-notes for portrait-28px and mobile-gap-18px gaps; CCHeader figma-notes for
notification-badge-red gap).

---

## Interactions

CCHeaderGroup owns no interactions — all interactions live in the composed child
patterns (CCTopNavigation Zone Selector dropdown, CCHeader kebab dropdown, etc.).

---

## Responsive behaviour

CCHeaderGroup owns no responsive CSS — all responsive behaviour comes from the
child patterns (see CCTopNavigation and CCHeader figma-notes).

---

## Dependencies

- **CCTopNavigation** (`src/patterns/CCTopNavigation/`) — supplies the top dark utility bar.
- **CCHeader** (`src/patterns/CCHeader/`) — supplies the main white header.
- Transitively: Breadcrumb, Button, Dropdown, NotificationBadge, Portraits.
- **Lucide** icons via the children.

Include the children's CSS + JS files in any page using CCHeaderGroup.

---

## History

- 2026-05-15: Initial compiled pattern scaffold. Built from Figma component set
  `4105:4238` (CC Hybrid Design System). 2 variants reduced to a single responsive
  HTML structure. Figma authoring bug noted (variant names swapped vs widths) —
  width treated as truth. A contextual mobile-height override (48px composed vs
  56px standalone) was initially added per Figma, then removed on 2026-05-18 —
  composed Header now inherits the standalone 56px.
- 2026-05-27: Figma added Type axis with two new types (Zone Selector, User Menu),
  bringing the variant count to 6 (3 Types × 2 Devices). Both new types are
  showcase views of the existing Default layout with a Dropdown forced open —
  Zone Selector anchored to the Breadcrumb's first list item, User Menu
  anchored to the topNav user block. Demo HTML uses `.is-open` +
  `data-dropdown-init="1"` to keep the dropdown panel visible for inspection.
  No production CSS added — the new types are composition + open-state.
