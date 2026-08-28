import figma, { html } from '@figma/code-connect/html'

/**
 * Stepper — Figma component set 3567:105380 (Components page, 1:769).
 *
 * A SECOND mapping for the Input component: the stepper is `.input--stepper`, a modifier rather
 * than a component of its own, so it shares Input's classes and lives in Input's directory. Its
 * own file because Code Connect is one `figma.connect` per Figma component (docs/code-connect.md),
 * and this is a distinct component set with its own variant axes.
 *
 * History worth keeping: this was built code-first from a Flowbite reference the designer supplied,
 * and shipped with "NO FIGMA NODE — no Code Connect entry possible" recorded against it. The
 * designer drew the component afterwards, and its axes turned out to match the six demo rows built
 * from the reference exactly — Default / Help / Error / At Min / At Max / No Label, in Base and sm.
 * See Input.figma-notes for the full reconciliation, including three bindings NOT adopted.
 *
 * The `Tier` axis is single-valued (`Component`) and is deliberately not mapped — Tier is metadata
 * in this system, never CSS, the same call taken on every other component with that axis.
 */
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3567-105380',
  {
    props: {
      size: figma.enum('Size', {
        Base: '',
        sm: 'input--sm',
      }),

      /* Only Error carries a class; the rest are structural or attribute changes below. */
      state: figma.enum('State', {
        Error: 'input--error',
      }),

      /* Present on every state except No Label. Code Connect renders an unlisted option as
       * nothing, so the five that keep a label are listed explicitly rather than relying on a
       * default that does not exist. */
      label: figma.enum('State', {
        Default: html`<label class="input__label" for="stepper">Label</label>`,
        Help: html`<label class="input__label" for="stepper">Label</label>`,
        Error: html`<label class="input__label" for="stepper">Label</label>`,
        'At Min': html`<label class="input__label" for="stepper">Label</label>`,
        'At Max': html`<label class="input__label" for="stepper">Label</label>`,
      }),

      /* Placeholder copy, matching the convention in Input.figma.ts — a Dev Mode snippet is
       * illustrative, and the real strings belong to the consumer. */
      help: figma.enum('State', {
        Help: html`<p class="input__help">Help text</p>`,
        Error: html`<p class="input__help">Error text</p>`,
      }),

      /* The buttons are genuinely `disabled` at the bounds, not merely dimmed — so they leave the
       * tab order and report themselves to assistive tech, and the control cannot produce an
       * invalid value at all. Input.js sets this at runtime; the snippet shows the resulting DOM. */
      decDisabled: figma.enum('State', {
        'At Min': 'disabled',
      }),
      incDisabled: figma.enum('State', {
        'At Max': 'disabled',
      }),
    },

    example: ({ size, state, label, help, decDisabled, incDisabled }) => html`
      <div class="input input--stepper ${size} ${state}">
        ${label}
        <div class="input__wrap">
          <button type="button" class="input__step input__step--dec" data-input-step="-1"
                  aria-controls="stepper" aria-label="Decrease" ${decDisabled}>
            <i data-lucide="minus" aria-hidden="true"></i>
          </button>
          <input id="stepper" class="input__control" type="number" value="10" min="6" max="12" step="1">
          <button type="button" class="input__step input__step--inc" data-input-step="1"
                  aria-controls="stepper" aria-label="Increase" ${incDisabled}>
            <i data-lucide="plus" aria-hidden="true"></i>
          </button>
        </div>
        ${help}
      </div>
    `,
  }
)
