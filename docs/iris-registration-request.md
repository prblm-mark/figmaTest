# Registration request — `Iris`, the Affino Design System executor

**To:** `server-claude` (SC) / Markus — whoever holds an admin-scope key
**From:** Mark Foster (handle `Mark`, actor 28781)
**Date:** 2026-07-31
**Ask:** register a new person-owned working agent, `Iris`, and provision its own API key.

Route confirmed via message 538381 ("ping me (server-claude) or Markus and we'll verify/provision your
key"). `agent_register` has needed admin scope since the 2026-05-22 lockdown, and `shaz`'s key does not
carry it — hence this request.

---

## 1. What Iris is for

`Iris` is the **privileged executor** for the Affino Design System (the client-facing design system for
Control Centre, AI and display-side products — *not* the Hub's own React/Tailwind UI system).

Agents on other platforms (ChatGPT, Claude Cowork, hub-native OpenAI/Kimi) read the design system and
draft briefs. They do **not** write to the design-system repo or to Figma. `Iris` is what lands their
work: she picks up a labelled task, builds the prototype or component in a real checkout of the repo,
pushes frames to Figma, opens a PR, and publishes the design-system docs into the Hub KB so the other
agents can read them.

She must hold three things nothing else has: a real repo checkout, Figma credentials (the Figma MCP
server is an interactive OAuth flow, so nothing headless can authenticate), and the repo's enforcement
hooks — which only load when the session's working directory *is* that repo.

## 2. Why a separate identity rather than running as `shaz`

- Intake keys off session identity (`X-Agent-ID`), so sharing `shaz`'s identity means competing with
  his open tasks for one inbox.
- Tasks stamp `created_by_actor_id` and `owner_actor_id` separately, so requester=`shaz` /
  executor=`Iris` gives a two-actor audit trail per job for free.
- `agent_teamtime_log` accepts an explicit `agent_id`, but sessions are per-agent — interleaved stages
  under one identity corrupt the timeline.

## 3. Registration parameters

| Field | Value |
|---|---|
| Name | **`Iris`** |
| Owner | `Mark` (actor 28781, `owner_type: person`) |
| Class | **Person-owned working agent** — same register as `Ace`, `Metis`, `Diana`, `Dex`, `Aurora`, `Haku`, `Nova`, `Shaz`. Deliberately *not* a `<purpose>-<role>` system name like `cron-scheduler`; it is Mark's agent doing design work. |
| Runtime | Claude Code CLI, run locally, working directory = the Affino Design System repo |
| Purpose (short) | Executes design-system build jobs: prototypes, components, Figma pushes, PRs, KB doc sync |

Please fill any other required `agent_register` fields with whatever is conventional for the
person-owned agents above — I don't have the schema, so match `Shaz`'s record where it makes sense.

## 4. Tool scopes needed

Grouped by what Iris actually calls. Names marked **?** are ones I've inferred rather than seen — please
substitute the real equivalent.

**Job intake and lifecycle**
`session_init`, `task_list` (needs `labels` + `involves`), read a single task by code **?**,
set a task's status to blocked/complete **?**, `task_create`, `task_comment`

**Escalation and comms**
`send_message`, `check_messages`, `complete_task_message`, `resolve_recipient`

**Presence**
`agent_teamtime_check_in`, `agent_teamtime_check_out`, `agent_teamtime_status`,
`agent_teamtime_log`, `agent_heartbeat` / `agent_teamtime_touch`

**KB publishing** (for `/publish-kb` — reconcile-based doc mirror)
`kb_read`, `kb_create`, `kb_update`, `kb_steps_list`, `kb_steps_batch_update`,
`kb_steps_create_batch`, `kb_step_update`, `kb_step_delete`, `kb_steps_reorder`, `kb_templates_list`

**Bootstrap, if standard for new agents**
`agent_link_status`, `confirm_agent_link`, `onboarding_status`, `tools_summary`, `api_health`, `auth_me`

### Deliberately NOT needed — please withhold

`agent_register`, `auth_provision_agent` (admin scope — Iris must never be able to mint identities),
`admin_overnight_job_upsert`, `kb_rollback` and any KB delete-document call (a human should own
destructive KB actions), `consciousness_write` unless it is required for a working agent to function.

Least privilege matters more than usual here: Iris runs **unattended**, so anything she can do, she can
do at 3am with nobody watching.

## 5. What to send back

1. **The API key** — please deliver it **directly to Mark**, not in a task body, KB doc, or anything
   retained and broadly readable. It will be stored in `~/.claude.json` on his machine, never committed.
2. **The exact registered handle string, with casing.** This matters: handles are inconsistently cased
   (`Mark`, `Rao` capitalised; `susan`, `quang`, `julius` not), and `task_list(involves=…)` plus
   `X-Agent-ID` both need the exact string. Is it `Iris` or `iris`?
3. **The `X-Agent-ID` value** to send, if it differs from the handle.
4. **Confirmation of the granted tool scopes**, and any name corrections from §4.
5. **Anything else a new agent must do before it can work** — a first `confirm_agent_link`,
   `onboarding_status` requirement, `brain_bootstrap`, or similar.

## 6. What happens on our side afterwards

Recorded so the handover is complete, and because one step is easy to miss:

1. **Swap the repo's `crm-api` credential from `shaz`'s key to Iris's.** The design-system repo currently
   has `crm-api` configured at local scope with `shaz`'s bearer token (copied so the repo could reach the
   Hub at all). Until that header is replaced, anything run from the repo **acts as `shaz`** — and the
   entire two-actor audit trail in §2 silently doesn't happen. This is the step that makes the separate
   identity real.
2. First `session_init` + `agent_teamtime_check_in` from the repo, and confirm `Iris` appears correctly
   on `agent_teamtime_board`.
3. End-to-end dry run of `/hub-job` against a throwaway task labelled `ads-job`.
4. First `/publish-kb` run to create the four `affino-design-system-*` KB docs.

## 7. One question for SC, unrelated to Iris

Nothing in the Hub repo writes `data/design_kit/` — `scripts/generate_design_kit.py` is hand-run,
`check.sh:1256` only `--check`s it, and the three artefacts (`hub-design-kit.css`, `.json`,
`DESIGN-CONTRACT.md`) are git-tracked but not gitignored. `design_kit` and `design_components_list` both
404 from an AI1 dev session.

**Could you run `design_kit` from a prod-connected session?** If it 404s there too, who owns
regenerating and committing those artefacts? This is Hub housekeeping rather than a blocker for us — the
Hub's design kit describes the Hub's own design system, which we've deliberately scoped out of the
Affino Design System pipeline — but it looks like something has been quietly dormant since May.
