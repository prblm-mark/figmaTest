# MediaPicker — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3875:3331`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3875-3331) · Tier: **Component** → `src/cc/components/MediaPicker/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3875:3331` | State=Empty | image icon in the thumb |
| `3875:3331` | State=Filled | image in the thumb |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root | `.media-picker` |
| Thumbnail | `.media-picker__thumb (icon or img)` |
| Actions | `.media-picker__actions → btn btn--secondary btn--sm "Edit" + btn--sm btn--icon trash` |

## Token Mapping

| Property | Token |
|---|---|
| thumb size | --ao-spacing-10 (56) |
| thumb bg / border / radius | --ao-surface-minimal / --ao-border-secondary / --ao-radius-md (designer amend 2026-09-29, was -sm — flag for Figma) |
| image icon | --ao-icon-size-md, --ao-icon-secondary |
| gap thumb→actions / between buttons | --ao-spacing-4 / --ao-spacing-2 |

## Token Gaps & Decisions
Figma image icon is bound to `--ao-border-primary`; code uses `--ao-icon-secondary` (same #667f89 in CC, correct semantic). Edit/delete wiring is backend.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.

## Edit button: icon only (designer, 2026-09-29)

The Edit action is now `btn btn--secondary btn--sm btn--icon` with only the pencil and `aria-label="Edit <field>"`. The text label is dropped. It opens the Selector Type=Media (`data-selector-open="modal-media"`) on the record screens. **Figma still shows "Edit" with text, so flag it for Figma.**

## Thumbnail opens the selector (designer, 2026-09-29)

`.media-picker__thumb` is now a `<button>` (`aria-label="Choose <field>"`). Clicking the image or the empty placeholder opens the Selector Type=Media, the same as Edit. On hover it takes a `--ao-border-brand` border, and focus shows the standard ring. The file kind (audio) keeps a plain span thumb.

## Empty vs filled (designer, 2026-09-29)

- **Empty slot** (`media-picker--empty`): the placeholder plus **Choose file** (secondary sm, upload icon).
- **Filled slot**: the image plus the pencil (change) and trash (remove).

Both action sets are in the markup and the modifier picks one. MediaPicker.js does the trash: it empties the slot and moves focus to Choose file. Choosing in the Selector fills the slot through `window.mediaPicker.fill`.

On the record screens, FieldRow hides the image options while the slot is empty. Handover: `record-media-remove`. **Flag for Figma:** the empty state with Choose file is not drawn yet.

## Figma build 2026-09-30
`3875:3331`: Empty = placeholder + **Choose file** (Upload icon `3932:145740`, new); Filled = icon-only pencil + trash; thumb radius md.
