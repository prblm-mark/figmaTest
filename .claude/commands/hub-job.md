# /hub-job

Run a design-system job dispatched from **hub.affino.com** as the privileged executor.

Usage: `/hub-job` (pull the next assigned job) or `/hub-job <task-id>` (run a specific one)

This is the **only** entry point for unattended design-system work. Agents on other platforms
(ChatGPT, Claude Cowork, hub-native OpenAI/Kimi agents) read the design system and draft briefs;
they do **not** write to this repo or to Figma. This command is what lands their work.

---

## Why this command exists

The executor holds three things no other agent has:

1. **A real checkout of this repo** — so `src/components/`, `css/tokens.css` (generated, gitignored)
   and `docs/tokens-reference.md` are on disk rather than described second-hand.
2. **Figma credentials** — the `figma` MCP server is an interactive OAuth flow. Nothing headless can
   authenticate. Only this executor pushes.
3. **The enforcement hooks** — `.claude/hooks/build-component-guard.py` and
   `build-component-trigger.py` are wired in `.claude/settings.json`, which is **project-scoped**.

That third point is a hard constraint: **hooks only apply when the session's working directory is
this repo.** An executor running from any other directory and editing these files by absolute path
silently loses every guardrail in CLAUDE.md §0. If `pwd` is not the design-system repo, stop.

---

## Step 0 — Pre-flight (all must pass before touching a job)

```
pwd                     → must be the design-system repo root
git status              → worktree clean; if dirty, STOP and escalate (never stash someone's work)
git branch --show-current → must be main (jobs branch off main)
claude mcp list         → crm-api ✔ connected, Figma ✔ connected
npm ci && npm run tokens  → css/tokens.css must exist before any token rule can be honoured
```

`css/tokens.css` is gitignored and generated. A fresh checkout has no tokens at all, so **skipping
`npm run tokens` makes every token lookup silently wrong.** Never skip it.

If any pre-flight check fails: do not start the job. Report the failure (§ Escalation) and exit.

---

## Step 1 — Identity and intake

1. `session_init` — establish the hub session. Intake keys off session identity (`X-Agent-ID`), so
   the executor must run under its **own** agent identity, not the requester's (§ Configuration).
2. **`task_list(labels="ads-job", involves="Iris", view="lean")`** — do **not** use
   `my_tasks` for intake. `my_tasks` accepts only `limit`/`offset`/`view`: it has no label filter, so
   it would return every assigned task and force this command to guess which are design-system work.
   `task_list` filters `labels` server-side, and `involves` unions owner/delegate/lead/creator.
   With an explicit `<task-id>`, fetch that one directly.
3. Select **one** job. Never run two jobs in a single session — one job, one branch, one report.
4. Echo the job back before acting: id, type, requester, **target surface**, and the brief in full.
   If the brief is ambiguous or missing the information the target skill needs, that is an escalation
   (§ Escalation), not something to fill in with assumptions.
5. **The brief must name a target surface.** It decides which token modes the build draws from:

   | Target surface | Token modes |
   |---|---|
   | Display-side (Affino products) | base **Light/Dark** — reserved for display-side going forward |
   | Control Centre | CC Light/Dark (`data-theme` + CC scoping) |
   | AI / Chat | Chat Light/Dark, `--ai-chat-brand` accents |

   A missing target surface is a **requester escalation** — message-only, like the Step 0 stop, since
   a rewritten brief is not a design decision. **Do not default it.** A Control Centre screen built
   from base tokens looks plausible and is wrong in every colour, which is exactly the failure mode
   this contract exists to prevent.
6. **Mint the correlation id now:** `hub-job-<TASK-CODE>`. Every message this job sends carries it as
   `thread_id`. See § Configuration for why it is a label, not a queue.

`labels` is an **array on read** and a **comma-separated string on write** — do not send an array.

---

## Step 2 — Dispatch

| Job intent | Command to run | Branch |
|---|---|---|
| Prototype from a written brief | `/build-prototype <brief>` | `proto/<slug>` |
| Component from a Figma node/URL | `/build-component <url>` | `comp/<Name>` |
| Audit / refine an existing component | `/build-component <url>` (audit mode) | `comp/<Name>` |
| Backend handover entry | edit markers + `docs/handover-manifest.json` + `HANDOVER.md` | `handover/<Surface>` |

Create the branch **before** the skill runs. Then invoke the target skill and follow it exactly —
this command adds the hub plumbing, it does not replace or relax a single rule in those skills.
CLAUDE.md §0 still applies: any edit under `src/components/`, `src/patterns/`, or `src/templates/`
must begin with `Skill(skill="build-component")`.

---

## Step 3 — Escalation contract (the load-bearing rule)

`/build-component` is written for an attended session. Every one of its stop conditions says
*"STOP and ask the user"* — token gap, gradient with no style, hardcoded dimension, Tier=Template
shell paints, contextual override, missing variant, missing dependency, unverified value.
**In a hub job there is no user in the terminal.**

**The two skills escalate differently, and the difference is the point:**

| | `/build-component` | `/build-prototype` |
|---|---|---|
| Token gap | **Hard stop → escalate** to the design owner | **No stop** — recorded in `<Name>.token-gaps.md`, build continues |
| Scope/duplication problem | escalate | Step 0 hard stop → **escalate to the requester** |
| Why | the design decision already exists, so a gap means a real question | the prototype *produces* the design decision, so the question is premature |

A prototype that blocked on every novel value would stall the pipeline on exactly the work it exists
to do. A component that didn't block would ship invented values as precedent. Do not collapse these
two behaviours into one.

When a STOP fires in `/build-component` — or the Step 0 stop fires in `/build-prototype` — it
resolves here:

1. **Do not guess. Do not proceed past that step.** No "reasonable" token, no nearest-match
   spacing, no `/* one-off optical */` inline value. A wrong value that ships is worse than a
   blocked job, because it becomes precedent the next build copies.
2. **Commit and push what exists** to the job branch as a WIP commit. Work is never discarded to
   report a blocker.
3. **Report the question, not just the failure.** Include:
   - skill + step that stopped
   - the exact question, phrased as the skill phrases it
   - what was found: property name, Figma value, primitive name if identifiable, nearest existing
     `--ai-*` tokens
   - the options as the skill lists them (add a token / approve a `calc()` / approve a primitive / …)
   - the branch name and commit SHA
4. **Raise it on the hub:**
   - `send_message(to=<requester>, thread_id="hub-job-<TASK-CODE>", message_type="task")`.
     `message_type="task"` matters: task messages are protected from auto-cleanup until closed with
     `complete_task_message`, so a job handshake will not be reaped mid-decision.
   - `task_create(labels="design-system,needs-design-decision", owner_id=<actor-handle>, …)` with
     `originating_task_code` set to the job's task code.
     **Never add `ads-job` to a blocker** — that is the intake filter, so a blocker carrying it would
     be re-ingested as new work on the next run, and the executor would loop on its own escalations.
     **Only for genuine design decisions** —
     i.e. `/build-component` stops. A `/build-prototype` Step 0 stop is message-only: the fix is a
     rewritten brief, so filing a design-decision task would put a brief-quality problem in the
     design owner's queue.
   - **There is no team or role target.** Assignment is actor-handle only (`owner_id` / `delegate_id`
     / `lead_id`, resolving to a person or agent). `team_list` is a flat read-only directory whose
     ids are not assignable. So the design owner must be a **named actor** configured up front
     (§ Configuration) — if that handle is unset, escalate to the requester rather than filing a
     blocker task nobody owns. A messaging group (`group_send_message`) can notify a team in
     parallel, but it is comms-only and cannot own the blocker.
5. **Mark the job blocked and exit.** Never mark a blocked job complete. Never open a PR from a
   blocked branch.
6. **Batch where possible.** If several open questions are already known, send them as one
   escalation rather than one round trip each — an unattended agent that escalates eight times is
   a worse collaborator than one that escalates once with eight numbered questions.

A blocked job is a **successful outcome** for this command. The failure mode being prevented is a
plausible-looking component built on invented values.

---

## Step 4 — Figma push discipline

`/build-prototype` treats the Figma push as mandatory. Two automation-specific rules on top:

- **Target an explicit file key.** `generate_figma_design` pushes to "your current file/page" — a
  per-user session notion that a job runner does not have. The destination file must come from the
  job payload or a pinned constant, never from ambient session state.
- **Expect duplicates, and record them.** Re-pushing a frame with an unchanged `<title>` does **not**
  replace the existing node — the 2026-07-31 session minted ~20 new nodes this way. Log every node
  id created in the completion report so stale ones can be cleaned up. Do not loop on push retries.

---

## Step 5 — Land and report

1. Commit on the job branch. **Never commit to `main`.** Never merge; a human reviews the PR.
   - Prototypes **are** committed on `proto/*` branches — that is a deliberate exception to the
     usual "don't commit prototypes" convention, because the next stage's agent cannot refine what
     only exists on one machine. They still never reach `main`.
2. Open a PR with: the job id, the brief, screens/components produced, Figma node URLs, the token
   validation result, and anything deferred.
   - **For a prototype job, the PR body must reproduce `<Name>.token-gaps.md` in full** (or state
     that it is empty). That file is the design owner's review list and the input to the later
     `/build-component` build. An unreported gaps file is indistinguishable from a silently guessed
     value — which is the failure this whole contract exists to prevent.
3. Report completion to the hub with the PR URL and Figma URLs:
   - `send_message(to=<requester>, thread_id="hub-job-<TASK-CODE>", message_type="task")`, then
     `complete_task_message` once acknowledged.
   - **There is no PR-URL field on a task** (no `pr_url` / `pull_request_url` anywhere in the hub
     API). Put the URL in the task **description** text and a `task_comment` — never rely on
     `workspace`, which holds file/dir paths only, or on `execution_mode: 'repo'`, which implies a
     branch but exposes no branch or PR handle. If the job has an Affino forum thread, `thread_code`
     links it.
4. Register outputs where the repo expects them: `docs/component-registry.md` for components,
   `docs/handover-manifest.json` + `HANDOVER.md` for anything mock (CLAUDE.md §12).
5. **Check out of the hub session before exiting.** A reaper force-closes sessions where
   `check_out_at IS NULL` and `last_seen` has gone stale, so a run that just stops leaves a session
   to be killed and a misleading timeline in `agent_teamtime_session_detail`. Check out on **every**
   exit path — completed, blocked, or pre-flight failure.
   No separate heartbeat loop is needed while the job is working: `last_seen` updates passively on
   any API activity (throttled to once per 60s per agent). `agent_heartbeat(agent_id)` matters only
   across long idle gaps — e.g. a job parked waiting on a design decision.

---

## Configuration — resolved hub schema

Verified against the live Hub API 2026-07-31. Fill the placeholders before the first unattended run.

| Setting | Value |
|---|---|
| Executor agent identity | **`Iris`** — **must be its own identity**, not `shaz`'s (registration pending) |
| Intake call | `task_list(labels="ads-job", involves="Iris", view="lean")` |
| Job label | **`ads-job`** — the executable marker. Not `design-system` (whose 5 existing tasks are *consumers* of the design system, not build jobs) and not `design` (41 tasks, a discipline label). `design-system` may be added alongside as a topical tag. |
| Blocker label | `design-system,needs-design-decision` — **never `ads-job`** (see below). Comma string on write; free-form, unvalidated. |
| Design-decision owner | **Mark Foster** (Head of Design & Build) — actor id TBC, see `docs/hub-executor-setup.md`. A named person or agent; **no team target exists** |
| Correlation id | `hub-job-<TASK-CODE>` as `thread_id`, minted by this command |
| Message type | `task` (survives auto-cleanup; close with `complete_task_message`) |

**Why the executor needs its own identity.** `task_list`/`check_messages` key off `X-Agent-ID`, so a
shared identity means competing with `shaz`'s open tasks for one inbox. Tasks stamp
`created_by_actor_id` and `owner_actor_id` separately, so requester=`shaz` / executor=`Iris`
yields a two-actor audit trail per job for free. `agent_teamtime_log` does accept an explicit
`agent_id`, but sessions are per-agent — interleaved stages under one identity corrupt the timeline.

Two setup costs, both outside this repo: `agent_register` needs **admin scope** (locked down
2026-05-22), which `shaz`'s key does not have — route via an admin key plus `auth_provision_agent`
for the executor's own API key. And the new identity needs its own check-in discipline or it shows
permanently offline in `agent_teamtime_board`.

**`thread_id` is a correlation label, not a queue.** It is free-form (≤256 chars), opt-in on both
ends, and echoed only when non-null — most live messages have none. `message_thread` retrieves by
**partner**, not by `thread_id`. Never design intake around reading a thread back.

### Publishing design-system docs to the hub KB

Two-step — the split is not optional:

1. `kb_create(slug, title, …)` — **metadata only.** A body is rejected here and on `kb_update`
   ("Body is auto-assembled from steps"). Takes `originating_task_code` (`TASK-NNNNN`) and
   `idempotency_key` (24h replay-safe), both of which a job pipeline should always set.
2. `kb_step_create(slug, body, heading, position)` — the actual prose, as ordered sections.

`doc_type` (Diátaxis) **and** `template_slug` are required for non-exempt categories — the server
400s without them. Exempt categories: `note`, `scratch`, `draft`, `comment`, `brain-backup`, `test`.

There is **no design-system namespace**: `kb_categories` returns 51 in-use values with none matching
(nearest: `frontend`, `reference`, `spec`, `architecture`, `hub-plan`), and `kb_folders_list(q="design")`
returns 0 folders. What exists is a tag-and-slug cluster to write into — tag `design-system`, slug
`…-design-system-…` — alongside `mission-design-system`, `kb-design-tokens-canon`,
`design-system-extract`, `plan-design-system-quality-process-2026-07`. Use `kb_folder_create` only if
a real namespace is wanted.

### Known hub-side outage (does not block this command)

`design_kit` → 404 "design kit not generated (`scripts/generate_design_kit.py`)" and
`design_components_list` → 404 "extract not generated". Fix is hub-side: `make extract-design-system`.

**This executor is unaffected**, and deliberately so: it reads tokens and the component catalogue
from its **own checkout** (`css/tokens.css` after `npm run tokens`, `src/components/`,
`docs/tokens-reference.md`) — never from the hub. Those 404s block the *other-platform* read leg
(spec agents on ChatGPT/Kimi discovering the design system), not job execution. Do not add a hub
design-kit read to this command as a fallback; the local checkout is the source of truth.

---

## Hard limits

- Never push to `main`; never merge a PR; never force-push a branch you did not create this run.
- Never add or invent an `--ai-*` token to unblock yourself — that is an escalation, always.
- Never authenticate a new service or accept a new MCP server mid-job.
- Never write a credential into a commit, a PR body, or a hub message.
- Never run a second job before the first has been reported.
- If the hub is unreachable mid-job: finish nothing new, WIP-commit, and leave the branch. Do not
  guess at what the hub would have said.
