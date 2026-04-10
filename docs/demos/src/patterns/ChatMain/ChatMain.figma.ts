import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-3752',
  {
    props: {
      view: figma.enum('View', {
        Initial: 'chat-main--initial',
        'Processing Response': 'chat-main--processing',
        'Full response': 'chat-main--response',
      }),
    },
    example: ({ view }) => html`
      <div class="chat-main ${view}">
        <!-- Initial view -->
        <div class="chat-main__initial">
          <div class="chat-main__initial-inner">
            <div class="chat-main__intro">
              <h1 class="chat-main__title">What can I help with?</h1>
              <p class="chat-main__subtitle">Ask a question...</p>
            </div>
            <div class="chat-main__input-wrap">
              <!-- MessageInput component -->
            </div>
            <div class="chat-main__suggestions">
              <!-- SuggestedQuestion buttons -->
            </div>
          </div>
        </div>
        <!-- Scroll area (processing + response) -->
        <div class="chat-main__scroll">
          <div class="chat-main__container">
            <div class="msg-bubble"><!-- MessageBubble --></div>
            <div class="chat-main__processing">
              <!-- WorkingIntro + SourcesCarousel + Skeleton -->
            </div>
            <div class="chat-main__response">
              <p>AI response content...</p>
            </div>
          </div>
          <div class="chat-main__footer">
            <div class="chat-main__fade"></div>
            <div class="chat-main__input">
              <!-- MessageInput component -->
            </div>
          </div>
        </div>
      </div>
    `,
  },
)
