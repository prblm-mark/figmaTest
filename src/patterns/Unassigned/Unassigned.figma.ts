import figma, { html } from '@figma/code-connect/html'

// `Type` produces no CSS: Default is the empty state and `Unassiged` [sic] is the populated
// list, so the difference is which child of __body the caller renders. Mapping it to an enum
// of empty strings would be noise, so each Type gets its own connect below instead.
//
// Note the set has NO Tier and NO Device property, unlike the rest of the module.
//
// The rows are AttendeeCard with BOTH booleans off — no seat number, no actions — and the
// search field is Input (label-less, input--sm). Both are their own components with their own
// Code Connect; the markup is inlined here so the snippet is copy-pasteable.

const SEARCH = html`
      <div class="input input--sm">
        <div class="input__wrap">
          <i data-lucide="search" class="input__icon" aria-hidden="true"></i>
          <input id="unassigned-search" type="search" class="input__control"
                 placeholder="Search unassigned" aria-label="Search unassigned attendees">
        </div>
      </div>`

const header = (count: string) => html`
    <header class="unassigned__header">
      <div class="unassigned__header-row">
        <h3 class="unassigned__title">Unassigned</h3>
        <span class="unassigned__count">${count}</span>
      </div>
      <p class="unassigned__hint">Drag an attendee onto a seat or table to assign</p>
    </header>`

// ── Type=Unassiged: the populated list, connected at set level ───────────────────────
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3478-111942',
  {
    example: () => html`
      <section class="unassigned" aria-label="Unassigned attendees">
        ${header('6')}
        <div class="unassigned__body">
          ${SEARCH}
          <div class="unassigned__list">
            <!-- AttendeeCard with Show Seat Number and Show Actions both off. -->
            <article class="attendee-card attendee-card--vip">
              <span class="attendee-card__accent" aria-hidden="true"><span class="attendee-card__accent-bar"></span></span>
              <div class="attendee-card__body">
                <p class="attendee-card__name">Ethan Patel</p>
                <p class="attendee-card__meta">
                  <span class="attendee-card__company">Nexus Innovations</span>
                  <span class="attendee-card__sep" aria-hidden="true">·</span>
                  <span class="attendee-card__role">VIP</span>
                </p>
              </div>
            </article>
            <article class="attendee-card attendee-card--speaker">
              <span class="attendee-card__accent" aria-hidden="true"><span class="attendee-card__accent-bar"></span></span>
              <div class="attendee-card__body">
                <p class="attendee-card__name">Nina Ivanova</p>
                <p class="attendee-card__meta">
                  <span class="attendee-card__company">Stellar Dynamics</span>
                  <span class="attendee-card__sep" aria-hidden="true">·</span>
                  <span class="attendee-card__role">Speaker</span>
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
    `,
  }
)

// ── Type=Default: the empty state ────────────────────────────────────────────────────
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3478-111940',
  {
    example: () => html`
      <section class="unassigned" aria-label="Unassigned attendees">
        ${header('0')}
        <div class="unassigned__body">
          ${SEARCH}
          <div class="unassigned__empty">
            <i data-lucide="circle-check" aria-hidden="true"></i>
            <p class="unassigned__empty-title">Everyone is seated</p>
            <p class="unassigned__empty-text">Nobody is waiting for a seat. Unseat someone, or add a
            guest from a seat&rsquo;s Assign action.</p>
          </div>
        </div>
      </section>
    `,
  }
)
