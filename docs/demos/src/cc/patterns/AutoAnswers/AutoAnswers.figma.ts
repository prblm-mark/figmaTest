import figma, { html } from '@figma/code-connect/html'

// AutoAnswers — AI auto-answer card for support forums (Tier: pattern).
// Component set: Lus07xi8pPXLN87sQIyrEt, node 2802:6352.
// The Type axis maps to a state modifier on the root (the query container); the
// inner __card holds the visuals. Device is handled responsively via container
// query (@container cc-auto-answer max-width:767px), not as a variant class.
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2802-6352',
  {
    props: {
      type: figma.enum('Type', {
        ProcessingAnswer: 'cc-auto-answer--processing',
        SuggestedAnswer: 'cc-auto-answer--suggested',
        NoAnswer: 'cc-auto-answer--no-answer',
        CompleteAnswer: 'cc-auto-answer--complete',
        PartialAnswer: 'cc-auto-answer--partial',
        InadequateAnswer: 'cc-auto-answer--inadequate',
      }),
    },
    // Canonical example shows the SuggestedAnswer shell. Other states swap the
    // title text, drop the pill/actions, and add a __status footer or the
    // __processing row — see AutoAnswers.html for every state's markup.
    example: ({ type }) => html`
      <div class="cc-auto-answer ${type}">
        <div class="cc-auto-answer__card">
        <div class="cc-auto-answer__header">
          <div class="cc-auto-answer__heading">
            <span class="cc-auto-answer__icon"><i data-lucide="sparkles"></i></span>
            <p class="cc-auto-answer__title">AI Suggested Answer</p>
          </div>
          <span class="cc-auto-answer__pill">Awaiting Feedback</span>
        </div>
        <div class="cc-auto-answer__body">
          <p class="cc-auto-answer__text">Based on similar cases, here's a recommended approach:</p>
          <ol class="cc-auto-answer__list">
            <li>Add a "Stop Retry" button in the customer's account dashboard under subscription settings</li>
            <li>Configure a webhook in Stripe to automatically update the subscription status when payment fails</li>
            <li>Send an automated email to customers with a direct link to manage their retry settings</li>
          </ol>
          <code class="cc-auto-answer__code">payment_behavior: 'allow_incomplete'</code>
          <p class="cc-auto-answer__text">You can implement this using Stripe</p>
        </div>
        <div class="cc-auto-answer__actions">
          <button type="button" class="cc-auto-answer__action cc-auto-answer__action--positive">
            <i data-lucide="circle-check"></i>Mark as Answer
          </button>
          <button type="button" class="cc-auto-answer__action cc-auto-answer__action--caution">
            <i data-lucide="thumbs-up"></i>Helpful, still need assistance
          </button>
          <button type="button" class="cc-auto-answer__action cc-auto-answer__action--negative">
            <i data-lucide="thumbs-down"></i>Not Helpful
          </button>
        </div>
        </div>
      </div>
    `,
  }
)
