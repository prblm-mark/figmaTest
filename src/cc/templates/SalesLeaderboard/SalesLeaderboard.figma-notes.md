# SalesLeaderboard (CC) — Figma Notes

`/control/sales-leaderboard` (menu Commerce › Sales Analysis) on the v3 framework, for **TASK-471014**
(Lynx / Luismi, `no-design`, `charts`). Classic: `/AfoECommerce/CC/SalesLeaderboard.cfm` (a standalone
full-screen page with its own HTML), `AfoECommerce/js/salesleaderboard.js` (5-minute refresh, view
more), `AfoECommerce/cfc/SalesLeaderboard.cfc` (data). Brief from Mark (2026-10-05): use the Live
Dashboard build as the reference.

## Figma Node

**None.** Built on the Live Dashboard (TASK-471013): its page grid, cards, ranked lists with share
bars, tables, KPI tiles, chart treatment and full-width treatment come from
`../LiveDashboard/LiveDashboard.css`, linked before `SalesLeaderboard.css`. Parts: StatCard (Xl, soft),
Chart (+ Chart.js 4.4.0), Select, Badge, Avatar, Button, Datatables + Table, on the ControlScreen shell.
Breadcrumb Zone Selector › Sales Analysis › Sales Leaderboard.

## Classic → v3

| Classic | v3 |
|---|---|
| Time Frame select (Current Week, 7 Days, Current Month, Previous Month, 30 Days, Current Year, 12 Months; default Current Week) | **Select** in a toolbar above the KPIs, no visible label (`aria-label`), the window's dates beside it, as short as they can be and still exact ("Mon 5 Oct", "1–30 Sept", "5 Sept – 5 Oct", "5 Nov 2025 – 5 Oct"). Re-runs the leaderboards and the two time-frame KPIs, as classic's change handler re-ran `getData('all')` |
| Currency select (the zone's order currencies, store default first) — **reloaded the page** | **Select** beside it; re-renders everything in place. Both choices stay in the URL as classic's `?timeframe=` / `?currency=`, so a link opens the same view |
| Total Monthly Sales (Chart.js line, this year vs last, Jan–Dec, "Order Value" axis, ex VAT) | **Monthly sales** hero card: this year lagoon + filled, last year purple + dashed (the house pair with Live Dashboard and Contract Analysis, designer 2026-10-07; was blue + orange), delta Badge "+n% year to date", crosshair tooltip, direct labels, legend, **View as table**. This year stops at the current month, and that month's segment is **dotted** with a "October to date" legend key: classic drew the months still to come as 0, and a part-month total then reads as a collapse |
| Top Sales Teams list (order value + team), view more (5 +5) | Leaderboard card beside the chart: rank, team link, value right-aligned, **share-of-top bar**; Show more +5 |
| Top Sales People table (Sales Representative, Sales Team, Business Unit, No. Orders, Total Value), view more (5 +5) | **Top sales people** Datatables + Table, rep with avatar; "Multiple" for a rep in several teams / units, as classic; Show more +5 |
| Most Recent Sales table (Product, Order No., Product Category, Product Line, Value, Account), view more (5 +5) | **Most recent sales** table with the same columns plus **Ordered** (the date, which classic loaded but never showed); Value moved to the end so values line up with the other table; Show more +5 |
| `setTimeout(aosGetData('all'), 300000)`, only while the window has focus | Same 5-minute refresh while the tab is visible, now with "Updated n m ago" in the toolbar; a line that arrives with a refresh gets one brief highlight |
| — | KPIs **Sales** (time frame; orders, average order), **Sales this year** (vs the same span last year, best month), **Top sales person** (time frame; value, orders) — derived from data classic already loads |

Every leaderboard repeats the time frame beside its title, so a card read alone says what window it
covers. Links are classic's own, in a new tab as classic opens them: sales-team (SalesTeamCode),
contacts UserView (UserCode), catalogue-item (CatalogueItemCode). Order numbers stay plain text, as
classic.

Money is formatted as classic's `FormatPriceList` does it, from the real Currency rows: GBP `£` with
2 decimals, EUR `€` and USD `$` with none. KPIs and the chart axis round to whole units; the tables keep
each currency's own decimals.

## To confirm (classic quirk, changed in the demo)

**Previous Month had no end date.** `getTimeFrame(4)` returns the first of last month and every query
is `Created >= start`, so classic's "Previous Month" counted last month **and everything since**. The
demo ends it at the first of this month. If classic's behaviour is wanted, that is a one-line change
in `windowRange()`.

## Data

Real (AffinoComrz config, 2026-10-05): currencies and their formats; product lines (Affino, Digital
Leaders Forum, CEO Forum); product categories (Consultancy, Training, SaaS, Design and Build,
Support); business unit "Affino"; sales team "Main Affino Sales Team". Sales people are the staff names
the other CC demos use; accounts are real Affino clients. **affino.com itself has one sales team and
one business unit**, so its live leaderboard has a single row; the demo adds six teams and two units
to show the screen at the size it is built for. Orders are generated from a fixed seed relative to
today (about five a weekday, a quarter of them owner-less web orders that count in the monthly totals
but no leaderboard, as classic's `OwnerUserCode > 0`), so every time frame has data and the demo is
stable. Order rows themselves were not read (customer data).

## Layout values (all borrowed, no new tokens)

Everything in Live Dashboard's table applies (grid, gaps, card chrome, card title, share bar, canvas).
New here:

| Property | Token | From |
|---|---|---|
| Toolbar gap | `spacing-4` / `spacing-5` | Live Dashboard's full-width gap / block gap |
| Time frame Select width | cap `size-3` (192px), `flex: 0 1` | — fits "Previous month"; a cap, so it yields on a phone |
| Currency Select width | cap `size-1` (128px), `flex: 0 1`; the grid's second column below 767 | — |
| Range / Updated / card meta text | title, `fixed-3xs`, medium, `leading-sm`, `text-contrast` | Mark, 2026-10-05 |
| Part-month legend key | 2px **dotted** `accent-lagoon-solid` | Live Dashboard's legend keys |
| KPI tiles | `lagoon`, `jade` (was blue), `violet-radix` | card accents lead with lagoon, blue only after the other accents (designer, 2026-10-07) |
| New-line highlight | Live Dashboard's `cc-live-changed` wash | — |
| Table fit | **DatatablesFit.js** (`src/components/Datatables/`) — the listings' fit for dashboard tables: natural widths, spare shared (water-filling; `data-snug` capped at 224, then spread evenly when all are capped), and when a row does not fit a kebab appears and columns drop in `data-drop` order into the detail row. Top sales people: keep Sales representative + Total value; drop Business unit → Sales team → Orders. Most recent sales: keep Product + Value; drop Product line → Product category → Order no. → Account → Ordered. Replaces the ≤767 hide-column CSS and the earlier `spreadColumns()` | the listings' fit (designer 2026-09-18 → 22); Mark, 2026-10-07: "the tables aren't responsive friendly" |

## Responsive

- Live Dashboard's rules apply: KPI tiles stack their breakdown below 384px; below 1023 (`cs-page`) the
  chart and the **teams card** each take the full row; below 767 one column.
- **Below 767 (`cs-page`):** Top sales people keeps rep, orders and value (Sales team and Business unit
  go); Most recent sales keeps product, account and value. Headers and text cells may wrap. Measured
  at 390: both tables 309 / 309 (the people table was 311 / 309 until headers could wrap); the page
  323 / 323.
- **Toolbar below 767:** a two-column grid (Mark, 2026-10-05: "sharper" — the wrapped toolbar left ragged widths and three stray lines): the time frame Select fills the row beside the currency's 128px (`size-1`), both flush with the cards' edges; the dates and "Updated" share the second line, the dates truncating with an ellipsis if they ever need to. Checked at 390 with the longest labels (Previous month, 12 months).

## Full width

Live Dashboard's treatment, unchanged: 12px page inset and gaps, flat cards.

## Accessibility

Both Selects are named by `aria-label`; a change is announced ("Showing 30 days", "Showing EUR
sales") through a visually-hidden polite region, anchored in the toolbar. The canvas is `role="img"`
with a label that follows the currency; **View as table** gives every month, marking the current one
"(to date)". The part-month segment is dotted, not only lighter, so it does not rest on colour. No
highlight animation under reduced motion.

## Backend (`TODO(backend:SalesLeaderboard)`)

| id | What |
|---|---|
| `sales-data` | Every order is mock. Live = SalesLeaderboard.cfc: getZoneCurrencies, getTotalMonthlySales (this year + last by month, ex VAT), getTopSalesTeams, getTopSalesPeople, getMostRecentSales from the time frame's start, MaxRows paging (5 +5, capped at 100), excluding the CRM profile's order / payment statuses |
| `sales-refresh` | Call `getData&type=all` with the time frame, currency and each list's MaxRows every 5 minutes while visible (classic's salesleaderboard.js) and re-render. Keep classic's "Access Denied" redirect (security code 14) |
