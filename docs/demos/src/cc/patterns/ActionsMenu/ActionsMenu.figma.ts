import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4146-6684',
  {
    example: () => html`
      <div class="actions-menu">
        <button class="actions-menu__btn" type="button" aria-label="AI suggestions">
          <i data-lucide="sparkles" aria-hidden="true"></i>
        </button>
        <button class="actions-menu__btn" type="button" aria-label="Info">
          <i data-lucide="info" aria-hidden="true"></i>
        </button>
        <button class="actions-menu__btn" type="button" aria-label="Favourite">
          <i data-lucide="star" aria-hidden="true"></i>
        </button>
        <button class="actions-menu__btn" type="button" aria-label="Text size">
          <i data-lucide="a-large-small" aria-hidden="true"></i>
        </button>
        <button class="actions-menu__btn" type="button" aria-label="Minimise">
          <i data-lucide="minimize-2" aria-hidden="true"></i>
        </button>
        <button class="actions-menu__btn" type="button" aria-label="Print">
          <i data-lucide="printer" aria-hidden="true"></i>
        </button>
      </div>
    `,
  }
)
