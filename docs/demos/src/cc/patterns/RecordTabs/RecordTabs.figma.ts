import figma, { html } from '@figma/code-connect/html'

// Actions × Device added 2026-09-30. Device=Mobile is the cs-page < 768 container query (no class):
// Import hides and every icon + label action goes icon-only.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3871-3246', {
  props: {
    width: figma.enum('Width', { Standard: '', Full: 'record-tabs--full' }),
    actions: figma.enum('Actions', {
      None: '',
      Steps: html`<div class="record-tabs__actions"><a class="btn btn--secondary btn--sm record-tabs__import" href="ArticleStepImport.html"><span>Import</span></a><button type="button" class="btn btn--primary btn--sm" aria-label="Add a step" data-record-modal-open="modal-add-step" aria-haspopup="dialog"><i data-lucide="plus" aria-hidden="true"></i><span class="record-tabs__btn-label">Add</span></button></div>`,
      Form: html`<div class="record-tabs__actions"><a class="btn btn--secondary btn--sm" href="ArticleSteps.html" aria-label="Cancel"><i data-lucide="x" aria-hidden="true"></i><span class="record-tabs__btn-label">Cancel</span></a><a class="btn btn--primary btn--sm" href="ArticleSteps.html" aria-label="Save"><i data-lucide="check" aria-hidden="true"></i><span class="record-tabs__btn-label">Save</span></a></div>`,
      Sidebar: html`<div class="record-tabs__actions"><span class="record-tabs__sidebar-toggle"><button class="toggle toggle--xxs toggle--active" type="button" role="switch" aria-checked="true" aria-labelledby="record-sidebar-label" data-record-sidebar><span class="toggle__track"><span class="toggle__knob"></span></span></button><span id="record-sidebar-label">Show sidebar</span></span></div>`,
    }),
  },
  example: ({ width, actions }) => html`<nav class="record-tabs ${width}" aria-label="Record sections">
  <div class="record-tabs__list">
    <a class="record-tab record-tab--active" href="ArticleView.html" aria-current="page">Details</a>
    <a class="record-tab" href="ArticleSteps.html">Article steps<span class="record-tab__count">8</span></a>
  </div>${actions}
</nav>`,
})
