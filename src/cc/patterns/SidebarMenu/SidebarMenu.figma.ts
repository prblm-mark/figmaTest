import figma, { html } from '@figma/code-connect/html'

// Repointed 2026-08-28: was `node-id=4053-6183`, which Code Connect rejects — it is a variant
// or inner frame, not a top-level component. Correct target is the SidebarMenu set (Tier, Device), confirmed via
// `list_file_components_for_code_connect` on the CC Hybrid file rather than read off the canvas.
figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4066-18917',
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
