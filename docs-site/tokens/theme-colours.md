# Theme Colours

Semantic colour tokens that adapt across four modes: **Light**, **Dark**, **Chat Light**, and **Chat Dark**. These are the tokens used in component CSS.

## How modes work

| Mode | Activation | CSS file |
|---|---|---|
| Light | Default (`:root`) | `tokens.css` |
| Dark | `data-theme="dark"` on `<html>` | `tokens-dark.css` |
| Chat Light | `data-surface="chat"` on a container | `tokens-chat.css` |
| Chat Dark | Both attributes present | `tokens-chat-dark.css` |

Chat modes use a **pure neutral palette** (no blue undertone) distinct from the core semantic palette. Components use the same token names — the mode selector handles the value switch.

## Surface tokens

| Light | Dark | Token | Light | Dark | Chat Light | Chat Dark |
|---|---|---|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ffffff;border:1px solid #e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#1b1b1f;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-surface-primary` | `#FFFFFF` | `#1B1B1F` | `#FFFFFF` | `#212123` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ffffff;border:1px solid #e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#212123;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-surface-elevated-1` | `#FFFFFF` | `#212123` | `#FFFFFF` | `#2E2E32` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ffffff;border:1px solid #e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#2e2e32;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-surface-elevated-2` | `#FFFFFF` | `#2E2E32` | `#FFFFFF` | `#3C3C3F` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f6f6f7;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#212123;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-surface-minimal` | `#F6F6F7` | `#212123` | `#E2E2E3` | `#2E2E32` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#2e2e32;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-surface-secondary` | `#E2E2E3` | `#2E2E32` | `#FFFFFF` | `#2E2E32` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#c2c2c4;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#3c3c3f;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-surface-contrast` | `#C2C2C4` | `#3C3C3F` | `#F6F6F7` | `#1B1B1F` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#1b1b1f;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f6f6f7;vertical-align:middle"></span> | `--ai-surface-invert` | `#1B1B1F` | `#F6F6F7` | `#1B1B1F` | `#F6F6F7` |

### Elevation

Elevation tokens convey depth — surfaces that float above other surfaces.

- **Light mode:** All elevated surfaces are white (shadows handle depth)
- **Dark mode:** Elevated surfaces step up the neutral palette (shadows alone are invisible on dark)

| Light | Dark | Level | Use |
|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ffffff;border:1px solid #e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#1b1b1f;border:1px solid #3c3c3f;vertical-align:middle"></span> | Base (`surface-primary`) | Page background |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ffffff;border:1px solid #e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#212123;border:1px solid #3c3c3f;vertical-align:middle"></span> | `surface-elevated-1` | Cards, dropdowns, modals |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ffffff;border:1px solid #e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#2e2e32;border:1px solid #3c3c3f;vertical-align:middle"></span> | `surface-elevated-2` | Content on elevated surfaces |

### Brand surfaces

| Light | Dark | Token | Value | Use |
|---|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0071d8;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0071d8;vertical-align:middle"></span> | `--ai-surface-brand` | `#0071D8` | Primary action backgrounds |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#3a8fff;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#3a8fff;vertical-align:middle"></span> | `--ai-surface-brand-light` | `#3A8FFF` | Hover state on brand |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0054a3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0054a3;vertical-align:middle"></span> | `--ai-surface-brand-dark` | `#0054A3` | Pressed state on brand |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#bfd1ff;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#75a5ff;vertical-align:middle"></span> | `--ai-surface-brand-contrast` | `#BFD1FF` / `#75A5FF` | Light brand tint |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f0f3ff;border:1px solid #e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#bfd1ff;vertical-align:middle"></span> | `--ai-surface-brand-contrast-extra` | `#F0F3FF` / `#BFD1FF` | Very light brand tint |

## Text tokens

| Light | Dark | Token | Light | Dark | Use |
|---|---|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#212123;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f6f6f7;vertical-align:middle"></span> | `--ai-text-primary` | `#212123` | `#F6F6F7` | Body text, headings |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#3c3c3f;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#e2e2e3;vertical-align:middle"></span> | `--ai-text-secondary` | `#3C3C3F` | `#E2E2E3` | Supporting text |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#67676c;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#929295;vertical-align:middle"></span> | `--ai-text-contrast` | `#67676C` | `#929295` | Placeholder, captions |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ffffff;border:1px solid #e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#1b1b1f;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-text-invert` | `#FFFFFF` | `#1B1B1F` | Text on dark/brand backgrounds |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ef4444;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ef4444;vertical-align:middle"></span> | `--ai-text-error` | `#EF4444` | `#EF4444` | Error messages |

## Border tokens

| Light | Dark | Token | Light | Dark | Use |
|---|---|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#1b1b1f;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f6f6f7;vertical-align:middle"></span> | `--ai-border-primary` | `#1B1B1F` | `#F6F6F7` | Strong dividers |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#2e2e32;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-border-secondary` | `#E2E2E3` | `#2E2E32` | Default input/card borders |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#c2c2c4;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#3c3c3f;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-border-contrast` | `#C2C2C4` | `#3C3C3F` | Subtle borders |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#1b1b1f;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f6f6f7;vertical-align:middle"></span> | `--ai-border-invert` | `#1B1B1F` | `#F6F6F7` | Active/selected state borders |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0071d8;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0071d8;vertical-align:middle"></span> | `--ai-border-brand` | `#0071D8` | `#0071D8` | Brand-coloured borders |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ef4444;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ef4444;vertical-align:middle"></span> | `--ai-border-error` | `#EF4444` | `#EF4444` | Error state borders |

## Icon tokens

| Light | Dark | Token | Light | Dark | Use |
|---|---|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#212123;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f6f6f7;vertical-align:middle"></span> | `--ai-icon-primary` | `#212123` | `#F6F6F7` | Default icon colour |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#67676c;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#929295;vertical-align:middle"></span> | `--ai-icon-secondary` | `#67676C` | `#929295` | Secondary icon |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#929295;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#929295;vertical-align:middle"></span> | `--ai-icon-contrast` | `#929295` | `#929295` | Muted/disabled icon |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ffffff;border:1px solid #e2e2e3;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#1b1b1f;border:1px solid #3c3c3f;vertical-align:middle"></span> | `--ai-icon-invert` | `#FFFFFF` | `#1B1B1F` | Icon on dark background |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0071d8;vertical-align:middle"></span> | <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0071d8;vertical-align:middle"></span> | `--ai-icon-brand` | `#0071D8` | `#0071D8` | Brand-coloured icon |

## Figma source

- **Light + Dark modes:** Design System library → Semantic collection
- **Chat Light + Chat Dark modes:** AI Chat file → Semantic collection (local variables aliasing published Primitives)
