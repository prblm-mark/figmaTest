import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-1977', {
  example: () => html`<li class="viewer-item">
  <div class="avatar"><img class="portrait" src="…" alt=""></div>
  <div class="viewer-item__body">
    <div class="viewer-item__identity"><div class="viewer-item__who"><p class="viewer-item__name">Simon Hassell</p><p class="viewer-item__role">Principal, Argutus Consulting</p></div><p class="viewer-item__time">5 days, 18hrs</p></div>
    <div class="viewer-item__companies"><a class="btn btn--tertiary btn--xs" href="#"><span>Argutus</span></a></div>
  </div>
</li>`,
})
