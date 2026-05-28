import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4164-8667',
  {
    example: () => html`
      <div class="cc-actions-info-panel">

        <section class="cc-actions-info-panel__section">
          <h3 class="cc-actions-info-panel__heading">Description</h3>
          <p class="cc-actions-info-panel__body">Assign one or more Creative to Ad Campaign, control Targeting and select Advertiser</p>
        </section>

        <section class="cc-actions-info-panel__section">
          <h3 class="cc-actions-info-panel__heading">Related</h3>
          <div class="cc-actions-info-panel__pills">
            <button type="button" class="btn btn--tertiary btn--sm">Advertisers</button>
            <button type="button" class="btn btn--tertiary btn--sm">Ad Campaign Analysis</button>
          </div>
        </section>

        <section class="cc-actions-info-panel__section">
          <h3 class="cc-actions-info-panel__heading">System Security Right</h3>
          <div class="cc-actions-info-panel__pills">
            <button type="button" class="btn btn--tertiary btn--sm">Campaign Management</button>
            <button type="button" class="btn btn--tertiary btn--sm">Campaign Statistics</button>
          </div>
        </section>

      </div>
    `,
  }
)
