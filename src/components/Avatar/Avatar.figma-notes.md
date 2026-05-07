# Avatar — Figma Notes

**Figma:** [`node 68:5042`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=68-5042) — "Avatars" component set, **80 variants**.
**Tier:** Component
**Files:** `Avatar.css`, `Avatar.html`, `Avatar.figma.ts`, `Avatar.figma-notes.md`

---

## Variant matrix (verified 2026-05-07 from Figma `get_metadata` + per-variant `get_design_context`)

Six independent axes:

| Axis | Values | CSS |
|---|---|---|
| Size | 1 (24px) · 2 (32px) · 3 (48px) · 4 (64px) · 5 (80px) | `--size-2..5` (default = Size 1) |
| Shape | Round · Rounded | `--rounded` (default = Round, radius-full) |
| Type | Default · Bordered · Placeholder · Initials | `--bordered` · `--placeholder` · `--initials` |
| Show Notification | True · False | structural — add `<span class="avatar__dot">` for True |
| Notification Color | Green · Red · Orange | `__dot--green/--red/--orange` (only valid when Show Notification=True) |
| Checked | True · False | `--checked` (only valid with Type=Default + Show Notification=False) |

Combined cell totals (per Figma component set):
- 5 sizes × 2 shapes × Type=Default × 3 notification colours × Show Notification=True = **30**
- 5 sizes × 2 shapes × Type=Default × Show Notification=False × Checked=False = **10**
- 5 sizes × 2 shapes × Type=Default × Show Notification=False × Checked=True = **10**
- 5 sizes × 2 shapes × Type=Bordered × Show Notification=False × Checked=False = **10**
- 5 sizes × 2 shapes × Type=Placeholder × Show Notification=False × Checked=False = **10**
- 5 sizes × 2 shapes × Type=Initials × Show Notification=False × Checked=False = **10**

Total = **80 symbols**, matching the metadata enumeration.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Size=1 | (no modifier — base `.avatar`) |
| Size=2 | `.avatar--size-2` |
| Size=3 | `.avatar--size-3` |
| Size=4 | `.avatar--size-4` |
| Size=5 | `.avatar--size-5` |
| Shape=Round | (no modifier — base `radius-full`) |
| Shape=Rounded | `.avatar--rounded` (radius-md squircle) |
| Type=Default | (no modifier) |
| Type=Bordered | `.avatar--bordered` |
| Type=Placeholder | `.avatar--placeholder` (+ Lucide `<i data-lucide="user">` child) |
| Type=Initials | `.avatar--initials` (+ uppercase text) |
| Checked=True | `.avatar--checked` (+ Lucide `<i data-lucide="check">` child) |
| Show Notification=True | structural — add `<span class="avatar__dot avatar__dot--{green\|red\|orange}">` |
| Notification Color | `.avatar__dot--green` · `.avatar__dot--red` · `.avatar__dot--orange` |

---

## Token mapping

### Sizing

| Size | Diameter | Token |
|---|---|---|
| 1 | 24px | `--ai-spacing-6` |
| 2 | 32px | `--ai-spacing-7` |
| 3 | 48px | `--ai-spacing-9` |
| 4 | 64px | `--ai-spacing-11` |
| 5 | 80px | `--ai-spacing-13` |

### Shape

| Shape | Token |
|---|---|
| Round | `--ai-radius-full` |
| Rounded | `--ai-radius-md` (8px squircle) |

### Type=Bordered

| Property | Value |
|---|---|
| Outline | `1px solid var(--ai-border-secondary)` |
| Outline offset | `3px` (Figma uses a 4px gap; outline rendered at offset 3 + 1px width visually = 4px from photo) |

### Type=Placeholder

| Property | Token |
|---|---|
| Background | `--ai-surface-secondary` |
| Icon colour | `--ai-icon-secondary` |
| Icon | Lucide `user`, with **explicit per-size dimensions** (NOT proportional) |

**Placeholder icon sizes per avatar size** (verified from Figma — do not assume scaling):

| Avatar | Icon size | Token |
|---|---|---|
| Size 1 (24px) | 16px | `--ai-icon-size-sm` |
| Size 2 (32px) | 20px | `--ai-icon-size-md` |
| Size 3 (48px) | 24px | `--ai-icon-size-lg` |
| Size 4 (64px) | 32px | `--ai-icon-size-xl` |
| Size 5 (80px) | **40px** | ⚠ no token — hardcoded `40px` |

⚠ **Token gap:** Size 5 placeholder icon is 40px; there's no `--ai-icon-size-2xl` token. Flagged for designer to add.

### Type=Initials

| Property | Token |
|---|---|
| Background | `--ai-surface-info-soft` |
| Text colour | `--ai-text-info` |
| Font family | `--ai-font-title` |
| Font weight | `--ai-font-semibold` |
| Font size (Size 1) | `--ai-font-fixed-xxs` (12px) |
| Font size (Size 2) | `--ai-font-fixed-xs`  (14px) |
| Font size (Size 3) | `--ai-font-fixed-md`  (18px) |
| Font size (Size 4) | `--ai-font-fixed-xl`  (22px) |
| Font size (Size 5) | `--ai-font-fixed-3xl` (28px) |

### Checked

| Property | Token |
|---|---|
| Background | `--ai-surface-success` |
| Tick icon colour | `--ai-btn-primary-text` (white in light + dark) |
| Tick icon | Lucide `check`, with **explicit per-size dimensions** (NOT proportional) |

**Checked tick sizes per avatar size** (verified from Figma):

| Avatar | Tick size | Token |
|---|---|---|
| Size 1 (24px) | 16px | `--ai-icon-size-sm` |
| Size 2 (32px) | 16px | `--ai-icon-size-sm` |
| Size 3 (48px) | 24px | `--ai-icon-size-lg` |
| Size 4 (64px) | 24px | `--ai-icon-size-lg` |
| Size 5 (80px) | 24px | `--ai-icon-size-lg` |

Note: Size 1+2 share the small tick; Sizes 3+4+5 share the large tick. There's no `md` (20px) or `xl` (32px) tick — Figma quantises to two values.

### Notification dot

| Property | Token |
|---|---|
| Diameter (Sizes 1, 2) | `--ai-spacing-3` (8px) |
| Diameter (Sizes 3, 4) | `--ai-spacing-5` (16px) |
| Diameter (Size 5) | `--ai-spacing-6` (24px) |
| Border / ring | `1px solid --ai-surface-primary` (1.5px on Sizes 3-4, 2px on Size 5) |
| Notification Color = Green | `--ai-surface-success` |
| Notification Color = Red | `--ai-surface-error` |
| Notification Color = Orange | `--ai-surface-warning` |

**Position depends on Shape:**

| Shape | Avatar size | Dot position (top / right) |
|---|---|---|
| Round | all | `top: 0; right: 0` (corner of bounding box) |
| Rounded | Size 1 | `top: -3px; right: -2px` |
| Rounded | Size 2 | `top: -2px; right: -2px` |
| Rounded | Sizes 3, 4, 5 | `top: -8px; right: -8px` |

On Rounded (squircle) avatars the dot is pulled OUTSIDE the bounding box with negative offsets so it visually clears the rounded corner. Offsets verified per-size from Figma — do not interpolate or assume.

No new tokens introduced. No primitive Tailwind colours used.

---

## Photo clipping

The photo is clipped via `clip-path` on the `.portrait` element, NOT via `overflow: hidden` on `.avatar`. This keeps the notification dot — a sibling of the photo, positioned at top-right of `.avatar` — visible even though it sits at the corner where it overlaps the photo's circle.

| Shape | Clip |
|---|---|
| Round | `clip-path: circle(50%)` |
| Rounded | `clip-path: inset(0 round var(--ai-radius-md))` |

---

## Composition / dependencies

- **Portraits** (`src/components/Portraits/`) — every photo content uses `<img class="portrait">` and the Portraits CSS is imported. Composes naturally.
- Lucide icons — required for Placeholder (`user`) and Checked (`check`).
- No JS.

---

## Accessibility

- Photo `<img>` carries an `alt` describing the person, OR `alt=""` for purely decorative usage (e.g. inside a button that already names the user).
- Type=Placeholder: wrap with `aria-label="No portrait"` (or context-specific) since the silhouette is decorative.
- Type=Initials: wrap with `aria-label="Mark Foster"` (the full name) so SR users hear the name, not the letters.
- Checked: typically used inside a row that already conveys "selected" via `aria-current` or similar — the avatar swap is purely visual.
- Notification dot: `aria-hidden="true"` (decorative). The actual notification context (e.g. "3 new messages") should live in the surrounding markup or as `aria-label` on the parent container.

---

## History

- 2026-05-07 (initial rebuild): Full rebuild after the designer formalised the new variant matrix in Figma. Pre-existing code-first additions (`--rounded`, `--bordered`, `--placeholder`, `--initials`, status-dot colour modifiers) were re-derived from the Figma source rather than carried over. Token bindings changed for several types:
  - `--bordered`: outline tightened to 1px `--ai-border-secondary` outside (was 2px `--ai-surface-contrast` inside)
  - `--placeholder`: bg `--ai-surface-secondary`, icon `--ai-icon-secondary` (was `--ai-surface-contrast` / `--ai-text-invert`)
  - `--initials`: bg `--ai-surface-info-soft`, text `--ai-text-info` (was `--ai-surface-brand-soft` / `--ai-surface-brand-dark`)
  - Notification dot colour modifiers renamed to match the Figma `Notification Color` enum: `--green` / `--red` / `--orange` (was `--online` / `--away` / `--busy` / `--offline`).
- 2026-05-07 (correction): Initial rebuild assumed proportional 67% icon scaling and identical dot positioning across shapes. Both wrong. Re-fetched per-size variants and corrected:
  - **Checked tick** sizes are explicit per Figma: 16px for Sizes 1+2, 24px for Sizes 3+4+5 (not 67% of avatar).
  - **Placeholder user icon** sizes are explicit per Figma: 16/20/24/32/40px for Sizes 1/2/3/4/5 (not 67% of avatar). Size 5's 40px has no `--ai-icon-size-2xl` token — flagged.
  - **Notification dot** on Shape=Rounded uses negative offsets (`top: -3 right: -2` for Size 1, `top: -2 right: -2` for Size 2, `top: -8 right: -8` for Sizes 3-5) to clear the squircle's rounded corners. Round shape stays at `top: 0; right: 0`.
- Pre-2026-05-07: Avatar had Size 1-5 + Show Notification + Checked, no Shape/Type/Notification Color axes.
