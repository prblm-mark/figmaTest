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

// Type=Record — record screen header (View / Edit / Steps). Its Figma component is the DS-file
// RecordHeader (View & Edit kit), not a variant of the CC-file Header set, so it connects separately.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3867-2138',
  {
    example: () => html`
      <div class="cc-header-cq">
        <header class="cc-header cc-header--record">
          <div class="cc-header__title-block"><div class="cc-header__title-block-text">
            <p class="cc-header__record-type">Article</p>
            <h1 class="cc-header__title">Affino 9.0.11.25 — The Refinement Update</h1>
          </div></div>
          <div class="cc-header__actions">
            <button type="button" class="btn btn--secondary"><span>Add</span></button>
            <a class="btn btn--primary" href="ArticleEdit.html"><i data-lucide="pencil" aria-hidden="true"></i><span>Edit</span></a>
          </div>
        </header>
      </div>
    `,
  }
)
