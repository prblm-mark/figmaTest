import figma, { html } from '@figma/code-connect/html'

// `Tier` is single-valued (`Component`) and there is no Device axis, so neither is mapped.
//
// `Type` maps to the two modifiers. It changes exactly two things — the border colour and
// the icon colour — plus the icon glyph and the ARIA role, all of which differ per variant,
// so each Type gets its own example rather than sharing one.
//
// `Show Cta` is a real boolean on the Figma component; the CTA is simply omitted from the
// markup when false, with no modifier, because the flex row closes up on its own.
//
// NOT the same component as Toast (src/components/Toast/). Figma names both just "Toast";
// this is the Seating Planner's status-bordered pill with an Undo, not the notification
// card with a close button. See figma-notes.
//
// role: `status` on Success (announced politely), `alert` on Error (interrupts) — the
// convention the existing Toast component already set.

const cta = html`
      <button type="button" class="btn btn--secondary btn--xs seating-toast__cta">Undo</button>`

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3474-90240',
  {
    props: {
      type: figma.enum('Type', {
        Success: 'success',
        Error: 'error',
      }),
      showCta: figma.boolean('Show Cta'),
    },
    example: ({ type, showCta }) =>
      type === 'error'
        ? html`
      <div class="seating-toast seating-toast--error" role="alert">
        <i class="seating-toast__icon" data-lucide="triangle-alert" aria-hidden="true"></i>
        <p class="seating-toast__message"><strong>Table 12</strong> is full, please assign to another table</p>
        ${showCta ? cta : ''}
      </div>`
        : html`
      <div class="seating-toast seating-toast--success" role="status">
        <i class="seating-toast__icon" data-lucide="badge-check" aria-hidden="true"></i>
        <p class="seating-toast__message"><strong>Helen Verity</strong> successfully assigned to <strong>Seat 2</strong></p>
        ${showCta ? cta : ''}
      </div>`,
  }
)
