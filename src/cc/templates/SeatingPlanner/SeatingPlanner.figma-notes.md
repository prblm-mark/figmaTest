# SeatingPlanner — Figma Notes

**Tier:** Template
**Built:** 2026-08-26 (Seating Planner module, screens 1–2 of a series)
**Files:** `SeatingPlanner.css`, `SeatingPlanner.html`, `SeatingPlanner.js`, `SeatingPlanner.figma.ts`, `SeatingPlanner.figma-notes.md`
**Composes:** the **ControlScreen app shell** verbatim + Button (`btn--secondary`) + **EventPicker** (the Select Event modal, itself composing Modal / SearchInput / Checkbox / ActionCard / Badge)
**JS:** the shell's own bundle, ported unchanged, + `event-picker.js` (the picker's own) + `SeatingPlanner.js` (opening/closing the picker and focus management — nothing else)

## Figma Nodes

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
**Screen 1 — "No Event"**
- **Desktop:** `3515:175956`, 1728×1117
- **Mobile:** `3515:213358`, 402×874

**Screen 2 — "Select Event"**
- **Desktop:** `3515:176032`, 1728×1117
- **Mobile:** `3515:228380`, 402×874
- **Desktop, dark mode:** `3515:176057` (overlay `3515:176080`)

Both frames are named **"No Event"**, and their content frame carries the working title
*"TASK-344753 — SeatingPlanner — mobile toolbar bottom bar — v4"* — a leftover name from a
different piece of work. Worth renaming.

> **This is screen 1 of a series.** The designer is supplying a desktop + mobile frame per screen,
> starting with the empty state. The CSS is structured for that: `.seating-screen` is the content
> card and `.seating-screen__empty` is one state inside it, so later screens add siblings rather
> than reworking the card.

## The shell is reused, not rebuilt

The screens sit inside the Control Centre shell that already exists, so this template links
`../ControlScreen/ControlScreen.css` and adds only page-content classes — exactly the approach
**ControlHub** already takes.

**Figma confirms the reuse rather than merely permitting it.** The sidebar's six glyphs are the
same set ControlScreen renders (SlidersVertical, UserCog, ChatNoAxesCombined, Star, Network,
CircleUser), and the mobile frame drops the ActionsMenu and swaps to the narrow rail exactly as the
shell's own `@media (max-width: 768px)` rules already do — `.cc-control__actions { display: none }`
and the `--desktop` / `--mobile` sidebar swap. Nothing needed adding for either.

### Three shell CONFIGURATION changes (no CSS)

Porting the shell markup is not the same as porting its *state*. ControlScreen ships configured for
its own screen, and three things had to be set to what Figma draws here:

| | ControlScreen ships | Figma draws | Fix |
|---|---|---|---|
| Sidebar | menu panel **docked open** → rail is 336px wide | **collapsed 56px rail**, first icon active | `hidden aria-hidden="true"` on the `cc-d-control` panel. The active button keeps `--active` + `aria-current`, which matches the highlighted first icon. |
| Chrome | `CCTopNavigation` **+ `cc-header`** title row → 131px tall | **CCTopNavigation only**, 48px | The `cc-header-cq` block was **removed**, not hidden, so nothing reserves height. |
| Breadcrumb | "Zone Selector › Level 1 › Level 2" | **"Affino.com › Events › Seating Planner"** | Relabelled. |

Caught by measuring the shell against the frame rather than by reading the markup — the ported
sidebar rendered 336px wide and the chrome 131px tall before these were applied.

## Step 3a — shell paint bindings

Recorded from `get_design_context` on `3515:175977` (desktop) and `3515:213363` (mobile)
**before** any CSS was written, per CLAUDE.md source-of-truth rule #5.

| Wrapper | Property | Figma binding | In code |
|---|---|---|---|
| Body / template root | background | `--cc-ui-primary-bg` | **already correct** — `.cc-control` paints it |
| Page content | background | `--cc-ui-primary-bg` | inherited from the shell |
| Page content | padding | `--ai-spacing-7` / `--ai-spacing-4` (mobile) | `.cc-control__page--seating` |
| Container | background | `--ai-datatable-table-bg` → rebound | `.seating-screen` |
| Container | border | 1px `--ai-border-secondary` | `.seating-screen` |
| Container | radius | `--ai-radius-lg` | `.seating-screen` |
| Container | sizing | `flex-[1_0_0]`, `min-h-px`, `w-full` | `.seating-screen` |
| Empty state | padding | `--ai-spacing-7` inline / `--ai-spacing-11` block | `.seating-screen__empty` |
| Empty state | gap | `--ai-spacing-4` | `.seating-screen__empty` |
| Empty state | alignment | `items-center justify-center`, flex column | `.seating-screen__empty` |
| Icon disc | background | `--ai-surface-brand-soft-extra` | `.seating-screen__empty-icon` |
| Icon disc | radius | `--ai-radius-full` | `.seating-screen__empty-icon` |
| Icon disc | glyph colour | `--ai-surface-brand` → rebound | `.seating-screen__empty-icon` |

**The page background needed nothing.** Figma binds `--cc-ui-primary-bg`, which is exactly what
`.cc-control` already paints — the very token ControlScreen originally got wrong by intuition
(`--ai-surface-secondary`), which is why this table exists.

### The one place this screen departs from the shell

`.cc-control__page` gives `padding: --ai-spacing-6` (24px), which is what both existing CC screens
want. **Figma binds `--ai-spacing-7` (32px) here**, dropping to `--ai-spacing-4` (12px) on mobile —
hence the `--seating` modifier. The shell's `gap: --ai-spacing-7` is left alone: this page has a
single child, so it never applies.

## Screen 2 — "Select Event"

The same screen with a modal over it. **No new markup was designed**: the modal is the
already-built **EventPicker** pattern (`src/cc/patterns/EventPicker/`), whose Figma component set
is `3108:6662` — confusingly named **"Seat Planner"**, which is why the instance on these frames
reads that way. It arrives complete with 8 variants, its own JS and its own Code Connect.

So screen 2 added no component CSS at all. What it added was **hosting**: the overlay, and the
open/close/focus behaviour that `.modal-overlay` cannot express on its own.

### What was already right

| Needed | Already existed | Match |
|---|---|---|
| overlay: fixed, centred, `--ai-spacing-6` padding | `.modal-overlay` in Modal.css | **exact** |
| modal width 768px | `.modal--lg` = `--ai-size-11` | **exact** |
| modal bg / radius | `.modal` → `--ai-surface-elevated-1`, `--ai-radius-lg` | matches Figma's binding |
| picker contents, search, Live filter, empty state | EventPicker + `event-picker.js` | used verbatim |
| Escape closes | `event-picker.js` listens on its own root | see the caveat below |

### The interaction (designer, 2026-08-26)

EventPicker's own header says it best — *"Emits CustomEvents so the host app owns persistence and
routing"*. This template is that host, so `SeatingPlanner.js` exists to do exactly four things:

1. **"Select Event" opens it**, and `aria-expanded` tracks the state.
2. **Close on `event-picker:close`** (the × and Cancel, both `[data-ep-close]`), on a **backdrop
   click**, and on **Escape**.
3. **Close on `event-picker:select`**, re-emitting `seating-planner:event-chosen` with
   `{ id, name }`.
4. **Manage focus**, because `.modal-overlay` only toggles `display`.

**Why the focus code is not optional.** The dialog is marked `aria-modal="true"`, which promises
focus is inside it and cannot wander out — a promise CSS cannot keep. Without it, opening the picker
leaves focus on the button behind the scrim and Tab walks the page underneath. **Escape also stops
working**, because EventPicker listens for it on its own root: no focus inside the picker, no
keydown, no close. So focus moves to the **search field** on open (what you came to do, and inside
the picker root so Escape works immediately) and returns to the trigger on close, with a Tab trap
wrapping at both ends.

**One bug this caught.** Restoring focus to "whatever was focused before" happily restored it to
`<body>` when the dialog had been opened without the trigger being focused first — which is the same
as losing focus, and sends the next Tab to the top of the page. `<body>` is now explicitly rejected
in favour of the trigger, not merely null-checked.

### On select, nothing is invented

The screen that follows does not exist yet, so selection closes the modal and re-emits the choice
with a `TODO(backend:SeatingPlanner)` marking the seam. Pretending the planner exists would be worse
than an honest no-op — see the handover note.

### The scrim

**Owned by Modal.css, not by this template.** Figma draws `rgba(15, 23, 42, 0.5)` light
(`3515:176055`) and `rgba(15, 23, 42, 0.85)` dark (`3515:176080`) — navy, with the density rising in
dark because a 50% veil over an already-dark page barely separates the dialog from it.

That started as a scoped override here, then moved into `.modal-overlay` on 2026-08-26 as a
system-wide per-theme rule: **navy for the default/dark/CC-light/CC-dark themes, black for the chat
surfaces**, 0.5 light and 0.85 dark. Nothing about it was ever specific to seating, and promoting it
deliberately changed the three other `.modal-overlay` consumers (Modal's demo, ControlScreen,
ControlHub) from black to navy. See **Modal.figma-notes.md → Overlay scrim**, which also records the
`--ai-surface-scrim` token gap.

So this screen now touches the overlay not at all — `.modal-overlay` already supplied fixed,
centred, `--ai-spacing-6` padding, matching Figma's overlay frame exactly.

### Flagged on screen 2

- **The base card behind the modal is 302px tall on the desktop frame** — hugging its content —
  where screen 1's desktop fills (1005) and screen 2's own *mobile* frame fills (802). Two frames of
  three say fill, and a background screen should not resize because a modal opened over it, so it is
  **left filling** (designer, 2026-08-26). Almost certainly the frame was collapsed while the modal
  was placed.
- **Desktop uses a `SidebarMenu` instance here** where screen 1's desktop used `Sidebar`. Both are
  56px wide and render identically, so it makes no difference in code — but the two frames disagree
  about which component is placed.
- **The modal renders 645px tall against Figma's `h-[619px]`.** Not introduced by this screen:
  **EventPicker's own demo measures 768×645 too**, so the 26px is a pre-existing difference in that
  component, checked rather than assumed. Left as an EventPicker matter — it was built and signed
  off from the same Figma set.
- **`.modal` has no border and a different shadow** from what Figma's instance shows here
  (`1px --ai-border-secondary`, `0 3px 10px rgba(0,0,0,0.1)`). Also an EventPicker/Modal-level
  question, not re-litigated from this frame.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--cc-ui-primary-bg` | page background | via the shell |
| `--ai-spacing-7` / `--ai-spacing-4` | page `padding`, desktop / mobile | |
| `--ai-spacing-7` / `--ai-spacing-11` | empty state `padding-inline` / `-block` (32 / 64) | identical at both breakpoints |
| `--ai-spacing-4` | empty state `gap` (12) | |
| `--ai-spacing-9` | icon disc (48px) | on-scale despite reading as a raw `size-[48px]` |
| `--ai-icon-size-lg` | disc glyph (24px) | |
| `--ai-radius-lg` / `--ai-radius-full` | card / disc | |
| `--ai-border-secondary` | card border | |
| `--ai-surface-primary` | card background | rebound — see below |
| `--ai-surface-brand-soft-extra` | disc background | |
| `--ai-icon-brand` | disc glyph colour | rebound — see below |
| `--ai-font-title` | heading + body | |
| `--ai-font-fixed-md` / `-sm` | heading, desktop / mobile (18 / 16) | |
| `--ai-font-fixed-xs` / `-xxs` | body, desktop / mobile (14 / 13) | |
| `--ai-leading-md` / `--ai-leading-sm` | heading both + body desktop / body mobile (24 / 20) | |
| `--ai-font-semibold` / `--ai-font-regular` | heading / body | |
| `--ai-text-primary` / `--ai-text-secondary` | heading / body | |

## Token decisions

Both are **rebinds of a token that works onto the token that means it** — the same call taken on
SeatingToast the same day.

| Figma | Decision |
|---|---|
| Container `bg` binds **`--ai-datatable-table-bg`** (#ffffff) | **`--ai-surface-primary`**. A Datatables token doing a surface's job — the identical slip found on SeatingToast's pill. Same value today; the point is that a seating screen should not follow a table redesign. **Worth rebinding in Figma.** |
| Disc glyph binds **`--ai-surface-brand`** (#0094ad) | **`--ai-icon-brand`**. Note this differs from SeatingToast's success/error icons, where the icon scale genuinely *has* no entry and the surface token had to stand: here `--ai-icon-brand` exists and carries the identical value, so it is a rebind rather than a gap. **Worth rebinding in Figma.** |

Everything else was already bound, and the few raw-looking values are all on-scale:
`size-[48px]` is `--ai-spacing-9`, and Figma's odd `px-[33px] py-[65px]` on the empty state are
`--ai-spacing-7` / `--ai-spacing-11` **plus the Container's 1px stroke** — the same
stroke-inside-vs-added arithmetic decoded on SeatingToast.

## The Select Event button is a detached frame in Figma

Figma draws it as a plain frame named "Button", not a Button instance — but it is
**`btn btn--secondary` at base size on every single property**: gap `--ai-spacing-3`, padding
`--ai-spacing-5`, `min-height: --ai-spacing-8` (40), `--ai-radius-md`, 14px semibold,
`--ai-leading-xs`, `--ai-btn-secondary-border`. So the real component is used and the frame is
treated as a hand-drawn stand-in. **Worth swapping it for a Button instance in Figma.**

One difference: Figma's frame carries `light/shadow-xxs`, which `.btn--secondary` does not have.
Left alone — that is a Button-level question, and a detached frame is weak evidence for changing a
component every other screen uses.

Icons: the disc is `calendar-days` (from the layer name `Icon/24px/CalendarDays`); the button's
16px glyph is **`calendar-search`**, identified from the screenshot because its layer is named only
"Icon". Both verified to exist in Lucide.

## Responsive

`@media (max-width: 767px)`, **not** `@container cs-page`, even though the shell makes
`.cc-control__page` a container named `cs-page` and ControlScreen's own content rules use it.

Two reasons. The page padding **cannot** be a container query — an element cannot query the
container it establishes (the self-query trap). And splitting the two would put the padding change
and the type change on different switch points. One mechanism, one breakpoint.

It also matches the design intent: Figma's mobile frame is a 402px **viewport**, and the shell's own
sidebar and ActionsMenu swaps are viewport-based.

| Property | Desktop | Mobile |
|---|---|---|
| page `padding` | `--ai-spacing-7` (32) | `--ai-spacing-4` (12) |
| heading | `--ai-font-fixed-md` (18) | `--ai-font-fixed-sm` (16) |
| body | `--ai-font-fixed-xs` (14), `--ai-leading-md` | `--ai-font-fixed-xxs` (13), `--ai-leading-sm`, wraps to 2 lines |
| empty state padding, gap, disc, button | — | **all identical** |

The empty state's 32/64 inner padding not changing is worth stating, because it would be easy to
assume it tightens along with the page padding.

## Verification

Measured in headless Chrome at both frame sizes.

| | Figma | Rendered | |
|---|---|---|---|
| desktop sidebar | 56×1117 | **56×1117** | exact |
| desktop ActionsMenu | 56×1117 | **56×1117** | exact |
| desktop main column | 1616×1117 | **1616×1117** | exact |
| desktop chrome | 1616×48 | **1616×48** | exact, once the shell's bottom rule was removed |
| **desktop Container** | **1552×1005** | **1552×1005** | **exact** |
| mobile sidebar | 52 wide | **52×874** | exact |
| mobile ActionsMenu | absent | **`display: none`** | exact |
| **mobile Container** | **326×802** | **326×810** | **width exact**, +8 — see below |
| icon disc | 48×48, glyph 24 | **48×48, 24** | exact |
| Select Event button | 144×40 | 142×**40** | height exact; 2px is text metrics |
| heading / body | 18/16 and 14/13, leading 24/20 | **all exact** | |

Also verified: **zero JS errors** at both sizes with the shell's whole script bundle ported
unchanged, zero unresolved `<i data-lucide>` icons, and no horizontal overflow at either size.

### The mobile chrome is 41px, not Figma's 48 — deliberately

`TopNavigation` reduces itself to `min-height: --ai-spacing-8` (40px) under its own
`@container (max-width: 767px)` rule. That is the component's documented behaviour, and it is what
every other CC screen gets at mobile.

Figma's mobile frame draws the `CCTopNavigation` instance at 48 — the desktop height — which almost
certainly means the instance simply was not switched to its narrow state in the frame.
**Not overridden:** a template must not override a component's own responsive spec, and forcing 48
here would make this screen the only CC screen with a taller mobile chrome. The 7px it adds to the
Container's height is the same difference. **Worth confirming with the designer**, since the
alternative reading is that TopNavigation's 40px mobile rule is itself wrong.

### The chrome's bottom rule was removed

The shell gives `.cc-control__chrome` a 1px `--ai-border-secondary` bottom rule. Figma's
CCHeaderGroup here is 48px with **no** rule, and it has nothing to separate: the top nav is dark
(`--cc-header-primary-bg`) sitting directly on the light page, so the edge is already unambiguous
and the hairline just reads as a seam (designer, 2026-08-26).

Scoped rather than removed from the shell —
`.cc-control__main:has(.cc-control__page--seating) .cc-control__chrome`. The chrome and the page are
siblings under `.cc-control__main`, so matching on the page's own modifier reaches the chrome with no
markup change. **Verified no leak:** ControlScreen still renders 1px/131px and ControlHub 1px/121px,
while this screen is 0px/48px.

Removing it made the desktop side pixel-exact — chrome 1616×48, page 1616×1069 and the Container
1552×1005, all matching Figma exactly.

### The scrollbar gutter was released

The shell sets `scrollbar-gutter: stable` on `.cc-control__page`, reserving 15px so an appearing
scrollbar cannot shift the layout. Correct for ControlScreen and ControlHub, whose pages scroll —
but **this page never scrolls**: its single child fills it and owns its own scrolling, and the later
screens will scroll inside that card too. The reserved gutter was exactly the 15px that left the
Container at 1537 instead of Figma's 1552, so `scrollbar-gutter: auto` is set on the `--seating`
page. Reverting one line restores the shell default.

## Notes and things to raise

- **Both frames are named "No Event"** and their content frame still carries the working title
  *"TASK-344753 — SeatingPlanner — mobile toolbar bottom bar — v4"*, which describes different work.
- **Figma shows no page header.** ControlScreen's chrome has a `cc-header` title row; this screen has
  only the 48px top nav, so the content card starts immediately beneath it. Built as drawn, but a
  planner screen with no title beyond the breadcrumb is worth confirming.
- **The `cc-icon-nav` strip is kept** in the chrome. It is `display: none` by default and only
  appears via the User Menu's "Icon Navigation" toggle, so it contributes no height and matches
  Figma as drawn — but if a user toggles it on, the chrome grows past what Figma shows.
- **The empty-state icon frame is named "Text"** in Figma, which it is not.
- **The AiAssistant panel and the right rail's other actions are ported wholesale** from
  ControlScreen, since the rail Figma draws is the same component. They are not part of this
  screen's own design and were not re-derived.
- **The rail's Info panel described the wrong screen** — it still read *"Your Control Centre home —
  monitor live activity, jump into key features, and switch zones from one place"*, with
  ControlScreen's Related pills. Rewritten for the planner, and its Related pills changed to Events
  / Attendee Lists. The whole panel is placeholder content that ultimately needs real per-screen
  data; the "System Security Right" pills were left alone rather than invented.
- **The Affino Assistant coachmark appears bottom-right, which Figma does not show.** Kept
  deliberately: it is the shell's own onboarding promo, delayed by a few seconds, dismissible, and
  remembered in `localStorage` under `cc-assistant-popover-dismissed` — it shows on every CC screen,
  and a static frame is not evidence for changing shell UX. Worth knowing it will overlay this
  screen's empty state on a first visit.
- **No dark-mode variant** in either frame, though the shell and both rebound tokens are
  theme-aware, so it will follow `data-theme="dark"` on its own.
- **`get_metadata` on the Seat Planner page returns ~10M characters** — do not fetch it to find a
  frame. Ask for the node id, or go straight to a known node.
