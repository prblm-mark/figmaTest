import figma, { html } from '@figma/code-connect/html'

// NotificationBadge is not a Figma component set — it's extracted from the
// repeating `Notification` layer used in CCHeader. We anchor Code Connect to
// the desktop default Notification node so the snippet appears when designers
// pick a Notification instance.
figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4095-3413',
  {
    example: () => html`
      <span class="notification-badge">
        <button class="btn btn--tertiary btn--icon" type="button" aria-label="Notifications, 2 unread">
          <i data-lucide="bell" aria-hidden="true"></i>
        </button>
        <span class="notification-badge__count" aria-hidden="true">2</span>
      </span>
    `,
  }
)

// Small (32px) variant — anchored to a mobile Notification instance.
figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4113-3433',
  {
    example: () => html`
      <span class="notification-badge">
        <button class="btn btn--tertiary btn--icon btn--sm" type="button" aria-label="Notifications, 2 unread">
          <i data-lucide="bell" aria-hidden="true"></i>
        </button>
        <span class="notification-badge__count" aria-hidden="true">2</span>
      </span>
    `,
  }
)
