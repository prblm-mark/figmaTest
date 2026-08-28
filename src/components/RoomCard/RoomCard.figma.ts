import figma, { html } from '@figma/code-connect/html'

// Room Card has NO Figma TEXT properties — get_design_context reports only
// className/device/state/tier/type — so nothing here uses figma.string. The room name,
// counts and seats-free label are content the caller supplies, shown as sample text.
//
// `Device` is deliberately NOT mapped: it is implemented as @media (max-width: 767px),
// so both Desktop and Mobile produce identical markup. `Tier` is single-valued
// (`Component`) and produces no CSS.
//
// `Type=Default` and `Type=Seats Assigned` both map to no modifier — they are the same
// CSS, differing only in the data driving --room-card-progress and the labels.
// `Type=Full` is structurally different (a badge replaces the seats-free text), so it
// gets its own connect on the Full variant below.

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3470-84951',
  {
    props: {
      type: figma.enum('Type', {
        Default: '',
        'Seats Assigned': '',
        Full: 'room-card--full',
      }),
      // Drop-in selection highlight. Toggled by the parent module — the card owns no JS.
      state: figma.enum('State', {
        Default: '',
        Selected: 'room-card--selected',
      }),
    },
    example: ({ type, state }) => html`
      <article class="room-card ${type} ${state}" style="--room-card-progress: 83.78%">
        <div class="room-card__header">
          <h3 class="room-card__name">
            <button type="button" class="room-card__select">Main Ballroom</button>
          </h3>
          <div class="room-card__actions">
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Edit Main Ballroom">
              <i data-lucide="pencil" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Delete Main Ballroom">
              <i data-lucide="trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="room-card__meta">
          <p class="room-card__counts">12 tables · 124/148<span class="room-card__seated"> seated</span></p>
          <p class="room-card__free">24 seats free</p>
        </div>
        <div class="room-card__progress" aria-hidden="true">
          <div class="room-card__progress-fill"></div>
        </div>
      </article>
    `,
  }
)

// Type=Full — the FULL badge replaces the "N seats free" text and the bar turns green.
//
// Connected on the SET with `variant: { Type: 'Full' }`, NOT on a variant node. This pointed at
// `3470-84952` until 2026-08-28, which Code Connect rejects ("node is not a top level component or
// component set"). Figma resolves the most specific matching connect, so this wins over the
// unrestricted set-level connect above for both Full variants.
//
// Worth recording why this one looked different from the other variant-URL mistakes: for a while
// BOTH of this file's node IDs were phantom — `3470-84951` returned "invalid node selection" and
// no Room Card set existed anywhere in the file, so the conclusion was that RoomCard was only ever
// an inline part of Header's Room-Selector-Bar slot. The designer restored the set on 2026-08-28,
// at which point `3470-84951` resolved as the real set and `3470-84952` resolved as its
// `Type=Full, State=Default, Device=Desktop` variant — the ordinary mistake it had always been.
// A dead node ID cannot be diagnosed as "wrong pointer" vs "no component"; it just fails.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3470-84951',
  {
    variant: { Type: 'Full' },
    props: {
      state: figma.enum('State', {
        Default: '',
        Selected: 'room-card--selected',
      }),
    },
    example: ({ state }) => html`
      <article class="room-card room-card--full ${state}" style="--room-card-progress: 100%">
        <div class="room-card__header">
          <h3 class="room-card__name">
            <button type="button" class="room-card__select">Main Ballroom</button>
          </h3>
          <div class="room-card__actions">
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Edit Main Ballroom">
              <i data-lucide="pencil" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Delete Main Ballroom">
              <i data-lucide="trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="room-card__meta">
          <p class="room-card__counts">12 tables · 148/148<span class="room-card__seated"> seated</span></p>
          <span class="full-badge"><i data-lucide="check" aria-hidden="true"></i>Full</span>
        </div>
        <div class="room-card__progress" aria-hidden="true">
          <div class="room-card__progress-fill"></div>
        </div>
      </article>
    `,
  }
)
