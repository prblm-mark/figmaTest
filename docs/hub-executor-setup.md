# Hub Executor Setup — `shaz` as the privileged executor

**Date:** 2026-07-31
**Status:** executor side wired; hub side blocked on schema answers
**Companion doc:** [`hub-agent-integration.md`](hub-agent-integration.md) (the architecture)

---

## What was set up

**`.claude/commands/hub-job.md`** — the executor entry point. Pre-flight gate (cwd, clean worktree,
both MCP servers up, `npm run tokens`), hub intake via `session_init`/`my_tasks`, a dispatch table
into `/build-prototype` and `/build-component`, branch discipline, Figma push rules,
land-and-report, and hard limits (never `main`, never invent a token, never commit a credential).

**The escalation contract** — `hub-job.md` § Step 3, now referenced from the top of both
`build-prototype.md` and `build-component.md`. Both skills have ~15 "STOP and ask the user" sites;
rewriting each would have been a fragile diff, so each skill instead states once that in an
unattended run every stop resolves through the contract: WIP-commit, report the question with
property / Figma value / nearest tokens, raise on the hub, mark blocked, exit.

The framing that matters: **a blocked job is a successful outcome** — the failure being prevented is
a plausible-looking component built on invented values.

**Hub access from the repo** — `crm-api` added at local scope, mirroring `shaz`'s own config.
Verified `crm-api ✔ Connected` and `figma ✔ Connected` from the repo root. The bearer token stayed
in `~/.claude.json`; `.mcp.json` is still committed with only the Figma entry, and `git status`
showed no secret material.

---

## Two findings that changed the design

### The executor has to run *inside* this repo, not in `claudeMain`

Hooks load from the session's working directory — `build-component-guard.py` is wired in this repo's
`.claude/settings.json`. An executor running from `claudeMain` and editing these files by absolute
path would silently lose every guardrail in CLAUDE.md §0.

Since `shaz`'s identity is credential-based (`session_init` / `confirm_agent_link`) rather than
directory-based, moving its workspace here keeps the same hub identity. `claudeMain` holds no repo,
no `CLAUDE.md` and no commands — only that one MCP server — so there is nothing to migrate.

### Phase 1 may be unnecessary

The hub already exposes `my_tasks` / `task_create` (job queue), `send_message` / `check_messages`
(escalation channel), and `kb_read` (knowledge base). Those are the three things the architecture
proposal assumed needed building. If DS docs can be **written** to the hub KB, every other-platform
agent reads them through a connector it already has, and the separate Design System MCP server goes
away.

---

## Blocked on — questions for `shaz`

MCP servers added mid-session don't load until restart, so `crm-api`'s tools were not callable from
the session that did this setup. These need answering from `shaz`'s terminal:

1. **`kb_read` — is there a write path, and a namespace for design-system docs?**
   This decides whether Phase 1 exists at all.
2. **`my_tasks` payload shape** — what field marks a job as design-system work, so `/hub-job` can
   filter rather than guess?
3. **`task_create` required fields** — can it target a role/team, carry a `needs-design-decision`
   label, and link a PR URL?
4. **`send_message` addressing** — how does the executor reply into the requester's thread?
5. **Should the executor be its own agent in `list_agents`** (e.g. `ds-executor`) or run under
   `shaz`'s identity? A separate identity gives per-stage audit trails in `agent_teamtime_log`.

Once those are answered, wire the intake filter and escalation payloads to the real schema — Step 1
and Step 3 of `hub-job.md` currently describe the contract but assume field names.

---

## How to run it

Start Claude Code with its cwd in this repo (not `claudeMain`) and run `/hub-job`. The pre-flight
gate will refuse to start if the worktree is dirty, the branch isn't `main`, either MCP server is
down, or `css/tokens.css` hasn't been generated.
