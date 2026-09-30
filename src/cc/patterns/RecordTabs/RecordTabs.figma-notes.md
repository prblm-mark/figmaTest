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

## Token Mapping

| Property | Token |
|---|---|
| bar | --ai-surface-primary, 1px --ai-border-secondary, --ai-radius-md; Full: radius-none, bottom border |
| bar padding / gap | --ai-spacing-0-5 top, --ai-spacing-5 sides / --ai-spacing-5 |
| tab | padding --ai-spacing-5 0, gap --ai-spacing-2, --ai-font-fixed-xs Medium --ai-leading-sm |
| tab colour | --ai-text-contrast → active --ai-text-brand |
| underline | 2px transparent → active --ai-border-brand |
| count | --ai-surface-info-soft, --ai-radius-full, 0 --ai-spacing-2, min-width --ai-spacing-6, --ai-font-fixed-xxs SemiBold --ai-text-info |
| actions | gap --ai-spacing-3, padding-right --ai-spacing-4 |

## Token Gaps & Decisions
Draft active underline was `Lagoon/10` (no token) → `--ai-border-brand` (designer). Inactive underline was the borrowed `--ai-btn-primary-border` → transparent. Tabs are links: Details / Article steps are separate screens.

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

`.record-tab--active` is **SemiBold** (`--ai-font-semibold`); the other tabs stay Medium. Flag for Figma.
