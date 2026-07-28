import figma, { html } from '@figma/code-connect/html'

/* EventPicker (CC) — Tier=Pattern
 * Figma set 3108:6662 "Seat Planner" — Device × Type.
 *
 * Type is a runtime state driven by event-picker.js (search text + Live checkbox),
 * not a class on the root, so the enum maps to the state each variant depicts.
 * Device=Mobile is a @media (max-width: 767px) block, so it has no class either.
 */
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3108-6662',
  {
    props: {
      type: figma.enum('Type', {
        'Event Picker': 'default',
        'Event Picker (search)': 'search',
        'Event Picker (no results)': 'no-results',
        'Event Picker (all statuses)': 'all-statuses',
      }),
    },
    example: ({ type }) => html`
      <!-- state: ${type} — set by event-picker.js from the search value + Live checkbox.
           Device=Mobile is handled by @media (max-width: 767px), not a modifier. -->
      <div class="modal modal--lg event-picker" role="dialog" aria-modal="true"
           aria-labelledby="ep-title" data-event-picker>

        <div class="modal__header">
          <h2 class="modal__title" id="ep-title">Select an event</h2>
          <button class="modal__close" type="button" aria-label="Close" data-ep-close>
            <i data-lucide="x" aria-hidden="true"></i>
          </button>
        </div>

        <div class="event-picker__filters">
          <div class="search">
            <span class="search__icon"><i data-lucide="search" aria-hidden="true"></i></span>
            <input class="search__input" type="search" placeholder="Search event name…"
                   aria-label="Search event name" data-ep-search>
          </div>
          <label class="checkbox">
            <input type="checkbox" class="checkbox__input" checked data-ep-live>
            <span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span>
            <span class="checkbox__label">
              <span class="checkbox__label-text">Live events only</span>
              <span class="checkbox__helper">Untick to include draft and archived events</span>
            </span>
          </label>
        </div>

        <div class="event-picker__list" data-ep-list>
          <p class="event-picker__group" data-ep-group="pinned">Last used</p>
          <!-- One .event-picker__event per event; --pinned marks the last-used one.
               In the "all statuses" state each row also carries a
               .badge.badge--pill.badge--sm.badge--success|warning|neutral. -->
          <button class="action-card action-card--chevron event-picker__event event-picker__event--pinned"
                  type="button" data-ep-event data-id="evt-cpa"
                  data-name="The Card &amp; Payments Awards 2026" data-status="live" data-group="pinned">
            <span class="event-picker__event-main">
              <span class="event-picker__event-head">
                <span class="event-picker__event-name">The Card &amp; Payments Awards 2026</span>
              </span>
              <span class="event-picker__meta">
                <span class="event-picker__meta-item"><i data-lucide="calendar" aria-hidden="true"></i>3 Feb 2026</span>
                <span class="event-picker__meta-item"><i data-lucide="map-pin" aria-hidden="true"></i>Grosvenor House, London</span>
                <span class="event-picker__meta-item"><i data-lucide="users" aria-hidden="true"></i>386 attendees</span>
              </span>
            </span>
            <span class="event-picker__stats">
              <span class="event-picker__plans"><i data-lucide="layout-grid" aria-hidden="true"></i>2 plans</span>
              <span class="event-picker__seated">
                <span class="event-picker__seated-track"><span class="event-picker__seated-fill" style="--event-picker-seated: 79%"></span></span>
                <span class="event-picker__seated-label">286/360 seated</span>
              </span>
            </span>
            <i class="action-card__chevron" data-lucide="chevron-right" aria-hidden="true"></i>
          </button>
          <p class="event-picker__group" data-ep-group="latest">Latest events</p>
        </div>

        <div class="event-picker__empty" data-ep-empty hidden>
          <span class="event-picker__empty-icon"><i data-lucide="search-x" aria-hidden="true"></i></span>
          <p class="event-picker__empty-title">No events match “<span data-ep-empty-query></span>”</p>
          <p class="event-picker__empty-desc">Try a different search, or untick
            <strong>Live events only</strong> to include draft and archived events.</p>
          <button class="btn btn--secondary" type="button" data-ep-clear>Clear search</button>
        </div>

        <div class="modal__footer event-picker__footer">
          <span class="event-picker__count" data-ep-count aria-live="polite">6 events · live only</span>
          <button class="btn btn--secondary" type="button" data-ep-close>Cancel</button>
        </div>

      </div>
    `,
  }
)
