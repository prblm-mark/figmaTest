import figma, { html } from '@figma/code-connect/html'

// Stepper — code-first 2026-10-22 (Import pattern, TASK-575621), drawn in Figma 2026-11-05 as
// "Flow Stepper" (the name "Stepper" is the number field). Stepper.js renders it:
// Stepper.render(nav, { steps, current, errors, locked }). The markup below is what it produces.

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4935-44691', {
  example: () => html`<nav class="stepper" aria-label="Import steps">
  <ol class="stepper__list">
    <li class="stepper__step stepper__step--complete"><button type="button" class="stepper__item" data-stepper-index="0" aria-label="Step 1 of 5: Upload, done"><span class="stepper__marker" aria-hidden="true"><i data-lucide="check"></i></span><span class="stepper__label">Upload</span></button></li>
    <li class="stepper__step stepper__step--complete"><button type="button" class="stepper__item" data-stepper-index="1" aria-label="Step 2 of 5: Map columns, done"><span class="stepper__marker" aria-hidden="true"><i data-lucide="check"></i></span><span class="stepper__label">Map columns</span></button></li>
    <li class="stepper__step stepper__step--current" aria-current="step"><span class="stepper__item" aria-label="Step 3 of 5: Options, current"><span class="stepper__marker" aria-hidden="true">3</span><span class="stepper__label">Options</span></span></li>
    <li class="stepper__step"><span class="stepper__item" aria-label="Step 4 of 5: Review"><span class="stepper__marker" aria-hidden="true">4</span><span class="stepper__label">Review</span></span></li>
    <li class="stepper__step"><span class="stepper__item" aria-label="Step 5 of 5: Results"><span class="stepper__marker" aria-hidden="true">5</span><span class="stepper__label">Results</span></span></li>
  </ol>
</nav>
<script>Stepper.render(document.querySelector('.stepper'), { steps: ['Upload', 'Map columns', 'Options', 'Review', 'Results'], current: 2 })</script>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4935-44624', {
  variant: { State: 'Upcoming' },
  props: { label: figma.string('Label'), number: figma.string('Number') },
  example: ({ label, number }) => html`<li class="stepper__step"><span class="stepper__item"><span class="stepper__marker" aria-hidden="true">${number}</span><span class="stepper__label">${label}</span></span></li>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4935-44624', {
  variant: { State: 'Current' },
  props: { label: figma.string('Label'), number: figma.string('Number') },
  example: ({ label, number }) => html`<li class="stepper__step stepper__step--current" aria-current="step"><span class="stepper__item"><span class="stepper__marker" aria-hidden="true">${number}</span><span class="stepper__label">${label}</span></span></li>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4935-44624', {
  variant: { State: 'Complete' },
  props: { label: figma.string('Label') },
  example: ({ label }) => html`<li class="stepper__step stepper__step--complete"><button type="button" class="stepper__item"><span class="stepper__marker" aria-hidden="true"><i data-lucide="check"></i></span><span class="stepper__label">${label}</span></button></li>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4935-44624', {
  variant: { State: 'Error' },
  props: { label: figma.string('Label') },
  example: ({ label }) => html`<li class="stepper__step stepper__step--error"><button type="button" class="stepper__item"><span class="stepper__marker" aria-hidden="true">!</span><span class="stepper__label">${label}</span></button></li>`,
})
