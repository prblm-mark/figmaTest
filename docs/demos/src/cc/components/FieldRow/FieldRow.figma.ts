import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3861-1987', {
  props: {
    layout: figma.enum('Layout', { Wide: '', Compact: 'field-row--compact' }),
    type: figma.enum('Type', { Text: '', Tags: '', Paragraph: 'field-row--paragraph', Media: 'field-row--media',
      Input: 'field-row--edit', Select: 'field-row--edit', TagBox: 'field-row--edit', Textarea: 'field-row--edit', 'Media Picker': 'field-row--edit' }),
  },
  example: ({ layout, type }) => html`<div class="field-row ${layout} ${type}">
  <dt class="field-row__label">Title</dt>
  <dd class="field-row__value">Affino 9.0.11.25 - The Refinement Update</dd>
</div>`,
})
