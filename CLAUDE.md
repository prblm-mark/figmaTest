# Design System Governance

This file is read by Claude Code at the start of every session. All rules here are mandatory.

---

## 0. Mandatory Skill Usage — `/build-component`

> **HARD RULE.** Every create/edit under `src/components/`, `src/patterns/`, or
> `src/templates/` must begin with `Skill(skill="build-component")`. This is your
> **first tool call** — before any `mcp__figma__*`, `Read`, `Write`, or `Edit`.
> Out of scope: `src/prototypes/`.
>
> Triggers: "build/create/scaffold/audit/refine/fix/update a [name] component|pattern|template",
> a `figma.com/design` URL given as a build instruction, or any edit to the directories above
> (including typo fixes).
>
> Enforced by `.claude/hooks/build-component-guard.py` — edits are **denied** until the
> skill is invoked. The skill at `.claude/commands/build-component.md` is the source of
> truth for every step; do not skip STOPs (Tier=Template, interaction, contextual override,
> token gap, gradient, hardcoded dimension, **template-shell paint values**).
>
> **Tier=Template additional rule:** the template SHELL (body bg, page-content
> bg/padding/gap, section frames) is Figma-bound, not "layout-only" — call
> `get_design_context` on the template root frame and record every shell paint binding
> (see skill Step 3a) BEFORE writing any shell CSS. Source-of-truth rule #5 +
> `feedback_template_shell_is_figma_too.md`. The trigger hook adds an extra reminder when
> the prompt names a template / screen / dashboard.

---

## 1. Project Overview

This is the **Affino Design System** — the design system for Affino's client-facing
products: the **Control Centre**, **AI**, and **display-side** components and templates.
Designers work in Figma; Claude Code turns Figma components into production HTML/CSS using
**only the design tokens defined below**.

Not to be confused with the Hub's own UI design system (`hub.affino.com`, React + Tailwind,
internal-only) — the two are deliberately separate and share no tokens. See
`docs/hub-executor-setup.md`.

- Token source: `FigmaTokens/` (DTCG JSON exported from Figma)
- Generated CSS: `css/tokens.css` (run `npm run tokens` to rebuild)
- Components: `src/components/<ComponentName>/`
- Global base: `src/styles/base.css`

**Stack:** Vanilla HTML + CSS (no framework). Webpack 5 for bundling.

---

## 2. Design System Tokens

All CSS variables begin with `--ai-`. **Never use raw hex values, arbitrary pixel values, or
named colors in component CSS.** Every visual value must come from an `--ai-*` token.

**Full token reference (all tables):** [`docs/tokens-reference.md`](docs/tokens-reference.md)
— surface, text, border, radius, icon, button, spacing, size, chat, skeleton, shadow, gradient, breakpoint, dark mode, minimised mode, computed tokens, typography, transitions.

**Key rules from the token reference:**
- Icon sizes: use `--ai-icon-size-sm/md/lg/xl` — never `--ai-spacing-*`
- Breakpoints: mobile-first `min-width`. `@media` must use px values (not vars)
- Dark mode: `data-theme="dark"` on `<html>`. Generated `css/tokens-dark.css`
- Minimised mode: `data-layout="minimised"` on container. Only fluid font sizes differ
- Computed tokens: sidebar colors use `color-mix()` + luminance detection at runtime
- Gradients: `css/tokens-gradients.css` (static). Never hardcode `rgba()` gradient values

---

## 3. Icon System

**Full reference:** [`docs/icon-system.md`](docs/icon-system.md)

**Library:** [Lucide](https://lucide.dev). Icons via `<i data-lucide="name"></i>`, initialized in `js/app.js`.
Names must exactly match Lucide kebab-case. Color via `--ai-icon-*` tokens. Size via `--ai-icon-size-*` tokens.

---

## 4. Component Architecture

```
src/
├── components/           <- atomic/leaf components (Tier: component)
├── patterns/             <- composed components (Tier: pattern)
├── styles/               <- global base styles (base.css)
└── templates/            <- full UI screens/sections (Tier: template)
```

Each `<ComponentName>/` folder contains: `<Name>.html` (demo), `<Name>.css` (styles), `<Name>.figma-notes.md`.

**Rules:**
- CSS files import nothing — assume `base.css` and `tokens.css` are loaded by the page
- HTML links `../../styles/base.css` then `<ComponentName>.css`
- New atomic -> `src/components/`; composed -> `src/patterns/`; full screens -> `src/templates/`
- Class names use BEM: `.component`, `.component__element`, `.component--modifier`

---

## 4a. Responsive strategy — container queries, not viewport queries

> **HARD RULE.** New component and template CSS uses **container queries**. A viewport
> `@media` query is only correct for an element whose size really is set by the viewport.

**Why.** Components live inside the CC app shell, where a docked SidebarMenu and the ActionsMenu
rail change the content column *without any window resize*. Measured on the live Seating Planner
(2026-08-27): a **2239px viewport** with the menu docked left the page column at **820px**, and
neither `max-width: 1023px` nor `max-width: 767px` fired — so the header toolbar kept its widest
layout and its text ran straight over the Show-unassigned toggle. `ControlScreen.css` had already
written this exact warning next to `cs-page`; it just was not applied.

### The two container names

| Name | Established on | Means |
|---|---|---|
| `cs-main` | `.cc-control__main` (ControlScreen) | the whole content column, **outside** the page's own padding |
| `cs-page` | `.cc-control__page` (ControlScreen) | the page content box — **the screen-width signal** |

A **standalone component demo has no shell**, so any demo whose component queries `cs-page` must
establish it itself, or the narrow rules can never fire and the demo silently misrepresents the
component:

```css
body { container-type: inline-size; container-name: cs-page; }
```

### Choosing the container — measure first, then decide

**An element can never query the container it establishes.** So a component's own root box
(padding, border) cannot key on its own container — put those rules on `cs-page`, and keep
descendant rules on the component's own container.

**Self-container only if the element's own width tracks the available space.** Measure it before
deciding. Concrete trap: `TableDetail` is a fixed **320px**, `TableCard` **275**, `RoomCard`
**280**, `AttendeeCard` **286** — all under 767 *on desktop*, so a `container-type` on those roots
plus a `max-width: 767px` self-query fires **permanently**, desktop included. Those deltas are
about the screen being narrow, not the element, so they key on `cs-page`.

| Situation | Use |
|---|---|
| Element spans the page column (`SeatingHeader`, `TableListing`) | self-container: `container-type: inline-size` + `container-name: <component>`, descendants query it |
| Element is a fixed/small box (`TableCard`, `RoomCard`, `TableDetail`) | `@container cs-page (max-width: …)` |
| The component root's own padding / border | `@container cs-page (…)` — it cannot self-query |
| `position: fixed` overlay outside the shell (modals) | **`@media` is correct** — it really is viewport-sized |
| The shell's own sidebar / rail device swaps | `@media` — genuinely device-level |

### Prefer intrinsic CSS over a breakpoint

A breakpoint only moves the width at which a layout breaks. Where overflow is the problem, fix it
intrinsically so it holds at **every** width:

- flex children that must yield: `min-inline-size: 0`
- text that must not escape: `overflow: hidden; text-overflow: ellipsis` alongside `white-space: nowrap`
- a field with a preferred width: `flex: 0 1 <size>; max-inline-size: <size>` — a **cap**, not a floor

Both Seating Planner collisions were intrinsic bugs, not missing breakpoints: `nowrap` with no
ellipsis on `.seating-header__room-name` (a 130px box holding 243px of text), and
`flex-shrink: 0` + a hard 320 on `.table-listing__search` (which left the title a 13px box).

### JS must not use `matchMedia` for layout state

JS cannot read a container query, and `matchMedia` reintroduces the bug. Measure the container and
watch it with a **`ResizeObserver`** — the column changes width with no window resize at all:

```js
var STACK_MAX = 1023;                       // keep in step with the CSS value
function isStacked() { return pageEl.getBoundingClientRect().width <= STACK_MAX; }
new ResizeObserver(onContainerResize).observe(pageEl);
```

### `container-type` gives NO stacking protection

Do not assume the containment you added for container queries also isolates z-index. It does not:
`getComputedStyle(el).contain` reads **`none`** for a `container-type` element, and empirically it
does **not** trap positive-`z-index` descendants (measured 2026-08-27 by toggling `container-type`
to `normal` on three ancestors — the bug survived all three).

Consequence, found the hard way: `.cc-control__chrome` is `z-index: 1` and RoomCard's
`.room-card__actions` is *also* `z-index: 1`, so equal z-index in one layer let DOM order decide and
page content painted over an open dropdown. The fix is **`isolation: isolate`** on the region that
should contain its own content — not a bigger z-index, which is only a tie-break the next component
defeats. `.cc-control__page` now carries it.

When a stacking bug is suspected, hit-test with `document.elementFromPoint` at the overlap rather
than reasoning from the cascade — the paint order of non-positioned stacking contexts is exactly
where intuition fails.

Precedent already in the repo: `Alert`, `Datatables`, `SourcesCarousel` and `SystemRole` are all
self-containers. 65 files still carry viewport media queries — convert opportunistically, and
always re-verify the component at its own breakpoints afterwards.

---

## 5. Figma -> Code Workflow

The full workflow lives in `/build-component` (mandatory — see §0). For ad-hoc reads
without an edit: `get_design_context` → `get_variable_defs` → map to `--ai-*` via
`docs/tokens-reference.md`. Never inline styles; never hardcode values (see §7).

---

## 6. Code Connect

**Full reference:** [`docs/code-connect.md`](docs/code-connect.md)

Publish: `npm run code-connect:publish`. One `.figma.ts` per component. Always create alongside new components.

---

## 7. Code -> Figma Workflow

1. Use `generate_figma_design` MCP tool with component HTML/CSS as context
2. Generated Figma frame appears in your current file/page
3. Share URL with designer for review

---

## 8. Token Usage Rules

### Priority order when mapping a Figma property to CSS

1. **Semantic token exists** -> always use the `--ai-*` CSS variable. No exceptions.
2. **Anything else** -> **STOP. Ask the user how to proceed before continuing the build.**

Report what was found: property name, Figma value, and primitive name if identifiable.

### Gradient token rule

`get_design_context` does NOT expose gradient fills. If a gradient is visible in the screenshot
but has no `bg-[...]` class in design context, STOP and ask the user which gradient style it is.

### Forbidden

- Raw hex/px/named colors, non-Lucide icons, inline icon SVG, `!important` (except a11y utilities)
- Editing generated CSS (`css/tokens.css`) or `FigmaTokens/*.json` manually
- Adding CSS frameworks (Tailwind/Bootstrap) or non-`--ai-` prefixed tokens
- Importing `css/style.css` from components (use `src/styles/base.css`)

---

## 9. Accessibility Standards

All components must meet **WCAG 2.1 AA**:

- **Color contrast:** >= 4.5:1 (normal text), >= 3:1 (large text/UI)
- **Focus indicators:** `outline: 2px solid var(--ai-surface-brand)` for `:focus-visible`
- **Semantic HTML:** `<button>` for actions, `<a>` for navigation, `<input>` for inputs
- **ARIA:** Add `aria-label`, `aria-disabled`, `aria-pressed` as needed
- **Touch targets:** Minimum 44x44px for interactive elements

---

## 10. Current Components

**Full registry:** [`docs/component-registry.md`](docs/component-registry.md)

Add rows there as components are built. Format: Component Name, Tier, Status, Figma URL, Notes.

---

## 11. Adding a New Token

1. Change the value in Figma (Variables panel)
2. Re-export: Figma -> Plugins -> export to `FigmaTokens/`
3. Run `npm run tokens` — `css/tokens.css` regenerates automatically
4. Update `docs/tokens-reference.md` with the new token

Do **not** manually edit `FigmaTokens/*.json` — they are the source of truth from Figma.

---

## 12. Backend Handover & Flagging

This is a **front-end-only** repo (no backend). When an element is **mock / visual-only /
in-memory** and will need real data, API, auth, persistence, or AI, flag it so the backend
handover stays discoverable:

- Drop a greppable marker at the element:
  - HTML: `<!-- TODO(backend:<Surface>): <what is mock> → <suggested contract> -->`
  - JS: `// TODO(backend:<Surface>): <what is mock> → <suggested contract>`
  - Optional DOM hook: `data-backend-todo="<id>"`.
- Add a matching entry under `surfaces.<Surface>.items[]` in `docs/handover-manifest.json`
  (keep `id` in sync with the marker) and a row in [`HANDOVER.md`](HANDOVER.md).

Find everything: `grep -rn "TODO(backend" src/`. Full guide: **[`HANDOVER.md`](HANDOVER.md)**.
