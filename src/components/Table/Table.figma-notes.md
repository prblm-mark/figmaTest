# Table — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set / container:** `2557:6203`
- **Tier:** `Component` → built into `src/components/Table/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2557-6203

## Variant matrix

Properties: **Type** × **Device** = 3 × 2 = 6 (intended).

| Node ID | Type | Device | Built |
|---|---|---|---|
| 2557:6202 | Default | Desktop | ✅ via `.table` |
| 2557:6201 | Default | Mobile | ✅ via responsive `@media (max-width: 767px)` on `.table-wrap` |
| 2557:6199 | Striped | Desktop | ✅ via `.table.table--striped` |
| 2557:6198 | Striped | Mobile | ✅ via responsive overflow |
| 2557:6200 | Border | Desktop | ✅ via `.table.table--bordered` |
| 2557:6204 | (mislabeled `Default, Device=z`) | (Border, Mobile) | ✅ via `.table.table--bordered` + responsive overflow |

> **Figma typo flagged:** node `2557:6204` is named `Type=Default, Device=z`. Its actual visual matches the **Border + Mobile** combination — cells have `border-r`, wrapped in the same 384px scroll frame as Default Mobile. Recommend renaming the variant in Figma to `Type=Border, Device=Mobile`. The component already covers this case via `.table--bordered` inside a narrow viewport.

## CSS Class Mapping

| Figma element | CSS class | Notes |
|---|---|---|
| Outer container | `.table-wrap` | White bg, `--ai-border-secondary` border, `--ai-radius-md`, `overflow: hidden`. At `<= 767px` adds `overflow-x: auto` for horizontal scroll |
| `<table>` | `.table` | `border-collapse: collapse`, `width: 100%`, `--ai-font-title` family |
| Type=Striped | `.table.table--striped` | Alternating row bgs (`tbody tr:nth-child(even)` → `--ai-surface-minimal`) |
| Type=Border | `.table.table--bordered` | Vertical cell borders on every column except the last |
| Header cell | `<th>` (default styling) | Padding `8/16`, uppercase, `--ai-font-fixed-xxs`, semibold |
| Body cell | `<td>` (default styling) | Padding `12/16`, regular `--ai-font-fixed-xs` |
| Right-aligned cell | `.table__cell--right` | Use on `<th>` and `<td>` for price-style columns |

## Token Mapping

| Figma value | CSS variable | Role |
|---|---|---|
| `surface/primary` | `--ai-surface-primary` | Wrap background |
| `surface/minimal` | `--ai-surface-minimal` | Header bg, striped row bg |
| `border/secondary` | `--ai-border-secondary` | Wrap border, header bottom border, body row dividers, vertical cell separators (Bordered) |
| `text/secondary` | `--ai-text-secondary` | Header text colour |
| `text/primary` | `--ai-text-primary` | Body text colour |
| `radius/md` (8px) | `--ai-radius-md` | Wrap corner radius |
| `spacing/3` (8px) | `--ai-spacing-3` | Header padding-y |
| `spacing/4` (12px) | `--ai-spacing-4` | Body padding-y |
| `spacing/5` (16px) | `--ai-spacing-5` | All cell padding-x |
| `font/title` | `--ai-font-title` | Both header and body |
| `font/fixed-xxs` (12px) | `--ai-font-fixed-xxs` | Header text size |
| `font/fixed-xs` (14px) | `--ai-font-fixed-xs` | Body text size |
| `font/semibold` | `--ai-font-semibold` | Header weight |
| `font/regular` | `--ai-font-regular` | Body weight |
| `leading/md` (24px) | `--ai-leading-md` | Both |
| `tracking 0.6px` | `--ai-tracking-7` (`0.05em`) | Header letter-spacing — `0.05em` at 12px font-size resolves to 0.6px (matches Figma's literal 0.6px) |

## Token Gaps

None — every Figma value maps to an existing `--ai-*` token.

## Notes / Inconsistencies

- **Mobile Price header text colour discrepancy.** In the Mobile variants (Default + Striped), Figma binds the right-most "Price" header cell to `--ai-text-contrast` (`#67676c`) instead of the `--ai-text-secondary` (`#3c3c3f`) used by every other header cell across all variants. Almost certainly a binding bug. The component normalises to `--ai-text-secondary` everywhere for consistency.
- **Layout via absolute positioning in Figma.** Figma's design context renders the table as absolute-positioned cells with hardcoded pixel widths (e.g. `w-[384.688px]`). The production CSS uses a normal `<table>` with `border-collapse: collapse` and lets the browser's auto-layout distribute column widths — this is more semantic, accessible, and resilient to content variation.
- **Mobile scroll indicator pill.** The Mobile variants in Figma include a small `bg-[var(--ai-surface-secondary)] h-[10px] rounded-full w-[180px]` pill at the bottom of the panel — a visual representation of where the scrollbar would be. The production component does not render this; the browser's native scrollbar serves the same purpose.
- **Last row has no bottom border.** Standard table pattern — `tbody tr:last-child td { border-bottom: 0 }`.
- **All cells use `white-space: nowrap`** to match Figma's `whitespace-nowrap` on every cell. This means narrow wraps trigger horizontal scroll instead of wrapping cell content.

## Dependencies

None — the table is a pure HTML + CSS component. No JS, no Lucide icons (the Lucide CDN is loaded by the demo page only as a project convention, not used by the component itself).
