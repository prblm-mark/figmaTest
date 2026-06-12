# ControlHub — Figma Notes

## Figma Node
- **File:** [Affino CC Hybrid – Design System](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System) — file key `ETKqleZdpertwFEo40YB5n`
- **Component set:** `4244:6526` — *Control Screen* (a second Control Centre view; distinct from the dashboard `ControlScreen`, set `4187:21254`)
- **Tier:** Template
- **Brand context:** `data-brand="cc"` on `<html>` activates CC palette tokens

### Variant matrix

| Node | Device | Content frame | Code mapping |
|---|---|---|---|
| 4244:6525 | Desktop | `4236:6169` | 3-column card grid; `.cc-control__page` padding `--ai-spacing-6`, gap `--ai-spacing-7`. |
| 4244:6524 | Mobile | `4243:6400` | 1-column grid; page padding `--ai-spacing-4`, gap `--ai-spacing-6`. Reflow via `@container cs-page (max-width:767px)` + a mobile `@media` gap override. |

The Menu Open/Collapsed sidebar state is inherited from the reused shell (`sidebar-menu.js`), not a ControlHub axis.

## Composed components

ControlHub owns **only the page-content layout** (filter + sections + grids). Everything else is reused:

| Source | Role |
|---|---|
| `src/cc/templates/ControlScreen/ControlScreen.css` + its shell markup | **Entire app-shell, reused verbatim** — left rail + Menu panels (`SidebarMenu` desktop+mobile composites), chrome (`HeaderGroup` = TopNavigation + Header + IconNavigation), right `ActionsMenu` rail, `AiAssistant` panel, `AssistantPopover` coachmark, favourites toasts. Cloned markup (vanilla-static, no partials) + shared JS (all `../`-relative paths resolve unchanged from this sibling dir). |
| `src/components/Input/` | The **filter** field — `.input` > `.input__wrap` with a leading `search` `.input__icon`, `.input__control`, and a `.input__clear` (auto-shown via `:has(:not(:placeholder-shown))`). Used verbatim. |
| `src/components/ActionCard/` (composes `src/components/Button/` Tertiary **xs**) | The directory cards. Two variants per Figma: **Right Chevron** (`<a class="action-card action-card--chevron">`, whole-card nav) and **Button** (`<div class="action-card action-card--button">` with a `btn btn--tertiary btn--xs` "+ add"). Used verbatim — CC tokens resolve under `data-brand="cc"` (e.g. tertiary button bg → `#e5e9eb`). |

## CSS Class Mapping

Template-owned classes only (every other class belongs to a composed/reused component):

| Class | Role |
|---|---|
| `.cc-control__page--directory` | Modifier on the reused page scroll container; tightens the mobile inter-block gap to `--ai-spacing-6`. |
| `.cc-directory__filter` | Scoping / backend hook on the filter `.input` (no extra style — stretches full-width as a flex child). |
| `.cc-directory__section` | Section wrapper: flex column, `gap --ai-spacing-4`. |
| `.cc-directory__section-title` | Section heading `<h2>` — `--ai-font-title`/`--ai-font-bold`, `--ai-font-fixed-md` (18px) → `--ai-font-fixed-sm` (16px) at `@container cs-page (max-width:639px)` (single-column view). |
| `.cc-directory__grid` | Card grid, `gap --ai-spacing-4`. Container-query columns on `cs-page`: **≥1024px → 3 · 640–1023px → 2 · <640px → 1** (per user, 2026-06-12; Figma shows 3 desktop / 1 mobile only). |
| `.cc-directory__grid .action-card--button` | `cursor: pointer` — the Button-variant card navigates as a whole (the "+ add" button is a separate action). The Chevron variant is already an `<a>`. |

## Card inventory (Figma content verbatim — same set in both sections)

Row-major DOM order 1–10 reproduces Figma's 3-column layout exactly.

| # | Title | Variant |
|---|---|---|
| 1 | Ad Campaign Analysis | Chevron |
| 2 | Campaign Dashboards | Add (Button) |
| 3 | Lifecycle Analysis | Chevron |
| 4 | Conversion Funnels | Add (Button) |
| 5 | Converting Articles Report | Chevron |
| 6 | Message Analysis | Chevron |
| 7 | Message Campaign Analysis | Chevron |
| 8 | Mailing List Analysis | Add (Button) |
| 9 | Mailing List Removal Log | Chevron |
| 10 | Referral Analysis | Chevron |

Sections: **Analysis**, **Ad Campaigns** (identical card sets).

## Token Mapping

| Token | Where |
|---|---|
| `--ai-spacing-6` | Page padding (desktop, reused); mobile inter-block gap |
| `--ai-spacing-7` | Inter-block gap (desktop, reused) |
| `--ai-spacing-4` | Page padding (mobile, reused); section gap; grid gap |
| `--ai-font-title` / `--ai-font-bold` | Section heading |
| `--ai-font-fixed-md` / `--ai-font-fixed-sm` | Section heading size (desktop / mobile) |
| `--ai-leading-md` | Section heading line height |
| `--ai-text-primary` | Section heading colour |

(Filter Input and ActionCards carry their own component tokens.)

## Token Gaps

None at template scope.

**Noted (not a gap):** the Figma filter `Field` (`I4236:6853;78:2020`) uses `px-[--ai-spacing-5]` (16px), but the codebase `Input` component uses `--ai-spacing-4` (12px). Per user decision (2026-06-12) the Input is used **verbatim** (12px) — treated as a cross-file Input difference, not a deliberate per-instance override. No template CSS added for it.

## JS / Interactivity

No new JS. The shell's scripts (sidebar-menu, HeaderGroup, Dropdown, Select, Alert, ThemeToggle, FontSizeSlider, AiAssistant shell, AssistantPopover/toasts module, Lucide) are reused as-is from the cloned footer.

**Visual-only (backend TODOs in markup):**
- Filter input — no client-side filtering wired (`data-backend-todo="controlhub-filter"`).
- ActionCard cards navigate as a whole (both Chevron and Button variants → a page); the Button variant additionally has a separate "+ add" action. Chevron links are `href="#"`, the card-level navigation on Button cards isn't wired (pointer cursor only), and "add" buttons are inert. When wiring the Button card, use a stretched-link (`<a>` with `::after` covering the card) so the whole card navigates while the "+ add" `<button>` stays a separate click above it.

See `TODO(backend:ControlHub)` markers in `ControlHub.html` and the `ControlHub` surface in `docs/handover-manifest.json`.

## Notes
- **Distinct from ControlScreen.** Same Figma file, same "Control Screen" name, but a different view (filterable directory vs dashboard). Lives in its own `src/cc/templates/ControlHub/` and reuses ControlScreen's shell CSS rather than duplicating it.
- **Page paint values matched the shell.** Desktop padding/gap (`--ai-spacing-6`/`--ai-spacing-7`) and mobile padding (`--ai-spacing-4`) already match the reused `.cc-control__page`; only the mobile gap needed an override.
- **Reflow on `@container cs-page`** for the grid + heading (descendants of the page container); the page's own mobile gap uses `@media` because an element can't query its own container.
- Lucide names: Figma `Icon/24px/Search` → `search`; `Icon/16px/X` → `x`; `Icon/24px/Plus` → `plus`; `Icon/24px/ChevronRight` → `chevron-right`.
