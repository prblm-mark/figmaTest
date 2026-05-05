import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2580-11309',
  {
    props: {
      type: figma.enum('Type', {
        Default: '',
        'Home Icon': '',
        'Solid Background': 'breadcrumb--solid',
        Dropdown: '',
      }),
    },
    example: ({ type }) => html`
      <nav class="breadcrumb ${type}" aria-label="Breadcrumb">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item">
            <a href="#" class="breadcrumb__link">Affino</a>
          </li>
          <li class="breadcrumb__separator" aria-hidden="true">
            <i data-lucide="chevron-right"></i>
          </li>
          <li class="breadcrumb__item">
            <a href="#" class="breadcrumb__link">Solutions</a>
          </li>
          <li class="breadcrumb__separator" aria-hidden="true">
            <i data-lucide="chevron-right"></i>
          </li>
          <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">For Event Organisers</li>
        </ol>
      </nav>
    `,
  }
)
