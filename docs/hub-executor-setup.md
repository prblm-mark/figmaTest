# Hub Executor Setup — `Iris` as the privileged executor

**Date:** 2026-07-31
**Status:** executor side wired and schema-complete; hub side blocked only on registering `Iris`
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
`task_list(labels="ads-job", involves="Iris", view="lean")` — server-side label
filtering, and `involves` unions owner/delegate/lead/creator. `labels` is an **array on read, a
comma-separated string on write**. In use today: `design` 41 tasks, `design-system` 5.

**2. There is no team or role target.** Assignment is actor-handle only (`owner_id`/`delegate_id`/
`lead_id`, resolving server-side to a person or agent). `team_list` is a flat read-only
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
under one identity corrupt the timeline. Fleet precedent is per-purpose identities.

### KB write path exists — but as a tag cluster, not a namespace

Two-step, and the split is mandatory: `kb_create(slug, title, …)` is **metadata only** (a body is
rejected there and on `kb_update` — "Body is auto-assembled from steps"), then
`kb_step_create(slug, body, heading, position)` supplies the prose as ordered sections. `kb_create`
takes `originating_task_code` and `idempotency_key` (24h replay-safe retry), both worth setting from
a pipeline. `doc_type` (Diátaxis) **and** `template_slug` are required for non-exempt categories or
the server 400s. Exempt categories are only `scratch`, `comment`, `brain-backup`, `test` — **not**
`note` or `draft`, despite the `kb_create` docstring saying so (see "Classification" below).

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

## Decision — the job label is `ads-job` (2026-07-31, Mark)

Intake filters on **`ads-job`**, a new dedicated label meaning "the executor can run this".

Not `design` (41 tasks) — a *discipline* label covering visual design work unrelated to this repo, so
the executor would pull jobs it cannot execute, and its failure mode for an unexecutable job is an
escalation, turning a broad label directly into noise in the design owner's queue. Not `design-system`
(5 tasks) either: those read as *consumers* of the design system — "Hub Apps — detail page…",
"Calendar UX standardisation" — so on its first run the executor would try to build a live task.
`design-system` may still be added alongside as a topical tag for humans browsing.

**Blocker tasks must never carry `ads-job`.** It is the intake filter, so an escalation labelled with it
would be re-ingested as new work on the next run and the executor would loop on its own blockers.
Blockers use `design-system,needs-design-decision`.

**Resolved 2026-07-31: comma is AND, and each term is a case-insensitive *substring* match**
(`task_filters.py:312-318` builds one `EXISTS … ILIKE %term%` clause per label, joined with `AND`).

Intake nonetheless stays on **`ads-job` alone**: two required labels only add a way to file a job
half-labelled and invisible. Two consequences of substring matching to respect:

- **Never create any label containing `ads-job`** (`ads-job-blocked`, `no-ads-job`, `ads-job-v2`) — all
  would be pulled into intake, including blockers that must stay out of it. It is a reserved exact
  string, not a prefix to extend.
- The filter cannot express exclusion — there is no way to ask for "`design` but not `design-system`",
  which is also why the earlier `design` count of 41 already included all 5 `design-system` tasks. Never
  use labels for mutually-exclusive routing.

---

## Two traps found while filing the registration request (2026-07-31)

**`owner_type` is not a reliable person/agent discriminator — use `owner_actor_type`.** A task assigned
to `server-claude` came back with `owner_type: "person"` while `owner_actor_type` was correctly `"ai"`
and `owner_id_display` was `"SC"`. The assignment itself was right; `owner_type` is a derived column
with a quirk consistent with the person/agent resolution in `task_sync.py`. Since this repo's escalation
contract already turns on a person/agent distinction (assign to `Mark`, notify `shaz`), do not verify a
blocker landed correctly by reading `owner_type`.

**Labels are routing keys, not tags — never add one for findability.** The registration request was
filed with `agent-registration` only, deliberately *without* `design-system`. Because label filtering is
case-insensitive substring matching, tagging an admin request `design-system` would make it surface in
any future view filtering on that label alone — and this repo's own blocker label is
`design-system,needs-design-decision`, so "all design-system work" would have shown an admin task as
design work. Intake on `ads-job` alone would not have caught it either way; the point is the general
rule. Once a label is a filter input, adding it has functional consequences, not just cosmetic ones.

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

### Update path — resolved 2026-07-31

There is a full step-mutation surface, so refreshing is **list → diff → batch-update**, never
delete-and-recreate. Step ids are stable (`design-system-extract`'s six steps are unchanged from creation through later versions).

| Tool | Purpose |
|---|---|
| `kb_steps_list(slug, view='lean')` | id + sort_order + heading + body_preview (no full bodies) |
| `kb_steps_batch_update(slug, updates[])` | ≤50 steps, one transaction, all-or-nothing |
| `kb_step_update(slug, step_id, …)` | overwrite one section in place; auto-syncs the doc body |
| `kb_step_delete(slug, step_id)` | delete, renumber remaining, auto-sync |
| `kb_steps_create_batch` / `kb_steps_reorder` | bulk append / re-sequence |

**Three constraints that dictate the publisher's design:**

1. **Batching is mandatory, not an optimisation.** A loop-detector blocks 5+ same-pattern calls, so a
   publisher iterating `kb_step_update` over six sections is killed on the fifth. Use
   `kb_steps_batch_update`.
2. **Step writes have no idempotency key** (only `kb_create` does, 24h). So the publisher must be
   **reconcile-based** — read `kb_steps_list`, match on heading, update by id. An append-based re-run
   duplicates every section.
3. **Versioning is free.** `kb_update` snapshots the previous version and takes `change_summary`;
   `kb_doc_versions` / `kb_doc_diff` / `kb_rollback` all exist. A scripted publisher gets an audit
   trail per run for nothing.

### Classification — resolved 2026-07-31

`doc_type` is a **closed set**: `tutorial` | `how-to` | `reference` | `explanation`.

`template_slug` is **not** constrained by category, but two other mechanisms bite:

- **Slug prefix forces the template**, overriding any choice — `plan-`, `research-`, `process-`,
  `runbook-`, `architecture-`, `help-`, `affino-help-`, `tech-`, `faq-`, `affino-faq-`. Miss it and you
  get `shaped_slug_classification_required`. An anti-laundering guard blocks dodging via `draft-`,
  `note-`, `wip-`, `tmp-` prefixes.
- For `category=reference` with an unshaped slug, any template is accepted.

**Template: `template-codebase-patterns`.** Its own summary describes this exact case — "the canonical
source is the repo file, the KB copy is a synced mirror … Guidance-only — it carries no enforced step
headings, so labelling a mirror doc with it adds zero conformance burden". `template-architecture` (91
consumers) is the fallback if enforced structure is ever wanted. Do **not** copy
`design-system-extract`'s `template-reference`: it is absent from `kb_templates_list`, so presumably
deprecated — the validator simply doesn't check that templates exist.

**Correction to earlier notes in this doc:** `note` and `draft` are **not** classification-exempt.
the exempt set is only `{scratch, comment, brain-backup, test}`; the `kb_create` docstring listing
note/draft is stale (a code comment records them being dropped). The "use an exempt category to skip the
requirement" escape hatch does not exist.

### The doc set

| Source in this repo | KB slug | category | doc_type |
|---|---|---|---|
| *(new, written for the KB)* disambiguation + surface/mode map | `affino-design-system-overview` | reference | reference |
| `docs/tokens-reference.md` | `affino-design-system-tokens` | reference | reference |
| `docs/component-registry.md` | `affino-design-system-components` | reference | reference |
| `.claude/commands/build-prototype.md` | `affino-design-system-prototype-workflow` | reference | how-to |

All tagged `design-system`. None of these slugs hit a shaped prefix. Never use a slug resembling
`design-system-extract` — that is the Hub's own, different design system.

**Use `review_interval_days` as a deliberate drift alarm.** `design-system-extract` currently reports
`is_stale: true` at 67.3 days against a 14-day interval, which is exactly how the extract pipeline's
dormancy became visible. Set an interval on our docs so an unpublished repo change surfaces the same way.

---

## Remaining work

**Blocking the first unattended run** — both outside this repo:

1. **Register the executor identity.** `agent_register` needs admin scope (locked down);
   `shaz`'s key does not have it. **Route: ask `server-claude` or Markus directly** — an offer from SC
   from server-claude offers exactly this ("ping me or Markus and we'll verify/provision your key"),
   then `auth_provision_agent` for the executor's own API key.
   **Named `Iris`.** Fleet convention splits by owner: system-owned agents use
   `<purpose>-<role>` (`<purpose>-<role>`), while
   person-owned working agents get names. This is Mark's agent doing design work, so a name fits; `ds-executor` would have read as
   infrastructure.
   **Liveness — resolved 2026-07-31.** Board status is a **stored enum**, not derived from activity:
   it is one of `online | working | idle | error | offline` and only changes when
   something writes it (`agent_teamtime_check_in` → `online`, check-out → `offline`,
   `agent_teamtime_status` → any). So there is no cutoff to hit and **one check-in is enough**, provided
   the executor touches the API at least once every **120 minutes** (the stale reaper scans every 5 min, and `last_seen` is touched passively by any API call, throttled to 60s).
   A polling executor never goes stale; only a job idling >2h needs an explicit `agent_heartbeat` /
   `agent_teamtime_touch`. **Always check out** — otherwise the reaper closes the session at the wrong
   time and the timeline is misleading. `/hub-job` Step 5 does this on every exit path and also sets
   `working` / `idle` / `error` so the board reflects reality.
   Note: the `online/idle/offline` label in `list_agents` is a *different*, `last_seen`-derived value
   whose cutoffs are still unknown — that is not the board.
2. ~~**Name the design-decision owner.**~~ **Resolved 2026-07-31: `owner_id="Mark"`.** Pass the
   **handle string with exact casing** — the server resolves it to his actor record with
   `owner_type="person"`; the numeric id is never passed. Handles are inconsistently cased (some capitalised, some not).

   **Assignment and delivery diverge, so a blocker needs both.** `owner_id="Mark"` puts the task on
   Mark's board, but `resolve_recipient("Mark")` returns `{resolved_id: "shaz", type: "agent"}` — a
   message addressed to his name reaches his *agent*, not him. Assign to `Mark` **and**
   `send_message` to `shaz`: task-only means nobody is told, message-only means nobody owns it.

---

## The hub's design extract is a different design system (investigated 2026-07-31)

**An earlier version of this doc proposed wiring this repo's CI to trigger `make extract-design-system`.
That was wrong — dropped.** Both hub scripts read the **Hub's own frontend**, not this repo:

- the Hub's **component extractor** scans the Hub frontend's own component tree, with category/status
  from a hand-curated metadata file, and writes its own extract artefact.
- the Hub's **design-kit generator** reads the Hub frontend's own stylesheet, which its docstring names
  as the Hub's source of truth (Tailwind `@theme` for light, `.dark` for dark).

There is no snapshot or copy of this repo anywhere in that pipeline. The "Hub design system" is the Hub
frontend's Tailwind CSS plus its React component tree, reflected back out. Triggering it from here
would regenerate Hub tokens from Hub CSS — self-maintaining, but not maintaining anything we own.

**So `design_kit` was never the right read surface for spec agents building against *this* design
system.** Phase 0 stands and is now clearly correct: agents read this repo's GitHub Pages docs site and
raw skill markdown. Any KB publication must be labelled unambiguously as the **Affino Design System**,
or agents will conflate two different token sets with different names and values.

**The 404s were probably not staleness.** Nothing schedules either script. The only invocation sites are
the Hub frontend build (frontend build time, writing the gitignored runtime copy) and
the Hub's CI gates — both `--check` only, as CI gates. Nothing in CI *writes*
its design-kit artefacts; it appears to be generated by hand. Shaz was on the a dev box, which never ran
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

Affino runs **three** token systems: Hub UI (the Hub frontend's own stylesheet), this repo's Figma→tokens
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
