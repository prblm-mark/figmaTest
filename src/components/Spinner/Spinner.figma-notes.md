# Spinner — Figma Notes

**Status:** Code-first (Flowbite-inspired). No Figma node yet — flag for designer to formalise.
**Tier:** Component
**Files:** `Spinner.css`, `Spinner.html`, `Spinner.figma-notes.md`
*(`Spinner.figma.ts` is intentionally not created until a Figma node URL exists; Code Connect publishing requires a real node.)*

---

## Reference

[`https://flowbite.com/docs/components/spinner/`](https://flowbite.com/docs/components/spinner/) — adapted into the AI design system using existing status colour tokens and the icon-size scale.

## Variant matrix

Two independent axes:

| Axis | Values | CSS modifiers |
|---|---|---|
| Size | sm · default · lg · xl | `--sm` · (none) · `--lg` · `--xl` |
| Colour | brand · success · warning · danger · info · neutral · inverted | `--brand` · `--success` · `--warning` · `--danger` · `--info` · `--neutral` · `--inverted` |

Total: 4 × 7 = 28 combinations. The CSS lets consumers also override `color` directly on the element (the ring inherits via `currentColor`) for one-off tinting.

## CSS class mapping

| Element | Class | Notes |
|---|---|---|
| Wrapper | `<span class="spinner" role="status">` | Outer rotating ring. `role="status"` makes screen readers announce the loading state. |
| Visually-hidden label | `<span class="spinner__label">Loading…</span>` | Text inside the wrapper for SR users. Optional — alternatively put `aria-label="Loading"` on the wrapper. |
| Size modifier | `.spinner--{sm|lg|xl}` | Default size is 20px (matches `--ai-icon-size-md`). |
| Colour modifier | `.spinner--{brand|success|warning|danger|info|neutral|inverted}` | Sets `color` on the element; the ring inherits via `currentColor`. |

## Token mapping

| Property | Token |
|---|---|
| Default diameter | `--ai-icon-size-md` (20px) |
| sm diameter | `--ai-icon-size-sm` (16px) |
| lg diameter | `--ai-icon-size-lg` (24px) |
| xl diameter | `--ai-icon-size-xl` (32px) |
| Border radius | `--ai-radius-full` |
| Brand colour | `--ai-surface-brand` |
| Success | `--ai-surface-success` |
| Warning | `--ai-surface-warning` |
| Danger | `--ai-surface-error` |
| Info | `--ai-surface-info` |
| Neutral | `--ai-text-contrast` |
| Inverted | `--ai-btn-primary-text` (white in light + dark) |

Border widths: 2px / 2px / 3px / 4px for sm / default / lg / xl. Optical pixel values, kept as `px` per project rule (border-widths are not tokenised).

## Animation

```css
@keyframes ai-spinner-spin {
  to { transform: rotate(360deg); }
}
```

Duration `750ms`, `linear`, `infinite`. Single keyframe rotation.

`prefers-reduced-motion: reduce` pauses the animation — the ring is shown statically (still visible as a ring with a leading arc, just not spinning).

## Track effect

The "rest of the ring" is rendered as `currentColor` at 20% opacity using `color-mix()`:

```css
border-color: color-mix(in srgb, currentColor 20%, transparent);
border-top-color: currentColor;
```

This produces a faded full ring with a solid leading arc (mimicking Flowbite's track + arc SVG) using a single border declaration. `color-mix()` is supported in all evergreen browsers (Chrome 111+, Firefox 113+, Safari 16.2+).

## Accessibility

- `role="status"` on the wrapper — screen readers announce content changes inside the role-status region.
- A textual label MUST be provided, either via `<span class="spinner__label">Loading…</span>` (visually hidden) inside the wrapper, OR via `aria-label="Loading"` on the wrapper.
- When the spinner is inside a button that's processing, also set `aria-busy="true"` and `disabled` on the button. The icon itself can carry `aria-hidden="true"` because the button context already conveys the busy state.
- `prefers-reduced-motion: reduce` honoured.

## Dependencies

None — pure CSS, no JS, no other DS components required.

## Composition examples (in `Spinner.html`)

- **Sizes** — sm / default / lg / xl side by side
- **Status colours** — all 6 named colours at lg
- **With status text** — inline spinner + "Loading…" label
- **Inside a button** — `<button disabled aria-busy="true">` with `.spinner--sm` + label text. Primary/Alert use `--inverted` (white spinner); Secondary uses `--brand`.
- **Inverted on a coloured surface** — white spinner on a `--ai-surface-brand` panel
- **Centred** — placeholder for page/section loading (`min-height: 8rem` panel with the xl spinner centred)

## Outstanding

- **No Figma source yet.** Designer should formalise this as a Figma component (Size × Colour axes) — see the variant matrix above for the suggested structure. Once designed, re-build via `/build-component` and reconcile any visual differences. Push the `Spinner.html` demo to Figma immediately after build so the designer has a starting point.
