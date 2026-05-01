# CC → AI Token Migration Audit

Working doc for migrating the older Affino Control Centre design system into the AI Design System as new "CC Light" + "CC Dark" modes alongside the existing 4 modes (AI Light/Dark + Chat Light/Dark).

**Sources audited:**
- CC palette page: [Affino CC Design System / Full Colour Palette](https://www.figma.com/design/kxNw19mMimhG5BsFg8Xafc/Affino-CC---Design-System?node-id=0-1)
- CC semantic tokens observed in production: [Affino CC Event Attendees](https://www.figma.com/design/zXuDIeZJaQyzkBo1SdIGRN/Affino-CC---Event-Attendees) listing screen
- AI primitives: `FigmaTokens/Primitive.tokens.json`
- AI semantics: `css/tokens.css` (light) + `css/tokens-dark.css`

---

## 1. Primitive palette comparison

### CC primitive scale (12 hues × 9 shades)

CC uses the **Tailwind Slate** / Pink / Indigo / Purple palettes for many hues. Hex matches against Tailwind v3 confirm this.

| Hue | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| **Grey** (= Tailwind Slate) | #f1f5f9 | #e2e8f0 | #cbd5e1 | #94a3b8 | #64748b | #475569 | #334155 | #1e293b | #0f172a |
| **Dark Blue** | #f2f4f5 | #e5e9eb | #ccd4d8 | #99aab1 | #667f89 | #335562 | #002a3b | #00222f | #001923 |
| **Mid Blue** | #f3f6f7 | #e7edf0 | #d0dbe1 | #a1b7c3 | #7192a4 | #426e86 | #134a68 | #0f3b53 | #0b2c3e |
| **Teal** | #f2f8f9 | #e5f1f3 | #cce3e8 | #99c8d1 | #66acbb | #3391a4 | #00758d | #005e71 | #004655 |
| **Light Blue** | #f2fbfc | #e5f7f8 | #cceff2 | #99dfe5 | #66cfd8 | #33bfcb | #00afbe | #008c98 | #006972 |
| **Aqua** | #f2faf9 | #e5f5f4 | #ccebe9 | #99d8d3 | #66c4be | #33b1a8 | #009d92 | #007e75 | #005e58 |
| **Green** | #f4faf8 | #e8f6f1 | #d3ede3 | #a7dbc7 | #7ac9ab | #4eb78f | **#22a573** | #1b845c | #146345 |
| **Indigo** (= Tailwind Indigo) | #e0e7ff | #c7d2fe | #a5b4fc | #818cf8 | #6366f1 | #4f46e5 | #4338ca | #3730a3 | #312e81 |
| **Purple** (= Tailwind Purple) | #f3e8ff | #e9d5ff | #d8b4fe | #c084fc | #a855f7 | #9333ea | #7e22ce | #6b21a8 | #581c87 |
| **Pink** (= Tailwind Pink) | #fce7f3 | #fbcfe8 | #f9a8d4 | #f472b6 | #ec4899 | #db2777 | #be185d | #9d174d | #831843 |
| **Orange** | #feecdc | #fcd9bd | #fdba74 | #fb923c | #f97316 | #ea580c | #c2410c | #8a2c0d | #771d1d |
| **Red** (= Tailwind Red) | #fde8e8 | #fbd5d5 | #fca5a5 | #f87171 | #ef4444 | #dc2626 | #b91c1c | #9b1c1c | #771d1d |

**12 hues × 9 shades = 108 primitives.**

### AI primitive scale

| Hue | Shades | Notes |
|---|---|---|
| **Neutral** | 0, 50, 100, 200, 300, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000 | Custom warm-grey scale (used for AI surfaces/text) |
| **Slate** | 0, 50, 100, 200, 300, 400, 450, 500, 600, 700, 750, 800, 850, 900, 950 | Tailwind Gray (note: ≠ CC Grey which is Tailwind Slate) |
| **VP** | 0, 50, 100, 200, 300, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000 | Third neutral (for VP-themed surfaces) |
| **Blue/FB** | 50–950 | Primary brand (#0071D8 = blue/FB/600) |
| **Teal** | 50–900 | |
| **Aqua** | 50–700 | Success comes from here (#30CB90 = aqua/500) |
| **Orange** | 50–500 | |
| **Pink** | 50–600 | Different shades from CC Pink |
| **Red** | 50–700 | Tailwind Red — same as CC Red |

### Hex-level overlap (CC primitive → AI primitive)

| CC token | Hex | AI equivalent | Action |
|---|---|---|---|
| `red/100` | `#fde8e8` | `Red/100` | ✓ Exact match — alias |
| `red/200` | `#fbd5d5` | `Red/200` | ✓ Exact match — alias |
| `red/300` | `#fca5a5` | `Red/300` | ✓ Exact match — alias |
| `red/400` | `#f87171` | `Red/400` | ✓ Exact match — alias |
| `red/500` | `#ef4444` | `Red/500` | ✓ Exact match — alias |
| `red/600` | `#dc2626` | `Red/600` | ✓ Exact match — alias |
| `red/700` | `#b91c1c` | `Red/700` | ✓ Exact match — alias |
| `grey/*` | various | (close, not exact — Tailwind Slate vs Tailwind Gray) | Add new "Slate-CC" primitive set OR remap to AI Slate (small visual drift) |
| `mid-blue/*` | various | None | New primitive set required |
| `dark-blue/*` | various | None | New primitive set required |
| `teal/*` | various | None | Different shades from AI Teal |
| `light-blue/*` | various | None | New primitive set required |
| `aqua/*` | various | None | Different shades from AI Aqua |
| `green/*` | various | None | Different shades — `green/700` (#22a573) is the CC brand action colour, no AI equivalent |
| `indigo/*` | various | None | Tailwind Indigo — easy add |
| `purple/*` | various | None | Tailwind Purple — easy add |
| `pink/*` | various | (close, not exact — Tailwind Pink vs custom AI Pink) | New primitive set or close-enough remap |
| `orange/*` | various | (some close — AI only goes 50–500) | Extend AI Orange to 100–900 |

**Bottom line on primitives:** Red transfers cleanly. Everything else is either a near-miss (Grey, Pink) or genuinely different (the various blues, Green, Indigo, Purple). Most pragmatic path: **add the missing CC hues as new primitive sets in your existing Primitive collection** (one-time additions) so all CC tokens remain available, and only the Red shades alias to existing AI primitives.

---

## 2. CC semantic tokens (confirmed from Variables panel)

CC uses two modes — **Light** and **Dark** — over a single semantic collection. Below is every confirmed semantic token, grouped by category.

### CC Light

| CC slot | Hex | Resolves to (CC primitive) |
|---|---|---|
| **Primary** | `#3391A4` | teal/600 |
| **Primary Focus** | `#00758D` | teal/700 |
| **Primary Text** | `#FFFFFF` | white |
| **Secondary** | `#7192A4` | mid-blue/500 |
| **Secondary Focus** | `#426E86` | mid-blue/600 |
| **Secondary Text** | `#426E86` | mid-blue/600 |
| **Tertiary** | `#E7EDF0` | mid-blue/200 |
| **Tertiary Focus** | `#D0DBE1` | mid-blue/300 |
| **Tertiary Text** | `#426E86` | mid-blue/600 |
| **Text 1** | `#0F3B53` | mid-blue/800 |
| **Text 2** | `#134A68` | mid-blue/700 |
| **Text 3** | `#335562` | dark-blue/600 |
| **Text 4** | `#426E86` | mid-blue/600 |
| **Text 5** | `#667F89` | dark-blue/500 |
| **Text 6** | `#D0DBE1` | mid-blue/300 |
| **Surface 1** | `#E7EDF0` | mid-blue/200 |
| **Surface 2** | `#FFFFFF` | white |
| **Surface 3** | `#FFFFFF` | white |
| **Surface 4** | `#D0DBE1` | mid-blue/300 |
| **Surface 5** | `#134A68` | mid-blue/700 |
| **Surface 6** | `#0F3B53` | mid-blue/800 |
| **Surface 7** | `#E7EDF0` | mid-blue/200 |
| **Surface 8** | `#FFFFFF` | white |
| **Input 1** | `#FFFFFF` | white |
| **Input 2** | `#A1B7C3` | mid-blue/400 |
| **Input 3** | `#7192A4` | mid-blue/500 |
| **Error** | `#DC2626` | red/600 |
| **Warning** | `#FB923C` | orange/400 |
| **Success** | `#22A573` | green/700 |

### CC Dark

| CC slot | Hex | Resolves to (CC primitive) |
|---|---|---|
| **Primary** | `#00AFBE` | light-blue/700 |
| **Primary Focus** | `#33BFCB` | light-blue/600 |
| **Primary Text** | `#F1F5F9` | grey/100 |
| **Secondary** | `#94A3B8` | grey/400 |
| **Secondary Focus** | `#CBD5E1` | grey/300 |
| **Secondary Text** | `#94A3B8` | grey/400 |
| **Tertiary** | `#334155` | grey/700 |
| **Tertiary Focus** | `#475569` | grey/600 |
| **Tertiary Text** | `#CBD5E1` | grey/300 |
| **Text 1** | `#F1F5F9` | grey/100 |
| **Text 2** | `#E2E8F0` | grey/200 |
| **Text 3** | `#94A3B8` | grey/400 |
| **Text 4** | `#CBD5E1` | grey/300 |
| **Text 5** | `#94A3B8` | grey/400 |
| **Text 6** | `#CBD5E1` | grey/300 |
| **Surface 1** | `#0F172A` | grey/900 |
| **Surface 2** | `#334155` | grey/700 |
| **Surface 3** | `#1E293B` | grey/800 |
| **Surface 4** | `#334155` | grey/700 |
| **Surface 5** | `#334155` | grey/700 |
| **Surface 6** | `#1E293B` | grey/800 |
| **Surface 7** | `#1E293B` | grey/800 |
| **Surface 8** | `#0F172A` | grey/900 |
| **Input 1** | `#0F172A` | grey/900 |
| **Input 2** | `#475569` | grey/600 |
| **Input 3** | `#00AFBE` | light-blue/700 |
| **Error** | `#EF4444` | red/500 |
| **Warning** | (likely same as Light) `#FB923C` | orange/400 |
| **Success** | (likely same as Light) `#22A573` | green/700 |

### Key findings from the semantic audit

These are bigger than the primitive findings — they affect strategy:

**1. CC's brand shifts between Light and Dark modes.**
- Light Primary: teal (`#3391A4`)
- Dark Primary: light-blue (`#00AFBE`)

The AI system holds brand invariant (always `#0071D8`). This is a structural difference: CC treats brand as a per-mode value; AI treats it as cross-mode. **You'll need to decide which model wins for the unified system.** Options:
- Allow per-mode brand (drop AI's invariant assumption)
- Pick one brand per product (e.g. CC always teal, regardless of theme — drops the dark light-blue)
- Keep AI brand invariant but allow CC mode to use the brand axes (Primary/Focus) as accent rather than identity

**2. CC has more semantic slots than AI.**
- AI: 4 text slots (`primary`, `secondary`, `contrast`, `invert`); 7 surface slots
- CC: 6 text slots (`text-1` through `text-6`); 8 surface slots; 3 input slots; explicit Error/Warning/Success

The slot count mismatch means the merge isn't straight aliasing — you need to either:
- **Extend AI** to add `text-5`, `text-6`, `surface-8`, `input-1/2/3` (clean superset, but new vocabulary for AI components to optionally use)
- **Collapse CC** down to AI's slots (lossy — Text 5 and Text 6 both map to `--ai-text-contrast`)
- **Keep both vocabularies** with CC-specific tokens like `--ai-cc-text-5` (verbose, but no information loss)

**3. CC's "Success" colour (`green/700` = `#22A573`) is what got used for the Send QR Codes CTA in the Event Attendees screen — not Primary.** Either the designer wanted a "positive action" framing for the bulk send, or used green for visual contrast. Worth confirming.

**4. AI tokens use named slots (`--ai-text-primary`, `--ai-surface-elevated-1`); CC uses numbered slots (`text-1`, `surface-1`). When merging, pick a naming convention.** Numbered is easier to extend; named is more semantic. Mixed (`--ai-text-primary` for the most-used + `--ai-text-5/6` for extensions) is awkward.

---

## 3. Non-colour tokens observed in CC

| CC token | Value | AI equivalent |
|---|---|---|
| `size-1` | 4px | `--ai-spacing-1` (4px = 0.25rem) ✓ |
| `size-2` | 8px | `--ai-spacing-3` (8px) ✓ |
| `size-3-5` | 14px | (no exact — between `--ai-spacing-4` (12px) and `--ai-spacing-5` (16px)) |
| `size-6` | 24px | `--ai-spacing-6` (24px) ✓ |
| `font-size-2` | 14px | `--ai-font-fixed-xs` ✓ |
| `font-size-3` | 15px | (no exact — AI has 14 / 16) |
| `font-size-5` | 18px | `--ai-font-fixed-md` (18px) ✓ |
| `font-size-6` | 20px | `--ai-font-fixed-lg` (20px) ✓ |
| `font-weight-6` | 600 | `--ai-font-semibold` ✓ |
| `line-height-1/fs-2` | 14px | `--ai-leading-xs` (16px) — close |
| `border-radius-3` | 6px | (no exact — AI has 4 / 8 / 16) |
| `border-radius-4` | 8px | `--ai-radius-md` (8px) ✓ |
| `letter-spacing-0` | 0 | (default — no token) ✓ |

**Observations:**
- Spacing scale: CC uses half-step values (`size-3-5` = 14px). AI scale skips this — would need a new primitive or accept rounding to 12 or 16.
- Font sizes: CC has 15px (`font-size-3`) which AI doesn't have. Close to AI's `--ai-font-fixed-xs` (14px).
- Radius: CC has 6px (`border-radius-3`) which AI doesn't have. AI has 4 / 8 / 16.

⚠ **Decision needed for the modes work:** CC modes are themable colours only; spacing/typography/radius are **collection-wide primitives**, not per-mode. So if you want to keep CC's exact spacing/font/radius values, you'd add them as new primitives (`--ai-spacing-3-5: 0.875rem`, etc.) — which is a separate decision from "create the CC modes."

For the modes work specifically, you can ignore non-colour tokens.

---

## 4. Strategic decisions before mapping

Before I can produce a clean `FigmaTokens/CC.tokens.json`, three decisions need locking in:

### Decision 1 — Slot vocabulary

How do AI's 4 text / 7 surface semantics co-exist with CC's 6 text / 8 surface / 3 input?

| Approach | Pros | Cons |
|---|---|---|
| **A. Extend AI** — add `--ai-text-5`, `--ai-text-6`, `--ai-surface-8`, `--ai-input-1/2/3` | One canonical vocabulary; lossless | New tokens to maintain; existing components don't use them |
| **B. Collapse CC** — map every CC slot onto an existing AI slot | Smallest token surface | Lossy — Text 5 ↔ Text 6 distinctions disappear; designers may push back |
| **C. Dual vocabulary** — CC tokens live as `--ai-cc-text-1` … `--ai-cc-surface-8` | No information loss; AI tokens stay untouched | Two parallel systems; defeats the consolidation goal |

**My recommendation: A.** Adopt CC's slot count as the canonical vocabulary going forward (text-1..6, surface-1..8, input-1..3) and rename current AI semantics to fit (e.g. `--ai-text-primary` → `--ai-text-1`). This is a bigger rename but produces one consistent system. If renaming AI semantics is too disruptive, B with a documented mapping is the pragmatic fallback.

### Decision 2 — Brand model

CC Primary shifts between modes (teal in Light, light-blue in Dark). AI Primary is invariant (#0071D8 always).

| Approach | Effect |
|---|---|
| **A. Per-mode brand allowed** | Both products keep their existing behaviour; brand becomes a regular themable token like any other. |
| **B. CC unifies brand to teal** (Light's value) and uses it in Dark too | Drops the dark-mode light-blue accent. Cleaner but loses an existing distinction. |
| **C. AI moves to per-mode brand** | Lets AI optionally shift brand in Dark. Probably overkill if you don't need it. |

**My recommendation: A.** Just allow per-mode brand. It's the same pattern the brand-derived chat tokens already use (`--ai-chat-brand` is editable). Costs nothing to support.

### Decision 3 — CC's "Success" green and the green CTA

The "Send QR Codes" button in the Event Attendees listing uses `green/700` (#22A573) — this is CC's `Success` semantic, not Primary. Two interpretations:

- **Intentional:** the bulk-send action is framed as a "positive operation" — green = success/positive
- **Visual:** the designer wanted high-contrast accent, picked green because it pops against the dark slate

Either way, CC's Primary in Light mode is teal (#3391A4), not green. **Recommend confirming with the designer** whether the Send-QR button should be:
- Primary teal (consistent with brand) — change CTA in next iteration
- Stay green-Success — adopt convention "bulk completion actions = Success colour" and document it
- Keep both options on the table — depends on the action's semantic weight

This affects which Figma token the button binds to, so worth resolving early.

---

## 5. Recommended mapping (assuming Decision 1 = A, Decision 2 = A)

### Renamed AI semantic vocabulary

Once Decision 1 is taken, AI's current semantics rename to match CC's numbering:

| Current AI | New canonical |
|---|---|
| `--ai-text-primary` | `--ai-text-1` |
| `--ai-text-secondary` | `--ai-text-2` |
| `--ai-text-contrast` | `--ai-text-3` |
| (new) | `--ai-text-4` |
| (new) | `--ai-text-5` |
| (new) | `--ai-text-6` |
| `--ai-text-invert` | (keep as-is — CC has `Primary Text` for invert) |
| `--ai-surface-primary` | `--ai-surface-1` |
| `--ai-surface-elevated-1` | `--ai-surface-2` |
| `--ai-surface-elevated-2` | `--ai-surface-3` |
| `--ai-surface-minimal` | `--ai-surface-4` |
| `--ai-surface-secondary` | `--ai-surface-5` |
| `--ai-surface-contrast` | `--ai-surface-6` |
| `--ai-surface-invert` | (keep as-is) |
| (new) | `--ai-surface-7`, `--ai-surface-8` |

(Alternative: keep current AI names for AI Light/Dark and only add the missing extensions — a smaller change. Decision 1 controls which path.)

### CC Light overrides (per-token)

| Canonical token | CC Light value |
|---|---|
| `--ai-text-1` | `#0F3B53` (mid-blue/800) |
| `--ai-text-2` | `#134A68` (mid-blue/700) |
| `--ai-text-3` | `#335562` (dark-blue/600) |
| `--ai-text-4` | `#426E86` (mid-blue/600) |
| `--ai-text-5` | `#667F89` (dark-blue/500) |
| `--ai-text-6` | `#D0DBE1` (mid-blue/300) |
| `--ai-surface-1` | `#E7EDF0` (mid-blue/200) |
| `--ai-surface-2` | `#FFFFFF` |
| `--ai-surface-3` | `#FFFFFF` |
| `--ai-surface-4` | `#D0DBE1` (mid-blue/300) |
| `--ai-surface-5` | `#134A68` (mid-blue/700) |
| `--ai-surface-6` | `#0F3B53` (mid-blue/800) |
| `--ai-surface-7` | `#E7EDF0` (mid-blue/200) |
| `--ai-surface-8` | `#FFFFFF` |
| `--ai-input-1` | `#FFFFFF` |
| `--ai-input-2` | `#A1B7C3` (mid-blue/400) |
| `--ai-input-3` | `#7192A4` (mid-blue/500) |
| `--ai-surface-brand` (Primary) | `#3391A4` (teal/600) |
| `--ai-surface-brand-hover` (Primary Focus) | `#00758D` (teal/700) |
| `--ai-text-invert` (Primary Text) | `#FFFFFF` |
| `--ai-surface-error` | `#DC2626` (red/600) |
| `--ai-surface-warning` | `#FB923C` (orange/400) |
| `--ai-surface-success` | `#22A573` (green/700) |

### CC Dark overrides (per-token)

| Canonical token | CC Dark value |
|---|---|
| `--ai-text-1` | `#F1F5F9` (grey/100) |
| `--ai-text-2` | `#E2E8F0` (grey/200) |
| `--ai-text-3` | `#94A3B8` (grey/400) |
| `--ai-text-4` | `#CBD5E1` (grey/300) |
| `--ai-text-5` | `#94A3B8` (grey/400) |
| `--ai-text-6` | `#CBD5E1` (grey/300) |
| `--ai-surface-1` | `#0F172A` (grey/900) |
| `--ai-surface-2` | `#334155` (grey/700) |
| `--ai-surface-3` | `#1E293B` (grey/800) |
| `--ai-surface-4` | `#334155` (grey/700) |
| `--ai-surface-5` | `#334155` (grey/700) |
| `--ai-surface-6` | `#1E293B` (grey/800) |
| `--ai-surface-7` | `#1E293B` (grey/800) |
| `--ai-surface-8` | `#0F172A` (grey/900) |
| `--ai-input-1` | `#0F172A` (grey/900) |
| `--ai-input-2` | `#475569` (grey/600) |
| `--ai-input-3` | `#00AFBE` (light-blue/700) |
| `--ai-surface-brand` (Primary) | `#00AFBE` (light-blue/700) |
| `--ai-surface-brand-hover` (Primary Focus) | `#33BFCB` (light-blue/600) |
| `--ai-text-invert` (Primary Text) | `#F1F5F9` (grey/100) |
| `--ai-surface-error` | `#EF4444` (red/500) |
| `--ai-surface-warning` | `#FB923C` (orange/400) — to confirm |
| `--ai-surface-success` | `#22A573` (green/700) — to confirm |

---

## 6. Suggested next step

Once you confirm Decisions 1, 2, 3, I'll produce:

1. **`FigmaTokens/CC.tokens.json`** — concrete per-mode override file matching the format of `Dark.tokens.json`
2. **`style-dictionary.config.mjs` extension** — a fifth `sdCC` instance that compiles `css/tokens-cc.css` (`[data-product="cc"]` selector) and `css/tokens-cc-dark.css` (`[data-product="cc"][data-theme="dark"]`)
3. **A migration checklist for renaming current AI semantics** (only if Decision 1 = A) — list of files affected, ordered for safe execution

That gives you the code-side scaffolding ready for when the Figma modes are created.
