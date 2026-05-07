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
      shape: figma.enum('Shape', {
        Round: '',
        Rounded: 'avatar--rounded',
      }),
      type: figma.enum('Type', {
        Default: '',
        Bordered: 'avatar--bordered',
        Placeholder: 'avatar--placeholder',
        Initials: 'avatar--initials',
      }),
      checked: figma.boolean('Checked', {
        true: 'avatar--checked',
        false: '',
      }),
      // Show Notification=True: add <span class="avatar__dot avatar__dot--{green|red|orange}" aria-hidden="true"> inside .avatar
      showNotification: figma.boolean('Show Notification'),
      notificationColor: figma.enum('Notification Color', {
        Green: 'avatar__dot--green',
        Red: 'avatar__dot--red',
        Orange: 'avatar__dot--orange',
      }),
    },
    example: ({ size, shape, type, checked }) => html`
      <div class="avatar ${size} ${shape} ${type} ${checked}">
        <img class="portrait" src="portrait.jpg" alt="User">
        <!-- For Show Notification=True, add: <span class="avatar__dot avatar__dot--green" aria-hidden="true"></span> -->
      </div>
    `,
  }
)
