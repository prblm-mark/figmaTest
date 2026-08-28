import figma, { html } from '@figma/code-connect/html'

// Only `State`, `Type` and `Show Sponsor` are mapped, and that is deliberate.
//
// The variants expose INCONSISTENT property sets (see figma-notes): `Table Name` exists on
// the Selected and Mobile variants but not on Default/Desktop, and `Show Table Type` exists
// only on Selected. Binding a property that just some variants carry is exactly how the
// TableType Code Connect went wrong in wave 1, so the table name and the tier pill are
// written as literal example content instead of bound props. Add the bindings once Figma
// defines both properties across the whole set.
//
// Header structure (2026-08-25): the tier pill sits INSIDE .table-card__titles beside the
// name, and .table-card__sponsor is a full-width sibling below that row.
//
// `Device` is not mapped: it is implemented as @media (max-width: 767px), so both Desktop
// and Mobile produce identical markup. `Tier` is single-valued and produces no CSS.
//
// `Type` maps to no class at all — Empty / Populated / Full differ only in the markup the
// caller supplies (segment count, legend rows, whether FullBadge is present), so each gets
// its own connect below rather than a modifier.

// The action cluster used to be a shared `ACTIONS` const interpolated into each example. The
// parser rejects a module-level identifier as a placeholder — every `${}` must be a destructured
// prop or a `figma.*()` call — so it is written out in each template instead. Duplicated on
// purpose: a Dev Mode snippet is read on its own, and the alternative was three broken mappings.
// See docs/code-connect.md.

// ── Populated: the representative case, connected at set level ───────────────────────
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3470-85483',
  {
    props: {
      // Drop-in selection highlight. Toggled by the parent module — the card owns no JS.
      state: figma.enum('State', {
        Default: '',
        Selected: 'table-card--selected',
      }),
      sponsor: figma.boolean('Show Sponsor', {
        true: html`<p class="table-card__sponsor">
            <i data-lucide="handshake" aria-hidden="true"></i>
            <span class="table-card__sponsor-name">Mastercard</span>
          </p>`,
        false: html``,
      }),
    },
    example: ({ state, sponsor }) => html`
      <article class="table-card ${state}">
        <div class="table-card__header">
          <div class="table-card__titles">
            <h3 class="table-card__name">
              <button type="button" class="table-card__select">Table 21</button>
            </h3>
            <span class="table-type table-type--vip">VIP</span>
          </div>
          ${sponsor}
        </div>
        <hr class="table-card__rule">
        <div class="table-card__viz">
          <!-- --seg carries each role's seat count; flex-grow divides the track by it. -->
          <div class="table-card__bar" aria-hidden="true">
            <span class="table-card__seg table-card__seg--attendee" style="--seg: 2"></span>
            <span class="table-card__seg table-card__seg--vip" style="--seg: 1"></span>
            <span class="table-card__seg table-card__seg--speaker" style="--seg: 1"></span>
            <span class="table-card__seg table-card__seg--sponsor" style="--seg: 2"></span>
            <span class="table-card__seg" style="--seg: 4"></span>
          </div>
          <div class="table-card__legend">
            <span class="table-card__legend-item table-card__legend-item--attendee"><span class="table-card__swatch"></span>Attendee (2)</span>
            <span class="table-card__legend-item table-card__legend-item--vip"><span class="table-card__swatch"></span>VIP (1)</span>
            <span class="table-card__legend-item table-card__legend-item--speaker"><span class="table-card__swatch"></span>Speaker (1)</span>
            <span class="table-card__legend-item table-card__legend-item--sponsor"><span class="table-card__swatch"></span>Sponsor (2)</span>
            <span class="table-card__legend-item"><span class="table-card__swatch"></span>Empty (4)</span>
          </div>
        </div>
        <hr class="table-card__rule">
        <div class="table-card__footer">
          <div class="table-card__count-group">
            <p class="table-card__count">6 / 10 seated</p>
          </div>
          <div class="table-card__actions">
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Edit Table 21">
              <i data-lucide="pencil" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Delete Table 21">
              <i data-lucide="trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>
    `,
  }
)

// ── Type=Empty: a single empty segment and one legend row ────────────────────────────
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3470-85482',
  {
    props: {
      state: figma.enum('State', { Default: '', Selected: 'table-card--selected' }),
    },
    example: ({ state }) => html`
      <article class="table-card ${state}">
        <div class="table-card__header">
          <div class="table-card__titles">
            <h3 class="table-card__name">
              <button type="button" class="table-card__select">Table 21</button>
            </h3>
            <span class="table-type table-type--vip">VIP</span>
          </div>
          <p class="table-card__sponsor">
            <i data-lucide="handshake" aria-hidden="true"></i>
            <span class="table-card__sponsor-name">Mastercard</span>
          </p>
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
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Edit Table 21">
              <i data-lucide="pencil" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Delete Table 21">
              <i data-lucide="trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>
    `,
  }
)

// ── Type=Full: FullBadge beside the count, and no empty segment ──────────────────────
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3472-85601',
  {
    props: {
      state: figma.enum('State', { Default: '', Selected: 'table-card--selected' }),
    },
    example: ({ state }) => html`
      <article class="table-card ${state}">
        <div class="table-card__header">
          <div class="table-card__titles">
            <h3 class="table-card__name">
              <button type="button" class="table-card__select">Table 21</button>
            </h3>
            <span class="table-type table-type--vip">VIP</span>
          </div>
          <p class="table-card__sponsor">
            <i data-lucide="handshake" aria-hidden="true"></i>
            <span class="table-card__sponsor-name">Mastercard</span>
          </p>
        </div>
        <hr class="table-card__rule">
        <div class="table-card__viz">
          <div class="table-card__bar" aria-hidden="true">
            <span class="table-card__seg table-card__seg--attendee" style="--seg: 4"></span>
            <span class="table-card__seg table-card__seg--vip" style="--seg: 2"></span>
            <span class="table-card__seg table-card__seg--speaker" style="--seg: 2"></span>
            <span class="table-card__seg table-card__seg--sponsor" style="--seg: 2"></span>
          </div>
          <div class="table-card__legend">
            <span class="table-card__legend-item table-card__legend-item--attendee"><span class="table-card__swatch"></span>Attendee (4)</span>
            <span class="table-card__legend-item table-card__legend-item--vip"><span class="table-card__swatch"></span>VIP (2)</span>
            <span class="table-card__legend-item table-card__legend-item--speaker"><span class="table-card__swatch"></span>Speaker (2)</span>
            <span class="table-card__legend-item table-card__legend-item--sponsor"><span class="table-card__swatch"></span>Sponsor (2)</span>
          </div>
        </div>
        <hr class="table-card__rule">
        <div class="table-card__footer">
          <div class="table-card__count-group">
            <p class="table-card__count">10 / 10 seated</p>
            <span class="full-badge"><i data-lucide="check" aria-hidden="true"></i>Full</span>
          </div>
          <div class="table-card__actions">
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Edit Table 21">
              <i data-lucide="pencil" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn--secondary btn--icon btn--2xs" aria-label="Delete Table 21">
              <i data-lucide="trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>
    `,
  }
)
