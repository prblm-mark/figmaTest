# PromptTemplates — Figma Notes

## Figma Node
- File key: `Ikv8jxb5dcRH8ff4q4dR11`
- Frame node: `2:7662` (single variant — no component set with multiple variants found)

## Variant Matrix
Single variant only.

## CSS Class Mapping

| Figma element | CSS class |
|---|---|
| Root panel | `.prompt-templates` |
| Heading block | `.prompt-templates__heading` |
| Title ("Prompt Templates") | `.prompt-templates__title` |
| Description paragraph | `.prompt-templates__description` |
| Item list container | `.prompt-templates__list` |
| Individual items | `.prompt-template-item` (PromptTemplateItem component) |

## Token Mapping

| Figma variable | CSS token | Role |
|---|---|---|
| `--ao-spacing-5` | `--ao-spacing-5` | Gap between heading and list |
| `--ao-spacing-3` | `--ao-spacing-3` | Gap between list items |
| `--ao-font-title` | `--ao-font-title` | Title font family |
| `--ao-font-bold` | `--ao-font-bold` | Title weight |
| `--ao-font-fixed-sm` | `--ao-font-fixed-sm` | Title font size |
| `--ao-leading-xs` | `--ao-leading-xs` | Title line height |
| `--ao-text-primary` | `--ao-text-primary` | Title colour |
| `--ao-font-body` | `--ao-font-body` | Description font family |
| `--ao-font-regular` | `--ao-font-regular` | Description weight |
| `--ao-font-fixed-xs` | `--ao-font-fixed-xs` | Description font size |
| `--ao-leading-md` | `--ao-leading-md` | Description line height |
| `--ao-text-contrast` | `--ao-text-contrast` | Description colour |

## Token Gaps
None — all design values map to `--ao-*` semantic tokens.

## Dependencies
- `PromptTemplateItem` — individual list items

## Notes
- Heading text taken exactly from Figma: "Prompt Templates" + the full description paragraph.
- Panel width in Figma is 400px — demo page scopes it to `max-width: 400px`.
- No mobile/responsive variant found in Figma.
- Item description copy for items 2–6 is placeholder — real copy to be confirmed by product team.
