# ContractAnalysis (CC) — Figma Notes

`/control/contract-analysis` on the v3 framework, for **TASK-470978** (Lynx / Luismi, `no-design`).
Classic: `AfoSiteAnalysis/CC/ContractAnalysis.cfm` (the 56-line wrapper), plus the four tab includes in
`AfcCommunityMgr/CC/`: `ContractOverview.cfm`, `ContractTopAccounts.cfm`, `ContractOutstanding.cfm`,
`MonthlyReview.cfm` (about 115 KB of CFML in total, so the task's "no queries, ½h" covers the wrapper only).

## Figma Node

**None.** Assembled from existing, Figma-built parts on the ControlScreen shell (cloned from UpdateScreen).
Mark approved (2026-10-02): all four tabs in one pass; legacy errors fixed and flagged; GBP only, flagged.

## Composition

| Part | From |
|---|---|
| Shell | ControlScreen. Breadcrumb Zone Selector › CRM › Contract Analysis (menu: CRM › Analysis); title only |
| Tabs | RecordTabs. Hrefs keep classic's `?Navigation=Contract\|TopAccounts\|Outstanding\|Review`; switched in place (`replaceState`) |
| KPIs | StatCard: Xl (Overview), Base (other tabs), solid fills; `--lagoon` where it was blue (designer, 2026-10-02); `*-pound-sterling` icons for money |
| Charts | Chart pattern + Chart.js. The headline (`chart__big`) is the window total. **Overview (designer, 2026-10-02):** value charts accent blue, count charts accent orange, at `size-6` (orange replaced the designer's purple 2026-10-05: blue/purple is ΔE 2.5 deutan in the dataviz validator; blue/orange passes both themes). **Monthly review (designer, 2026-10-02):** Flowbite-style distinct hues: two-series charts use accent **blue + orange** (was blue + purple, switched 2026-10-05 for the same CVD failure); groups use blue, orange, emerald, purple, lagoon, pink, plus `text-contrast` for Other (the only order that passes the validator in both themes: worst adjacent deutan ΔE 10.1; emerald/pink are ΔE 1.1 so never adjacent; purple is 2.72:1 on the dark card, relieved by the legend and the month tables) (brand teal next to jade was too close to tell apart). Canvases are bigger there: `size-6` two-up, `size-7` full width. The tooltip uses `surface-invert`. **Bars (designer, 2026-10-02):** one shape everywhere: a 4px radius on the outer end only (top, or the right end when horizontal), a flat base, and on stacked charts only the topmost visible segment rounded |
| Filters | Input (search) + Select `--sm` + DatePicker (range), in one card per tab, inline (Flowbite-style), with a Reset |
| Tables | Datatables `--orders` + Table (as every listing), `datatables__record-link`, sortable headers (`aria-sort`), "Show n more" |
| Status | Badge, base size (designer, 2026-10-02; was `--sm`): payment (Paid success · In Arrears danger · Written Off neutral · else warning); expiry (OK success · One-off neutral · Upcoming warning · Imminent / Expired danger) |

## Tabs

| Tab | Shows |
|---|---|
| Contract overview | 3 KPIs: Total contract value, Customers, **Ave. value per customer**. 6 charts, two-up: value (filled line) and count (bar) for this month by day, the last 12 months, and the last 5 years (current year YTD). No filters |
| Top accounts | Filters: account search, account type, contract type, industry, date range (All time + 8 presets + Custom range). KPIs: Accounts, Contracts, Value. **Top 10 as a horizontal bar.** Table: Account, Industry, Account type, Contracts, First, Latest, Monthly ave., Total (default Total ↓), 20 at a time |
| Outstanding amounts | Filters: search, account type, contract type. KPIs: Outstanding, Contracts, In arrears. Table: Contract, Account, Amount, **Outstanding** (default ↓), Payment status, Term, Status, Created |
| Monthly review | Filters: search, account type, contract type, owner, industry. Charts: last 12 months vs the year before (line); new business vs renewal value (line); **new business vs renewals per-month 100% split** (stacked bar); by industry and by owner (stacked bar, **top 6 by value + Other**; each hidden when filtered to one). Then 6 month tables, newest first, each with a title, count and £ total |

## Data rules (one definition, every tab)

A contract counts when it's **not cancelled and not archived**. Top accounts additionally excludes
PaymentStatus Cancelled. Outstanding = OutstandingAmount > 0 and not Paid. Classic disagreed tab to tab: Overview
counted archived; Top Accounts excluded PaymentStatus 7 only; Outstanding's list included cancelled contracts
while its total didn't.

## Classic errors fixed (flag for the backend to match)

1. "AVE. CONTRACT VALUE" was total ÷ customers → **"Ave. value per customer"**.
2. Top 10 was a `line` chart over account names → horizontal bar. Classic's ValueList also broke on names
   containing commas.
3. Contract Type (Top Accounts) and Account Type (Outstanding) were rendered but never applied → applied.
4. "New Business / Renewals Percentage" divided by the 12-month total (no month summed to 100) → per-month split.
5. By-industry / by-owner were `TOP 20` with no ORDER BY → top 6 by value + Other.
6. Date From + Date To + a preset select → one Date range control with Custom range (a DatePicker range).
7. Outstanding's "Amounts" cell held `£12000.00<br>(£4000.00)`, unformatted → separate formatted Amount and
   Outstanding columns.
8. Type, Renewal and Media are dropped from the tables (the name carries the type; Term says One-off).
9. Counts are bars and values are filled lines (classic drew all six as identical grey lines with hardcoded
   `#3E4751`, fixed px canvases and fixed `yStepSize`).

**Also for Lynx (classic bugs found while reading):**
- Outstanding may `cflocation` to Contracts.cfm, because ContractQDef defaults `AMethod` to "v". Check on live.
- The Account autocomplete writes the account **code** into a `Name LIKE` filter.
- Sorting Top Accounts drops Date From / Date To (they aren't in `passcodes`).
- Monthly Review calls a Highcharts chart whose div is commented out (likely a JS error), and loads both Highcharts and Chart.js.
- `fmonth` moves the tables but not the charts.
- Monthly Review runs typically 60–80+ queries.

## Currency

Classic sums `Amount` across every currency under the CRM default prefix, with no conversion. The demo shows GBP
only. **The backend must either convert, or scope the figures to one currency**, because a mixed sum is wrong.

## Layout values (all borrowed, no new tokens)

| Property | Token | From |
|---|---|---|
| Page / panel / chart-grid / month-table gaps | `spacing-5` | RecordScreen card gap |
| KPI grid gap | `spacing-4` | Orders totals tiles |
| Filter card padding / fill / radius | `spacing-4` × `spacing-5`, `surface-primary`, `radius-md` | FilterBar row |
| Filter control gap | `spacing-3` | UpdateScreen action gap |
| Filter control fill | `surface-minimal` | Listing inputs |
| Select width | `size-3` → `size-2` | FieldRow label width |
| Search width | `size-3` → `size-6` cap | — |
| Top 10 canvas height | `size-6` | — |
| Monthly review canvases | `size-6` two-up, `size-7` wide | — |
| Full width | page padding `spacing-4`, gaps `spacing-4` | Dashboard of cards, like SeatingPlanner's full-width empty states (not flush) |

Numbers are tabular but **left-aligned**, per the designer's demo rule (right-aligned is build-only).

## Demo data

`contract-analysis-data.js`: 260 seeded contracts across 45 accounts over 5 years, with a fixed demo "today" of
26 Sep 2026 so "this month" has data. Everything on the page is computed from it in `ContractAnalysis.js`.
