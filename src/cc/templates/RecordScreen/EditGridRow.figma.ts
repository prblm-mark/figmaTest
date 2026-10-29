import figma, { html } from '@figma/code-connect/html'

// One row of EditGrid Rows=Accordion (record_markup.edit_grid_rows; code-first 2026-10-29, Hub TASK-576528):
// an Accordion Separated Cards item. The trigger holds only the row's name (and the Error badge after a
// failed save); the panel holds the row's FieldRows, then Move up / down and Select to delete.
// State: Closed / Open / Error (open, Error badge, the failing field in Input's error state).
// The FieldRows are the row's own fields; Content Type / Label / Number of Uploads / Title Alternative
// Help Text are Directory Step Profile's (DirectoryStepProfileEdit.html). RecordScreen.js renames the row
// from its name field and keeps the Move labels and the end buttons in step.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4521-43326', {
  props: {
    name: figma.string('Name'),
    open: figma.enum('State', { Closed: '', Open: 'acc__item--open', Error: 'acc__item--open' }),
    expanded: figma.enum('State', { Closed: 'false', Open: 'true', Error: 'true' }),
    badge: figma.enum('State', {
      Closed: html``,
      Open: html``,
      Error: html`<span class="badge badge--danger">Error</span>`,
    }),
  },
  example: ({ name, open, expanded, badge }) => html`<div class="acc__item edit-grid__row ${open}" data-edit-grid-row>
  <h4 class="acc__heading">
    <button type="button" class="acc__trigger" id="dsp-types-r1-trigger" aria-expanded="${expanded}" aria-controls="dsp-types-r1-panel" data-acc-trigger>
      <span class="edit-grid__row-title"><span class="edit-grid__row-name" id="dsp-types-r1-name">${name}</span>${badge}</span>
      <span class="acc__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>
    </button>
  </h4>
  <div class="acc__panel" id="dsp-types-r1-panel" role="region" aria-labelledby="dsp-types-r1-trigger">
    <div class="edit-grid__row-body">
      <!-- the row's FieldRows (edit_row with a row-unique fid); the name field carries data-edit-grid-row-name -->
      <div class="edit-grid__row-foot">
        <span class="edit-grid__row-move">
          <button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Move ${name} up" data-edit-grid-move="up"><i data-lucide="arrow-up" aria-hidden="true"></i></button>
          <button type="button" class="btn btn--tertiary btn--xs btn--icon" aria-label="Move ${name} down" data-edit-grid-move="down"><i data-lucide="arrow-down" aria-hidden="true"></i></button>
        </span>
        <label class="checkbox">
          <input type="checkbox" class="checkbox__input" aria-describedby="dsp-types-r1-name" data-edit-grid-select>
          <span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span>
          <span class="checkbox__label"><span class="checkbox__label-text">Select to delete</span></span>
        </label>
      </div>
    </div>
  </div>
</div>`,
})
