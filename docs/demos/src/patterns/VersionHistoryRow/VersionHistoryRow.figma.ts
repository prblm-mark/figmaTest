import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-7693',
  {
    props: {
      // Hover is a CSS :hover state — no class needed.
      type: figma.enum('Type', {
        Default: '',
        Hover: '',
        Live: 'version-history-row--live',
        Selected: 'version-history-row--selected',
        'Selected & Live': 'version-history-row--selected version-history-row--live',
      }),
    },
    example: ({ type }) => html`
      <div class="version-history-row ${type}">
        <div class="avatar">
          <img class="portrait" src="portrait.jpg" alt="User">
          <!-- Selected rows: use <div class="avatar avatar--checked"><i data-lucide="check"></i></div> -->
        </div>
        <div class="version-history-row__content">
          <span class="version-history-row__name">User Name</span>
          <span class="version-history-row__date">2 hours ago</span>
        </div>
        <!-- Live / Selected & Live rows: add <span class="pill">Live</span> -->
      </div>
    `,
  }
)
