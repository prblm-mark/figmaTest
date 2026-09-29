import figma, { html } from '@figma/code-connect/html'

// Set 3905:140931 — Layout (Default / Stacked) × State (Collapsed / Expanded).
// Layout=Stacked is the RecordSection ≤559 container query (no class); State is MediaMeta.js.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3905-140931', {
  props: {
    expanded: figma.enum('State', { Collapsed: false, Expanded: true }),
  },
  example: ({ expanded }) => html`<div class="media-meta">
  <img class="media-meta__thumb" src="thumb.jpg" alt="…">
  <div class="media-meta__details">
    <button type="button" class="btn btn--secondary btn--xs media-meta__toggle" data-media-toggle aria-expanded="${expanded}" aria-controls="media-meta-1"><span>${expanded ? 'Hide details' : 'Show details'}</span><i data-lucide="chevron-down" class="media-meta__chevron" aria-hidden="true"></i></button>
    <dl class="media-meta__list" id="media-meta-1" ${expanded ? '' : 'hidden'}><dt class="media-meta__term">Alt text</dt><dd class="media-meta__value">…</dd></dl>
  </div>
</div>`,
})
