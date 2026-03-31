import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=68-5042',
  {
    props: {
      size: figma.enum('Size', {
        '1': '',
        '2': 'avatar--size-2',
        '3': 'avatar--size-3',
        '4': 'avatar--size-4',
        '5': 'avatar--size-5',
      }),
      checked: figma.boolean('Checked', {
        true: 'avatar--checked',
        false: '',
      }),
      // Show Notification=True: add <span class="avatar__dot" aria-hidden="true"> inside .avatar
      showNotification: figma.boolean('Show Notification'),
    },
    example: ({ size, checked }) => html`
      <div class="avatar ${size} ${checked}">
        <img class="portrait" src="portrait.jpg" alt="User">
        <!-- Add <span class="avatar__dot" aria-hidden="true"> for Show Notification=True -->
      </div>
    `,
  }
)
