import figma, { html } from '@figma/code-connect/html'

// Repointed 2026-08-28: was `node-id=4218-4680`, which Code Connect rejects — it is a variant
// or inner frame, not a top-level component. Correct target is the IconNavigation set (Tier), confirmed via
// `list_file_components_for_code_connect` on the CC Hybrid file rather than read off the canvas.
figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4218-4681',
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
