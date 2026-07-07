import figma, { html } from '@figma/code-connect/html'

// FilterDropdowns — Figma component set 3039:5639 (Tier=Pattern).
// One shell (bordered 320px card + full-width Apply) whose body swaps per Type.
// The Type enum maps to the body-composition each variant uses; the example below
// shows the shared shell with the Select body. See FilterDropdowns.html for every
// core body and FilterDropdowns.figma-notes.md for the full matrix.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3039-5639',
  {
    props: {
      // Documents which child composition each Type uses (core phase built; the
      // last three are pending phase 2).
      type: figma.enum('Type', {
        'Select': 'Input (chevron) + Apply',
        'w/Placeholder': 'Input (chevron, placeholder) + Apply',
        'Text': 'Input (text) + Apply',
        'Checkbox': 'title + Checkbox + Apply',
        'Multi Select': 'label + Checkbox list + Apply',
        'Multi Select w/search': 'Input (search) + Checkbox list + Apply',
        'Select Options': 'Input (chevron) + FilterDropdownItemGroup + Apply',
        'Select Options w/subtext': 'Input (chevron) + FilterDropdownItemGroup (subtext) + Apply',
        'Date In the last': 'Input (operator) + [number + unit] + Apply',
        'Date Range': 'Input (operator) + [DatePicker and DatePicker] + Apply',
        'Date Equal To': 'Input (operator) + DatePicker + Apply',
        'More Filters': 'FilterItem chips (no Apply)',
        'Predictive Text': 'PENDING (phase 2)',
        'Predictive Text Options': 'PENDING (phase 2)',
        'Predictive text OPtions w/subtext': 'PENDING (phase 2)',
        'Multi Select Table': 'PENDING (phase 2 — Datatables)',
        'Multi Select Modal': 'PENDING (phase 2 — Modal)',
      }),
    },
    example: ({ type }) => html`
      <!-- Shared shell; body swaps per Type (${type}). Example: Select. -->
      <div class="filter-dropdowns" data-filter-dropdowns>
        <div class="input">
          <label class="input__label">Filter by Zone</label>
          <div class="input__wrap">
            <input class="input__control" type="text" readonly aria-label="Zone">
            <i data-lucide="chevron-down" class="input__icon" aria-hidden="true"></i>
          </div>
        </div>
        <button type="button" class="btn btn--primary filter-dropdowns__apply" data-filter-dropdowns-apply>Apply</button>
      </div>
    `,
  }
)
