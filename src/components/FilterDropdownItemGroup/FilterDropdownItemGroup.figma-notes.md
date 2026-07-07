# FilterDropdownItemGroup — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- Component set: `3032:18397` — "FilterDropdownItemGroup" — [open in Figma](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3032-18397)
- Tier: `Component` (Figma-tagged; composes a child component like ButtonGroup does) → `src/components/FilterDropdownItemGroup/`

A bordered card that stacks a vertical list of **FilterDropdownItem** rows — the option
list body of a filter dropdown.

## Dependencies
- **Composes [FilterDropdownItem](../FilterDropdownItem/FilterDropdownItem.figma-notes.md)** (Figma `3032:18152`).
  Confirmed via `data-name="FilterDropdownItem"` instances in the group's design context.
  Selection (multi-select toggle), hover, and the check icon all belong to the child;
  the group adds no JS of its own — it links `FilterDropdownItem.js`.

## Variant matrix (2 = Property 1)

| Node ID | Property 1 | Effect | Built |
|---|---|---|---|
| 3032:18245 | w/Subtext | child items render `.filter-dropdown-item__sub` | ✅ |
| 3032:18398 | Default | child items omit sub text | ✅ |

**Axis note:** Property 1 changes only the child items' sub text — the container CSS is
identical in both variants. Represented by including / omitting the `__sub` span in the
demo and Code Connect example, not by a container modifier class.

## CSS Class Mapping

| Figma element | CSS class |
|---|---|
| Card container | `.filter-dropdown-item-group` |
| Rows | `.filter-dropdown-item` (child component) |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Container bg | `--ai-surface-primary` | `--ai-surface-primary` |
| Container border | `--ai-border-secondary` (1px) | `--ai-border-secondary` |
| Container radius | `--ai-spacing-3` (8px) *(see gaps)* | `--ai-radius-md` (8px) |
| Container padding | `--ai-spacing-3` (8px) | `--ai-spacing-3` |
| Row gap | `--ai-spacing-px` (1px) | `--ai-spacing-px` |

## Token Gaps / Decisions
- **No token gaps** — every value maps to an existing `--ai-*` token.
- **Radius binding quirk:** Figma bound the container `border-radius` to `--ai-spacing-3`
  (a spacing token, 8px). Used `--ai-radius-md` (same 8px, correct category) — matches the
  same decision made on FilterDropdownItem.

## Notes
- **Width:** the Figma frame is 296px, but the group is built `width: 100%` to fill whatever
  dropdown contains it (the demo constrains it to 296px for the gallery).
- The 1px row gap (`--ai-spacing-px`) is a real token, not an optical border width.
- No standalone JS — the group relies on `FilterDropdownItem.js` (loaded in the demo) for
  the child items' multi-select toggle behaviour.
