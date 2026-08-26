import figma, { html } from '@figma/code-connect/html'

// `Tier` is single-valued (`Pattern`) and `Device` is implemented as
// @media (max-width: 767px), so neither is mapped.
//
// `Type` IS mapped, because it is the one axis that changes markup rather than CSS:
// `No Plans` is the event bar on its own, `Has Plans` adds the room selector and the
// toolbar. The bar itself is byte-identical between them.
//
// Figma names this component "Header"; it is filed as SeatingHeader because
// src/patterns/Header is a different, unrelated component (the AI-Chat header).

const BAR = html`
    <div class="seating-header__bar">
      <div class="seating-header__details">
        <div class="seating-header__title-row">
          <h2 class="seating-header__title">The Card &amp; Payments Awards 2026</h2>
          <button type="button" class="btn btn--secondary btn--icon btn--xs" aria-label="Switch event">
            <i data-lucide="arrow-left-right" aria-hidden="true"></i>
          </button>
        </div>
        <ul class="seating-header__meta">
          <li class="seating-header__meta-item">
            <i data-lucide="calendar" aria-hidden="true"></i>3 Feb 2026
          </li>
          <li class="seating-header__meta-item">
            <i data-lucide="users" aria-hidden="true"></i>386 attendees
          </li>
          <li class="seating-header__meta-item">
            <i data-lucide="map-pin" aria-hidden="true"></i>Grosvenor House, London
          </li>
        </ul>
      </div>
      <!-- Base-size Buttons on desktop; the CSS steps both to `sm` and leads with the
           primary one at mobile, matching Figma's Device=Mobile variant. -->
      <div class="seating-header__actions">
        <button type="button" class="btn btn--secondary">
          <i data-lucide="copy" aria-hidden="true"></i>Copy Plans
        </button>
        <button type="button" class="btn btn--primary">
          <i data-lucide="plus" aria-hidden="true"></i>New Plan
        </button>
      </div>
    </div>`

// One RoomCard per plan, in Figma's Room-Selector-Bar slot. Cards are pinned to
// --ai-size-5 (280px) on desktop and grow from RoomCard's own 240px floor on mobile; the
// bar scrolls horizontally when there are more plans than fit.
const roomCard = (name: string, counts: string, free: string, selected: boolean) => html`
      <article class="room-card ${selected ? 'room-card--selected' : ''}">
        <div class="room-card__header">
          <h3 class="room-card__name">
            <button type="button" class="room-card__select">${name}</button>
          </h3>
          <div class="room-card__actions">
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Edit ${name}">
              <i data-lucide="pencil" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Delete ${name}">
              <i data-lucide="trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="room-card__meta">
          <p class="room-card__counts">${counts}<span class="room-card__seated"> seated</span></p>
          <p class="room-card__free">${free}</p>
        </div>
        <div class="room-card__progress" aria-hidden="true">
          <div class="room-card__progress-fill"></div>
        </div>
      </article>`

// The toolbar. The toggle is Toggle at `xs`, label-less, and needs Toggle.js to flip.
// `Room Layout` is hidden, `Add Table` shortens to `Add` and `Export` becomes icon-only at
// mobile — all three are Figma Device deltas handled in CSS, not by a second markup.
const TOOLBAR = html`
    <div class="seating-header__toolbar">
      <div class="seating-header__toolbar-actions">
        <div class="seating-header__room">
          <p class="seating-header__room-name">Main Ballroom</p>
          <p class="seating-header__room-count">(72 Unassigned)</p>
        </div>
        <div class="seating-header__toggle-group">
          <button type="button" class="toggle toggle--xs" role="switch" aria-checked="false"
                  id="show-unassigned" aria-labelledby="show-unassigned-label">
            <span class="toggle__track"><span class="toggle__knob"></span></span>
          </button>
          <label class="seating-header__toggle-label" id="show-unassigned-label"
                 for="show-unassigned">Show unassigned</label>
        </div>
        <span class="seating-header__divider" aria-hidden="true"></span>
        <div class="seating-header__buttons">
          <button type="button" class="btn btn--secondary btn--sm seating-header__btn--layout">
            <i data-lucide="grid-3x3" aria-hidden="true"></i>Room Layout
          </button>
          <button type="button" class="btn btn--secondary btn--sm">
            <i data-lucide="plus" aria-hidden="true"></i><span class="seating-header__btn-label">Add<span class="seating-header__btn-shrink"> Table</span></span>
          </button>
          <button type="button" class="btn btn--secondary btn--sm seating-header__btn--export">
            <i data-lucide="download" aria-hidden="true"></i><span class="seating-header__btn-shrink">Export</span><i
              data-lucide="chevron-down" class="seating-header__btn-chevron" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <!-- Figma draws a bare 20px icon; built as a real <button> for keyboard and touch. -->
      <button type="button" class="seating-header__more" aria-label="More seating actions">
        <i data-lucide="ellipsis-vertical" aria-hidden="true"></i>
      </button>
    </div>`

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3474-90519',
  {
    props: {
      type: figma.enum('Type', {
        'Has Plans': 'has-plans',
        'No Plans': 'no-plans',
      }),
    },
    example: ({ type }) => html`
      <section class="seating-header" aria-label="Seating plan header">
        ${BAR}
        ${type === 'has-plans'
          ? html`
        <div class="seating-header__rooms">
          ${roomCard('Main Ballroom', '12 tables · 0/148', '148 seats free', true)}
          ${roomCard('Overflow Annex', '8 tables · 42/102', '60 seats free', false)}
        </div>
        ${TOOLBAR}`
          : ''}
      </section>
    `,
  }
)
