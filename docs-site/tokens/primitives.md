# Primitives

Primitives are the raw colour palette — the building blocks that semantic tokens alias. **Never use primitive values directly in component CSS.** Always use the semantic `--ai-*` tokens.

## Neutral Palette

Pure grey scale with no blue undertone. Used across all surface, text, border, and icon tokens.

| Swatch | Name | Hex | Usage |
|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ffffff;border:1px solid #e2e2e3;vertical-align:middle"></span> | Neutral/0 | `#FFFFFF` | White — primary surfaces (light mode) |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f6f6f7;vertical-align:middle"></span> | Neutral/100 | `#F6F6F7` | Subtle backgrounds, elevated surfaces |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#e2e2e3;vertical-align:middle"></span> | Neutral/200 | `#E2E2E3` | Secondary surfaces, borders |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#c2c2c4;vertical-align:middle"></span> | Neutral/300 | `#C2C2C4` | Contrast surfaces, muted borders |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#929295;vertical-align:middle"></span> | Neutral/500 | `#929295` | Muted icons, contrast text |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#67676c;vertical-align:middle"></span> | Neutral/600 | `#67676C` | Placeholder text, secondary icons |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#3c3c3f;vertical-align:middle"></span> | Neutral/700 | `#3C3C3F` | Secondary text, elevated-2 (dark) |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#212123;vertical-align:middle"></span> | Neutral/800 | `#212123` | Primary text, elevated-1 (dark) |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#1b1b1f;vertical-align:middle"></span> | Neutral/900 | `#1B1B1F` | Inverted surfaces, primary borders (dark) |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0b0b0c;vertical-align:middle"></span> | Neutral/1000 | `#0B0B0C` | Deepest black — Tooltip bg |

## Brand Blue

| Swatch | Name | Hex |
|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f0f3ff;vertical-align:middle"></span> | Blue/FB/50 | `#F0F3FF` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#bfd1ff;vertical-align:middle"></span> | Blue/FB/100 | `#BFD1FF` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#75a5ff;vertical-align:middle"></span> | Blue/FB/300 | `#75A5FF` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#3a8fff;vertical-align:middle"></span> | Blue/FB/400 | `#3A8FFF` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0071d8;vertical-align:middle"></span> | Blue/FB/500 | `#0071D8` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0054a3;vertical-align:middle"></span> | Blue/FB/700 | `#0054A3` |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#0f406b;vertical-align:middle"></span> | Blue/FB/900 | `#0F406B` |

## Status Colours

| Swatch | Name | Hex | Use |
|---|---|---|---|
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#30cb90;vertical-align:middle"></span> | Aqua/500 | `#30CB90` | Success — theme-invariant |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#ef4444;vertical-align:middle"></span> | Red/500 | `#EF4444` | Error/alert |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#f87171;vertical-align:middle"></span> | Red/400 | `#F87171` | Alert hover |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#dc2626;vertical-align:middle"></span> | Red/600 | `#DC2626` | Alert pressed |
| <span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:#fbd5d5;vertical-align:middle"></span> | Red/100 | `#FBD5D5` | Error tint bg |

## Figma source

Primitives live in the **Design System** library file → **Primitives** collection. They are published and available to all consuming files.
