# Hub Agent Integration — wiring hub.affino.com agents to the design system

**Status:** proposal / not yet implemented
**Date:** 2026-07-31
**Goal:** let the agents on hub.affino.com use this design system and its skills directly
(e.g. the spec team running `/build-prototype`) instead of having briefs pasted in — creating a
seamless spec → design → frontend → backend workflow.

---

## Context

**Agent platforms in play.** Hub agents run on multiple agentic platforms: Claude Code, ChatGPT,
Claude Cowork, and native hub agents on OpenAI and Kimi models. Some run on hub infrastructure,
most run independently/locally, but all agent features are driven from the hub. A local Claude Code
CLI agent — **`shaz`**, in the `claudeMain` directory — has full access to the hub.

**What `shaz` actually is** (inspected 2026-07-31). `/Users/mark/claudeMain` holds no git repo, no
`CLAUDE.md`, and no commands — only `.claude/settings.local.json`. Its entire identity is one
project-scoped MCP server, **`crm-api` → `https://hub.affino.com/mcp`** (HTTP, bearer token in
`~/.claude.json`), allowlisted for:

`session_init` · `my_tasks` · `task_create` · `send_message` · `check_messages` · `kb_read` ·
`brain_bootstrap` · `consciousness_write` · `list_agents` · `agent_link_status` ·
`confirm_agent_link` · `agent_teamtime_check_in` · `agent_teamtime_log` · `tools_summary` ·
`onboarding_status` · `api_health` · `auth_me`

So the hub **already provides** the job queue (`my_tasks`/`task_create`), the escalation channel
(`send_message`/`check_messages`), and a knowledge base (`kb_read`). Those were the parts this
proposal assumed had to be built.

**Hooks are project-scoped — this is the binding constraint.** `.claude/settings.json` in this repo
defines the `build-component` guard and trigger. Hooks load from the session's working directory, so
an executor running from `claudeMain` and editing these files by absolute path would silently lose
every guardrail in CLAUDE.md §0. **The executor must run with its cwd inside this repo.** The `shaz`
identity is credential-based (`session_init` / `confirm_agent_link`), not directory-based, so moving
its workspace to the design-system repo keeps the same hub identity.

**Repo access decision.** The repo stays on `prblm-mark/figmaTest`; hub agents are given access so
they can plan from their side. Read-only for planning agents; writes go through `shaz` + PRs.

**Consequence:** a Claude Code plugin cannot be the primary distribution surface — it only serves
one of several platforms. The universal surface has to be **MCP + plain HTTP**, with `shaz` as the
privileged executor.

---

## What already exists and travels well

- Skills are plain markdown in `.claude/commands/` — `build-prototype.md`, `build-component.md`,
  `review-component.md`, `pull-tokens.md`, `update-components.md`
- Guardrails are two Python hooks in `.claude/hooks/`, wired via `.claude/settings.json`
- `.gitignore` already deliberately tracks all three (commands, hooks, settings.json)
- The backend contract already exists: `docs/handover-manifest.json` (7 surfaces:
  Login, ControlHub, ControlScreen, Filters, AudioPlayer, EventBuilder, SeatingPlanner) +
  `HANDOVER.md` + greppable `TODO(backend:*)` markers
- A public HTTP surface already ships: the GitHub Pages deploy at `/figmaTest/docs/`
  (VitePress, rebuilt on every push to `main` by `.github/workflows/deploy.yml`)

That is most of a pipeline already.

---

## The architecture

```
              ┌─────────────────────────────────────────┐
              │  hub.affino.com — briefs, roles, jobs   │
              └────────────┬───────────────┬────────────┘
                    reads  │               │ dispatches job
        ┌──────────────────┴───────┐       │
        │  Design System MCP       │       │
        │  (+ same handlers over   │       │
        │   plain HTTP/JSON)       │       │
        │                          │       ▼
        │  resources: tokens,      │   ┌───────────────────────┐
        │   registry, components,  │   │ shaz (Claude Code CLI)│
        │   handover manifest      │   │ holds: repo checkout, │
        │  prompts/tools: skill    │   │ Figma creds, hooks    │
        │   text, validate_tokens  │   │ → commits, PRs, Figma │
        └──────────┬───────────────┘   └───────────────────────┘
                   │ read-only
   ┌───────────────┼────────────────┬──────────────┐
ChatGPT      Claude Cowork    hub/OpenAI+Kimi   Claude Code
(spec)         (design)          (native)        (frontend)
```

**Non-Claude agents read and draft. Only `shaz` lands.**

That single rule solves three problems at once:

1. **Figma OAuth** — only `shaz` holds credentials, so nothing headless has to authenticate
   (`.mcp.json` points at `https://mcp.figma.com/mcp`, an interactive OAuth flow)
2. **Token-rule enforcement** — `shaz` runs inside the repo with `build-component-guard.py` intact
3. **Write safety** across four teams

---

## What the MCP server exposes

### Reads — this is what kills the pasted-brief problem

| Resource | Backing file |
|---|---|
| `ds://tokens/reference` | `docs/tokens-reference.md` |
| `ds://tokens/css` | generated `css/tokens.css` |
| `ds://components/registry` | `docs/component-registry.md` |
| `ds://component/{Name}` | html + css + figma-notes for that component |
| `ds://handover/manifest` | `docs/handover-manifest.json` |
| `ds://skill/build-prototype` | `.claude/commands/build-prototype.md` |

The last one matters most: **the skill markdown served as content.** Any agent on any platform
fetches the current instruction set at runtime. Expose it as an MCP *prompt* for clients that
support prompts, and as a `get_skill(name)` **tool** for those that don't — ChatGPT connectors and
most OpenAI-side tooling won't use prompts.

### Acts

- **`validate_tokens(css)`** — the highest-value tool to build. A Kimi or GPT-4-class agent will not
  reliably obey "every value must be an `--ai-*` token" from prose alone. A server-side validator
  that rejects raw hex, arbitrary px, and non-`--ai-` vars turns the governance rules into an
  enforced gate for the platforms that can't run the Python hooks. **This is the load-bearing piece
  of the whole design.**
- `submit_draft(slug, files[])` — queues a hub job for `shaz` rather than writing to git directly
- `push_to_figma(slug)` — server-side, org machine account

One implementation, two transports: MCP for Claude Code / Cowork, HTTP+JSON for hub-native
agents and anything else.

---

## Hand-off is git, not conversation

Each stage's deliverable is a commit on a branch, which the next stage reads:

| Stage | Agent output | Next stage reads |
|---|---|---|
| Spec | `proto/<slug>` branch: `src/prototypes/<Name>/` + Figma frame URLs | the Figma frames |
| Design | refined / componentised Figma nodes, approved | node URLs |
| Frontend | `/build-component` → `src/components/`, `.figma.ts`, registry row | the component |
| Backend | `TODO(backend:*)` + `handover-manifest.json` entry + HANDOVER row | the manifest |

---

## Implemented so far (2026-07-31)

The executor side is wired; the hub side is not.

- **`.claude/commands/hub-job.md`** — the executor entry point. Pre-flight (cwd, clean worktree,
  both MCP servers, `npm run tokens`), hub intake via `session_init`/`my_tasks`, a dispatch table to
  `/build-prototype` / `/build-component`, branch discipline, Figma push discipline, land-and-report,
  and hard limits.
- **`§ Step 3 — Escalation contract`** in that file, referenced from the top of both
  `build-prototype.md` and `build-component.md`. Rather than rewriting ~15 individual
  "STOP and ask the user" sites, each skill now states once that in an unattended run every stop
  resolves through the contract: WIP-commit, report the question with property/Figma value/nearest
  tokens, raise on the hub, mark blocked, exit. **A blocked job is a successful outcome.**
- **`crm-api` added to this repo at local scope** (`claude mcp add-json … --scope local`), mirroring
  `shaz`'s own config. Verified: `crm-api ✔ Connected`, `figma ✔ Connected` from the repo root. The
  bearer token lives in `~/.claude.json`, never in the repo — `.mcp.json` stays committed with only
  the Figma entry.

**Revision to Phase 1:** because the hub already exposes `kb_read`, a separate Design System MCP
server may be unnecessary. If DS docs can be published into the hub knowledge base, every
other-platform agent reads them through a connector it already has. Confirm the KB write path before
building any new server.

---

## Rollout — start with zero infrastructure

1. **Phase 0 (days).** Point every hub agent at the existing Pages docs site plus the raw GitHub
   URL for `build-prototype.md`. No infra. Proves the no-pasted-briefs claim immediately.
2. **Phase 1.** MCP server wrapping the same content, plus `validate_tokens`.
3. **Phase 2.** `shaz` as job runner: hub dispatches → checks out `proto/<slug>` →
   `npm ci && npm run tokens` → runs `/build-prototype` for real → pushes to Figma → opens the PR.
4. **Phase 3.** Hub renders `handover-manifest.json` as the backend team's queue. That file is
   already the contract; it just needs a UI.

---

## Three things to decide before Phase 2

### 1. The STOP rules need a non-interactive destination

Both `build-prototype.md` and `build-component.md` are built around "STOP and ask the user" — token
gaps, gradients, hardcoded dimensions, template-shell paints. When `shaz` runs as a hub job there is
no user in the terminal. Route each STOP to a comment on the hub ticket and a
`needs-design-decision` label on the PR, and **fail the job rather than letting it guess**.

This is the prerequisite for anything running unattended.

### 2. Prototypes have to become committable

They're currently uncommitted on purpose (the Figma push is the deliverable). But the design agent
cannot refine what only exists on the spec agent's machine. Commit them on `proto/*` branches only,
never merged to `main` — same intent, workable mechanism.

### 3. Figma repeat-push duplicates

The 2026-07-31 session minted ~20 new nodes instead of replacing frames with matching titles. An
automated pipeline will litter the company file fast. Pin explicit file keys per stage and settle a
naming + stale-node cleanup convention before `shaz` is allowed to push unattended.

Also note: `generate_figma_design` pushes to "your current file/page" — a per-user session notion,
not something a daemon has. File keys must be explicit.

---

## Repo access

Give the hub a fine-grained PAT with `contents:read` so planning agents can read `src/components/`,
`docs/`, and `HANDOVER.md` directly. Writes stay behind `shaz` and PR review.

---

## Next step

Two candidates:

- **Skill edits that make the STOP paths hub-safe** — the prerequisite for unattended runs
- **Phase 1 MCP server** — resource handlers over the existing files + `validate_tokens`

Recommend the skill edits first.
