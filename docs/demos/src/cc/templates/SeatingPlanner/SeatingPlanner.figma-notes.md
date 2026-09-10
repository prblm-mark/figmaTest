# SeatingPlanner — Figma Notes

**Tier:** Template
**Built:** 2026-08-26 → 2026-08-27 (Seating Planner module, screens 1–5 of a series)
**Files:** `SeatingPlanner.css`, `SeatingPlanner.html`, `SeatingPlanner.js`, `SeatingPlanner.figma.ts`, `SeatingPlanner.figma-notes.md`
**Composes:** the **ControlScreen app shell** verbatim + Button + **EventPicker** (the Select Event modal, itself composing Modal / SearchInput / Checkbox / ActionCard / Badge) + **SeatingHeader** (`Type=No Plans`)
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

**Screen 3 — "No Plan"**
- **Desktop:** `3515:176082`, 1728×1117
- **Mobile:** `3515:213400`, 402×874

**Screens 4–5 — "Create Plan" and "Create Plan / Help On & Errors"**
- **Desktop:** `3515:212885` (help off) · `3515:212593` (help on + errors)
- **Mobile:** `3515:228092` · `3515:212739`

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

### Form enhancements (designer, 2026-08-27)

Four changes on top of what the frames draw:

| Field | Change |
|---|---|
| Room / location | now **required** |
| Tables | `type="number"`, **required**, real value `12` (was a placeholder) |
| Seats / table | `type="number"`, **required**, real value `10`, `min="6" max="12"` |
| Table Shape | now a **Select** — Round / Square / Rectangle, Round selected |

**The seats default exposed a contradiction in the design.** Figma's placeholder is `14`, but its own
error copy says "Seats per table must be between 6 and 12." — so promoting 14 to a real value would
open the form invalid. Resolved as **10** with the 6–12 rule intact (designer): a mid-range default
rather than an edge one, so the first nudge upward does not trip the error. `min`/`max` now mirror
the rule, so the native spinner cannot reach an invalid value either.

**One error string is derived, not lifted.** Figma gives Room / location only a hint ("The room or
area this plan covers") and never an error, so "Room / location is required" follows the wording of
the one required-field error Figma *does* state. Flagged as derived rather than sourced.

Tables reuses Figma's own "Number of tables is required." as its error, which is the copy Figma
renders as a grey hint — so that string now does double duty. Still worth the designer's attention:
it reads like validation and is styled as a hint.

**Table Shape needed no new component.** `Select` already had everything, including the
`sel__control--sm` compact size the mobile modal needs. It sits in a `.create-plan__shape` wrapper
that reproduces `.input`'s column layout, so all three fields in that row align on every line —
verified: labels and controls share an identical top, and all three cells measure 146×104.

**The native number spinner is kept.** Figma draws none, but Figma would not render one either way,
so this is not a divergence from an instruction — and a number field without its spinner is a worse
number field.

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

## Screen 3 — "No Plan"

An event is chosen but has no seating plans yet, so the page gains a **SeatingHeader** at
`Type=No Plans` above a dashed placeholder card. The header instance's internals match the wave-6
build exactly — including the mobile frame's reversed, primary-first Global-Actions — which is a
useful independent confirmation of that component.

**No new components.** SeatingHeader is used verbatim, and the header's own **New Plan** button is
why this empty state needs no CTA of its own (unlike the event gate, which has one).

### The page gap only started mattering here

This is the first state with **two** page children, so it is the first to exercise the page's `gap`.
Figma binds `--ai-spacing-5` (16px) desktop / `--ai-spacing-4` (12px) mobile, where the shell gives
`--ai-spacing-7` (32px).

Worth stating plainly: on screens 1 and 2 the shell's 32px gap was **invisible, not correct** — one
child means no gap is ever drawn. "It looked right" would have been a bad reason to leave it.

### The card is the same box, differently dressed

| | No Event card | No Plan card |
|---|---|---|
| border | solid | **dashed** |
| shadow | none | **`--ai-shadow-xxs`** |
| background | `--ai-datatable-table-bg` → rebound | **`--ai-surface-primary`** (bound directly) |
| radius | `--ai-radius-lg` | raw `rounded-[16px]` — the same 16px |

So `.seating-screen--placeholder` adds two declarations and nothing else. The dashed-plus-shadow
treatment reads as a placeholder waiting to be filled — the same idea as Unassigned's empty state.

Note Figma binds `--ai-surface-primary` **directly** on this card, having used the Datatables token
on the No Event one. That is more evidence the Datatables binding there was a slip, not a choice.

### The two empty states

They share the centring and the 64px block padding, and differ in inline padding and line spacing:

| | `--gate` (No Event) | `--no-plans` (No Plan) |
|---|---|---|
| `padding-inline` | `--ai-spacing-7` (32) | `--ai-spacing-6` (24) |
| line spacing | `gap: --ai-spacing-4` | no gap; `--ai-spacing-2` pad on the text |
| icon disc | yes | **no** |
| CTA | Select Event | **none** (the header has New Plan) |

The differing inline padding is what Figma says, with no stated reason — worth a designer glance.

Figma spaces the No Plan lines with a `pt-[6px]` on the second paragraph rather than a container
gap; 6px is `--ai-spacing-2` exactly, so it is bound rather than raw.

### The body text was unified (designer, 2026-08-26)

The two frames disagreed three ways about the same kind of sentence:

| | font-family | leading | colour |
|---|---|---|---|
| No Event (both breakpoints) | `--ai-font-title` | `--ai-leading-md` desktop / `-sm` mobile | `--ai-text-secondary` |
| No Plan desktop | `--ai-font-body` | `--ai-leading-sm` | `--ai-text-contrast` |
| No Plan mobile | `--ai-font-body` | `--ai-leading-sm` | `--ai-text-secondary` |

**Unified on body / `--ai-leading-sm` (20px) / `--ai-text-secondary`**, so one rule serves both.
Two consequences worth being explicit about:

- The No Event state's **desktop leading tightens 24 → 20** and its font-family changes
  title → body. That is a deliberate change to an already-built, already-reviewed screen.
- The colour picked `--ai-text-secondary` because the No Plan **desktop** frame is the outlier —
  its own mobile frame and both No Event frames say secondary. **Worth fixing that frame in Figma.**

The No Plan frames also cap the measure at 512px, which is `--ai-size-9` exactly. Applied to both
states: a centred sentence wants a measure regardless, and the No Event copy is shorter than the cap
so nothing moves there.

### States in one page

Screens 1–3 are mutually-exclusive states of one screen, so they live in one page and
`SeatingPlanner.js` switches them with `data-seating-state`:

- **Choosing an event advances No Event → No Plan for real**, using the seam screen 2 left behind.
  The demo is a working flow, not a set of stills.
- **`?state=no-plan`** lands on a state directly for review — the same trick `?frame=mobile` uses.
- Panels toggle via the **`hidden` attribute**, not a class: `base.css` guarantees `hidden` always
  wins, and a `display: none` flex child is removed from layout entirely, so the page's gap never
  appears around a state that is off screen.

**What the flow does NOT claim.** Which state renders is really the plan *count*, not the click — an
event that already has plans should go straight to the planner. So the chosen event is still
re-emitted as `seating-planner:event-chosen` for a host to act on, rather than being treated as
settled here.

## Screens 4–5 — "Create Plan" (+ help and errors)

The No Plan screen with a **create-plan modal** over it, opened by the SeatingHeader's own **New
Plan** button. Screens 4 and 5 are the same modal in two states — help off, and help on with two
fields in error — so they are built as one modal, not two.

### Nothing new was needed from Modal except a subtitle

`Modal`, `ModalHeader`, `ModalBody` and `Modal Footer` already matched Figma **exactly**: header and
footer padding `--ai-spacing-5 --ai-spacing-6`, body padding `--ai-spacing-6` with a
`--ai-spacing-5` gap, a 32px close button with a **20px** icon, and the modal's own 512px width
(`.modal` default = `--ai-size-9`). Checked rather than assumed.

The one gap was the **subtitle** ("New Seating Plan" over the event name). Figma's ModalHeader
component has a formal `subText` property, so `.modal__title-block` + `.modal__subtitle` went into
**Modal** rather than being scoped here. That build also uncovered that ModalHeader/Body/Footer are
now their own component sets with a Size axis — see **Modal.figma-notes → Header / Body / Footer are
their own component sets**, which records what was and was not taken.

### The form

A real **3-column grid**, which is what Figma binds (`grid-cols-[repeat(3,minmax(0,1fr))]`,
`gap-x: --ai-spacing-4`, `gap-y: --ai-spacing-5`). Plan name and Room / location span all three;
Tables, Seats / table and Table Shape take one each.

Rows are content-height rather than Figma's fixed 64px, because help and error lines grow them —
Figma's own help-on frame shows the same inputs at 88px and 104px.

The **"Show help" toggle** is `Toggle` at `xxs` (the size added for TableListing), positioned
`absolute right-0 top-0` inside the form so it sits on the first field's label line, exactly as
Figma places it. Its label is `--ai-font-fixed-4xs` (11px) — **not** the 12px TableListing's toggle
label uses, which is worth a designer glance.

| Field | Placeholder | Help copy (from the help-on frame) |
|---|---|---|
| Plan name | e.g. Main Ballroom | **none — masked by its error** |
| Room / location | e.g. Great room | The room or area this plan covers |
| Tables | 12 | Number of tables is required. |
| Seats / table | 14 | **none — masked by its error** |
| Table Shape | Round | Default shape for the generated table. |

**Two help strings are genuinely unknown.** The only frame that shows help also shows Plan name and
Seats / table in error, so their hints — if they have any — appear nowhere. Those two ship with an
empty help element that validation fills, and `.input__help:empty` keeps it from reserving a line.
Nothing was invented to fill the gap.

### Errors are real validation, not a demo state

`.input--error` already does everything Figma draws: red border, red focus ring, and
`.input__help` turned red — so an error message and a hint are the same element in two colours,
which is exactly the design.

The two rules are **transcribed from Figma's own error copy**, not invented:

- `Plan name is required`
- `Seats per table must be between 6 and 12.`

So submitting the form actually validates, and screen 5 is reachable by using the form rather than
by faking a state. `?state=create-plan-errors` also lands on it directly.

**Tables is not validated**, even though its help reads "Number of tables is required." — Figma
renders that grey, as help rather than an error. Worth a designer check: that copy reads like
validation but is not styled as it.

**The help toggle deliberately does not hide error messages** — only non-error help lines. Figma
never draws help-off-with-errors, so this is a reasoned call: an error you cannot see is worse than
a hint you did not ask for.

### Flagged

- **The desktop base header is a DETACHED frame.** `header-realistic-5-rooms` (91px) replaces the
  `Header` instance screen 3 uses (99px), with `padding-block: 20px` — which is **off-scale**, no
  token. The mobile frame still uses the real instance. Built with the SeatingHeader component and
  the 20px ignored: the component is the authority, and an off-scale value in one frame is an
  experiment, not a spec.
- **The label differs between the two frames** — "Seats / Table" on screen 4, "Seats / table" on
  screen 5. Built lowercase, matching "Room / location".
- **The mobile modal renders 354 wide against Figma's 338.** That frame places the modal 32px from
  each edge where `.modal-overlay` pads `--ai-spacing-6` (24). Not changed — the overlay's padding is
  shared by every modal in the system.
- **The desktop modal renders 512×424 against Figma's 512×418** — width exact, 6px of label/field
  text metrics.
- Every Input has its clear button and icon **hidden** in Figma, so neither is rendered. The
  published Code Connect for Input is **still stale** here too — it emits `input__field` where the
  class is `input__control`.
- **`Select.js` was being loaded twice** — once by the ported ControlScreen shell and once by the
  line added for Table Shape. Because its trigger branch is a `classList.toggle`, the two handlers
  cancelled each other and **no Select on the page would open**, while option clicks still appeared
  to work. The duplicate include is gone and `Select.js` gained a double-include guard, so the same
  mistake is now harmless — see Select.figma-notes. Worth remembering when porting the shell: it
  already brings Chart.js, Select, Dropdown, Toggle, Alert, HeaderGroup and SidebarMenu with it.

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
| body | `--ai-font-fixed-xs` (14), `--ai-leading-md` | `--ai-font-fixed-2xs` (13), `--ai-leading-sm`, wraps to 2 lines |
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

---

## Create-plan: Tables + Seats are steppers (2026-08-27)

Both fields now use `.input--stepper` (see `src/components/Input/Input.figma-notes.md`). **No Figma
node backs the stepper**, so this is a code-side decision the frames do not show — the create-plan
frames still draw plain number fields. Flagged rather than silently diverged.

Why it fits here: both values are bounded quantities. Tables is `min=1`; Seats / table is
`min=6 max=12`, straight from the frame's own help copy. With the buttons disabled at each bound the
form cannot reach an invalid seats value by clicking at all, which is strictly better than catching
it in validation afterwards. The existing validation is untouched and still fires on typing.

### Mobile needed two extra rules — and has a caveat worth a designer decision

At ≤639px this screen replicates `input--sm` geometry through a **media query** rather than the
class (Figma's mobile frame puts every Input at `sm`, and a class cannot be added from a media
query). Two consequences the adoption exposed:

1. `.input--sm .input__step` in Input.css keys on the class, so it never fired — the buttons stayed
   40px wide inside a 32px-tall wrap.
2. `.create-plan__grid .input__wrap` and Input.css's `.input--stepper .input__wrap` have the *same*
   specificity, and this file loads later — so the grid's `padding: 0 8px` won, re-introducing the
   side padding the flush buttons need at zero.

Both are now handled in the `@media (max-width: 639px)` block, scoped to `.create-plan__grid
.input--stepper`. Measured after: 95×32 wrap, 32px buttons, flush, no horizontal overflow.

### The 29px mobile field — RESOLVED by capping Tables at 99

Figma's mobile frame keeps Tables / Seats / Shape in one three-column row, which leaves ~95px per
column; two 32px buttons take 64 of it, leaving the number field **29px**. Two digits fit; `"888"`
renders at 26px in a 29px field — 1.5px either side, effectively touching the buttons — and Tables
originally had no `max`, so three digits was reachable.

**Designer's call (2026-08-27): give Tables a `max` rather than restructure the grid.** So the
mobile layout still matches the frame exactly, and the field can no longer be asked to hold a value
it cannot show.

`max="99"` — the largest value that never needs three digits. Worth being explicit about what that
number is and is not: **the cap bounds the digit count, not the domain.** It is not a statement that
an event may have at most 99 tables. If a real upper limit ever comes from the product side and it
exceeds 99, this cap is the wrong lever and the grid is the thing to change instead.

Measured after: `"99"` renders 17px in the 29px field — **11px slack**, ~5.5px each side, against
3px for the three-digit case it replaces. Desktop is 64px with 47px slack. Clicking `+` stops at 99
and further clicks are no-ops.

**One derived error string.** The `+` button disables at 99, so clicking cannot exceed the cap — but
the field is a real number input, so typing or pasting `150` would otherwise submit. Validation now
catches it with *"Number of tables must be between 1 and 99."* Figma states **no** tables bound at
all, so this follows the wording of the one bounded-field error it does state ("Seats per table must
be between 6 and 12."). Derived from the established pattern, not lifted from a frame — same footing
as the Room / location message, and listed with it under the designer follow-ups.

The resting help line is unchanged and is still Figma's own hint, *"Number of tables is required."*
— it reverts to that once a valid value is entered.

Also visible in the mobile capture and **pre-existing**, not caused by this change: Table Shape's
Select truncates "Round" to "Rou…" at that column width. The grid columns are equal `1fr`, so the
stepper did not take space from it.

### Figma captures (Prototypes page, `2025:803`)

| Frame | Node | Size |
|---|---|---|
| TASK-344753 — Input stepper — component matrix — v1 · Desktop | `3564:1383` | 1600×1230 |
| TASK-344753 — SeatingPlanner — create-plan steppers — v1 · Desktop | `3565:1383` | 1600×1230 |
| TASK-344753 — SeatingPlanner — create-plan steppers — v1 · Mobile | `3566:1383` | 390×1230 |

Colour rebind ran on all three (`scripts/gen-figma-rebind.mjs`). The stepper frame came out
**146/146 on Semantic, 0 remaining** — the `bindVariables=true` capture bound it correctly with no
help. The two CC frames needed the new `--theme cc` overlay and then rebound 31 and 41 paints; what
is left is recorded under "Rebind leftovers" below.

**Heights are not pinned.** All three frames are 1230px tall — the window height, not the content
height — so each has empty space below the content. The skill's `overflow: hidden` on `html` *and*
`body` pin was not applied. Not re-pushed, because a re-capture mints a new node rather than
updating in place (`feedback_figma_capture_title_collision`), so the fix belongs on the next push.

### Rebind leftovers — reported, not guessed

Per the push routine: where the CSS does not settle a colour, it stays on its primitive and gets
reported rather than bound to a plausible-looking token.

- **`#F3F6F7` on vector nodes** — 12 desktop / 3 mobile, on `MId Blue/100`. In the CC theme this hex
  is `--ai-surface-minimal`, `--ai-surface-input` *and* `--ai-surface-elevated-2` (three surface
  candidates), plus `--cc-header-icon`. The audit classes these nodes as `icon`, and there is no
  `--ai-icon-*` at that value in CC. `--cc-header-icon` is almost certainly what they are, but that
  is a `--cc-*` token and the rebind map covers only the four `--ai-*` families — so this needs
  either a designer call or an extension of the generator to CC-namespaced tokens.
- **`#000000` unbound stroke** — 2, mobile only. No token at that value.
- **`#0F172A` unbound fill** — 1, both frames. This is the modal scrim, `rgba(15, 23, 42, 0.5)` in
  `Modal.css`. Deliberately a raw `rgba()` because it carries alpha, and the hex was the designer's
  own instruction. Expected to stay unbound.

---

## State: Plan selected (2026-08-27)

| Frame | Node | Size |
|---|---|---|
| First Plan / Table Selected — desktop | `3515:177748` | 1728×1117 |
| First Plan / No Table Selected — mobile | `3515:213426` | 402×874 |
| First Plan / Table Selected — mobile, tapped | `3515:228026` | 402×874 |
| 3-panel resized + Show unassigned on | `3515:210144` | **context only — not built** |

Composition only: SeatingHeader (full Type), TableListing, TableDetail, TableCard, AttendeeCard,
RoomCard — every one already built and used verbatim. The only new CSS is `.seating-plan`, the row
that holds them, and its drag handle.

### Shell values (Step 3a) — all read from Figma, none inferred

| Wrapper | Property | Figma | Token |
|---|---|---|---|
| `.cc-control__page--seating` | padding · gap | 32 · 16 desktop, 12 · 12 mobile | `--ai-spacing-7`/`-5`, `--ai-spacing-4` — **already correct from the earlier screens**, re-verified against Header y=32/12 and body y=336/365 |
| `.seating-plan` (Frame 245, `3515:177773`) | gap | 0 — see below | — |
| listing | width | 1212 = what's left | `flex: 1 1 auto` |
| handle | inline padding · bar | 8 each side · 4 wide, radius-full | `--ai-spacing-3` · `--ai-spacing-1` · `--ai-radius-full` |
| `.seating-plan__aside` | width | 320 | **`--ai-size-6`** — Figma binds the size token, so this is not a hardcoded 320 |

Frame 245 lays out `1212 · 8 · 4 · 8 · 320 = 1552`. The row itself takes **no gap**: the handle's own
inline padding *is* Figma's 8px either side, which makes the drag target 20px wide while the visible
bar stays 4px. That reproduces Figma's whitespace exactly instead of adding a hit area on top of it.

### The drag handle

Designer confirmed the 4px pill (`3515:177775`) is a drag handle, and asked whether highlighting the
panel edge would be better practice instead. **Decision: keep the pill and highlight it** — an edge
that only reacts on hover is undiscoverable, because nothing signals draggability until the pointer
happens to land on the exact few pixels. Figma already draws the pill, so keeping it costs nothing
and adds the affordance; highlighting it on hover / focus / drag delivers the edge feedback too.

Implemented as `role="separator" aria-orientation="vertical"` with `aria-valuemin/now/max`,
`tabindex="0"`, pointer drag with pointer capture, and keyboard control — a separator that can only
be dragged is unusable without a mouse.

**Token flag.** The pill is bound to `--cc-actions-menu-primary-bg` — the *ActionsMenu's* background
token, on a splitter in the page body. Its value is identical to `--ai-surface-contrast` in all six
modes, so the code uses `--ai-surface-contrast`: a value-preserving swap to the generic family that
belongs here. **Worth repointing the Figma binding.**

**Interaction parameters Figma cannot express — flagged for a designer call:**

| Parameter | Value used | Basis |
|---|---|---|
| default width | 320 | `--ai-size-6`, Figma |
| min width | 240 | `--ai-size-4` — **in Frame 245's own variable list**, so not invented |
| max width | half the row | **invented** — no Figma evidence |
| arrow-key step | 16 (`--ai-spacing-5`) | **invented** |
| double-click | reset to 320 | **invented** — the usual splitter escape hatch |
| hover / drag colour | `--ai-border-brand` | **invented state** — Figma gives the pill no hover variant. Chosen because selected TableCard and RoomCard use the same brand-edge token |

### Desktop pre-selects, mobile does not

Designer, 2026-08-27: *"on desktop when a plan is created we will by default select the first table…
On mobile however, we will not pre-select as it would take up too much screen real estate."* Both
frames agree — the mobile one is literally named "No Table Selected".

The markup ships Table 1 with `--selected` so a no-JS render (or a Figma capture) matches the desktop
frame. That caused a bug worth recording: `applyDefault()` cleared only the card that its own
`selected` variable pointed at, which on mobile was `null` — so the pre-selected card stayed
highlighted. It now clears the class from every card and seeds `selected` from the markup.

### Mobile: the detail goes inside the card grid

`3515:228026` puts a **Table Detail instance between two Table Cards**, and the listing sits at
`y = -79` — scrolled so the tapped card is at the top. That matches the designer's *"table in focus
should scroll to top of chrome/header group"*, implemented as `scrollIntoView({block:'start'})`.

**One detail element, moved — not two copies.** `placeDetail()` appends it to the aside on desktop and
inserts it after the selected card on mobile. Two instances would drift apart the moment either changed.

**No override needed for the header.** TableDetail's own Device=Mobile variants already drop the panel
header, and that rule is already in `TableDetail.css`. Figma drops it because the card directly above
supplies the name and count — the same justification TableDetail's notes record for its sheet chrome,
just with the TableCard as the source here.

**CASE B contextual override — applied, flagged.** `.table-detail` sets `inline-size: var(--ai-size-6)`
and its notes call the fixed 320 deliberate at *both* breakpoints. Figma's mobile instance is **302** —
the grid column — because Figma resized the instance. Left at 320 it measurably overflows (320 in a
300px column), so the width is overridden **scoped to `.table-listing__grid > .table-detail`** rather
than changed in the component, since a side panel elsewhere still wants 320. Worth formalising as a
fill-width variant if the inline usage recurs.

**Re-tap closes.** Tapping the open card again deselects it. Invented: no frame shows a close control,
and without this a mobile user has no way back to the plain list.

### Content discrepancy — deliberately not copied

Every TableCard in both frames reads **"Empty (4)"** while its count reads **"0 / 10 seated"**. Those
contradict each other: a 10-seat table with nothing seated has ten empty seats. It is the TableCard
default text left unoverridden across twelve instances. The build uses **"Empty (10)"** for internal
coherence — shipping "0 / 10 seated · Empty (4)" would read as a bug to any reviewer. Flagged rather
than silently matched.

### Out of scope

`3515:210144` shows the **three-panel** layout — Tables (2 columns) | Table Detail | Unassigned — with
"Show unassigned" on and a panel resized. Supplied as context, not as this screen. The toggle carries a
`TODO(backend:SeatingPlanner)` marker and is inert. `.seating-plan` is a plain flex row, so adding a
third panel needs no restructuring, but the **resize model across three panels needs its own
definition** (which boundary each handle moves, and how the two interact).

### Verified (headless Chrome, 2026-08-27)

Desktop 1728: row 1552, listing **1212**, handle **20** (8+4+8) with a **4px** bar, aside **320** —
every figure matching Frame 245. Table 1 pre-selected, detail header shown, clicking Table 5 moves the
selection with exactly one card selected. Handle: ArrowLeft 320→336, clamps at 240, Home → 776 (half
the row), double-click → 320, ARIA min/now/max tracking. Mobile 402: nothing pre-selected, handle and
aside hidden, tapping inserts the detail directly after the card at 300px flush with the grid on both
edges, card 2 follows it, detail header hidden, re-tap restores the plain list. No horizontal overflow
and no JS errors at either width.

---

## Container queries replace viewport queries (2026-08-27)

The designer reported overlapping toolbar items. Reproduced on the live page and measured: a
**2239px viewport** with the SidebarMenu docked leaves the page column at **820px**, and neither
`@media (max-width: 1023px)` nor `(max-width: 767px)` fires. Every element therefore kept its widest
layout inside a box less than half the width it was designed for.

| Symptom | Measured at an 820px column |
|---|---|
| Toolbar text over the toggle | `.seating-header__room` box 130px, content 243px → spilled **+113** |
| "Tables" title crushed to "Tab..s" | title box **13px** (correctly ellipsised — the crush was the cause, not the overflow) |
| …because the search never shrank | `.table-listing__search` held **320px** of a 382px toolbar |
| Detail panel never yielded | aside stayed 320 while the listing collapsed |

### What changed here

| Was | Now | Why |
|---|---|---|
| `@media (max-width: 767px)` page padding/gap | `@container cs-main (max-width: 767px)` | the page cannot query its own `cs-page`; ControlScreen now names an outer `cs-main` |
| `@media (max-width: 767px)` `.seating-plan` stacking | `@container cs-page (max-width: 1023px)` | a child may query the page's container freely; 1023 because two panels need ~1024 of column before the listing stops being usable (620px = two card columns, against 364 at 768) — and it matches the band SeatingHeader's toolbar and the prototype shell already use, so the whole screen changes mode at one width |
| `@media (max-width: 639px)` create-plan modal | **unchanged** | the overlay is `position: fixed` on `<body>`, outside the shell — not a descendant of either container, and genuinely viewport-sized. Verified in the DOM; do not "fix" it |
| detail header hidden below 767 | hidden by **placement** (`.table-listing__grid > .table-detail`) | the row stacks at 1023 but TableDetail hides its header at 767, so between 768–1023 the inline detail would have shown a header duplicating the card above it. Placement is the real condition anyway |
| `matchMedia('(max-width: 767px)')` in JS | container width + `ResizeObserver` | JS cannot read a container query, and `matchMedia` reintroduces the exact bug. `STACK_MAX = 1023` must stay in step with the CSS |

The `ResizeObserver` is guarded to re-run only when the stacked/side-by-side state actually flips,
since it fires on every pixel. A plain `resize` listener would not have worked at all: the column
changes width when the menu docks, with no window resize.

### Verified (live page + headless, 2026-08-27)

Swept the page content box from 1783 down to 378: **no text spilling, no boxes escaping their
parents, no horizontal overflow at any width.** Padding 32 → 12 at ≤767. Row stacks at ≤1023.
Search capped at 320 in a single-row toolbar and full-width when stacked. Component demos re-checked
wide and narrow (TableCard 16/12, TableListing row/column + 16/12 root padding, TableDetail header
shown/hidden) — they needed a `cs-page` wrapper on their own `<body>`, or their narrow rules could
never have fired. ControlScreen and ControlHub re-verified for the shared `cs-main` change.

### Still viewport-keyed, deliberately

The shell's own sidebar and ActionsMenu device swaps, and the create-plan modal. Both are genuinely
device/viewport concerns. 65 other files in the repo still carry viewport media queries — see
CLAUDE.md §4a.

### Two scroll models, one per layout (2026-08-27)

Reported: "I can't scroll the table listing." Measured — a **1816px** card grid inside a listing
clipped to **715px** by TableListing's own `overflow: hidden`, with `.seating-plan { flex: 1 0 0 }`
pinning the row to the page height so the page had nothing left to scroll. Every table below the
fold was unreachable.

**This clipping predates the container-query change** — it was already wrong at a 402px viewport.
What the change did was make the stacked layout reachable at any column ≤1023, so it stopped being
a phone-only problem.

| Layout | Who scrolls | How |
|---|---|---|
| Side by side (>1023) | the **card grid** | the listing's height is constrained by the row so the detail panel stays put beside it, so the grid must be the scroller: `flex: 1 1 auto; min-block-size: 0; overflow-y: auto` |
| Stacked (≤1023) | the **page** | `.seating-plan { flex: 0 0 auto }` — natural height — and the grid reverts to `overflow: visible` so it grows to its content |

Figma's mobile frames show page-scrolling explicitly: the listing is 2019px tall in an 874px frame,
and in the tapped frame it sits at **y = −79** because the page has scrolled.

`overflow-x: hidden` is paired with `overflow-y: auto` deliberately — `auto` on one axis computes the
other to `auto` too, which would offer a pointless horizontal scrollbar. The listing root already
clips shadows to its radius, so clipping at the grid costs nothing.

The scroller lives in this template rather than in TableListing because **this template is what
constrains the height**; the component's own demo is auto-height and must stay unopinionated.

**Verified:** at a real 402px viewport the page scrolls 1960/834 and the last of 12 cards is
reachable; at a 1100px column the grid scrolls 964/604; at 1847 nothing needs to scroll. Swept
1847 → 402 with no text spilling, no boxes escaping, and no horizontal overflow.

### Chrome gains a shadow once the page scrolls (2026-08-27)

This screen deliberately has **no header block** and **no chrome hairline** — both earlier designer
calls. That left nothing to separate the chrome from content sliding under it. Designer's fix: a
shadow on scroll.

`--ai-shadow-sm`, applied via an `is-scrolled` class that `SeatingPlanner.js` toggles from the
**page's** `scrollTop`. The page is the scroller that actually moves content under the chrome; when
the layout is side by side the card grid scrolls inside its own box instead and nothing passes under
the chrome, so no shadow appears — correct, not an omission.

Implementation notes: the listener is `{ passive: true }` (it never calls `preventDefault`, and
without the flag it can block the scroll it only observes); the DOM is touched only when the state
flips, since `scroll` fires continuously; and a `ResizeObserver` re-checks, because switching to the
side-by-side layout can otherwise leave `is-scrolled` stuck on with nothing scrolled.

Verified: no shadow at `scrollTop: 0`, `--ai-shadow-sm` once scrolled, back to none on return, and
the chrome's bottom border still removed. The **dark** token applies correctly on this dark screen
(`rgba(0,0,0,0.149)` / `0.255` from `tokens-shadows.css:82`, not the light `0.06` / `0.1`).

A measuring note: read immediately after the class flips, the computed `box-shadow` is a fully
transparent two-layer value — that is the 0.15s transition at t=0, not a broken token. Read after
the transition completes.

### Create-plan grid: two columns on mobile (2026-08-28)

Reported broken by the stepper adoption, and Figma updated in response. Three columns stopped
working the moment Tables and Seats became steppers: each spends 64px of its width on the two
buttons, so at the mobile modal size the number field was crushed to about **20px**, "Table Shape"
wrapped onto two lines and the Select truncated to "R…".

Figma's updated mobile frame `3515:228092` moves to two columns with Table shape on its own
full-width row. **Desktop deliberately stays at three** — frame `3515:212885` still places all three
on one row — so this is a breakpoint change, not a redesign, and the base rule is untouched.

| | Figma mobile | Built | Figma desktop | Built |
|---|---|---|---|---|
| modal | 338×425 | 338×**421** | 512×418 | 512×418 |
| body padding | 16 | 16 | 24 | 24 |
| grid | 304 | 304 | 462 | 462 |
| Plan name / Room | 304×56 | 304×56 | 462×64 | 462×64 |
| Tables / Seats | 146 @0 / @158 | ✓ | 146 @0 / @158 | ✓ |
| Table shape | 304, own row @216 | ✓ | 146 @col316 | ✓ |

Every figure matches except the modal's own height, 421 against 425 — 4px of text metrics, the same
class of difference already recorded for this modal. The number field went from ~20px to **80px**.

Gaps are unchanged and were re-read from the updated frames rather than carried over: column 12
(`--ai-spacing-4`), row 16 (`--ai-spacing-5`) at both sizes.

`.create-plan__shape` takes `grid-column: 1 / -1` at ≤639 rather than using `.create-plan__wide`,
because that class means "always full width" and shape is the one field whose span differs by
breakpoint.

**Label case:** the new frame reads "Table **s**hape". Changed to match — consistent with the
earlier call to build "Seats / table" lowercase when the two frames disagreed. Still worth the
designer settling capitalisation across the set rather than per frame.

**Flagged — demo values disagree with an earlier decision.** The updated frame shows Tables=10 and
Seats=12; the build has Tables=12 and Seats=10, because the designer explicitly chose "default 10,
keep 6–12" for SEATS when those fields were made real. Left as decided; the frame is presumably
just placeholder content.

## Top nav keeps 48px on this screen (2026-08-28)

`TopNavigation.css` collapses the bar to `--ai-spacing-8` (40px) below a 767px container. The
Seating Planner opts out: its mobile frame `3515:213426` draws `CCHeaderGroup` at **48px** with the
`CCTopNavigation` instance filling it at 48 — the same height as desktop. Both nodes measure 48
there; this was read off the frame, not inferred from the desktop value.

Scoped in `SeatingPlanner.css` with the same `.cc-control__main:has(.cc-control__page--seating)`
idiom already used for the chrome's missing bottom rule and its scroll shadow, so ControlScreen and
ControlHub keep the 40px collapse. Verified: at 390px this screen's bar is 48px and its chrome is
48px, while ControlScreen's bar is 40px at the same width.

Three classes (`:has()` contributes its argument's specificity) against the one-class rule inside
TopNavigation's `@container`, so it wins on specificity — it does not depend on file order, nor on
which container that unnamed query resolves against.

It also matters beyond the bar: this screen's chrome height is already pinned to 48 in the design
(the reason the chrome's bottom border was removed — it had been rendering 49 against Figma's 48).
Letting the bar collapse to 40 would leave the chrome 8px taller than its content.

## Edit Plan modal (2026-08-28)

Figma **3515:176248** desktop / **3515:227054** mobile, both named "Edit Plan". A modal over the
existing plan screen — the shell, header and table listing are unchanged.

**A separate modal from create-plan, by the designer's decision.** It is that modal minus Tables,
Seats / table and Table shape, so a two-mode version of one modal was the alternative; the designer
chose separate markup. The duplication is therefore deliberate: the help toggle and both fields
mirror `.create-plan__*`. If a third plan modal appears, that is the point to extract the toggle
into a shared class rather than copy it a third time.

| | Edit Plan | create-plan |
|---|---|---|
| fields | Plan name, Room / location | + Tables, Seats/table, Table shape |
| subtitle | **none** (Figma hides Sub Title and Sub Text) | the event name |
| primary button | **Save** | Create plan |
| help toggle | yes, at **every** width (designer) | yes |

### Everything structural comes from Modal

Nothing about the box is re-declared: width `--ai-size-9` (512px), `--ai-radius-lg`,
`--ai-surface-elevated-1` and the 24px header/body/footer padding are all Modal's, and all four
appear in this frame's own `get_variable_defs`. Measured after the build: **512×332 desktop**, which
is Figma's frame size exactly. Mobile renders 338×300.

Only two things are local — the absolutely-positioned help toggle, and the 16px gap between the two
fields (`--ai-spacing-5`, derived from the frame: Inputs at y=0 and y=80, 64 tall each).

### Trigger and behaviour

Opened by a **room card's pencil**, pre-filled from that card (designer's choice; both frames show
the pencil, and the mobile frame highlights that card).

The hook is an explicit `data-ep-open`, not the icon or the aria-label, for two independent reasons:
`createIcons()` **consumes** `data-lucide` — the `<i>` becomes `<svg class="lucide-pencil">` — so an
icon-attribute selector silently stops matching after init; and `aria-label^="Edit"` would also
catch all **twelve** TableCard pencils on this screen. There is exactly one room-card edit button
here and thirteen "Edit …" buttons in total.

Saving does four things, all verified:

| | before | after |
|---|---|---|
| room card name | Main Ballroom | Grand Hall |
| toolbar active-plan label | Main Ballroom | Grand Hall |
| edit button aria-label | Edit Main Ballroom | Edit Grand Hall |
| stored room (`data-ep-room`) | — | Level 2, East Wing |

The toolbar sync is guarded twice: only when the edited card is `--selected`, and only when the
toolbar's current text still matches the *previous* name — so renaming an inactive card leaves the
header alone, and a stale label is never overwritten with the wrong plan's name.

**The room round-trips via `data-ep-room` on the card.** RoomCard has nowhere to *display* a room
(it shows tables, seats and a progress bar), so without stashing it the field would open blank every
time and silently discard whatever was typed. The manifest's `seating-edit-plan` row documents the
prototype as updating the room on save, so dropping it would have been a regression against
documented behaviour rather than a simplification.

### Mobile is a real variant, not a narrower box

Missed on the first build (2026-08-28) — the modal rendered desktop internals inside a narrower
frame. `3515:227107` specifies its own metrics, and every one now matches:

| | desktop `3515:176618` | mobile `3515:227107` |
|---|---|---|
| Modal | 512×332 | **338×276** |
| ModalHeader | 65 | **57** |
| body / Content Slot inset | 24 | **16** |
| Input box | 64 (40px field) | **56 (32px field → `--sm`)** |
| field gap | 16 | 16 (unchanged) |
| Modal Footer | 73 | **57** |

Built and measured: desktop 512×332 / 65 / 24 / 64 / 16 / 73, mobile 338×276 / 57 / 16 / 56 / 16 /
57 — exact on both.

**Modal.css already did most of it.** Its own `@media (max-width: 639px)` block sets the 16px
header/body/footer padding and steps the title down, and all of that matched the frame already. The
only gaps were the two things a media query cannot express as classes: the Inputs at `--sm` (32px
field, 13px label and value) and the footer buttons at `--sm` (32px, 12px).

**Those rules are SHARED with create-plan rather than copied.** The two modals are separate by
design, but this replication is pure geometry and identical for both, and the values had already
drifted once (`--ai-spacing-3` → `-4` on 2026-08-28). A second copy would have re-armed exactly that
trap, so `.edit-plan__fields` and `.edit-plan__footer` were added to the existing selectors instead.
That is a shared implementation detail, not a walk-back of the separate-modal decision, which was
about markup and naming.

### Divergences, both minor and deliberate

- **Room placeholder** reads `e.g. Great room`, matching create-plan's convention on the same
  screen. Figma's field shows `Great Room` — but both of Figma's fields are drawn in placeholder
  grey, i.e. it is illustrating the empty state rather than specifying copy, and the name field
  really is pre-filled in the built version.
- **Help copy** for Plan name is "The name this plan appears under". Figma hides both Help Slots
  (the toggle's off state), so it specifies no hint text; the room's reuses create-plan's wording.

### Also seen in the desktop frame, NOT built

The toolbar's Management-Buttons group has **four** buttons (101 / 118 / 112 / 111) where the
current build has three — Room Layout 118, Add Table 101, Export 111. The 112px one is **new and
unidentified**, and nothing in the frame names it. Flagged rather than guessed at.


---

## Export (2026-09-09) — TASK-342305

Six frames: `1:32273` / `1:43681` (format menu, desktop / mobile), `1:14741` / `1:45146`
(PDF preview), `1:17021` / `1:46486` (CSV preview).

### The frames do not agree, and the disagreement is the design question

| Evidence | Says |
|---|---|
| `1:32273` + `1:43681` | Export is **one** Button instance; its menu holds **Excel (.xlsx)** and **CSV** |
| `1:14741` + `1:45146` | a **PDF** preview exists |
| `1:17021` + `1:46486` | a **CSV** preview exists |
| The brief (`seating-export`) | "**Split button** — PDF (default) / Excel (.xlsx) / CSV" |

PDF is in no menu, and Excel has no preview. Only one arrangement satisfies all four rows: PDF is
the split button's **default action**, which is why it is absent from the menu, and Excel previews
as the same six columns as CSV, which is why it has no frame of its own. Built that way at the
designer's direction (2026-09-09). The alternatives were a three-row menu (contradicts both menu
frames) or building exactly what is drawn (orphans the two PDF frames).

`Management-Buttons` here holds **three** Button instances — 118 / 101 / 111, i.e. Room Layout /
Add Table / Export. Worth recording against the note above from the Edit Plan frame, which found
**four** (101 / 118 / 112 / 111) and could not identify the 112px one: this frame does not have
it, so the fourth button is specific to that frame rather than a toolbar change.

### Below 767 the split has nowhere to live

`SeatingHeader.css` clips Export to a 32px icon and hides the chevron below container 767. With no
chevron there is no second half to open the menu, so there the **icon button opens the menu** and
PDF takes a third row. That mirrors Room Layout, which is already a toolbar button above 1200 and
a menu item below it — one action, two homes, never both visible.

The mode is chosen from the chevron's **rendered visibility**, not `matchMedia`: this toolbar's
width is set by the docked SidebarMenu and the ActionsMenu rail, not by the window (CLAUDE.md
§4a). A `ResizeObserver` on `.seating-header` keeps `aria-haspopup` / `aria-expanded` honest,
because the column can change width with no window resize at all.

**Flagged:** both menu frames draw two rows, not three.

**Updated 2026-09-09 (designer): the PDF row shows at EVERY width**, not just below 767. Above
767 it duplicates what the label half already does — a deliberate redundancy so one place lists
all three formats. Below 767 it remains the only route to the default format.

### DropdownItem gained a Size=xs — the menu is built from it

The menu rows are not the Dropdown component's default row. Figma's List node `3393:27558` is
built from `DropdownItem` instances at **32px**, and `get_metadata` on the component set
`2699:2149` shows why: it has grown a **`Size=xs`** axis (`3393:29188`, `3393:27610`,
`3393:29193`) that the built component never picked up. Added to DropdownItem as a formal variant
(Case A), not scoped here — see `DropdownItem.figma-notes.md`, which also records that the set is
missing its Default+Warning+xs cell.

One contextual override remains here: this menu binds `--ai-icon-secondary` on its row icons where
the component's own xs variant binds `--ai-icon-primary`. Both came from Figma. Scoped to
`.dropdown__panel--export` and flagged, because one row component carrying three different icon
colours reads as Figma drift rather than intent.

### One modal, three formats

The two preview frames are byte-identical apart from the title, the primary button label, and
which body is shown, so `#export-preview` serves all three formats rather than duplicating a
shell. **The preview follows the format:** PDF previews as the document it will produce, CSV and
.xlsx as the six columns they will hold, in the DS `Table`. A document preview for a spreadsheet
would misrepresent the file.

| Value | Figma | Built as |
|---|---|---|
| Modal width | 768 | `.modal--lg` (`--ai-size-11`) |
| Summary → panel gap | 16 | `--ai-spacing-5` |
| Document panel height | 384 | `--ai-size-7` |
| Table panel height | 448 | `--ai-size-8` |
| Panel padding | `p-25` | `--ai-spacing-6` (24) **+ the 1px border** — the usual Figma stroke arithmetic |
| Panel border / radius | 1px `#e5e9eb` / 8 | `--ai-border-secondary` / `--ai-radius-md` |
| Document title | Inter **Bold** 18/24 | `--ai-font-fixed-md`, `--ai-font-bold`, `--ai-leading-md` |
| Meta line | 12/20 `#667f89` | `--ai-font-fixed-xxs`, `--ai-leading-sm`, `--ai-text-contrast` |
| Table heading | **16** SemiBold /20 | `--ai-font-fixed-sm` — **measured, see below** |
| Heading trail | 12 Regular `#667f89` | `--ai-font-fixed-xxs`, `--ai-text-contrast` |
| Seat row | 14/32 | `--ai-font-fixed-xs`, `--ai-leading-lg` |
| `[Role]` | 14/32 `#335562` | `--ai-text-secondary` — colour only, not a size step |
| Empty-table line | 14/24 **italic** `#667f89` | the one italic run on this screen |
| List indent | 24 (marker hung outside a 646 box in a 670 list) | `--ai-spacing-6` |

The two panel heights **differ and are left differing** — both are real tokens, and the modals
differ to match (588 vs 652 tall).

### Mobile — CORRECTION (2026-09-09)

An earlier pass of this build read the mobile frames from **screenshots** and concluded that
neither preview stepped its type down. That was **wrong**, and the designer caught it. Read off
the frames properly, mobile steps five values in the body and the modal's own chrome steps too:

| Value | Desktop | Mobile (`1:45146` / `1:46486`) |
|---|---|---|
| Summary | 14/24 | **13**/24 |
| Document title | 18 Bold | **16** Bold |
| Table heading | 16 SemiBold | **14** SemiBold |
| Seat row + its `[Role]` | 14/32 | **13**/32 |
| Document panel padding | 24 (`p-25`) | **16** (`p-17`) |
| Modal title | 18 | 16 — Modal's own Size=sm block |
| Header / body / footer padding | 24 / 24 / 24 | 16 / 16 / 16 — Modal's block |
| **Footer buttons** | h-40 / px-16 / 14 | **h-32 / px-12 / 12** — see below |

What does **not** step, each checked rather than assumed: the meta line (12/20), the heading's
trailing type and occupancy (12), the **empty-table line (14/24 — it stays 14 while the seat list
beside it drops to 13**, which is Figma's own inconsistency, followed here), both panel heights
(384 / 448), and **every CSV cell** — whose desktop metrics are exactly why the table scrolls
sideways on a phone instead of reflowing, which is what frame `1:46486` draws.

Keyed to `@media (max-width: 639px)`, matching Modal's Size=sm switch, so the dialog's chrome and
its contents step together. `@media` is right here despite CLAUDE.md §4a: this is a
`position: fixed` overlay, so it genuinely is viewport-sized.

Two values were missing at **both** sizes and are now correct: the meta line carries 6px above it
(its paragraph is 26 tall around a 20px line) and the empty-table line 8px (32 around 24).

**Flagged, deliberately not encoded:** on the mobile frame the FIRST table heading has 16px above
it (paragraph 36 tall) where the other eleven have 24 (44 tall), and desktop gives all twelve 24.
Eleven consistent headings beat one outlier, so 24 stands at both sizes.

### The bug the mobile pass exposed: `.modal__body > p`

The mobile summary override did not apply, and the cause was **specificity, not the media query**.
`Modal.css` carries `.modal__body > p { font-size: --ai-font-fixed-xs; … }` at **(0,1,1)**, which
outranks a bare `.export-preview__summary` at **(0,1,0)** whatever the source order. Because
Modal's declared values are *identical* to the base rule here, desktop looked perfectly correct
and hid the problem completely — only the 13px mobile override lost, silently.

Modal.css warns about this in a comment directly above that rule. Both summary rules now sit at
(0,2,0) via `.export-preview__body > .export-preview__summary` so they travel together.

Worth noting how it was found: not by reading the CSS, but by enumerating every matching
`font-size` declaration for the element with `document.styleSheets` and printing them in source
order. The winning rule was the one from a different stylesheet that never appeared in any
grep of this file.

### The 16px heading was measured, not read

`get_design_context` reports the "Table 1 Head table · 10/10" node as `text-[0px]` — its sentinel
for a mixed-size run — so the size of the "Table 1" run is simply absent from the export. Rather
than assume 14 (the size either side of it), it was solved from the node's own **161px** width
against Inter metrics: 16px SemiBold gives 160.84 and the next candidate is 3px out. The metrics
were validated first on three nodes whose sizes Figma *does* report (311 → 310.08, 469 → 468.48,
253 → 252.55), so the solve rests on a calibrated ruler. The stray `text-[16px]` span on the
space between the runs is the same 16px run showing through.

### Both bodies are built from the DOM

Neither preview is authored in the markup — `readPlan()` reads the twelve cards for names, counts
and per-role legends, and the TableDetail panel for named occupants, at open time. So the preview
cannot claim something the plan does not say: add a table, delete one or unseat somebody and the
counts, the meta line and the row set all follow.

Two consequences worth knowing, both in the manifest:

- **Named occupants exist for one table only** (`seating-export-occupant-coverage`). There is no
  occupant model behind this screen. Nothing is invented to fill the gap.
- **The TYPE column has no source** (`seating-export-table-type`) — the cards draw no TableType
  chip. Figma's own Table 11 heading is untyped, so the presentation is a drawn state.

The summary line reads **"12 tables · 6 seated people"** on this page where Figma's frame says
101 — because this page holds six seated attendees. The preview describes the plan, not the frame.

### Verified (headless Chrome over HTTP, 2026-09-09)

At 1600: `mode=split`, chevron rendered, `-1px` shared edge, modal **768.0**, document panel
**384px** `overflow-y: auto`, padding 24 + 1px border + 8px radius, **12 headings / 1 list / 11
empty-lines** (exactly the seeded plan), heading `16px 600` with `padding-top: 24px`, list
`14px/32px` indent 24, menu showing **only Excel and CSV**, row height **32.0**, padding `4px 8px`,
`13px 500`, 12px icon, panel `min-width: 160px` / `padding: 8px`; CSV panel **448px**, six columns,
`th` `12px 600` `0.6px` uppercase sticky, `td` `14px` `12px 16px`.

At 600 (header container 509): `mode=menu`, chevron **not rendered**, label **32×32** with its
radius restored, `aria-haspopup="menu"` and `aria-expanded` flipping false → true, and the PDF row
opening the preview.

Re-verified at **390** after the mobile corrections: modal 326 (390 − 2×32), title 16, header
12/16, body 16, footer button 32 / 0 12 / 12, summary 13, panel padding 16 at height 384,
document title 16, meta 12 with 6 above, heading 14 with 24 above, trail 12, list 13/32, role 13,
empty line 14 with 8 above; CSV panel 448 with desktop cell metrics and a real horizontal
overflow (591 > 290). Desktop re-checked in the same run and unchanged. The Modal footer change
was spot-checked on delete-table, table-form, copy-plans and delete-plan — all four now 32 / 0 12
/ 12 at 390.

Download: the CSV blob really is produced (`text/csv;charset=utf-8`,
`main-ballroom-seating.csv`), 1 header + 6 rows, and a company name set to `Acme, "Big" Ltd`
serialised as `"Acme, ""Big"" Ltd"`. PDF produced **no blob** and toasted that it is server-side.

Measuring the menu row needed care: `querySelector('.dropdown-item--xs')` returns the **PDF** row,
which is `display: none` above 767, so the first probe reported a 32px row as **0.0** — a hidden
sibling reading exactly like a broken rule. The probe now filters to rows with client rects.

### Additions and divergences

- **Sticky column headers** on the CSV preview. Figma clips the whole table, header included, so
  scrolling to row 60 of 100 would leave six unlabelled columns — which defeats a preview whose
  job is to show which column holds what. Flagged as an addition Figma cannot express.
- **Focus lands on the close button**, not the scroll panel. Landing on the panel would let the
  arrow keys scroll immediately, but the panel carries a `:focus-visible` ring and Figma draws
  that border plain grey — so a mouse user risked a brand ring around the preview on a heuristic
  this code does not control. The panels keep `tabindex="0"`, so one Tab reaches the scroller.
- **The menu's shadow.** Figma draws `0 4px 6px rgba(0,0,0,0.08)` on this panel, which matches no
  shadow token; `.dropdown__panel`'s own `--ai-shadow-md` is used instead of inventing one.
  `--ai-shadow-md` *does* match Figma's `light/shadow-md` effect exactly, so the panel is
  consistent with every other Dropdown on the screen — just lighter in Figma than in code.
- **The plan card now visibly disagrees with the export** — "6/148" against the export's "6/120".
  Pre-existing, and the export is the one derived from what it exports
  (`seating-export-plan-capacity`).

---

## Room Layout (2026-09-09) — TASK-344760

Six frames: `1:20655` / `1:49180` (Empty), `1:24161` / `1:53040` (Image), `1:27691` / `1:55622`
(PDF), desktop / mobile. Built as `#room-layout` + the `roomLayout` IIFE.

**Frame naming defect:** `1:54336` is named **"Room Layout / Image"** but contains the **PDF**
state — FileText icon, `grosvenor-great-room.pdf`, `PDF · 256 KB`, the PDF note. The name is
stale; the content is what was built from. (It is also a duplicate of `1:55622`'s content.)

### The empty state IS DragDropFile — verified, not assumed

Figma's dropzone matches the DS component on every property, so the component is used rather than
re-implemented:

| Property | `DragDropFile` | Figma `1:22396` |
|---|---|---|
| min-height | 280 | 280 |
| border | 2px dashed `--ai-border-secondary` | same |
| radius | `--ai-radius-lg` | 16 |
| padding | `--ai-spacing-7` (32) | `p-34` = 32 + the 2px stroke |
| gap | `--ai-spacing-5` (16) | 16 |
| disc | 48, `--ai-surface-brand-soft-extra`, `--ai-radius-full` | same |
| disc icon | 24 (`--ai-icon-size-lg`), `--ai-icon-brand` | 24, Figma binds `--ai-surface-brand` |
| `__title` | 14 / `--ai-leading-md` / `--ai-text-secondary` / centred | same |

Only the **copy** is this screen's, so only the copy is scoped here. Its stylesheet was **missing
from this page** and is now linked — the third time on this screen (after SeatingToast and
ColorPickerInput), which is why it is now checked rather than assumed.

**Token note, flagged:** Figma binds `--ai-surface-brand` for the disc icon's stroke, where
`--ai-icon-brand` exists with the identical value (`#0094ad`) and is the semantically right token.
The component already uses `--ai-icon-brand`, so the render is correct and nothing was changed —
but the Figma variable should be re-bound.

### Only the copy and the second line are scoped

`DragDropFile.__subtitle` is 12px over `--ai-text-contrast`; this screen's second line is 14px over
`--ai-text-secondary`, so it gets `.room-layout__hint` rather than bending the component.

**Token gap, resolved:** that line's line-height is `1.4` (unitless, ≈19.6px at 14px) with no
matching `--ai-leading-*`. The line above it is an explicit `--ai-leading-md`, so 1.4 reads as
Figma's "Auto". Resolved to **`--ai-leading-sm` (20px)** at the designer's direction 2026-09-09.

### Three states, one dialog

512 wide — `.modal`'s own default (`--ai-size-9`), no size modifier. Only the footer's primary
label changes with state; Cancel and the X are constant and there is **no Save**, the live model
`#table-types` already uses.

| State | Footer primary | Body |
|---|---|---|
| Empty | **Upload PDF / image** | the dropzone |
| Image | **Replace** | preview box, then filename + trash |
| PDF | **Replace** | document card (icon, name, `PDF · 256 KB`, Open, trash), then the note |

**Remove lives in the body, not the footer.** All three frames put the trash inside the card /
filename row; no frame draws a footer Remove. The recorded spec said "Replace + Remove" in the
footer — Figma disagrees and Figma was followed.

### Values

| Element | Desktop | Mobile |
|---|---|---|
| Panel gap (Content Slot) | `--ai-spacing-3` (8) | **`--ai-spacing-2` (6)** |
| Dropzone line 1 + hint | 14 | **13** |
| Dropzone padding / height | 32 / 280 | 32 / 280 — **unchanged** |
| Preview padding | `--ai-spacing-7` (32) | **`--ai-spacing-5` (16)** — Figma `p-17` = 16 + 1px |
| Preview bg / border / radius | `--ai-surface-minimal` / 1px `--ai-border-secondary` / `--ai-radius-lg` | same |
| Filename | 14 / `--ai-leading-md` / `--ai-text-secondary` | **13** |
| File row top space | `--ai-spacing-4` (12) | 12 — **unchanged** |
| Doc card padding / gap | 24 / 16 | **12 / 12** |
| Doc name | 14 **SemiBold** / `--ai-leading-sm` / `--ai-text-primary` | 14 — **unchanged** |
| Doc meta | 12 / `--ai-leading-sm` / `--ai-text-contrast` | 12 — **unchanged** |
| Doc actions gap | `--ai-spacing-1` (4) | 4 |
| Note | 14 / `--ai-leading-md` / `--ai-text-secondary`, pt 12 | **13 / `--ai-leading-xs` (16), pt 8** |

The **image filename and the doc filename are styled differently** (14 Regular `--ai-text-secondary`
vs 14 SemiBold `--ai-text-primary`) and the doc name does **not** step down while the image one
does. Two states, two treatments, both followed rather than unified.

`@media (max-width: 639px)`, matching Modal's own Size=sm switch, so the chrome and the contents
step together. `@media` rather than `@container` because a `position: fixed` overlay genuinely is
viewport-sized (CLAUDE.md §4a).

### The preview box hugs its image, capped at 280

Figma's two frames disagree: desktop draws a fixed 280 with the mock image overflowing its own
32px padding, mobile hugs at 16px. Hugging with a `max-block-size: var(--ai-size-5)` cap on the
image reproduces both for their own artwork and behaves for a real upload — a wide, short plan does
not sit in a half-empty box, and a tall one cannot push the dialog past Modal's
`max-block-size: 100%`. Designer's direction, 2026-09-09.

### Both triggers are bound, because exactly one is live at a time

`SeatingHeader` shows the toolbar button above container 1200 and the overflow-menu item below it.
Measured with the panel open:

| Width | Toolbar button | Menu `<li>` |
|---|---|---|
| 1600 | shown | `display: none` |
| 1100 | hidden | `display: block` |
| 390 | hidden | `display: block` |

Binding one would have left the control dead at the other widths — the exact trap
`seating-header` already warns about.

### Nothing leaves the browser

An image is read with `FileReader` and previewed as a data URL; a PDF gets an object URL so its
Open link genuinely works, revoked on remove or replace. Attachments are held **per plan**, keyed
on the plan name the dialog is titled with, so switching plans switches the layout.

Non-image, non-PDF files are refused **by name**, and the check is on the file rather than on the
`accept` attribute — a drag bypasses `accept` entirely. A drop anywhere else in the dialog is also
swallowed, because an unhandled file drop makes the browser navigate away from the app.

### Additions and divergences

- **A visible focus ring on the dropzone.** The component's file input is `0×0` / `opacity: 0` —
  correctly focusable, but its own ring is invisible, so a keyboard user got no indication. The zone
  now rings on `:focus-within`, reusing the component's own drag-over brand border. WCAG 2.1 §9;
  not drawn in Figma.
- **Filename ellipsis on desktop.** Figma's mobile frame truncates the doc name and the desktop one
  does not, so a long filename would escape the row at the wider size. Applied at both sizes and to
  both filenames, per CLAUDE.md §4a — fix overflow intrinsically, not at a breakpoint. The full name
  stays reachable via `title`.
- **`data-rl-file-open`, not `data-rl-open`,** on the card's Open link. `data-rl-open` is the pair of
  modal triggers, and a delegated handler matched the link too, re-opening the dialog on top of
  itself. Caught by counting the hook after wiring — the same collision class as `data-ep-close`.
- **No "has a layout" dot** on the toolbar button. The prototype added one so you could tell without
  opening the dialog; no frame draws it, so it was not built. Worth a designer decision.
- **Pre-existing hardcodes in `DragDropFile`,** not changed here: `min-height: 280px` (=
  `--ai-size-5`) and the disc's `width/height: 48px` (= `--ai-spacing-9`). Both have exact tokens and
  the file's own comment says "no token" for the first, which is no longer true. Flagged rather than
  edited, since nothing is visually wrong and the component has its own consumers.

### Verified (headless Chrome over HTTP, 2026-09-09)

Desktop 1600 — modal **512**, title 18 / subtitle 14, dropzone `280 / dashed / 2px / 32px / 16px`,
disc `48×48` `rgb(237,245,245)` radius 100px, disc icon 24px `rgb(0,148,173)`, line 1 14/24, hint
14/20 centred, footer "Upload PDF / image".

A `.csv` drop was refused by name and left the empty state up. An SVG drop produced a `data:` preview,
the filename with `ellipsis/nowrap`, preview `32px` / `--ai-surface-minimal` / radius 16, the 280 cap
on the image, a hugging box, and the footer flipped to "Replace". A 256,000-byte PDF drop produced
`grosvenor-great-room.pdf` / **`PDF · 256 KB`**, a `blob:` href with `target="_blank"`, card `24px`
gap `16px`, doc icon 24px `rgb(102,127,137)` (`--ai-icon-secondary`), name 14/600, meta 12, note
14/24/12, trash `32×32`. Trash returned to empty, reverted the footer label, toasted, and moved focus
to the file input; closing returned focus to `.seating-header__btn--layout`.

Mobile 390 — modal **326** (390 − 2×32), title 16 / subtitle 13, footer button 32/12, dropzone
unchanged at 32/280, line 1 and hint **13**, panel gap **6**, preview padding **16**, filename **13**,
file row top space 12, card **12/12**, doc name 14 and meta 12 (neither steps), note **13/16/8**.
At 1100 the menu item opened the **512** desktop modal with the hint still at 14.

### Revisions after designer review, 2026-09-09

**1. The remove buttons had a grey box at rest — and the cause is a CC token, not this screen.**

Figma binds `--ai-btn-secondary-bg` (transparent) with no border on both trash buttons
(`1:29441`, `1:25922`), and `.btn--tertiary` already reads its rest background from
`--ai-btn-tertiary-bg` — which is `rgba(0, 0, 0, 0)` in `tokens.css`, `tokens-dark.css`,
`tokens-chat.css` and `tokens-chat-dark.css`. But **`tokens-cc.css` sets it to `#e5e9eb`**, and
this screen runs in the CC mode, so every tertiary button in the Control Centre paints a grey box
at rest.

The CC trio reads like a shifted ramp rather than a deliberate choice:

| Mode | rest | hover | pressed |
|---|---|---|---|
| `tokens.css` (and dark, chat, chat-dark) | transparent | `#f8fafc` | `#e9eef4` |
| **`tokens-cc.css`** | **`#e5e9eb`** | `#f2f4f5` | **`#e5e9eb`** |

Rest and pressed are the *same value*, and hover is *lighter* than both — so hovering makes the
button paler and pressing returns it to rest, which inverts the affordance. Read as
`transparent → #f2f4f5 → #e5e9eb`, the CC ramp matches every other mode exactly, which suggests
the rest slot was given the pressed value.

Fixed by overriding **only the rest state** to transparent, scoped to this dialog's two remove
buttons. Hover, pressed and focus still come from the component, so the override disappears on its
own once the token is corrected. Not fixed at source because `css/tokens-cc.css` is generated and
`FigmaTokens/*.json` is not hand-editable (CLAUDE.md §8, §11) — it needs a Figma change.

**Follow-on, flagged with numbers:** with rest transparent, the CC hover `#f2f4f5` is
*invisible* on the PDF card. Measured against the surfaces it actually sits on:

| Trash button sits on | Hover contrast | Per-channel delta |
|---|---|---|
| PDF card — `--ai-surface-minimal` `#f3f6f7` | **1.016:1** | 1, 2, 2 |
| Image filename row — the modal body, `#ffffff` | 1.103:1 | 13, 11, 10 |

So the image state gets a faint but real hover and the PDF card gets none. No hover colour was
invented to paper over it — for reference, CC's own pressed value (`#e5e9eb`) would read on the
card. Designer decision.

**2. The primary button is now a saved/draft control, not always "Replace".**

Reported as not feeling right, and the model the designer described is what is built:

| Draft vs saved | Label | Action |
|---|---|---|
| differs | **Save** | commit, toast, close |
| same, nothing saved | **Upload PDF / image** | open the picker |
| same, something saved | **Replace** | open the picker |

So opening an empty plan and picking a file turns the button into Save; opening a plan that
already has one shows Replace until the file is actually switched.

**The consequence worth naming: Cancel now discards.** It had nothing to undo when a pick
committed on the spot; now it does, so Cancel, the X, Escape and the scrim all drop the draft and
leave the saved layout untouched. **Removing is a draft change too** — inferred for consistency
rather than specified, so an accidental trash is recoverable by cancelling instead of being
instantly destructive. The success toast moved with it, from pick-time to save-time, because a
pick is no longer a commit.

`data-rl-upload` was renamed `data-rl-primary`, since the button now has three jobs.

**"Save" is not in Figma.** Its frames are static, so they cannot show a pending state; the two
labels they do draw are the two not-dirty cases, so this adds a state rather than contradicting
one.

Object URLs are released only when the item they belong to stops being reachable as either the
draft or the saved value — on save-over, on discard, and on remove.

### Re-verified (headless Chrome over HTTP, 2026-09-09)

Ten steps, each polled for the real state change rather than a fixed delay — the first attempt
used `setTimeout` and its assertions raced `FileReader`, which made a Save land while the draft
was still null and cascaded into nonsense output:

| # | Action | Result |
|---|---|---|
| 1 | open on an empty plan | `panel=empty`, primary **Upload PDF / image** |
| 2 | drop an image | `panel=image`, primary **Save**, `first.svg` |
| 3 | click Save | closed, toast *"first.svg attached to Main Ballroom."* |
| 4 | re-open | `panel=image`, primary **Replace**, `first.svg` |
| 5 | switch the file | primary **Save**, `second.svg` |
| 6 | Cancel, re-open | `first.svg` / **Replace** — the switch was discarded |
| 7 | trash | `panel=empty`, primary **Save** |
| 8 | Escape, re-open | `panel=image`, `first.svg` / **Replace** — the removal was discarded |
| 9 | trash + Save | toast *"Layout removed from Main Ballroom."* |
| 10 | re-open | `panel=empty`, primary **Upload PDF / image** — committed |

Trash background at rest measured `rgba(0, 0, 0, 0)`.

---

## The "Populated" baseline (2026-09-09) — spec for the working prototype

Design System file, `3515:202250` (desktop 1728×1139) and `3515:213496` (mobile 402×874), both
named **Populated**. This is the dataset the working prototype is to start from.

### Plans — four, not one

| Plan | Frame's counts | Treatment |
|---|---|---|
| **Main Ballroom** *(selected)* | 12 tables · 124/148 seated · 24 seats free | `--ai-surface-minimal` bg, `--ai-border-brand` |
| **Overflow Annex** | 6 tables · 41/48 seated · 7 seats free | `--ai-surface-primary` bg |
| **VIP Lounge** | 4 tables · 32/32 seated | **FullBadge**, progress fill `--ai-surface-success` |
| **Press Room** | 3 tables · **Empty** · 24 seats free | **no** progress fill element at all |

Card chrome: `min-w-[280px]`, `w-[290px]`, `p-[--ai-spacing-5]`, `gap-[--ai-spacing-3]`,
`--ai-radius-lg`, `light/shadow-xxs`. Progress track 6px, `--ai-surface-contrast`,
`--ai-radius-full`. Name 16px Bold with ellipsis; counts 12px (`--ai-font-fixed-xxs`)
`--ai-text-contrast`; "N seats free" 11px (`--ai-font-fixed-4xs`) SemiBold `--ai-text-brand`.

Note the counts line reads **"3 tables · Empty"** rather than "0/24 seated" when a plan holds
nobody — a distinct copy form, not a formatting edge case.

Mobile shows **two** cards in a horizontal strip (240×85 each), so the strip scrolls.

### Main Ballroom's tables — 11 of 13 visible in the listing viewport

| # | Name | Type chip | Sponsor | Role split | Seated |
|---|---|---|---|---|---|
| 1 | — | **Headline Sponsor** | Mastercard | A2 · VIP1 · Sp1 · Spo2 · **H1** | 7/10 |
| 2 | — | **Platinum** | Monzo | A2 · VIP1 · Sp2 | 5/10 |
| 3 | Table 3 | — | — | A2 · Sp1 · Spo7 | 10/10 **Full** |
| 4 | Table 4 | — | — | A7 · Sp1 · Spo2 | 10/10 **Full** |
| 5 | Table 5 | — | — | A1 · VIP1 · Sp1 · Spo1 | 4/10 |
| 6 | Table 6 | — | — | — | 0/10 |
| 7 | Table 7 | — | — | Sp1 · Spo1 | 2/10 |
| 8–11 | Table 8–11 | — | — | — | 0/10 |

Event bar: "The Card & Payments Awards 2026" at **22px** (`--ai-font-fixed-xl`) Bold, then
3 Feb 2026 / 386 attendees / Grosvenor House, London. Toolbar: "Main Ballroom" 18px Bold +
"**(72 Unassigned)**" 14px Medium `--ai-text-contrast`.

### The type chips are Gold and VIP with overridden labels

`TableType` has `--vip / --head-table / --gold / --silver / --bronze`. The baseline's chips read
**"Headline Sponsor"** and **"Platinum"**, which are not in that set — but the design context shows
them as instances of the **Gold** (`rgb(217,119,6)`, border `#f4d6b4`) and **VIP**
(`rgb(0,116,158)`, border `#b2d5e2`) variants with the *text* overridden.

That is consistent with the Table types dialog, where a tier's **label is editable data** and its
colour comes from the tier. So the model carries `{ label, variant }` per type rather than a fixed
enum — and the baseline's two labels want adding to that lookup's seed.

### Host is now drawn — and that settles an open question

Card 1's legend reads **`Host (1)`**. `seating-table-grid` had recorded the opposite as an open
question: *"Figma's legend omits Host though the collection and AttendeeCard both define it, so
settle whether a table can seat one."* Settled: it can.

`TableCard` had deliberately withheld the modifier for exactly that reason, with a comment saying
so. `--sp-host` already existed in all four seating palettes (`#f76b15` default), so only the
modifier was missing — and without it a Host segment fell through to the `--ai-surface-contrast`
default and rendered **identically to an empty seat**. Added 2026-09-09; the stale comment is
corrected. Measured on the live page: attendee `#0797b9`, vip `#ab4aba`, speaker `#4cbba5`,
sponsor `#5b5bd6`, empty `rgb(208,219,225)`.

`--empty` correctly has no modifier: the default *is* the empty treatment.

### Where the frame does not reconcile — the build must derive, not copy

Four places, all consequences of static art:

1. **`Empty (4)` on every 0/10 card.** An empty ten-seat table should read `Empty (10)`. The
   placeholder legend was never updated.
2. **`12 tables · 124/148 seated`** on the Main Ballroom card, against **13** Table Card instances
   and 130 seats in the listing. Already recorded separately as `seating-export-plan-capacity`,
   where the export's derived `6/120` visibly disagreed with the card's `6/148`.
3. **`4/ 10 seated`** on card 5 — missing space.
4. **Three toolbar buttons labelled Room Layout / Add Table / Add Table.** The third is Export —
   it is labelled Export in the export frames (`1:32273`) at the same 111px width. A stale label.

A data-driven build derives all of these, so they fix themselves — which means the prototype will
**correct** the frame in those four places rather than reproduce it. Worth knowing before comparing
the two side by side.

### Not yet resolved

- **`Unassigned.css` is not linked** on this page, and there is no tray in the markup at all — only
  the toggle and its label. Fourth stylesheet found missing on this screen after SeatingToast,
  ColorPickerInput and DragDropFile.
- **The unassigned pool size.** The toolbar says 72. Across all four plans the frame's own numbers
  seat 124+41+32+0 = 197 of 386 attendees, which would make 189 unassigned, not 72. So "unassigned"
  is not "event attendees minus seated" — it needs a definition before the pool can be derived
  rather than authored.

### Drag-and-drop and seat reordering (2026-09-09)

Built against the model, following `seating-drag-assign` and `seating-touch-placement` — the
prototype's documented behaviour, re-implemented rather than ported.

**Pick-then-place is the mechanism; drag is an accelerator.** That is the load-bearing decision,
and it comes straight from `seating-touch-placement`: *"pick-then-place is the mechanism and drag
is an accelerator for it… keyboard users cannot drag either."* Click or Enter picks a person up,
a fixed bar names them and offers Cancel, then a click or Enter on a seat, a table card or the
tray places them. Esc puts them down. `dragstart` sets the *same* `picked` state a click does, so
there is one set of rules instead of two that can disagree.

**Five placements, one function.** All of these land in `place()`:

| From | To | Result |
|---|---|---|
| pool | empty seat | seated |
| pool | table card | first free seat, or refused **"… is full"** |
| seat | seat | move, or **swap** when occupied |
| seat | pool | unseated |
| seat | another card | the fifth the brief implies |

A swap is a single simultaneous exchange, not remove-then-insert — the manifest warned that
modelling it as delete/insert is how the pair ends up in the same seat. **pool → occupied seat is
refused**, not one of the five: silently evicting somebody the planner never chose to move would
be worse than declining. A refusal **keeps the person in the air** so you can aim somewhere else
without picking them up again.

### The drag-over visuals were wrong — corrected 2026-09-09

I built the drag-over treatment from `seating-drag-assign`'s description — *"legal targets in
success tone, a 'Swap' label on an occupied seat"* — and painted every legal target green with a
Swap pill. **That text describes the PROTOTYPE, not the Figma build.** The manifest's `current`
field is a record of what the prototype did; reading it as a spec is
`feedback_no_prototype_spec_substitute` with a new disguise, because it does not *look* like a
prototype the way `src/prototypes/` does.

Worse, the real state already existed. **AttendeeCard has a formal `State=Dragged Over` axis** —
six variants, one per Type — and `.attendee-card--dragged-over` was already built and documented.
The component's own header names this module as the thing meant to toggle it:

> *"Confirmed with the designer 2026-08-25: the card is a DROP TARGET only, never a drag source.
> `--dragged-over` is a class the parent module toggles while an attendee is held over the card."*

| Type | Default | Dragged Over |
|---|---|---|
| Attendee / VIP / Speaker / Sponsor / Host | `--ai-surface-primary` bg, 1px solid `--ai-border-secondary` | **`--ai-surface-minimal` bg, 1px solid `--ai-border-brand`** |
| Empty | `--ai-surface-minimal` bg, 1px **dashed** `--ai-btn-secondary-border` | **same bg, 1px SOLID `--ai-border-brand`** |

Nodes: `3528:102567` Empty, `3474:89315` Attendee, `3474:89359` VIP, `3474:89337` Speaker,
`3474:89381` Sponsor, `3474:89293` Host. Measured: border `rgb(48,182,194)` (`#30b6c2`),
background `--ai-surface-minimal`, style solid.

#### …and then applied to too many cards — second correction, same day

The first fix used the right class and still got the behaviour wrong: it added
`--dragged-over` to **every legal seat**, lighting most of the list at once. The designer again:
*"you are highlighting all of the other attendees when dragging. it should only highlight the
table of attendee when it is being dragged over by the item being dragged."*

The state is named Dragged **Over**. It means the one card under the pointer — not "a card you
could legally drop on". That is the prototype's *"legal targets in success tone"* framing
surviving into a second attempt at the same feature, after the colour had already been corrected.

It is now applied by `markOver()`, driven by `dragover` / `dragleave` for the drag path and
`mouseover` / `focusin` for the click and keyboard paths, with an `overEl` guard so a `dragover`
storm does not re-scan the DOM on every event. Legality still gates it — an illegal target must
not light up, or the highlight promises a drop that `place()` then refuses.

**My own probe had asserted `--dragged-over on 9 seats` and I read that as a pass.** The test
encoded the misreading, which is why it caught nothing. A verification that restates the
assumption is not a verification.

**Removed with the green, each because Figma has no counterpart:**

| Invented | Why it went |
|---|---|
| the "Swap" pill | no such element in any Dragged Over variant |
| `.table-card--drop-legal` / `--drop-full` | **TableCard has twelve variants and no drag state** — State (Default \| Selected) × Type (Empty \| Populated \| Full) × Device. Its own CSS says "inventing a variant with no Figma counterpart is how drift starts" |
| `.unassigned--drop-legal` | Unassigned has two variants, empty and populated, no state axis |
| `.attendee-card--picked` source dimming | no Figma state, and the component is designer-confirmed as **never a drag source** |

A table card and the tray remain functional drop targets, because the brief asks for those
placements — they simply carry **no highlight** until one is designed.

Also corrected while here: the empty seat's action is Figma's **`btn btn--secondary btn--sm`
labelled "Assign"** (`3474:89216`), which AttendeeCard's own notes state. The renderer had used an
icon-only `user-plus` button.

### Two things still unspecified, and flagged rather than invented

- **A table card and the tray as drop targets have no designed state.** They accept a drop and
  say nothing. That is a real gap in the feedback, not a decision.
- **The "in the air" bar has no Figma counterpart.** It is kept anyway, and deliberately: a
  keyboard user cannot drag, so pick-then-place is their only path, and without a visible
  statement of who has been picked up the mode change is imperceptible (WCAG 2.1 §9). Keeping it
  is an accessibility floor, not a design choice — it wants a designed counterpart.
- **Seat rows are `draggable`,** which sits awkwardly against "never a drag source". The
  component means it has no built-in grab affordance; the template adds one so seat→seat move
  and swap work at all. Worth a designer ruling.

**Reorder** uses the up/down chevrons AttendeeCard already draws and styles — the first version of
the renderer had simply dropped them. Up/down swap with the adjacent seat, so moving into an empty
seat and trading places with an occupied one are one operation. Up is disabled on seat 1, down on
the last seat, and focus follows the row that moved rather than staying on the index — otherwise
pressing "down" twice moves two different people.

### The bug that made drag look impossible

`pick()` originally called `render()`. Nothing about the *data* changes when you pick somebody up,
but the renderer rebuilds the listing and the detail with `innerHTML` — which on `dragstart`
detaches the very element being dragged. The browser then had nothing to drag and no `drop` ever
fired. Worse, `dragend` also fired on the detached node, so `picked` stayed set and the next
ordinary click was silently treated as a placement.

Picking up now only decorates, via `decoratePick()` with a matching `undecorate()` kept beside it.
Two things fell out of the fix: drag works, and the keyboard path no longer loses focus on pick.

Decoration is applied **after** render rather than threaded through the templates, which is what
keeps the emitted markup byte-identical to the authored markup whenever nothing is in the air —
the property that lets export and the eight modals keep reading a DOM they recognise.

**Also guarded:** a card click must not change the table *selection* while somebody is in the air.
Without it, aiming at a table silently just re-selected it — the same trap
`seating-touch-placement` records as *"picking does not hijack table selection"*, in the other
direction.

### Verified (headless Chrome over HTTP, 2026-09-09)

**Highlight scope** (added after the second correction): with nothing picked, hovering lights
nothing. After picking seat 2, hovering seat 5 lights exactly `["5"]`; moving to seat 7 gives
`["7"]` and releases 5; hovering the source seat 2 gives `[]` because it is not a legal target;
hovering the tray gives `[]`. Under drag: `dragstart` `[]`, `dragover` seat 9 `["9"]`,
`dragover` seat 4 `["4"]`, `dragleave` `[]`, and the drop clears it. By keyboard with a pool pick:
focusing empty seat 8 gives `["8"]`, focusing an occupied seat gives `[]` — pool → occupied is
not one of the five placements. Escape clears.

Reorder: seat 1 down swapped with seat 2 and toasted "Hana Ashby swapped with Aisha Patel — seats
1 and 2"; up restored it; up disabled on seat 1.

Placement, by click: pool → empty seat 8 seated Yasmin Owens, detail 7/10 → 8/10, pool 72 → 71,
bar cleared. Picking a seated person lit **3** legal seats and **0** swap targets from the pool
(correct — pool picks cannot target an occupied seat), **11** legal cards and **2** full. Seat 8 →
seat 1 swapped and said so. A full card refused with "Table 3 is full — nothing was moved" and
kept the pick; Esc then cleared it. Pool → Table 2 took the first free seat, 5/10 → 6/10. Seat →
tray unseated and moved the pool 70 → 71.

By keyboard: Enter picked from the tray, Enter on seat 1 placed. By drag: seat 1 → seat 9 moved
the person and emptied seat 1. With a pick live, a card click placed instead of re-selecting, and
the detail stayed on Table 1.

### The table detail was missing its legend (2026-09-09)

Reported: *"the table detail doesn't match what has already been built. there is no legend showing
when attendees have been assigned, it should only not have a legend when no seats are assigned."*

Correct — `TableDetail` has a legend and the renderer never emitted one. The component was already
right; only the template's rendering was wrong. The same class of miss as the reorder chevrons: a
piece of the component's own markup dropped on the way into the renderer.

**The rule, from TableDetail's own notes** — `Type` names the count of distinct roles seated and
that is *all* that changes between its variants:

| Type | Legend | Seats filled |
|---|---|---|
| Default | **absent entirely** | 0 |
| 2 Roles | 2 items | 2 |
| All Roles | 5 items | 7 |
| Full | 5 items | 10 |

> *"The legend is derived, not stored. It lists the distinct roles actually seated, which is why
> Default has none at all rather than an empty container."*

So it is hidden rather than emptied when nobody is seated — `hidden` leaves both the layout and
the accessibility tree, which is what "none at all rather than an empty container" asks for.

**Two details that differ from TableCard's legend**, and are easy to get wrong by carrying one
over to the other:

- **No counts.** TableDetail reads `Speaker`, `Sponsor`; TableCard reads `Attendee (2)`.
- **Order is first appearance down the seat list**, not the fixed `ROLES` order TableCard's bar
  uses. That is what reproduces TableDetail's own demo, whose legend runs Host, VIP, Speaker,
  Sponsor, Attendee because its seat 1 is the host. The distinction is not arbitrary: TableCard's
  is a proportional bar where a stable left-to-right order matters, TableDetail's is a key to a
  list.

### Verified (headless Chrome over HTTP, 2026-09-09)

Table 1 (7 seated — A2 VIP1 Sp1 Spo2 H1): legend visible, five items
`["Attendee","VIP","Speaker","Sponsor","Host"]`, order confirmed equal to first-appearance down
the seat list, no counts present, five swatches, Host swatch `rgb(247,107,21)` = `--sp-host`.
Table 6 (0/10): `hidden` true, zero items, `offsetHeight` **0** — genuinely out of layout.
Table 3 (10/10, three roles): `["Attendee","Speaker","Sponsor"]`. Derivation checked by unseating
Table 1's only Host — the legend dropped to four items with Host gone.

Visual confirmation was only partial: `.ai-assistant` re-shows itself over the detail rail in a
headless screenshot, so only the legend's left edge (the teal Attendee and orange Host swatches)
was visible. The measurements above are the evidence, not the picture.

### The detail header was missing the sponsor and the tier chip (2026-09-10)

Reported: *"the table selected has a table type and a sponsor, but it's not being shown in the
table detail sheet."*

Correct, and the same miss as the legend one screen earlier — the renderer emitted only the name
and the seated count. TableDetail draws three more things in its header, on all four desktop
variants, and `TableDetail.html` had them all along:

```html
<div class="table-detail__titles">              <!-- a COLUMN, 4px gap -->
  <div class="table-detail__header-row">        <!-- ROW 1 — name, chip pushed right -->
    <h3 class="table-detail__name">…</h3>
    <span class="table-type table-type--gold">Gold</span>
  </div>
  <p class="table-detail__meta">                <!-- ROW 2 — full panel width -->
    <span class="table-detail__count">0 / 10 seated</span>
    <span class="table-detail__sep" aria-hidden="true">·</span>
    <span class="table-detail__sponsor">
      <i data-lucide="handshake"></i><span class="table-detail__sponsor-name">Monzo</span>
    </span>
  </p>
</div>
```

Three implementation notes, each of which bit:

- **The `·` is emitted with the sponsor, never before it.** An unsponsored table would otherwise
  read "10 / 10 seated ·". Most of the baseline is unsponsored, so this is the common case, not
  the edge one.
- **Emitted, not toggled with `hidden`.** `.table-detail__sponsor` sets `display: flex`, and a
  class rule outranks the UA stylesheet's `[hidden] { display: none }` — a `hidden` sponsor would
  have stayed visible. `__sep` would have hidden correctly (it only sets `flex-shrink`), which is
  exactly the kind of half-working result that reads as a rendering bug rather than a CSS one.
- **The chip is added and removed, never parked as an empty element.** `__header-row` is a flex
  row with an 8px gap, so an empty chip still takes a gap and shifts the meta line.

Absence of a tier or sponsor is not drawn anywhere in Figma — all four desktop variants show
both. The conditional follows TableCard's established rule: untyped means no chip, rather than an
invented empty state.

**Verified** (headless Chrome over HTTP): Table 1 → chip `table-type--gold` labelled "Headline
Sponsor", meta `7 / 10 seated · Mastercard`, one `__sep`, handshake `<i>` upgraded to `<svg>` by
`createIcons()`. Table 2 → `table-type--vip` / "Platinum" / Monzo. Tables 3 and 6 (untyped,
unsponsored) → no chip, no `__sep`, meta `10 / 10 seated` and `0 / 10 seated`. Selecting away and
back leaves exactly one chip, so the stale one is being removed. `data-sp-detail-count` survives
every rebuild — six places in `SeatingPlanner.js` read it live.

#### FLAG — a long tier label truncates the sponsor at 320px

Measured on the built panel:

| Table | Chip | Chip px | Meta box | Sponsor name box | Wanted | Truncated |
|---|---|---|---|---|---|---|
| 1 | Headline Sponsor | 128 | 150 | 36 | 65 | **yes — reads "Mas…"** |
| 2 | Platinum | 74 | 154 | 39 | 39 | no, with 0px of slack |

The panel is a fixed 320px (`--ai-size-6`), the chip sits on the row that bounds `__titles`, and
`__sponsor-name` carries `overflow: hidden; text-overflow: ellipsis`. So ellipsising IS the
component's designed response to overflow, per CLAUDE.md §4a — but "Mas…" is not a useful string,
and Table 2 shows the layout fits a short label with *zero* headroom.

This is structural rather than a tuning problem: **TableCard gives the sponsor its own full-width
line below the titles row, TableDetail puts it inline in the meta.** Figma only ever drew the
detail panel with a short tier label ("Gold") and a short sponsor ("Monzo"), so the collision was
never visible there.

**RESOLVED the same day — designer's call:** *"there should be 2 separate rows so the table type
doesn't impact the width."* The header is now row 1 = name + chip, row 2 = the meta line at the
full panel width, so the chip cannot affect the sponsor's box at all. The markup above already
reflects it. Fixed at the COMPONENT, not scoped to this template, so TableDetail's own demo gets
it too — and that makes Figma structurally behind the code, which is why the manifest item stays
open. Full reasoning, the before/after measurements and the Figma frame that shows the 155px
squeeze are in `TableDetail.figma-notes.md` § "The header is TWO rows".

### TableCard's sponsor name was unstyled — the renderer dropped its wrapper (2026-09-10)

Reported: *"table card styling for sponsors is not correct"* against `3470:85480`.

**TableCard itself is correct.** Audited the whole sponsor row against Figma and every property
matches — this was the renderer, which emitted the name as a bare text node instead of wrapping it
in `.table-card__sponsor-name`, so none of the row's typography applied.

`get_variable_defs` on the sponsor row (`3476:106259`) binds exactly nine variables, and
`TableCard.css` uses all nine:

| Property | Figma | CSS |
|---|---|---|
| row `gap` + `padding-top` | `--ai-spacing-2` (6) | ✓ both |
| icon size | `--ai-icon-size-sm` (16) | ✓ |
| icon colour | `--ai-icon-contrast` | ✓ |
| name family | `--ai-font-title` | ✓ |
| name size | `--ai-font-fixed-xxs` (12) | ✓ |
| name weight | `--ai-font-medium` | ✓ |
| name `line-height` | `--ai-leading-xs` (16) | ✓ |
| name colour | `--ai-text-contrast` | ✓ |

Also confirmed from the same fetch: `Header-Section` is a column with **no gap** — the 6px
separation between the title row and the sponsor row is the sponsor row's own `padding-top`, which
is how the CSS already had it. Figma's `h-[22px]` on the row is derivable (16px content + 6px
padding), as TableDetail's notes already record.

Measured on the card before the fix, against the spec above:

| | Rendered | Figma |
|---|---|---|
| `font-size` | **16px** | 12px |
| `font-weight` | **400** | 500 |
| `line-height` | **24px** | 16px |
| `color` | **#335562** | `--ai-text-contrast` |

Four properties wrong from one missing `<span>`. The row's own gap and padding measured correct,
which is exactly why it read as a styling problem rather than absent markup.

**After the fix:** 12px / 500 / 16px / Inter, icon 16×16. The two colours resolve to `#667f89`
(text) and `#99aab1` (icon) rather than Figma's `#64748b` / `#94a3b8` — those are the **CC-mode
values of the same tokens** in `tokens-cc.css`, and the card sits inside the Control Centre shell.
Figma's `get_variable_defs` resolves in Light mode, so the difference is the mode, not the token.

#### This was the third dropped element in a row, so the renderer was audited wholesale

The legend, then the sponsor line and tier chip, now this. All three read as styling or design
decisions rather than missing markup — nothing errors when a renderer omits an element.

So instead of waiting for a fourth report, every element class in all seven components' demos was
diffed against what `seating-app.js` and `SeatingPlanner.html` actually emit (matching
concatenated modifiers such as `'table-card__seg--' + key` on their stem, and combining both
sources so the statically authored chrome is not a false positive).

**Result: TableCard, AttendeeCard, RoomCard, TableDetail, Unassigned, SeatingHeader and
TableListing are all clean** — the sponsor-name span was the last one missing. Worth re-running
whenever a component gains an element; the check is recorded in the feedback memory
`feedback_renderer_drops_component_markup.md`.

### The Table form now saves the tier, and the pill takes the tier's own colour (2026-09-10)

Asked: *"when the table is edited can it save changes to table types, and apply the relevant
colour from the table types?"* Both were missing. Measured before: picking Silver and pressing
Save left `typeId` **null**, no chip appeared, and nothing survived a render.

Three separate gaps, and the third was the interesting one.

#### 1. A tier is a name AND a picked colour, not one of five presets

`seating-data.js` gave each type a `variant` naming one of TableType's five modifier classes.
That cannot express a recoloured tier — and recolouring is exactly what the Table types modal
does, since every row is a ColorPickerInput chip beside the name field. TableType is built for
this: its own CSS documents `--table-type-color` as the API and calls the modifiers *"just presets
carrying the tier colours Figma ships"*.

So `variant` is gone, replaced by `colour`, and both chips (card and detail rail) are rendered as
`<span class="table-type" style="--table-type-color: …">`. No preset class is used on this screen
any more; they remain the component's shipped defaults for its own demo.

#### 2. The registry is the modal, read live

Rather than copy label and colour into the data layer and sync them, `registry()` reads the
`[data-tt-row]`s on every render — `data-tt-slug` as the stable key, `[data-tt-name]` as the live
label, the colour input as the colour. A rename or recolour therefore lands with no sync step to
forget. `data-tt-slug` surviving a rename is what keeps a renamed tier attached to its tables.

The Standard row has no colour input, which is precisely how "no tier" is expressed — it yields no
registry entry, and a Standard table is `typeId: null`. The modal says the same thing by giving
that row neither a swatch nor a trash button.

**Two rows were added to the modal:** Headline Sponsor and Platinum. Figma's modal ships the five
generic tiers, but the Populated frame gives Tables 1 and 2 those two, drawn as relabelled Gold and
VIP instances — so they carry those colours. Without rows, the registry contradicted the plan: two
tables carried a tier you could not see, rename or recolour, and removing "Gold" would not have
touched the table actually using that colour. Tier rows are data, not design.

#### 3. Save wrote to the DOM, not the model — and open read attributes that no longer exist

The form predates the model and did its work by DOM surgery: rebuilding the card's HTML, adding and
removing seat rows, and patching the plan total `"13 tables · 124/148"` **with a regex** — the exact
drift the model was introduced to remove. So the submit is now intercepted in the capture phase
with `stopImmediatePropagation()`, which retires that path. The model is written, every count is
re-derived, and the HTML-snapshot Undo goes with it — a snapshot of markup the model no longer
agrees with would be restored only to be wiped by the next render. The Undo now reverses the
**fields**. Validation is reproduced rather than inherited, because stopping the handler stops its
checks too.

**The subtler half:** the legacy `open()` fills the form by scraping the card — tier and sponsor out
of `data-tf-tier` / `data-tf-sponsor`, attributes the old save wrote back and the model-driven
renderer never emits. Both fields therefore opened blank, and because Save now reads the form, a
blank field was a **deletion**: editing only a table's name silently cleared its tier *and* its
sponsor. Caught by probing a name-only edit rather than the tier itself. Fixed by filling every
field from the model on open, which removes the class of bug instead of one field at a time.

#### Verified (headless Chrome over HTTP)

| Action | Result |
|---|---|
| Open Table 1 | fields read `Table 1` / `10` / `Headline Sponsor` / `Mastercard`; menu offers all 8 tiers |
| Untyped Table 5 | opens on `Standard`, and saving untouched leaves `typeId: null` |
| Pick Silver on Table 3, save | `typeId: "silver"`, chip `Silver @ #abb2b8`, survives a re-render |
| Change only the name | tier, sponsor and capacity all intact |
| Change only the tier | name and sponsor intact, chip `Platinum @ #00749e` |
| Recolour Silver to `#ff00aa` | chip follows immediately |
| Rename Silver → "Second Tier" | label follows, `typeId` still `silver` |
| Remove the tier | falls back to Standard: `typeId: null`, no chip |
| Capacity 10 → 4 with 7 seated | seated 4, seat list 4 rows, pool 72 → 75 |
| Empty name | refused, modal stays open, error shown, model unchanged |

#### Still not wired, and deliberately so

- **`shape` and `host` are not in the model**, so they are left to the legacy behaviour. Nothing is
  lost on save because nothing reads them, but they do not persist either.
- **Delete table** is still the legacy DOM-only path, with the same snapshot Undo. It has the same
  problem this fix removed from Save and should get the same treatment.
- **Add table** goes through the model now, but the new table's id is a timestamp, which a real
  backend would supply.

## Assign person modal (2026-09-10)

Figma `3515:204464` default · `205148` help on · `205836` searching · `206452` no matches ·
`229072` mobile. Toasts: `3515:208712` desktop, `3515:228888` mobile.

Launched from the **Assign** button on an empty AttendeeCard in Table Detail, so the title always
names one specific seat: *"Assign person to Table 10 · seat 4"*.

**This replaces a placeholder.** Assign used to take whoever was first in the unassigned queue and
seat them as an Attendee — no picker, no choice of person, no role. Both were flagged at the time
(`seating-assign-next-in-queue`, `seating-assign-role-source`); this is the frame's real behaviour.

### Almost all of it is components already built

| Part | What it is |
|---|---|
| Dialog | a stock **Modal** instance. 512px is `.modal`'s own default (`--ai-size-9`), exactly what the frame draws, and ModalBody's 24px padding / 16px gap are `.modal__body`'s — neither re-declared |
| Rows | **AttendeeCard** with `Show Seat Number` and `Show Actions` off |
| Help line | the search **Input**'s own `Help Slot` — `.input__help`, not a paragraph of this dialog's |
| Show help | **Toggle** `toggle--xxs`, same pattern as the Table form |
| Manual guest | two **Input**s and a `btn btn--primary` |
| Toast | **SeatingToast** via the screen's existing `sp:toast` seam, with `Show Cta` for Undo |

**The rows are AttendeeCard, and that was worth checking rather than assuming.** Figma draws them
as hand-built frames named `guest-row`, but their anatomy is AttendeeCard's exactly — the 6px
`--sp-*` accent bar, the 14px semibold name, the 12px company, the 3px separator ellipse, the 11px
role label in the role colour. AttendeeCard already carries `Show Seat Number` and `Show Actions`
as **formal Figma booleans**, documented in its own notes as "omit `.attendee-card__seat` /
`.attendee-card__actions`" — so this is both switched off, which is Case A rather than a
contextual override, and nothing new was needed. **Figma should swap those frames for real
instances** (`seating-assign-guest-row-not-instance`).

### Behaviour

- **Two sources.** "Event Attendees" is derived — the unassigned pool — which is why the help text
  can promise *"anyone already seated is not listed"* with no filter of its own. "CRM Contact" is
  an authored directory of people who have **not** signed up.
- **No confirm step.** The frame has no Save button; the only button is "Add" for a manual guest.
  So a row *is* the action — click it and the person is seated and the dialog closes.
- **Search matches name and the second line**, which is what the frame's own `"an"` search proves:
  it returns Elena Rostanova via "Quantum Tech" and Rosa Delgado via "Panel chair".
- **An empty section drops its header** rather than showing an empty one, per the search frame.
- **Seating a CRM contact or a manual guest adds them to the event** (designer, 2026-09-10), so the
  header's attendee figure and the unassigned total both move — both derived from the roster, so
  neither can drift. Verified: adding one guest took the header from 183 to 184 attendees.

### The record now carries the role

The modal's help text states the rule — *"their role comes from their record and drives the colour
tag"* — and the frames show a role for people who are **not seated at all**, so it cannot live only
on the seat, where this model had it.

Rather than re-derive the authored tallies from people's records, which would move every legend,
the authored tally now **writes** the record: `pick(role)` stamps `person.role`, so whoever fills a
Host slot *is* a Host, and seat and record can never disagree. Everyone still unseated gets a role
round-robin over `ROLES` by index — deterministic, and it puts all five roles in the pool.

### Toast copy — Figma gives three different strings

| Frame | String |
|---|---|
| `229072` (mobile screen) | "**Elena Rostova** successfully assigned to **Seat 2**" |
| `208712` (desktop toast) | "**Ethan Patel** successfully assigned to **Table 5**" |
| `228888` (mobile toast) | "**Sofia Petroz** assigned to Table **Headline Sponsor**" |

Designer's ruling: **"successfully assigned to", with the object naming whatever was targeted** —
a seat here, since the Assign button always belongs to one. Two of the three frames already do
this. Undo reverses the seating and, for a CRM contact or manual guest, takes them back out of the
roster too.

### Two implementation traps, both measured

**A `<button>` row collapses to 4px.** The whole row is one action, so a real `<button>` was the
first choice. A button will not take its block size from a `flex-direction: column` child: the
body measured its correct 49px *inside a 4px button*, and `.attendee-card`'s `overflow: hidden`
clipped it. It is an `<article role="button" tabindex="0">` instead — the pattern TableCard already
uses for a whole-card action — with Enter and Space wired in JS, since the role brings the
semantics but not the behaviour.

**`flex-shrink: 0` on the list children is load-bearing.** `.assign__results` is a
height-constrained flex column, and flex items shrink below their content by default — with 84
rows in it every one collapsed to about 1px, rendering as a stack of hairlines. `overflow-y: auto`
does **not** prevent this: shrinking happens first, so there was nothing left to overflow.
TableDetail sidesteps it structurally (`__list` scrolls, `__seats` sits inside at auto height);
doing it with one element means saying so explicitly.

### Flagged, not reproduced

- **Three Input paddings in one dialog.** The search Field binds 8px left / 16px right, the two
  manual-guest Fields bind 16px both sides, and Input's own base is 12px both sides. Three values
  for the same control in one modal is drift rather than intent, so all three keep Input's base.
- **The no-matches paint is unbound.** Figma has `#335562` as a raw hex, which is exactly
  `--ai-text-secondary` in the Control Centre mode this screen runs in, so the token is used.
  Worth binding in Figma.
- **No hover state is drawn for the rows.** A clickable list that looks inert is worse than a
  small liberty, so hover borrows AttendeeCard's own `--dragged-over` brand border rather than
  introducing a colour. Needs a designer ruling.
- **The search icon is named `Icon/16px/User`** but the asset is a search glass; built as `search`.
- **These frames show the Unassigned tray WITH roles** and role-coloured accents; the tray as built
  shows name and company only, with the accent falling back to Attendee. Out of scope here and
  left alone — Unassigned's and AttendeeCard's own notes are the authority — but it is a real
  difference in a frame supplied for this task.
- **Modal's shadow differs from this frame's.** The frame carries `light/shadow-md`; `.modal` has
  its own global `0 0 20px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.1)`. Not this dialog's call.

### Verified (headless Chrome over HTTP)

Opens with the right title and both sections (72 event + 12 CRM). Roles render from records. Help
toggles on and off with the frame's exact copy — and `aria-checked` is **read, never written**,
because Toggle.js owns the flip; writing it too made the two cancel out and the help never
appeared, the same trap the Edit Plan and Table form handlers already document. `"an"` returns 29
across both sections; `"Farrer"` gives no sections and the exact no-match line. Assigning an event
attendee leaves the roster at 183 and takes the role from the record (`vip`); Undo clears the seat
and leaves the roster alone. A CRM contact seats as `sponsor` and takes the roster to 184. A manual
guest joins as `attendee`, and the header reads 184 attendees. Escape closes. Mobile at 402px: the
dialog is near-full-width, the list scrolls, and the manual fields and Add button step to 32px
while the search field stays 40px — measured on the mobile frame, not assumed.

### Height cap, alphabetical sort and section counts (designer, 2026-09-10)

Reported as *"too big"*, and it was: `.modal` carries `max-block-size: 100%` and the results list
took its `flex: 1 1 auto` at face value, so the dialog **tracked the viewport** instead of settling
at a size.

| | Before | After | Figma draws |
|---|---|---|---|
| Modal at a 1000px viewport | **952px** | **702px** | 719px |
| Results region | 634 (11 rows) | 384 | ~384–408 (~6 rows) |

#### The cap goes on the list, and 384 is the house value

`--ai-size-7` (384px) is the repo's established cap for a scrollable list inside a dialog —
`EventPicker.css:52` and both `FilterDropdowns` menus (`:36`, `:156`). EventPicker's own note
records it having been approved for exactly this situation: *"Figma caps the scroll region at
360px; `--ai-size-7` (384px) is the nearest token and was approved in place of an untokenised
value."* Modal also ships `.modal__body--scroll` at a raw 360px, commented "layout dimension — no
token match".

**Two things deliberately not done:**

- **No cap on `.modal`.** Its `max-block-size: 100%` was added after Samsung S23 testing so a
  dialog respects the overlay's padding; capping the dialog rather than the list would push the
  manual-guest footer off screen instead of scrolling the list.
- **Not switched to `.modal__body--scroll`.** That scrolls the whole body, which would take the
  search field and Show help out of view. Figma keeps them fixed too, so the structure was already
  right — only the ceiling was missing.

`flex: 1 1 auto` with `min-block-size: 0` stays, which makes 384 a **ceiling, not a floor**.
Verified at a 560px viewport: the modal lands at 512, the list shrinks to 194 and scrolls, and the
footer is still fully visible at 113.

#### Sort and counts are additions, with no Figma counterpart

Figma shows six rows and draws neither, which quietly assumes you search. With 72 unassigned
people behind that search box, two small things make the list usable:

- **Alphabetical**, on the displayed string via `localeCompare` so accented names land where a
  reader expects. The pool arrives in roster insertion order, which is arbitrary to whoever is
  reading it. Sorted copies only — `pool()` is derived and `D.CRM` is authored, and neither should
  be reordered by a dialog rendering itself.
- **Counts in the section labels** — "Event Attendees (72)" — so you can tell whether to search or
  scroll. Plain parenthesised text inside the existing label rather than a new element, precisely
  because Figma draws no count and there are no values to take from it. The count is of what is
  **listed beneath it**, not the section total, so the label stays true while filtering: a search
  matching one person reads "Event Attendees (1)".

Verified: the list is programmatically confirmed sorted, labels read (72) / (12) at rest and
(2) / (1) filtered on "ros", and the footer's own "Add a guest manually" label correctly carries
no count, since it heads a form rather than a list.

**Both want a Figma decision** — they are improvements to a design that does not include them, not
reproductions of it. Tracked on `seating-assign-seat`.

### Minor amends (designer, 2026-09-10)

**Body spacing, this dialog only.** `.modal__body`'s stock 16px gap and 24px lead-in left the
Show-help row floating — it is a thin strip rather than a block of content. Reduced to an 8px gap
and a 12px lead-in.

Written as `.modal__body.assign__body` (0,2,0), not `.assign__body` alone. Both would work today
only because `SeatingPlanner.css` happens to load after `Modal.css`, and an override that depends
on link order is one reshuffle away from silently reverting. The extra class also takes it past
Modal's own 639px rule, so the 12px lead-in holds at mobile while the other three sides still step
to 16px with every other dialog.

Verified scoped: the assign body reads 8px / 12px while the Table form's body on the same page
still reads 16px / 24px.

**"Headline Sponsor" is deleted as a tier**, and Tables 1 and 2 now carry `gold` and `vip`
directly.

This is a **deliberate divergence from the Populated frame**, which draws those two cards with
"HEADLINE SPONSOR" and "PLATINUM" chips — relabelled Gold and VIP instances. The designer's
position is that the tier list should just say Gold, so the relabel goes and the tier it was
hiding is used as itself. "Platinum" stays as a tier (it is still a distinct relabelled VIP the
event uses) but no table points at it any more, which is fine — a tier may exist unused.

Removed from both places it lived, because the registry and the data have to agree or a table
carries a tier nobody can see or manage: the `headline-sponsor` row in the Table types modal and
the entry in `SeatingData.TYPES`. Verified: 7 tier rows remain (Standard, Platinum, Gold, Silver,
Bronze, Head Table, VIP), the Table form's tier dropdown offers exactly those, Table 1's field
reads "Gold", and both chips render `Gold @ #d97706` and `VIP @ #00749e`.

Note the knock-on: the header-truncation measurements recorded earlier in these notes were taken
with the 128px "Headline Sponsor" chip. The two-row header fix stands on its own — a long tier
label is still possible, since a label is editable data — but the specific string that exposed it
is no longer in the baseline.
