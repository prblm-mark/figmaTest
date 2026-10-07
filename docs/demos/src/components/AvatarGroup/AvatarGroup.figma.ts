import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4057-2759',
  {
    example: () => html`
      <div class="avatar-group" role="group" aria-label="5 people">
        <div class="avatar avatar--size-2"><img class="portrait" src="portrait.jpg" alt="Name"></div>
        <div class="avatar avatar--size-2"><img class="portrait" src="portrait.jpg" alt="Name"></div>
        <div class="avatar avatar--size-2"><img class="portrait" src="portrait.jpg" alt="Name"></div>
        <div class="avatar avatar--size-2"><img class="portrait" src="portrait.jpg" alt="Name"></div>
        <span class="avatar avatar--size-2 avatar--initials avatar-group__more" aria-label="2 more">+2</span>
      </div>
    `,
  },
)
