import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4105-4238',
  {
    example: () => html`
      <div class="cc-header-group">
        <!-- See CCTopNavigation.figma.ts for the topNav snippet -->
        <header class="cc-top-navigation"></header>
        <!-- See CCHeader.figma.ts for the header snippet (Control type) -->
        <div class="cc-header-cq"><header class="cc-header cc-header--control"></header></div>
      </div>
    `,
  }
)
