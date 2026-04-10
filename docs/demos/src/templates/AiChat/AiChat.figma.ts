import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-9299',
  {
    props: {
      type: figma.enum('Type', {
        Default: '',
        Desktop: '',
      }),
      sidebarOpen: figma.enum('Sidebar Open', {
        True: 'ai-chat--sidebar-open',
        False: '',
      }),
    },
    example: ({ type, sidebarOpen }) => html`
      <div class="ai-chat ${sidebarOpen}">
        <div class="ai-chat__overlay"></div>
        <aside class="ai-chat__sidebar">
          <!-- ChatSidebar -->
        </aside>
        <div class="ai-chat__main">
          <!-- ChatHeader with data-sidebar-toggle on panel-left button -->
          <!-- ChatMain -->
        </div>
      </div>
    `,
  },
)
