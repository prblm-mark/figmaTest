# /publish-kb

Publish (or refresh) the Affino Design System docs into the **hub.affino.com** knowledge base, so
agents on other platforms can read the design system instead of having it pasted into their briefs.

Usage: `/publish-kb` (all docs) or `/publish-kb <slug>` (one)

Run from this repo, with `crm-api` connected. This is a **mirror**: the repo is the canonical source
and the KB copy is a synced reflection of it. Never edit the KB copy by hand — the next run overwrites
it, and the version history will make it look like the publisher did the damage.

---

## Why this is reconcile-based, not append-based

Three hub constraints shape everything below. Violating any of them produces silent corruption rather
than an error, so they are not negotiable:

1. **Step writes have no idempotency key.** Only `kb_create` has one (24h replay). So a re-run that
   appends sections **duplicates the entire document**. Every run must read current state first and
   update by step id.
2. **A loop-detector blocks 5+ same-pattern calls.** Iterating `kb_step_update` over six sections gets
   killed on the fifth, leaving the doc half-updated. `kb_steps_batch_update` (≤50 steps, one
   transaction, all-or-nothing) is **mandatory**, not an optimisation.
3. **Headings are the join key.** Steps are matched to repo sections by heading, so renaming a heading
   in the source reads as *delete the old section + create a new one*, losing that step's id and
   position. Renaming a heading is a deliberate act — call it out in the report.

Versioning is free: `kb_update` snapshots the previous version and takes `change_summary`, and
`kb_doc_versions` / `kb_doc_diff` / `kb_rollback` all exist. Always pass a real `change_summary` —
"sync from repo @ `<short-sha>`" — so the history is readable later.

---

## The doc set

| Source in this repo | KB slug | doc_type |
|---|---|---|
| *(authored for the KB — see below)* | `affino-design-system-overview` | `reference` |
| `docs/tokens-reference.md` | `affino-design-system-tokens` | `reference` |
| `docs/component-registry.md` | `affino-design-system-components` | `reference` |
| `.claude/commands/build-prototype.md` | `affino-design-system-prototype-workflow` | `how-to` |

Shared metadata: `category: reference`, `template_slug: template-codebase-patterns`, tag
`design-system`, plus a `review_interval_days` (see § Drift alarm).

**`affino-design-system-overview` is the most important page and has no repo source.** It exists to stop
agents conflating two different design systems, and must state:

- This is the **Affino Design System** — client-facing products: Control Centre, AI, display-side.
- It is **not** the Hub's own UI design system (`hub.affino.com`, React + Tailwind, internal-only).
  The two share no tokens. `design_kit` / `design_components_list` / `design-system-extract` describe
  the **Hub's** system, not this one.
- Every visual value comes from an `--ai-*` token; the canonical tables live in
  `affino-design-system-tokens`.
- The target-surface → token-mode map: display-side → base Light/Dark; Control Centre → CC Light/Dark;
  AI/Chat → Chat Light/Dark + `--ai-chat-brand`.
- The GitHub Pages URL as the always-current source, and that briefs for design-system work are filed
  with the `ads-job` label.

Two token sets with different names and values are in play. An agent that merges them produces
confident, plausible, wrong output — which is the single failure this page prevents.

---

## Process

### 1. Pre-flight

- `pwd` is this repo; `crm-api` connected (`claude mcp list`).
- Working tree clean, and capture the short SHA — it goes in every `change_summary`.
- `npm run tokens` if publishing the token reference, so the tables reflect real generated values.

### 2. Per doc — resolve current state

1. `kb_read(slug)` — does it exist? If not, this is a first publish: `kb_create(slug, title, category,
   doc_type, template_slug, tags, originating_task_code?, idempotency_key)`. **`kb_create` is metadata
   only** — a body is rejected there and on `kb_update` ("Body is auto-assembled from steps").
2. `kb_steps_list(slug, view='lean')` → `id`, `sort_order`, `heading`, `body_preview`.

### 3. Build the desired step set

Split the source file into one step per top-level (`##`) section: `heading` = the section title, `body`
= its content. Keep the order of the file.

Do **not** publish content the KB copy should not carry: this repo's governance STOP rules are for
builders working *in* the repo, not for agents reading *about* the system. For
`build-prototype.md`, publish the workflow and the token tiers; skip the `/hub-job` unattended block,
which is executor plumbing.

### 4. Diff, then apply in the right order

Match desired ↔ existing **by heading**, then:

| Case | Action |
|---|---|
| heading matches, body differs | collect into one `kb_steps_batch_update` call |
| heading matches, body identical | skip — do not write |
| desired heading has no match | collect into one `kb_steps_create_batch` call |
| existing heading not in desired | `kb_step_delete` (report it — usually a renamed heading) |
| order differs after the above | one `kb_steps_reorder` |

**One batch call per category of change.** Never a per-step loop (constraint 2). If a diff exceeds 50
steps, split into successive batches and say so in the report — do not silently truncate.

Then `kb_update(slug, change_summary="sync from repo @ <short-sha>", …)` for metadata and the version
snapshot.

### 5. Report

Per doc: created or updated, counts of steps updated / created / deleted / unchanged, the
`change_summary` used, and the KB URL. **Name every deletion explicitly** — a deletion is almost always
a heading rename, and a silent one loses history nobody notices until they need it.

---

## Drift alarm

Set `review_interval_days` on each doc so an unpublished repo change becomes visible. This works:
`design-system-extract` reports `is_stale: true` at 67.3 days against a 14-day interval, which is how
its pipeline's dormancy surfaced at all. A stale token table is worse than no token table — agents
build against wrong values with no signal — so the alarm is the point, not noise.

If `/hub-job` merges a change to any source file in § The doc set, it should run this command as part of
the same job rather than leaving the KB behind.

---

## Hard limits

- **Never hand-edit a published mirror doc.** The next run overwrites it.
- **Never append without reconciling** — no idempotency key on step writes means a re-run duplicates
  the whole document.
- **Never loop single-step updates.** The loop-detector kills the run part-way through.
- **Never use `category: note` or `draft` to skip classification.** They are *not* exempt — only
  `scratch`, `comment`, `brain-backup`, `test` are. The `kb_create` docstring saying otherwise is stale.
- **Never use a shaped slug prefix** (`plan-`, `research-`, `process-`, `runbook-`, `architecture-`,
  `help-`, `affino-help-`, `tech-`, `faq-`, `affino-faq-`) — it silently forces a different template.
  Laundering via `draft-`/`note-`/`wip-`/`tmp-` is blocked too.
- **Never publish a slug resembling `design-system-extract`.** That is the Hub's own, different design
  system, and the confusion is the exact thing `affino-design-system-overview` exists to prevent.
- **Never copy `template-reference`** from `design-system-extract` — it is absent from
  `kb_templates_list` and presumably deprecated. The validator does not check that templates exist.
