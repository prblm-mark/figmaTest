import figma, { html } from '@figma/code-connect/html'

// Editable rows grid (record_markup.edit_grid, code-first 2026-10-09; drawn 2026-10-10) — Order
// Payment / Refund Details, Account subscriptions and event credits. Rows add / delete in memory
// (RecordScreen.js). Show Title off when the grid is its section's only content.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4202-29702', {
  props: {
    title: figma.boolean('Show Title', {
      true: html`<h3 class="edit-grid__title" id="order-payment-grid-title">${figma.string('Title')}</h3>`,
      false: html``,
    }),
    help: figma.boolean('Show Help', {
      true: html`<p class="input__help field-row__help" id="order-payment-grid-help">${figma.string('Help Text')}</p>`,
      false: html``,
    }),
  },
  example: ({ title, help }) => html`<div class="edit-grid" id="order-payment-grid" data-edit-grid>
  ${title}
  <div class="datatables"><div class="datatables__body"><table class="table" aria-labelledby="order-payment-grid-title" aria-describedby="order-payment-grid-help">
    <thead><tr><th>Payment date</th><th>Amount</th><th>Method</th><th>Reference</th><th aria-label="Delete"></th></tr></thead>
    <tbody><tr>
      <td><div class="input"><div class="input__wrap"><input type="text" class="input__control" value="14/09/2026" aria-label="Payment date"></div></div></td>
      <td><div class="input"><div class="input__wrap"><input type="text" class="input__control" value="£1,200.00" aria-label="Amount"></div></div></td>
      <td>Card</td>
      <td><div class="input"><div class="input__wrap"><input type="text" class="input__control" value="PAY-30412" aria-label="Reference"></div></div></td>
      <td class="datatables__col--tight"><label class="checkbox"><input type="checkbox" class="checkbox__input" aria-label="Select row"><span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span></label></td>
    </tr></tbody>
  </table></div></div>
  <div class="edit-grid__actions">
    <button type="button" class="btn btn--secondary btn--sm" data-edit-grid-add><i data-lucide="plus" aria-hidden="true"></i><span>Add row</span></button>
    <button type="button" class="btn btn--tertiary btn--sm" data-edit-grid-delete><i data-lucide="trash-2" aria-hidden="true"></i><span>Delete selected</span></button>
  </div>
  ${help}
</div>`,
})
