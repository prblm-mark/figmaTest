import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4218-4680',
  {
    example: () => html`
      <nav class="cc-icon-nav" aria-label="Module navigation">
        <ul class="cc-icon-nav__list">
          <!-- One <li> per module: Publish, Promote, Social, Media, Structure,
               Design, Commerce, Analyse, Settings. -->
          <li class="cc-icon-nav__item">
            <a class="cc-icon-nav__link" href="#">
              <span class="cc-icon-nav__icon-box">
                <span class="cc-icon-nav__icon cc-icon-nav__icon--publish" aria-hidden="true"></span>
              </span>
              <span class="cc-icon-nav__label">Publish</span>
            </a>
          </li>
        </ul>
      </nav>
    `,
  }
)
