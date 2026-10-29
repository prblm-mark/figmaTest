# ColorPickerInput — Figma Notes

## Figma Node

- **CC record kit (DS file `Lus07xi8pPXLN87sQIyrEt`):** set `3929:19338`: `State=Empty` `3929:19330`
  ("None", bare swatch ring) and `State=Filled` `3929:19334` ("#1A56DB"). Code-first in Figma
  (2026-09-30).
- **AI Chat (`Ikv8jxb5dcRH8ff4q4dR11`):** `2:6620`, first drawn as an instance in StyleSettings (`2160:5471`).
- **Chip variant:** Seating Planner "Manage table types" (`lRKvtYSU3SvO5hbMT33jxw` `1:43245` / `1:44462`).
- **Editable form:** code-first 2026-10-29, **not drawn yet**. It looks like the two Figma states,
  plus a Clear x and an Error state.

## Forms × States

| Form | Class | States | Used by |
|---|---|---|---|
| Display | `.color-picker-input` | Filled | StyleSettings, AI Chat (the native picker covers the whole box; each screen wires its own script) |
| Chip | `--chip` | Filled | Seating Planner tier colours |
| **Editable** | `--editable` (+ `--empty`, `--error`) | Empty ("None"), Filled, Focus, Error | record screens (`record_markup.edit_row` kind `color`): Article steps, Design Style / Design Frame |

## Editable form: behaviour (ColorPickerInput.js)

v1 parity, checked 2026-10-29 in `AfcForm/EditForm.cfm` (a `type="text"` input, `maxlength=6`, class
`input-color`, with the swatch opening a jQuery ColorPicker) and `CheckForm.cfm` (strips non-hex,
**empty allowed**, otherwise `<Field> needs to be exactly 6 characters long`):

- **Type or paste** a hex: `#` optional, 3 or 6 digits, case and surrounding spaces ignored. The swatch
  follows while the text is valid. On leaving the field it is tidied to `#RRGGBB`, upper case.
  (Friendlier than v1, which accepted only 6 digits without #.)
- **Swatch** = the native picker (the `<input type="color">` covers only the swatch now; `tabindex=-1`,
  because the hex field is the keyboard path).
- **Clear** (x, shown only while there's a value) empties the field to **None**, meaning inherit the
  default. Focus returns to the field.
- **Invalid** text is judged on leaving the field: red edge, `aria-invalid`, and the message
  `#<id>-error` shown with `role="alert"`: "Enter a 6-digit hex colour, like #1A56DB, or leave it empty."
  Fixing the text clears the error as you type.
- **Output:** `data-value` on the root holds only a valid value (`#RRGGBB` or `""`), and every change
  fires a bubbling `color-picker-input:change` { value }. A half-typed "#1A" never reaches a consumer.
  StylePreview reads `data-value`, so the preview never receives an invalid colour.

## CSS Class Mapping

| Part | Class |
|---|---|
| Box | `.color-picker-input` (`--editable`, `--empty`, `--error`, `--chip`) |
| Swatch / fill | `__swatch` / `__swatch-inner` |
| Native picker | `__native` (whole box in Display / Chip; swatch only in Editable) |
| Hex | `__value`: a `<span>` in Display / Chip, an `<input type="text">` in Editable |
| Clear | `__clear` (Editable) |
| Error message | `.input__help.color-picker-input__error` (sibling after the box) |

## Token Mapping

| Property | Token | Source |
|---|---|---|
| Box height | `--ao-spacing-8` | Figma `h-[--ao-spacing-8]` (code had a raw 40px until 2026-10-29) |
| Box padding / gap | `--ao-spacing-5` / `--ao-spacing-3` | Figma |
| Box bg / border / radius | `--ao-surface-primary` / `--ao-border-secondary` / `--ao-radius-md` | Figma |
| Hex text | `--ao-font-body`, `--ao-font-fixed-xs`, `--ao-leading-md`, `--ao-text-primary` | Figma |
| Placeholder "None" | `--ao-text-contrast` | Input's placeholder |
| Hover / focus edge + ring | `--ao-border-brand`; `--ao-surface-brand-soft` ring (95% light / 30% dark) | Input's |
| Error edge / ring / message | `--ao-border-error` / `--ao-surface-error-soft` / `--ao-text-error` | Input's |
| Clear icon | `--ao-icon-contrast`, `--ao-icon-size-sm` | Input's `.input__clear` |
| Editable swatch | `--ao-spacing-8` wide × the box's inner height (40×26), 1px `--ao-border-secondary`, `--ao-radius-xs`; box padding `--ao-spacing-2` top/bottom/left | the --chip variant's Figma values (Mark 2026-10-29: the 20px dot was too small to judge a colour) |

## Token Gaps / known pre-existing values

- Display form: the swatch's `20px` box predates this work (an image in Figma with no bound size). It's left as-is.
- Editable empty swatch: a 1px "/" diagonal in `--ao-icon-contrast` (Mark, 2026-10-29), so it can't be
  mistaken for a white swatch. It's neutral, not red, so it doesn't read as the error state. A field that
  loads with invalid text has no valid colour, so it shows the diagonal too.

## Not yet

- Draw the Editable form in Figma: the 40×26 chip swatch (empty = the "/" diagonal), Clear x, Error and Focus, as additions to the `3929:19338` set.
- "Colours in this style" swatches (reusing a style's existing colours): an optional addition, later.
- StyleSettings / AI Chat could move to the Editable form. They keep the Display form until someone
  asks, because their screens wire their own scripts.
