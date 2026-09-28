import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3871-3246', {
  props: { width: figma.enum('Width', { Standard: '', Full: 'record-tabs--full' }) },
  example: ({ width }) => html`<nav class="record-tabs ${width}" aria-label="Record sections">
  <div class="record-tabs__list">
    <a class="record-tab record-tab--active" href="ArticleView.html" aria-current="page">Details</a>
    <a class="record-tab" href="ArticleSteps.html">Article steps<span class="record-tab__count">8</span></a>
  </div>
</nav>`,
})
