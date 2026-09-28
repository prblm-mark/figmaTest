import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3875-3268', {
  example: () => html`<div class="tag-box" data-tag-box>
  <ul class="tag-box__tags" data-empty="None selected">
    <li class="badge badge--neutral"><span>AI</span><button type="button" class="badge__close" aria-label="Remove AI"><i data-lucide="x" aria-hidden="true"></i></button></li>
  </ul>
  <button type="button" class="btn btn--secondary btn--sm" data-tag-box-select="modal-id">Select</button>
</div>`,
})
