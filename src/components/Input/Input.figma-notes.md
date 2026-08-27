# Input — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt`
- Component: node `78:2016` — [open in Figma](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=78-2016)

## Configurations

### Sizes

| Size | Class | Height | Padding | Use |
|---|---|---|---|---|
| Base (default) | `.input` | 40px (`--ai-spacing-8`) | 12px (`--ai-spacing-4`) | Standard form inputs |
| Small | `.input.input--sm` | 32px (`--ai-spacing-7`) | 12px (`--ai-spacing-4`) | Compact forms, inline filters |

### States

| State | Trigger | Border colour | Notes |
|---|---|---|---|
| Default | — | `--ai-border-secondary` | Resting state |
| Hover | `:hover` | `--ai-border-brand` | Mouse over the field |
| Focus | `:focus-within` | `--ai-border-brand` + focus ring | Keyboard or click into field |
| Error | `.input--error` | `--ai-border-error` + red focus ring | Validation failed — add class via JS |
| Disabled | `disabled` attribute | — | Not yet implemented in Figma |

### Optional elements

| Element | Class | Visibility | Notes |
|---|---|---|---|
| Label | `.input__label` | Always shown | Remove from HTML to hide |
| Label back button | `.input__label-back` | Optional (Figma `show label back`, hidden by default) | Back button left of the label. Wrap label + button in `.input__label-row`. See below. |
| Left icon | `.input__icon` | Optional | Lucide icon, `--ai-icon-contrast` |
| Clear button | `.input__clear` | Auto — shown when input has value | Uses `:has(:not(:placeholder-shown))`, no JS |
| Help text | `.input__help` | Optional | Below the field. Turns `--ai-text-error` in error state |

**Label back button (`show label back`, added 2026-07-06):**
```html
<div class="input">
  <div class="input__label-row">
    <button type="button" class="input__label-back" aria-label="Back">
      <i data-lucide="arrow-left" aria-hidden="true"></i>
    </button>
    <label class="input__label">First Name</label>
  </div>
  <div class="input__wrap">
    <input class="input__control" type="text" placeholder="i.e Tom">
  </div>
</div>
```
Only wrap the label in `.input__label-row` when the back button is present; a bare
`.input__label` is otherwise unchanged.

### Usage examples

**Standard input with label and help text:**
```html
<div class="input">
  <label class="input__label">First Name</label>
  <div class="input__wrap">
    <input class="input__control" type="text" placeholder="Enter name">
  </div>
  <p class="input__help">Required field</p>
</div>
```

**Small input without label:**
```html
<div class="input input--sm">
  <div class="input__wrap">
    <input class="input__control" type="text" placeholder="Search...">
  </div>
</div>
```

**Error state:**
```html
<div class="input input--error">
  <label class="input__label">Email</label>
  <div class="input__wrap">
    <input class="input__control" type="email" placeholder="Email" value="invalid">
  </div>
  <p class="input__help">Please enter a valid email address</p>
</div>
```

---

## Variant × Size × State Matrix

| Size | State | Border token | Height |
|---|---|---|---|
| Base | Default | `--ai-border-secondary` | `--ai-spacing-8` (40px) |
| Base | Hover | `--ai-border-brand` | `--ai-spacing-8` |
| Base | Active | `--ai-border-brand` | `--ai-spacing-8` |
| Base | Focus | `--ai-border-brand` | `--ai-spacing-8` |
| Base | Error | `--ai-border-error` | `--ai-spacing-8` |
| sm | Default | `--ai-border-secondary` | `--ai-spacing-7` (32px) |
| sm | Hover | `--ai-border-brand` | `--ai-spacing-7` |
| sm | Active | `--ai-border-brand` | `--ai-spacing-7` |
| sm | Focus | `--ai-border-brand` | `--ai-spacing-7` |
| sm | Error | `--ai-border-error` | `--ai-spacing-7` |

Hover, Active, and Focus all share the same visual treatment (brand border) — implemented via `:hover` and `:focus-within` on `.input__wrap`.

## CSS Class Mapping

| Figma property | CSS |
|---|---|
| Size=Base | `.input` (default) |
| Size=sm | `.input.input--sm` |
| State=Error | `.input.input--error` |
| Placeholder View=True | Input empty (`:placeholder-shown`) |
| Placeholder View=False | Input filled (`:not(:placeholder-shown)`) — clear button becomes visible |
| show label back=True | `.input__label-row` wraps `.input__label-back` + `.input__label` |
| show label back=False | Bare `.input__label` (no row wrapper needed) |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Container gap | `--ai-spacing-3` | `--ai-spacing-3` |
| Label font | `--ai-font-title`, `--ai-font-semibold`, `--ai-font-fixed-xs`, `--ai-leading-xs` | same |
| Label color | `--ai-text-primary` | `--ai-text-primary` |
| Label row gap (back btn ↔ label) | `--ai-spacing-3` | `--ai-spacing-3` |
| Back btn bg | `--ai-btn-secondary-bg` (transparent) | `--ai-btn-secondary-bg` |
| Back btn border | `--ai-btn-secondary-border` | `--ai-btn-secondary-border` |
| Back btn padding | `--ai-spacing-2` (6px) | `--ai-spacing-2` |
| Back btn radius | `--ai-radius-sm` (4px) | `--ai-radius-sm` |
| Back btn icon size | 12px | `--ai-icon-size-xs` (0.75rem) |
| Back btn icon/text color | `--ai-btn-secondary-text` | `--ai-btn-secondary-text` |
| Field height (base) | `--ai-spacing-8` | `--ai-spacing-8` |
| Field height (sm) | `--ai-spacing-7` | `--ai-spacing-7` |
| Field padding-x (base) | `--ai-spacing-5` | `--ai-spacing-4` (user-directed change, 2026-06-01) |
| Field padding-x (sm) | `--ai-spacing-4` | `--ai-spacing-4` |
| Field bg | `--ai-surface-primary` | `--ai-surface-primary` |
| Field border (default) | `--ai-border-secondary` | `--ai-border-secondary` |
| Field border (hover/focus) | `--ai-border-brand` | `--ai-border-brand` |
| Field border (error) | `--ai-border-error` | `--ai-border-error` |
| Content gap | `--ai-spacing-3` | `--ai-spacing-3` |
| Icon size | — | `--ai-icon-size-sm` (16px) |
| Icon color | `--ai-icon-contrast` | `--ai-icon-contrast` |
| Input font | `--ai-font-body`, `--ai-font-regular`, `--ai-font-fixed-xs`, `--ai-leading-md` | same |
| Input color (filled) | `--ai-text-primary` | `--ai-text-primary` |
| Placeholder color | `--text/contrast-2` | `--ai-text-contrast` |
| Help text font | `--ai-font-body`, `--ai-font-regular`, `--ai-font-fixed-2xs`, `--ai-leading-xs` | same |
| Help text color | `--ai-text-secondary` | `--ai-text-secondary` |
| Error help color | `--ai-text-error` | `--ai-text-error` |

## Token Gaps / Decisions

| Property | Figma value | Resolution |
|---|---|---|
| Placeholder color | `--text/contrast-2` (#6b7280) | Mapped to `--ai-text-contrast` (approved) |
| Error border | `--ai-text-error` in Figma | Using `--ai-border-error` (semantically correct — user to update Figma) |

## Notes
- No Disabled state found in Figma — not implemented. Add if required.
- Clear button uses `:has(:not(:placeholder-shown))` — shows only when input has a value, no JS needed
- Hover and Active share the same visual treatment as Focus (brand border)
- **Label back button (`show label back`, node `3033:5171`):** in Figma this is a **Button
  component instance**, but its geometry (radius-sm, 12px icon, 6px padding, no fixed height)
  matches no variant of our shared Button component. Per user decision (2026-07-06) it is built
  as a **scoped Case B element** (`.input__label-back`) reusing Button's `--ai-btn-secondary-*`
  tokens, rather than the `.btn` component. If a matching xs icon-button variant is later added
  to Button (with its own Figma variant), migrate this to use it.
- **Icon naming mismatch:** the Figma layer is named `Icon/24px/ArrowRight` but the actual
  asset/visual is a **left-pointing arrow** (a back affordance). Implemented with Lucide
  `arrow-left`, which matches the visual and the "back" semantics.
- Hover/pressed on the back button reuse Button's secondary state tokens
  (`--ai-btn-secondary-bg-hover` / `-bg-pressed`); Figma only specifies the default state.

## The `--sm` 192px max-width was removed, 2026-08-25

`.input--sm .input__wrap` carried `max-width: var(--ai-size-3)` (192px). It was **undocumented** —
it appeared nowhere in these notes — and it sat on a *size* modifier, which governs height, padding
and typography everywhere else in this component. The effect was that **no `input--sm` could ever
fill its container.**

It had already been worked around in three places before anyone questioned it:

| Consumer | Workaround |
|---|---|
| `Datatables.css` | `max-width: none` inside a `@media (max-width: 767px)` block, with a comment naming the cap |
| `ControlScreen.html` | inline `style="max-width: none"` — though that one targets `.datatables__search`'s own 18rem cap, so it remains |
| `Unassigned.css` | a scoped `max-inline-size: none` override, added 2026-08-24 |

and it then blocked TableListing's 320px toolbar search, at which point the designer removed it.

**Removal was proved safe before it was made.** Every `input--sm` wrap in Datatables and
ControlScreen was measured at 1400px and 500px, before and after: **identical** — 288 / 288 / 266 /
266 in Datatables at both widths, 0 / 297 in ControlScreen. The cap was shaping no existing
consumer; it was only blocking new ones. The two redundant workarounds (Datatables' media-query rule
and Unassigned's override) were removed in the same commit and their comments corrected.

**Consumers wanting a narrow small input now set their own width** — which is where that decision
belongs.

## `.input__help` was 16px too tall (fixed 2026-08-27)

`base.css` sets `p { margin: 0 0 var(--ai-spacing-5) }` — a 16px bottom margin on every
paragraph — and `.input__help` never reset it. So **every input showing help or error text was
16px taller than designed**, in every consumer, since the help element was added.

Found via the Seating Planner's create-plan modal, whose form grid measured rows of 104/104/120
against Figma's 88/88/104 — a uniform +16 that pointed at the element rather than the layout.
With `margin: 0`, an input with help is now exactly `16 + 8 + 40 + 8 + 16 = 88`, and that modal's
grid matches Figma to the pixel.

Same bug class as **Badge**'s `<p>` (2026-08-25): a component paragraph silently inheriting the
page-level margin because the component never zeroed it. Worth grepping for other component `<p>`
elements that don't set `margin`.


---

## Stepper — `.input--stepper` (added 2026-08-27)

**NO FIGMA NODE.** Built from a Flowbite/Tailwind quantity-input reference the designer supplied
("can we create a number input like this, but using our framework"). Every value below is a
**mapping decision**, not a Figma binding — so unlike the rest of this component it is not
verifiable against a node, and there is **no `.figma.ts` entry** for it (Code Connect needs a
Figma component to attach to). Same footing as **FullBadge**, which was also extracted from code.

If a stepper is later drawn in Figma, this section is the thing to reconcile against it — not the
other way round.

### Why a modifier and not a new component

Designer's call. It inherits the five things Input already gets right — the label, the help line,
the error state (red border + red ring + red help), the `--sm` size, and the focus-within ring. A
standalone component would have re-implemented all five and then drifted from them.

### Reference mapping

| Reference (Flowbite) | Ours | Note |
|---|---|---|
| `bg-neutral-secondary-medium` (buttons) | `--ai-surface-secondary` | |
| `hover:bg-neutral-tertiary-medium` | `--ai-surface-contrast` | |
| `border-default-medium` | `--ai-border-secondary` | the two hairlines flanking the field |
| `h-10` | inherited from `.input__wrap` (40px) | `--sm` gives 32 for free |
| `px-3` → 40px wide button | `--ai-spacing-8` (40) | `--ai-spacing-7` (32) at `--sm` |
| `w-4 h-4` icons | `--ai-icon-size-sm` | |
| `text-sm`, centred | Input's own `--ai-font-fixed-xs` + `text-align: center` | |
| `max-w-[9rem]` | **dropped — fluid** | designer's call; 144px matches no token, and the control should fill whatever column holds it. The demo's narrow cells are the demo constraining it, not the component. |

Two deliberate departures from the reference:

1. **Only the buttons are tinted.** The reference tints the field too. Designer's call: the field
   stays `--ai-surface-primary` so a stepper beside a text Input or a Select does not read as a
   different species of control.
2. **Buttons are `disabled` at the bounds**, not merely dimmed — so the control cannot produce an
   invalid value, and the button leaves the tab order and reports itself to assistive tech.

### Behaviour — `Input.js`

Input is otherwise CSS-only; this is the first JS it has needed. One delegated listener, no
per-element binding, guarded by `window.__inputStepperReady` (the Select.js double-include lesson).

- Honours `min` / `max` / `step`, clamping to the bounds; decimal steps are rounded to the
  precision the step implies, so `0.1 + 0.2` does not leak float error into the field.
- Emits **`input` and `change`** on every press — without them a framework binding or a validation
  handler would never see the value change.
- Typing or arrow-keying past a bound re-syncs the buttons too, not just clicking them.
- An empty field disables nothing and the first press seeds `min` (or 0), so it lands on a valid
  value rather than `NaN`.
- The field stays a real `<input type="number">` — arrows, scroll and paste all keep working. The
  native spinner is hidden because the buttons replace it; keeping both would give one control two
  competing affordances.
- `window.inputStepperSync()` re-syncs after injecting steppers or changing `min`/`max` at runtime.

`.input__step:focus-visible` keeps its outline, unlike `.input__control` and `.input__clear` which
suppress theirs. The wrap's focus ring says "this control has focus" but not **which** button, and
a stepper has two — the inset outline is the only thing telling a keyboard user whether they are
about to increment or decrement.

### Verified (headless Chrome, 2026-08-27)

40px at Base / 32px at `--sm`; 16px icons; buttons `--ai-surface-secondary` on an
`--ai-surface-primary` field; 1px `--ai-border-secondary` hairlines; native spinner suppressed;
`− ` disabled at min and `+` at max; clamping at both bounds; `input`+`change` both fired; empty
field seeds correctly; typing past a bound re-syncs; no JS errors.

### The 252px min-content floor (fixed 2026-08-27, same day)

Adopting the stepper in the create-plan modal surfaced a bug the component's own demo had been
showing all along without anyone reading it as one: **two of the seven demo rows overflowed the
card.** The two that did were the only ones whose field had no `max` attribute.

Chrome derives a number input's intrinsic width from the digit count of its `max`. With
`max="12"` `.input` reports a 108px min-content width; with no `max` it falls back to a
~20-character default and reports **252px**. `1fr` is `minmax(auto, 1fr)`, so the grid honoured
that 252px minimum and the row grew past its container. A stepper documented as *fluid* was in
fact imposing a ~252px floor on whatever held it.

`min-inline-size: 0` does **not** fix this — measured, not assumed: it left min-content at 252.
`inline-size: 0` on `.input__control` drops it to 86px (the two buttons plus borders) and changes
nothing at render time, because `flex: 1` grows the field straight back. Verified: all seven rows
inside the card, base still 40px, `--sm` still 32px, field still 74px in a 156px column.

Worth remembering as a class of bug: **an intrinsic-size floor is invisible until something
constrains the element.** The stepper looked perfect at full width and only misbehaved in a grid.

### Adopted by

**Seating Planner — create-plan modal** (`src/cc/templates/SeatingPlanner/`), 2026-08-27:
Tables (`min=1`, no max) and Seats / table (`min=6 max=12`). Note the mobile caveat recorded in
that screen's own figma-notes — at 390px the three-column grid leaves the field ~29px.
