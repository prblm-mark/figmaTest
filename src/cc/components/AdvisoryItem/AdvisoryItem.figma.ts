import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-2098', {
  props: { state: figma.enum('State', { Collapsed: '', Expanded: 'advisory-item--expanded' }) },
  example: ({ state }) => html`<li class="advisory-item ${state}">
  <div class="advisory-item__row">
    <i data-lucide="circle-alert" class="advisory-item__icon" aria-hidden="true"></i>
    <p class="advisory-item__title">No social sharelines entered</p>
    <button type="button" class="btn btn--secondary btn--xs btn--icon advisory-item__toggle" data-advisory-toggle aria-expanded="false" aria-controls="adv-1" aria-label="Show details"><i data-lucide="plus" class="advisory-item__plus" aria-hidden="true"></i><i data-lucide="minus" class="advisory-item__minus" aria-hidden="true"></i></button>
  </div>
  <p class="advisory-item__description" id="adv-1">Enter alternative versions of the title…</p>
</li>`,
})
