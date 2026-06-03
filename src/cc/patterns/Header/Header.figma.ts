import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4105-3641',
  {
    props: {
      type: figma.enum('Type', {
        Default: '',
        'Sub Text': 'cc-header--sub-text',
        Control: 'cc-header--control',
      }),
    },
    example: ({ type }) => html`
      <div class="cc-header-cq">
      <header class="cc-header ${type}">
        <div class="cc-header__title-block">
          <div class="cc-header__title-block-text">
            <h1 class="cc-header__title">Page name</h1>
          </div>
        </div>
        <div class="cc-header__actions">
          <span class="notification-badge">
            <button class="btn btn--tertiary btn--icon" type="button" aria-label="Notifications, 2 unread">
              <i data-lucide="bell" aria-hidden="true"></i>
            </button>
            <span class="notification-badge__count" aria-hidden="true">2</span>
          </span>
          <button class="btn btn--secondary" type="button">
            <i data-lucide="pencil" aria-hidden="true"></i>
            <span class="cc-header__btn-label">Edit</span>
          </button>
          <button class="btn btn--primary" type="button">
            <i data-lucide="plus" aria-hidden="true"></i>
            <span class="cc-header__btn-label">Add</span>
          </button>
          <div class="dropdown">
            <button class="cc-header__kebab dropdown__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="More actions">
              <i data-lucide="ellipsis-vertical" aria-hidden="true"></i>
            </button>
            <div class="dropdown__panel" role="menu"><ul class="dropdown__list"></ul></div>
          </div>
        </div>
      </header>
      </div>
    `,
  }
)
