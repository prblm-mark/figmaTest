# LiveDashboard (CC) — Figma Notes

`/control/live-dashboard` (ControlProfileCode 829, menu Analysis) on the v3 framework, for
**TASK-471013** (Lynx / Luismi, `no-design`, `charts`). Classic: `/AfoSiteAnalysis/Dashboard/index.cfm`
(a standalone full-screen page with its own HTML), `AfoSiteAnalysis/js/dashboard.js` (30s refresh),
`AfoSiteAnalysis/cfc/Dashboard.cfc` (data). Brief from Mark (2026-10-05): "our best dashboard design to
date — really lean into our benchmark site" (Flowbite Application UI).

## Figma Node

**None.** Composed from existing, Figma-built parts on the ControlScreen shell: StatCard (Xl, soft),
Chart (+ Chart.js 4.4.0, as every CC dashboard), Badge, Avatar, Button, Datatables + Table.
Breadcrumb Zone Selector › Analysis › Live Dashboard.

## Classic → v3

| Classic | v3 |
|---|---|
| Online Users: Members n / Guests n, list of online members (avatar, name, company), view more (10 +10) | KPI **Online now** (members + guests, breakdown Members / Guests) + **Online members** card: avatar, name, company; Show more +10; a member-count badge |
| Page Views: Chart.js line, "Today" vs "Average", 24-hour timeline | **Page views** hero card (Chart pattern): today vs average by hour, delta Badge "+n% vs average" (today so far against the average to this hour), "Now" marker, crosshair tooltip, direct labels, legend, **View as table** |
| "The data below is sampled across last N hours" | A meta line: clock icon, "Rankings below are sampled across the last **N hours** — as far back as it takes to reach 2,000 views, up to 24 hours" (getTimeFrame's own rule, now said aloud) |
| Top Author / Top Channel / Top Topic lists (views + name), view more (4 +8 / 5 +10 / 5 +10) | Three leaderboard cards: rank, name (avatar for authors), views right-aligned, **share-of-top bar**; Show more with classic's steps |
| Top Article table (Title, Author, Published, Views), view more (5 +10) | **Top articles** Datatables + Table: title link, author with avatar, published date, views right-aligned; Show more +10 |
| `setTimeout(aosGetData('all'), 30000)` — silent | Same 30s refresh, now visible: **Live** Badge with a pulsing dot, "Updated n s ago", **Pause / Resume** |
| — | KPI **Page views today** (since midnight; breakdown vs average, this hour) and **Busiest channel** (views, share) — derived from data classic already loads |

Links are classic's own, in a new tab as classic opens them: contacts (UserCode), channel
(ChannelCode), taxonomy-manager-screen (TaxonomyCategoryCode), standard-item-edit view (StandardItemCode).

## The Flowbite moves

KPI tiles across the top (StatCard Xl, related figures folded into one tile's breakdown); one hero chart
with its headline in the card header; a "latest customers"-style people list; "top products"-style
ranked lists with share bars; a compact table card; a small live status in the header. Right-aligned
numbers with tabular figures **on this dashboard** (Mark, 2026-10-05; the listing demos stay
left-aligned).

## Chart colour — validated, not chosen

`scripts/validate_palette.js` (dataviz skill), both themes:

| Pair | Result |
|---|---|
| blue + slate (`text-contrast`) dashed | **FAIL**: normal-vision ΔE 13.9 (< 15) and the slate reads as grey |
| blue + purple (the designer's two-series pair on Contract Analysis) | **FAIL**: deutan ΔE **2.5**, near-identical to a deuteranope |
| blue (`accent-blue-solid`) + orange (`accent-orange-solid`) | PASS every check, light and dark: protan ΔE 27.6, tritan 34.4 (used 2026-10-05 → 10-07) |
| **lagoon (`accent-lagoon-solid`, Lagoon/9) + purple (`accent-purple-solid`, Purple/600)** | **PASS** CVD in both themes: deutan ΔE 16.0, tritan 19.8, normal 28.6. Purple is 2.72:1 on the dark card (WARN) — relieved by the direct labels, the legend and the table view |

**Current (designer, 2026-10-07): Today = lagoon, solid, gradient fill; Average = purple, dashed, no fill**
— the same pair as Contract Analysis. Both are direct-labelled and in a line-style legend, so identity
never rests on hue alone. Text stays in text tokens.

KPI tiles follow the house card rule — lead with lagoon, blue only after the other accents are used:
Online now `lagoon`, Page views today `jade` (was blue), Busiest channel `violet-radix`.

Leaderboard share bars fill with `accent-lagoon-solid` (was `surface-brand`), matching the Today line in both
themes (`surface-brand-light` is the same hex in light but lightens in dark).

## Layout values (all borrowed, no new tokens)

| Property | Token | From |
|---|---|---|
| Page grid | **one** 3-column grid; KPI row, hero row and leaderboards are subgrids of it (chart spans 2, online list 1) | — so every column edge lines up top to bottom. Measured 2026-10-05: before, the 2fr / 1fr hero row sat 6px off the columns above and below; after, all rows share 320–703 / 719–1103 / 1119–1502 at 1600 |
| Block gap | `spacing-5` (12px / `spacing-4` in full width); the subgrids take `gap: inherit` | UpdateScreen / record screens' card gap. A subgrid inherits only the COLUMN gap, so stacked KPI tiles first touched (Mark, 2026-10-05); measured after: 16px stacked and side by side, 12px in full width |
| People-grid track minimum | `size-5` (280px) | — |
| Card chrome | `spacing-6` padding, `spacing-5` gap, `surface-primary`, `radius-md` | the Chart pattern's own card |
| Top-level card border / shadow | `border/card`, `shadow/2xs` (standard width) | the CC top-level card rule |
| Card title | title, semibold, `fixed-md` | RecordSection's title |
| Share bar | `spacing-2` tall, `radius-full`, `surface-contrast` track, `surface-brand` fill | RoomCard's Figma-built progress bar |
| Canvas | min `size-6` (320px), grows with the card; min `size-5` on a narrow page | — |
| Live dot | `spacing-3` | the Badge's icon scale |
| People-row padding | `spacing-3` / `spacing-4` | DropdownItem's row padding |

## Responsive

- **KPI tiles:** each wraps in a size container (`cc-live-kpi`; its width is the grid track's, which
  follows the space available). Below 384px the breakdown moves under the value, using StatCard's own
  stacked arrangement.
- **Hero row:** below 1023 (`cs-page`) the chart and the online list each take the full row; the KPI
  tiles and leaderboards keep three columns. Below 767 the whole grid is one column. The people list is
  an intrinsic grid (one column in the side card, two or three when it spans the page).
- **Below 767 (`cs-page`):** the hour axis labels every 6 hours on a narrow chart, Top articles drops
  Published, and titles / authors wrap (the base Table's `nowrap` made the table 779px in a 294px card).
  The header's "Updated" text goes below 767 on `cs-main` (the header is outside the page column).
- Measured at 390: 390/390, nothing past the edge.

## Full width

Contract Analysis's dashboard treatment (the precedent for a dashboard): the shell takes the page
padding away, so the page keeps a 12px inset (`spacing-4`) and the gaps tighten to 12px; cards keep
their own edges and radius and drop the card shadow (full width is flat). The first pass removed the
gaps but kept radius and borders, which doubled every seam into 2px; the subgrid keeps the columns
aligned here too (308–699 / 711–1102 / 1114–1505 at 1600).

## Accessibility

The canvas is `role="img"` with a label; **View as table** gives every hour's numbers. The ticking
"Updated" text is not a live region; only Pause / Resume are announced. Pause is `aria-pressed`. No
pulse, value highlight or bar transition under reduced motion. Row links have a background-only
hover (the menu-link rule).

## Gotchas hit (kept so they are not hit again)

- A leftover, unopened comment line swallowed the next rule (the delta colour). The braces balanced,
  so a brace count can't catch this; listing the rules that match the element did.
- StatCard's `.stat-card__breakdown-value` colour outranks a single-class override; the delta colour
  is qualified with it.
- The visually-hidden "views" labels are absolutely positioned; with no positioned ancestor they escaped
  the page scroller's clip and made the document 1,285px tall in a 900px window (a second, window-level
  scroll). `.cc-live__card` is now `position: relative`; the document equals the window in all layouts.

## Backend (`TODO(backend:LiveDashboard)`)

| id | What |
|---|---|
| `live-data` | Every count is mock. Live = Dashboard.cfc: getOnlineUsers, getDayPageViews (today + average by hour), getTimeFrame, getCreatorViews, getChannelViews, getTaxonomyCategoryViews, getArticleViews, with MaxRows paging (classic's initial counts + steps are in `live-dashboard-data.js` → `paging`) |
| `live-refresh` | Poll the same data every 30s (classic's dashboard.js) and re-render; honour Pause. Classic redirects on "Access Denied" (security code 14), so keep that |
