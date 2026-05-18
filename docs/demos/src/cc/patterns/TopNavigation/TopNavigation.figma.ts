import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4099-3634',
  {
    props: {
      type: figma.enum('Type', {
        Default: 'default',
        Multizone: 'multizone',
      }),
    },
    example: ({ type }) => html`
      <header class="cc-top-navigation">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol class="breadcrumb__list">
            ${type === 'multizone'
              ? html`
                <li class="breadcrumb__item">
                  <div class="dropdown">
                    <button class="breadcrumb__dropdown dropdown__trigger" type="button" aria-haspopup="menu" aria-expanded="false">
                      Zone Selector
                      <i data-lucide="chevron-down" aria-hidden="true"></i>
                    </button>
                    <div class="dropdown__panel" role="menu">
                      <ul class="dropdown__list">
                        <li role="none"><button type="button" class="dropdown__item" role="menuitem">Zone A</button></li>
                      </ul>
                    </div>
                  </div>
                </li>
                <li class="breadcrumb__separator" aria-hidden="true"><i data-lucide="chevron-right" aria-hidden="true"></i></li>
                <li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Level 1</a></li>
                <li class="breadcrumb__separator" aria-hidden="true"><i data-lucide="chevron-right" aria-hidden="true"></i></li>
                <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">Level 2</li>
              `
              : html`
                <li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Zone name</a></li>
                <li class="breadcrumb__separator" aria-hidden="true"><i data-lucide="chevron-right" aria-hidden="true"></i></li>
                <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">Level 1</li>
              `}
          </ol>
        </nav>
        <div class="cc-top-navigation__actions">
          <button class="cc-top-navigation__user" type="button" aria-label="User menu" aria-haspopup="true">
            <img class="portrait" src="portrait.jpg" alt="User" />
            <span class="cc-top-navigation__user-name">User Name</span>
            <span class="cc-top-navigation__user-chevron" aria-hidden="true">
              <i data-lucide="chevron-down" aria-hidden="true"></i>
            </span>
          </button>
          <button class="cc-top-navigation__preview" type="button" aria-label="Preview as desktop">
            <i data-lucide="monitor" aria-hidden="true"></i>
          </button>
        </div>
      </header>
    `,
  }
)
