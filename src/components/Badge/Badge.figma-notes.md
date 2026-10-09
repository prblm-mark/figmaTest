# Badge — Figma Notes

**Figma:** [`node 2580:8904`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2580-8904)
**Tier:** Component
**Files:** `Badge.css`, `Badge.html`, `Badge.js`, `Badge.figma.ts`, `Badge.figma-notes.md`

---

## Variant matrix (verified from Figma `get_metadata` 2026-05-05)

The component set defines **32 symbols** — 6 Type axes × a partial State axis × Size only on
Type=Default. The cells shown below are the only combinations Figma defines; absent cells
(e.g. Type=Border + State=Default, Type=Icon Left + State=Neutral) are **not** in the
component set.

| Type | States defined | Sizes defined | Total cells |
|---|---|---|---|
| Default | Neutral, Success, Warning, Danger, Info (no Default) | Default | 5 |
| Border | Neutral, Success, Warning, Danger, Info | Default | 5 |
| Pill | Neutral, Success, Warning, Danger, Info | Default | 5 |
| Icon Left | Success, Warning, Danger, Info | Default | 4 |
| Indicator | Success, Neutral, Warning, Danger, Info | Default | 5 |
| Dismissible | Info, Success, Warning, Danger, Neutral | Default | 5 |
| Size demo (Type=Default, State=Default) | Default | sm, Default, lg | 3 |

**Key facts about the axes:**
- **`State=Default` is only used as the canvas for the Size demo** (Type=Default + State=Default
  + sm/Default/lg). It is NOT one of the status states displayed in the regular state row. The
  regular states are 5: Neutral, Success, Warning, Danger, Info.
- `Type=Icon Left` has only **4 states** (no Default, no Neutral).
- The Size axis (`sm` / `Default` / `lg`) is only enumerated on the `Type=Default,
  State=Default` cell. All other cells are Size=Default. The CSS supports applying `--sm` /
  `--lg` to any state class, but Figma only specifies non-Default sizes for the Default state.

**Two duplicate sub-frames in the parent:** `2580:10544` (light preview) and `2580:10795`
(dark preview) are mirror exports of the same component set rendered in the two themes.
Both frames list the same 32 symbols.

---

## CSS class mapping

| Figma property | CSS class |
|---|---|
| Type=Default | (no modifier — base `.badge`) |
| Type=Border | `.badge--border` |
| Type=Pill | `.badge--pill` |
| Type=Icon Left | (base layout — add `<i data-lucide="…">` child) |
| Type=Indicator | `.badge--pill` (add `<span class="badge__dot">` child) |
| Type=Dismissible | (base layout — add `<button class="badge__close">` child) |
| State=Default | `.badge--default` |
| State=Neutral | `.badge--neutral` |
| State=Success | `.badge--success` |
| State=Warning | `.badge--warning` |
| State=Danger | `.badge--danger` |
| State=Info | `.badge--info` |
| Size=sm | `.badge--sm` |
| Size=Default | (base) |
| Size=lg | `.badge--lg` |

---

## Token mapping (verified per variant)

### Base (`.badge`)

| Property | Token |
|---|---|
| `border` | `1px solid var(--ao-btn-primary-border)` (transparent token bound by Figma) |
| `border-radius` | `var(--ao-radius-md)` |
| `padding` | `var(--ao-spacing-1) var(--ao-spacing-3)` (4px / 8px) |
| `gap` | `var(--ao-spacing-2)` (6px) |
| `font-family` | `var(--ao-font-title)` |
| `font-weight` | `var(--ao-font-semibold)` |
| `font-size` | `var(--ao-font-fixed-xxs)` (12px) |
| `line-height` | `var(--ao-leading-xs)` (16px) |

### State colour pairs (used by Default, Pill, Icon Left, Indicator, Dismissible types)

| State | Background | Text |
|---|---|---|
| Default ★ | `--ao-surface-info-soft` | `--ao-text-info` |
| Neutral | `--ao-surface-neutral-soft` | `--ao-text-neutral` |
| Success | `--ao-surface-success-soft` | `--ao-text-success` |
| Warning | `--ao-surface-warning-soft` | `--ao-text-warning` |
| Danger | `--ao-surface-error-soft` | `--ao-text-error` |
| Info | `--ao-surface-brand-soft-extra` ⚠ | `--ao-text-info` |

★ **State=Default uses Info-family tokens** (`--ao-surface-info-soft` background and
`--ao-text-info` for text). Visually a muted-blue chip on a soft-blue field. State=Default is
only used for the Size demonstration row in Figma — it is not a status state shown alongside
Neutral/Success/etc. Note Default and Info now share the same text token (`--ao-text-info`)
but differ in their background tokens (`surface-info-soft` vs `surface-brand-soft-extra`).

⚠ **Info background binding:** Figma binds the Info state's background to
`--ao-surface-brand-soft-extra` and the text to `--ao-text-info`. The hex of
`brand-soft-extra` and `info-soft` happen to match (#f0f3ff) at present, but they are
semantically distinct tokens. Default and Info therefore use different background tokens
even though the rendered colour is the same.

### Type=Border (transparent bg, coloured border)

| State | Border colour |
|---|---|
| Neutral | `--ao-border-neutral` |
| Success | `--ao-border-success` |
| Warning | `--ao-border-warning` |
| Danger | `--ao-border-error` |
| Info | `--ao-border-info` |

Figma defines no Border+Default; the CSS no longer ships a `.badge--border.badge--default`
rule.

### Type=Pill

`border-radius: var(--ao-radius-full)` overrides the base radius. State colour pair
unchanged.

### Type=Icon Left

Adds a 16px (`--ao-icon-size-sm`) Lucide icon as the first child. State colour pair unchanged.
The icon uses `currentColor` so it inherits the badge text colour.

### Type=Indicator

Adds a 6px (`--ao-spacing-2`) circular dot (`.badge__dot`) as the first child, using
`background: currentColor` so the dot inherits the state's text colour. Indicator badges in
Figma use `--ao-radius-full` (i.e. they're pill-shaped) — apply both `.badge--pill` and the
state class.

### Type=Dismissible

Adds a trailing `<button class="badge__close">` containing a 16px (`--ao-icon-size-sm`)
Lucide `x`. The button container is 20px (`--ao-icon-size-md`) circular with `opacity: 0.7`
that goes to `1` on hover. JavaScript (`Badge.js`) auto-removes the parent badge when the
close button is clicked.

The Dismissible variant container is 30px tall (vs 26px for the other types) — naturally
derived from the 20px close button + 4px vertical padding + 1px×2 border. No CSS height
override needed.

### Sizes

| Size | padding (V H) | font-size | line-height | Resulting height |
|---|---|---|---|---|
| sm | `0` `var(--ao-spacing-2)` | `--ao-font-fixed-xxs` | `--ao-leading-xs` | 18px |
| Default | `var(--ao-spacing-1)` `var(--ao-spacing-3)` | `--ao-font-fixed-xxs` | `--ao-leading-xs` | 26px |
| lg | `var(--ao-spacing-2)` `var(--ao-spacing-4)` | `--ao-font-fixed-xs` | `--ao-leading-sm` | 34px |

`lg` overrides the icon size to `--ao-icon-size-md` (20px) for icons inside the badge.

---

## Token gap notes

| Item | Figma value | Token used | Note |
|---|---|---|---|
| Base border | transparent | `--ao-btn-primary-border` | Figma binds this `btn-primary-border` token (named for buttons) on the badge. Followed exactly per the rule "use the Figma variable as bound". Worth flagging to the designer for a more semantically generic name. |
| Size=sm padding-y | `py-px` (1px) in Figma | `0` in CSS | Figma's `1px` is not in our `--ao-spacing-*` scale. Using `0` produces the correct visible 18px height because the 1px border on top/bottom provides the same total. Visually identical. |

No other token gaps. No primitive Tailwind colours (Red/400 etc.) used.

---

## Sub-elements

| Element | Class | Tokens / sizing |
|---|---|---|
| Icon (Type=Icon Left) | `<i data-lucide="…">` direct child | `flex-shrink: 0`; size `--ao-icon-size-sm`; `lg` override → `--ao-icon-size-md` |
| Dot (Type=Indicator) | `.badge__dot` | 6px (`--ao-spacing-2`) square, `border-radius: full`, `background: currentColor` |
| Close button (Type=Dismissible) | `.badge__close` | 20px (`--ao-icon-size-md`) circular, `opacity: 0.7` → `1` on hover, contains a 16px Lucide `x` |

---

## JavaScript (`Badge.js`)

Single delegated `click` listener on `document` finds the closest `.badge__close` and removes
its parent `.badge`. Event-delegated so it works for badges added to the DOM after page load.
No init API beyond the auto-init on `DOMContentLoaded`.

---

## Link badges (anchor as badge)

`a.badge` gets `cursor: pointer` and `filter: brightness(0.96)` on hover — useful for chips
that link somewhere. No additional class needed.

---

## Dependencies

- Lucide icons (for Type=Icon Left and Type=Dismissible) — included via the page's existing
  Lucide setup.
- No design system component dependencies — Badge is atomic.

---

## History

- 2026-05-05 (initial Figma-verified spec): `get_metadata` + per-variant `get_design_context`
  on node `2580:8904` corrected several mistakes in an earlier draft (Icon Left state count,
  Default state coverage). Changed base `border: 1px solid transparent` → `border: 1px solid
  var(--ao-btn-primary-border)` to match Figma's binding; removed the
  `margin-right: -4px` on `.badge__close` that didn't appear in Figma.
- 2026-05-05 (designer update): State=Default removed from the Type=Default state row in the
  Figma component set; State=Default now exists only as the canvas for the Size demo. Default
  state recoloured from `surface-brand-soft-extra` / `surface-brand-dark` to
  `surface-info-soft` / `surface-info`. Demo HTML's "Default" badge entry removed from the
  Type=Default row; unused `.badge--border.badge--default` rule removed from CSS.
- 2026-05-05 (designer follow-up): State=Default text token changed from `--ao-surface-info`
  to `--ao-text-info` across all three sizes. Default and Info now share text colour but
  differ in background token.
