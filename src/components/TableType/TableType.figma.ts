import figma, { html } from '@figma/code-connect/html'

// Table Type has no TEXT property — the visible label IS the variant name, so both the
// modifier class and the label are driven off the same `Type` enum.
// The `Tier` axis is single-valued (`Component`) and produces no CSS, so it is
// intentionally not mapped.

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3470-85494',
  {
    props: {
      // VIP is Figma's default variant and is also the CSS default, so it maps to no
      // modifier — `.table-type` alone already resolves to the VIP colour.
      type: figma.enum('Type', {
        VIP: '',
        'Head Table': 'table-type--head-table',
        Gold: 'table-type--gold',
        Silver: 'table-type--silver',
        Bronze: 'table-type--bronze',
      }),
      label: figma.enum('Type', {
        VIP: 'VIP',
        'Head Table': 'Head Table',
        Gold: 'Gold',
        Silver: 'Silver',
        Bronze: 'Bronze',
      }),
    },
    example: ({ type, label }) => html`
      <span class="table-type ${type}">${label}</span>
    `,
  }
)
