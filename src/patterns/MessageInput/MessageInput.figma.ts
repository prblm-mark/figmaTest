import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-617',
  {
    props: {
      type: figma.enum('Type', {
        Desktop: '',
        Mobile: 'mobile',
        Minimised: 'minimised',
      }),
      state: figma.enum('State', {
        Default: '',
        Active: 'msg-input--active',
        'Data Tooltip': 'tooltip-data',
        'Recent Content Tooltip Tooltip': 'tooltip-filter',
        'Duration Filter': 'filter-open',
      }),
    },
    example: ({ type, state }) => html`
      <div class="msg-input ${state}">
        <div class="msg-input__box">
          <textarea
            class="msg-input__textarea"
            rows="1"
            placeholder="Send a question"
          ></textarea>
          <div class="msg-input__actions">
            <div class="msg-input__filter-container">
              <button
                class="btn btn--tertiary btn--sm btn--icon msg-input__filter-btn"
                aria-label="Filter by recent content"
              >
                <i data-lucide="funnel" aria-hidden="true"></i>
              </button>
            </div>
            <button
              class="btn btn--primary btn--sm btn--icon msg-input__send-btn"
              aria-label="Send message"
              disabled
            >
              <i data-lucide="move-up" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="msg-input__disclaimer">
          <p class="msg-input__disclaimer-text">How we collect data</p>
        </div>
      </div>
    `,
  },
)
