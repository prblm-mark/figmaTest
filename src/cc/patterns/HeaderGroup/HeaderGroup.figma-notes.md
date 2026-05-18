# CCHeaderGroup — Figma Notes

**Figma file:** [`ETKqleZdpertwFEo40YB5n`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4105-4238) (CC Hybrid Design System)
**Tier:** Pattern (composed)
**Component set node:** `4105:4238` (frame name `CCHeaderGroup`)
**Files:** `CCHeaderGroup.css`, `CCHeaderGroup.html`, `CCHeaderGroup.figma.ts`, `CCHeaderGroup.figma-notes.md`

---

## Variant matrix (verified from Figma `get_metadata` 2026-05-15)

Single Device axis, 2 variants. **⚠ Figma variant names are swapped vs the
rendered widths** — see Authoring Bugs.

| Node ID | Figma label | Width | Treated as | Composes |
|---|---|---|---|---|
| `4105:4237` | "Device=Mobile" | 1280 | **Desktop** | CCTopNavigation Multizone/Desktop + CCHeader Control/Desktop |
| `4105:4236` | "Device=Desktop" | 390 | **Mobile** | CCTopNavigation Multizone/Mobile + CCHeader Control/Mobile |

Per user decision, **width is the source of truth**. Built as a single responsive HTML
structure that collapses via `@media (max-width: 767px)` — no `--mobile` modifier class.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Wrapper (`CCHeaderGroup`) | `.cc-header-group` (`<div>`) |
| `CCTopNavigation` instance | `.cc-top-navigation` (CCTopNavigation pattern) |
| `CCHeader` instance | `.cc-header.cc-header--control` (CCHeader pattern) |

CCHeaderGroup itself owns minimal CSS — it's a thin vertical-stack wrapper around two
existing patterns.

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
