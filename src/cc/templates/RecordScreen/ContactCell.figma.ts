import figma, { html } from '@figma/code-connect/html'

// A person in a table cell (Account View → Contacts; record_account._person, code-first 2026-10-09).
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4203-29761', {
  props: {
    name: figma.string('Name'),
    subtitle: figma.boolean('Show Subtitle', {
      true: html`<span class="contact-tab__summary">${figma.string('Subtitle')}</span>`,
      false: html``,
    }),
  },
  example: ({ name, subtitle }) => html`<span class="account-tab__person">
  <span class="avatar avatar--size-2"><img class="portrait" src="https://i.pravatar.cc/64?u=olivia-bennett" alt=""></span>
  <span class="account-tab__person-text"><a class="datatables__record-link" href="#">${name}</a>${subtitle}</span>
</span>`,
})
