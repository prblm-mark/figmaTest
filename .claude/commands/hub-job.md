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

1. `session_init` — establish the hub session.
2. `my_tasks` (or `check_messages`) — list assigned work. With an explicit `<task-id>`, fetch that one.
3. Select **one** job. Never run two jobs in a single session — one job, one branch, one report.
4. Echo the job back before acting: id, type, requester, and the brief in full. If the brief is
   ambiguous or missing the information the target skill needs, that is an escalation (§ Escalation),
   not something to fill in with assumptions.

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

`/build-prototype` and `/build-component` are written for an attended session. Every one of their
stop conditions says *"STOP and ask the user"* — token gap, gradient with no style, hardcoded
dimension, Tier=Template shell paints, contextual override, missing variant, missing dependency,
unverified value. **In a hub job there is no user in the terminal.**

When any STOP in any skill fires, it resolves here:

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
4. **Raise it on the hub:** `send_message` to the requester, and `task_create` a blocker task for the
   design owner labelled `needs-design-decision`, referencing the job id and branch.
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
3. Report completion to the hub (`send_message` + task status) with the PR URL and Figma URLs.
4. Register outputs where the repo expects them: `docs/component-registry.md` for components,
   `docs/handover-manifest.json` + `HANDOVER.md` for anything mock (CLAUDE.md §12).

---

## Hard limits

- Never push to `main`; never merge a PR; never force-push a branch you did not create this run.
- Never add or invent an `--ai-*` token to unblock yourself — that is an escalation, always.
- Never authenticate a new service or accept a new MCP server mid-job.
- Never write a credential into a commit, a PR body, or a hub message.
- Never run a second job before the first has been reported.
- If the hub is unreachable mid-job: finish nothing new, WIP-commit, and leave the branch. Do not
  guess at what the hub would have said.
