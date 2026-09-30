import figma, { html } from '@figma/code-connect/html'

// TinyMCE 8 on a plain textarea; RichTextEditor.js mounts it with the live Control Centre toolbar.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3939-23167', {
  example: () => html`<div class="textarea rich-text">
  <textarea class="textarea__control" id="f-step-text" rows="10" data-rich-text></textarea>
</div>`,
})
