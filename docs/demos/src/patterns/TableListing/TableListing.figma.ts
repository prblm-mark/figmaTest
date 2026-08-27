import figma, { html } from '@figma/code-connect/html'

// No props are mapped. `Tier` is single-valued (`Pattern`) and `Device` is implemented as
// @media (max-width: 767px), so both variants produce identical markup — the toolbar flips
// to a column and the grid drops to one column entirely in CSS.
//
// The grid is repeat(auto-fill, minmax(var(--ai-size-4), 1fr)) rather than Figma's literal
// four columns: it renders 4 columns of 281px at Figma's 1148px grid width (exactly the
// cards Figma draws) and 1 at mobile, without overflowing in between. See figma-notes.
//
// Two cards are shown here; a real listing has as many as the plan has tables.

const TOOLBAR = html`
    <div class="table-listing__toolbar">
      <div class="table-listing__toolbar-main">
        <h2 class="table-listing__title">Tables</h2>
        <div class="table-listing__filter">
          <!-- Toggle at the xxs size added for this pattern. -->
          <button type="button" class="toggle toggle--xxs" role="switch" aria-checked="false"
                  id="free-seats" aria-labelledby="free-seats-label">
            <span class="toggle__track"><span class="toggle__knob"></span></span>
          </button>
          <label class="table-listing__filter-label" id="free-seats-label" for="free-seats">Only free seats</label>
        </div>
      </div>
      <span class="table-listing__divider" aria-hidden="true"></span>
      <div class="input input--sm table-listing__search">
        <div class="input__wrap">
          <i data-lucide="search" class="input__icon" aria-hidden="true"></i>
          <input id="find-table" type="search" class="input__control"
                 placeholder="Find a table" aria-label="Find a table">
        </div>
      </div>
    </div>`

// TableCard with its sponsor row and tier pill omitted — both are `hidden` on the
// instances in Figma.
const card = (n: string, selected: boolean) => html`
      <article class="table-card ${selected ? 'table-card--selected' : ''}">
        <div class="table-card__header">
          <div class="table-card__titles">
            <h3 class="table-card__name">
              <button type="button" class="table-card__select">Table ${n}</button>
            </h3>
          </div>
        </div>
        <hr class="table-card__rule">
        <div class="table-card__viz">
          <div class="table-card__bar" aria-hidden="true">
            <span class="table-card__seg" style="--seg: 10"></span>
          </div>
          <div class="table-card__legend">
            <span class="table-card__legend-item"><span class="table-card__swatch"></span>Empty (10)</span>
          </div>
        </div>
        <hr class="table-card__rule">
        <div class="table-card__footer">
          <div class="table-card__count-group">
            <p class="table-card__count">0 / 10 seated</p>
          </div>
          <div class="table-card__actions">
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Edit Table ${n}">
              <i data-lucide="pencil" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Delete Table ${n}">
              <i data-lucide="trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>`

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3488-196339',
  {
    example: () => html`
      <section class="table-listing" aria-label="Tables">
        ${TOOLBAR}
        <div class="table-listing__grid">
          ${card('1', true)}
          ${card('2', false)}
        </div>
      </section>
    `,
  }
)
