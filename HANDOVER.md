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
  behaviour in `SeatingPlannerWorkspace.js`). Sub-task states are indexed in-prototype at
  `states.html`; each sub-task adds one `SeatingPlanner<Name>.js` and touches nothing else.

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
| `seating-unassigned-tray` | Unassigned pool (TASK-351550) — `tray-*.html` + `SeatingPlannerTray.js` | **Derived, not a list** — the event's people minus everyone seated, recomputed on every change. Role tag + name + company, live count, predictive search over name *and* company, plus an empty state. Because it derives, the four return paths (unseat, delete table, delete plan, reduce capacity) put people back **by name** with no pushing — they used to insert a row labelled by origin ("Table 12 · seat 4"). Manual guests survive being unseated because the module remembers anyone it has seen seated | The list is a **query**, not a stored collection: the event's attendees + linked contacts `LEFT JOIN TableSeat`, keeping the unseated, plus guests already stored on a `TableSeat`. **No new stored fields.** Recompute server-side after every seating change — a cached client list makes two editors disagree about who is free | needs-backend |
| `seating-free-seats-filter` | `[data-sp-freeseats]` | Filters the grid to tables with a free seat — **fully working** | Nothing, while the plan's tables are loaded. Revisit only if paginated | fe-wired |
| `seating-deferred-controls` | All `[data-sp-action]` controls | **Every control is now built** — nothing is left announcing an unbuilt task. The registry has **two** kinds of extension point: click actions, and *notify* for a sub-task that owns a derived view (351550) | Nothing further front-end. Keep the registry when wiring the backend — it's where each control's handler already lives | fe-wired |
| `seating-add-table` | Add table toolbar button (TASK-344757) — `SeatingPlannerAddTable.js` | No popup. Appends a card with the next number and the plan's default seat count, all seats empty; recomputes the chip + toolbar count and opens the new table so its empty seat list is on screen | Insert a `Table` + empty `TableSeat` rows under the plan. **Assign number and sort order server-side** — computing either on the client races other editors. The number must be `max(existing)+1`, **not** `count+1`: after deleting Table 3 of 5, `count+1` mints a second Table 5. Seat count comes from the **plan** default, not the last table | needs-backend |
| `seating-plan-chip-summary` | Plan chip summary `N tables · X/Y seated · Z free` + fill bar | **Bug found and fixed** during 344757: the chip was written once and never recomputed, so it went stale the moment anyone was unseated — the summary silently lied. `syncPlanChip()` now recomputes from the plan's tables, runs on unseat and add-table, and is published on the shell API | Nothing server-side while a plan's tables are loaded. Any sub-task that changes table or seat counts must call `SeatingPlannerWorkspace.syncPlanChip(planKey)`, or derive the summary from the server response | fe-wired |
| `seating-copy-plans` | Copy plans to event (TASK-344756) — `copyplans-*.html` + `SeatingPlannerCopyPlans.js` | Destination list reuses the Event Picker's rows + predictive search; the current event is excluded so a plan can't be copied onto itself. Intro copy is data-driven. Selecting a destination bumps its plan count and toasts what was copied | Insert cloned `SeatingPlan` + `Table` rows under the target Event with **`TableSeat` occupants left empty** — tables, capacities, types and sponsors carried, attendees not. Clone in **one transaction**. List is `GET /crm/events` excluding the current event, debounced `?q=` | needs-backend |
| `seating-copy-append-semantics` | Destination rows already showing a plan count | Copy is **INSERT, not replace** — 2 plans into an event with 1 leaves 3. The prototype surfaces each destination's current count and increments it, but nothing warns beforehand | Confirm the intended semantics. If append is right, consider naming clones so one event doesn't end up with two plans called "Main Ballroom". Replace would need its own confirmation since it destroys existing seating. **Raised by this build** — the brief says "insert" but doesn't cover the collision case | needs-backend |
| `seating-delete-plan` | Delete plan confirmation (TASK-344755) — `deleteplan-confirm.html` + `SeatingPlannerDeletePlan.js` | `alertdialog` on a chip's ✕. Copy is **data-driven** (table + seated counts read off the DOM; the people clause drops when nobody is seated). Confirming removes the chip and its tables, returns every occupant to Unassigned, and opens the next plan — or folds the workspace away when none remain. Esc cancels | Delete the `SeatingPlan` + its `Table`/`TableSeat` rows in **one transaction** and return occupants to the event pool — a partial failure must not leave people unassigned from a plan that still exists. Re-read the plans row and pool afterwards. **The dialog's counts must come from the server**, so a stale page can't understate what's about to be destroyed | needs-backend |
| `seating-edit-plan` | Edit plan popup (TASK-344754) — `editplan-*.html` + `SeatingPlannerEditPlan.js` | Opens from a chip's ✎ pre-filled from **that** chip (the shell passes the clicked control as `ctx.trigger`); saving renames the chip, updates its room, rebuilds the toolbar label and the aria-labels | `PATCH` the `SeatingPlan` — `{ name*, room }`. **Renaming must not touch the plan's Tables or TableSeats** — verified in the prototype: a rename leaves all 30 tables and the open seat panel intact. Re-read the plans row rather than patching the DOM | needs-backend |
| `seating-new-plan` | New plan popup (TASK-342306) — `newplan-*.html` + `SeatingPlannerNewPlan.js` | Validates the 2 required fields + the 6–12 seats bound, then creates the plan chip and generates its table cards in the DOM | `POST` a `SeatingPlan` — `{ name*, room, tables*, seatsPerTable (default 10, 6–12), tableShape (Round\|Square) }` + FK to the Event — generate `Table`/`TableSeat` server-side, return the plan so the row and grid re-read. **Server must re-validate**; the client bound is convenience, not a guarantee | needs-backend |
| `seating-table-shape` | Table shape, set at generation time | Captured on the plan, echoed in the toast, but **nothing renders it** — the grid has no shape indicator | Decide if shape is display-only metadata or should render on the table card / in Room layout (TASK-344760). The shell predates this field | needs-backend |
| `seating-drag-assign` | Drag to seat (TASK-344759) — `drag-*.html` + `SeatingPlannerDrag.js` | All four placements live: pool → empty seat, pool → table card (first free seat, or refused with **"Table full"**), seat → seat (move, or **swap** when occupied), seat → pool (unseat) — plus seat → another table card, which the brief omits but the interaction implies. Source dims, legal targets go success-tone, an occupied seat shows **Swap**, a full table shows why. **The same four placements run by tap and by keyboard.** Nothing re-implements seating: it moves people between card dots and the occupant list and hands off to the shell, so the pool re-derives itself | Each placement is a `TableSeat` write (occupant + seat order). A **swap is two rows in one transaction**, or the pair can end up in the same seat; a move between tables changes the parent `Table` too, so **not** delete-then-insert. Re-read the plan after a placement — two editors can aim at the same seat | needs-backend |
| `seating-touch-placement` | Placing without drag — touch + keyboard | The brief asks how this works on mobile. It isn't a separate mobile feature: **pick-then-place is the mechanism, drag is the accelerator.** Tap (or Enter) a person to pick them up — a bar names them and offers Cancel — then tap a seat, a table or the pool. Esc aborts. Rows carry `tabindex`, so the whole flow is keyboard-operable, which matters because keyboard users can't drag either. Verified: pick, place, swap, unseat, cancel and refusal all work by tap and by Enter, and picking doesn't hijack table selection | No extra backend — same `TableSeat` writes. **Still outstanding: the mobile LAYOUT.** The workspace has never been designed below `--ai-bp-md` and this task didn't invent it. The 344753 proposal stands (chips as a scroll strip, single-column tables, seat panel + pool as sheets); pick-then-place is what makes it usable once that layout exists | fe-wired |
| `seating-tier-colours` | Tier left edge + `.sp-table__tier` label | **RESOLVED BY 342308** — colours no longer come from the DS at all. Each card paints its edge from `--sp-tier-colour`, set at runtime from the lookup, so **no metallic tokens are needed**. Seeded Standard `#8fa0b5`, Gold `#c9a227`, Silver `#b8bfc7`, Bronze `#b07d48`, VIP `#9b51e0`, Head table `#3b6fe0`, Sponsor `#c0392b`. The tier label always renders, so tier is never colour-only. "Premium" stays migrated to Gold | Store the colour per `TableType` row (see `seating-table-types`). Two of the three original questions survive: a card still carries **three colour systems at once** (tier edge + 6 role dots + 3 fill states), and **VIP and Sponsor are both tiers and roles** — Sponsor is also a separate field, so `Type=Sponsor` with an empty Sponsor field is still undefined. The metallic-token question is **closed** | needs-backend |
| `seating-table-form` | Table form, New/Edit (TASK-342307) — `tableform-*.html` + `SeatingPlannerTableForm.js` | Opens pre-filled from a table's ✎. Name (required), the 7 tiers, sponsor account lookup, host, capacity, shape. Saving rewrites the card's name, tier, sponsor line, dots, count and pill, then resyncs the chip | `Table` row with FKs — Type → Table Type lookup, Sponsor → Account — plus sort order. Accounts via `GET /crm/accounts?q=`. Capacity changes add/remove `TableSeat` rows and unassign the surplus **in the same transaction** | needs-backend |
| `seating-capacity-reduction` | Seats (capacity) + its data-driven note | Note states occupancy and escalates to a warning naming exactly how many people will be displaced **before** saving. Surplus taken from the highest-numbered seats; increasing appends empty seats. Verified 10→7 returned 3, 7→12 added 5 empty | Server decides and records **which** occupants are displaced. Last-seats-first is the only sensible automatic rule, but seat order is meaningful ("who sits next to whom") — confirm whether the **user** should choose instead | needs-backend |
| `seating-new-table-trigger` | "New table" mode of the form | Captured and supported, but **nothing opens it** — 344757's Add table creates instantly from plan defaults, no form | Resolve the overlap: 344757 says add straight away, 342307 is titled "New / Edit Table form". Either Add table opens this form pre-filled, or New mode is dead and should be dropped. **Raised by this build** | visual-only |
| `seating-delete-table` | Delete table confirmation (TASK-344758) — `deletetable-confirm.html` + `SeatingPlannerDeleteTable.js` | `alertdialog` on a card's ✕. Data-driven copy; with nobody seated it says so rather than inventing a consequence. Confirming returns occupants to Unassigned, resyncs the chip, and moves the seat panel to the next table — or clears it when the plan is empty. Esc cancels | Delete the `Table` + its `TableSeat` rows and return occupants to the event pool in **one transaction**. **Do not resequence table numbers** — Add table takes `max+1`, so gaps are expected; renumbering would change table numbers under guests already told theirs | needs-backend |
| `seating-table-name-scope` | Table names / numbers across plans | Names are unique only **within** a plan — Main Ballroom and Overflow Room B both have a "Table 1". Every prototype lookup scopes by `data-sp-belongs`; one of this build's own test assertions didn't, and silently hit the other plan's table | Scope every table query by `SeatingPlan`; never treat a table name or number as an event-wide identifier. Worth confirming whether names should be unique per plan at the DB level | needs-backend |
| `seating-table-types` | Table types lookup (TASK-342308) — `tabletypes-*.html` + `SeatingPlannerTableTypes.js` | Modal listing the tier set: colour swatch, editable label, up/down reorder, Remove, plus an add row. **The rows are the model** — row index is `sortOrder`. Recolouring repaints every table on that tier live; **renaming migrates its tables** so identity survives; removing falls its tables back to Standard and says how many moved. **Standard can't be removed** — it shows "default". Duplicate labels rejected. The Table form's tier dropdown rebuilds from the same list | A `TableType` lookup (label, colour, sortOrder) with `Table.Type` as an **FK** to it — so a delete must repoint dependents at Standard or be blocked, never left dangling, and a rename must be invisible to the Tables. Enforce label uniqueness server-side and protect the fallback row. The seeded colours are a first pass and are the **client's** to change | needs-backend |
| `seating-tier-colour-safety` | The colour picker in the lookup | A free `<input type="color">`. Client-chosen, so nothing stops a pick colliding with something already meaningful on the same card: the seeded Head table `#3b6fe0` sits **very close to the brand blue used for the selected table**, and the 6 role dot hues are in the same space. No contrast check, no mono-print fallback — the always-rendered tier label is the only guarantee | Decide how much to constrain the picker: a curated swatch set is safest, or keep it free and add a contrast check plus a warning when a pick lands near the selection blue or a role colour. Either way **keep the tier label** — colour must never be the only carrier. **Raised by this build** | visual-only |
| `seating-assign-seat` | Assign person to a seat (TASK-342309) — `assign-*.html` + `SeatingPlannerAssign.js` | Opened from an empty seat's Assign. Grouped by **source, not role**: "Event attendees" read **live from the Unassigned tray** (so the two can't disagree — seating removes the tray row), "CRM contacts" are not on the guest list, so seating one says it added them to the event. Anyone already seated is filtered out. **A row commits on click** — no Save footer, since with one the click would only be a selection. Search matches name *and* company across both groups; with no match it offers the typed term straight into the guest fields | Write the `TableSeat` occupant — FK to Attendee/Contact, or a guest name/company pair when there's no record — plus role and seat index. Seating a CRM contact must **also create the event Attendee row, same transaction**. **Reject anyone who already holds a seat in this event**; the prototype hides them, but only the server can enforce it. `GET /crm/events/<id>/attendees?unassigned=1` and `GET /crm/contacts?q=`, both debounced | needs-backend |
| `seating-assign-role-source` | The Role field in the Assign popup | The brief lists a Role **dropdown**; the reference shows role as a **badge on each row** and has none. Both honoured: someone already in the system carries the role from their record (visible before you click), and the dropdown belongs to the **manual guest** — the one case with no record to read from. Defaults to Guest, covers all six roles | Confirm role is a property of the **person**, not of the seating. If it must be overridable when seating an existing person ("Tom is an attendee but he's hosting this table"), one-click seating becomes select-then-confirm and role has to live on `TableSeat`. **Raised by this build** | visual-only |
| `seating-seat-occupant-record` | Who is in which seat — `data-sp-occupants` on the card | **Bug found and fixed:** occupant names for every table but Table 1 were *derived by index* from the mock pool at render time, so any seat change renamed everyone below it — unseat the third of ten and the other seven came back as different people, and anyone assigned by this task lost their identity on switching tables. The shell now stamps occupants onto the card whenever seats change. Verified: assign seat 4, switch away and back, same person; unseat seat 3, seats 4–10 untouched | Nothing server-side — a prototype workaround for having no model. It does show the real requirement: **seat identity is a persisted `TableSeat` row keyed to an Attendee, never a position in a list**. Also fixed the seed, which had the seven tray people in the seated pool too, so the prototype claimed one person was both seated and unassigned | fe-wired |
| `seating-tier-sort-order` | Sort Order in the lookup | The brief asks for a Sort Order **field**; the reference shows an ordered list with no number. Built as row order with up/down controls — the same affordance the seat list uses — read back as a 0-based `sortOrder`. The number is the data, the list is the interface | Confirm the list is acceptable in place of a number field. If numbers must be directly editable (e.g. to interleave a tier without reordering), the field can come back — but then the server has to resequence on collision | visual-only |

| `seating-pool-scope` | What "unassigned" is measured against | **Implemented event-wide** — the pool excludes anyone seated in *any* plan. The brief says "not yet seated in the **selected plan**", which taken literally offers Main Ballroom's 240 seated people as unassigned the moment you open Overflow Room B, and lets you seat them twice | Confirm the scope. Three things point to event-wide: the capacities say the plans are **complementary, not alternatives** (300 + 60 = 360 seats for 386 attendees); 342309's Assign popup already excludes anyone seated anywhere, so per-plan would make the two contradict each other; and event-wide is the reading that cannot double-book. If plans are alternative drafts of one room, per-plan is right and 342309 must change with it. **Raised by this build** | needs-backend |
| `seating-pool-empty-state` | Empty state of the pool | Neither the brief nor the reference covers a pool with nobody in it — "0" over an empty box reads as broken. Added a success-toned **"Everyone is seated"** block, plus a separate *"nobody matches <term>"* message, since a filtered-out pool is a different situation from an empty one | Nothing server-side; confirm the copy. Note the DS has **no `--ai-icon-success`** token (success exists only as surface/text/border), so the icon uses `--ai-text-success`, following `.sp-capacity__note--warn` — worth adding icon-status tokens if this recurs | fe-wired |
| `seating-occupant-identity` | `data-sp-occupants` on every card | Extends the 342309 fix: occupant names used to be derived at *render* time for every table but Table 1, so they existed only while a table was open — no use to a derived pool, which can only return a person it can name. Every card is stamped at boot. Two defects fell out and were fixed: the generator put the **same person in a dozen chairs** (24 names over 300 seats), so unseating someone left them seated elsewhere and they never returned; and it could mint a name already authored or already in the pool. Verified 286 seated, **0 duplicates, 0 overlap** | Nothing server-side — prototype scaffolding. It is the shape of the real rule though: a seat holds a **reference** to an attendee and every occupant of an event is a distinct person. Cosmetic artifact of guaranteeing uniqueness: tablemates often share a surname; real data won't | fe-wired |

| `seating-room-layout` | Room layout (TASK-344760) — `layout-*.html` + `SeatingPlannerLayout.js` | Popup from the toolbar, titled with the plan name as the reference shows. Attaches a floor plan (PDF or image) to the **plan**, so switching plans switches the layout. Dropzone is the DS **DragDropFile**; an **image genuinely previews** (read with `FileReader`, nothing leaves the browser), a PDF gets a document card with Open. Footer swaps Upload for **Replace + Remove**. Wrong file types refused by name. The toolbar button carries a **dot** when the plan has a layout — an addition, since otherwise you can't tell without opening the popup | Upload to a **`MediaFileItem`** and store the *reference* on the `SeatingPlan` — one per plan. Replacing **repoints the reference** and lets the media layer collect the old item; don't delete the file blind, a MediaFileItem may be shared. Validate type **and size** server-side. **Open question:** does Copy plans (344756) carry the floor plan to the clone, or start it empty? | needs-backend |
| `seating-room-layout-scope` | What "Room layout" means | **Resolved.** 344753 assumed a spatial seat-map editor (dragging tables on a floor plan) and logged it as undesigned. The brief settles it: Room layout **attaches a file**. The tables grid stays a list, no canvas needed | Nothing, unless a spatial view is wanted later — that's a new task. Note the attachment is **a picture**: nothing relates a table drawn on it to a `Table` row, so "where table 12 actually is" stays human knowledge | visual-only |
| `seating-pdf-preview` | In-app preview of an attached PDF | The brief asks for in-app preview. Images do. A PDF can't be rasterised by the page, so it shows a document card (name, size, Open in a new tab) **and says why** — better than a fake thumbnail implying a preview that isn't there | Decide whether inline PDF preview is required. If so it needs a viewer (pdf.js, or `<embed>` against the stored file) — a real dependency and a spec decision, not something to slip in. **Raised by this build** | visual-only |

| `seating-export` | Export the plan (TASK-342305) — `export-*.html` + `SeatingPlannerExport.js` | Toolbar split button — PDF (default) / Excel / CSV — each opening a preview first. **The preview follows the format:** PDF previews as the *document* the reference draws (event name, meta line, each table as a numbered list with the role in brackets); CSV and .xlsx preview as the brief's **six columns** in the DS Table component, because that's what those files hold. Read-only, per plan, derived from the DOM, and it stays true after edits — unseat someone and both the row count and the meta line drop by one. **The CSV downloads for real** (generated in-browser, correctly quoted); PDF and .xlsx say they're server-side rather than downloading something fake | Read-only over the plan's `Table` / `TableSeat` rows. PDF and XLSX need a server-side generator — build **all three from the same query** or they'll disagree; the browser CSV only covers what the page already has. Row set is **seated seats only**, per the brief — see `seating-export-empty-seats` | needs-backend |
| `seating-export-empty-seats` | Whether the export lists empty seats | It doesn't. The brief says "every table and its **seated** attendees", so a 3-of-10 table exports 3 rows — and the preview says so out loud. A table with nobody seated still appears in the PDF with a line saying it's empty, so it isn't silently missing | Confirm. A planner printing a seating list may want empty seats as **blank rows** — the difference between a record of who's coming and a working document to fill in on the day. Cheap either way, but it changes the row count. **Raised by this build** | visual-only |
| `seating-export-task-number` | Task number on the export controls | The shell marked these `TASK-344761`, taken from the parent task's sub-task list. The brief for the work is **TASK-342305**, so the controls now carry 342305 | Confirm whether 344761 was a mis-recorded number, or a **separate piece of export work still outstanding**. **Raised by this build** | visual-only |

| `seating-main-layout-alternatives` | Main interface layout, TASK-344753 revisited — `alt1-threepane.html`, `alt1b-worklist-v2.html`, `alt3-accordion.html`, `alt-compare.html` | **Open decision.** Three fully-wired alternatives; the current layout is untouched and remains the fallback. The defect is measured, not asserted: the seat panel and the pool are each capped at 30rem with their own scroll, stacked in a 448px rail inside a **page-scrolled** 1356px document, so at 1440×900 the pool's first row sits at y≈1013 — you see the seats *or* the pool, never both ends of a drag. All three make the same move (**the page stops scrolling; each region owns its scroller with a pinned head**) and differ only in where the pool lives and how the width is split. **A · Worklist** — list \| seats \| pool; list flexible with a 384 floor, detail a `minmax(320, 384)` that eases down when space is tight, pool 320, both right columns **draggable wider** (never narrower than designed), and a **list/grid toggle** defaulting to grid. **A2 · Worklist v2** — same panes, list and detail sharing the width equally. **C · Accordion** — one-line rows, seats opening inline, one table at a time. A fourth (B · Dock) was built and dropped at the designer's request | **Pick one.** Nothing server-side. Three things to know first: both worklists need **≥1440px** to show a whole 10-seat table at once (below that the seat list scrolls — in A, drag the detail past 580px for two untruncated columns); the accordion shows the open table and its ~370px drawer with **no full context row** at 813px, at 5 tables or 40, so it wins on directness not density; and all three are gated at **1024px**, falling back to the page-scroll layout below it per WCAG 1.4.10 Reflow. **Raised by this build** | visual-only |
| `seating-workspace-prefs` | Pane widths + tables-view preference — `SeatingPlannerShellAlts.js` | Both are **in-memory only** and last as long as the page. A resize drag writes a px width to a custom property on the pane row; the list/grid toggle writes one attribute on `<body>`. Reload returns to the defaults (grid view, detail 384 easing to 320, pool 320) | Persist **per user** — not per event or per plan; it's a workspace preference, like a column layout in a data grid: `{tablesView, detailWidth, poolWidth}` with `null` meaning "use the default and keep adapting to the viewport". **Clamp a stored width on read**, or a width saved on a wide monitor squeezes the tables list below its floor on a laptop — the front end already clamps to the same floor its CSS uses. Cheap to defer: without it the layout just opens at its defaults | needs-backend |
| `seating-mobile-worklist` | Worklist v1 below 1024px — `SeatingPlannerShell.css` `@media (max-width: 1023px)` + `SeatingPlannerShellAlts.js` | **Built and working.** HTML5 drag doesn't fire on touch at all, so the Unassigned column — whose whole job was to be dragged out of — is **hidden**, and seating is by tapping an empty seat → Assign popup, which reads the same derived list (already canonical on every viewport, 344759). **Hidden, not removed:** `[data-sp-tray-list]` is a singleton nine queries depend on and the derived pool is where unseated people go, so unseat / delete table / delete plan all still work; its count is mirrored into the tables pane head (*"7 unassigned"*). The table detail opens **inline beneath the row you tapped, full viewport width**, via layout C's relocation machinery gated by `body[data-sp-acc-below]` — inline so DOM order stays reading order for a screen reader and Tab, and nothing needs re-measuring on scroll. **Nothing is open on arrival**; a tap scrolls that row to the top **smoothly** (instant under `prefers-reduced-motion`); **tapping the open row again closes it, animated** — the drawer's height eases to zero so the rows below slide up instead of jumping 800px, with a token guard so tapping another table mid-animation can't leave a collapsed drawer behind. The **seating plans strip stays on screen** (switching rooms is a mobile job too): it and the layout switcher scroll sideways in one line rather than wrapping, which is what had made the appbar 480px tall | Nothing server-side. Two open design questions: there's **no way to browse the unassigned people on their own** below 1024 (only via Assign from a seat), so a tappable "N unassigned" bottom sheet would close that gap — it's plain text today; and the seat rows keep their `draggable` attributes on mobile (harmless, touch never fires them) if you'd rather they were stripped. Two inherited shell behaviours worth knowing: **Add table** opens the table it just created, and a **plan switch** opens the new plan's first table | fe-wired |
| `seating-plans-scroller` | Seating plans block — `.sp-plans` in the alternatives | Rebuilt as **two rows**: the title with New plan + Copy plans to event on one line, the rooms beneath on their own horizontally scrollable line. **Desktop gets prev/next arrows instead of a scrollbar** — `[hidden]` until the rooms overflow, and each hides again at its end, so a visible arrow always does something. **Touch gets a swipe with a half-card peek:** a room card is a *fraction* of the track, `min(size-8, (100% - gap) / 1.5)`, because a fraction is the only way to guarantee the card at the edge is **cut** rather than landing flush and implying the list ends. Measured at 500px: 297px cards in a 461px track — one whole, one cut. The `data-sp-plans-row` hook moved onto the track, so New plan's chips and Delete plan's "No plans yet" hint still land correctly **with no change to either module** | Nothing server-side. Two implementation notes: the arrows re-sync on scroll, on resize, on a mutation of the chip list **and** on a timeout after a click, because a smooth scroll fires no scroll events in some environments and a stale arrow is a dead control; and the peek is guaranteed by the *fractional* width — pin the card to a fixed px value later and the guarantee is lost at any viewport that is an exact multiple of it | fe-wired |
| `seating-card-left-border` | Left edge of an untiered (Standard) table card — `.sp-table` | **Defect, fixed in the alternatives only.** A Standard table carries no `data-sp-tier`, so it never reaches `.sp-table[data-sp-tier] { border-left-color: var(--sp-tier-colour, transparent) }` and keeps the base `border-left: 3px solid transparent` — measured `rgba(0,0,0,0)` against a 1px `#e2e2e3` frame on every other side, i.e. **a card with one edge missing**. Untiered cards now take the frame colour (excluding the selected card, so its brand edge still wins): every row has a 3px left edge, neutral or tiered, and the text stays aligned (a 1px border would shift it 2px against tiered rows) | Move the one-liner into `SeatingPlanner.css` when a layout is adopted — `.sp-table:not([data-sp-tier]):not(.sp-table--selected) { border-left-color: var(--ai-border-secondary) }`. It is kept out for now because that file paints the 35 signed-off states and the current layout is deliberately untouched, so **the fallback still shows the gap**. Related pre-existing subtlety for a designer: on a tiered card the tier colour outranks the selected state on that edge, so an open Gold table shows gold on the left and brand on the other three sides | visual-only |
| `seating-card-keyboard` | Keyboard operation of a table card — `SeatingPlannerWorkspace.js` `initTableSelect` | **Defect, pre-existing, every layout including the current one.** Cards are `role="button" tabindex="0"` — they take focus and announce as buttons — but `initTableSelect` binds **click only**, and a `div[role=button]` doesn't synthesise a click from Enter. So a keyboard user can focus a table and not open it; Space scrolls the page instead. The shell's one `keydown` listener only handles Escape for the export split menu | Add a keydown handler beside `initTableSelect`: on **Enter or Space** with a `[data-sp-table]` target, `preventDefault()` and call `selectTable(card)`. One place fixes every layout; the mobile close-on-second-tap then wants the same treatment. **WCAG 2.1.1 Keyboard**, and it's also what stops the mobile detail being opened without a pointer. **Found while building the mobile layout** and deliberately left alone there — it's the shell's own gap, and shell edits have been kept to the single line this exploration needed | visual-only |

`grep -rn "TODO(backend:SeatingPlanner)" src/`

---

## Scope of this document

Documentation + in-code flags **only** — no backend code, framework migration, or API
implementation is included. The repo intentionally stays front-end-only; this handover defines
the contract for wiring it to a backend.
