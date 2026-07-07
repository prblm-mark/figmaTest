import figma, { html } from '@figma/code-connect/html'

// Date Picker — Figma component set 3039:8761.
// The 7 Figma variants (Property 1) are modes/sub-views of one functional
// calendar rather than independent components, so Code Connect maps the
// property to the data-attributes that configure the JS-driven DatePicker.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3039-8761',
  {
    props: {
      property1: figma.enum('Property 1', {
        'Single Date': 'data-mode="single"',
        'No selection (today highlighted)': 'data-mode="single" data-inline',
        'With disabled past dates': 'data-mode="single" data-inline data-disable-past',
        'Date Range Single Month': 'data-mode="range" data-inline',
        'Date Range Dual Month': 'data-mode="range" data-months="2" data-inline',
        'Month Selector': 'data-mode="single" data-inline data-view="months"',
        'Year Selector': 'data-mode="single" data-inline data-view="years"',
      }),
    },
    example: ({ property1 }) => html`
      <!-- Single-date field + popover. For inline / range / selector variants,
           swap the data-attributes per the Property 1 mapping and drop the field. -->
      <div class="datepicker" data-datepicker ${property1}>
        <div class="input">
          <label class="input__label">Start date</label>
          <div class="input__wrap">
            <input class="input__control" type="text" readonly placeholder="Select date"
                   data-datepicker-input aria-label="Start date">
            <i data-lucide="calendar" class="datepicker__field-icon" data-datepicker-toggle aria-hidden="true"></i>
          </div>
        </div>
      </div>
    `,
  }
)
