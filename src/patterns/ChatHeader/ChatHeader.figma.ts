import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2124-3686',
  {
    props: {
      type: figma.enum('Type', {
        Default: '',
        Minimised: 'chat-header--minimised',
        Mobile: 'chat-header--mobile',
      }),
      state: figma.enum('State', {
        Default: '',
        Dropdown: 'dropdown-open',
        'Admin View': 'admin-visible',
        'Debug On': 'admin-visible',
        'Cache Off': 'admin-visible',
        Style: 'admin-visible',
        'System Role': 'admin-visible',
      }),
      options: figma.enum('Options', {
        Center: '',
        'Alignment Left': 'chat-header--align-left',
        'No Border': 'chat-header--no-border',
      }),
    },
    example: ({ type, state, options }) => html`
      <div class="chat-header ${type} ${options}">
        <div class="chat-header__container">
          <button
            class="btn btn--tertiary btn--sm btn--icon"
            aria-label="Toggle sidebar"
          >
            <i data-lucide="panel-left" aria-hidden="true"></i>
          </button>
          <div class="chat-header__selector-wrap">
            <div class="chat-header__selector-group">
              <button
                class="chat-header__selector"
                aria-expanded="false"
                aria-haspopup="listbox"
              >
                <span class="chat-header__selector-text"
                  >Support Assistant</span
                >
                <span class="chat-header__selector-chevron">
                  <i data-lucide="chevron-down" aria-hidden="true"></i>
                </span>
              </button>
              <div class="chat-header__dropdown" role="listbox">
                <div class="chat-header__dropdown-item" role="option">
                  Customer Services
                </div>
                <div
                  class="chat-header__dropdown-item chat-header__dropdown-item--selected"
                  role="option"
                  aria-selected="true"
                >
                  Support Assistant
                </div>
                <div class="chat-header__dropdown-item" role="option">
                  Tech Monkey
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
)
