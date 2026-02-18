# Plan: Figma + Claude Code Design System Integration

## Context
The team wants a workflow where designers share a Figma component URL → Claude reads it via the
Figma MCP server → generates production code using **only** the project's design system tokens
(`--ai-*` CSS variables). A bi-directional loop is also needed so built UIs can flow back to Figma.

The project already has:
- Figma tokens exported as DTCG JSON (`FigmaTokens/`) — but no CSS file generated from them yet
- Figma MCP server already configured for Claude (personal level)
- No `CLAUDE.md`, no `.mcp.json`, no token pipeline, no component structure

**Note:** Code Connect CLI publishing requires Figma Org/Enterprise plan. Since the team is on
Professional/Starter, we use the Figma MCP server tools (`get_code_connect_map`,
`add_code_connect_map`) for component mapping instead of `@figma/code-connect` CLI publishing.

---

## Scope — 5 Deliverables

### 1. Token Compilation Pipeline
**Goal:** Auto-generate `css/tokens.css` (with all `--ai-*` CSS custom properties) from the DTCG JSON files.

**Approach:** Use **Style Dictionary v4** — it natively supports DTCG format and can resolve
Figma's alias references (`{surface.brand}` → hex value).

**Files:**
- `style-dictionary.config.mjs` (new) — config: reads `FigmaTokens/**/*.json`, outputs `css/tokens.css`
- `package.json` (modify) — add `"tokens": "node style-dictionary.config.mjs"` script
- `css/tokens.css` (generated output, committed as artifact)

**Install:** `npm install --save-dev style-dictionary`

**Output format example:**
```css
:root {
  /* Surface */
  --ai-surface-primary: #ffffff;
  --ai-surface-secondary: #f3f4f6;
  --ai-surface-brand: #1c64f2;

  /* Text */
  --ai-text-primary: #1f2a37;
  --ai-text-secondary: #4b5563;

  /* Border */
  --ai-border-secondary: #e5e7eb;
  --ai-radius-sm: 4px;
  --ai-radius-md: 8px;

  /* Spacing */
  --ai-spacing-1: 4px;
  --ai-spacing-5: 16px;

  /* Typography */
  --ai-font-body: 'Inter', sans-serif;
  --ai-font-fixed-sm: 16px;
  --ai-font-semibold: 600;
}
```

---

### 2. Project-Level Figma MCP Config (Team-Shareable)
**Goal:** Commit an `.mcp.json` so every team member automatically gets Figma MCP tools in
Claude Code without manual setup.

**File:** `.mcp.json` (new, in project root — checked into git)

```json
{
  "mcpServers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

Each developer authenticates personally via `claude mcp auth figma` — credentials stay local.

---

### 3. CLAUDE.md — Design System Governance
**Goal:** A comprehensive rules file that Claude reads at the start of every session. This is
the primary mechanism for enforcing "use only our design system."

**File:** `CLAUDE.md` (new, in project root)

**Sections:**
1. Project overview — what this codebase is and its purpose
2. Design System Tokens — every `--ai-*` variable listed by category with purpose and value
3. Typography rules — font families, sizes, weights, line heights with exact variable names
4. Component Architecture — how components are structured in `src/components/`
5. Figma → Code workflow — step-by-step instructions Claude must follow when given a Figma URL
6. Code → Figma workflow — bi-directional steps to push built UI back to Figma
7. Forbidden practices — explicit NO list (no hardcoded hex, no arbitrary spacing, etc.)
8. Accessibility standards — WCAG AA requirements
9. Current components — table of what's already built vs what's in Figma
10. Adding a new token — update procedure

---

### 4. Component Directory Scaffold
**Goal:** Establish a clear structure for components so Claude always knows where to put things.

```
src/
└── components/
    └── Button/
        ├── Button.html          (standalone demo)
        ├── Button.css           (uses --ai-* tokens only)
        └── Button.figma-notes.md (documents Figma node URL + property mapping)
```

**Also:** `src/styles/base.css` — imports `css/tokens.css` and sets body defaults using tokens.
Update `index.html` to link `src/styles/base.css`.

---

### 5. Workflow Documentation
**Goal:** A short `docs/figma-workflow.md` that the design/dev team can follow. Covers:
- How to find a Figma node URL (right-click → Copy link)
- What to paste into Claude Code and how to phrase the prompt
- How Claude uses MCP tools internally (what it sees)
- How to push completed UI back to Figma (Code to Canvas via `generate_figma_design`)
- How to add a new token (edit Figma → export JSON → run `npm run tokens`)

---

## Bi-Directional Workflow (End-State)

```
FIGMA (design)
  │
  │  Designer right-clicks component → "Copy link"
  │  Shares URL with developer
  ▼
CLAUDE CODE (MCP tools)
  ├── get_design_context → reads layout, spacing, colors
  ├── get_variable_defs  → extracts which --ai-* tokens are used
  └── get_code_connect_map → finds if component exists in codebase already
  │
  │  Generates HTML/CSS using only --ai-* variables
  │  (CLAUDE.md prevents any hardcoded values)
  ▼
CODEBASE (src/components/)
  │
  │  Developer builds, tests, runs locally
  │
  ▼
FIGMA (via MCP generate_figma_design tool)
  └── Built UI pushed back to Figma as editable frames
      Designer refines → shares updated URL → cycle repeats
```

---

## Critical Files

| File | Status | Action |
|------|--------|--------|
| `style-dictionary.config.mjs` | New | Create with DTCG platform config |
| `package.json` | Modified | Added `tokens` script, installed style-dictionary |
| `css/tokens.css` | Generated | Output of `npm run tokens` |
| `.mcp.json` | New | Team-shared Figma MCP config |
| `CLAUDE.md` | New | Design system governance (most important file) |
| `src/components/Button/Button.css` | New | First component example using tokens |
| `src/components/Button/Button.html` | New | Standalone component demo |
| `src/components/Button/Button.figma-notes.md` | New | Figma mapping docs |
| `src/styles/base.css` | New | Global base styles using tokens |
| `docs/figma-workflow.md` | New | Team workflow guide |
| `docs/plan.md` | New | This file |

**Token files (read-only source):**
- `FigmaTokens/Primitive.tokens.json` — color palette
- `FigmaTokens/Light.tokens.json` — semantic tokens (primary CSS output)
- `FigmaTokens/Typography/Desktop.tokens.json`
- `FigmaTokens/Typography/Mobile.tokens.json`

---

## Code Connect Path Forward (if plan upgraded to Org/Enterprise)
When/if the team upgrades to a Figma Org plan, Code Connect CLI publishing can be added:
- Install `@figma/code-connect`
- Add `figma.config.json` with `parser: "html"`
- Create `src/components/Button/Button.figma.js` (mapping already documented in `figma-notes.md`)
- Run `npx figma connect publish --token=$FIGMA_ACCESS_TOKEN`

This is why `Button.figma-notes.md` documents the Figma node URLs now — zero rework later.

---

## Verification Checklist

1. **Token pipeline:** Run `npm run tokens` → `css/tokens.css` appears with all `--ai-*` variables
2. **MCP test:** Open Claude Code in project, share a Figma component URL, ask Claude to build
   it. Verify the generated CSS uses only `--ai-*` variables, no hex codes.
3. **CLAUDE.md enforcement:** Ask Claude to build a component without a Figma URL — it should
   still use design tokens and follow the structure in `src/components/`
4. **Bi-directional test:** Ask Claude to use `generate_figma_design` with a built component's
   URL/screenshot and confirm it appears in Figma
5. **Team setup:** A second team member clones repo, runs `claude mcp auth figma`, confirms
   Figma MCP tools are available (`/mcp status`)
