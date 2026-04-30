import figma, { html } from '@figma/code-connect/html'

// Type controls panel content (Basic / With Header / Actions / Checkbox / Search).
// Open/close, click-outside dismiss, Escape-to-close, and search filtering
// are wired up by Dropdown.js. Checkbox variant uses data-dropdown="stay-open"
// so the panel stays open as users toggle multiple checkboxes.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2553-3676',
  {
    props: {
      type: figma.enum('Type', {
        Basic: 'basic',
        'With Header': 'with-header',
        Actions: 'actions',
        Checkbox: 'checkbox',
        Search: 'search',
      }),
    },
    example: () => html`
      <!-- Basic -->
      <div class="dropdown">
        <button class="btn btn--secondary dropdown__trigger" aria-haspopup="menu" aria-expanded="false">
          <span>Dropdown</span>
          <i data-lucide="chevron-down" aria-hidden="true"></i>
        </button>
        <div class="dropdown__panel" role="menu">
          <ul class="dropdown__list">
            <li role="none"><button type="button" class="dropdown__item" role="menuitem">Dashboard</button></li>
            <li role="none"><button type="button" class="dropdown__item dropdown__item--selected" role="menuitem" aria-current="page">Settings</button></li>
            <li role="none"><button type="button" class="dropdown__item" role="menuitem">Earnings</button></li>
            <li role="none"><button type="button" class="dropdown__item" role="menuitem">Sign out</button></li>
          </ul>
        </div>
      </div>
    `,
  }
)
