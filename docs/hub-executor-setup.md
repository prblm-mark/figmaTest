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

## Schema answers — verified live against the Hub API, 2026-07-31

All five resolved from live calls. `/hub-job` § Configuration now pins the real field names; nothing
in it assumes a schema any more. Three answers changed the command materially:

**1. `my_tasks` cannot filter — use `task_list`.** `my_tasks` accepts only `limit`/`offset`/`view`
(owner-or-delegate + `X-Agent-ID`, nothing else), so it would return every assigned task and force
the command to guess which are design-system work. Intake is now
`task_list(labels="design-system", involves="<ds-executor>", view="lean")` — server-side label
filtering, and `involves` unions owner/delegate/lead/creator. `labels` is an **array on read, a
comma-separated string on write**. In use today: `design` 41 tasks, `design-system` 5.

**2. There is no team or role target.** Assignment is actor-handle only (`owner_id`/`delegate_id`/
`lead_id`, resolving server-side to a person or agent). `team_list` is a flat 10-person read-only
directory whose ids are not assignable. So a `needs-design-decision` blocker must name a **specific
actor**, configured up front — if that handle is unset the executor escalates to the requester rather
than filing a task nobody owns. A messaging group can notify a team in parallel but cannot own the
blocker.

**3. There is no PR-URL field.** No `pr_url`/`pull_request_url` anywhere in the hub API. The PR URL
goes in the task description plus a `task_comment`. Not `workspace` (file/dir paths only), and not
`execution_mode: 'repo'`, which implies a branch but exposes no branch or PR handle. `thread_code`
links an Affino forum thread if one exists.

**4. `thread_id` is a correlation label, not a queue.** Free-form (≤256 chars), opt-in on both ends,
echoed only when non-null — most live messages have none. `message_thread` retrieves by **partner**,
not by `thread_id`. So the executor cannot reply into a thread the requester never opened: `/hub-job`
mints `hub-job-<TASK-CODE>` itself and echoes it on every message. Messages are sent with
`message_type="task"`, which protects them from auto-cleanup until `complete_task_message`.

**5. A separate `ds-executor` identity is confirmed as the right call.** Intake keys off
`X-Agent-ID`, so a shared identity competes with `shaz`'s open tasks for one inbox; and tasks stamp
`created_by_actor_id`/`owner_actor_id` separately, giving a two-actor trail per job for free.
`agent_teamtime_log` accepts an explicit `agent_id`, but sessions are per-agent — interleaved stages
under one identity corrupt the timeline. Fleet precedent is per-purpose identities (36 registered,
incl. `support-agent`, `cron-scheduler`, `ci-suite-runner`).

### KB write path exists — but as a tag cluster, not a namespace

Two-step, and the split is mandatory: `kb_create(slug, title, …)` is **metadata only** (a body is
rejected there and on `kb_update` — "Body is auto-assembled from steps"), then
`kb_step_create(slug, body, heading, position)` supplies the prose as ordered sections. `kb_create`
takes `originating_task_code` and `idempotency_key` (24h replay-safe retry), both worth setting from
a pipeline. `doc_type` (Diátaxis) **and** `template_slug` are required for non-exempt categories or
the server 400s; exempt: `note`, `scratch`, `draft`, `comment`, `brain-backup`, `test`.

No design-system namespace exists — 51 in-use categories with no match, and
`kb_folders_list(q="design")` returns 0 folders. What exists is a substantial tag-and-slug cluster to
write into (`mission-design-system`, `kb-design-tokens-canon`, `design-system-extract`,
`plan-design-system-quality-process-2026-07`). `kb_folder_create` is the lever if a real namespace is
wanted. **So Phase 1 exists, but as "write into the existing cluster", not "build a namespace".**

---

## Remaining work

**Blocking the first unattended run** — both outside this repo:

1. **Register the `ds-executor` identity.** `agent_register` needs admin scope (locked down
   2026-05-22); `shaz`'s key does not have it. Route via an admin key plus `auth_provision_agent` for
   the executor's own API key. Then give it check-in discipline or it shows permanently offline in
   `agent_teamtime_board`.
2. **Name the design-decision owner** — a real actor handle for `needs-design-decision` blockers.

**Blocking the other-platform read leg, not the executor:** `design_kit` → 404 "design kit not
generated (`scripts/generate_design_kit.py`)" and `design_components_list` → 404 "extract not
generated". Hub-side fix: `make extract-design-system`.

This executor is deliberately unaffected — it reads tokens and the component catalogue from its own
checkout, never from the hub. A hub design-kit read should **not** be added as a fallback; the local
checkout is the source of truth. But until those regenerate, spec agents on ChatGPT/Kimi have no
machine-readable view of the design system, so stage 1 of the pipeline can't start.

**Worth investigating:** `design-system-extract` in the KB and `make extract-design-system` suggest an
extract pipeline already exists. If it generates from this repo, the right Phase 1 is wiring this
repo's CI to trigger that regeneration — cleaner and self-maintaining compared with hand-writing KB
docs via `kb_step_create`.

---

## How to run it

Start Claude Code with its cwd in this repo (not `claudeMain`) and run `/hub-job`. The pre-flight
gate will refuse to start if the worktree is dirty, the branch isn't `main`, either MCP server is
down, or `css/tokens.css` hasn't been generated.
