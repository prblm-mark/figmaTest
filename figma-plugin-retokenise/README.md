# Re-tokenise — Figma Plugin

Walks selected frames and rebinds raw hardcoded values (hex colors, pixel
dimensions) back to Figma variables. Designed to run after `generate_figma_design`
captures, which produce frames with resolved values instead of variable bindings.

## What it rebinds

| Property type | Method | Examples |
|---|---|---|
| Fills (solid) | `setBoundVariableForPaint` | Background colors |
| Strokes (solid) | `setBoundVariableForPaint` | Border colors |
| Padding | `setBoundVariable` | `paddingLeft`, `paddingTop`, etc. |
| Border radius | `setBoundVariable` | `topLeftRadius`, etc. |
| Spacing | `setBoundVariable` | `itemSpacing`, `counterAxisSpacing` |
| Dimensions | `setBoundVariable` | `width`, `height`, `min/max` |
| Stroke weight | `setBoundVariable` | `strokeWeight` |
| Opacity | `setBoundVariable` | `opacity` |

## How it works

1. **`inferredVariables`** (primary) — Figma's built-in value matching. If a
   node's raw value matches exactly one local variable, it's auto-detected.
2. **Manual lookup** (fallback) — Builds hex-to-variable and float-to-variable
   maps from all local variables. Matches raw node values against these maps.
3. **Ambiguity handling** — If multiple variables share the same value, the
   plugin uses name-based heuristics (e.g. prefer "spacing" vars for padding
   fields, "radius" vars for corner fields). If still ambiguous, it skips.

## Setup (local development — no publishing needed)

1. Open **Figma desktop app** (required — browser Figma can't load local plugins)
2. Go to **Plugins → Development → Import plugin from manifest...**
3. Select `figma-plugin-retokenise/manifest.json` from this repo
4. The plugin appears under **Plugins → Development → Re-tokenise**

## Usage

1. Select one or more frames (e.g. a captured prototype frame)
2. Run **Plugins → Development → Re-tokenise**
3. The plugin reports how many variables were bound

## Limitations

- Only rebinds **solid paints** (not gradients)
- Requires variables to exist in the **same file** (local variables)
- For library variables, the file must have them published/imported first
- Text node typography (font-size, font-weight, line-height) is not yet
  supported — Figma's `inferredVariables` handles some of these automatically
