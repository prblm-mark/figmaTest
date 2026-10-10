import figma, { html } from '@figma/code-connect/html'

// A record tab's table card (record_contact._table_card / _rows_card, code-first 2026-10-07; drawn
// 2026-10-10). Two share a row in .contact-tab-grid. The table is data-fit="even" (DatatablesFit:
// keep / drop / weight per column). Show more only when more rows exist than are shown.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4203-29768', {
  props: {
    title: figma.string('Title'),
    add: figma.boolean('Show Add', {
      true: html`<button type="button" class="btn btn--secondary btn--sm" aria-label="Add contact"><i data-lucide="plus" aria-hidden="true"></i><span class="contact-tab__btn-label">Add contact</span></button>`,
      false: html``,
    }),
    foot: figma.boolean('Show Foot', {
      true: html`<div class="contact-tab__foot"><span class="contact-tab__count">${figma.string('Foot Text')}</span><button type="button" class="btn btn--tertiary btn--sm"><span>Show more</span><i data-lucide="chevron-down" aria-hidden="true"></i></button></div>`,
      false: html``,
    }),
  },
  example: ({ title, add, foot }) => html`<section class="datatables datatables--orders contact-tab" aria-labelledby="tab-accountcontacts">
  <div class="datatables__toolbar contact-tab__head">
    <h2 class="contact-tab__title" id="tab-accountcontacts">${title} <span class="badge badge--neutral" aria-label="6 account contacts">6</span></h2>${add}
  </div>
  <div class="datatables__body"><table class="table" data-fit="even">
    <thead><tr><th data-keep data-weight="2" data-fluid>Contact</th><th data-drop="2">Email</th><th data-drop="1">Role</th><th data-keep>Last login</th></tr></thead>
    <tbody><tr>
      <td><span class="account-tab__person"><span class="avatar avatar--size-2"><img class="portrait" src="https://i.pravatar.cc/64?u=olivia-bennett" alt=""></span><span class="account-tab__person-text"><a class="datatables__record-link" href="#">Olivia Bennett</a><span class="contact-tab__summary">Head of Partnerships</span></span></span></td>
      <td>olivia.bennett@northbridge.example</td>
      <td><span class="badge badge--neutral">Primary</span></td>
      <td>08 Oct 2026</td>
    </tr></tbody>
  </table></div>
  ${foot}
</section>`,
})
