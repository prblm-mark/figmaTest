# Portraits — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: not directly identified via metadata traversal (parent ID unknown)
- See variant nodes in matrix below

## Variant Matrix

All variants are structurally identical: a 300×300px container div with a single `object-cover`
image fill. They differ only in the photo subject.

| Node | Name | Dimensions | Status |
|---|---|---|---|
| 68:4785 | Female 1 | 300×300 | Built |
| 68:4783 | Female 3 | 300×300 | Built |
| 68:4779 | Female 4 | 300×300 | Built |
| 68:4777 | Female 5 | 300×300 | Built |
| 68:4781 | Male 2 | 300×300 | Built |
| unknown | Female 2 | 300×300 | Not located — likely exists in Figma |
| unknown | Male 1 | 300×300 | Not located — likely exists in Figma |

## CSS Class Mapping

| Figma element | CSS class | Notes |
|---|---|---|
| Portrait photo (any variant) | `.portrait` | Applied to `<img>` element |

## Token Mapping

No design tokens — Portraits has no colour, spacing, or radius values.

## Token Gaps

None.

## Dependencies

None — Portraits is a leaf component.

## Notes

- **Clip responsibility:** A Portrait on its own is a 300×300 square image. Clipping to a
  circle is entirely the parent Avatar's responsibility (`overflow: hidden` +
  `border-radius: var(--ai-radius-full)`).
- **Sizing:** The `.portrait` class uses `width: 100%; height: 100%` so the image always
  fills whatever container it's placed in — including all five Avatar size variants.
- **`object-fit: cover`:** Ensures the photo crops to fill the container without distortion,
  matching Figma's clip-mask behaviour.
- **`pointer-events: none`:** Prevents the photo from capturing mouse events, matching the
  Figma `pointer-events-none` property on all portrait variants.
- **In production:** Replace picsum placeholder URLs in demos with real user photo URLs.
  The `.portrait` class is the only requirement — any `<img class="portrait" src="..." alt="...">`
  inside an `.avatar` will render correctly.
- **`data-name` rule reminder:** `data-name="Female 1"` in design context output is a Figma
  component — even though it renders as a plain `<img>`. This is what triggered creating this
  standalone component.
