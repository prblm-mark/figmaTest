# TableDetail — Figma Notes

**Tier:** Pattern
**Built:** 2026-08-25 (Seating Planner module, wave 4)
**Files:** `TableDetail.css`, `TableDetail.html`, `TableDetail.figma.ts`, `TableDetail.figma-notes.md`
**Composes:** AttendeeCard (one per seat), TableType (tier pill), Button (via AttendeeCard's Assign)
**JS:** none

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Page:** Seat Planner (`3087:5050`)
- **Component set:** `3475:94010`

## Variant matrix (8 variants)

Axes are **Type × Tier × Device**. Tier is single-valued (`Pattern`). Device is a media query.
**Type produces no CSS at all** — see below. So 8 Figma variants collapse to **one** CSS class plus
a media query.

| Type | Device | Node | Figma size | CSS |
|---|---|---|---|---|
| Default | Desktop | `3475:94006` | 320×648 | `.table-detail` |
| 2 Roles | Desktop | `3475:94007` | 320×698 | `.table-detail` |
| All Roles | Desktop | `3475:94009` | 320×698 | `.table-detail` |
| Full | Desktop | `3475:94008` | 320×698 | `.table-detail` |
| Default | Mobile | `3488:201546` | 320×550 | `@media (max-width: 767px)` |
| 2 Roles | Mobile | `3488:201570` | 320×591 | ↑ |
| All Roles | Mobile | `3488:201601` | 320×601 | ↑ |
| Full | Mobile | `3488:201641` | 320×607 | ↑ |

Width is **320px at every variant**, bound to `--ai-size-6` — a fixed rail, not a fluid panel.

### The whole Type axis is data, not CSS

Type names the count of **distinct roles seated**, and that is all that changes:

| Type | Legend | Seats filled |
|---|---|---|
| Default | **absent entirely** | 0 |
| 2 Roles | 2 items | 2 |
| All Roles | 5 items | 7 |
| Full | 5 items | 10 |

All of that is markup the caller supplies, so there are deliberately **no Type modifiers** — the
same finding as TableCard. The 50px height difference between Default and the rest is just the
legend (29px) plus the list gap (8px) plus filled cards being 50px against Empty's 48px.

**The legend is derived, not stored.** It lists the distinct roles actually seated, which is why
Default has none at all rather than an empty container.

## Height: fills the column, list scrolls

Figma pins the desktop panel at `h-[698px]`, which has no token and is simply how tall it drew ten
seats. **Designer's call 2026-08-25: the panel fills its column and the seat list scrolls inside a
fixed header**, so a twenty-seat table works and the header stays put.

That is three things working together, and all three are needed:

```
.table-detail        block-size: 100%; overflow: hidden
.table-detail__header  flex-shrink: 0
.table-detail__list    flex: 1; min-block-size: 0; overflow-y: auto
```

`min-block-size: 0` is the non-obvious one — a flex item refuses to shrink below its content
without it, so the panel would grow instead of the list scrolling. `overflow: hidden` on the panel
keeps the scrolling list clipped inside the 16px radius. Verified: with the panel bounded to 560px,
the list reports `scrollHeight` 647 against `clientHeight` 485.

The mobile variants carry **no fixed height at all** in Figma, so nothing extra is needed there.

## Device=Mobile deltas

All four mobile variants **drop the panel header entirely** — no table name, seated count, sponsor
or tier pill. Verified on `3488:201546` and `3488:201601`, so it is deliberate rather than one
variant being out of step.

| Property | Desktop | Mobile |
|---|---|---|
| `__header` | present | **`display: none`** |
| `__list` `padding` | `--ai-spacing-5` inline + block-end, no block-start | `--ai-spacing-3` (8px) all round |
| `__seats` `gap` | `--ai-spacing-3` (8px) | `--ai-spacing-2` (6px) |

The header is hidden rather than made optional, at the designer's direction — the mobile screen
supplies the table name in its own sheet chrome. **See the accessibility note below.**

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-primary` | panel `background-color` | |
| `--ai-border-secondary` | panel `border-color`, legend `border-color` | |
| `--ai-radius-lg` | panel `border-radius` (16px) | |
| `light/shadow-xxs` → `--ai-shadow-xxs` | panel `box-shadow` | |
| `--ai-size-6` | panel `inline-size` (320px) | fixed at both breakpoints |
| `--ai-spacing-5` | header `padding` + `gap`, list `padding` (desktop) | |
| `--ai-spacing-3` | header-row `gap`, meta `gap`, list `gap`, seats `gap`, legend `padding`, swatch size, mobile list `padding` | |
| `--ai-spacing-1` | titles `gap`, legend-item `gap` | |
| `--ai-spacing-2` | sponsor `gap`, mobile seats `gap` | |
| `--ai-spacing-0-5` | legend `gap` | CSS leads Figma — see below |
| `--ai-font-title` | name, meta, legend | |
| `--ai-font-fixed-md` | table name (18px) | |
| `--ai-font-fixed-2xs` | meta / seated count (12px) | |
| `--ai-font-fixed-4xs` | legend labels (11px) | |
| `--ai-font-bold` / `-medium` | name / meta + legend | |
| `--ai-font-body` | sponsor name | inconsistent with TableCard — see below |
| `--ai-leading-xs` | sponsor `line-height` (16px) | |
| `--ai-text-primary` / `--ai-text-contrast` / `--ai-text-secondary` | name / meta / legend | |
| `--ai-icon-size-sm` | handshake icon (16px) | |
| `--ai-icon-secondary` | handshake icon colour | **differs from TableCard** — see below |
| `--ai-surface-minimal` | legend `background-color` | |
| `--ai-radius-md` | legend `border-radius` (8px) | |
| `--ai-radius-xs` | legend swatch `border-radius` (2px) | the token added 2026-08-25 |
| `--sp-host` / `-vip` / `-speaker` / `-sponsor` / `-attendee` | legend swatches | all five roles |

## Token gaps and decisions

| Figma | Decision |
|---|---|
| panel `h-[698px]` | **Dropped for `block-size: 100%`** — see the height section. 698px has no token and is just ten seats' worth of height. |
| sponsor row `h-[22px]` | **Left to content (16px)** — see below. |
| `panel-header` `border-0` with `--ai-border-secondary` still set | **No border drawn.** A zero-width border with a colour left on it; the rendered design shows no divider under the header, so none is implemented. If a divider is wanted it needs a width in Figma first. |
| 3px `Ellipse` separator | **A middot character**, matching the identical separator in AttendeeCard. Avoids an off-scale 3px dimension with no token. |
| `Orange/600` (`#ea580c`) in the subtree's variable list | **Not a gap.** It appears in `get_variable_defs` but **zero times** in the panel's design context, so nothing being built uses it. Likely bound on a hidden layer or in another Seating Planner mode. |

### The sponsor row's 22px height is flagged, not inlined

Figma pins the sponsor row at `h-[22px]`. In TableCard the identical 22px is *derivable* — exactly
`--ai-spacing-2` (6px) of padding-top plus a 16px icon — so it was safely omitted. **Here there is no
padding**, so 22px is genuinely off-scale and unbound (the nearest steps are 16px and 24px).

Rather than inline a raw 22px, the row is left to its content, which measures 16px. The visible
consequence is the header rendering **73px against Figma's 80px**. Everything inside is
pixel-correct; only that 6px of slack in the sponsor row differs. **Worth either binding a token in
Figma or confirming the row should just hug its content.**

## Scrollbar

The seat list carries a **transparent track with a thin `--ai-surface-secondary` thumb**, per the
designer 2026-08-25 — matching `.chat-sidebar__sections`, the existing precedent for this treatment.

```
scrollbar-color: var(--ai-surface-secondary) transparent;
scrollbar-width: thin;
```

Plus `::-webkit-scrollbar` / `-track` / `-thumb` rules for older WebKit, using
`--ai-spacing-2` (6px) where the ChatSidebar precedent hardcodes `6px`.

**Measured gutter: 11px, not 6px.** Once `scrollbar-width: thin` is declared, Chrome 121+ honours
the standard property and ignores the `::-webkit-scrollbar` width — so 11px *is* the browser's
"thin", and the webkit width is effectively dead code kept only for older WebKit. The same is true
of the ChatSidebar precedent, where the 6px is equally inert in a current browser. Getting a literal
6px in Chrome would mean dropping `scrollbar-width: thin`, which costs Firefox its thin scrollbar —
so this is standards-first by choice, not by accident.

Side benefit: `thin` reclaims 4px of gutter over the default `auto`, which widened the seat cards
from 271px to 275px and gave the single-row legend more slack.

## One place the CSS leads Figma

| Element | Property | Figma | CSS |
|---|---|---|---|
| `__legend` | `gap` | split: `4px` row / `8px` column, bound to `--ai-spacing-3` | **uniform `--ai-spacing-0-5`** (2px) |

Designer call 2026-08-25, and it fixes a real layout problem rather than just tightening spacing.
**Figma's legend sits on a single row** — its five items total 240px and its content box is 272px,
so 240 + four 8px gaps = 272 exactly. Our item widths come out 3px narrower (237px) but the content
box is narrower still, so at an 8px column gap the row needed 269px against 253px available and
**wrapped to two rows** — a hair over, but wrapped.

At 2px the row needs 245px and fits with 8px to spare on desktop, 24px on mobile. Verified one row
at both breakpoints on both the All Roles and Full variants, with the legend dropping from ~46px to
32px tall.

Worth noting the fragility this exposes: single-row parity with Figma depends on font metrics to
within a few pixels. The legend still carries `flex-wrap: wrap`, so a longer role name or a larger
text size reflows rather than overflowing — which is the right failure mode.

## Interaction model

The same contract as the rest of the module:

- **Presentational only, no JS.** The seat rows are AttendeeCards — drop targets whose
  `--dragged-over` the parent module toggles. Nothing here drags.
- The **guest list is a Figma `slot`**, so the seat rows are content the caller supplies. The
  legend is likewise caller-supplied, derived from whoever knows which roles are seated.
- Delete, reorder and Assign are AttendeeCard's own controls; this pattern adds no controls of its
  own beyond the tier pill, which is not interactive.

## Cross-component findings

- **The handshake icon's colour differs between the two components.** TableDetail binds
  `--ai-icon-secondary` (`#64748b`), TableCard binds `--ai-icon-contrast` (`#94a3b8`). Both were
  resolved with `get_variable_defs` on the icon node itself (`3472:85943` here) because design
  context hides the colour inside an SVG asset. Built as drawn in each; **worth deciding whether
  the same icon in the same role should differ.**
- **The sponsor name's font-family differs too** — `--ai-font-body` here, `--ai-font-title` in
  TableCard. Both resolve to Inter so it is visually a no-op, but the binding is inconsistent.
- **AttendeeCard's seat badge has drifted.** Figma now renders it at `--ai-font-fixed-6xs` (9px);
  the component is `--ai-font-fixed-5xs` (10px). The designer's call 2026-08-25 was that **the
  component stays the source of truth** and Figma should follow, so AttendeeCard was left alone.
  Recorded here so a future audit does not "fix" it backwards. Every other AttendeeCard divergence
  seen in this panel (seat box 18→16px, meta gap, accent wrapper, action padding, reorder height)
  matches what `AttendeeCard.figma-notes.md` already documents.
- **`Left-Footer-Area` is reused as a frame name** for the meta line here, having meant the
  count-plus-badge group in TableCard. Figma layer-naming noise; worth renaming.
- **`guest-list` is a `slot` on three variants and a plain `frame` on Type=Default** — the same
  container modelled two ways.

## Accessibility

- **Hiding the header on mobile takes the table name and seated count out of the accessibility
  tree**, not just out of view. That is only correct because the mobile screen supplies them in its
  own sheet chrome — designer-confirmed 2026-08-25. If that chrome ever goes away, this needs
  revisiting, because a screen-reader user would have a list of seats with nothing naming the table.
  The panel carries an `aria-label` naming the table as partial mitigation.
- The **legend is real text**, not colour alone — each role is named beside its swatch, so the
  colour coding is never the only carrier of meaning.
- The seat list is a scroll container and is keyboard-scrollable; every control inside it is a real
  `<button>` from AttendeeCard.
- The panel is a `<section>` with an `aria-label`; the table name is an `<h3>`, nesting under the
  demo's `<h2>` section headings.

## Notes

- **`get_design_context` on the panel root returns ~61KB** and expands all ten AttendeeCard
  instances rather than collapsing them to Code Connect snippets. Fetch the sub-frames
  (`panel-header`, `legend`) individually, or extract the shell lines with a script — reading the
  whole thing is wasteful.
- **The first AttendeeCard instance is 280px wide where the other nine are 288** (and 280 vs 304 on
  mobile). It carries `size-full`, so this is Figma frame noise rather than a width override — our
  card is fluid and fills the row either way.
- **No hover, focus, pressed or disabled variants** exist in the set, and no dark-mode variant. The
  `--sp-*` role colours are **not** theme-aware, so the legend swatches will not adapt under
  `[data-theme="dark"]`.
