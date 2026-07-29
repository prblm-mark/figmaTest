# Backend Developer Handover

> **Read this first if you're picking up the back-end work.**
> Companion machine-readable index: [`docs/handover-manifest.json`](docs/handover-manifest.json).

## TL;DR

This repo is the **Affino AI Design System** — a **front-end-only** component library
(vanilla **HTML + CSS + JS**, Webpack 5, **no framework, no backend**). It is built from Figma
and used to produce production HTML/CSS. **Every data value is hardcoded or in-memory, and most
actions are visual-only.** "Backend handover" here means: *which interactive elements are mock,
and what real data / API / auth / persistence / AI work each one needs.*

This round covers the **Control Centre `ControlScreen`** surface. Other surfaces will be added
the same way (see [Adding a surface](#adding-a-surface)).

## Run it locally

```bash
npm install
npm run tokens     # generates css/*.css from FigmaTokens/ (gitignored — REQUIRED before demos render)
npm start          # webpack dev server (http://localhost:8080)
```
Open the surface: `http://localhost:8080/src/cc/templates/ControlScreen/ControlScreen.html`

> Note: generated `css/*.css` and `src/prototypes/` are **gitignored** — run `npm run tokens` after cloning.

## How to read this repo (for an agent or new dev)

Sources of truth, in priority order:

1. **`CLAUDE.md`** — project rules (tokens, architecture, the mandatory `/build-component` workflow).
2. **`docs/component-registry.md`** — every component's `Status` (`Built` vs **`Built (visual only)`**) + notes.
3. **`src/**/<Name>.figma-notes.md`** — per-component notes; often flag "no JS", "deferred", "consumer's responsibility".
4. **`TODO(backend:<Surface>)` markers in code** — the in-context flags (see below).
5. **`docs/handover-manifest.json`** — the structured index of everything below.

## Flagging convention (reusable across surfaces)

Anywhere a front-end element is mock / needs backend, it carries a greppable marker:

- **HTML:** `<!-- TODO(backend:ControlScreen): <what is mock> → <suggested contract> -->`
- **JS:** `// TODO(backend:ControlScreen): <what is mock> → <suggested contract>`
- **DOM hook (optional):** `data-backend-todo="<id>"` on the element (lets an agent/script find them live).

Find them all:

```bash
grep -rn "TODO(backend" src/
# or, by surface:
grep -rn "TODO(backend:ControlScreen)" src/
```

Each marker's `<id>` matches an entry in `docs/handover-manifest.json` → `surfaces.<Surface>.items[].id`.

## Status taxonomy

| Category | Meaning |
|---|---|
| `visual-only` | Rendered, but **no behaviour** wired at all. |
| `fe-wired` | Works **client-side**; no backend needed (may be fine as-is). |
| `needs-backend` | Requires real **data / API / auth / persistence / AI**. |

---

## Surface: Filters

The Filter Item chip (`src/components/FilterItem/`) and the filter-bar toolbar
(`src/patterns/FilterBar/`, two-row). Front-end
**visual + state API only**: the chips, saved-views menu, search mode, New View, Export and
kebab actions all render and transition, but no data, querying, or persistence is wired.

| id | Element | Now | Backend work needed | Category |
|---|---|---|---|---|
| `filter-item-picker` | `.filter-item__trigger` (emits `filter-item:toggle`); `el.setFilterValues([…])` | Trigger toggles open + chevron flip; no value list, nothing persists | Mount a multi-select value picker on `filter-item:toggle`; source options per filter; call `setFilterValues([…])` (chip applies the 1–3 / 4+ rollup); persist active set; `×` clears (`filter-item:clear`) | needs-backend |
| `filter-bar-views` | `.filter-bar__views` Dropdown + “+ New view” + Create | Static All Orders / My Content; New view enters rename mode but Create is a no-op; per-row Copy/Delete mock | Saved-views CRUD per user+context (GET / POST create-from-filters / PATCH rename / copy / DELETE); switching a view loads its filter set | needs-backend |
| `filter-bar-search` | `.filter-bar__search .input__control` | Search mode toggles but typing does nothing | Debounced query against the list data source; reflect in the controlled table | needs-backend |
| `filter-bar-export` | `.filter-bar__export` + kebab actions | Buttons/menu render, no handler | Export current view; wire kebab actions to endpoints | needs-backend |

`grep -rn "TODO(backend:Filters)" src/`

---

## Surface: ControlHub

`src/cc/templates/ControlHub/ControlHub.html` — the CC filterable directory screen (a second
"Control Screen" view). It **reuses the ControlScreen app-shell verbatim**, so every shell-level
backend item (sidebar nav, auth, notifications, AI assistant, favourites, etc.) is inherited —
see the ControlScreen surface below. The items here are specific to ControlHub's own page content.

| id | Element | Now | Backend work needed | Category |
|---|---|---|---|---|
| `controlhub-filter` | `.cc-directory__filter .input__control` ("Filter…") | Renders (search + clear) but typing does nothing | Client-side only: debounced title filter across sections, hide non-matching cards + empty headings; clear resets | visual-only |
| `controlhub-card-actions` | `.action-card--chevron` (`href="#"`) + `.action-card--button .btn` ("+ add") | Chevron links to `#`; "add" buttons inert | Real per-area destinations + add-to-favourites/dashboard (POST, reflect added state); taxonomy from the nav content source | needs-backend |

`grep -rn "TODO(backend:ControlHub)" src/`

---

## Surface: Login

`src/cc/templates/Login/Login.html` — the CC Control Centre login screen. A standalone
visual mock: the form renders but no authentication, session, or validation is wired.

| id | Element | Now | Backend work needed | Category |
|---|---|---|---|---|
| `login-submit` | `.cc-login__card` `<form>` + `.cc-login__submit` ("Login") | Submits to `#`; no auth | `POST /auth/login {email, password, remember}` → set session, redirect to Control Centre; surface error states on the inputs | needs-backend |
| `login-remember` | `.checkbox` ("Remember me", `name="remember"`) | Toggles visually only | Bind to session lifetime (persistent vs session cookie) on login | needs-backend |
| `login-forgot` | `.cc-login__link` ("Forgot password?", `href="#"`) | Links to `#` | Route to `/auth/forgot` (password-reset flow) | needs-backend |
| `login-register` | `.cc-login__link` ("Register Now", `href="#"`) | Links to `#` | Route to `/auth/register` (sign-up flow) | needs-backend |

`grep -rn "TODO(backend:Login)" src/`

---

## Surface: ControlScreen

`src/cc/templates/ControlScreen/ControlScreen.html` — the CC home/landing dashboard.
Front-end is complete; all data is hardcoded and most actions are mock. It composes many CC
patterns (see `docs/component-registry.md` for per-component status).

| id | Element | Now | Backend work needed | Category |
|---|---|---|---|---|
| `favourites-persistence` | `saveFav()` / `removeFav()` + `.cc-control__fav-list` | In-memory DOM only; lost on reload | Favourites CRUD: GET (load on init) / POST `{name, context, ts}` / DELETE | needs-backend |
| `submenu-pins` | `initSubmenuPins()` + `.cc-menu__submenu-item--pinned` | Pins float a sub-item to top (`order:-1`) + filled icon, but in-memory only; per menu tree, not synced desktop↔mobile, lost on reload | User-prefs API: GET pinned ids on init / POST on pin / DELETE on unpin; key by user + item id, share across menu trees | needs-backend |
| `panel-search` | "Search Control / Favourites / CRM" inputs | No handler | Per-panel search/filter API → populate lists | needs-backend |
| `sidebar-nav-data` | SidebarMenu submenu links | Hardcoded `<li>`, no nav | Menu/structure API + permissioned navigation | needs-backend |
| `zone-selector` | Zone Selector dropdown | Static options, visual select | Load zones; persist choice; reload data for zone | needs-backend |
| `charts-data` | Page Views + Users charts, range buttons, report links | Hardcoded Chart.js arrays; buttons/links visual | Analytics API + time-range query; real report routes | needs-backend |
| `whos-online-table` | "Who's Online" Datatables (search/sort/pagination) | Static rows; controls visual only | Users API (paginate/sort/search) + live online status | needs-backend |
| `auth-actions` | Logout / Sign Out / Switch Mode / View Site | No handlers | Auth/session endpoints + redirects; mode-switch | needs-backend |
| `notifications` | Header bell + count badge | Static "2"; no handler | Notifications API + drawer | needs-backend |
| `ai-assistant` | Mounted AiAssistant panel (input, history, menu) | Initial view only; send inert; history static | Chat/AI backend (send/stream, history CRUD, feedback) | needs-backend |
| `text-size` | Rail Text-size slider | Emits events only | Bind to font-scale var + persist preference | needs-backend |
| `minimise` | Rail Minimise button | Visual only | Toggle a condensed spacing view (`data-layout="minimised"`) + persist preference | needs-backend |
| `print` | Rail Print button | `window.print()` — works | None (unless server PDF wanted later) | fe-wired |

> The processing/response chat states (GSAP-animated) live only on the **standalone**
> `src/cc/templates/AiAssistant/AiAssistant.html` demo — they are **not** mounted in ControlScreen
> and are demo-only (no real AI). The ControlScreen mount is the initial view only.

---

## Adding a surface

When another surface (e.g. AiAssistant, Header, a generic component) is handed over:

1. Add `TODO(backend:<Surface>)` markers (+ optional `data-backend-todo`) at each mock element.
2. Add a `surfaces.<Surface>` block to `docs/handover-manifest.json` (same item shape).
3. Add a `## Surface: <Surface>` section + table here.

Keeping the marker `id`s in sync with the manifest `id`s is the only rule.

## Surface: AudioPlayer

`src/components/AudioPlayer/AudioPlayer.html` — the article audio player component (one unified
waveform card; `--sticky` docks to the viewport bottom on scroll). Playback is **simulated** by a
JS timer so the waveform, time and countdown read true in the demo; no real audio is bundled.

| id | Element | Now | Backend work needed | Category |
|---|---|---|---|---|
| `AudioPlayer` | `.audio-player` `[data-ap-player]` (play/pause, click-seek waveform, remaining-time toggle, download) | A timer advances a fake progress value; download button is a no-op | Wire to a real `<audio>` / streamed source. Contract: `{ src, duration, downloadUrl }`. Replace the ticker with `audio.timeupdate`; point download at `downloadUrl` | needs-backend |

`grep -rn "TODO(backend:AudioPlayer)" src/`

---

## Surface: EventBuilder

`src/prototypes/EventBuilder/` — an **exploratory prototype** (8 screens + shared `.css`/`.js`) for
a stand-alone event builder: an AI brief generates a complete draft event page, the assistant then
walks the client through what it couldn't infer, and the same event can be edited three ways —
conversationally, in-context on the real front-end page, or field-by-field in a full form.

Two things to understand before wiring anything:

- **No new event capability.** Every block maps 1:1 to a field the current Advanced Event template
  already has. The value is in structure and speed, not new features. The `Coming later` cards in
  the block library on `05-blocks.html` are deliberately inert placeholders.
- **The whole event model is in the DOM.** Block membership, order, page shape and field values are
  held as `data-eb-*` attributes and classes, and are lost on reload. The only persistence is the
  brief, in `sessionStorage` under `eb:brief`. A real version needs one event-model API that all
  three editing surfaces read and write.

| id | Element | Now | Backend work needed | Category |
|---|---|---|---|---|
| `eb-generate` | `01-brief.html` `[data-eb-brief]` + send | Brief stashed in `sessionStorage`; send just navigates | `POST /api/event-builder/generate {brief, sectionId}` → event model: blocks + order, page shape, first-pass field values, **per-field confidence** (the gap-fill list on 04 should be derived from it, not hardcoded) | needs-backend |
| `eb-generate-stream` | `02-generating.html` `.eb-gen__list` | Hardcoded checklist; spinner decorative | Stream generation events (block decided / copy written / field inferred) over SSE from the generate call | needs-backend |
| `eb-proposals` | `03-draft.html` `[data-eb-proposal]` + in-canvas `.eb-block--proposed` bar | 3 static proposals; accept/reject rewrite the DOM only | Return proposals as a **diff** against the model, each with target block, payload and provenance. Accept applies server-side; reject is recorded so it isn't re-proposed | needs-backend |
| `eb-refine` | `.eb-promptbar__input[data-eb-prompt]` (03, 04, 06, 07) | Prompt bar renders; Refine pre-fills it; submit does nothing | `POST /api/event-builder/refine {eventId, prompt, selectedBlockId?}` → proposal diff through the same accept/reject path | needs-backend |
| `eb-crm-picker` | `04-gapfill.html` `.eb-answer` judge list | 5 hardcoded contacts; static count in the button | `GET /api/crm/contacts?role=judge&event=<prev>`; write chosen ids to the event's **existing speakers field**; contact-create for "Add someone new" | needs-backend |
| `eb-blocks` | `05-blocks.html` `[data-eb-add]`; rail `[data-eb-move]` / `[data-eb-remove]` | Add/reorder/remove mutate the DOM in-memory | Persist block membership + order, and create the section/article scaffolding each block implies — the work the "Created for you" notices describe | needs-backend |
| `eb-page-shape` | `[data-eb-shape]` (03, 06) | Fully working client-side: swaps tab strip ⇄ sticky anchor nav and shows/hides panels | Only persist the chosen shape and have the public template honour it. **The rendering can ship as-is** | fe-wired |
| `eb-inline-edit` | `06-inline-edit.html` `.eb-editable[contenteditable]` + `.eb-formatbar` | Text editable in-browser; format bar decorative; nothing saved | Bind each editable to its event field and PATCH on blur; AI endpoint for Rewrite/Shorten; revision history for Undo | needs-backend |
| `eb-upload` | `.drag-drop[data-drag-drop]` (06, 07) | Drop zones render; no file read or stored | `POST /api/media/upload` → media-library reference on the field. Should also allow picking an existing library item | needs-backend |
| `eb-catalogue` | `07-advanced.html` `#f-cat`, `#f-table` | Plain text inputs holding a name + price string | `GET /api/catalogue/items` with a picker bound to an **item id**, so Buy Now / Book a table resolve to real items and prices | needs-backend |
| `eb-provenance` | `07-advanced.html` `.eb-from` badges + "out of sync" warning | Static badges and a hardcoded SEO-title mismatch | Per-field provenance (assistant / canvas / form) stored with the event, plus a consistency check across title, SEO title and teaser | needs-backend |
| `eb-map` | `.eb-map` (03, 08) | Styled placeholder | Server-side geocode of the venue address → tiles or static image. The point is a structured address field instead of pasted embed code | needs-backend |
| `eb-publish` | Publish / Save &amp; publish; `08` toast | Navigates and always shows success | Persist, run publication rules (go-live, clearance, live flag), return the public URL, surface validation failures | needs-backend |
| `eb-clone` | `01-brief.html` "Clone last year's event" | Inert | `GET /api/events?clonable=1` + server-side deep copy of the model and its section scaffolding into a new draft | needs-backend |

`grep -rn "TODO(backend:EventBuilder)" src/`

---

## Surface: SeatingPlanner

Control > CRM > Seating Planner, built one screen at a time.

- **Screen 1 — event picker (TASK-342608): shipped** as `src/cc/patterns/EventPicker/`.
- **Screen 2 — workspace shell (TASK-344753): prototype** at `src/prototypes/SeatingPlanner/`
  (`workspace-no-event` · `workspace-no-plan` · `workspace-plan-selected` · `workspace-free-seats`,
  behaviour in `SeatingPlannerWorkspace.js`).

Two things to understand before wiring anything:

- **TASK-344753 is the shell + wiring only.** Every control's detail lives in its own sub-task.
  Those controls carry `[data-sp-action]` + `[data-sp-task]` and route through one registry, so a
  sub-task goes live by calling `SeatingPlannerWorkspace.on('<action>', fn)` — **no refactor of the
  shell**. Until then each control announces its owning task rather than failing silently.
- **Seat order is meaningful.** It is "who sits next to whom", so reorder must persist an explicit
  index on `TableSeat` — never a sort.

Reads/writes `SeatingPlan`, `Table`, `TableSeat` (data model on the parent task). No new fields.

| id | Element | Now | Backend work needed | Category |
|---|---|---|---|---|
| `seating-events-list` | EventPicker rows + predictive search | Mock rows; search filters loaded rows | `GET /crm/events?status=live&sort=-startDate`; debounced `GET /crm/events?q=` | needs-backend |
| `seating-last-used-event` | Pinned "Last used" row | `localStorage` only — the pattern leaves persistence to the host | Per-user preference, read on open / written on select | needs-backend |
| `seating-event-gate` | `workspace-no-event.html` | Static picker over an empty workspace | Module opens with the picker and renders nothing else until an event is chosen | needs-backend |
| `seating-plans-row` | `.sp-plan` chips | 2 mock plans; selection swaps tables client-side | `GET` the event's `SeatingPlan` rows with aggregate table/seat counts | needs-backend |
| `seating-tables-grid` | `.sp-table` cards | 36 mock cards; pill + dots recompute client-side | `GET` Tables for the plan with per-seat occupancy so dots/pill derive from `TableSeat` | needs-backend |
| `seating-seat-panel` | Seat list — occupant, role, reorder, remove | Derived from mock dots; changes lost on reload | Read/write `TableSeat`; **persist an explicit seat index**; remove returns the person to Unassigned | needs-backend |
| `seating-unassigned-tray` | Unassigned panel | 7 mock people; search + count live | Attendees with no `TableSeat` row. Owner: TASK-351550 | needs-backend |
| `seating-free-seats-filter` | `[data-sp-freeseats]` | Filters the grid to tables with a free seat — **fully working** | Nothing, while the plan's tables are loaded. Revisit only if paginated | fe-wired |
| `seating-deferred-controls` | All remaining `[data-sp-action]` controls | Render + announce their owning task. **Built so far: new-plan, plan-edit, plan-delete, copy-plans, add-table, table-edit** | One sub-task each: room-layout 344760 · export 344761 · table-delete 344758 · assign-seat 342309 | needs-backend |
| `seating-add-table` | Add table toolbar button (TASK-344757) — `SeatingPlannerAddTable.js` | No popup. Appends a card with the next number and the plan's default seat count, all seats empty; recomputes the chip + toolbar count and opens the new table so its empty seat list is on screen | Insert a `Table` + empty `TableSeat` rows under the plan. **Assign number and sort order server-side** — computing either on the client races other editors. The number must be `max(existing)+1`, **not** `count+1`: after deleting Table 3 of 5, `count+1` mints a second Table 5. Seat count comes from the **plan** default, not the last table | needs-backend |
| `seating-plan-chip-summary` | Plan chip summary `N tables · X/Y seated · Z free` + fill bar | **Bug found and fixed** during 344757: the chip was written once and never recomputed, so it went stale the moment anyone was unseated — the summary silently lied. `syncPlanChip()` now recomputes from the plan's tables, runs on unseat and add-table, and is published on the shell API | Nothing server-side while a plan's tables are loaded. Any sub-task that changes table or seat counts must call `SeatingPlannerWorkspace.syncPlanChip(planKey)`, or derive the summary from the server response | fe-wired |
| `seating-copy-plans` | Copy plans to event (TASK-344756) — `copyplans-*.html` + `SeatingPlannerCopyPlans.js` | Destination list reuses the Event Picker's rows + predictive search; the current event is excluded so a plan can't be copied onto itself. Intro copy is data-driven. Selecting a destination bumps its plan count and toasts what was copied | Insert cloned `SeatingPlan` + `Table` rows under the target Event with **`TableSeat` occupants left empty** — tables, capacities, types and sponsors carried, attendees not. Clone in **one transaction**. List is `GET /crm/events` excluding the current event, debounced `?q=` | needs-backend |
| `seating-copy-append-semantics` | Destination rows already showing a plan count | Copy is **INSERT, not replace** — 2 plans into an event with 1 leaves 3. The prototype surfaces each destination's current count and increments it, but nothing warns beforehand | Confirm the intended semantics. If append is right, consider naming clones so one event doesn't end up with two plans called "Main Ballroom". Replace would need its own confirmation since it destroys existing seating. **Raised by this build** — the brief says "insert" but doesn't cover the collision case | needs-backend |
| `seating-delete-plan` | Delete plan confirmation (TASK-344755) — `deleteplan-confirm.html` + `SeatingPlannerDeletePlan.js` | `alertdialog` on a chip's ✕. Copy is **data-driven** (table + seated counts read off the DOM; the people clause drops when nobody is seated). Confirming removes the chip and its tables, returns every occupant to Unassigned, and opens the next plan — or folds the workspace away when none remain. Esc cancels | Delete the `SeatingPlan` + its `Table`/`TableSeat` rows in **one transaction** and return occupants to the event pool — a partial failure must not leave people unassigned from a plan that still exists. Re-read the plans row and pool afterwards. **The dialog's counts must come from the server**, so a stale page can't understate what's about to be destroyed | needs-backend |
| `seating-edit-plan` | Edit plan popup (TASK-344754) — `editplan-*.html` + `SeatingPlannerEditPlan.js` | Opens from a chip's ✎ pre-filled from **that** chip (the shell passes the clicked control as `ctx.trigger`); saving renames the chip, updates its room, rebuilds the toolbar label and the aria-labels | `PATCH` the `SeatingPlan` — `{ name*, room }`. **Renaming must not touch the plan's Tables or TableSeats** — verified in the prototype: a rename leaves all 30 tables and the open seat panel intact. Re-read the plans row rather than patching the DOM | needs-backend |
| `seating-new-plan` | New plan popup (TASK-342306) — `newplan-*.html` + `SeatingPlannerNewPlan.js` | Validates the 2 required fields + the 6–12 seats bound, then creates the plan chip and generates its table cards in the DOM | `POST` a `SeatingPlan` — `{ name*, room, tables*, seatsPerTable (default 10, 6–12), tableShape (Round\|Square) }` + FK to the Event — generate `Table`/`TableSeat` server-side, return the plan so the row and grid re-read. **Server must re-validate**; the client bound is convenience, not a guarantee | needs-backend |
| `seating-table-shape` | Table shape, set at generation time | Captured on the plan, echoed in the toast, but **nothing renders it** — the grid has no shape indicator | Decide if shape is display-only metadata or should render on the table card / in Room layout (TASK-344760). The shell predates this field | needs-backend |
| `seating-drag-assign` | `draggable="true"` on seat + tray rows | Not implemented; Assign is the path shown | TASK-344759. **Make Assign canonical on every viewport and drag a desktop accelerator** — HTML5 drag fails on touch and keyboard users can't drag, so the tap path is needed regardless | needs-backend |
| `seating-tier-colours` | Tier left edge + `.sp-table__tier` label | **342307 names the set**: Standard / Gold / Silver / Bronze / VIP / Head table / Sponsor. "Premium" from the earlier build is *not* in that list — migrated to Gold. Interim: ranked tiers use one derived ramp, Sponsor reuses the sponsorship gold, Standard unmarked, label always rendered | TASK-342308 decides real colours, plus three questions: Gold/Silver/Bronze are named **by colour** so literal metallics need 3+ new tokens; a card would carry **three colour systems at once** (7 tier + 6 role + 3 fill); and **VIP and Sponsor are both tiers and roles**, with Sponsor also a separate field — so `Type=Sponsor` with an empty Sponsor field is undefined | needs-backend |

| `seating-table-form` | Table form, New/Edit (TASK-342307) — `tableform-*.html` + `SeatingPlannerTableForm.js` | Opens pre-filled from a table's ✎. Name (required), the 7 tiers, sponsor account lookup, host, capacity, shape. Saving rewrites the card's name, tier, sponsor line, dots, count and pill, then resyncs the chip | `Table` row with FKs — Type → Table Type lookup, Sponsor → Account — plus sort order. Accounts via `GET /crm/accounts?q=`. Capacity changes add/remove `TableSeat` rows and unassign the surplus **in the same transaction** | needs-backend |
| `seating-capacity-reduction` | Seats (capacity) + its data-driven note | Note states occupancy and escalates to a warning naming exactly how many people will be displaced **before** saving. Surplus taken from the highest-numbered seats; increasing appends empty seats. Verified 10→7 returned 3, 7→12 added 5 empty | Server decides and records **which** occupants are displaced. Last-seats-first is the only sensible automatic rule, but seat order is meaningful ("who sits next to whom") — confirm whether the **user** should choose instead | needs-backend |
| `seating-new-table-trigger` | "New table" mode of the form | Captured and supported, but **nothing opens it** — 344757's Add table creates instantly from plan defaults, no form | Resolve the overlap: 344757 says add straight away, 342307 is titled "New / Edit Table form". Either Add table opens this form pre-filled, or New mode is dead and should be dropped. **Raised by this build** | visual-only |

`grep -rn "TODO(backend:SeatingPlanner)" src/`

---

## Scope of this document

Documentation + in-code flags **only** — no backend code, framework migration, or API
implementation is included. The repo intentionally stays front-end-only; this handover defines
the contract for wiring it to a backend.
