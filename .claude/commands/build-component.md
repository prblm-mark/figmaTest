# /build-component

Build a new component from Figma into the design system, or audit/refine an existing one.

Usage: `/build-component <Figma URL or node description>`

---

## Process (follow every step in order)

### 1. Locate

**Step 1a — find the component set:**
Call `get_metadata` on the **Figma file page** to see the full layer tree and locate the target
component frame. Note the component set node ID (the parent frame, e.g. `68:5443`).

- File key: extract from URL (e.g. `8OAAokH2JXhIvGZFrlzeKT`)
- Page node: usually `1:769` for the Components page — confirm from URL `node-id` param

**Step 1b — enumerate ALL variants:**
Call `get_metadata` again, this time on the **component set node itself** (not the page).
This lists every variant as a direct child with its exact name and node ID.

**Do not skip this step even for sub-components or dependencies.** A single node ID from a URL
or a parent component's tree represents only ONE variant. Without this step you will silently
miss entire states, sizes, or device breakpoints (e.g. the Header component has 6 variants
across State × Device — building from node `68:5444` alone missed 5 of them).

Build a variant table before writing any code:

| Node ID | Variant name | Notes |
|---|---|---|
| 68:5444 | State=Default, Device=Default | — |
| 68:5488 | State=Tooltip, Device=Default | — |
| … | … | … |

**Every variant in this table MUST be built. No exceptions for "unused" variants.**
- "Unused by current components" is not a valid reason to skip a variant.
- "Looks identical to another variant" is not a valid reason — fetch its design context and confirm.
- If a user explicitly instructs you to skip a specific variant, note it in the table and figma-notes.md with a reason. Otherwise build it.

The variant table is a **contract** — every row must be represented in the CSS, the demo HTML, and the figma-notes.md variant matrix. A row absent from any of those three means the build is incomplete.

### 2. Screenshot

Call `get_screenshot` on the **parent frame** (the one containing all variants/states).
This gives a visual overview before touching any code — use it as the reference throughout.

### 3. Design context — root

Call `get_design_context` on the root/parent node.
Extract from the output:
- All child node IDs (look for `data-node-id` attributes)
- Exact CSS variable names used (pattern: `var(--ai-*,fallback)`)
- Explicit dimensions (height, width, padding — especially any fixed `h-[...]`)
- Typography tokens (font-size, line-height, font-weight variables)

### 4. Design context — child nodes

For each **distinct child component** (especially interactive sub-components like inputs, icons, badges):
call `get_design_context` on that child node ID separately.

Fetch `get_design_context` for: each **Type** variant (e.g. Primary / Secondary / Tertiary),
each **Size** (base / sm), and **every interactive State** (Default, Hover, Focus, Pressed, Disabled).

**Never skip interactive states.** A state that looks like "just a color change" often isn't —
Figma may flip the entire visual treatment (e.g. alert-outline hover/focus/pressed becomes
fully solid red with white text, completely different from the outlined default state).
Inferring interactive states is the same as hardcoding — always fetch and read the actual nodes.

**Critical — fetch every size variant separately.** Never assume a smaller size uses a smaller
token (e.g. the sm button uses `--ai-radius-md`, not `--ai-radius-sm`). Call `get_design_context`
on each size node individually and read the exact tokens.

**Critical — check ALL properties on EACH variant independently, not just layout or colour.**
When a component has multiple sizes or states, do NOT carry a property value from one variant to
another without checking. For each size/variant independently verify: icon sizes, border widths,
nested child-component sizing (buttons, avatars, inputs). Concrete mistake: Avatar's checked icon
was read as 16px on Size=1/2 and silently applied to all sizes — Figma actually uses 24px for
Size=3/4/5. The only way to catch this is to call `get_design_context` on each size variant and
compare every property, not just the ones expected to change.

**Critical — scan for nested components in design context output.** After fetching design context,
scan every `data-name="..."` attribute in the output. **Any element with a `data-name` attribute
IS a Figma component — regardless of what HTML element it renders as.** A `data-name="Female 1"`
that renders as an `<img>` is a Figma component just as much as a `data-name="Tooltip"` that
renders as a `<div>`. The rendered HTML type is NOT the signal — the `data-name` attribute is.
No exceptions for elements that appear "too simple" to be a component (this mistake caused
`data-name="Female 1"` to be implemented as a raw `<img>` instead of the Portraits component).

For each named nested component found:
1. Check `src/components/` — does it exist?
2. If **missing** → STOP. Do not write any code for the parent. Report the missing dependency
   and follow the bottom-up build order (build the child first, then return to the parent).
3. If **existing** → audit it (Steps 3–6 of `/review-component`) before using it.

Never implement a named Figma component as scoped CSS inside the parent (e.g. `.header__tooltip`).
That duplicates what should be a standalone reusable component.


**Critical — flag contextual overrides before implementing.**
When fetching design context for a parent component, if a child component instance has a property
set differently from the child's base design (e.g. title width set to fill-container, padding
changed, colour overridden), STOP before writing any code. Report the anomaly to the user:

- What the child's base value is
- What the parent has set it to
- Which case it appears to be:
  - **Case A — Formal variant:** the customisation exists as a variant in the child's Figma
    component set → add it to the child component
  - **Case B — Contextual override:** a one-off usage not formalised as a variant → scope it
    to the parent with a modifier/override class, document in the parent's `figma-notes.md`

Wait for the user to confirm the case before implementing anything. This means **zero code written** until the user responds — no CSS, no HTML, not even a placeholder. The stop is absolute.

Concrete mistake: VersionHistory used a Header with its title set to `fill-container` (pushing InfoLabel to the far right). This was a contextual override — it was silently implemented without flagging, producing the wrong layout, and required a separate fix session. "I can see what it should do" is not a reason to skip the stop.

### 5. Variables

Call `get_variable_defs` on the root node to get the complete Figma variable → CSS token map.

**Critical:** scan for any **design value** that does NOT have a corresponding `--ai-*` semantic
token — including Figma primitives (e.g. `Red/400`, `Gray/900`) and arbitrary values.

Design values are: colors, spacing/sizing, typography (font-size, weight, line-height), and
border-radius. Structural CSS values (`transition`, `opacity`, `cursor`, `border: 1px solid`,
`outline: none`) are implementation details and do NOT need to be tokens — use them freely.

**STOP here for any unresolved design value. Do not proceed to Step 6 or write any code.**
Report each gap to the user:
- Property name, affected state/variant
- Figma value and primitive name if identifiable (e.g. "alert hover bg → Red/400 = `#f87171`")

**Prior approvals do NOT carry forward.** Even if a primitive (e.g. Red/400) was approved in a
previous session or for a different variant of the same component, stop and ask again. Each use
requires explicit confirmation — this adds a layer of certainty and keeps the token gap record
accurate and up to date.

Wait for the user to decide: add a semantic token to Figma, approve using the primitive, or skip the state.
Only continue once every gap has a resolution.

### 6. Code Connect check

Call `get_code_connect_map` on the root node to check if this component already exists in the codebase.
- If **no mapping**: create new files from scratch
- If **mapping exists** (audit/refine mode): read the existing CSS and HTML files, then compare
  against what Figma now shows — list any tokens, variants, or states that are missing, outdated,
  or incorrect before making any changes
- In either case: cross-reference every `--ai-*` token in the component CSS against the current
  `css/tokens.css` and `css/tokens-dark.css`. Check for newly added tokens that the component
  should be using but isn't (e.g. a new `--ai-btn-primary-text` that supersedes `--ai-text-invert`
  for primary button text). Run `npm run tokens` first to ensure the generated CSS is current.

### 7. State × size × variant matrix

**Before writing any CSS**, build a complete table:

| Type | Sizes | States | Icon Only? |
|---|---|---|---|
| Primary | base, sm | Default, Hover, Focus, Pressed, Disabled | Yes/No |
| ... | | | |

Rules:
- **Never infer sizes from padding alone** — check for explicit `h-[...]` or `w-[...]` in design context
- **Check for spurious variants in existing code** — if an existing CSS class (e.g. `.btn--lg`) has no Figma counterpart, remove it
- **List any missing variants** not yet in CSS before implementing

### 8. Implement

Write the component files following project conventions:

**CSS (`<Name>.css`):**
- BEM naming: `.component`, `.component__element`, `.component--modifier`
- Only `--ai-*` semantic variables, or primitives explicitly approved by the user in Step 5
- Approved primitives: use the hex value with a comment citing the primitive name (e.g. `/* Red/400 */`)
- Never hardcode arbitrary hex values or named colors
- **Dimension values (spacing, sizing, font-size, line-height, border-radius) → always use `rem` via `--ai-*` tokens.** Border widths (`1px`, `2px`) and box-shadow pixel offsets stay as `px` — they are optical units, not scaled with font-size.
- **Hardcoded dimension stop rule:** If a dimension value in component CSS (or any nested sub-component) is NOT a border-width or box-shadow offset and cannot be expressed as an `--ai-*` token, STOP. Do not write or leave the value. Report the property name, the component, and the Figma value. Ask the user how to handle it (add a token, approve a rem conversion, etc.) before continuing. This mirrors the token gap stop rule.
- Base state first, then variant modifiers, then size modifiers, then combined (`.variant.size`)
- Include `:hover`, `:active`, `:focus-visible`, `:disabled` pseudo-classes
- Add `min-height` (not just padding) when Figma specifies a fixed height
- **Responsive layout:** use `@media (max-width: 767px)` for device-driven layout changes — NEVER a `.component--mobile` modifier class. Breakpoint: `max-width: 767px` = mobile, 768px+ = desktop.
- **Fluid typography is free:** components using `--ai-font-fluid-*` tokens automatically get the correct mobile font size via `tokens-mobile.css` — no extra media queries needed for font size.
- **Mobile child-component sizing:** When a Device=Mobile variant exists, always check whether nested child components (e.g. buttons, icons, inputs) change size at mobile — not just layout. Fetch `get_design_context` on the mobile variant and compare `h-[...]`, `px-[...]`, and `text-[length:...]` values against the desktop variant. If child sizes change, add scoped overrides inside the `@media (max-width: 767px)` block (e.g. `.header__actions .btn { min-height: ...; padding: ...; font-size: ...; }`). Never rely on the HTML having a `--sm` modifier class to handle this — that only works for static layouts, not responsive ones.
- **Mobile mode safety net:** After building the variant table (Step 1b), if no Device=Mobile (or equivalent) variant was found, scan the design context output and any mode/token references for the word "mobile" (e.g. `Modes / typography:mobile`, `device:mobile`, mode names in `$extensions`). If "mobile" appears anywhere and has NOT already been accounted for as a variant, STOP and ask the user: "I see a mobile mode referenced but no Device=Mobile variant in the component set — should this component have a mobile layout variant?" Do not assume it is covered by fluid tokens alone.

**HTML (`<Name>.html`):**
- Semantic elements: `<button>` for actions, `<a>` for navigation, `<input>` for inputs
- Link `../../styles/base.css` then `<Name>.css`
- Include a demo section for **every variant × size** combination
- Include all interactive states (hover, error, disabled) as separate demo rows
- Add Lucide CDN script at bottom: `<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>`
- Icons: `<i data-lucide="icon-name" aria-hidden="true"></i>` — never inline SVG
- **No separate mobile demo sections.** If the component has a Device=Mobile variant, implement it as `@media (max-width: 767px)` in CSS. The single demo section responds automatically — add the note "Resize viewport below 768px to see mobile layout" to the section title or subtitle.

**Accessibility (WCAG 2.1 AA):**
- `aria-label` on icon-only buttons
- `role="alert"` on error messages
- `:focus-visible` outline: `2px solid var(--ai-surface-brand)`
- Touch targets: minimum 44×44px for interactive elements

### 9. Document (`<Name>.figma-notes.md`)

**Cascade child updates to all parent demos.** After building or updating any child component,
search the codebase for every parent demo that uses it (`grep -r "class=\"<component>"` across
`src/components/`) and verify that each parent demo reflects the current child markup. A parent
demo showing stale child HTML is a broken demo. Concrete mistake: after Avatar was corrected to
use `<img class="portrait">` inside `.avatar`, VersionHistoryRow and VersionHistory demos still
used empty `<div class="avatar">` divs showing grey fallback circles — requiring a separate fix.

**figma-notes.md is a live record — keep it in sync with code changes.**
Any time CSS class names, HTML structure, or component dependencies change (e.g. refactoring
inline elements into a standalone child component), the `figma-notes.md` CSS Class Mapping
and Dependencies sections MUST be updated in the **same commit**. Do not defer this to later.
An outdated figma-notes.md is a mistake: it misleads the next session about what classes and
dependencies are actually in use.

The same applies to `CLAUDE.md §10` — if a component's composition changes, update its row
atomically (e.g. add "Composes Avatar" when Avatar is substituted for an inline placeholder).

Write a complete notes file containing:

```markdown
# <Name> — Figma Notes

## Figma Node
File key, page node, component node IDs per variant

## Variant × Size × State Matrix
(table from step 7)

## CSS Class Mapping
(Figma property → CSS class)

## Token Mapping
(Figma variable → CSS variable → role)

## Token Gaps
(any raw primitives with no --ai-* token; decision taken)

## Notes
- Any naming mismatches (Figma name vs Lucide name)
- Any hidden properties
- Any typos in Figma variable names (e.g. "compnonents")
```

### 10. Register

Add a row to **CLAUDE.md Section 10** component tracker:

```
| ComponentName | Built | [Figma URL](url) | Notes |
```

---

## Quick reference: token categories

| Need | Token prefix |
|---|---|
| Backgrounds | `--ai-surface-*` |
| Text colors | `--ai-text-*` |
| Icon colors | `--ai-icon-*` |
| Border colors | `--ai-border-*` |
| Border radius | `--ai-radius-sm/md/lg/xl/full` |
| Spacing / size | `--ai-spacing-1` … `--ai-spacing-13` |
| Font size (fixed) | `--ai-font-fixed-xxs` … `--ai-font-fixed-4xl` |
| Font size (fluid) | `--ai-font-fluid-xxs` … `--ai-font-fluid-4xl` — **genuinely responsive** via `tokens-mobile.css`; desktop value at ≥768px, smaller mobile value at ≤767px. No component CSS needed for typography responsiveness. |
| Font weight | `--ai-font-regular/medium/semibold/bold/extrabold` |
| Line height | `--ai-leading-1` … `--ai-leading-5` |
| Button-specific | `--ai-btn-primary/secondary/disabled` + hover/focus/pressed |

Full token reference: CLAUDE.md Section 2 & 3.

---

## Common pitfalls (learned from Button audit)

- `button/base` typography in Figma → `--ai-font-fluid-xs` (14px) + `--ai-leading-1` (16px), NOT fixed-sm + leading-2
- `button/sm` → `--ai-font-fluid-xxs` (12px), NOT fixed-xs
- Figma sets fixed heights (40px base, 32px sm) — add `min-height`, not just padding
- Tertiary = white bg + **no border** (distinct from Secondary which has `--ai-border-secondary`)
- Alert background (`Red/500`) → `--ai-surface-error` (#ef4444) IS a semantic token ✓. The gaps are hover/pressed: Red/400 (`#f87171`) and Red/600 (`#dc2626`) have no semantic token yet
- **Alert-outline interactive states are NOT "subtle tint + border shift"** — Figma flips them to fully solid red (Red/400 hover/focus, Red/600 pressed) with white text (`--ai-text-invert`), identical to the alert (solid) variant. The "outline" appearance only exists in the default state.
- `.btn--lg` does not exist in Figma — never assume a "large" size exists
- **Button variant identification:** When a Button instance appears in design context, ALWAYS check the Figma component `type` property or variant name (visible in `get_metadata` as `Type=Primary`, `Type=Secondary`, `Type=Tertiary` etc.) in addition to checking for a `border` class in the design context. Secondary and tertiary buttons share the same white bg. Background colour alone is never sufficient to identify the variant.
- **Font family rule:** Map font-style names from design context directly: `title/*` → `--ai-font-title`; `body/*` → `--ai-font-body`. Never assume text content uses `--ai-font-body` — always read the font style name from the design context output.
- **Hover scoping:** When a hover state exists only on specific Figma variants (e.g. Default, not Live/Selected), scope BOTH the `transition` and the `:hover` rule to those variants using `:not()`. The `transition` must live on a companion rest-state rule (NOT inside the `:hover` rule) so it animates both entry and exit. Pattern:
  ```css
  /* Rest state — transition both ways */
  .component:not(.component--live):not(.component--selected) {
    transition: background-color var(--ai-transition-default);
  }
  /* Hover — only on variants that have it in Figma */
  .component:not(.component--live):not(.component--selected):hover {
    background-color: var(--ai-surface-secondary);
  }
  ```
  Placing `transition` on the base `.component` selector leaks animation onto all variants including those without a Figma hover state.
- Icon SVGs use `currentColor` → set color via `color:` property using `--ai-icon-*` tokens
- Form field filled text = `--ai-text-primary`; placeholder = `--ai-text-contrast` (different tokens!)
- Clear button visibility: use `visibility: hidden` + `:has(:not(:placeholder-shown))` — no JS needed
- **Always use the exact token from Figma** — never substitute a different token based on personal judgement (e.g. swapping `--ai-text-invert` for `--ai-text-contrast` because it "looks better"). If a Figma token seems wrong, flag it to the user instead of silently changing it.
- **Focus ring pattern:** Figma focus states use a double box-shadow ring, NOT an outline. Write `:hover` and `:focus-within` as **separate rules** — never combine them or focus will never receive its shadow. Suppress the global `:focus-visible` outline (from `base.css` line 56) on child interactive elements inside the component wrap:
  ```css
  .component__wrap:hover { border-color: var(--ai-border-brand); }
  .component__wrap:focus-within {
    border-color: var(--ai-border-brand);
    box-shadow: 0 0 0 1px var(--ai-surface-primary),
                0 0 0 3px var(--ai-surface-brand-contrast);
    outline: none;
  }
  /* Suppress base.css global :focus-visible on child elements */
  .component__control:focus-visible,
  .component__clear:focus-visible { outline: none; }
  ```
