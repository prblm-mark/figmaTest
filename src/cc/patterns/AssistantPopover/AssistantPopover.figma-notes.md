# AssistantPopover — Figma Notes

## Figma Node
- **File key:** `ETKqleZdpertwFEo40YB5n` (Affino CC Hybrid – Design System)
- **Component (Tier=Pattern, Type=Pop Over):** `4218:5304` (320×277)
- Children: header `4218:5305` (ChatHeader instance, 320×56), body frame `4218:5306`
  (intro `4218:5307` with hidden Title + visible Subtext `4218:5309`), Launch button
  instance `4218:5337` (288×40).

## Architecture decision
Figma models this as the `AiAssistant` component's `Type=Pop Over` variant, but per user
direction it is built as a **standalone pattern** (`src/cc/patterns/AssistantPopover/`),
**not** part of the AiAssistant template. The header is **self-contained** (own BEM
classes) — it resembles the CC ChatHeader treatment but is not the ChatHeader component
(different slots: AI badge + close, no sidebar toggle / agent selector). Decisions taken
2026-06-03.

## Variant matrix
Single variant — `Type=Pop Over`. No size/state axes in Figma. Scoped to this one variant
by user instruction (behaviour to be specced later).

## CSS Class Mapping
| Figma | CSS |
|---|---|
| Pop Over root (`4218:5304`) | `.cc-assistant-popover` |
| Header (`4218:5305`, ChatHeader instance) | `.cc-assistant-popover__header` |
| Header left container | `.cc-assistant-popover__brand` |
| AI badge (32px, sparkles) | `.cc-assistant-popover__badge` + `<i data-lucide="sparkles">` |
| "Affino Assistant" title | `.cc-assistant-popover__title` |
| Close button | `.cc-assistant-popover__close` (`btn btn--tertiary btn--sm btn--icon`, `x`) |
| Body frame (`4218:5306`) | `.cc-assistant-popover__body` |
| Intro (`4218:5307`/`4218:5309`) | `.cc-assistant-popover__intro` > 2× `<p>` |
| Launch button (`4218:5337`) | `.cc-assistant-popover__launch` (`btn btn--primary`, `arrow-right`) |

## Token Mapping
| Figma variable | CSS token | Role |
|---|---|---|
| `--ai-surface-primary` | `--ai-surface-primary` | Card background |
| `--ai-radius-lg` (16) | `--ai-radius-lg` | Card radius |
| `--ai-size-6` (320) | `--ai-size-6` | Card width |
| `light/shadow-md` | `--ai-shadow-md` | Card drop shadow (offset 0,2 / blur 10) |
| `--ai-border-secondary` | `--ai-border-secondary` | Header bottom divider (1px) |
| `--ai-spacing-4` (12) | `--ai-spacing-4` | Header padding |
| `--ai-spacing-5` (16) | `--ai-spacing-5` | Header gap; body padding + gap |
| `--ai-spacing-3` (8) | `--ai-spacing-3` | Brand gap; intro paragraph gap (see Gaps) |
| `--ai-spacing-7` (32) | `--ai-spacing-7` | AI badge size |
| `--ai-radius-md` (8) | `--ai-radius-md` | AI badge radius |
| `--cc-actions-menu-secondary-bg` | `--cc-actions-menu-secondary-bg` | AI badge background |
| `--cc-actions-menu-icon` | `--cc-actions-menu-icon` | AI badge sparkles colour |
| `--ai-icon-size-sm` (16) | `--ai-icon-size-sm` | Badge icon size |
| `--ai-font-fixed-xs` (14) + `--ai-font-semibold` + `--ai-leading-md` (24) | same | Title type |
| `--ai-text-primary` | `--ai-text-primary` | Title colour |
| `--ai-font-fixed-xs` (14) + `--ai-font-regular` | same | Intro type — **user override** to fixed-xs (Figma bound `--ai-font-fluid-sm`) |
| `--ai-text-secondary` | `--ai-text-secondary` | Intro colour |
| `--ai-btn-primary-*` | (Button component) | Launch button |
| `--ai-btn-tertiary-*` | (Button component) | Close button |

## Token Gaps
- **Intro paragraph gap = 7px in Figma** (`mb-[7px]`), no `--ai-spacing-*` token equals 7.
  **Resolved (user, 2026-06-03):** use `--ai-spacing-3` (8px), the nearest token.
- Intro `line-height: 1.5` — Figma `leading-[1.5]` unitless ratio (not a px leading token);
  kept as the ratio, same approach as IconNavigation labels.

## Notes
- **Standalone, not the AiAssistant.** Figma's component is `AiAssistant / Type=Pop Over`,
  but built here as its own pattern per user direction.
- **`--cc-actions-menu-icon` value mismatch:** Figma reports `#335562` for this token; the
  project's `tokens-cc.css` currently has `#667f89`. Used the **token** (source of truth in
  code); the value drift is a designer-sync matter, not hardcoded around.
- Badge glyph is a standard `sparkles` (Lucide), not a bespoke brand SVG. Sized via
  `.cc-assistant-popover__badge [data-lucide]` (Lucide swaps the `<i>` for `<svg>`, so the
  size selector targets `[data-lucide]`, the project convention — not `i`).
- **Close button bg (scoped override):** in the CC brand `--ai-btn-tertiary-bg` is a visible
  grey (`#e5e9eb`), so `.cc-assistant-popover__close` forces `background-color: transparent`
  by default (user, 2026-06-03). Hover/active still come from `btn--tertiary`.
- Body has a **hidden** "Title" text node in Figma (`4218:5308`) — only the subtext renders.
- Lucide icons: `sparkles` (badge), `x` (close), `arrow-right` (Launch trailing).
- **Dismiss wired (`AssistantPopover.js`, 2026-06-03):** clicking `.cc-assistant-popover__close`
  removes the pop-over from the DOM (document-delegated). The rest of the behaviour
  (positioning, when it appears, re-show) is still to be specced separately.
- Requires `data-brand="cc"` on an ancestor for the `--cc-*` badge tokens.

## Dependencies
- `Button` (`src/components/Button/`) — Launch (`btn btn--primary`) + close (`btn btn--tertiary btn--sm btn--icon`).
- `AssistantPopover.js` — close-to-dismiss behaviour.
- Lucide icons.
