# OrderedList (CC) — figma notes

**Tier:** Pattern · **Status:** CODE-FIRST (Mark, 2026-10-19). **Drawn natively in Figma 2026-10-19:** file
`Lus07xi8pPXLN87sQIyrEt`, View & Edit page, Board `3861:1903`: **OrderedList** set `4392:181669` (Kind=Fixed `4392:181501`,
Selectable `4392:181604`, Empty `4392:181656`, View `4392:181663`) and **OrderedListRow** set `4392:30279`
(Position=First / Middle / Last; props Number, Label, Removable). Built from Button Tertiary xs icon-only (`2926:3571`),
the code-first Lucide icons and Semantic / Scale / Typography variables. The code is the reference. **Code Connect published 2026-10-19** (`OrderedList.figma.ts`: one mapping per Kind + the row).

A short list field whose **order is the value**, reordered in place on the page. It replaces v1's listbox with
↑ ↓ arrows on the simple Control Centre record screens (Hub agent Cat's migration):

- Search Profile → **Content Group Priority** (Articles, Contacts, Accounts, Editions)
- Recruitment Sector Profile → **Sequence**
- Checkout / Demographic Profiles → **address-field order**
- v1 **Contact Topics** (Select + ↑ ↓): the Selectable kind

**Why not the Selector's Sort type:** v1 shows the whole list on the page. A modal hides the order, which is
the point of the field, and adds a click. Sort stays for placing one article among many siblings (Mark,
2026-10-19).

## Variants

| Kind | Rows | Below the box | Empty |
|---|---|---|---|
| `Fixed` | grip · position · label · ↑ ↓ | — | (never empty) |
| `Selectable` | grip · position · label · ↑ ↓ · × | **Select** (Button Secondary sm) | "None selected", as TagBox |
| View | numbered list (`ol.ordered-list-view`) | — | field left out (view screens hide empty fields) |

## Interaction

- **↑ ↓** move one place. ↑ is disabled on the first row and ↓ on the last. They are disabled AND
  `visibility: hidden`, so the button columns stay aligned (Selector's rule). Focus stays on the arrow
  pressed, so repeated presses keep moving. At an end, focus moves to the other arrow.
- **Drag** by the grip only (Selector's / Edit Columns' model). The insertion line is the row's border. Touch
  (`hover: none`) hides the grip, since there is no HTML5 drag there; ↑ ↓ do the full job.
- **×** removes the row. Focus goes to the next row's ×, or to Select when the list is empty.
- **Select** opens the FilterDropdowns Multi Select Modal (TagBox's contract), pre-ticked with the current
  items. **Apply** keeps the order of the items that stay and adds new ones **at the bottom**. Cancel,
  Escape and × discard the changes.
- Every change renumbers the rows, writes the keys in order to the hidden input
  (`[data-ordered-list-value]`) and announces it in the live region, e.g. "Articles moved to position 2 of 4",
  "Coronavirus Hub removed", "3 selected, 2 added at the end".
- **No separate Apply or Save:** the page's own Save stores the order.

## Narrow

The pattern is a self-container (`ordered-list`), because it spans its field's value column. FieldRow never
stacks (its label keeps 192px), so on a phone the list gets about 140px. Under 280px (`--ao-size-5`) the
column grid goes and each row wraps: the buttons drop under the label, pushed to the end. The label track
is `1fr` with no `min-inline-size: 0`, so a word is never broken mid-word ("Arti / cles" was the bug).

## Classes

| Element | Class |
|---|---|
| Root | `.ordered-list` + `[data-ordered-list]` |
| Box | `ol.ordered-list__items` (`data-empty`, `aria-label` = field label) |
| Row | `li.ordered-list__row` + `data-ordered-list-key` · `--moved` · `--dragging` · `--over-before/after` |
| Grip | `.ordered-list__grip` + `[data-ordered-list-grip]` (Lucide `grip-vertical`) |
| Position | `.ordered-list__position` |
| Label | `.ordered-list__label` |
| Buttons | `.ordered-list__actions` › `btn btn--tertiary btn--xs btn--icon` (24×24; Mark chose xs over sm, 2026-10-19): `[data-ordered-list-move="up"/"down"]` (`arrow-up` / `arrow-down`), `[data-ordered-list-remove]` (`x`) |
| Value | `input[type=hidden][data-ordered-list-value]`: keys, comma-joined, in order |
| Live region | `.ordered-list__live` + `[data-ordered-list-live]` |
| Select | `[data-ordered-list-select="<modal id>"]` |
| View | `ol.ordered-list-view` |

Record screens: `edit_row(label, "ordered", tags=[…], modal=None|"modal-id")` and
`view_row(label, "ordered", […])` in `record_markup.py` (`ordered_list()`). Items are names, or `(key, name)`.

## Tokens (all `--ao-*`, every value reused)

| Element | Token | Reused from |
|---|---|---|
| Box bg / border / radius | `surface-primary` / `border-secondary` / `radius-md` | TagBox `.tag-box__tags` |
| Box padding / min-height | `spacing-3` / `spacing-8` | TagBox |
| Row gap / column gap | none (Mark, 2026-10-19) / `spacing-3` | — / Selector `.selector__sort-row` |
| Row padding / radius / hover | `spacing-2` `spacing-3` / `radius-sm` / `surface-minimal` | Selector `.selector__sort-row` |
| Moved / drop line | `border-brand` | Selector |
| Grip | `icon-contrast`, `icon-size-sm` | Selector `.selector__grip` |
| Position | `font-body`, `font-fixed-2xs`, `leading-sm`, `text-secondary`, tabular nums | Selector's typography |
| Label | `font-body`, `font-fixed-2xs`, `font-semibold`, `leading-sm`, `text-primary` | Selector `.selector__sort-title` |
| Button border | `border-secondary` | Selector's Case B override on the sort buttons |
| Empty text | `font-title`, `font-fixed-xs`, `leading-md`, `text-contrast` | TagBox |
| Root gap (box → Select) | `spacing-3` | TagBox |

## Token gaps

None. There is no Figma source. Review points for the Figma pass:
- Label weight is **semibold** (from the Selector's sort title). Form values are usually regular, so the
  designer should confirm.
- The move buttons are `btn--xs` (24px, Mark 2026-10-19). That's under the 44px touch target; on touch
  they are the only way to reorder.

## Backend

`TODO(backend:RecordScreen) ordered-list-value`: the hidden input holds the keys in order. Submit it with the
page's Save in the field's own v1 format.
