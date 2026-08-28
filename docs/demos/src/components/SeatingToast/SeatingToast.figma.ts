import figma, { html } from '@figma/code-connect/html'

// `Tier` is single-valued (`Component`) and there is no Device axis, so neither is mapped.
//
// `Type` changes exactly two things in CSS — the border colour and the icon colour — plus the
// icon glyph, the ARIA role and the message, all of which differ per variant.
//
// `Show Cta` is a real boolean on the Figma component; the CTA is simply omitted from the markup
// when false, with no modifier, because the flex row closes up on its own.
//
// NOT the same component as Toast (src/components/Toast/). Figma names both just "Toast"; this is
// the Seating Planner's status-bordered pill with an Undo, not the notification card with a close
// button. See figma-notes.
//
// role: `status` on Success (announced politely), `alert` on Error (interrupts) — the convention
// the existing Toast component already set.
//
// STRUCTURE NOTE (2026-08-28): this was written as `example: (props) => cond ? html`…` : html`…``,
// which the parser rejects outright — "Expected only a tagged template literal as the body of the
// render function". So the two variants are now expressed as ENUM PROPS feeding one flat template:
// every per-variant difference (modifier, role, icon, message) is its own `figma.enum` off the
// same `Type` axis. One template, no branching. See docs/code-connect.md.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3474-90240',
  {
    props: {
      type: figma.enum('Type', {
        Success: 'seating-toast--success',
        Error: 'seating-toast--error',
      }),
      role: figma.enum('Type', {
        Success: 'status',
        Error: 'alert',
      }),
      icon: figma.enum('Type', {
        Success: 'badge-check',
        Error: 'triangle-alert',
      }),
      message: figma.enum('Type', {
        Success: html`<strong>Helen Verity</strong> successfully assigned to <strong>Seat 2</strong>`,
        Error: html`<strong>Table 12</strong> is full, please assign to another table`,
      }),
      cta: figma.boolean('Show Cta', {
        true: html`<button type="button" class="btn btn--secondary btn--xs seating-toast__cta">Undo</button>`,
        false: html``,
      }),
    },
    example: ({ type, role, icon, message, cta }) => html`
      <div class="seating-toast ${type}" role="${role}">
        <i class="seating-toast__icon" data-lucide="${icon}" aria-hidden="true"></i>
        <p class="seating-toast__message">${message}</p>
        ${cta}
      </div>
    `,
  }
)
