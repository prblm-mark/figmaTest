import figma, { html } from '@figma/code-connect/html'

// TableDetail has NO mapped props, and that is deliberate.
//
// `Type` (Default / 2 Roles / All Roles / Full) produces no CSS whatsoever — the variants
// differ only in how many roles the legend lists and how many seats are filled, both of
// which are content the caller supplies. Mapping it to an enum of empty strings would be
// noise. Each Type instead gets its own connect below so Figma surfaces the right markup.
//
// `Device` is not mapped: it is a @media (max-width: 767px) rule, so both Desktop and
// Mobile produce identical markup — the header is hidden by CSS, not removed here.
// `Tier` is single-valued (`Pattern`).
//
// The seat rows are AttendeeCard and the tier pill is TableType; both are their own
// components with their own Code Connect. Only two seats are shown per example — a real
// table has as many rows as it has seats.

// The header is desktop-only — CSS hides it below 768px, so it stays in the markup.

// STRUCTURE NOTE (2026-08-28): the header and the two seat rows were shared module consts
// interpolated as `${HEADER}` / `${SEAT_FILLED}` / `${SEAT_EMPTY}`. The parser rejects a
// module-level identifier as a placeholder — every `${}` must be a destructured prop or a
// `figma.*()` call — and because this file declares no props at all it failed with an
// InternalError rather than a readable message. The fragments are written out inline instead.
// See docs/code-connect.md.

// ── Type=All Roles: the representative case, connected at set level ──────────────────
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3475-94010',
  {
    example: () => html`
      <section class="table-detail" aria-label="Table 21 seating detail">
            <header class="table-detail__header">
      <div class="table-detail__header-row">
        <div class="table-detail__titles">
          <h3 class="table-detail__name">Table 21</h3>
          <p class="table-detail__meta">
            <span class="table-detail__count">7 / 10 seated</span>
            <span class="table-detail__sep" aria-hidden="true">·</span>
            <span class="table-detail__sponsor">
              <i data-lucide="handshake" aria-hidden="true"></i>
              <span class="table-detail__sponsor-name">Monzo</span>
            </span>
          </p>
        </div>
        <span class="table-type table-type--gold">Gold</span>
      </div>
    </header>
        <div class="table-detail__list">
          <!-- Derived from the roles actually seated — never stored. -->
          <p class="table-detail__legend">
            <span class="table-detail__legend-item table-detail__legend-item--host"><span class="table-detail__swatch"></span>Host</span>
            <span class="table-detail__legend-item table-detail__legend-item--vip"><span class="table-detail__swatch"></span>VIP</span>
            <span class="table-detail__legend-item table-detail__legend-item--speaker"><span class="table-detail__swatch"></span>Speaker</span>
            <span class="table-detail__legend-item table-detail__legend-item--sponsor"><span class="table-detail__swatch"></span>Sponsor</span>
            <span class="table-detail__legend-item table-detail__legend-item--attendee"><span class="table-detail__swatch"></span>Attendee</span>
          </p>
          <div class="table-detail__seats">
                    <article class="attendee-card attendee-card--host">
          <span class="attendee-card__accent" aria-hidden="true"><span class="attendee-card__accent-bar"></span></span>
          <span class="attendee-card__seat">1</span>
          <div class="attendee-card__body">
            <p class="attendee-card__name">Sarah Jenkins</p>
            <p class="attendee-card__meta">
              <span class="attendee-card__company">Table Host</span>
              <span class="attendee-card__sep" aria-hidden="true">·</span>
              <span class="attendee-card__role">Host</span>
            </p>
          </div>
          <div class="attendee-card__actions">
            <button type="button" class="attendee-card__action" aria-label="Remove Sarah Jenkins">
              <i data-lucide="trash" aria-hidden="true"></i>
            </button>
            <div class="attendee-card__reorder">
              <button type="button" class="attendee-card__action" aria-label="Move Sarah Jenkins up">
                <i data-lucide="chevron-up" aria-hidden="true"></i>
              </button>
              <button type="button" class="attendee-card__action" aria-label="Move Sarah Jenkins down">
                <i data-lucide="chevron-down" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </article>
                    <article class="attendee-card attendee-card--empty">
          <span class="attendee-card__accent" aria-hidden="true"><span class="attendee-card__accent-bar"></span></span>
          <span class="attendee-card__seat">2</span>
          <p class="attendee-card__empty-label">Empty seat</p>
          <button type="button" class="btn btn--secondary btn--sm">Assign</button>
        </article>
          </div>
        </div>
      </section>
    `,
  }
)

// ── Type=Default: no legend at all, every seat empty ─────────────────────────────────
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3475-94010',
  {
    /* Connected on the component SET with a variant restriction, not on the variant node itself.
     * Code Connect rejects a variant URL outright ("node is not a top level component or
     * component set"), which is what kept this mapping unpublished. `variant` is the supported
     * way to surface different markup per variant. */
    variant: { Type: 'Default' },
    example: () => html`
      <section class="table-detail" aria-label="Table 21 seating detail">
            <header class="table-detail__header">
      <div class="table-detail__header-row">
        <div class="table-detail__titles">
          <h3 class="table-detail__name">Table 21</h3>
          <p class="table-detail__meta">
            <span class="table-detail__count">7 / 10 seated</span>
            <span class="table-detail__sep" aria-hidden="true">·</span>
            <span class="table-detail__sponsor">
              <i data-lucide="handshake" aria-hidden="true"></i>
              <span class="table-detail__sponsor-name">Monzo</span>
            </span>
          </p>
        </div>
        <span class="table-type table-type--gold">Gold</span>
      </div>
    </header>
        <div class="table-detail__list">
          <div class="table-detail__seats">
                    <article class="attendee-card attendee-card--empty">
          <span class="attendee-card__accent" aria-hidden="true"><span class="attendee-card__accent-bar"></span></span>
          <span class="attendee-card__seat">2</span>
          <p class="attendee-card__empty-label">Empty seat</p>
          <button type="button" class="btn btn--secondary btn--sm">Assign</button>
        </article>
          </div>
        </div>
      </section>
    `,
  }
)
