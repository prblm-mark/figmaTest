import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4053-6183',
  {
    props: {
      device: figma.enum('Device', {
        Desktop: '',
        Mobile: 'cc-sidebar--mobile',
      }),
    },
    example: ({ device }) => html`
      <div class="cc-sidebar-menu" aria-label="Affino Control Centre">
        <nav class="cc-sidebar ${device}" role="toolbar" aria-label="Workspace switcher">
          <!-- Sidebar brand + workspace buttons (see Sidebar pattern doc) -->
        </nav>
        <nav class="cc-menu" aria-label="Control menu">
          <!-- Menu brand + search + items (see Menu pattern doc) -->
        </nav>
      </div>
    `,
  }
)
