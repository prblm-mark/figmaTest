# PromptTemplates — Figma Notes

## Figma Node
- File key: `8OAAokH2JXhIvGZFrlzeKT`
- Frame node: `163:3565` (single variant — no component set with multiple variants found)

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
| `--ai-spacing-5` | `--ai-spacing-5` | Gap between heading and list |
| `--ai-spacing-3` | `--ai-spacing-3` | Gap between list items |
| `--ai-font-title` | `--ai-font-title` | Title font family |
| `--ai-font-bold` | `--ai-font-bold` | Title weight |
| `--ai-font-fixed-sm` | `--ai-font-fixed-sm` | Title font size |
| `--ai-leading-1` | `--ai-leading-1` | Title line height |
| `--ai-text-primary` | `--ai-text-primary` | Title colour |
| `--ai-font-body` | `--ai-font-body` | Description font family |
| `--ai-font-regular` | `--ai-font-regular` | Description weight |
| `--ai-font-fixed-xs` | `--ai-font-fixed-xs` | Description font size |
| `--ai-leading-2` | `--ai-leading-2` | Description line height |
| `--ai-text-contrast` | `--ai-text-contrast` | Description colour |

## Token Gaps
None — all design values map to `--ai-*` semantic tokens.

## Dependencies
- `PromptTemplateItem` — individual list items

## Notes
- Heading text taken exactly from Figma: "Prompt Templates" + the full description paragraph.
- Panel width in Figma is 400px — demo page scopes it to `max-width: 400px`.
- No mobile/responsive variant found in Figma.
- Item description copy for items 2–6 is placeholder — real copy to be confirmed by product team.
