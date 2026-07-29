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

## Scope of this document

Documentation + in-code flags **only** — no backend code, framework migration, or API
implementation is included. The repo intentionally stays front-end-only; this handover defines
the contract for wiring it to a backend.
