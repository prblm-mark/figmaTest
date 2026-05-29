import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2542-5858',
  {
    props: {
      type: figma.enum('Type', {
        Info: 'alert--info',
        Success: 'alert--success',
        Danger: 'alert--danger',
        Warning: 'alert--warning',
        Neutral: 'alert--neutral',
      }),
      style: figma.enum('Style', {
        Default: '',                  // base — .alert is the Default style
        CTA: 'alert--cta',
        Floating: 'alert--floating',
        Fixed: 'alert--fixed',
      }),
    },
    example: ({ type, style }) => html`
      <div class="alert ${type} ${style}">
        <div class="alert__header">
          <span class="alert__icon"><i data-lucide="info" aria-hidden="true"></i></span>
          <div class="alert__text">
            <span class="alert__title">Info alert!</span>
            <span class="alert__message"> Your changes are saved automatically.</span>
          </div>
          <button type="button" class="alert__close" aria-label="Dismiss"><i data-lucide="x" aria-hidden="true"></i></button>
        </div>
      </div>
    `,
  }
)
