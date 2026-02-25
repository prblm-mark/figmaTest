# figmaTest Project Memory

## Project Overview
Figma Design System token project. Exports Figma variables as DTCG-format tokens for web use.
Status: Token pipeline + component scaffold implemented. Bi-directional Figma ↔ Code workflow active.

## Key Paths
- Entry: `js/app.js` (currently empty)
- Tokens: `FigmaTokens/` (Primitive, Light theme, Typography/Desktop, Typography/Mobile)
- Generated CSS: `css/tokens.css` (auto-generated, do NOT edit manually)
- Generated CSS: `css/tokens-mobile.css` (auto-generated — `@media (max-width: 767px)` overrides for `--ai-font-fluid-*` tokens)
- Generated CSS: `css/tokens-dark.css` (auto-generated — `[data-theme="dark"]` overrides; activate with `data-theme="dark"` on `<html>`)
- Styles: `css/style.css` (HTML5 Boilerplate base, imports tokens.css)
- Base styles: `src/styles/base.css` (imports tokens.css + tokens-mobile.css + tokens-dark.css, sets global defaults using --ai-* vars)
- Components: `src/components/<Name>/` — three files each (BEM CSS, demo HTML, figma-notes.md)
- HTML: `index.html` (links css/style.css + src/styles/base.css)
- Governance: `CLAUDE.md` (complete token tables + workflow rules — read every session)
- MCP config: `.mcp.json` (Figma MCP server, team-shared, each dev runs `claude mcp auth figma`)
- Token pipeline: `style-dictionary.config.mjs` (Style Dictionary v4)
- Docs: `docs/figma-workflow.md`, `docs/plan.md`
- Build output: `dist/`

## Build & Scripts
- `npm run tokens` → generates THREE CSS files: `css/tokens.css` (desktop), `css/tokens-mobile.css` (mobile), `css/tokens-dark.css` (dark theme) from FigmaTokens/
- `npm start` → webpack dev server (hot reload, opens browser)
- `npm run build` → production bundle to `dist/`
- Webpack 5 with dev/prod configs split via webpack-merge

## Token System
- **Hierarchy:** Primitives → Light (semantic) → Components
- **Prefix:** CSS variables use `--ai-` prefix (e.g., `--ai-surface-primary`)
- **Format:** Figma DTCG export (colors are objects with `hex` field, NOT standard DTCG strings)
- **Naming:** Figma `codeSyntax.WEB` field in $extensions defines exact CSS variable name
- **Pipeline:** Style Dictionary v4 with 5 custom transforms (see style-dictionary.config.mjs)
- Token files: `Primitive.tokens.json` (palette, not output to CSS), `Light.tokens.json` (semantic), `Typography/Desktop.tokens.json`

## Style Dictionary Config Notes
- Figma colors are objects: `{ colorSpace, components, alpha, hex }` — `color/figma-hex` transform extracts hex
- Root-level `$extensions` (modeName metadata) causes SD collisions — custom parser strips it
- Only tokens with `$extensions['com.figma.codeSyntax']['WEB']` are output to CSS
- Font weights map: Regular→400, Medium→500, SemiBold→600, Bold→700, ExtraBold→800
- **Dimension transform:** `dimension/figma-rem` — divides token value by 16, outputs `rem`. 16px = 1rem baseline. Border widths (1px, 2px) and box-shadow offsets are NOT tokens — keep as `px` in component CSS.
- **Three SD instances:** `sd` (desktop) → `css/tokens.css`; `sdMobile` → `css/tokens-mobile.css`; `sdDark` sources Primitive + Dark.tokens.json → `css/tokens-dark.css`
- Do NOT source Desktop.tokens.json AND Mobile.tokens.json in the **same** SD instance — same variable IDs cause collisions. Use separate instances.
- Mobile.tokens.json contains all typography tokens with **direct values** (no aliases to Primitive) — `sdMobile` does not need Primitive-only sourcing for alias resolution, but currently sources Primitive + Light + Mobile for consistency
- `css/variables-media-query` custom formatter wraps output in `@media (max-width: 767px) { :root { ... } }`

## Dimension Units (post-px→rem migration)
- All dimension tokens output `rem` via `dimension/figma-rem` transform (÷16, 16px = 1rem base)
- Border widths (`1px`, `2px`) and box-shadow offsets stay as `px` (optical, not layout)
- Letter-spacing stays as `px` (optical typographic value)
- Hardcoded `px` dimension in component CSS is a stop — report to user before continuing

## Additional Tokens
- `--ai-surface-success: #30cb90` — Aqua/500, theme-invariant (same in light and dark). Used for success states (Pill bg, check circle bg in VersionHistoryRow). Added this session.

## Tech Stack
- Vanilla JS (no frontend framework)
- Webpack 5, webpack-dev-server, html-webpack-plugin, copy-webpack-plugin
- **Style Dictionary v4** (devDep) for token compilation
- HTML5 Boilerplate CSS foundation

## Conventions
- Color shades: 50–900 numeric scale
- Spacing: 13-level scale (1–13 + px): 4,6,8,12,16,24,32,40,48,56,64,72,80px
- Typography: separate Desktop/Mobile token files; font sizes xxs–4xl; font: Inter
- Component CSS: BEM naming (.btn, .btn--primary, .btn--sm), --ai-* tokens only, no hardcoded values
- Radius tokens: `--ai-radius-sm/md/lg/xl/full` (NOT `--ai-border-radius-*`)
- Note: `compnonents` (typo) in Light.tokens.json — do not fix, aliases depend on it

## Plan Mode Rule

**Plan mode is strictly read-only. Never edit, write, or apply code changes during planning.**
Only use Read, Grep, Glob, Bash (read-only commands), and Figma MCP fetch tools. File edits happen only AFTER the user approves the plan and says "implement."

If a plan is marked "Status: COMPLETE" before the user approved it, that means code was accidentally changed during planning — a violation. When asked to implement such a plan, still walk through each step and verify the state, but do not declare "nothing to do" without confirming with the user.

## Critical Rules — Never Assume, Always Fetch

- **Always call `get_metadata` on the component set node before any `get_design_context` call.** A node ID from a URL or a parent component's tree is a single variant, not the full component. Without this step, entire states/sizes/device breakpoints are silently missed. This mistake caused the Header to be built from one variant (68:5444) while 5 others (Mobile layout, Discard state, Tooltip state) were never seen. Rule: call `get_metadata` on the component set first, build a variant table, then fetch design context per variant. The variant table is a **contract** — every row must be represented in the CSS, the demo HTML, and the figma-notes.md variant matrix. A row absent from any of those three means the build is incomplete.
- **Never defer variants as "unused" — build every variant in the component set.** If a variant appears in the `get_metadata` output, it MUST be built. "No current component uses it" is not a valid reason to skip or defer. Skipping creates fix-session debt. If a user explicitly instructs you to skip a variant, note it in figma-notes.md with the reason; otherwise build it. Concrete mistake: Avatar's Show Notification variants (5 nodes) were explicitly deferred as "not built — unused in current components" and required a full fix session to implement.
- **`data-name="X"` in design context = a Figma component, regardless of rendered output.** When design context output contains any `data-name` attribute (e.g. `data-name="Tooltip"`, `data-name="Female 1"`), that element IS a standalone Figma component that must become `src/components/<Name>/`. The rendered HTML type (whether `<div>`, `<img>`, or anything else) is NOT the signal — the `data-name` attribute is. No exceptions for elements that appear "too simple" to be a component. Concrete mistake: `data-name="Female 1"` rendered as `<img>` and was treated as a plain HTML element instead of triggering a Portraits component — same category of error as the Header/Tooltip inline CSS mistake. Always scan ALL `data-name` attributes after fetching design context, check each against `src/components/`, and stop to build any missing ones before continuing with the parent.
- **"Go ahead and build X" does not mean skip the process.** Even when given an explicit instruction to build/fix a component, always run the full component tree mapping first (get_metadata on component set → scan data-name attributes → check all dependencies → bottom-up build order). Never jump straight to implementation.

- **Border radius on size variants:** Never assume smaller sizes use a smaller radius token. Fetch `get_design_context` for each size variant — the sm button uses `--ai-radius-md` (same as base), NOT `--ai-radius-sm`.
- **Padding on sized variants:** Never add vertical padding to a button (or any component with a fixed height). Figma sets `px-[...]` (horizontal only) + `h-[...]` (fixed height). Use `padding: 0 var(--ai-spacing-X)` + `min-height: var(--ai-spacing-Y)`. Vertical padding is inferred from height, not added explicitly.
- **General rule:** Do not infer property values for variants — always fetch `get_design_context` on each specific variant node and read the exact tokens. This applies to EVERY state (hover, focus, pressed, disabled) — not just the default. Inferring interactive states is the same as hardcoding. Example mistake: alert-outline hover/focus/pressed were assumed to stay "outlined with subtle tint" — Figma actually flips them to fully solid red with white text, identical to the alert (solid) variant. The "outline" distinction only exists in the default state.
- **Always use the Figma variable exactly:** When `get_design_context` specifies a token, use that token — do not substitute a different one based on personal judgement (e.g. accessibility assumptions, visual logic). If the Figma token looks wrong, flag it to the user rather than silently changing it.
- **Token gap rule:** If a property has no `--ai-*` semantic token (including Figma primitives like Red/400), STOP and ask the user before writing any CSS for that property — every time, even if that primitive was approved in a previous session or another variant. Prior approvals do NOT carry forward. Report the property name, the Figma value, and the primitive name if identifiable. Never silently use a primitive or hardcode a value.
- **Icon sizes:** Never assume icons are 24×24 (Lucide default). Always check `get_design_context` for the exact icon size used in the component. Override in component CSS using a scoped `[data-lucide]` selector and the correct icon-size token. Use `--ai-icon-size-sm` (1rem/16px), `--ai-icon-size-md` (1.25rem/20px), or `--ai-icon-size-lg` (1.5rem/24px) — **never `--ai-spacing-*` for icon width/height**. Do NOT set icon sizes globally via `createIcons()` attrs — that affects all icons sitewide.
- **Design context reports base component size, not placed size.** An icon named `Icon/24px/History` placed at 20px will show `size-[24px]` in design context (intrinsic size). The actual rendered size comes from the parent's `w-[...]`/`h-[...]` on the placed instance. Verify placed instance dimensions with `get_metadata` on the specific instance node when unsure.
- **Design context shows visual/layout structure only — NOT interaction behavior.** Figma prototype interactions live separately from visual structure. An element rendered as `<div>` (no `cursor-pointer`) in design context can still be a fully interactive trigger in the prototype. NEVER remove or downgrade an interactive element (button → div) based on design context output alone. If interactions change, confirm with the user or inspect the Figma prototype panel directly. The VersionHistory footer `<div>` in design context was still a clickable toggle — removing it was wrong.

## Contextual Overrides vs Formal Variants

When a parent component uses a child component with a property set differently from the child's base design (e.g. title width changed to fill-container in SignUpForm's Header):

- **Case A — Formal variant:** The customisation exists as a variant in the child's Figma component set → add it to the child component.
- **Case B — Contextual override:** The customisation is a one-off usage in the parent, not a formal variant → scope it to the parent with a modifier/override class, document it in the parent's `figma-notes.md`. Do NOT add it to the child component.

**Rule:** Always STOP and flag the anomaly to the user **before writing any code**. Describe what differs and propose which case it is. Wait for confirmation before implementing. This means: no CSS, no HTML, nothing — flag first, implement only after the user confirms the case. Concrete mistake: VersionHistory Header had its title set to `fill-container` (making InfoLabel right-align) — this was a contextual override that should have been flagged and confirmed as Case B before any code was written. Instead it was silently implemented incorrectly, then discovered and fixed later.

## Dark Mode Toggle (Demo Pages)
- Shared script: `src/components/dark-mode-toggle.js` — inject into every demo page
- Placement: `<head>` after the two `<meta>` tags, **before any `<link>` stylesheets** (prevents FOUC)
- `<script src="../dark-mode-toggle.js"></script>`
- Applies `data-theme="dark"` on `<html>`, persists to `localStorage` under `demo-theme`
- All 6 existing demo pages already have this; add it to every new demo page

## Component Building Skill
- **Skill:** `/build-component` → `.claude/commands/build-component.md`
- **Refined process:** get_metadata (page) → get_screenshot (parent frame) → get_design_context (root + each variant) → get_variable_defs (token gaps) → get_code_connect_map → build state matrix → implement → figma-notes.md → CLAUDE.md §10
- **Key lessons:** Always check for explicit `h-[...]` height tokens (not just padding). Tertiary = white/no border (not same as secondary). Button typography = `--ai-font-fluid-xs` + `--ai-leading-1`, NOT fixed-sm + leading-2. Form filled text = `--ai-text-primary`, placeholder = `--ai-text-contrast` (different!). Use `:has()` for clear button visibility.
- **Focus state pattern:** Figma focus rings use a double box-shadow, NOT an outline. Pattern: `box-shadow: 0 0 0 1px var(--ai-surface-primary), 0 0 0 3px var(--ai-surface-brand-contrast)`. Always write `:hover` and `:focus-within` as SEPARATE rules — combining them means focus never gets the shadow. Then suppress global `:focus-visible` on child interactive elements (e.g. `<input>`, clear `<button>`) with `outline: none` — `base.css` line 56 sets a global `outline: 2px solid var(--ai-surface-brand)` on all `:focus-visible` that leaks into components.
- **Button variant identification rule:** When a Button instance appears in design context, ALWAYS check the component's `type` property or variant name in Figma (e.g. `Type=Tertiary`) — not just the background colour. Secondary and tertiary buttons share the same white `--ai-btn-secondary` bg. The distinguishing signals are: (1) presence/absence of a `border` class in design context, (2) the variant label visible in `get_metadata` output (e.g. `Type=Tertiary`). Background colour alone is never sufficient.
- **Font family rule:** Map font-style names directly from design context: `title/*` font styles → `--ai-font-title`; `body/*` font styles → `--ai-font-body`. Never default to `--ai-font-body` for any text element — always read the style name explicitly.
- Button variants: primary, secondary, tertiary, alert, alert-outline, icon-only. Node 53:2489. Alert hover/pressed use Red/400 (`#f87171`) and Red/600 (`#dc2626`) as approved primitives (no semantic token exists yet).
- **Primary and alert button text:** use `--ai-btn-primary-text` (NOT `--ai-text-invert`) for all buttons with a solid coloured background (primary, alert, alert-outline hover/pressed states). This token stays `#ffffff` in both themes. `--ai-text-invert` flips to near-black in dark mode and breaks legibility.
- **Token drift rule:** when reviewing/building any component, cross-reference its CSS against the current token files. A new specific token may supersede a general one (e.g. `--ai-btn-primary-text` supersedes `--ai-text-invert` for primary button text). Run `npm run tokens` first.
- **Responsive layout rule:** Use `@media (max-width: 767px)` in component CSS for device-driven layout changes — NEVER `.component--mobile` modifier classes. Breakpoint: 767px = mobile, 768px+ = desktop.
- **Fluid tokens are genuinely responsive:** `--ai-font-fluid-*` tokens automatically change value at ≤767px via `tokens-mobile.css` (e.g. `--ai-font-fluid-xl`: 22px → 20px). Components using fluid tokens need no extra CSS for typography responsiveness.
- **Demo pages for responsive components:** Remove separate "Mobile" demo sections — a single set of examples responds automatically. Add a note "resize viewport below 768px to see mobile layout".
- **Mobile child-component sizing:** When a Device=Mobile variant exists, always check `h-[...]`, `px-[...]`, and `text-[length:...]` on every nested child (buttons, inputs, etc.) in the mobile variant vs desktop. If sizes differ, add scoped overrides inside `@media (max-width: 767px)` (e.g. `.header__actions .btn { min-height: var(--ai-spacing-7); padding: 0 var(--ai-spacing-4); font-size: var(--ai-font-fluid-xxs); }`). Never use `btn--sm` in HTML for this — it only works for static layouts.
- **Mobile mode safety net:** After the variant table is built, if no Device=Mobile variant was found, scan design context and mode/token references for the word "mobile" (e.g. `Modes / typography:mobile`). If seen and not already accounted for, STOP and ask: "I see a mobile mode referenced but no Device=Mobile variant — should this component have a mobile layout variant?" Don't assume fluid tokens alone cover it.
- **Proceed to implement promptly:** After Step 1c (interaction model confirmed by user), proceed directly to Steps 3–8 without waiting for transition/icon questions to be answered separately. Use `--ai-transition-default` (150ms ease) for all interactive state changes unless the user specifies otherwise. Note choices made in figma-notes.md. Always produce a working demo HTML page (`<Name>.html`) as part of every component build — this is mandatory, not optional.
- **Always add new components to `index.html`** — every new component must get a card in the `index.html` component grid. Do this in the same commit as the component build. Use a relevant Lucide icon for the card, a one-line meta description matching the variant list.
- **Variable text content rule:** When a child component has variable/dynamic text (e.g. Pill's `pill__label`, button labels), use EXACTLY the text shown in the Figma design for that parent component instance. Never invent "realistic" placeholder text. Text content in Figma has the same fidelity requirement as tokens — read it, don't guess it. Concrete mistake: VersionHistory Pill showed "2 minutes ago" (invented) instead of "Live" (what Figma shows).
- **Cascade child component updates to all parent demos.** When a child component is updated (new variants, markup changes, class renames), find every parent component that uses it and update those demo HTML files too. Use `grep -r "class=\"avatar"` or equivalent to find all usages. A parent demo showing stale child markup is a broken demo — it misleads about how the system works. Concrete mistake: after Avatar was fixed to use `<img class="portrait">` inside `.avatar`, VersionHistoryRow and VersionHistory demos still used empty `<div class="avatar">` showing grey fallback circles.
- **figma-notes.md is a live record, not static docs.** Any change to CSS class names, HTML structure, or component dependencies MUST be reflected in the component's `figma-notes.md` CSS Class Mapping and Dependencies sections in the **same commit**. Failing to do this will leave stale class names/dependencies that mislead the next session. This applies equally to CLAUDE.md §10 — if a component's composition changes (e.g. Avatar added to VersionHistoryRow), update its row atomically. Concrete mistake: after refactoring VersionHistoryRow to use `.avatar`/`.avatar--checked`, the figma-notes still listed `.version-history-row__avatar`/`.version-history-row__check` and only Pill as a dependency — not caught until the next session.
- **Transition prompt rule:** When implementing ANY interactive visual state change — hover, focus, active/pressed, expand/collapse toggles, chevron rotation, reveal animations — always ask the user before writing CSS: "Should this animate? If yes, which preset — fast (100ms), default (150ms), slow (250ms), or spring (200ms bouncy)?" Do not add `transition` or `transform` silently. Presets are defined in `src/styles/base.css` as `--ai-transition-fast/default/slow/spring`.
- **Expand/collapse toggle pattern:** For components with show/hide row lists (e.g. VersionHistory Default↔Expanded): (1) add `.component__row-extra` to extra rows; (2) CSS hides them: `.component:not(.component--expanded) .component__row-extra { display: none; }`; (3) chevron rotation on expanded: `.component--expanded .component__chevron { transform: rotate(90deg); }`; (4) JS toggles `.component--expanded` on container, updates `aria-expanded`, and swaps button label text.
- **Vertical timeline line pattern:** Absolutely positioned inside a `.component__rows` wrapper. Center behind Size=1 avatars: `left: calc(var(--ai-spacing-5) + var(--ai-spacing-6) / 2)` = 16px padding + 12px = 28px. `top: 0; bottom: 0; width: 1px; background-color: var(--ai-border-secondary)`. A 1px decorative line is an optical width (like border-width) — keep as `px`, do not convert to rem.
- **`Neutral/200` primitive = `#e5e7eb`** → maps to `--ai-border-secondary` (and `--ai-border-contrast`). Not a token gap.
- **No fallback backgrounds without Figma confirmation.** Adding a `background-color` "as a fallback" when Figma defines none is a token gap violation — flag it before implementing. Concrete mistake: `background-color: var(--ai-surface-contrast)` on `.avatar` bled through at the sub-pixel boundary between `border-radius: full` and `clip-path: circle(50%)`, producing a grey ring on white backgrounds. If Figma's intent is "no avatar = invisible", that is correct — do not invent states.
- **Contextual overrides must be scoped per variant, not globally.** When applying a Case B override, always check EVERY variant of the parent component and confirm which ones carry the override. A property present on the Default variant is NOT automatically present on Live, Selected, etc. — verify each. Scope the CSS with `:not()` to exclude variants where the override does not apply. Concrete mistake: a 2px white border on the Default VersionHistoryRow avatar was initially applied to `.version-history-row .avatar` (all variants), when it should only apply to the Default variant (`:not(.--live):not(.--selected)`).
- **Hover scoping rule:** When a hover state exists only on specific Figma variants (e.g. Default only, not Live/Selected), use `:not()` to scope BOTH the `transition` and the `:hover` rule to only those variants. The `transition` must live on a companion rest-state rule (NOT inside `:hover`) so it animates both entry and exit. Pattern: `.component:not(.component--live):not(.component--selected) { transition: ... }` + `.component:not(.component--live):not(.component--selected):hover { background-color: ...; }`. Applying `transition` on the base `.component` rule leaks animation onto all variants — even those with no hover defined in Figma.
- **Interaction discovery rule:** After building the variant table (Step 1b), scan every variant name for states implying user-triggered JS interaction: Selected, Checked, Expanded, Active, Open, Toggled, Highlighted, Pressed. Pure CSS states (hover, focus, disabled) are NOT included. If any are found, STOP before Step 2 (screenshot) and ask the user to describe the expected behavior (single-select vs multi-select, toggle on/off, click-outside deselects, keyboard behavior). Do not infer from variant names — "Selected" can mean radio, checkbox, or toggle depending on context. Concrete mistake: VersionHistoryRow "Selected" / "Selected & Live" variants had no JS implemented until the user asked sessions later.

## Reference Images
- User drops reference images into `refs/` at the project root for discussion
- When starting a session or when asked to "check refs", read all images in that folder
- Images may show browser screenshots, Figma designs, or layout issues to discuss

## Detailed Notes
- See `project-structure.md` for full file inventory
