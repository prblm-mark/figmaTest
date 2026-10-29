import figma, { html } from '@figma/code-connect/html'

// StylePreview (record_markup.style_preview; code-first and drawn 2026-10-29, Hub TASK-575540): the
// "Preview" section first on Design Style / Design Frame View + Edit. Kind picks the sample StylePreview.js
// draws; Width picks the switch's checked segment (the frame width itself is set by the script from the
// site's Breakpoint Profile). The template holds the record's own CSS — the backend's style-preview-css.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4527-43878', {
  props: {
    kind: figma.enum('Kind', { Style: 'style', Frame: 'frame' }),
    desktop: figma.enum('Width', { Desktop: 'true', Mobile: 'false' }),
    mobile: figma.enum('Width', { Desktop: 'false', Mobile: 'true' }),
  },
  example: ({ kind, desktop, mobile }) => html`<section class="record-section record-section--preview" aria-labelledby="sec-preview">
  <div class="record-section__header">
    <h2 class="record-section__title" id="sec-preview">Preview</h2>
    <div class="seg-control style-preview__widths" role="radiogroup" aria-label="Preview width" data-seg-control>
      <button class="seg-control__btn" type="button" role="radio" aria-checked="${desktop}" data-value="desktop"><i data-lucide="monitor" aria-hidden="true"></i><span class="seg-control__btn-label">Desktop</span></button>
      <button class="seg-control__btn" type="button" role="radio" aria-checked="false" data-value="tablet"><i data-lucide="tablet" aria-hidden="true"></i><span class="seg-control__btn-label">Tablet</span></button>
      <button class="seg-control__btn" type="button" role="radio" aria-checked="${mobile}" data-value="mobile"><i data-lucide="smartphone" aria-hidden="true"></i><span class="seg-control__btn-label">Mobile</span></button>
    </div>
  </div>
  <div class="record-section__body">
    <div class="style-preview" data-style-preview="${kind}" data-widths='{"tablet":"768px","mobile":"375px"}' data-thumb="…">
      <template data-style-preview-css><!-- the record's generated front-end CSS --></template>
      <iframe class="style-preview__frame" title="Preview of …" sandbox="allow-same-origin" loading="lazy"></iframe>
    </div>
  </div>
</section>`,
})
