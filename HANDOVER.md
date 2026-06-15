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

## Scope of this document

Documentation + in-code flags **only** — no backend code, framework migration, or API
implementation is included. The repo intentionally stays front-end-only; this handover defines
the contract for wiring it to a backend.
