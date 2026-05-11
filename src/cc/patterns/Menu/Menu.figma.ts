import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4061-16921',
  {
    props: {
      type: figma.enum('Type', {
        Control: '',
        Analysis: '',
        Favourites: '',
        CRM: 'cc-menu--crm',
      }),
    },
    example: ({ type }) => html`
      <nav class="cc-menu ${type}" aria-label="Affino Control Centre">
        <div class="cc-menu__brand" role="img" aria-label="Affino"></div>
        <label class="cc-menu__search">
          <i data-lucide="search"></i>
          <input class="cc-menu__search-input" type="search" placeholder="Search…">
        </label>
        <ul class="cc-menu__items">
          <!-- MainMenuItem rows for Control/Analysis/Favourites;
               MD/Menu Button rows for CRM (see Menu.html demo for details). -->
        </ul>
      </nav>
    `,
  }
)
