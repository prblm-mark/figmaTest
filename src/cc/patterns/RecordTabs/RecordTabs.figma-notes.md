# RecordTabs — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3871:3246`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3871-3246) · Tier: **Pattern** → `src/cc/patterns/RecordTabs/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3861:1912` | RecordTab State=Default |  |
| `3861:1912` | RecordTab State=Active | brand underline |
| `3871:3246` | RecordTabs Width=Standard | white bordered card |
| `3871:3246` | RecordTabs Width=Full | flat, bottom border |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Bar (nav) | `.record-tabs (+ --full)` |
| Tab list | `.record-tabs__list` |
| Tab (a) | `.record-tab (+ --active, aria-current="page")` |
| Count | `.record-tab__count` |
| Actions (Show Actions) | `.record-tabs__actions → Import (secondary sm) + Add (primary sm)` |
| — (code-first, 2026-09-30) | Form actions on Import step: `.record-tabs__actions → Cancel (secondary sm) + Save (primary sm, check)` — `record_tabs(form=…)`; not in the RecordTabs Figma set |

## Token Mapping

| Property | Token |
|---|---|
| bar | --ao-surface-primary, 1px --ao-border-secondary, --ao-radius-md; Full: radius-none, bottom border |
| bar padding / gap | --ao-spacing-0-5 top, --ao-spacing-5 sides / --ao-spacing-5 |
| tab | padding --ao-spacing-5 0, gap --ao-spacing-2, --ao-font-fixed-xs Medium --ao-leading-sm |
| tab colour | --ao-text-contrast → active --ao-text-brand |
| underline | 2px transparent → active --ao-border-brand |
| count | --ao-surface-info-soft, --ao-radius-full, 0 --ao-spacing-2, min-width --ao-spacing-6, --ao-font-fixed-xxs SemiBold --ao-text-info |
| actions | gap --ao-spacing-3, padding-right --ao-spacing-4 |

## Token Gaps & Decisions
Draft active underline was `Lagoon/10` (no token) → `--ao-border-brand` (designer). Inactive underline was the borrowed `--ao-btn-primary-border` → transparent. Tabs are links: Details / Article steps are separate screens.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.

## Show sidebar switch (2026-09-29, code-first — flag for Figma)
On View / Edit only, in `.record-tabs__actions` (far right): DS Toggle xxs + "Show sidebar" label (`.record-tabs__sidebar-toggle`, dressed as StepsTable's "Show details"). `record_tabs(sidebar=True|False)` sets the default — View on, Edit off. Hidden at `@container cs-page (max-width: 1023px)`. Not in the RecordTabs Figma set.

## Active tab weight (designer, 2026-09-29)

`.record-tab--active` is **SemiBold** (`--ao-font-semibold`); the other tabs stay Medium. Flag for Figma.

## Mobile (designer, 2026-09-30)

`@container cs-page (max-width: 767px)`: the Steps actions hide **Import** (`.record-tabs__import`) and make every icon + label tab action icon-only — **+ Add**, and **Cancel** (`x`) / **Save** (`check`) on the Import / Add step forms (32px square via `.record-tabs__actions .btn:has(> .record-tabs__btn-label)`, label hidden, `aria-label` kept) — at ~390 the tabs, Import and Add ran into each other. The bar itself tightens to gap `--ao-spacing-3` and padding `--ao-spacing-0-5 --ao-spacing-4 0` (desktop `spacing-5` for both), and the gap between tabs (`.record-tabs__list`) to `--ao-spacing-3` (desktop `spacing-5`). Tab labels (`.record-tab`) step down to `--ao-font-fixed-2xs` (desktop `xs`).

## Figma build 2026-09-30
Set `3871:3246` now: Width × **Actions (None | Steps | Form | Sidebar)** × **Device (Desktop | Mobile)** — 14 variants
(Sidebar has no Mobile: the switch is hidden ≤1023). The `Show Actions` boolean is gone; its instances moved to Actions=Steps
(Steps screens), Sidebar (View on / Edit off), None (Narrow + Mobile). Steps = Import + Add (Lookup renamed, actions right padding
removed); Form = Cancel (x) + Save (Tick); Sidebar reuses the StepsToolbar "Show details" toggle group.

## Overflow navigation (designer, 2026-10-02)

When the tabs don't fit the bar, `.record-tabs__list` scrolls sideways instead of clipping. There's no visible
scrollbar, and the cursor is `grab` only while it overflows (`--scrollable`, kept in step by a ResizeObserver).
`RecordTabs.js` (auto-init, idempotent) adds:
- **Mouse drag** (4px threshold). The click that ends a drag is swallowed, so a drag never opens a tab.
- **Vertical wheel** → horizontal scroll, only while it can move, so the page scrolls once it reaches an end.
- **Keyboard focus** brings the focused tab into view.
- The **active tab** is brought into view on load and whenever it changes in place (MutationObserver).

Touch uses native swipe. Loaded on Contract Analysis, the RecordTabs demo and every record screen (via
`_generate.py` KIT_JS). Verified at 390px on Contract Analysis (452px of tabs in a 285px list); no change at desktop
widths, where nothing overflows.
