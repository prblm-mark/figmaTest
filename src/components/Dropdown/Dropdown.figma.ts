import figma, { html } from '@figma/code-connect/html'

// Type controls panel content (Basic / With Header / Actions / Checkbox /
// Search / User menu / User Menu Icon Nav). Open/close, click-outside
// dismiss, Escape-to-close, and search filtering are wired up by Dropdown.js.
// Checkbox + User menu variants use data-dropdown="stay-open" so the panel
// stays open as users toggle. The User menu reveal hook is also in Dropdown.js
// (data-reveal-by links a row to a source toggle).
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2553-3676',
  {
    props: {
      type: figma.enum('Type', {
        Basic: '',
        'With Header': '',
        Actions: '',
        Checkbox: '',
        Search: '',
        'User menu': 'dropdown--user-menu',
        'User Menu Icon Nav': 'dropdown--user-menu',
      }),
    },
    example: ({ type }) => html`
      <div class="dropdown ${type}">
        <button class="btn btn--secondary dropdown__trigger" aria-haspopup="menu" aria-expanded="false">
          <span>Trigger</span>
          <i data-lucide="chevron-down" aria-hidden="true"></i>
        </button>
        <div class="dropdown__panel" role="menu">
          <!-- For User menu: include ThemeToggle, .dropdown__toggle-list with toggles,
               .dropdown__divider, and .dropdown-item rows. See Dropdown.html demos. -->
          <ul class="dropdown__list">
            <li role="none"><button type="button" class="dropdown-item" role="menuitem"><span data-text="Item">Item</span></button></li>
          </ul>
        </div>
      </div>
    `,
  }
)
