# SeatingToast — Figma Notes

**Tier:** Component
**Built:** 2026-08-26 (Seating Planner module, wave 6b)
**Files:** `SeatingToast.css`, `SeatingToast.html`, `SeatingToast.figma.ts`, `SeatingToast.figma-notes.md`
**Composes:** Button (`btn--secondary btn--xs`, with a scoped padding override)
**JS:** none

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Page:** Seat Planner (`3087:5050`)
- **Component set:** `3474:90240`

## This is NOT the `Toast` component

`src/components/Toast/` already exists — the general-purpose notification set (`2856:3020`,
10 variants). **Figma names this one just "Toast" too**, which is the first thing worth fixing:
renaming it `Seating Toast` would stop two different components sharing a name in the property
panel and in Code Connect.

They are genuinely different components, not two takes on one:

| | `Toast` (existing) | `SeatingToast` (this) |
|---|---|---|
| shape | card, `--ai-radius-lg` (16) | **pill, `--ai-radius-full`** (100) |
| width | `--ai-size-7` (384) | 465 drawn → `--ai-size-8` (448) |
| ground | white, or status-tinted on `--color` | **always white** |
| border | `--ai-border-secondary` | **status colour** (`success` / `error`) |
| icon | 32px chip with a soft tinted background | **bare 20px glyph, no chip** |
| trailing | close button (always) | **Undo CTA (optional), no close** |
| variants | 10 (4 statuses × plain/filled + 2 layouts) | 2 (Success / Error) |
| dismissal | `Toast.js` removes it on close click | **none — the caller owns it** |

So a status-bordered white pill with an Undo is not reachable from `Toast`'s existing axes, and a
separate component is right. Worth a designer decision at some point whether the system *wants* two
notification components, or whether this should eventually become a `Toast` layout type alongside
`--notification` and `--interactive`.

## Variant matrix (2 variants)

| Type | Tier | Node | Figma size | CSS |
|---|---|---|---|---|
| Success | Component | `3474:90239` | 465×58 | `.seating-toast--success` |
| Error | Component | `3474:90238` | 465×58 | `.seating-toast--error` |

`Tier` is single-valued (`Component`). **There is no Device axis** — no mobile variant, and
"mobile" appears nowhere in the set's design context or variables, so there is no media query.
`max-inline-size: 100%` is what makes it safe on a narrow screen.

### Type changes two properties, not the whole surface

Type sets the **border colour** and the **icon colour**. The ground stays white in both — which is
precisely what separates this from the `Toast` card's `--color` variants, where the status tints the
whole card. Everything else (layout, padding, radius, shadow, typography, CTA) is identical between
the two, so each modifier is two declarations.

### `Show Cta` is a real boolean property

The Figma component exposes `showCta` alongside the text props. Both *drawn* variants have the CTA,
so **Figma never shows what `Show Cta = false` looks like** — the height there is emergent rather
than specified: the pill drops to **46px**, because the CTA is what makes it tall. Built that way
(no modifier needed — the flex row closes up on its own), but **worth confirming**: a toast that
changes height depending on whether it offers an Undo may or may not be wanted.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-primary` | `background-color` | rebound from `--ai-datatable-table-bg` — see below |
| `--ai-border-success` / `--ai-border-error` | `border-color` per Type | |
| `--ai-border-secondary` | base `border-color` | neutral fallback; Figma defines no untyped state |
| `--ai-radius-full` | `border-radius` (100px) | unbound in Figma as a raw `100px` |
| `--ai-shadow-md` | `box-shadow` | see below |
| `--ai-spacing-5` | `padding-inline` (16) | Figma reads 17 — see below |
| `--ai-spacing-4` | `padding-block` (12), `gap` (12) | gap unbound in Figma as a raw `12px` |
| `--ai-spacing-3` / `--ai-spacing-4` | CTA `padding` (8 / 12) | contextual override — see below |
| `--ai-size-8` | `inline-size` (448) | Figma draws 465 — see below |
| `--ai-icon-size-md` | icon (20px) | |
| `--ai-surface-success` / `--ai-surface-error` | icon `color` | a SURFACE token on an icon — see below |
| `--ai-font-body` | message `font-family` | note the `Toast` card uses `--ai-font-title` |
| `--ai-font-fixed-xs` | message (14px) | unbound in Figma |
| `--ai-leading-sm` | message (20px) | unbound in Figma |
| `--ai-font-regular` / `--ai-font-semibold` | message / its `<strong>` spans | |
| `--ai-text-primary` | message colour | |

### The padding is 16/12 plus the border, not 17/13

Figma reads `px-[17px] py-[13px]`, neither of which is a token. They are `--ai-spacing-5` (16) and
`--ai-spacing-4` (12) **plus the 1px stroke**: Figma measures its padding from outside a stroke it
draws inside the box, where CSS adds the border on top of the padding. The arithmetic confirms it —
`1 + 12 + 32 + 12 + 1 = 58`, exactly the height Figma states. So the tokens are 16/12 and nothing is
off-scale.

### Token gaps and decisions

All resolved with the designer 2026-08-26 rather than invented.

| Figma | Decision |
|---|---|
| Unbound two-layer shadow: `0 0 10px rgba(0,0,0,.05)` + `0 2px 1px rgba(0,0,0,.1)`. The first layer is **exactly `--ai-shadow-card`**; the second matches no layer of any token in the scale. | **`--ai-shadow-md`** — the token the `Toast` card already uses, so the two notification surfaces cast the same shadow. Deliberately heavier than Figma draws here; a consistency call over a literal match. The alternative was `--ai-shadow-card` alone, which would have matched the dominant layer exactly. |
| `bg` binds **`--ai-datatable-table-bg`** (#ffffff) — a Datatables token doing a surface's job on a toast | **`--ai-surface-primary`**. Identical value today, but a toast should not change colour if the table background is ever retuned for a Datatables redesign. **Worth rebinding in Figma.** |
| `w-[465px]`, unbound and matching no `--ai-size-*` (size-8 is 448, size-9 is 512) | **`--ai-size-8`** (448) plus `max-inline-size: 100%` — the same shape of rule the `Toast` card uses. A toast is a fixed-size floating element, so unlike TableCard or TableListing it is deliberately **not** fluid. 17px narrower than drawn. |
| `rounded-[100px]`, `gap-[12px]`, message `14px` / `20px` — all unbound | **`--ai-radius-full`**, **`--ai-spacing-4`**, **`--ai-font-fixed-xs`**, **`--ai-leading-sm`** — each matches its token exactly, so binding them is visually a no-op. **All four worth binding in Figma.** |
| Icon coloured `--ai-surface-success` / `--ai-surface-error` | **Used as drawn.** A *surface* token doing an icon's job, because **the icon scale has no success or error entry** — it stops at primary / secondary / contrast / invert / invert-secondary / brand. Identical finding to Unassigned's empty-state tick; `--ai-icon-success` and `--ai-icon-error` are genuine holes worth filling. |

## The CTA is a contextual override (Case B)

The `Undo` instance measures **55×32**. That does not match our `btn--xs`, and the interesting part
is *why*.

`get_variable_defs` on the instance (`3474:90189`) returns `--ai-spacing-1` (gap),
`--ai-spacing-3`, `--ai-spacing-4`, `--ai-radius-sm`, `--ai-font-fluid-xxs`, `--ai-font-medium`,
`--ai-leading-xs` and the `btn-secondary-*` family. Every one of those matches `.btn--xs`
**except the padding** — ours is `--ai-spacing-2 --ai-spacing-3` (6/8), the instance's is
`--ai-spacing-3 --ai-spacing-4` (8/12).

**Checked against Button's own set (`53:2489`) rather than guessed:** every `Size=xs` text variant
there is **115×28** — Primary, Secondary, Tertiary and Alert alike. So Figma's Button component
really is the tighter padding, `.btn--xs` is correct against its own source, and this instance is
overriding it. **Case B**: scoped to `.seating-toast__cta.btn` and Button left untouched.

That matters because `btn--xs` has real consumers — ActionCard (2) and ControlHub (6). Treating this
as Case A would have made all eight 4px taller and 8px wider to match one toast.

Two classes (`.seating-toast__cta.btn`) so the override wins on specificity rather than on
stylesheet order.

## Interaction model

- **Presentational only, no JS.** Unlike `Toast`, there is no close button to wire, and the
  component deliberately owns neither its own appearance/disappearance nor an auto-dismiss timer —
  a toast is spawned and retired by whatever raised it.
- **`Undo` is a real `<button>`** but is not wired. It must reverse the *specific* operation that
  raised the toast, which means it needs that operation's id — see the handover note.
- **`role="status"` on Success, `role="alert"` on Error**, following the convention the existing
  `Toast` component already set (`status` for info/success, `alert` for danger/warning). Success is
  announced politely; an error interrupts. This is what makes a toast usable at all — a visual-only
  toast is invisible to a screen-reader user.
- The icon is `aria-hidden`, since the message already carries the meaning.
- `<strong>` carries Figma's semibold emphasis, so the emphasis is in the markup rather than purely
  visual.

## Verification

Measured in headless Chrome at 1200px.

| | Figma | Rendered | |
|---|---|---|---|
| pill | 465×58 | **448×60** | width by decision; +2px height — see below |
| radius | 100px | **100px** | exact |
| border | 1px `--ai-border-success` / `-error` | **1px #adddc0 / #fdbdbe** | exact |
| padding | 17 / 13 | **16 / 12** + 1px border | exact once the stroke is accounted for |
| gap | 12 | **12** | exact |
| icon | 20×20, success / error | **20×20, #30a46c / #e5484d** | exact |
| message | 14px / 20px, regular, semibold spans | **14 / 20, 400, 600** | exact |
| CTA | 55×32 | **56.8×34** | see below |
| `Show Cta = false` | not drawn | 448×**46** | emergent |
| long message | not drawn | wraps to 3 lines, pill grows | |
| in a 320px container | not drawn | **294px, no overflow** | `max-inline-size: 100%` holds |

**The +2px on both the pill and the CTA is one cause.** The CTA renders 34 rather than 32 because
`btn--secondary` carries a 1px border that CSS adds on top of the approved 8px padding, where Figma
draws its stroke inside the 32. The pill is sized by its tallest child, so it inherits those 2px:
`1 + 12 + 34 + 12 + 1 = 60`. Contorting the padding to 7px would fix the number and break the token
rule, so it is left as border arithmetic — the same class of 1–3px difference already documented on
Unassigned (296/480 vs 297/472) and SeatingHeader (291 vs 288).

Also verified: all icons resolve (zero unconverted `<i>`), the `seating-toast__icon` class survives
`createIcons()` onto the generated `<svg>`, and roles alternate `status` / `alert` correctly across
all six demo instances.

## Notes and things to raise

- **Both components are called "Toast" in Figma.** Renaming this one is the single most useful fix.
- **A pre-existing 2px in `btn--xs`, unrelated to this build.** Figma draws its xs text button at
  28; ours renders 30 (`6 + 16 + 6` plus a 1px border top and bottom) for the same
  stroke-inside-vs-added reason. Not touched here — it affects Button, ActionCard and ControlHub,
  and is a Button-level decision.
- **The message's font family is `--ai-font-body`** here but `--ai-font-title` on the `Toast` card.
  One of the two is drift; worth a designer glance. Built as Figma binds it.
- **Figma's text layer names are stale.** The Success paragraph's layer is named *"Placing Dame
  Helen Verity — choose a seat, a table"* while its actual content reads *"Helen Verity successfully
  assigned to Seat 2"*. The content was taken from the design context, not the layer name.
- **The message is `whitespace-nowrap` in Figma**, which only holds for its sample strings. Left to
  wrap, since attendee and table names are not length-bounded and a nowrap pill would overflow
  rather than grow.
- **Design context splits the message into per-character spans** — a Figma artefact of mixed-style
  text. The parent `<p>` also carries `text-[0px]` and `--ai-text-secondary`, both meaningless
  (mixed runs collapse the parent's own values); the real values live on the spans, where the colour
  is a raw `#172033` that happens to equal `--ai-text-primary`.
- **Code Connect emits no size class** for the CTA (`btn btn--secondary` with a double space), the
  same gap seen on SeatingHeader's swap and global buttons. The size was resolved from geometry and
  bound variables instead.
- **No hover, focus, pressed or disabled variants** for the pill itself, and **no dark-mode
  variant**. The status border and icon colours are not theme-aware.
