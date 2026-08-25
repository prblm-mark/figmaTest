import figma, { html } from '@figma/code-connect/html'

// Type drives the role modifier; Attendee maps to no modifier because it is the CSS default.
// Empty is structurally different (no name/meta, an Assign button), so it gets its own example
// via a separate connect on the Empty variant below.
// Tier is single-valued (`Component`) and produces no CSS, so it is not mapped.

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3474-89292',
  {
    props: {
      type: figma.enum('Type', {
        Attendee: '',
        VIP: 'attendee-card--vip',
        Speaker: 'attendee-card--speaker',
        Sponsor: 'attendee-card--sponsor',
        Host: 'attendee-card--host',
        Empty: 'attendee-card--empty',
      }),
      // Drop-target highlight. Toggled by the parent module — the card never drags.
      state: figma.enum('State', {
        Default: '',
        'Dragged Over': 'attendee-card--dragged-over',
      }),
      roleLabel: figma.enum('Type', {
        Attendee: 'Attendee',
        VIP: 'VIP',
        Speaker: 'Speaker',
        Sponsor: 'Sponsor',
        Host: 'Host',
        Empty: '',
      }),
      attendeeName: figma.string('Attendee Name'),
      companyName: figma.string('Company name'),
      seatNumber: figma.string('Seat number'),
      showActions: figma.boolean('Show Actions'),
      showSeatNumber: figma.boolean('Show Seat Number'),
    },
    example: ({ type, state, roleLabel, attendeeName, companyName, seatNumber, showActions, showSeatNumber }) => html`
      <article class="attendee-card ${type} ${state}">
        <span class="attendee-card__accent" aria-hidden="true">
          <span class="attendee-card__accent-bar"></span>
        </span>
        ${showSeatNumber ? html`<span class="attendee-card__seat">${seatNumber}</span>` : ''}
        <div class="attendee-card__body">
          <p class="attendee-card__name">${attendeeName}</p>
          <p class="attendee-card__meta">
            <span class="attendee-card__company">${companyName}</span>
            <span class="attendee-card__sep" aria-hidden="true">·</span>
            <span class="attendee-card__role">${roleLabel}</span>
          </p>
        </div>
        ${showActions ? html`
        <div class="attendee-card__actions">
          <button type="button" class="attendee-card__action" aria-label="Remove ${attendeeName}">
            <i data-lucide="trash" aria-hidden="true"></i>
          </button>
          <div class="attendee-card__reorder">
            <button type="button" class="attendee-card__action" aria-label="Move ${attendeeName} up">
              <i data-lucide="chevron-up" aria-hidden="true"></i>
            </button>
            <button type="button" class="attendee-card__action" aria-label="Move ${attendeeName} down">
              <i data-lucide="chevron-down" aria-hidden="true"></i>
            </button>
          </div>
        </div>` : ''}
      </article>
    `,
  }
)

// Empty seat — no name or meta block, and an Assign button instead of the action cluster.
// Connected on the Empty/Default variant directly so Figma surfaces the right markup.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3474-89291',
  {
    props: {
      seatNumber: figma.string('Seat number'),
    },
    example: ({ seatNumber }) => html`
      <article class="attendee-card attendee-card--empty">
        <span class="attendee-card__accent" aria-hidden="true">
          <span class="attendee-card__accent-bar"></span>
        </span>
        <span class="attendee-card__seat">${seatNumber}</span>
        <p class="attendee-card__empty-label">Empty seat</p>
        <button type="button" class="btn btn--secondary btn--sm">Assign</button>
      </article>
    `,
  }
)
