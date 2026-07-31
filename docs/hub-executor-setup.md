# Hub Executor Setup — `Iris` as the privileged executor

**Date:** 2026-07-31
**Status:** executor side wired; hub side blocked on registering `Iris` + Mark's actor id
**Companion doc:** [`hub-agent-integration.md`](hub-agent-integration.md) (the architecture)

---

## What was set up

**`.claude/commands/hub-job.md`** — the executor entry point. Pre-flight gate (cwd, clean worktree,
both MCP servers up, `npm run tokens`), hub intake via `session_init`/`task_list`, a dispatch table
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

### Phase 1 may be unnecessary (superseded — see "The hub's design extract is a different design system")

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
`task_list(labels="design-system", involves="Iris", view="lean")` — server-side label
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

**5. A separate executor identity is confirmed as the right call** — named **`Iris`** (chosen 2026-07-31). Intake keys off
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

## Policy decision — prototypes do not stop on token gaps (2026-07-31)

The token STOP has been **removed from `/build-prototype`** and replaced with record-and-continue.
It remains hard in `/build-component`. The asymmetry is deliberate:

> A prototype is the thing that *produces* a design decision, so asking "which token should this be?"
> is premature. A component is built after the decision exists, so a gap there is a real question.

An unattended prototype job that blocked on every novel value would stall the pipeline on exactly
the work it exists to do; a component job that didn't block would ship invented values as precedent.

**The replacement mechanism — three tiers:**

1. A token exists for this value → use it. Non-negotiable.
2. No token exists → write the raw value and log it to
   `src/prototypes/<Name>/<Name>.token-gaps.md` (property, value, selector, design intent), then
   continue. No pause, no approximation to a near-miss token.
3. Pre-approved raw values (card drop-shadows, `1px`/`2px` border widths) → no entry needed.

The gaps file is listed in the build report, reproduced in full in the PR body, and feeds the
`## Token Gaps` section of `<Name>.figma-notes.md` at the `/build-component` stage. `/build-prototype`
still may not add `--ai-*` tokens — recording a gap is not minting one.

Escalation follows the same split: a prototype token gap is **not** escalated at all, and the Step 0
hard stop (brief asks for a gallery of an existing component) goes to the **requester**, message-only,
because a rewritten brief is not a design decision.

### Why tier 1 survives as non-negotiable

Re-tokenising does **not** make prototype token discipline redundant — it depends on it.
`generate_figma_design` resolves `var(--ai-*)` to raw values during capture, and
`figma-plugin-retokenise` rebinds them **by value matching only** (`inferredVariables`, then
hex→variable and float→variable maps; ambiguous matches are skipped). So:

- a value matching an existing token round-trips back to a proper binding;
- a value with no matching token **stays raw in Figma permanently.**

Re-tokenise repairs bindings lost in capture; it cannot invent tokens for novel values. Worth noting
it has never actually been run on Event Builder or Seating Planner (~60 frames) — so the recovery
step is both narrower than assumed and untested. **Suggested check:** run it once on Seating
Planner's frames and measure what share binds. That number says how much latitude prototypes can
safely have.

---

## Decision — publish the design system to the Hub KB (2026-07-31, Mark)

**Confirmed: yes.** Hub agents need to read the Affino Design System to build prototypes for Affino
products, so Phase 1 goes ahead as KB publication. This is **agent discovery only** — it does not mean
the Hub adopts these tokens (ruled out above).

**What to publish**, smallest useful set first:

1. **A disambiguation page** — "this is the Affino Design System (client-facing products), *not* the
   Hub's own UI design system", with the GitHub Pages URL. This one matters most: two token sets with
   different names and values are in play, and an agent that conflates them will produce confident
   nonsense.
2. `docs/tokens-reference.md` — the token tables. The thing agents most need.
3. `docs/component-registry.md` — what already exists, so briefs don't ask for rebuilds.
4. `.claude/commands/build-prototype.md` — the how-to, so agents draft briefs that fit the workflow.
5. The target-surface → token-mode mapping (above).

**Publish by script, not by hand.** A hand-maintained copy of a token table drifts, and a *stale* token
table is worse than no table — agents would build confidently against wrong values. So this wants a
small publisher in this repo (reading `docs/*.md`, writing via the hub API, idempotent), invoked by
`Iris` or from CI on merge to `main`. Note this is *our* publisher — the hub's own
`extract_design_system.py` reads the Hub frontend and will never see this repo.

**Blocking unknown — the update path.** `kb_create` is metadata-only and `kb_step_create` adds prose as
ordered sections. What is not yet known is how to *re-publish*: is there a `kb_step_update` /
`kb_step_delete`, a way to replace a doc's steps wholesale, or does refreshing mean delete-and-recreate?
Publishing once is easy; staying current is the whole point, so this decides the publisher's design.
Also still open: the `template_slug` list (required alongside `doc_type` for non-exempt categories).

Provisional metadata: category `reference`, `doc_type: reference` (Diátaxis) for the token/registry
pages and `how-to` for the skill text, tag `design-system`, and slugs that cannot be mistaken for the
Hub's own docs — e.g. `affino-design-system-tokens`, never anything resembling `design-system-extract`.

---

## Remaining work

**Blocking the first unattended run** — both outside this repo:

1. **Register the executor identity.** `agent_register` needs admin scope (locked down 2026-05-22);
   `shaz`'s key does not have it. **Route: ask `server-claude` or Markus directly** — message 538381
   from server-claude offers exactly this ("ping me or Markus and we'll verify/provision your key"),
   then `auth_provision_agent` for the executor's own API key.
   **Named `Iris`.** Fleet convention splits by owner: system-owned agents use
   `<purpose>-<role>` (`support-agent`, `cron-scheduler`, `ci-suite-runner`, `server-watchdog`), while
   person-owned working agents get names (`Ace`, `Metis`, `Diana`, `Dex`, `Aurora`, `Haku`, `Nova`,
   `Shaz`). This is Mark's agent doing design work, so a name fits; `ds-executor` would have read as
   infrastructure.
   Liveness needs no heartbeat loop: `last_seen` updates passively on any API activity (throttled to
   60s per agent), so a working job stays fresh. `agent_heartbeat(agent_id)` matters only across long
   idle gaps, e.g. a job parked on a design decision. **But check out** — a reaper force-closes
   sessions with `check_out_at IS NULL` and stale `last_seen` (`/hub-job` Step 5 now does this on every
   exit path). Exact online/idle/offline cutoffs are still unknown.
2. **The design-decision owner is Mark Foster** (set 2026-07-31). Still needs the **assignable actor
   id** to pass as `task_create(owner_id=…)` — `team_list` ids are not assignable and `auth_me`
   returns the *calling* identity, so neither yields it. Likely route: fetch any existing task Mark
   owns and read `owner_actor_id` off it (tasks stamp that separately from `created_by_actor_id`).
   Until it is known the executor can only message the requester, not file a blocker.
   Lower urgency since the prototype-token-gap policy change — `needs-design-decision` tasks now
   only originate from `/build-component` runs.

---

## The hub's design extract is a different design system (investigated 2026-07-31)

**An earlier version of this doc proposed wiring this repo's CI to trigger `make extract-design-system`.
That was wrong — dropped.** Both hub scripts read the **Hub's own frontend**, not this repo:

- `scripts/extract_design_system.py` — scans `frontend/src/components/**/*.tsx`, with curated
  category/status in hand-maintained `frontend/src/design-system/meta.json`; outputs
  `data/design-system-extract.json`.
- `scripts/generate_design_kit.py` — `SOURCE = frontend/src/index.css`, whose own docstring says
  "SOURCE OF TRUTH stays `frontend/src/index.css` (`@theme` = light, `.dark` = dark)".

There is no snapshot or copy of this repo anywhere in that pipeline. The "Hub design system" is the Hub
frontend's Tailwind CSS plus its React component tree, reflected back out. Triggering it from here
would regenerate Hub tokens from Hub CSS — self-maintaining, but not maintaining anything we own.

**So `design_kit` was never the right read surface for spec agents building against *this* design
system.** Phase 0 stands and is now clearly correct: agents read this repo's GitHub Pages docs site and
raw skill markdown. Any KB publication must be labelled unambiguously as the **Affino Design System**,
or agents will conflate two different token sets with different names and values.

**The 404s were probably not staleness.** Nothing schedules either script. The only invocation sites are
`scripts/build-frontend.sh:92` (frontend build time, writing the gitignored runtime copy) and
`scripts/check.sh:1253,1256` — both `--check` only, as CI gates. Nothing in CI *writes*
`data/design_kit/`; it appears to be generated by hand. Shaz was on the AI1 dev box, which never ran
`build-frontend.sh`, so neither artefact existed on that disk. Worth re-testing against hub-prod before
treating it as fleet-wide. Also: **no `make extract-design-system` target exists in any Makefile** — the
KB doc's command is drift.

### Decision — display-side inherits base Light/Dark (2026-07-31, Mark)

Display-side is **not** a new token mode. The existing base **Light/Dark** modes are set aside to
become the display-side theme in future. So the three surfaces map to modes as:

| Target surface | Token modes |
|---|---|
| Display-side (Affino products) | base **Light/Dark** — reserved for this going forward |
| Control Centre | CC Light/Dark |
| AI / Chat | Chat Light/Dark, `--ai-chat-brand` accents |

**Consequence for the pipeline:** which surface a prototype targets determines which modes it draws
from, and `/build-prototype` had no concept of this. A brief must now name its target surface, and a
missing one is a **requester escalation** (message-only, like the Step 0 stop — a rewritten brief is
not a design decision). It is deliberately **not defaulted**: a Control Centre screen built from base
tokens looks plausible and is wrong in every colour.

### Decision — the two systems stay separate (2026-07-31, Mark)

**Resolved: no token coupling between this repo and the Hub.** They are two different frameworks
serving two different audiences:

- **The Affino Design System** (this repo — the name to use going forward, not "the Figma design
  system") builds the **Affino Control Centre, AI, and display-side components and templates** for
  Affino **products**. Client-facing.
- **The Hub** is an **internal** tool — where agents, knowledge and tasks are linked. Not client-facing.
  Affino Design System tokens will **not** be used there.

So a shared token source has no consumer on the Hub side, and coupling them would create a maintenance
obligation serving nothing. A mapping between the two remains possible as a **separate future project**,
not part of this pipeline.

**What this does not change:** Hub agents still need to *read* the Affino Design System to build
prototypes for Affino products. Publishing Affino Design System docs to the Hub KB is about **agent discovery**, not the
Hub adopting the tokens — those are separate things and only the second is ruled out.

### The live question this decision leaves open

Affino runs **three** token systems: Hub UI (`frontend/src/index.css`), this repo's Figma→tokens
pipeline, and production/deck brand. The KB doc `research-production-styling-framework-2026-07` already
reaches this conclusion — that what's missing is "a shared SOURCE + METHOD + GOVERNANCE (Mark's Figma
pipeline, under `mission-design-system`), not one universal token set" — and names Mark as owner.

Hub UI is now **out of scope** (decision above). But two of those three systems — the Affino Design
System and production/deck brand — are **both client-facing**, which is where a shared source actually
matters. That, not the Hub, is the live governance question the research doc is pointing at.
**Not in scope for this pipeline; flagged for a dedicated session.**

---

## How to run it

Start Claude Code with its cwd in this repo (not `claudeMain`) and run `/hub-job`. The pre-flight
gate will refuse to start if the worktree is dirty, the branch isn't `main`, either MCP server is
down, or `css/tokens.css` hasn't been generated.
