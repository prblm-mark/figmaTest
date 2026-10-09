# WCAG 2.1 AA Contrast Audit

Full six-mode audit of the Affino Design System colour tokens, run against the token CSS
generated from the Aug 2026 Figma re-export. Last refreshed **2026-08-24** after the dark-mode
brand ramp was darkened one step (`surface.brand` `#30B6C2` → `#009FBA` in Dark and CCDark).

Reproduce with:

```bash
npm run tokens          # generated CSS is the input — audit what ships, not the Figma JSON
node scripts/contrast-audit.mjs          # human-readable, exits 1 on any blocking failure
node scripts/contrast-audit.mjs --md     # the tables in this document
node scripts/contrast-audit.mjs --json   # machine-readable, for diffing two builds
```

To compare against another build (this is how the regression column below was produced):

```bash
TOKENS_DIR=/path/to/other/css node scripts/contrast-audit.mjs --json
```

---

## Headline

**552 pairings** audited across Light, Dark, ChatLight, ChatDark, CCLight and CCDark.

| | Count |
|---|---|
| Passing | 398 |
| **Blocking failures** | **96** |
| Advisory (decorative, arguably 1.4.11-exempt) | 52 |
| Informational (disabled controls, WCAG-exempt) | 6 |

Of the 96 blocking failures, measured against a rebuild of the commit before the rework landed (`ee814890`):

- **41 are regressions** introduced by the Aug 2026 rework — they passed before.
- **55 are pre-existing** — they failed before the rework too.
- **14 pairings were *fixed*** by the rework (mostly `--ao-text-brand`, which gained 2–3× contrast
  in the dark and chat modes).

The 96 failures collapse into **27 distinct token pairs**, and every one of them falls under one
of the seven root causes below — so fixing those seven clears the whole list.

| Root cause | Failures | Regression? |
|---|---|---|
| 1. `--ao-text-invert` does not flip in dark mode | 6 | yes |
| 2. Primary button: white on mid-tone teal | 13 | yes (4 of 13; hover was already failing) |
| 3. Invert text on solid status fills | 24 | mostly |
| 4. `--ao-text-contrast` too light on tinted surfaces | 18 | partly |
| 5. Focus indicator / `--ao-border-brand` | 7 | yes |
| 6. Status text on its own soft fill | 12 | yes |
| 7. Control boundaries (input/card borders) | 16 | no — pre-existing |

### Thresholds and severity

`4.5:1` for normal text (SC 1.4.3); `3:1` for large text, meaning-bearing icons, control
boundaries and focus indicators (SC 1.4.11).

**Advisory** means a border sitting alongside a tinted fill and coloured text that already carry
the meaning, a table gridline, or the explicitly-muted icon token. SC 1.4.11 covers boundaries
*required to understand the content*, so these are arguably exempt — but they are listed in full
because collectively they are why the UI can read as low-definition.

---

## Root causes, worst first

### 1. `--ao-text-invert` does not flip in dark mode — REGRESSION, and a clear bug

`--ao-icon-invert` correctly inverts between themes. `--ao-text-invert` does not.

| Token | Light | Dark |
|---|---|---|
| `--ao-surface-invert` | `#1E293B` (dark) | `#F1F5F9` (light) |
| `--ao-icon-invert` | `#FFFFFF` | `#0F172A` — flips |
| `--ao-text-invert` | `#FFFFFF` | `#E2E8F0` — **stays light** |
| `--ao-text-invert-secondary` | `#FFFFFF` | `#CAD5E2` — **stays light** |

So in dark mode, inverted text lands light-on-light:

| Pairing | Was | Now | Needs |
|---|---|---|---|
| `--ao-text-invert` on `--ao-surface-invert` | 15.90:1 | **1.13:1** | 4.5:1 |
| `--ao-text-invert-secondary` on `--ao-surface-invert` | 13.97:1 | **1.36:1** | 4.5:1 |
| `--ao-icon-invert-secondary` on `--ao-surface-invert` | 13.97:1 | **2.34:1** | 3:1 |

This is the single most severe finding — a 15.90 → 1.13 collapse means inverted text is
effectively invisible in dark mode. Affects Dark and CCDark.

**Fix:** in Figma, point dark-mode `text/invert` and `text/invert-secondary` at dark steps, the
way `icon/invert` already does (`Grey/850 #172033` or matching `icon-invert`'s `#0F172A`).
6 failures.

### 2. Primary button: white text on a mid-tone teal fill — REGRESSION

The dark-mode brand ramp was darkened one step on 2026-08-24, which moved every dark button
state in the right direction without clearing the line:

| Mode | State | Fill | Was | Now | Needs |
|---|---|---|---|---|---|
| Dark | hover | `#30B6C2` | 1.88:1 | **2.44:1** | 4.5:1 |
| Dark | base | `#009FBA` | 2.44:1 | **3.15:1** | 4.5:1 |
| Dark | pressed | `#0094AD` | 3.15:1 | **3.60:1** | 4.5:1 |
| CCDark | base | `#009FBA` | 2.44:1 | **3.15:1** | 4.5:1 |
| CCDark | hover | `#0094AD` | 1.88:1 | **3.60:1** | 4.5:1 |
| CCDark | pressed | `#007A8D` | 3.15:1 | 5.04:1 | ✅ passes |
| Light / CCLight | base | `#0094AD` | — | **3.60:1** | 4.5:1 |
| Light / CCLight | hover | `#009FBA` | — | **3.15:1** | 4.5:1 |
| ChatLight / ChatDark | base | `#0588F0` | — | **3.63:1** | 4.5:1 |

**Dark mode cannot be fixed by darkening the fill.** There is a squeeze: the label needs 4.5:1
against the fill, and the fill itself needs 3:1 against the dark page surface (`#1E293B`). No
Lagoon step satisfies both with white text.

| Fill | White label | Dark label `Grey/900 #0F172A` | Fill vs dark page |
|---|---|---|---|
| `Lagoon/8 #30B6C2` | 2.44:1 | **7.31:1** | 5.99:1 |
| `Lagoon/9 #009FBA` (current) | 3.15:1 | **5.67:1** | 4.65:1 |
| `Lagoon/10 #0094AD` | 3.60:1 | **4.96:1** | 4.07:1 |
| `Lagoon/11 #007A8D` | **5.04:1** | 3.54:1 | **2.90:1** ✗ |

`Lagoon/11` is the only step that passes with white — and it is the only one whose button
becomes hard to see against the page.

**Fix — the two themes want opposite answers, which is exactly what a theme-aware token is for:**

- **Dark and CCDark:** keep the fill where it now is and set `--ao-btn-primary-text` to a dark
  value. `Grey/900 #0F172A` on the current `#009FBA` gives **5.67:1**, and the fill stays 4.65:1
  against the page. Both thresholds clear with no further fill change.
  `--ao-btn-primary-text` is already a per-mode token — it is simply `#FFFFFF` in all six modes
  today, so this is a value change in two modes, not a new token.
- **Light and CCLight:** the opposite — keep white text and darken the fill to
  `Lagoon/11 #007A8D` (**5.04:1**), which is already in the system as `--ao-surface-brand-dark`.
- **ChatLight / ChatDark:** BlueRadix step 11 `#0D74CE` gives 5.07:1 with white.

Note the hover direction is also inconsistent between modes: Dark's hover goes *lighter* than its
base (`surface.brand-light`), so hover contrast is worse than rest, while CCDark's button tokens
were re-pointed to go *darker* on hover. Worth aligning. 13 failures.

### 3. `--ao-text-invert` on solid status fills — mostly REGRESSION

White (or near-white, in dark) label text on the solid status colours:

| Fill | Value | Worst ratio | Needs |
|---|---|---|---|
| `--ao-surface-warning` | `#F76B15` | **2.41:1** | 4.5:1 |
| `--ao-surface-success` | `#30A46C` | **2.56:1** | 4.5:1 |
| `--ao-surface-info` | `#0094AD` / `#30B6C2` | **1.98:1** | 4.5:1 |
| `--ao-surface-error` | `#E5484D` | **3.17:1** | 4.5:1 |
| `--ao-surface-neutral` | `#64748B` | **2.21:1** | 4.5:1 |

All five status families sit at Radix step 9/10. Radix designs those steps for solid fills with
*low-contrast* text and directs you to step 11+ when the text must be readable.

**Fix:** for any badge/banner that puts label text on a solid status fill, use each family's
**step 11** — which the system already holds as `--ao-text-{status}`:
`#CC4E00` (4.51:1), `#218358` (4.72:1), `#CE2C31` (5.21:1), all against white.
Alternatively keep the step-9 fills and use dark text. 24 failures.

### 4. `--ao-text-contrast` is too light for tinted surfaces — partly REGRESSION

It passes on pure white (4.76:1 in Light) but fails on every tinted surface it actually sits on:

| Mode | Ratio range | Surfaces affected |
|---|---|---|
| Light | 4.08–4.34:1 | secondary, elevated-2, input |
| Dark | 3.46–4.04:1 | secondary, elevated-2 |
| ChatDark | 3.54–4.36:1 | elevated-1, elevated-2, minimal, secondary |
| CCLight | 3.58–4.23:1 | **including plain white** at 4.23:1 |

This token is documented as "placeholder, captions" — real text, so 4.5:1 applies.

**Fix:** darken one step. `Grey/550 #55647A` gives **5.16:1** even on the lightest tinted
surface (`#E9EEF4`). 18 failures. Note CCLight fails on white too, so CC needs its own step down.

### 5. Focus indicator and `--ao-border-brand` below 3:1 — REGRESSION

| Mode | Value | Ratio | Was |
|---|---|---|---|
| Light / CCLight | `#30B6C2` | **2.44:1** | 5.17:1 |
| ChatLight | `#5EB1EF` | **2.33:1** | 4.82:1 |
| Dark / CCDark | `#007A8D` | **2.90:1** | 3.56:1 |

SC 1.4.11 explicitly covers focus indicators, so this one is not arguable.

**Fix:** `border-brand` should use `Lagoon/10 #0094AD` (**3.60:1**) in light, or step 11
`#007A8D` (5.04:1). In ChatLight, BlueRadix step 10 `#0588F0` gives 3.68:1.

Related: in ChatLight, `--ao-surface-brand` and `--ao-icon-brand` `#0588F0` drop to 2.80:1 on
`--ao-surface-minimal #E2E2E3` — the chat "minimal" surface is much darker than the default one,
so the brand needs a step more contrast there specifically. 7 failures for this cause in total.

### 6. Status text on its own soft fill, marginally short — REGRESSION

| Pairing | Ratio | Needs |
|---|---|---|
| `--ao-text-warning` `#CC4E00` on `--ao-surface-warning-soft` | **3.99:1** | 4.5:1 |
| `--ao-text-success` `#218358` on `--ao-surface-success-soft` | **4.21:1** | 4.5:1 |
| `--ao-text-error` `#E5484D` on `--ao-surface-error-soft` (dark) | **4.17:1** | 4.5:1 |
| `--ao-text-error` `#E5484D` on `--ao-surface-primary` (dark) | **3.74:1** | 4.5:1 |

These were comfortable before (6.88:1, 7.29:1, 5.84:1) and are now just under. One step darker on
the text — or one step lighter on the soft fill — clears each. 12 failures.

### 7. Control boundaries below 3:1 — PRE-EXISTING, not caused by the rework

| Token | Worst | Role |
|---|---|---|
| `--ao-border-secondary` | **1.22:1** | the default input and card border |
| `--ao-border-contrast` | **1.07:1** | stronger borders |
| `--ao-btn-secondary-border` | **1.29:1** | outline-button boundary |

Fails in all six modes and failed before the rework too (old `#E2E2E3` on white was 1.29:1). An
input's outline is the only thing that marks where the control is, so SC 1.4.11 applies. Worth
noting the rework *improved* one of these — dark `btn-secondary-border` went 1.56 → 3.07:1 and
now passes.

**Fix:** this is a deliberate design-language decision about how visible form boundaries should
be, not a token-value slip. It needs a designer call, not a mechanical bump. 16 failures.

---

## Full results by mode

<!-- Generated by scripts/contrast-audit.mjs --md — do not hand-edit below this line. -->

Audited **552 pairings** across 6 modes: **96 fail**, 398 pass.

### Light — 15 failures

Selector: `:root`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ao-border-secondary`<br>`#e2e8f0` | `--ao-surface-primary`<br>`#ffffff` | **1.23:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ao-btn-secondary-border`<br>`#d6dee8` | `--ao-surface-primary`<br>`#ffffff` | **1.36:1** | 3:1 | Buttons — outline button boundary |
| `--ao-border-brand`<br>`#30b6c2` | `--ao-surface-primary`<br>`#ffffff` | **2.44:1** | 3:1 | Focus indicator |
| `--ao-border-contrast`<br>`#94a3b8` | `--ao-surface-primary`<br>`#ffffff` | **2.56:1** | 3:1 | Structural borders |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-warning`<br>`#f76b15` | **2.97:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-btn-primary-text-hover`<br>`#ffffff` | `--ao-btn-primary-bg-hover`<br>`#009fba` | **3.15:1** | 4.5:1 | Buttons — hover |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-success`<br>`#30a46c` | **3.16:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-info`<br>`#0094ad` | **3.60:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-btn-primary-text`<br>`#ffffff` | `--ao-btn-primary-bg`<br>`#0094ad` | **3.60:1** | 4.5:1 | Buttons |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-error`<br>`#e5484d` | **3.91:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-warning`<br>`#cc4e00` | `--ao-surface-warning-soft`<br>`#ffefd6` | **3.99:1** | 4.5:1 | Status text on soft fill |
| `--ao-text-contrast`<br>`#64748b` | `--ao-surface-secondary`<br>`#e9eef4` | **4.08:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-success`<br>`#218358` | `--ao-surface-success-soft`<br>`#e6f6eb` | **4.21:1** | 4.5:1 | Status text on soft fill |
| `--ao-text-contrast`<br>`#64748b` | `--ao-surface-elevated-2`<br>`#f1f5f9` | **4.34:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-contrast`<br>`#64748b` | `--ao-surface-input`<br>`#f1f5f9` | **4.34:1** | 4.5:1 | Body text on surfaces — placeholder |

### Dark — 18 failures

Selector: `[data-theme="dark"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-invert`<br>`#f1f5f9` | **1.13:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-invert-secondary`<br>`#cad5e2` | `--ao-surface-invert`<br>`#f1f5f9` | **1.36:1** | 4.5:1 | Body text on surfaces |
| `--ao-border-secondary`<br>`#334155` | `--ao-surface-primary`<br>`#1e293b` | **1.41:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ao-border-contrast`<br>`#475569` | `--ao-surface-primary`<br>`#1e293b` | **1.93:1** | 3:1 | Structural borders |
| `--ao-icon-invert-secondary`<br>`#94a3b8` | `--ao-surface-invert`<br>`#f1f5f9` | **2.34:1** | 3:1 | Icons on surfaces |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-warning`<br>`#f76b15` | **2.41:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-btn-primary-text-hover`<br>`#ffffff` | `--ao-btn-primary-bg-hover`<br>`#30b6c2` | **2.44:1** | 4.5:1 | Buttons — hover |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-info`<br>`#009fba` | **2.55:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-success`<br>`#30a46c` | **2.56:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-border-brand`<br>`#007a8d` | `--ao-surface-primary`<br>`#1e293b` | **2.90:1** | 3:1 | Focus indicator |
| `--ao-btn-primary-text`<br>`#ffffff` | `--ao-btn-primary-bg`<br>`#009fba` | **3.15:1** | 4.5:1 | Buttons |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-error`<br>`#e5484d` | **3.17:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-contrast`<br>`#94a3b8` | `--ao-surface-secondary`<br>`#3d4b5f` | **3.46:1** | 4.5:1 | Body text on surfaces |
| `--ao-btn-primary-text`<br>`#ffffff` | `--ao-btn-primary-bg-pressed`<br>`#0094ad` | **3.60:1** | 4.5:1 | Buttons — pressed |
| `--ao-text-error`<br>`#e5484d` | `--ao-surface-primary`<br>`#1e293b` | **3.74:1** | 4.5:1 | Status text on page |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-neutral`<br>`#64748b` | **3.86:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-contrast`<br>`#94a3b8` | `--ao-surface-elevated-2`<br>`#334155` | **4.04:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-error`<br>`#e5484d` | `--ao-surface-error-soft`<br>`#3b1219` | **4.17:1** | 4.5:1 | Status text on soft fill |

### ChatLight — 15 failures

Selector: `[data-surface="chat"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ao-border-contrast`<br>`#f6f6f7` | `--ao-surface-primary`<br>`#ffffff` | **1.08:1** | 3:1 | Structural borders |
| `--ao-border-secondary`<br>`#e2e2e3` | `--ao-surface-primary`<br>`#ffffff` | **1.29:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ao-btn-secondary-border`<br>`#e2e2e3` | `--ao-surface-primary`<br>`#ffffff` | **1.29:1** | 3:1 | Buttons — outline button boundary |
| `--ao-border-brand`<br>`#5eb1ef` | `--ao-surface-primary`<br>`#ffffff` | **2.33:1** | 3:1 | Focus indicator |
| `--ao-icon-brand`<br>`#0588f0` | `--ao-surface-minimal`<br>`#e2e2e3` | **2.80:1** | 3:1 | Icons on surfaces |
| `--ao-surface-brand`<br>`#0588f0` | `--ao-surface-minimal`<br>`#e2e2e3` | **2.80:1** | 3:1 | Focus indicator — focus ring |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-warning`<br>`#f76b15` | **2.97:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-success`<br>`#30a46c` | **3.16:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-btn-primary-text-hover`<br>`#ffffff` | `--ao-btn-primary-bg-hover`<br>`#0090ff` | **3.26:1** | 4.5:1 | Buttons — hover |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-info`<br>`#0588f0` | **3.63:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-btn-primary-text`<br>`#ffffff` | `--ao-btn-primary-bg`<br>`#0588f0` | **3.63:1** | 4.5:1 | Buttons |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-error`<br>`#e5484d` | **3.91:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-success`<br>`#218358` | `--ao-surface-success-soft`<br>`#e6f6eb` | **4.21:1** | 4.5:1 | Status text on soft fill |
| `--ao-text-warning`<br>`#cc4e00` | `--ao-surface-warning-soft`<br>`#fff7ed` | **4.25:1** | 4.5:1 | Status text on soft fill |
| `--ao-text-contrast`<br>`#67676c` | `--ao-surface-minimal`<br>`#e2e2e3` | **4.35:1** | 4.5:1 | Body text on surfaces |

### ChatDark — 13 failures

Selector: `[data-theme="dark"] [data-surface="chat"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ao-border-contrast`<br>`#1b1b1f` | `--ao-surface-primary`<br>`#212123` | **1.07:1** | 3:1 | Structural borders |
| `--ao-border-secondary`<br>`#3c3c3f` | `--ao-surface-primary`<br>`#212123` | **1.46:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ao-btn-secondary-border`<br>`#3c3c3f` | `--ao-surface-primary`<br>`#212123` | **1.46:1** | 3:1 | Buttons — outline button boundary |
| `--ao-text-invert`<br>`#1b1b1f` | `--ao-surface-neutral`<br>`#525256` | **2.21:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-btn-primary-text-hover`<br>`#ffffff` | `--ao-btn-primary-bg-hover`<br>`#0090ff` | **3.26:1** | 4.5:1 | Buttons — hover |
| `--ao-text-contrast`<br>`#929295` | `--ao-surface-elevated-2`<br>`#3c3c3f` | **3.54:1** | 4.5:1 | Body text on surfaces |
| `--ao-btn-primary-text`<br>`#ffffff` | `--ao-btn-primary-bg`<br>`#0588f0` | **3.63:1** | 4.5:1 | Buttons |
| `--ao-text-error`<br>`#e5484d` | `--ao-surface-primary`<br>`#212123` | **4.11:1** | 4.5:1 | Status text on page |
| `--ao-text-error`<br>`#e5484d` | `--ao-surface-error-soft`<br>`#3b1219` | **4.17:1** | 4.5:1 | Status text on soft fill |
| `--ao-text-contrast`<br>`#929295` | `--ao-surface-elevated-1`<br>`#2e2e32` | **4.36:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-contrast`<br>`#929295` | `--ao-surface-minimal`<br>`#2e2e32` | **4.36:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-contrast`<br>`#929295` | `--ao-surface-secondary`<br>`#2e2e32` | **4.36:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-invert`<br>`#1b1b1f` | `--ao-surface-error`<br>`#e5484d` | **4.39:1** | 4.5:1 | Invert text on solid status fill |

### CCLight — 18 failures

Selector: `[data-brand="cc"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ao-border-secondary`<br>`#e5e9eb` | `--ao-surface-primary`<br>`#ffffff` | **1.22:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ao-btn-secondary-border`<br>`#ccd4d8` | `--ao-surface-primary`<br>`#ffffff` | **1.50:1** | 3:1 | Buttons — outline button boundary |
| `--ao-border-contrast`<br>`#99aab1` | `--ao-surface-primary`<br>`#ffffff` | **2.40:1** | 3:1 | Structural borders |
| `--ao-border-brand`<br>`#30b6c2` | `--ao-surface-primary`<br>`#ffffff` | **2.44:1** | 3:1 | Focus indicator |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-warning`<br>`#f76b15` | **2.97:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-btn-primary-text-hover`<br>`#ffffff` | `--ao-btn-primary-bg-hover`<br>`#009fba` | **3.15:1** | 4.5:1 | Buttons — hover |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-success`<br>`#30a46c` | **3.16:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-contrast`<br>`#667f89` | `--ao-surface-secondary`<br>`#e7edf0` | **3.58:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-info`<br>`#0094ad` | **3.60:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-btn-primary-text`<br>`#ffffff` | `--ao-btn-primary-bg`<br>`#0094ad` | **3.60:1** | 4.5:1 | Buttons |
| `--ao-text-contrast`<br>`#667f89` | `--ao-surface-elevated-2`<br>`#f3f6f7` | **3.90:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-contrast`<br>`#667f89` | `--ao-surface-minimal`<br>`#f3f6f7` | **3.90:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-contrast`<br>`#667f89` | `--ao-surface-input`<br>`#f3f6f7` | **3.90:1** | 4.5:1 | Body text on surfaces — placeholder |
| `--ao-text-invert`<br>`#ffffff` | `--ao-surface-error`<br>`#e5484d` | **3.91:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-success`<br>`#218358` | `--ao-surface-success-soft`<br>`#e6f6eb` | **4.21:1** | 4.5:1 | Status text on soft fill |
| `--ao-text-contrast`<br>`#667f89` | `--ao-surface-primary`<br>`#ffffff` | **4.23:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-contrast`<br>`#667f89` | `--ao-surface-elevated-1`<br>`#ffffff` | **4.23:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-warning`<br>`#cc4e00` | `--ao-surface-warning-soft`<br>`#fff7ed` | **4.25:1** | 4.5:1 | Status text on soft fill |

### CCDark — 17 failures

Selector: `[data-brand="cc"][data-theme="dark"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-invert`<br>`#f1f5f9` | **1.13:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-invert-secondary`<br>`#cad5e2` | `--ao-surface-invert`<br>`#f1f5f9` | **1.36:1** | 4.5:1 | Body text on surfaces |
| `--ao-border-secondary`<br>`#334155` | `--ao-surface-primary`<br>`#1e293b` | **1.41:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ao-border-contrast`<br>`#475569` | `--ao-surface-primary`<br>`#1e293b` | **1.93:1** | 3:1 | Structural borders |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-info`<br>`#30b6c2` | **1.98:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-icon-invert-secondary`<br>`#94a3b8` | `--ao-surface-invert`<br>`#f1f5f9` | **2.34:1** | 3:1 | Icons on surfaces |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-warning`<br>`#f76b15` | **2.41:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-success`<br>`#30a46c` | **2.56:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-border-brand`<br>`#007a8d` | `--ao-surface-primary`<br>`#1e293b` | **2.90:1** | 3:1 | Focus indicator |
| `--ao-btn-primary-text`<br>`#ffffff` | `--ao-btn-primary-bg`<br>`#009fba` | **3.15:1** | 4.5:1 | Buttons |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-error`<br>`#e5484d` | **3.17:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-contrast`<br>`#94a3b8` | `--ao-surface-secondary`<br>`#3d4b5f` | **3.46:1** | 4.5:1 | Body text on surfaces |
| `--ao-btn-primary-text-hover`<br>`#ffffff` | `--ao-btn-primary-bg-hover`<br>`#0094ad` | **3.60:1** | 4.5:1 | Buttons — hover |
| `--ao-text-error`<br>`#e5484d` | `--ao-surface-primary`<br>`#1e293b` | **3.74:1** | 4.5:1 | Status text on page |
| `--ao-text-invert`<br>`#e2e8f0` | `--ao-surface-neutral`<br>`#64748b` | **3.86:1** | 4.5:1 | Invert text on solid status fill |
| `--ao-text-contrast`<br>`#94a3b8` | `--ao-surface-elevated-2`<br>`#334155` | **4.04:1** | 4.5:1 | Body text on surfaces |
| `--ao-text-error`<br>`#e5484d` | `--ao-surface-error-soft`<br>`#3b1219` | **4.17:1** | 4.5:1 | Status text on soft fill |

## Advisory — 52 decorative pairings below threshold

These are borders sitting alongside a tinted fill and coloured text that already
carry the meaning, table gridlines, and the explicitly-muted icon token. SC 1.4.11
covers boundaries *required to understand the content*, so these are arguably exempt —
but they are the reason the UI can read as low-definition, so they are listed in full.

| Mode | Foreground | Background | Ratio | Role |
|---|---|---|---|---|
| CCLight | `--ao-border-neutral` `#e7edf0` | `--ao-surface-neutral-soft` `#f1f5f9` | 1.08:1 | Status border on soft fill |
| CCLight | `--ao-border-neutral` `#e7edf0` | `--ao-surface-primary` `#ffffff` | 1.18:1 | Status border on page |
| ChatLight | `--ao-border-neutral` `#e2e2e3` | `--ao-surface-neutral-soft` `#f6f6f7` | 1.20:1 | Status border on soft fill |
| CCLight | `--ao-datatable-table-border` `#e5e9eb` | `--ao-datatable-table-bg` `#ffffff` | 1.22:1 | Structural borders — table gridlines |
| Light | `--ao-datatable-table-border` `#e2e8f0` | `--ao-datatable-table-bg` `#ffffff` | 1.23:1 | Structural borders — table gridlines |
| ChatLight | `--ao-border-neutral` `#e2e2e3` | `--ao-surface-primary` `#ffffff` | 1.29:1 | Status border on page |
| ChatLight | `--ao-datatable-table-border` `#e2e2e3` | `--ao-datatable-table-bg` `#ffffff` | 1.29:1 | Structural borders — table gridlines |
| CCLight | `--ao-border-success` `#adddc0` | `--ao-surface-success-soft` `#e6f6eb` | 1.35:1 | Status border on soft fill |
| ChatLight | `--ao-border-success` `#adddc0` | `--ao-surface-success-soft` `#e6f6eb` | 1.35:1 | Status border on soft fill |
| Light | `--ao-border-success` `#adddc0` | `--ao-surface-success-soft` `#e6f6eb` | 1.35:1 | Status border on soft fill |
| Light | `--ao-border-neutral` `#cad5e2` | `--ao-surface-neutral-soft` `#f1f5f9` | 1.36:1 | Status border on soft fill |
| CCLight | `--ao-border-error` `#fdbdbe` | `--ao-surface-error-soft` `#feebec` | 1.39:1 | Status border on soft fill |
| ChatLight | `--ao-border-error` `#fdbdbe` | `--ao-surface-error-soft` `#feebec` | 1.39:1 | Status border on soft fill |
| Light | `--ao-border-error` `#fdbdbe` | `--ao-surface-error-soft` `#feebec` | 1.39:1 | Status border on soft fill |
| Light | `--ao-border-warning` `#ffc182` | `--ao-surface-warning-soft` `#ffefd6` | 1.41:1 | Status border on soft fill |
| CCDark | `--ao-datatable-table-border` `#334155` | `--ao-datatable-table-bg` `#1e293b` | 1.41:1 | Structural borders — table gridlines |
| Dark | `--ao-datatable-table-border` `#334155` | `--ao-datatable-table-bg` `#1e293b` | 1.41:1 | Structural borders — table gridlines |
| CCLight | `--ao-border-info` `#98d9dc` | `--ao-surface-info-soft` `#edf5f5` | 1.43:1 | Status border on soft fill |
| Light | `--ao-border-info` `#98d9dc` | `--ao-surface-info-soft` `#edf5f5` | 1.43:1 | Status border on soft fill |
| ChatLight | `--ao-border-info` `#acd8fc` | `--ao-surface-info-soft` `#f4faff` | 1.43:1 | Status border on soft fill |
| ChatDark | `--ao-datatable-table-border` `#3c3c3f` | `--ao-datatable-table-bg` `#212123` | 1.46:1 | Structural borders — table gridlines |
| Light | `--ao-border-neutral` `#cad5e2` | `--ao-surface-primary` `#ffffff` | 1.49:1 | Status border on page |
| CCLight | `--ao-border-warning` `#ffc182` | `--ao-surface-warning-soft` `#fff7ed` | 1.50:1 | Status border on soft fill |
| ChatLight | `--ao-border-warning` `#ffc182` | `--ao-surface-warning-soft` `#fff7ed` | 1.50:1 | Status border on soft fill |
| ChatLight | `--ao-border-info` `#acd8fc` | `--ao-surface-primary` `#ffffff` | 1.50:1 | Status border on page |
| CCLight | `--ao-border-success` `#adddc0` | `--ao-surface-primary` `#ffffff` | 1.51:1 | Status border on page |
| ChatLight | `--ao-border-success` `#adddc0` | `--ao-surface-primary` `#ffffff` | 1.51:1 | Status border on page |
| Light | `--ao-border-success` `#adddc0` | `--ao-surface-primary` `#ffffff` | 1.51:1 | Status border on page |
| CCLight | `--ao-border-info` `#98d9dc` | `--ao-surface-primary` `#ffffff` | 1.58:1 | Status border on page |
| Light | `--ao-border-info` `#98d9dc` | `--ao-surface-primary` `#ffffff` | 1.58:1 | Status border on page |
| CCLight | `--ao-border-warning` `#ffc182` | `--ao-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| ChatLight | `--ao-border-warning` `#ffc182` | `--ao-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| Light | `--ao-border-warning` `#ffc182` | `--ao-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| CCLight | `--ao-border-error` `#fdbdbe` | `--ao-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| ChatLight | `--ao-border-error` `#fdbdbe` | `--ao-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| Light | `--ao-border-error` `#fdbdbe` | `--ao-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| ChatDark | `--ao-border-neutral` `#525256` | `--ao-surface-neutral-soft` `#2e2e32` | 1.74:1 | Status border on soft fill |
| CCLight | `--ao-icon-contrast` `#99aab1` | `--ao-surface-secondary` `#e7edf0` | 2.03:1 | Icons on surfaces — muted/disabled icon |
| ChatDark | `--ao-border-neutral` `#525256` | `--ao-surface-primary` `#212123` | 2.07:1 | Status border on page |
| CCDark | `--ao-border-neutral` `#64748b` | `--ao-surface-neutral-soft` `#334155` | 2.18:1 | Status border on soft fill |
| Light | `--ao-icon-contrast` `#94a3b8` | `--ao-surface-secondary` `#e9eef4` | 2.20:1 | Icons on surfaces — muted/disabled icon |
| CCLight | `--ao-icon-contrast` `#99aab1` | `--ao-surface-minimal` `#f3f6f7` | 2.21:1 | Icons on surfaces — muted/disabled icon |
| ChatLight | `--ao-icon-contrast` `#929295` | `--ao-surface-minimal` `#e2e2e3` | 2.40:1 | Icons on surfaces — muted/disabled icon |
| CCLight | `--ao-icon-contrast` `#99aab1` | `--ao-surface-primary` `#ffffff` | 2.40:1 | Icons on surfaces — muted/disabled icon |
| Light | `--ao-icon-contrast` `#94a3b8` | `--ao-surface-minimal` `#f8fafc` | 2.45:1 | Icons on surfaces — muted/disabled icon |
| Light | `--ao-icon-contrast` `#94a3b8` | `--ao-surface-primary` `#ffffff` | 2.56:1 | Icons on surfaces — muted/disabled icon |
| Dark | `--ao-border-neutral` `#64748b` | `--ao-surface-neutral-soft` `#293548` | 2.60:1 | Status border on soft fill |
| ChatDark | `--ao-border-success` `#218358` | `--ao-surface-success-soft` `#113b29` | 2.65:1 | Status border on soft fill |
| CCDark | `--ao-border-error` `#ce2c31` | `--ao-surface-primary` `#1e293b` | 2.81:1 | Status border on page |
| Dark | `--ao-border-error` `#ce2c31` | `--ao-surface-primary` `#1e293b` | 2.81:1 | Status border on page |
| CCDark | `--ao-border-info` `#007a8d` | `--ao-surface-primary` `#1e293b` | 2.90:1 | Status border on page |
| Dark | `--ao-border-info` `#007a8d` | `--ao-surface-primary` `#1e293b` | 2.90:1 | Status border on page |

## Informational — disabled states

WCAG 2.1 exempts disabled controls from contrast minimums, so these are reported but not counted as failures.

| Mode | Foreground | Background | Ratio |
|---|---|---|---|
| Light | `--ao-btn-text-disabled` `#64748b` | `--ao-btn-bg-disabled` `#cad5e2` | 3.20:1 |
| Dark | `--ao-btn-text-disabled` `#cad5e2` | `--ao-btn-bg-disabled` `#64748b` | 3.20:1 |
| ChatLight | `--ao-btn-text-disabled` `#67676c` | `--ao-btn-bg-disabled` `#c2c2c4` | 3.16:1 |
| ChatDark | `--ao-btn-text-disabled` `#c2c2c4` | `--ao-btn-bg-disabled` `#67676c` | 3.16:1 |
| CCLight | `--ao-btn-text-disabled` `#99aab1` | `--ao-btn-bg-disabled` `#ccd4d8` | 1.60:1 |
| CCDark | `--ao-btn-text-disabled` `#64748b` | `--ao-btn-bg-disabled` `#94a3b8` | 1.86:1 |

