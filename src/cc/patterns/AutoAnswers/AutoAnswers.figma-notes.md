# AutoAnswers — Figma Notes

AI auto-answer card for support forums. Tier: **pattern**. Currently a Control
Centre component (`[data-brand="cc"]`), but built theme-agnostically with
`--ai-*` semantic tokens so it can be re-parented to another brand theme later.

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Component set:** `AutoAnswers` — `2802:6352`
- **Variant axes:** `Type` (6) × `Tier=Pattern` × `Device` (Desktop / Mobile) = 12 variants

| Type | Desktop node | Mobile node |
|---|---|---|
| ProcessingAnswer | 2802:6343 | 2802:6346 |
| SuggestedAnswer | 2802:6349 | 2802:6351 |
| NoAnswer | 2802:6341 | 2802:6340 |
| CompleteAnswer | 2802:6347 | 2802:6348 |
| PartialAnswer | 2802:6350 | 2802:6345 |
| InadequateAnswer | 2802:6342 | 2802:6344 |

## Variant × Device × State Matrix

| State (modifier) | Theme | Header | Body | Footer / extra | Mobile delta |
|---|---|---|---|---|---|
| `--processing` | info | **spinner** (replaces sparkles) + **shimmer gradient** title | status text only | — | type 16→14; padding 24→16 |
| `--suggested` | info | sparkles + title + "Awaiting Feedback" pill | full answer | 3 action buttons | header stacks (column); pill below title; type 16→14; pill 14→12; buttons → sm (h32, px12, 12px) + stack |
| `--no-answer` | neutral | sparkles + title | single paragraph (tracking -0.3125px) | — | type 16→14; padding 24→16; paragraph line-height → leading-sm |
| `--complete` | success | sparkles + title | full answer | circle-check + "marked as helpful" | type 16→14; padding 24→16 |
| `--partial` | warning | sparkles + title | full answer | thumbs-up + "…helpful, further assistance required" | type 16→14; padding 24→16 |
| `--inadequate` | neutral | sparkles + title | full answer | thumbs-down + "marked as not helpful" | type 16→14; padding 24→16 |

Interactive states (Pure CSS): action buttons `:hover` (brightness 0.96),
`:active` (0.92), `:focus-visible` (brand outline). JS: SuggestedAnswer's three
buttons resolve the card to a terminal marked state (Complete/Partial/Inadequate)
— single-shot, no undo (Reset in demo only).

**ProcessingAnswer** (Figma 2802:6343): a `loader-circle` spinner sits in the
header heading **in place of** the sparkles icon while loading; the sparkles
returns in every loaded state (it's only authored in non-processing headers).
The body row is the status text only. Animations (all CSS, halted by
`prefers-reduced-motion: reduce`): the spinner spins (`cc-auto-answer-spin` 1s)
and the "AI Assistant is thinking…" title runs a left→right shimmer — a brighter
`#2dc0df` band sweeping across the `--ai-surface-info` base via animated
`background-position` + text clip (`cc-auto-answer-shimmer` 2.4s).

**Responsive = container-query based.** The root `.cc-auto-answer` is the query
container (`container-type: inline-size; container-name: cc-auto-answer`); the
inner `.cc-auto-answer__card` and its descendants read it via
`@container cc-auto-answer (max-width: 767px)`. The MD breakpoint (768px) is
measured against the CONTAINER width, not the viewport, so the card adapts to
whatever column it's dropped into. Container split is mandatory: an element with
`container-type` cannot query itself, so the queried nodes must be descendants of
the container (never the same element). See `feedback_container_self_query_trap`.
Below MD the header switches to `flex-direction: column` (icon+title row above,
"Awaiting Feedback" pill below — Figma 2802:6351, node 2789:5172) and the action
buttons drop to the **sm** size (`min-height: --ai-spacing-7` 32px, `padding: 0
--ai-spacing-4`, `font-size: --ai-font-fluid-xxs` 12px — Figma `button/sm`) while
also stacking. The title also drops to `--ai-font-fixed-xs` (14px) below MD
(per NoAnswer mobile 2802:6340; applied globally — note SuggestedAnswer mobile
shows 16px in Figma, standardised to 14px per design direction), and the
NoAnswer paragraph tightens to `--ai-leading-sm`. Demo wraps ALL variants in one
resizable frame (`resize: horizontal`) + width presets so the whole set
transitions together, without resizing the viewport.

## CSS Class Mapping

| Figma element | CSS class |
|---|---|
| Variant frame (query container) | `.cc-auto-answer` + `.cc-auto-answer--<state>` |
| Card surface (visuals) | `.cc-auto-answer__card` |
| Header row | `.cc-auto-answer__header` |
| Icon + title group | `.cc-auto-answer__heading` |
| `Icon/24px/Sparkles` (20px) | `.cc-auto-answer__icon` (Lucide `sparkles`) |
| Title text | `.cc-auto-answer__title` (`--gradient` for Processing) |
| "Awaiting Feedback" chip | `.cc-auto-answer__pill` |
| White inner box | `.cc-auto-answer__body` |
| Lead / closing paragraph | `.cc-auto-answer__text` |
| Numbered list | `.cc-auto-answer__list` (`<ol>`) |
| Code snippet | `.cc-auto-answer__code` (`<code>`) |
| Action button row | `.cc-auto-answer__actions` |
| Action button | `.cc-auto-answer__action` + `--positive` / `--caution` / `--negative` |
| Status footer | `.cc-auto-answer__status` |
| Footer icon (CircleCheck / ThumbUp / ThumbDown) | `.cc-auto-answer__status-icon` |
| Footer text | `.cc-auto-answer__status-text` |
| Spinner (in header, processing only) | `.cc-auto-answer__spinner` (Lucide `loader-circle`) |
| Processing status row | `.cc-auto-answer__processing` |
| Processing status text | `.cc-auto-answer__processing-text` |

## Token Mapping

| Figma | CSS variable | Role |
|---|---|---|
| surface/{info,success,warning,neutral}-soft | `--ai-surface-*-soft` | card bg per state |
| border/{info,success,warning,neutral} | `--ai-border-*` | card border per state |
| text/{info,success,warning,neutral} | `--ai-text-*` (`--cc-aa-accent`) | title + icon + status |
| surface/primary | `--ai-surface-primary` | inner body bg |
| border/secondary | `--ai-border-secondary` | inner body border |
| surface/secondary | `--ai-surface-secondary` | code snippet bg |
| text/primary, text/secondary | `--ai-text-primary`, `--ai-text-secondary` | body / code text |
| surface/success, btn-primary-text, btn-primary-border | action `--positive` | solid success button |
| surface/warning-soft + border/warning + text/warning | action `--caution` | soft warning button |
| surface/error-soft + border/error + text/error | action `--negative` | soft error button |
| radius/lg, radius/md, radius/sm, radius/full | `--ai-radius-*` | card / body / code / pill |
| spacing 1/3/4/5/6/8 | `--ai-spacing-*` | gaps, padding, button height (8 = 40px) |
| font/title, font/body | `--ai-font-title`, `--ai-font-body` | text vs buttons |
| fixed-sm/fixed-xs/fixed-xxs, fluid-xs | `--ai-font-*` | type ramp (desktop→mobile) |
| leading md/sm/xs | `--ai-leading-*` | line heights |
| icon 20px / 16px | `--ai-icon-size-md` / `--ai-icon-size-sm` | header+footer / button icons |

## Token Gaps & Normalisations (user decision: normalise to nearest token)

Figma authored the variants with drifting raw values; all normalised:

- **Outer card radius:** `10px` (Complete/Inadequate) → `--ai-radius-lg` (16px), the value used by the other 4 states.
- **Inner body radius:** `10px` (Suggested/NoAnswer) → `--ai-radius-md` (8px).
- **Inner body padding:** `18px` (Complete/NoAnswer) → `--ai-spacing-6` (24px desktop) / `--ai-spacing-5` (16px mobile).
- **Inadequate/Partial outer padding:** `26px` → `--ai-spacing-6` (24px).
- **NoAnswer outer gap:** `10px` → `--ai-spacing-5` (16px).
- **Code snippet font-size:** `15px` → `--ai-font-fixed-xs` (14px) — matches the mobile value Figma already used.
- **"Awaiting Feedback" pill bg:** `rgba(153,200,209,0.5)` (= border-info @ 50%) → `color-mix(in srgb, var(--ai-border-info) 50%, transparent)`.
- **Processing gradient stop `#2dc0df`:** no semantic token; **user-approved** as a documented raw value in `--gradient` title.

## Notes

- **Font family:** Figma binds `--ai-font-title` to ALL text (titles, body, list,
  code, status) and `--ai-font-body` only to the buttons. Both resolve to Inter in
  this system, so there is no visual difference — tokens used exactly as authored.
- **Action buttons are NOT Button-component variants** (user decision: scope
  locally). They form a status-button family: positive = solid success,
  caution = soft warning, negative = soft error. Hover uses a `filter: brightness`
  (no new colour tokens); focus-visible uses the standard brand outline.
- **Spinner colour** (`--ai-surface-brand`) is a chosen info-theme accent — the
  Figma spinner asset's fill is not exposed in `get_design_context`.
- **Width:** Figma frames are 960px (desktop) / 360–407px (mobile); these are
  layout-frame widths, not a component constraint — the card is fluid (`width:100%`)
  and the demo container caps it at 900px.
- **Letter-spacing** (`-0.1504px` status, `-0.3125px` processing) kept as raw px
  (optical typographic value — allowed exception).
- Lucide name mapping: Sparkles → `sparkles`, CircleCheck → `circle-check`,
  ThumbUp → `thumbs-up`, ThumbDown → `thumbs-down`, Spinner → `loader-circle`.
