import figma, { html } from '@figma/code-connect/html'

// Type controls visual decoration:
//   Default — basic header + rows
//   Striped — alternating row backgrounds
//   Border  — vertical cell separators
//
// Device variants (Desktop / Mobile) are responsive — at narrow viewports
// the wrap auto-scrolls horizontally; no modifier class is needed.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2557-6203',
  {
    props: {
      type: figma.enum('Type', {
        Default: 'default',
        Striped: 'striped',
        Border: 'border',
      }),
    },
    example: () => html`
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Product name</th>
              <th>Colour</th>
              <th>Category</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Apple MacBook Pro 17"</td><td>Silver</td><td>Laptop</td><td>£2,999</td></tr>
            <tr><td>Microsoft Surface Pro</td><td>White</td><td>Laptop PC</td><td>£1,999</td></tr>
            <tr><td>Magic Mouse 2</td><td>Black</td><td>Accessories</td><td>£99</td></tr>
            <tr><td>Google Pixel Phone</td><td>Gray</td><td>Phone</td><td>£799</td></tr>
          </tbody>
        </table>
      </div>
    `,
  }
)
