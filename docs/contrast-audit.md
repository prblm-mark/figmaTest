# WCAG 2.1 AA Contrast Audit

Full six-mode audit of the Affino Design System colour tokens, run **2026-08-24** against the
token CSS generated from the Aug 2026 Figma re-export.

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

**554 pairings** audited across Light, Dark, ChatLight, ChatDark, CCLight and CCDark.

| | Count |
|---|---|
| Passing | 397 |
| **Blocking failures** | **97** |
| Advisory (decorative, arguably 1.4.11-exempt) | 52 |
| Informational (disabled controls, WCAG-exempt) | 6 |

Of the 97 blocking failures, measured against a rebuild of the pre-rework commit (`HEAD~1`):

- **41 are regressions** introduced by the Aug 2026 rework — they passed before.
- **56 are pre-existing** — they failed before the rework too.
- **13 pairings were *fixed*** by the rework (mostly `--ai-text-brand`, which gained 2–3× contrast
  in the dark and chat modes).

The 97 failures collapse into **27 distinct token pairs**, and every one of them falls under one
of the seven root causes below — so fixing those seven clears the whole list.

| Root cause | Failures | Regression? |
|---|---|---|
| 1. `--ai-text-invert` does not flip in dark mode | 6 | yes |
| 2. Primary button: white on mid-tone teal | 14 | yes (4 of 14; hover was already failing) |
| 3. Invert text on solid status fills | 24 | mostly |
| 4. `--ai-text-contrast` too light on tinted surfaces | 18 | partly |
| 5. Focus indicator / `--ai-border-brand` | 7 | yes |
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

### 1. `--ai-text-invert` does not flip in dark mode — REGRESSION, and a clear bug

`--ai-icon-invert` correctly inverts between themes. `--ai-text-invert` does not.

| Token | Light | Dark |
|---|---|---|
| `--ai-surface-invert` | `#1E293B` (dark) | `#F1F5F9` (light) |
| `--ai-icon-invert` | `#FFFFFF` | `#0F172A` — flips |
| `--ai-text-invert` | `#FFFFFF` | `#E2E8F0` — **stays light** |
| `--ai-text-invert-secondary` | `#FFFFFF` | `#CAD5E2` — **stays light** |

So in dark mode, inverted text lands light-on-light:

| Pairing | Was | Now | Needs |
|---|---|---|---|
| `--ai-text-invert` on `--ai-surface-invert` | 15.90:1 | **1.13:1** | 4.5:1 |
| `--ai-text-invert-secondary` on `--ai-surface-invert` | 13.97:1 | **1.36:1** | 4.5:1 |
| `--ai-icon-invert-secondary` on `--ai-surface-invert` | 13.97:1 | **2.34:1** | 3:1 |

This is the single most severe finding — a 15.90 → 1.13 collapse means inverted text is
effectively invisible in dark mode. Affects Dark and CCDark.

**Fix:** in Figma, point dark-mode `text/invert` and `text/invert-secondary` at dark steps, the
way `icon/invert` already does (`Grey/850 #172033` or matching `icon-invert`'s `#0F172A`).
6 failures.

### 2. Primary button: white text on a mid-tone teal fill — REGRESSION

| Mode | Fill | Ratio | Needs |
|---|---|---|---|
| Dark | `#30B6C2` | **2.44:1** | 4.5:1 |
| Dark (hover) | `#77CAD0` | **1.88:1** | 4.5:1 |
| Light / CCLight | `#0094AD` | **3.60:1** | 4.5:1 |
| Light (hover) | `#009FBA` | **3.15:1** | 4.5:1 |
| ChatLight / ChatDark | `#0588F0` | **3.63:1** | 4.5:1 |

Teal at Lagoon step 9/10 is simply lighter than the blue it replaced at the same nominal
position — the old `#2563EB` gave 5.17:1. The dark hover state at 1.88:1 is the worst
single value in the audit.

**Fix, two options:**

- **Darken the fill.** `Lagoon/11 #007A8D` gives **5.04:1** with white — and that value is already
  in the system as `--ai-surface-brand-dark`. Shifting `btn-primary-bg` from step 10 to step 11
  fixes light mode with no new primitive.
- **Or flip the text to dark** on the mid-tone fills, which is what Radix itself recommends for
  step 9/10 solid fills. This is the better answer for dark mode, where a *darker* teal fights
  the surrounding surface.

14 failures across the three button states.

### 3. `--ai-text-invert` on solid status fills — mostly REGRESSION

White (or near-white, in dark) label text on the solid status colours:

| Fill | Value | Worst ratio | Needs |
|---|---|---|---|
| `--ai-surface-warning` | `#F76B15` | **2.41:1** | 4.5:1 |
| `--ai-surface-success` | `#30A46C` | **2.56:1** | 4.5:1 |
| `--ai-surface-info` | `#0094AD` / `#30B6C2` | **1.98:1** | 4.5:1 |
| `--ai-surface-error` | `#E5484D` | **3.17:1** | 4.5:1 |
| `--ai-surface-neutral` | `#64748B` | **2.21:1** | 4.5:1 |

All five status families sit at Radix step 9/10. Radix designs those steps for solid fills with
*low-contrast* text and directs you to step 11+ when the text must be readable.

**Fix:** for any badge/banner that puts label text on a solid status fill, use each family's
**step 11** — which the system already holds as `--ai-text-{status}`:
`#CC4E00` (4.51:1), `#218358` (4.72:1), `#CE2C31` (5.21:1), all against white.
Alternatively keep the step-9 fills and use dark text. 24 failures.

### 4. `--ai-text-contrast` is too light for tinted surfaces — partly REGRESSION

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

### 5. Focus indicator and `--ai-border-brand` below 3:1 — REGRESSION

| Mode | Value | Ratio | Was |
|---|---|---|---|
| Light / CCLight | `#30B6C2` | **2.44:1** | 5.17:1 |
| ChatLight | `#5EB1EF` | **2.33:1** | 4.82:1 |
| Dark / CCDark | `#007A8D` | **2.90:1** | 3.56:1 |

SC 1.4.11 explicitly covers focus indicators, so this one is not arguable.

**Fix:** `border-brand` should use `Lagoon/10 #0094AD` (**3.60:1**) in light, or step 11
`#007A8D` (5.04:1). In ChatLight, BlueRadix step 10 `#0588F0` gives 3.68:1.

Related: in ChatLight, `--ai-surface-brand` and `--ai-icon-brand` `#0588F0` drop to 2.80:1 on
`--ai-surface-minimal #E2E2E3` — the chat "minimal" surface is much darker than the default one,
so the brand needs a step more contrast there specifically. 7 failures for this cause in total.

### 6. Status text on its own soft fill, marginally short — REGRESSION

| Pairing | Ratio | Needs |
|---|---|---|
| `--ai-text-warning` `#CC4E00` on `--ai-surface-warning-soft` | **3.99:1** | 4.5:1 |
| `--ai-text-success` `#218358` on `--ai-surface-success-soft` | **4.21:1** | 4.5:1 |
| `--ai-text-error` `#E5484D` on `--ai-surface-error-soft` (dark) | **4.17:1** | 4.5:1 |
| `--ai-text-error` `#E5484D` on `--ai-surface-primary` (dark) | **3.74:1** | 4.5:1 |

These were comfortable before (6.88:1, 7.29:1, 5.84:1) and are now just under. One step darker on
the text — or one step lighter on the soft fill — clears each. 12 failures.

### 7. Control boundaries below 3:1 — PRE-EXISTING, not caused by the rework

| Token | Worst | Role |
|---|---|---|
| `--ai-border-secondary` | **1.22:1** | the default input and card border |
| `--ai-border-contrast` | **1.07:1** | stronger borders |
| `--ai-btn-secondary-border` | **1.29:1** | outline-button boundary |

Fails in all six modes and failed before the rework too (old `#E2E2E3` on white was 1.29:1). An
input's outline is the only thing that marks where the control is, so SC 1.4.11 applies. Worth
noting the rework *improved* one of these — dark `btn-secondary-border` went 1.56 → 3.07:1 and
now passes.

**Fix:** this is a deliberate design-language decision about how visible form boundaries should
be, not a token-value slip. It needs a designer call, not a mechanical bump. 16 failures.

---

## Full results by mode

<!-- Generated by scripts/contrast-audit.mjs --md — do not hand-edit below this line. -->

Audited **552 pairings** across 6 modes: **97 fail**, 397 pass.

### Light — 15 failures

Selector: `:root`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ai-border-secondary`<br>`#e2e8f0` | `--ai-surface-primary`<br>`#ffffff` | **1.23:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ai-btn-secondary-border`<br>`#d6dee8` | `--ai-surface-primary`<br>`#ffffff` | **1.36:1** | 3:1 | Buttons — outline button boundary |
| `--ai-border-brand`<br>`#30b6c2` | `--ai-surface-primary`<br>`#ffffff` | **2.44:1** | 3:1 | Focus indicator |
| `--ai-border-contrast`<br>`#94a3b8` | `--ai-surface-primary`<br>`#ffffff` | **2.56:1** | 3:1 | Structural borders |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-warning`<br>`#f76b15` | **2.97:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-btn-primary-text-hover`<br>`#ffffff` | `--ai-btn-primary-bg-hover`<br>`#009fba` | **3.15:1** | 4.5:1 | Buttons — hover |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-success`<br>`#30a46c` | **3.16:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-info`<br>`#0094ad` | **3.60:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-btn-primary-text`<br>`#ffffff` | `--ai-btn-primary-bg`<br>`#0094ad` | **3.60:1** | 4.5:1 | Buttons |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-error`<br>`#e5484d` | **3.91:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-warning`<br>`#cc4e00` | `--ai-surface-warning-soft`<br>`#ffefd6` | **3.99:1** | 4.5:1 | Status text on soft fill |
| `--ai-text-contrast`<br>`#64748b` | `--ai-surface-secondary`<br>`#e9eef4` | **4.08:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-success`<br>`#218358` | `--ai-surface-success-soft`<br>`#e6f6eb` | **4.21:1** | 4.5:1 | Status text on soft fill |
| `--ai-text-contrast`<br>`#64748b` | `--ai-surface-elevated-2`<br>`#f1f5f9` | **4.34:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-contrast`<br>`#64748b` | `--ai-surface-input`<br>`#f1f5f9` | **4.34:1** | 4.5:1 | Body text on surfaces — placeholder |

### Dark — 18 failures

Selector: `[data-theme="dark"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-invert`<br>`#f1f5f9` | **1.13:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-invert-secondary`<br>`#cad5e2` | `--ai-surface-invert`<br>`#f1f5f9` | **1.36:1** | 4.5:1 | Body text on surfaces |
| `--ai-border-secondary`<br>`#334155` | `--ai-surface-primary`<br>`#1e293b` | **1.41:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ai-btn-primary-text-hover`<br>`#ffffff` | `--ai-btn-primary-bg-hover`<br>`#77cad0` | **1.88:1** | 4.5:1 | Buttons — hover |
| `--ai-border-contrast`<br>`#475569` | `--ai-surface-primary`<br>`#1e293b` | **1.93:1** | 3:1 | Structural borders |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-info`<br>`#30b6c2` | **1.98:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-icon-invert-secondary`<br>`#94a3b8` | `--ai-surface-invert`<br>`#f1f5f9` | **2.34:1** | 3:1 | Icons on surfaces |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-warning`<br>`#f76b15` | **2.41:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-btn-primary-text`<br>`#ffffff` | `--ai-btn-primary-bg`<br>`#30b6c2` | **2.44:1** | 4.5:1 | Buttons |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-success`<br>`#30a46c` | **2.56:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-border-brand`<br>`#007a8d` | `--ai-surface-primary`<br>`#1e293b` | **2.90:1** | 3:1 | Focus indicator |
| `--ai-btn-primary-text`<br>`#ffffff` | `--ai-btn-primary-bg-pressed`<br>`#009fba` | **3.15:1** | 4.5:1 | Buttons — pressed |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-error`<br>`#e5484d` | **3.17:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-contrast`<br>`#94a3b8` | `--ai-surface-secondary`<br>`#3d4b5f` | **3.46:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-error`<br>`#e5484d` | `--ai-surface-primary`<br>`#1e293b` | **3.74:1** | 4.5:1 | Status text on page |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-neutral`<br>`#64748b` | **3.86:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-contrast`<br>`#94a3b8` | `--ai-surface-elevated-2`<br>`#334155` | **4.04:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-error`<br>`#e5484d` | `--ai-surface-error-soft`<br>`#3b1219` | **4.17:1** | 4.5:1 | Status text on soft fill |

### ChatLight — 15 failures

Selector: `[data-surface="chat"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ai-border-contrast`<br>`#f6f6f7` | `--ai-surface-primary`<br>`#ffffff` | **1.08:1** | 3:1 | Structural borders |
| `--ai-border-secondary`<br>`#e2e2e3` | `--ai-surface-primary`<br>`#ffffff` | **1.29:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ai-btn-secondary-border`<br>`#e2e2e3` | `--ai-surface-primary`<br>`#ffffff` | **1.29:1** | 3:1 | Buttons — outline button boundary |
| `--ai-border-brand`<br>`#5eb1ef` | `--ai-surface-primary`<br>`#ffffff` | **2.33:1** | 3:1 | Focus indicator |
| `--ai-icon-brand`<br>`#0588f0` | `--ai-surface-minimal`<br>`#e2e2e3` | **2.80:1** | 3:1 | Icons on surfaces |
| `--ai-surface-brand`<br>`#0588f0` | `--ai-surface-minimal`<br>`#e2e2e3` | **2.80:1** | 3:1 | Focus indicator — focus ring |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-warning`<br>`#f76b15` | **2.97:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-success`<br>`#30a46c` | **3.16:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-btn-primary-text-hover`<br>`#ffffff` | `--ai-btn-primary-bg-hover`<br>`#0090ff` | **3.26:1** | 4.5:1 | Buttons — hover |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-info`<br>`#0588f0` | **3.63:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-btn-primary-text`<br>`#ffffff` | `--ai-btn-primary-bg`<br>`#0588f0` | **3.63:1** | 4.5:1 | Buttons |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-error`<br>`#e5484d` | **3.91:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-success`<br>`#218358` | `--ai-surface-success-soft`<br>`#e6f6eb` | **4.21:1** | 4.5:1 | Status text on soft fill |
| `--ai-text-warning`<br>`#cc4e00` | `--ai-surface-warning-soft`<br>`#fff7ed` | **4.25:1** | 4.5:1 | Status text on soft fill |
| `--ai-text-contrast`<br>`#67676c` | `--ai-surface-minimal`<br>`#e2e2e3` | **4.35:1** | 4.5:1 | Body text on surfaces |

### ChatDark — 13 failures

Selector: `[data-theme="dark"] [data-surface="chat"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ai-border-contrast`<br>`#1b1b1f` | `--ai-surface-primary`<br>`#212123` | **1.07:1** | 3:1 | Structural borders |
| `--ai-border-secondary`<br>`#3c3c3f` | `--ai-surface-primary`<br>`#212123` | **1.46:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ai-btn-secondary-border`<br>`#3c3c3f` | `--ai-surface-primary`<br>`#212123` | **1.46:1** | 3:1 | Buttons — outline button boundary |
| `--ai-text-invert`<br>`#1b1b1f` | `--ai-surface-neutral`<br>`#525256` | **2.21:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-btn-primary-text-hover`<br>`#ffffff` | `--ai-btn-primary-bg-hover`<br>`#0090ff` | **3.26:1** | 4.5:1 | Buttons — hover |
| `--ai-text-contrast`<br>`#929295` | `--ai-surface-elevated-2`<br>`#3c3c3f` | **3.54:1** | 4.5:1 | Body text on surfaces |
| `--ai-btn-primary-text`<br>`#ffffff` | `--ai-btn-primary-bg`<br>`#0588f0` | **3.63:1** | 4.5:1 | Buttons |
| `--ai-text-error`<br>`#e5484d` | `--ai-surface-primary`<br>`#212123` | **4.11:1** | 4.5:1 | Status text on page |
| `--ai-text-error`<br>`#e5484d` | `--ai-surface-error-soft`<br>`#3b1219` | **4.17:1** | 4.5:1 | Status text on soft fill |
| `--ai-text-contrast`<br>`#929295` | `--ai-surface-elevated-1`<br>`#2e2e32` | **4.36:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-contrast`<br>`#929295` | `--ai-surface-minimal`<br>`#2e2e32` | **4.36:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-contrast`<br>`#929295` | `--ai-surface-secondary`<br>`#2e2e32` | **4.36:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-invert`<br>`#1b1b1f` | `--ai-surface-error`<br>`#e5484d` | **4.39:1** | 4.5:1 | Invert text on solid status fill |

### CCLight — 18 failures

Selector: `[data-brand="cc"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ai-border-secondary`<br>`#e5e9eb` | `--ai-surface-primary`<br>`#ffffff` | **1.22:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ai-btn-secondary-border`<br>`#ccd4d8` | `--ai-surface-primary`<br>`#ffffff` | **1.50:1** | 3:1 | Buttons — outline button boundary |
| `--ai-border-contrast`<br>`#99aab1` | `--ai-surface-primary`<br>`#ffffff` | **2.40:1** | 3:1 | Structural borders |
| `--ai-border-brand`<br>`#30b6c2` | `--ai-surface-primary`<br>`#ffffff` | **2.44:1** | 3:1 | Focus indicator |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-warning`<br>`#f76b15` | **2.97:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-btn-primary-text-hover`<br>`#ffffff` | `--ai-btn-primary-bg-hover`<br>`#009fba` | **3.15:1** | 4.5:1 | Buttons — hover |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-success`<br>`#30a46c` | **3.16:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-contrast`<br>`#667f89` | `--ai-surface-secondary`<br>`#e7edf0` | **3.58:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-info`<br>`#0094ad` | **3.60:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-btn-primary-text`<br>`#ffffff` | `--ai-btn-primary-bg`<br>`#0094ad` | **3.60:1** | 4.5:1 | Buttons |
| `--ai-text-contrast`<br>`#667f89` | `--ai-surface-elevated-2`<br>`#f3f6f7` | **3.90:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-contrast`<br>`#667f89` | `--ai-surface-minimal`<br>`#f3f6f7` | **3.90:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-contrast`<br>`#667f89` | `--ai-surface-input`<br>`#f3f6f7` | **3.90:1** | 4.5:1 | Body text on surfaces — placeholder |
| `--ai-text-invert`<br>`#ffffff` | `--ai-surface-error`<br>`#e5484d` | **3.91:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-success`<br>`#218358` | `--ai-surface-success-soft`<br>`#e6f6eb` | **4.21:1** | 4.5:1 | Status text on soft fill |
| `--ai-text-contrast`<br>`#667f89` | `--ai-surface-primary`<br>`#ffffff` | **4.23:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-contrast`<br>`#667f89` | `--ai-surface-elevated-1`<br>`#ffffff` | **4.23:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-warning`<br>`#cc4e00` | `--ai-surface-warning-soft`<br>`#fff7ed` | **4.25:1** | 4.5:1 | Status text on soft fill |

### CCDark — 18 failures

Selector: `[data-brand="cc"][data-theme="dark"]`

| Foreground | Background | Ratio | Needs | Role |
|---|---|---|---|---|
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-invert`<br>`#f1f5f9` | **1.13:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-invert-secondary`<br>`#cad5e2` | `--ai-surface-invert`<br>`#f1f5f9` | **1.36:1** | 4.5:1 | Body text on surfaces |
| `--ai-border-secondary`<br>`#334155` | `--ai-surface-primary`<br>`#1e293b` | **1.41:1** | 3:1 | Structural borders — default input/card border — a control boundary |
| `--ai-btn-primary-text-hover`<br>`#ffffff` | `--ai-btn-primary-bg-hover`<br>`#77cad0` | **1.88:1** | 4.5:1 | Buttons — hover |
| `--ai-border-contrast`<br>`#475569` | `--ai-surface-primary`<br>`#1e293b` | **1.93:1** | 3:1 | Structural borders |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-info`<br>`#30b6c2` | **1.98:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-icon-invert-secondary`<br>`#94a3b8` | `--ai-surface-invert`<br>`#f1f5f9` | **2.34:1** | 3:1 | Icons on surfaces |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-warning`<br>`#f76b15` | **2.41:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-btn-primary-text`<br>`#ffffff` | `--ai-btn-primary-bg`<br>`#30b6c2` | **2.44:1** | 4.5:1 | Buttons |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-success`<br>`#30a46c` | **2.56:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-border-brand`<br>`#007a8d` | `--ai-surface-primary`<br>`#1e293b` | **2.90:1** | 3:1 | Focus indicator |
| `--ai-btn-primary-text`<br>`#ffffff` | `--ai-btn-primary-bg-pressed`<br>`#009fba` | **3.15:1** | 4.5:1 | Buttons — pressed |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-error`<br>`#e5484d` | **3.17:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-contrast`<br>`#94a3b8` | `--ai-surface-secondary`<br>`#3d4b5f` | **3.46:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-error`<br>`#e5484d` | `--ai-surface-primary`<br>`#1e293b` | **3.74:1** | 4.5:1 | Status text on page |
| `--ai-text-invert`<br>`#e2e8f0` | `--ai-surface-neutral`<br>`#64748b` | **3.86:1** | 4.5:1 | Invert text on solid status fill |
| `--ai-text-contrast`<br>`#94a3b8` | `--ai-surface-elevated-2`<br>`#334155` | **4.04:1** | 4.5:1 | Body text on surfaces |
| `--ai-text-error`<br>`#e5484d` | `--ai-surface-error-soft`<br>`#3b1219` | **4.17:1** | 4.5:1 | Status text on soft fill |

## Advisory — 52 decorative pairings below threshold

These are borders sitting alongside a tinted fill and coloured text that already
carry the meaning, table gridlines, and the explicitly-muted icon token. SC 1.4.11
covers boundaries *required to understand the content*, so these are arguably exempt —
but they are the reason the UI can read as low-definition, so they are listed in full.

| Mode | Foreground | Background | Ratio | Role |
|---|---|---|---|---|
| CCLight | `--ai-border-neutral` `#e7edf0` | `--ai-surface-neutral-soft` `#f1f5f9` | 1.08:1 | Status border on soft fill |
| CCLight | `--ai-border-neutral` `#e7edf0` | `--ai-surface-primary` `#ffffff` | 1.18:1 | Status border on page |
| ChatLight | `--ai-border-neutral` `#e2e2e3` | `--ai-surface-neutral-soft` `#f6f6f7` | 1.20:1 | Status border on soft fill |
| CCLight | `--ai-datatable-table-border` `#e5e9eb` | `--ai-datatable-table-bg` `#ffffff` | 1.22:1 | Structural borders — table gridlines |
| Light | `--ai-datatable-table-border` `#e2e8f0` | `--ai-datatable-table-bg` `#ffffff` | 1.23:1 | Structural borders — table gridlines |
| ChatLight | `--ai-border-neutral` `#e2e2e3` | `--ai-surface-primary` `#ffffff` | 1.29:1 | Status border on page |
| ChatLight | `--ai-datatable-table-border` `#e2e2e3` | `--ai-datatable-table-bg` `#ffffff` | 1.29:1 | Structural borders — table gridlines |
| CCLight | `--ai-border-success` `#adddc0` | `--ai-surface-success-soft` `#e6f6eb` | 1.35:1 | Status border on soft fill |
| ChatLight | `--ai-border-success` `#adddc0` | `--ai-surface-success-soft` `#e6f6eb` | 1.35:1 | Status border on soft fill |
| Light | `--ai-border-success` `#adddc0` | `--ai-surface-success-soft` `#e6f6eb` | 1.35:1 | Status border on soft fill |
| Light | `--ai-border-neutral` `#cad5e2` | `--ai-surface-neutral-soft` `#f1f5f9` | 1.36:1 | Status border on soft fill |
| CCLight | `--ai-border-error` `#fdbdbe` | `--ai-surface-error-soft` `#feebec` | 1.39:1 | Status border on soft fill |
| ChatLight | `--ai-border-error` `#fdbdbe` | `--ai-surface-error-soft` `#feebec` | 1.39:1 | Status border on soft fill |
| Light | `--ai-border-error` `#fdbdbe` | `--ai-surface-error-soft` `#feebec` | 1.39:1 | Status border on soft fill |
| Light | `--ai-border-warning` `#ffc182` | `--ai-surface-warning-soft` `#ffefd6` | 1.41:1 | Status border on soft fill |
| CCDark | `--ai-datatable-table-border` `#334155` | `--ai-datatable-table-bg` `#1e293b` | 1.41:1 | Structural borders — table gridlines |
| Dark | `--ai-datatable-table-border` `#334155` | `--ai-datatable-table-bg` `#1e293b` | 1.41:1 | Structural borders — table gridlines |
| CCLight | `--ai-border-info` `#98d9dc` | `--ai-surface-info-soft` `#edf5f5` | 1.43:1 | Status border on soft fill |
| Light | `--ai-border-info` `#98d9dc` | `--ai-surface-info-soft` `#edf5f5` | 1.43:1 | Status border on soft fill |
| ChatLight | `--ai-border-info` `#acd8fc` | `--ai-surface-info-soft` `#f4faff` | 1.43:1 | Status border on soft fill |
| ChatDark | `--ai-datatable-table-border` `#3c3c3f` | `--ai-datatable-table-bg` `#212123` | 1.46:1 | Structural borders — table gridlines |
| Light | `--ai-border-neutral` `#cad5e2` | `--ai-surface-primary` `#ffffff` | 1.49:1 | Status border on page |
| CCLight | `--ai-border-warning` `#ffc182` | `--ai-surface-warning-soft` `#fff7ed` | 1.50:1 | Status border on soft fill |
| ChatLight | `--ai-border-warning` `#ffc182` | `--ai-surface-warning-soft` `#fff7ed` | 1.50:1 | Status border on soft fill |
| ChatLight | `--ai-border-info` `#acd8fc` | `--ai-surface-primary` `#ffffff` | 1.50:1 | Status border on page |
| CCLight | `--ai-border-success` `#adddc0` | `--ai-surface-primary` `#ffffff` | 1.51:1 | Status border on page |
| ChatLight | `--ai-border-success` `#adddc0` | `--ai-surface-primary` `#ffffff` | 1.51:1 | Status border on page |
| Light | `--ai-border-success` `#adddc0` | `--ai-surface-primary` `#ffffff` | 1.51:1 | Status border on page |
| CCLight | `--ai-border-info` `#98d9dc` | `--ai-surface-primary` `#ffffff` | 1.58:1 | Status border on page |
| Light | `--ai-border-info` `#98d9dc` | `--ai-surface-primary` `#ffffff` | 1.58:1 | Status border on page |
| CCLight | `--ai-border-warning` `#ffc182` | `--ai-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| ChatLight | `--ai-border-warning` `#ffc182` | `--ai-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| Light | `--ai-border-warning` `#ffc182` | `--ai-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| CCLight | `--ai-border-error` `#fdbdbe` | `--ai-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| ChatLight | `--ai-border-error` `#fdbdbe` | `--ai-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| Light | `--ai-border-error` `#fdbdbe` | `--ai-surface-primary` `#ffffff` | 1.59:1 | Status border on page |
| ChatDark | `--ai-border-neutral` `#525256` | `--ai-surface-neutral-soft` `#2e2e32` | 1.74:1 | Status border on soft fill |
| CCLight | `--ai-icon-contrast` `#99aab1` | `--ai-surface-secondary` `#e7edf0` | 2.03:1 | Icons on surfaces — muted/disabled icon |
| ChatDark | `--ai-border-neutral` `#525256` | `--ai-surface-primary` `#212123` | 2.07:1 | Status border on page |
| CCDark | `--ai-border-neutral` `#64748b` | `--ai-surface-neutral-soft` `#334155` | 2.18:1 | Status border on soft fill |
| Light | `--ai-icon-contrast` `#94a3b8` | `--ai-surface-secondary` `#e9eef4` | 2.20:1 | Icons on surfaces — muted/disabled icon |
| CCLight | `--ai-icon-contrast` `#99aab1` | `--ai-surface-minimal` `#f3f6f7` | 2.21:1 | Icons on surfaces — muted/disabled icon |
| ChatLight | `--ai-icon-contrast` `#929295` | `--ai-surface-minimal` `#e2e2e3` | 2.40:1 | Icons on surfaces — muted/disabled icon |
| CCLight | `--ai-icon-contrast` `#99aab1` | `--ai-surface-primary` `#ffffff` | 2.40:1 | Icons on surfaces — muted/disabled icon |
| Light | `--ai-icon-contrast` `#94a3b8` | `--ai-surface-minimal` `#f8fafc` | 2.45:1 | Icons on surfaces — muted/disabled icon |
| Light | `--ai-icon-contrast` `#94a3b8` | `--ai-surface-primary` `#ffffff` | 2.56:1 | Icons on surfaces — muted/disabled icon |
| Dark | `--ai-border-neutral` `#64748b` | `--ai-surface-neutral-soft` `#293548` | 2.60:1 | Status border on soft fill |
| ChatDark | `--ai-border-success` `#218358` | `--ai-surface-success-soft` `#113b29` | 2.65:1 | Status border on soft fill |
| CCDark | `--ai-border-error` `#ce2c31` | `--ai-surface-primary` `#1e293b` | 2.81:1 | Status border on page |
| Dark | `--ai-border-error` `#ce2c31` | `--ai-surface-primary` `#1e293b` | 2.81:1 | Status border on page |
| CCDark | `--ai-border-info` `#007a8d` | `--ai-surface-primary` `#1e293b` | 2.90:1 | Status border on page |
| Dark | `--ai-border-info` `#007a8d` | `--ai-surface-primary` `#1e293b` | 2.90:1 | Status border on page |

## Informational — disabled states

WCAG 2.1 exempts disabled controls from contrast minimums, so these are reported but not counted as failures.

| Mode | Foreground | Background | Ratio |
|---|---|---|---|
| Light | `--ai-btn-text-disabled` `#64748b` | `--ai-btn-bg-disabled` `#cad5e2` | 3.20:1 |
| Dark | `--ai-btn-text-disabled` `#cad5e2` | `--ai-btn-bg-disabled` `#64748b` | 3.20:1 |
| ChatLight | `--ai-btn-text-disabled` `#67676c` | `--ai-btn-bg-disabled` `#c2c2c4` | 3.16:1 |
| ChatDark | `--ai-btn-text-disabled` `#c2c2c4` | `--ai-btn-bg-disabled` `#67676c` | 3.16:1 |
| CCLight | `--ai-btn-text-disabled` `#99aab1` | `--ai-btn-bg-disabled` `#ccd4d8` | 1.60:1 |
| CCDark | `--ai-btn-text-disabled` `#64748b` | `--ai-btn-bg-disabled` `#94a3b8` | 1.86:1 |


