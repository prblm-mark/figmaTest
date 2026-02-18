# Figma ↔ Claude Code Workflow Guide

A short reference for the design/dev team on how to use the Figma + Claude Code integration.

---

## Overview

```
FIGMA (design)
  │
  │  Designer right-clicks component → "Copy link"
  │  Shares URL with developer
  ▼
CLAUDE CODE (MCP tools)
  ├── get_design_context   → reads layout, spacing, colors from Figma
  ├── get_variable_defs    → extracts which --ai-* tokens are applied
  └── get_code_connect_map → checks if component already exists in code
  │
  │  Generates HTML/CSS using only --ai-* variables
  │  (CLAUDE.md enforces zero hardcoded values)
  ▼
CODEBASE (src/components/)
  │
  │  Developer builds, tests, runs locally
  │
  ▼
FIGMA (via generate_figma_design MCP tool)
  └── Built UI pushed back as editable Figma frames
      Designer refines → shares updated URL → cycle repeats
```

---

## Part 1: Figma → Code

### Step 1: Get the Figma Node URL

1. Open the Figma file
2. Click on the component, frame, or element you want to build
3. Right-click → **Copy link to selection** (or use ⌘L / Ctrl+L)
4. The URL looks like: `https://www.figma.com/design/FILEID/File-Name?node-id=123%3A456`

> **Tip:** Link to the component itself (in the component library), not an instance on the canvas,
> for the most accurate variable data.

### Step 2: Prompt Claude Code

Paste the URL into Claude Code with a prompt like:

```
Build the Button component from this Figma URL:
https://www.figma.com/design/...

Use only --ai-* CSS variables. Create the files in src/components/Button/.
```

Or for a more specific ask:

```
Here's the Card component from Figma: [URL]
Generate src/components/Card/Card.css and Card.html following our component
architecture from CLAUDE.md.
```

### Step 3: What Claude does internally

Claude Code will call these MCP tools automatically:

| Tool | What it does |
|---|---|
| `get_design_context` | Reads the component's layout, spacing, auto-layout settings, and fills |
| `get_variable_defs` | Extracts which Figma variables (tokens) are bound to each layer |
| `get_code_connect_map` | Checks if a code mapping already exists for this component |

Claude then maps each Figma variable to its `--ai-*` counterpart using the table in `CLAUDE.md`,
and generates the component files.

### Step 4: Review and test locally

```bash
npm start        # opens localhost with hot reload
```

Open `src/components/<Name>/<Name>.html` to see the standalone component demo.

---

## Part 2: Code → Figma

### Push built UI back to Figma

Once you're happy with the built component, you can push it back to Figma as an editable frame:

1. Ask Claude Code:
   ```
   Use generate_figma_design to push the Button component back to Figma.
   Here's the component HTML and CSS: [paste or reference the files]
   ```
2. Claude calls `generate_figma_design` via the Figma MCP tool
3. A new frame appears in your current Figma file/page
4. Share the frame URL with the designer for review

This closes the loop: design refines, exports again, you run `npm run tokens` and rebuild.

---

## Part 3: Token Updates

### When a designer changes a token value in Figma

1. Designer updates the variable in Figma's Variables panel
2. Designer re-exports using the Figma export plugin → saves to `FigmaTokens/`
3. Developer runs:
   ```bash
   npm run tokens
   ```
4. `css/tokens.css` regenerates with the new values
5. All components that use that token update automatically (no code changes needed)
6. Update `CLAUDE.md` Section 2 or 3 with the new value for documentation

### When a new token is added in Figma

Same flow as above, plus:
- Update the tables in `CLAUDE.md` Sections 2–3 with the new `--ai-*` variable

---

## Part 4: Team Setup

### First-time setup (every developer)

```bash
git clone <repo>
cd figmaTest
npm install          # installs all deps including style-dictionary
npm run tokens       # generates css/tokens.css from FigmaTokens/
npm start            # starts dev server
```

### Enable Figma MCP in Claude Code

The `.mcp.json` in the project root gives Claude Code access to Figma MCP tools automatically.
Each developer must authenticate once:

```bash
claude mcp auth figma
```

Follow the prompts — you'll be directed to Figma to approve access. Credentials stay local to
your machine; they are never committed to the repo.

Verify it worked:

```
/mcp status
```

You should see `figma` listed as connected.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm run tokens` fails with parse errors | Check `FigmaTokens/*.json` for malformed JSON; re-export from Figma |
| `css/tokens.css` not found | Run `npm run tokens` first |
| Claude doesn't have Figma tools | Run `claude mcp auth figma` and restart Claude Code |
| Figma URL not recognized | Make sure you copied the link to a specific node (right-click → Copy link to selection) |
| Generated CSS has hardcoded values | Report to team — update `CLAUDE.md` forbidden list if needed |

---

## Reference

- Token source: `FigmaTokens/` (read-only, exported from Figma)
- Generated CSS: `css/tokens.css` (do not edit manually)
- Design governance rules: `CLAUDE.md`
- Component examples: `src/components/`
- This document: `docs/figma-workflow.md`
