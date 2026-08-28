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
      /* Both booleans return MARKUP rather than being tested in the template — the parser
       * rejects `${flag ? a : b}`, so the branch moves into the prop. See docs/code-connect.md.
       *
       * Trade-off worth knowing: a prop cannot reference another prop, so the seat number and
       * the aria-label names inside these fragments are literals rather than the bound
       * `seatNumber` / `attendeeName`. The bindings survive everywhere they are used directly
       * in the template below. */
      seat: figma.boolean('Show Seat Number', {
        true: html`<span class="attendee-card__seat">1</span>`,
        false: html``,
      }),
      actions: figma.boolean('Show Actions', {
        true: html`<div class="attendee-card__actions">
          <button type="button" class="attendee-card__action" aria-label="Remove attendee">
            <i data-lucide="trash" aria-hidden="true"></i>
          </button>
          <div class="attendee-card__reorder">
            <button type="button" class="attendee-card__action" aria-label="Move attendee up">
              <i data-lucide="chevron-up" aria-hidden="true"></i>
            </button>
            <button type="button" class="attendee-card__action" aria-label="Move attendee down">
              <i data-lucide="chevron-down" aria-hidden="true"></i>
            </button>
          </div>
        </div>`,
        false: html``,
      }),
    },
    example: ({ type, state, roleLabel, attendeeName, companyName, seat, actions }) => html`
      <article class="attendee-card ${type} ${state}">
        <span class="attendee-card__accent" aria-hidden="true">
          <span class="attendee-card__accent-bar"></span>
        </span>
        ${seat}
        <div class="attendee-card__body">
          <p class="attendee-card__name">${attendeeName}</p>
          <p class="attendee-card__meta">
            <span class="attendee-card__company">${companyName}</span>
            <span class="attendee-card__sep" aria-hidden="true">·</span>
            <span class="attendee-card__role">${roleLabel}</span>
          </p>
        </div>
        ${actions}
      </article>
    `,
  }
)

// Empty seat — no name or meta block, and an Assign button instead of the action cluster.
//
// Connected on the SET with `variant: { Type: 'Empty' }`, NOT on a variant node. This previously
// pointed at `3474-89291` directly, which Code Connect rejects outright ("node is not a top level
// component or component set") and which kept the whole publish blocked, since publish is
// all-or-nothing. Figma resolves the most specific matching connect, so this wins over the
// unrestricted set-level connect above for every Empty variant.
//
// `State` is mapped here too, deliberately. `Type: 'Empty'` matches BOTH Empty/Default and
// Empty/Dragged Over, so without this the drag highlight would be missing from the snippet Figma
// shows for the Dragged Over variant. This became live only on 2026-08-28: until then the second
// Empty variant was mis-labelled as a duplicate `State=Default`, so there was nothing to
// distinguish. The designer corrected the state rather than deleting the variant.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3474-89292',
  {
    variant: { Type: 'Empty' },
    props: {
      seatNumber: figma.string('Seat number'),
      state: figma.enum('State', {
        Default: '',
        'Dragged Over': ' attendee-card--dragged-over',
      }),
    },
    example: ({ seatNumber, state }) => html`
      <article class="attendee-card attendee-card--empty${state}">
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
