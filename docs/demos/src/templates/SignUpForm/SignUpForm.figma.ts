import figma, { html } from '@figma/code-connect/html'

// Single variant. Composes Header, Input, and Button components.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=96-2429',
  {
    example: () => html`
      <div class="signup-form">
        <header class="header">
          <div class="header__title-group">
            <h1 class="header__title">Sign Up</h1>
            <button class="info-label" aria-label="More information">
              <i data-lucide="info" aria-hidden="true"></i>
              <span class="info-label__text">Info label</span>
            </button>
          </div>
        </header>

        <div class="signup-form__fields">
          <div class="input">
            <label class="input__label">First Name</label>
            <div class="input__wrap">
              <input class="input__field" type="text" placeholder="First name">
            </div>
          </div>

          <div class="input">
            <label class="input__label">Last Name</label>
            <div class="input__wrap">
              <input class="input__field" type="text" placeholder="Last name">
            </div>
          </div>

          <div class="input">
            <label class="input__label">Email</label>
            <div class="input__wrap">
              <input class="input__field" type="email" placeholder="Email address">
            </div>
          </div>
        </div>

        <div class="signup-form__actions">
          <button class="btn btn--secondary">Cancel</button>
          <button class="btn btn--primary">Get Started</button>
        </div>
      </div>
    `,
  }
)
