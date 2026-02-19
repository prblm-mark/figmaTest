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

### How the token pipeline works

```
FIGMA (Variables panel)
  │
  │  Designer exports variables as DTCG JSON
  ▼
FigmaTokens/          ← JSON files (source of truth, never edit manually)
  ├── Primitive.tokens.json
  ├── Light.tokens.json
  └── Typography/
      ├── Desktop.tokens.json
      └── Mobile.tokens.json
  │
  │  npm run tokens
  ▼
css/tokens.css        ← Generated CSS custom properties (--ai-* variables)
  │
  │  All components reference these automatically
  ▼
Browser / Build
```

---

### One-time setup: Set Code Syntax for each variable in Figma

Each Figma variable must have its **Web code syntax** set. This is what determines the CSS
variable name in the exported JSON (`com.figma.codeSyntax.WEB`) and ultimately in
`css/tokens.css`.

1. Open the Figma file
2. Open the **Variables** panel: right-click the canvas → Variables, or use the local variables
   button in the top toolbar
3. Select a variable collection (e.g. "Light")
4. Click the **"<>"** (Code) button or the **Code syntax** option in the panel header
5. For each variable, set the **Web** field to the `--ai-*` name (e.g. `--ai-surface-primary`)

This only needs to be done once per variable. New variables added later must have their Web
code syntax set before exporting, or they will be silently omitted from `css/tokens.css`.

> **Rule:** Style Dictionary only outputs variables that have `com.figma.codeSyntax.WEB` set.
> Any variable without a Web code syntax will be skipped by `npm run tokens`.

---

### Exporting variables from Figma (do this after every token change)

Figma Professional includes a **native Variables export** — no third-party plugin is needed.
The export produces DTCG JSON with Figma's proprietary extensions (`com.figma.variableId`,
`com.figma.codeSyntax`, etc.), which is exactly the format `style-dictionary.config.mjs` expects.

**Steps:**

1. Open the Figma file
2. Open the **Variables** panel (same as above)
3. Click the **export icon** (↓ download) at the top-right of the Variables panel
   — Figma downloads a `.zip` file
4. Unzip it — you'll find JSON files named after each variable collection
5. **Replace** the matching files in `FigmaTokens/`:

   | Figma collection | File in repo |
   |---|---|
   | Primitives | `FigmaTokens/Primitive.tokens.json` |
   | Light | `FigmaTokens/Light.tokens.json` |
   | Typography (Desktop) | `FigmaTokens/Typography/Desktop.tokens.json` |
   | Typography (Mobile) | `FigmaTokens/Typography/Mobile.tokens.json` |

6. Run the pipeline:
   ```bash
   npm run tokens    # rebuilds css/tokens.css from FigmaTokens/
   npm start         # verify changes in the browser
   ```

> **Never edit `FigmaTokens/*.json` manually.** They are the source of truth from Figma.
> If you need to correct a value, change it in Figma and re-export.

---

### When a designer changes a token value

1. Designer updates the variable in Figma's Variables panel
2. Designer exports → replaces file(s) in `FigmaTokens/`
3. Run `npm run tokens` — `css/tokens.css` regenerates automatically
4. All components update automatically (no code changes needed)
5. Update `CLAUDE.md` Section 2 or 3 with the new value if it changed

### When a new token is added in Figma

Same flow as above, plus:
- Ensure the new variable has **Web code syntax** set in Figma (see above)
- Update the tables in `CLAUDE.md` Sections 2–3 with the new `--ai-*` variable

---

### Why you can't automate the export via REST API

Figma's REST API (`GET /v1/files/:fileKey/variables`) requires the `file_variables:read`
OAuth scope. This scope is **only available on Figma Organization and Enterprise plans** — it
does not appear in the token generator on Professional plan.

The native Variables panel export described above is the correct approach for Professional plan.

To automate in the future: upgrade to Figma Org/Enterprise, create a personal access token
with `file_variables:read` scope, then use the API to download and write the JSON files
directly to `FigmaTokens/`.

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
| A token I added in Figma doesn't appear in CSS | Check that the variable has **Web code syntax** set in Figma (see Part 3) |
| Token value in CSS is stale | Re-export from the Figma Variables panel → replace file in `FigmaTokens/` → run `npm run tokens` |
| Can't find the export button in Figma | Variables panel → look for the ↓ download icon at the top-right; it may be hidden behind a "..." menu |
| `file_variables:read` scope not available | This scope requires Figma Org/Enterprise; use the manual export instead |
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
