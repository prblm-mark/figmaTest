# /review-component

Audit a composite Figma component, map all nested dependencies, verify each against the
codebase, and produce an approved build plan before writing any code.

Usage: `/review-component <Figma URL>`

---

## Process (follow every step in order)

### 1. Map the component tree

Call `get_metadata` on the Figma file page to get the full layer tree.
Locate the target component frame and recursively identify every nested component instance —
including components nested inside nested components (full depth).

For each unique component found, record:
- Component name
- Figma node ID and URL
- Depth in the tree (root = 0, direct child = 1, etc.)
- How many times it appears (e.g. Input × 3)

Output a tree like:
```
SignUpForm (root)
├── Header (depth 1) — node 68:5444
│   └── InfoLabel (depth 2) — node 68:4410
├── Input (depth 1, ×3) — node 78:2016
└── Button (depth 1) — node 53:2489
```

### 2. Check each component against the codebase

For each unique component in the tree, check `src/components/` for a matching directory.

- **Missing** → mark as `✗ Missing` — needs to be built from scratch
- **Exists** → proceed to Step 3 audit for that component

### 3. Audit each existing component against Figma

For every component in the tree (whether existing or missing), first call `get_metadata` on its
**component set node** to enumerate all variants. Do NOT rely on the single node ID surfaced
in the parent's tree — that is one variant, not the full component.

**This applies equally to sub-components built as dependencies.** Skipping this step caused
the Header component to be built from a single variant node, missing 5 of its 6 variants
(Mobile device breakpoint, Discard state, Tooltip state) entirely.

For every component marked as existing, run a quick audit:

1. Call `get_metadata` on the component set node to list all variants
2. Call `get_design_context` on each distinct variant node
3. **Scan every `data-name="..."` in the design context output.** Any named element that is
   not a standard HTML primitive is a Figma component. If it is not already in `src/components/`
   it must be added to the build plan as a missing dependency — it must NOT be implemented
   inline inside the parent. This is how the Tooltip component was missed: it appeared as
   `data-name="Tooltip"` in the Header design context but was implemented as `.header__tooltip`
   scoped CSS instead of a standalone component.
4. Call `get_variable_defs` on the root node
5. Read the existing `<Name>.css` and `<Name>.html` from the codebase
6. Compare and flag any discrepancies:
   - Tokens in Figma not present in CSS (missing or wrong token)
   - Variants/states in Figma not implemented in CSS
   - CSS classes with no Figma counterpart (spurious — candidate for removal)
   - Token gaps (design values with no `--ai-*` token — apply the same stop rule as `/build-component` Step 5)

**Flag contextual overrides before marking status.** If a child component instance within the
parent has a property set differently from the child's base design (e.g. title width changed,
colour overridden), STOP and report it to the user before continuing. Describe what differs and
propose which case it is:

- **Case A — Formal variant:** exists in the child's component set → add to the child
- **Case B — Contextual override:** one-off usage in the parent → scope to parent with an
  override class, document in the parent's `figma-notes.md`

Wait for confirmation before including it in the build plan.

**Critical — check for token drift.** Before marking a component as current, cross-reference
every `--ai-*` token used in the component's CSS against the current `css/tokens.css` and
`css/tokens-dark.css`. Flag as `⚠ Outdated` if:
- The component uses a semantic token (e.g. `--ai-text-invert`) where a more specific token
  now exists for that role (e.g. `--ai-btn-primary-text` was added specifically so primary
  button text stays white in dark mode, rather than inverting with `--ai-text-invert`)
- A new `--ai-*` token has been added to the token files that the component should be using
  but isn't — run `npm run tokens` first to ensure the generated CSS is current, then grep
  the token files for any variables not yet referenced in the component CSS

This applies to **all nested components** too — a parent component being audited should
trigger a token drift check on every child component it composes.

Mark the component as:
- `✓ Current` — matches Figma, no action needed
- `⚠ Outdated` — exists but has discrepancies (list each one)

### 4. Resolve token gaps

If any audit (Steps 2 or 3) surfaces a design value with no `--ai-*` semantic token:

**STOP. Do not produce the build plan yet.**
Report each gap — property name, affected component/state, Figma value, primitive name if
identifiable. Wait for the user to decide before continuing.

**Prior approvals do NOT carry forward.** Even if a primitive (e.g. Red/400) was approved in a
previous session or for a different variant/component, stop and ask again every time it appears.
Each use requires explicit confirmation.

### 5. Present the build plan

Output a summary table and await user approval before writing any code:

```
Component     | Status      | Action
--------------|-------------|------------------------------------------
InfoLabel     | ✗ Missing   | Build (no dependencies)
Header        | ✗ Missing   | Build after InfoLabel
Input         | ✗ Missing   | Build (no dependencies)
Button        | ⚠ Outdated  | Update — missing alert hover state (Red/400)
SignUpForm    | ⚠ Outdated  | Update after all above are resolved
```

Include:
- Bottom-up build order (leaves first, root last)
- For Outdated components: a bullet list of what needs to change
- For Missing components: "Build from scratch"

**Do not proceed until the user explicitly approves the plan.**

### 6. Execute

Once approved, work through the plan in order:

- **Missing** → run the full `/build-component` process for that node
- **Outdated** → apply only the changes listed in the audit (do not rewrite the whole component)
- **Current** → no action

After all dependencies are resolved, build or update the root/parent component last,
composing the child components in its HTML rather than duplicating their markup.

### 7. Composition rules

When the parent component HTML references a child component:
- Use the child's existing BEM class structure — do not re-implement it inline
- Link the child's CSS in the parent's HTML demo page alongside the parent's CSS
- Note the dependency in the parent's `figma-notes.md`

---

## Key principles

- **Never build the parent before all children are current** — the parent's fidelity depends on
  its children being correct first
- **Audit ≠ rebuild** — for outdated components, make targeted changes only, not a full rewrite
- **Token gaps block the plan** — surface them in Step 4 before showing the user any build order
- **Reuse, don't duplicate** — if Button exists and is current, the parent just references it
- **Always enumerate variants via `get_metadata` on the component set node** — never assume a
  single node ID is the complete component. A URL node ID or a parent tree reference is one
  variant. Call `get_metadata` on the component set to see all of them before auditing or building.
- **Never implement a `data-name` component inline** — if design context output contains
  `data-name="Tooltip"` (or any named component), it must become `src/components/Tooltip/`,
  not `.parent__tooltip` scoped CSS. Inline implementation breaks reusability and violates
  the bottom-up build order. When a user says "go ahead and build X", still run the full
  tree-mapping process — do not skip straight to implementation.
- **Responsive layout via media queries, not modifier classes** — when a component has a
  Device=Mobile variant, flag any existing `.component--mobile` modifier class as `⚠ Outdated`.
  The correct implementation is `@media (max-width: 767px)` rules in the component CSS.
  Breakpoint: `max-width: 767px` = mobile, 768px+ = desktop.
- **Button variant identification:** When auditing a component that contains a Button instance, always verify the button's Figma variant (`Type=Primary`, `Type=Secondary`, `Type=Tertiary` etc.) via `get_metadata` on the Button component set — not just the background colour. Secondary and tertiary both use white bg; absence of a `border` class in design context is a secondary signal, but the variant name is definitive. Flag as `⚠ Outdated` if the wrong variant class is used.
- **Font family audit rule:** When reviewing component CSS, cross-check every `font-family` token against the font-style name in design context: `title/*` → `--ai-font-title`; `body/*` → `--ai-font-body`. Flag any element using `--ai-font-body` where the design context shows a `title/*` style as `⚠ Outdated`.
- **Dimension values use `rem`** — all spacing, sizing, font-size, line-height, and border-radius values are `rem` via `--ai-*` tokens (16px = 1rem). Border widths (`1px`, `2px`) and box-shadow pixel offsets stay as `px`. Flag any hardcoded `px` dimension value (that is NOT a border-width or shadow offset) as `⚠ Outdated`. If the value cannot be expressed as an `--ai-*` token, apply the hardcoded dimension stop rule: report it to the user before continuing.
- **Fluid tokens are automatically responsive** — `--ai-font-fluid-*` tokens change value at
  ≤767px via `tokens-mobile.css`. If a component has hardcoded font-size overrides in a mobile
  block for fluid token values, flag those as spurious — they are already handled by the token layer.
- **Mobile child-component sizing** — when auditing a Device=Mobile variant, always compare
  `h-[...]`, `px-[...]`, and `text-[length:...]` values for every nested child component against
  the desktop variant. If a child (e.g. buttons in an actions slot) is smaller at mobile, the fix
  is a scoped override inside `@media (max-width: 767px)` (e.g. `.parent__actions .btn { ... }`),
  NOT a `--sm` modifier class in the HTML. Flag any missing scoped size overrides as `⚠ Outdated`.
- **Mobile mode safety net** — after enumerating all variants via `get_metadata`, if no
  Device=Mobile (or equivalent) variant was found, scan the design context output and any
  mode/token references for the word "mobile" (e.g. `Modes / typography:mobile`, `device:mobile`,
  mode names in `$extensions`). If "mobile" appears anywhere and has NOT already been accounted
  for as a variant, STOP and ask the user before continuing the audit: "I see a mobile mode
  referenced but no Device=Mobile variant in the component set — should this component have a
  mobile layout variant?" Do not assume fluid tokens alone are sufficient.
