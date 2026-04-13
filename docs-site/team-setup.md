# Team Setup

## First-time setup (every developer)

```bash
git clone <repo>
cd figmaTest
npm install          # installs all deps including style-dictionary
npm run tokens       # generates CSS token files from FigmaTokens/
npm start            # starts dev server
```

## Enable Figma MCP in Claude Code

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

## Available skills

| Skill | Purpose | Direction |
|---|---|---|
| `/build-component` | Build a component from a Figma URL | Figma → Code |
| `/build-prototype` | Build a prototype from a description, push to Figma | Code → Figma |
| `/review-component` | Audit a component against Figma for token drift | QA |
| `/pull-tokens` | Post-export workflow — confirm export, rebuild, triage | Tokens |
| `/update-components` | Batch update components after token changes | Maintenance |

## Useful commands

| Command | What it does |
|---|---|
| `npm run tokens` | Regenerate all 6 CSS token files from `FigmaTokens/` |
| `npm start` | Start webpack dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run docs:dev` | Start VitePress docs dev server |
| `npm run docs:build` | Build static docs site |
| `npm run code-connect:publish` | Publish Code Connect mappings to Figma |

## Figma files

| File | Key | Contains |
|---|---|---|
| **Affino AI Design System** | `Lus07xi8pPXLN87sQIyrEt` | Published library — Primitives, Scale, Semantic (Light/Dark), Typography, base components |
| **Affino AI Chat** | `Ikv8jxb5dcRH8ff4q4dR11` | Chat product — Semantic (Chat Light/Dark), chat components, patterns, templates |

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm run tokens` fails with parse errors | Check `FigmaTokens/*.json` for malformed JSON; re-export from Figma |
| `css/tokens.css` not found | Run `npm run tokens` first |
| A token I added in Figma doesn't appear in CSS | Check that the variable has **Web code syntax** set in Figma |
| Token value in CSS is stale | Re-export from Figma Variables panel → replace file in `FigmaTokens/` → run `npm run tokens` |
| Can't find the export button in Figma | Variables panel → look for the ↓ download icon at the top-right |
| `file_variables:read` scope not available | This scope requires Figma Org/Enterprise; use the manual export instead |
| Claude doesn't have Figma tools | Run `claude mcp auth figma` and restart Claude Code |
| Figma URL not recognized | Make sure you copied the link to a specific node (right-click → Copy link to selection) |
| Generated CSS has hardcoded values | Report to team — update `CLAUDE.md` forbidden list if needed |
| Code Connect publish fails with 403 | Regenerate your `FIGMA_ACCESS_TOKEN` in Figma Settings → Personal Access Tokens → update `.env` |
