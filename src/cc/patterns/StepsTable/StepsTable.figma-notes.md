# StepsTable — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3881:7518`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3881-7518) · Tier: **Pattern** → `src/cc/patterns/StepsTable/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3881:7518` | Details=Off, Width=Standard |  |
| `3881:7518` | Details=On, Width=Standard | every row expanded |
| `3881:7518` | Details=Off, Width=Full |  |
| `3881:7518` | Details=On, Width=Full |  |
| `3881:4979` | StepRow State=Default / Expanded |  |
| `3881:4747` | StepsToolbar |  |
| `3881:4768` | StepsHeaderRow |  |
| `3881:4808` | StepDetail |  |
| `3881:4980` | StepsFooter |  |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Table | `.datatables.steps-table (+ --details, --full) [data-steps-table]` |
| Toolbar | `.datatables__toolbar / __meta / __select + .steps-table__details-toggle (Toggle xxs [data-steps-details])` |
| Header / sort | `.datatables__sort (+ --active)` |
| Row | `.datatables__row; title .steps-table__title-cell > .steps-table__title; edit .datatables__row-edit` |
| Detail row | `.datatables__row-detail > .step-detail (__media / __chip / __body / __link)` |
| Footer | `.datatables__footer / __pagination / __page-btn` |

## Token Mapping

| Property | Token |
|---|---|
| surfaces | --ai-datatable-table-bg / -header-bg / -subheader-bg / -footer-bg / -expanded-bg |
| icons | dash --ai-icon-contrast, live tick --ai-text-success |
| detail chip | 1px --ai-border-secondary, --ai-radius-sm, --ai-spacing-1 / --ai-spacing-3, --ai-font-fixed-xxs --ai-leading-sm --ai-text-contrast |
| detail body | --ai-font-fixed-xs; p --ai-leading-md --ai-text-secondary; h4 SemiBold --ai-leading-lg --ai-text-primary |
| detail indent | --ai-spacing-9 (checkbox column) |

## Token Gaps & Decisions
Built on Datatables — no new table. Column widths follow the table resizing rule (Title fills, others hug); Figma's fixed pixel columns are a Figma-table limitation (designer). Live tick in Figma is `green/11` from the Radix Full library → `--ai-text-success` (identical #218358). No Edit Columns on Steps (designer). Draft detail row bg was borrowed `--ai-btn-secondary-bg-hover` → `--ai-datatable-table-expanded-bg`. Tab count says 8 while the table says 21 — draft inconsistency, flagged.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.

## Contextual override — author chip border (designer, 2026-09-28)
The "Created By" chip is `btn btn--tertiary btn--sm` + `.steps-table__author-chip`, which holds
`--ai-border-secondary` through rest / hover / focus — the same Case B line as the listing rows'
account chip (`.datatables__account-chip`). In Figma both StepRow variants' `Created By` instances
(`3881:4873`, `3881:4920`) carry a 1px inside stroke bound to `border/secondary`; the Button set
itself is unchanged (tertiary border tokens stay transparent).
