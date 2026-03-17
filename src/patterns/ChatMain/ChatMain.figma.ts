import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2061-5762',
  {
    example: () => html`
      <div class="chat-main">
        <div class="chat-main__scroll">
          <div class="chat-main__container">
            <div class="msg-bubble">
              <div class="msg-bubble__question">
                <p class="msg-bubble__text">User question here</p>
              </div>
            </div>
            <div class="chat-main__response">
              <p>AI response content...</p>
            </div>
          </div>
        </div>
        <div class="chat-main__footer">
          <div class="chat-main__fade"></div>
          <div class="chat-main__input">
            <!-- MessageInput component -->
          </div>
        </div>
      </div>
    `,
  },
)
