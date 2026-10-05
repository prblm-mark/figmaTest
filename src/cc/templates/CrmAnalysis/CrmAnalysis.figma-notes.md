# CrmAnalysis (CC) — Figma Notes

`/control/crm-analysis` (menu Analysis › CRM) on the v3 framework, for **TASK-471015** (Lynx / Luismi,
`no-design`, `charts`). Classic: `/AfoSiteAnalysis/CC/CRMAnalysis.cfm` (704 lines; every query inline).
Brief from Mark (2026-10-05): "something nice and creative, again lean into our benchmark" (Flowbite
Application UI), after Live Dashboard and Sales Leaderboard.

## Figma Node

**None.** Built on the Live Dashboard and Sales Leaderboard: cards, card titles, ranked rows with share
bars, table views and the full-width treatment come from `../LiveDashboard/LiveDashboard.css`, linked
before `CrmAnalysis.css`. Parts: SegmentedControl (sm), Badge, Chart.js 4.4.0, on the ControlScreen
shell. Breadcrumb Zone Selector › Analysis › CRM Analysis.

## Classic → v3

| Classic | v3 |
|---|---|
| Top row: CONTACTS → ACCOUNTS, OPPORTUNITIES → WINS (two pairs, an arrow image each) | **Your CRM at a glance**: the same two pairs, each stat a soft icon chip + label + value, linking to its listing. Each arrow now carries the relation it stands for, in a Badge on an arrowed hairline: **"3.6 per account"**, **"33% won"** (wins ÷ all opportunities, as both of classic's counts are all-time). The win rate is also **drawn**: the Wins chip is a radial gauge filled to it, sweeping up on load. "All time, as of …" in the card head |
| CONTRACTS THIS MONTH (line, by day) + CONTRACTS (Last 12 Months) (line, by month) | **Contracts** card: one chart with a **This month / 12 months** SegmentedControl and a count Badge ("6 this month"). **This month is a calendar heatmap**: a Mon–Sun table, each day shaded by its count, days to come outlined, today ringed, with a None → Most key. Daily counts here are small and patchy, so a line or bars were mostly empty space; the calendar shows busy days, gaps and the weekly rhythm at a glance. **12 months is a gradient area chart** (Live Dashboard's treatment, monotone smoothing so it never dips below zero), with a crosshair tooltip and **View as table** (Mark, 2026-10-05: "more visually striking" than the first pass's bars) |
| TOTAL CONTRACT VALUE / CUSTOMERS / AVE. CONTRACT VALUE strip | The card's figures, the first leading at StatCard Xl's value size. "Ave. contract value" is labelled **Ave. value per customer**, as Contract Analysis already corrected (it is total ÷ customers) |
| — | **Top customers** (new): the five biggest accounts by contract value with share bars, linking to Contract Analysis › Top accounts |
| OPPORTUNITIES THIS MONTH + Opportunities (Last 12 Months) | **Opportunities** card, same shape. Classic's rules are kept: "this month" leaves out Closed Won and Closed (Stage NOT IN 9, 10), so the subtitle says "still in play"; the 12 months count every opportunity |
| OPEN OPPORTUNITY VALUE / OPEN OPPORTUNITIES / AVE. OPPORTUNITY VALUE strip | The card's figures |
| — | **Open pipeline by stage** (new): the five open stages in stage order with count, value and a share bar, each linking to the opportunities listing filtered to that stage; then classic's open rule said aloud: "Not counted as open, as in classic: 18 prospecting and 95 on hold, plus everything closed" |
| Contact Notes (Last 30 days) (line) | **Contact notes** activity card: the 30-day total, a Badge with the change against the 30 days before, a **gradient area sparkline** (the Flowbite KPI card's chart; first and last dates only), the busiest day and the daily average, and a table view |
| Unsubscribes (Last 30 days) (line) | **Unsubscribes** card, same shape. A rise is bad news here, so an increase reads **danger** and a fall success; within ±2% is neutral on both cards |
| A chart section disappears when it has no data | The card stays, with "No contracts created this month yet." in place of the chart |

## Data rules (worth a look)

- **Contracts are Contract Analysis's own data and rule.** The page loads
  `../ContractAnalysis/contract-analysis-data.js` and counts contracts that are not cancelled and not
  archived, so the two screens show the same value, customers and average (checked: £5,909,300, 45,
  £131,318, and 6 this month). Classic CRM Analysis filtered on CancelledYN only; Contract Analysis's
  notes set the shared rule.
- **"Open" opportunities** are Stage NOT IN (1, 9, 10, 11): Prospecting is not open in classic. The
  stage names are AffinoComrz's real CRMProfileOpportunityStage rows: Prospecting, Qualification, Needs
  Analysis, Value Proposition, Proposal / Price / Quote, Negotiation / Review, Closed Won, Closed, On
  Hold.
- **"Contact notes" counts every note.** Classic's query has no note-type or contact filter, despite the
  title. Kept as classic; flagged for Lynx.
- **The comparisons are new data:** the 30 days before (for the notes / unsubscribes change) and opportunities
  by stage (for the pipeline). Both come from the same tables as classic's own queries.
- The demo uses Contract Analysis's fixed "today" (26 Sep 2026), so "this month" is most of a month.

## Layout values (all borrowed, no new tokens)

| Property | Token | From |
|---|---|---|
| Page grid | 2 columns, `spacing-5` gap (`spacing-4` full width); glance card spans both | the other dashboards' gap |
| Pipeline cards | a **subgrid** of the page's rows (head, figures, chart, ranked list) with `row-gap: spacing-5`, so both cards' sections start on one line however their labels wrap; `minmax(0, 1fr)` column | — measured: the implicit min-content column overflowed at 390 (324 / 309) |
| Card chrome, title, ranked rows, table view | as Live Dashboard | Live Dashboard |
| Share bars | Live Dashboard's bar, filled `accent-lagoon-solid` (the charts' token, not `surface-brand`, so a client brand change cannot split bars from charts) | Mark, 2026-10-05 |
| Glance stat icon chip | `spacing-8`, `radius-md`, 16px icon, `accent-lagoon-soft` / `-soft-fg` | StatCard's soft icon |
| Stat / figure labels | body, `fixed-xxs`, semibold, uppercase, `text-contrast` | StatCard's breakdown label |
| Stat value, lead figure | title, bold, `fixed-xl`, `leading-lg` | StatCard Xl's value |
| Other figures | `fixed-sm`, bold, `leading-lg` (the lead's line box, so the three share a baseline) | — |
| Relation hairline + arrowhead | 1px `border-primary`; arrowhead `spacing-3` square, rotated | — |
| 12-month area chart height | `size-3` (192px) | half a hero, as two sit side by side |
| Calendar cell | `spacing-7` tall, `radius-sm`, `spacing-1` spacing; day number title `fixed-3xs` medium | — |
| Calendar shades | none: `text-contrast` 12% into `surface-primary`; then `accent-lagoon-solid` 35% / 65% into `surface-primary`, then solid (number in dark ink, see Colour); to come: 1px `border-secondary` inset; today: 2px `text-primary` inset | `color-mix()` of tokens, no new tokens |
| Win-rate gauge | the chip (`spacing-8`) as a `conic-gradient` ring: `accent-lagoon-solid` to the rate on `accent-lagoon-soft`, a `spacing-1` ring around a `surface-primary` hole; sweeps 900ms via a registered `--cc-crm-pct` | StatCard's soft icon chip |
| Activity value | `fixed-3xl`, bold, `leading-xl` | — the Flowbite KPI-with-chart scale |
| Sparkline height | `size-1` (128px) | — |
| Meta / note / "more" link text | title, `fixed-3xs`, medium, `text-contrast` (link `text-secondary`) | Sales Leaderboard's meta text (Mark, 2026-10-05) |
| Area charts | 2px line, fill fading 25% → 0, monotone, crosshair on hover | Live Dashboard |

## Colour

**One colour scheme, lagoon** (Mark, 2026-10-05): every data mark — area charts, calendar shades,
share bars, the win-rate gauge — is `accent-lagoon-solid`, and the icon chips are lagoon soft (each icon
is named by its label). Every chart is single-series, so no pairing needs CVD validation. The calendar
is a **sequential** scale of that one hue (dataviz rule), checked for one direction in each theme by
computed OKLab lightness, none → most: light 0.95 / 0.86 / 0.76 / 0.65, dark 0.34 / 0.41 / 0.52 / 0.65.
"None" is a 12% neutral mix: `surface-secondary` on the dark card is LIGHTER than the first shade, so
the scale ran backwards there. Day numbers on solid lagoon are dark ink in both themes: its white `-fg`
is 3.15:1, so light mode uses `text-primary` (5.17:1) and dark mode `surface-primary` (4.65:1), as
dark mode's `text-primary` is light. The status colours on the delta Badges stay as they are (reserved
for good / bad, with an icon). Text stays in text tokens.

## Responsive

- **Below 1023 (`cs-page`):** the two glance pairs stack, each keeping its stat — relation — stat line.
- **Below 767:** one column; card heads wrap (title, then the period switch).
- **Pipeline figures** fold to the lead figure over the other two whenever the figures' box is under 420px (it is ~456 at a 1440 window, ~350 at 1200) (a
  size container on `.cc-crm__figures-wrap`), so a one-word label like "OPPORTUNITIES" never runs into
  its neighbour. The container is the wrapper, not the card: a size container gets layout containment,
  which switched the card's subgrid off (the two heads went 10px out of line).
- **Below 480:** a pair stacks its stats with the relation Badge between them.
- Measured at 390: page 323 / 323, no card overflowing. At 1200 the two cards' titles both sit at 415
and their lists at 929.

## Accessibility

The glance card's arrows are decorative; a visually-hidden sentence says the same ("3,842 contacts
across 1,064 accounts, 3.6 per account. 1,296 opportunities, of which 423 won, 33%."). Each pair is a
labelled group. The period switch is SegmentedControl's radio group (roving tabindex). The calendar is a real
`<table>` (caption, weekday `<th>` with full names in `<abbr>`, each day's count as visually-hidden
text and a `title`), so it is its own table view and the separate one is hidden in that mode. Every
canvas is `role="img"` with a label giving the period and total, and has a table view. The gauge sweep
is off under reduced motion. Delta Badges
carry an icon and a sign, not colour alone.

## Backend (`TODO(backend:CrmAnalysis)`)

| id | What |
|---|---|
| `crm-data` | Every figure is mock. Live = classic's own queries in CRMAnalysis.cfm (listed in `crm-analysis-data.js`), contracts under Contract Analysis's shared "counted" rule, plus two small additions: the previous 30 days for notes / unsubscribes, and open opportunities grouped by stage |
