import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-7756',
  {
    props: {
      variant: figma.enum('Property 1', {
        Default: '',
        Expanded: 'version-history--expanded',
      }),
    },
    example: ({ variant }) => html`
      <div class="version-history ${variant}">
        <div class="version-history__heading">
          <div class="version-history__heading-title">
            <i class="version-history__icon-history" data-lucide="history" aria-hidden="true"></i>
            <span class="version-history__heading-title-text">Version History</span>
          </div>
          <button class="version-history__heading-subtitle" aria-expanded="false">
            <span class="version-history__heading-subtitle-text">12 previous system roles saved</span>
            <i class="version-history__chevron" data-lucide="chevron-right" aria-hidden="true"></i>
          </button>
        </div>
        <div class="version-history__rows">
          <!-- version-history-row components; add version-history__row-extra to rows 6–12 -->
        </div>
        <button class="version-history__footer">
          <span class="version-history__footer-label">Show older</span>
        </button>
      </div>
    `,
  }
)
