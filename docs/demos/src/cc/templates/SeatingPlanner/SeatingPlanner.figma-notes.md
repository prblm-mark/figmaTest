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

