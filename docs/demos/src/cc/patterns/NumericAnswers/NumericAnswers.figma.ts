import figma, { html } from '@figma/code-connect/html'

// NumericAnswers (record_markup.numeric_answers; code-first + drawn 2026-10-29, Hub TASK-575540): AI
// Profile's metric layer as the "Numeric Data" section. Generate it with numeric_answers(mode, state) —
// the markup below is the section's skeleton; the status, notices, prompt and column table come from
// AIProfile.cfc getMetricLayerData (HANDOVER ml-layer). NumericAnswers.js drives the prompt reset and
// the column Accordion.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4529-45811', {
  props: {
    tone: figma.enum('State', { Confirmed: 'success', Draft: 'warning', None: 'neutral' }),
    label: figma.enum('State', { Confirmed: 'Confirmed', Draft: 'Draft', None: 'No mapping yet' }),
    mode: figma.enum('Mode', { Edit: 'edit', View: 'view' }),
  },
  example: ({ tone, label, mode }) => html`<section class="record-section" aria-labelledby="sec-numericdata">
  <div class="record-section__header"><h2 class="record-section__title" id="sec-numericdata">Numeric Data</h2></div>
  <div class="record-section__body">
    <!-- Numeric Data Answers: edit_row checkbox (edit) / view_row On|Off (view) -->
    <div class="field-row field-row--${mode} field-row--check">
      <span class="field-row__label">Mapping</span>
      <div class="field-row__value"><p class="numeric-answers__status"><span class="badge badge--${tone}">${label}</span><span class="numeric-answers__meta">on … by … · numeric answering is live</span></p></div>
    </div>
    <!-- notices: <div class="numeric-answers__notices"> Alerts (warning / danger, with .alert__list) — only when needed -->
    <!-- Generation Prompt: .numeric-answers__prompt[data-ml-prompt][data-standard] → bar (state Badge + "Use standard wording" btn--tertiary btn--sm, edit only) + Textarea -->
    <div class="acc numeric-answers__columns" data-acc="multi">
      <div class="acc__item">
        <h3 class="acc__heading"><button type="button" class="acc__trigger" aria-expanded="false" data-acc-trigger>
          <span class="numeric-answers__columns-title">How these spreadsheets are being read <span class="numeric-answers__meta">8 spreadsheet columns · 6 understood</span><span class="badge badge--warning">2 need a look</span></span>
          <span class="acc__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>
        </button></h3>
        <div class="acc__panel" role="region"><!-- table-wrap > table: Column | Spreadsheet › Sheet | How it's read; "Needs a look" rows first --></div>
      </div>
    </div>
  </div>
</section>`,
})
