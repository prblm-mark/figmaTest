# ChatSidebar — Figma Notes

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt`
- **Component set:** `2122:4936`
- **URL:** [node 2122:4936](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2122-4936)

## Variant table

| Node ID | Variant | Notes |
|---|---|---|
| `2122:3933` | Tier=Pattern, Dark Mode=False | Light sidebar |
| `2122:4937` | Tier=Pattern, Dark Mode=True | Dark sidebar |

Dark Mode handled by `data-sidebar-theme="light|dark"` via `sidebar-colors.js`, not separate CSS.

## CSS class mapping

| Figma element | CSS class |
|---|---|
| Sidebar container | `.chat-sidebar` |
| Logo area | `.chat-sidebar__logo` |
| Actions group | `.chat-sidebar__actions` |
| Sections container | `.chat-sidebar__sections` |
| Section group | `.chat-sidebar__section` |
| Section label | `.chat-sidebar__section-label` |

## Token mapping

| Property | Token | Value |
|---|---|---|
| Width | `--ai-size-5` | 280px |
| Padding | `--ai-spacing-4` | 12px |
| Gap (top-level) | `--ai-spacing-4` | 12px |
| Background | `--ai-chat-sidebar-bg` | white / #18222f (computed) |
| Border right | `1px solid --ai-border-secondary` | |
| Logo area py | `--ai-spacing-5` | 16px |
| Sections gap | `--ai-spacing-5` | 16px |
| Section items gap | `1px` | optical separator |
| Label px | `--ai-spacing-3` | 8px |
| Label py | `--ai-spacing-2` | 6px |
| Label font | `body/xxs` — `--ai-font-fixed-xxs` / `--ai-font-regular` / `--ai-leading-xs` | 12px |
| Label color | `var(--ai-chat-sidebar-text)` + `opacity: 0.6` | Computed muted text |

## Token gaps

- **Section label letter-spacing:** Figma shows 0.12px (`body/xxs` letterSpacing: 1). No `--ai-tracking-*` token matches exactly. Skipped — value is < 0.2px and barely perceptible.
- **Section label color deviation:** Figma uses `--ai-text-secondary` but this doesn't adapt to custom sidebar backgrounds. Implementation uses computed `--ai-chat-sidebar-text` with `opacity: 0.6` instead (per user decision). Figma will be updated to match.

## Dependencies

- **ChatSidebarItem** (`src/components/ChatSidebarItem/`) — Action + Thread types
- **ChatSidebarMenu** (`src/components/ChatSidebarMenu/`) — context menu dropdown
- **sidebar-colors.js** (`src/utils/`) — luminance detection + `data-sidebar-theme` setter
- **Lucide icons:** `message-square`, `search`, `pin`, `ellipsis`, `bookmark`, `copy`, `link`, `trash-2`

## HTML structure

```html
<aside class="chat-sidebar" id="sidebar">
  <div class="chat-sidebar__logo">
    <img src="logo.svg" alt="Affino">
  </div>
  <div class="chat-sidebar__actions">
    <!-- ChatSidebarItem --action × N -->
  </div>
  <div class="chat-sidebar__sections">
    <div class="chat-sidebar__section">
      <span class="chat-sidebar__section-label">Saved</span>
      <!-- ChatSidebarItem (thread) × N -->
    </div>
    <!-- more sections -->
  </div>
</aside>
```

## Notes

- Sidebar height is `100%` (fills parent) — Figma frame uses 953px as a design-time height
- Sections container is scrollable (`overflow-y: auto; flex: 1; min-height: 0`)
- Logo slot is a simple `<img>` — consuming application provides the logo asset
- Saved items use `--pinned` modifier to show the pin icon
- The 1px gap between section items is an optical separator (same precedent as VersionHistory timeline line)
