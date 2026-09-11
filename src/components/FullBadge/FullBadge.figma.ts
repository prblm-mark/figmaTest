import figma, { html } from '@figma/code-connect/html'

// FullBadge finally has a component to attach to. Until 2026-09-11 Figma drew it as four
// separate inline `Full-Badge` frames across RoomCard and TableCard, and `figma.connect`
// needs a component — so this file could not exist and the badge was the one piece of the
// Seating Planner module with no mapping. Component set: `3615:110610`.
//
// Nothing to map as props:
//   - `Tier` is single-valued (`Component`) and produces no CSS, so it is intentionally
//     not mapped — the same call TableType, RoomCard and TableCard already take.
//   - There is no TEXT property. "Full" is a static text layer (`3615:110607`), not an
//     exposed property, so the label is hardcoded here rather than driven by `figma.string`.
//     If the badge ever needs to say anything else, that becomes a Figma property first.
//
// The check is Lucide `check`, not Figma's exported SVG — the house rule is Lucide by name,
// never inline SVG.

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3615-110610',
  {
    example: () => html`
      <span class="full-badge"><i data-lucide="check" aria-hidden="true"></i>Full</span>
    `,
  }
)
