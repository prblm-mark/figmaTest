import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4105-4238',
  {
    example: () => html`
      <!-- Add .cc-header-group--icon-nav for the Type=IconNavigation variant; the
           User Menu "Icon Navigation" toggle adds it at runtime (HeaderGroup.js). -->
      <div class="cc-header-group">
        <!-- See CCTopNavigation.figma.ts for the topNav snippet (User Menu type
             holds the Icon Navigation + Hide Labels toggles) -->
        <header class="cc-top-navigation"></header>
        <!-- IconNavigation strip — see IconNavigation.figma.ts. Hidden until
             .cc-header-group--icon-nav is set; add .cc-icon-nav--no-labels for icons-only. -->
        <nav class="cc-icon-nav" aria-label="Module navigation"></nav>
        <!-- See CCHeader.figma.ts for the header snippet (Control type) -->
        <div class="cc-header-cq"><header class="cc-header cc-header--control"></header></div>
      </div>
    `,
  }
)
