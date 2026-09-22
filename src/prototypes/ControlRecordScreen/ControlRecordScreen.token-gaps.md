# ControlRecordScreen — token gaps

Design owner's review list. Per `/build-prototype`, a value with no token is written raw and
logged here rather than approximated to a near-miss token — a wrong binding survives
re-tokenisation looking correct, an honest gap does not.

Audited by stripping comments from `ControlRecordScreen.css` and matching every declaration
against `#hex`, `rgba()` and raw length units. **No raw colour of any kind is used.** Breakpoint
values inside `@container` are excluded: CLAUDE.md §2 requires px literals there, not variables.

## Genuine gaps — 3

| Property | Value | Selector | What it is for |
|---|---|---|---|
| `max-inline-size` | `78ch` | `.crs-field__value` | A reading measure for long field values (Blog Intro, Summary, Page Description). Without it a 1440px screen hands the value column ~900px and the prose becomes unreadable. The `--ai-size-*` scale is px-only and the system has no `ch`/measure token at all — this is a genuinely missing concept, not a missing step. |
| `height` | `72px` | `.crs-spark` | Height of the impressions sparkline. Wanted a chart-height token; nearest are `--ai-spacing-10` (56px, too short to read a 12-point trend) and `--ai-size-1` (64px). `.chart__canvas` uses `min-height: 12rem` (192px) which is a full chart, not an inline spark. |
| `max-height` | `480px` | `.crs-scroll` | The 23-row Article Steps listing scrolls in place at roughly ten rows rather than running the page down. The `--ai-size-*` scale jumps 384 → 448 → 640; 448 shows nine rows and a clipped tenth, which reads as a rendering fault rather than a scroll affordance. |

## Family gap — 1

| Token used | Where | The gap |
|---|---|---|
| `--ai-text-warning` | `.crs-advice__item [data-lucide]` | The SEO-health advisory icons carry a warning colour, but **there is no `--ai-icon-warning`**. The icon family has only `brand / contrast / primary / secondary / invert / invert-secondary` — no status slots at all, while text and surface both have the full five-status palette. Borrowing the text token is the least-wrong option available. **This has a capture consequence:** `scripts/gen-figma-rebind.mjs` picks a token family from node type, and a Lucide icon is a stroked vector, so it looks in `icon/*` — where this hex does not exist. Expect these three icons in `UNRESOLVED`. The fix is a design decision: either add status slots to the icon family, or rule that advisory icons are neutral and the status is carried by text alone. |

## Binding decisions — not gaps, logged so the reasoning is visible

Both of these bind a real token that is a few px off the value discussed. Recording them because
a near-miss binding is invisible afterwards — it looks like a considered choice either way, and
the designer should get to disagree with it knowingly.

| Property | Bound to | Discussed | Note |
|---|---|---|---|
| `--crs-label-w` | `--ai-size-3` (192px) | ~200px, measured off the v2 screen | Took the scale step rather than the measurement. 192 is what keeps the label gutter on the spacing system; 200 would be a raw value for an 8px gain. |
| `--crs-aside-w` (model B) | `--ai-size-7` (384px) | ~420px | Scale has 384 and 448; 420 is neither. If the designer holds out for 420 it becomes a fourth genuine gap. |

## Pre-approved, not logged

`1px` / `2px` border and underline widths — optical values, pre-approved by `/build-prototype`.
Used on the card border, the card head rule, the fact-block border and the active tab underline.
