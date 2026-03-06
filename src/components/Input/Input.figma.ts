import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=78-2016',
  {
    props: {
      size: figma.enum('Size', {
        Base: '',
        sm: 'input--sm',
      }),
      state: figma.enum('State', {
        Default: '',
        Hover: '',
        Active: '',
        Focus: '',
        Error: 'input--error',
      }),
    },
    example: ({ size, state }) => html`
      <div class="input ${size} ${state}">
        <label class="input__label">Label</label>
        <div class="input__wrap">
          <i data-lucide="search" class="input__icon" aria-hidden="true"></i>
          <input class="input__field" type="text" placeholder="Placeholder">
          <button class="input__clear" aria-label="Clear">
            <i data-lucide="x" aria-hidden="true"></i>
          </button>
        </div>
        <p class="input__help">Help text</p>
      </div>
    `,
  }
)
