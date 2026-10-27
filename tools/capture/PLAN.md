# Screen capture plan — DRAFT for Mark to trim

Every state is captured LIGHT at 1728 and 390 through `tools/capture/harness.html`;
the dark copies are made in Figma (clone → CCDark), never captured.
Figma: one page per family under "——— Screens ———". Rows = states,
columns = Desktop Light · Desktop Dark · Mobile Light · Mobile Dark.

`M` = modal / overlay state → captured at viewport height (`tall=0`), not full page.

## Phase 1 — Listing  (page: Listing)
| State | src | do= / notes |
|---|---|---|
| Orders · Default | ListingScreen/ListingScreen.html | — |
| Orders · Rows selected (bulk bar) | same | clickall:[data-select-row]\|3 |
| Orders · Filter open | same | click:.filter-item[data-filter-name] |
| Orders · Edit Columns open | same | click:.cc-listing__columns |
| Orders · No results | same | type into search → "zzzz" |
| Orders · Full width | ?template=full | — |
| Orders · Condensed | ?density=condensed | — |
| Articles · Default | Articles.html | — |
| Article Archive · Default | ArticleArchive.html | — |
| Media Items · Listing / Grid | MediaItems.html, ?layout=grid | — |
| Topic Manager · Hierarchy (topic selected) / Listing | TopicManager.html?topic=eGMS, ?layout=listing | settle 1200 |
| Long Queries · Individual / Grouped | LongQueries.html, ?View=grouped | — |

## Phase 2 — Article record  (page: Article)
View · Edit · Edit with errors · Confirm · Confirm (flagged) · Edit + Sector modal (M, ?state=sector) ·
Delete modal (M) · Steps · Steps + Add step modal (M) · Step Import · Step Content · Step Form

## Phase 3 — Contact  (page: Contact)
View · 9 tabs (Analysis, Commerce, Communication, Demographic, Digital Assets, Events, Page Analysis,
Permissions, Tasks) · Sparse view · Summary panel B / C · Edit · Edit with help on

## Phase 4 — Account  (page: Account)
View · 7 tabs (Commerce, Communication, Contacts, Events, Page Analysis, Tasks, User Analysis) ·
Summary panel B / C · Edit

## Phase 5 — Media & Order  (pages: Media, Order)
Media: Image view · Image edit · Video view · Video edit · Page analysis · Viewer modal (M)
Order: View · View with pins · Edit · Edit (Paid → payment grid) · Status modal (M)

## Phase 6 — Import & Export  (pages: Import, Export)
User import: Upload · Upload error · Map · Options · Review · Importing · Complete · Scheduled
Contact list import: Upload · Map · Review · Complete
Batch delete: Default · Selected · Confirm modal (M)
User export: Default · Custom columns · Nothing matches · No history · Export started
Article export: Default
Export System: Default · Targets selected · Success · Failure

## Phase 7 — Update & API  (pages: Update, API)
Update: Default · Confirm modal (M) · Failure · SSC (?ssc=1)
API help (User, CRM) · API test tool (User, CRM) · Test tool with response

## Phase 8 — Dashboards  (page: Dashboards)
Control Screen · Control Hub · Live Dashboard · Sales Leaderboard (current week; 12 months) ·
CRM Analysis · Contract Analysis ×4 tabs (+ no-match empty)

## Phase 9 — Seating Planner  (page: Seating Planner)
No event · No plan · Plan · Plan (full width) · Create plan (M) · Create plan errors (M) ·
Table selected · Assign person (M) · Room layout (M)

## Phase 10 — Shell, Login & AI  (pages: CC Shell, AI)
Shell (on Control Screen): menu docked · menu floating (hover) · Favourites / CRM / Analysis menus ·
user menu open (M) · AI Assistant panel open · favourite modal (M) · info / text-size popovers
Login · AI Assistant (initial / processing / response)
AI Chat: initial · processing · response · sidebar closed · system role open · system role minimised ·
AI Chat minimised ×3 · Chat response (intro / sources / answer) · System Role (open / minimised / dirty)

Out of scope: src/prototypes (What's On, Forums auto-answers, Event Builder, etc.).

≈ 150 states × 2 widths ≈ 300 light captures → ≈ 600 frames with dark.
