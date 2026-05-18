# NotificationBadge — Figma Notes

**Figma file:** [`ETKqleZdpertwFEo40YB5n`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System) (CC Hybrid Design System)
**Tier:** Component
**Files:** `NotificationBadge.css`, `NotificationBadge.html`, `NotificationBadge.figma.ts`, `NotificationBadge.figma-notes.md`

---

## Origin

This component does **not** exist as a standalone component set in Figma. It was extracted
from a repeating layer pattern in `CCHeader` named `Notification`:

| CCHeader variant | Notification node | Size | Bell icon size |
|---|---|---|---|
| Desktop / Default | `4095:3413` | 40px | 20px |
| Desktop / Control | `4095:3418` | 40px | 20px |
| Desktop / Sub Text | `4097:3411` | 40px | 20px |
| Mobile / Default | `4097:3565` | 32px | 16px |
| Mobile / Control | `4113:3433` | 32px | 16px |
| Mobile / Sub Text | `4110:3414` | 32px | 16px |

Extracted as an atomic component because the pattern appears 6× across CCHeader and is a
natural reusable unit anywhere a notification trigger appears.

---

## Variant matrix

Single Size axis, 2 variants:

| Size | CSS modifier | Outer wrap | Bell icon | Badge dot |
|---|---|---|---|---|
| Default | (none) | 40px | 20px (`--ai-icon-size-md`) | 12px |
| Small | `.btn--sm` (on inner button) | 32px | 16px (`--ai-icon-size-sm`) | 12px |

The outer wrap is sized by the inner `.btn.btn--tertiary.btn--icon` (default) or
`.btn.btn--tertiary.btn--icon.btn--sm` (small). NotificationBadge supplies the badge
overlay only — sizing is delegated to the Button component.

---

## CSS class mapping

| Element | Class |
|---|---|
| Wrapper | `.notification-badge` (`<span>`) |
| Bell trigger | `.btn.btn--tertiary.btn--icon` (Button component) |
| Bell icon | `<i data-lucide="bell">` |
| Count badge | `.notification-badge__count` (`<span>`) |

The count `<span>` is optional. Omit it when there's nothing to notify (renders as just
the bell button).

---

## Token mapping

### Bell trigger (delegated to Button)

| Property | Token |
|---|---|
| Background | `--ai-btn-tertiary-bg` (transparent) |
| Icon colour | `--ai-btn-tertiary-text` (inherits theme) |
| Size (default) | `--ai-spacing-8` (40px, from `.btn--icon`) |
| Size (sm) | `--ai-spacing-7` (32px, from `.btn--icon.btn--sm`) |
| Radius | `--ai-radius-md` (8px, from `.btn`) |

### Badge

| Property | Token | Notes |
|---|---|---|
| Background | `var(--ai-surface-error)` | Resolves to Red 600 (#dc2626). Figma uses Red 500 (#ef4444) but Red 500 has no semantic token — see Token gaps. |
| Border | `2px solid var(--ai-surface-primary)` | Border colour matches the page bg, producing a "halo" against the parent. In CC the parent header bg (`--cc-header-secondary-bg`) is white = `--ai-surface-primary`. |
| Border radius | `var(--ai-radius-full)` | Fully circular |
| Min width / height | `var(--ai-spacing-4)` (12px) | Square base; grows wider if count > 1 digit |
| Text colour | `var(--ai-text-invert)` (white) | |
| Font family | `var(--ai-font-body)` | Inter |
| Font weight | `var(--ai-font-bold)` (700) | |
| Font size | `8px` | **Token gap** — sub-token optical size, see below |
| Line-height | `1` | |
| Padding | `0 var(--ai-spacing-1)` (0 4px) | Horizontal only, for multi-digit counts |
| Position | `top: 0; right: 0; transform: translate(25%, -25%)` | Translate-based offset — size-agnostic top-right overhang. Figma uses raw `top: 4px right: 5px` (40px) and `top: 1px right: 2px` (32px). Translate is cleaner and matches the visual intent. |

---

## Token gaps

| Gap | Figma | Resolution |
|---|---|---|
| Badge background | Red 500 / `#ef4444` (raw primitive, no `--ai-*` token) | Approved: use existing `--ai-surface-error` (Red 600 / `#dc2626`). Slightly darker than Figma. Worth raising with the designer to add `--ai-surface-error-bright` (Red 500). |
| Badge counter font-size | 8px (no token at this size; smallest tokens are `--ai-font-fixed-xxs` = 11px and `--ai-font-fluid-xxs` = 12px) | Approved: use raw `8px` with comment. Sub-token optical size, similar exception class to border-widths and letter-spacing. |
| Badge position offsets | `top: 4px right: 5px` (40px) and `top: 1px right: 2px` (32px) — only 4px maps to a token | Resolved by switching to translate-based offset (`translate(25%, -25%)`), which is size-agnostic and avoids the raw-px positions. |

---

## Accessibility

- The bell trigger is a `<button type="button">` with explicit `aria-label` describing the
  count (e.g. `"Notifications, 2 unread"`). The count is **not** read as part of the label
  when empty — supply a count-less label (`"Notifications"`) when omitting the badge.
- The count `<span>` is `aria-hidden="true"` because the count is already in the button's
  aria-label. This avoids duplicate announcements.
- Focus styling is inherited from `.btn--tertiary:focus-visible`.

---

## Dependencies

- **Button** (`src/components/Button/`) — supplies the bell trigger via
  `.btn.btn--tertiary.btn--icon` (and `.btn--sm` for the small variant).
- **Lucide** icon `bell` — included via the page's existing Lucide setup.

---

## Interaction

The bell trigger is a standard `<button>`. The expected interaction (open notifications
panel, mark as read, etc.) is the consumer's responsibility — no JS ships with the
component. CCHeader currently uses it without wiring the click handler.

---

## History

- 2026-05-15: Initial component scaffold. Extracted from the repeating Notification layer
  in CCHeader (CC Hybrid Design System file). Token gaps documented for badge bg
  (Red 500 → falls back to Red 600), badge font-size (8px optical), and position offsets
  (resolved via translate-based offset).
