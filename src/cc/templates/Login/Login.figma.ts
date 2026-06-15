import figma, { html } from '@figma/code-connect/html'

// CC Control Centre login screen. Layout-only template that composes
// Input ×2 (email + password), Checkbox (remember me) and Button (primary,
// full-width) on a centred card, under the Affino wordmark + title. Renders
// under [data-brand="cc"]. The Device axis (Desktop/Mobile) is handled
// responsively at the 768px breakpoint inside the template — no separate
// variants in code. Inputs + checkbox box use a scoped --ai-surface-input
// override. Form is a visual mock — see HANDOVER.md → Login.
figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4254-11692',
  {
    props: {
      device: figma.enum('Device', {
        Desktop: 'desktop',
        Mobile: 'mobile',
      }),
    },
    example: () => html`
      <html data-brand="cc">
      <main class="cc-login">
        <div class="cc-login__column">
          <div class="cc-login__head">
            <div class="cc-login__brand" role="img" aria-label="Affino"></div>
            <h1 class="cc-login__title">Control Centre Login</h1>
          </div>
          <form class="cc-login__card" action="#" method="post" novalidate>
            <div class="input">
              <label class="input__label" for="cc-login-email">Email address</label>
              <div class="input__wrap">
                <i data-lucide="mail" class="input__icon" aria-hidden="true"></i>
                <input id="cc-login-email" type="email" class="input__control">
              </div>
            </div>
            <div class="input">
              <label class="input__label" for="cc-login-password">Password</label>
              <div class="input__wrap">
                <i data-lucide="lock" class="input__icon" aria-hidden="true"></i>
                <input id="cc-login-password" type="password" class="input__control">
              </div>
            </div>
            <div class="cc-login__options">
              <label class="checkbox">
                <input type="checkbox" class="checkbox__input" id="cc-login-remember">
                <span class="checkbox__indicator">
                  <i data-lucide="check" aria-hidden="true"></i>
                </span>
                <span class="checkbox__label">
                  <span class="checkbox__label-text">Remember me</span>
                </span>
              </label>
              <a href="#" class="cc-login__link">Forgot password?</a>
            </div>
            <button type="submit" class="btn btn--primary cc-login__submit">Login</button>
          </form>
          <p class="cc-login__footer">Not a member? <a href="#" class="cc-login__link">Register Now</a></p>
        </div>
      </main>
      </html>
    `,
  },
)
