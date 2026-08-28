import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2025-1080',
  {
    props: {
      size: figma.enum('Size', {
        xs: 'toggle--xs',
        SM: '',
        Default: 'toggle--default',
        LG: 'toggle--lg',
      }),
      state: figma.enum('State', {
        Initial: '',
        Active: 'toggle--active',
        Disabled: 'toggle--disabled',
      }),
      /* `aria-checked` as its own enum off the same axis. It cannot be derived from `state`
       * inside the template: the parser requires every `${}` to be a destructured prop or a
       * `figma.*()` call, so a comparison there is rejected. See docs/code-connect.md. */
      checked: figma.enum('State', {
        Initial: 'false',
        Active: 'true',
        Disabled: 'false',
      }),
    },
    example: ({ size, state, checked }) => html`
      <button class="toggle ${size} ${state}" type="button" role="switch" aria-checked="${checked}">
        <span class="toggle__track"><span class="toggle__knob"></span></span>
        <span class="toggle__label">
          <span class="toggle__label-text">Label text</span>
          <span class="toggle__helper">Helper text</span>
        </span>
      </button>
    `,
  }
)
