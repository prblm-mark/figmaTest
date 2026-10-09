# Chat Brand Colour System

How brand-derived colours work in the AI Chat UI. Required reading before building any
chat component that uses accent/brand colours.

---

## The Problem

The AI Chat has a **Style Settings** panel where clients can set a custom accent colour.
This accent colour drives the appearance of:

- Message bubble background and text
- Send button
- Submit/primary action buttons in chat modals
- Checked checkboxes in chat context
- Sources link pills

These elements **cannot** use the fixed `--ao-surface-brand` token because that doesn't
change when the client picks a different accent. They must derive from `--ao-chat-brand`.

---

## Key Rule

> **In AI Chat components, use `--ao-chat-brand` — never `--ao-surface-brand` or
> `--ao-btn-primary-bg` — for any accent-coloured element.**

Base Design System components (outside chat) still use `--ao-surface-brand`.

---

## How It Works

### 1. The accent colour token

`--ao-chat-brand` holds the current accent colour. It defaults to the system brand
colour but can be overridden per-client.

### 2. Luminance detection (JS)

`src/utils/brand-colors.js` exports `initBrandTheme(el)`:

```js
import { initBrandTheme } from '../../utils/brand-colors.js';
initBrandTheme(chatContainer);
```

This reads `--ao-chat-brand` from the element, calculates its luminance, and sets
`data-brand-theme="light"` or `data-brand-theme="dark"` on the element.

**Re-run** after theme toggles or accent colour changes.

### 3. CSS `color-mix()` overrides

`src/components/SourcesLink/SourcesLink.css` contains the `[data-brand-theme]` blocks
that redefine brand-derived variables using `color-mix()`. These override the static
token values from `tokens-chat.css`.

---

## Message Bubble Colours

The `--ao-chat-msg-bg` and `--ao-chat-msg-text` tokens are the most important
brand-derived values. **Do not use the static hex values from `tokens-chat.css`** —
those exist only for Figma designer reference.

### Formulas by luminance tier

#### Light mode

| Brand luminance | `data-brand-theme` | `--ao-chat-msg-bg` | `--ao-chat-msg-text` |
|---|---|---|---|
| Dark brand (e.g. navy) | `"dark"` | `color-mix(in srgb, var(--ao-chat-brand) 8%, var(--ao-surface-primary))` | `color-mix(in srgb, var(--ao-chat-brand) 50%, black)` |
| Light brand (e.g. yellow) | `"light"` | `color-mix(in srgb, var(--ao-chat-brand) 15%, var(--ao-surface-primary))` | `color-mix(in srgb, var(--ao-chat-brand) 35%, black)` |

#### Dark mode (`[data-theme="dark"]`)

| Brand luminance | Selector | `--ao-chat-msg-bg` | `--ao-chat-msg-text` |
|---|---|---|---|
| Dark brand | `[data-theme="dark"][data-brand-theme="dark"]` | `color-mix(in srgb, var(--ao-chat-brand) 50%, var(--ao-surface-primary))` | `var(--ao-text-primary)` |

### Why it works

- **Dark brands** (most common — blues, greens, reds): 8% tint gives a subtle pastel
  background; 50% mix with black gives a readable dark text.
- **Light brands** (yellows, light greens): stronger 15% tint so the bg is visible;
  35% mix with black keeps text dark enough for contrast.
- **Dark mode with dark brand**: 50% tint creates a richer bg against the dark surface;
  text falls back to `--ao-text-primary` (light text) for readability.

---

## Button & Checkbox Colours in Chat

For primary action buttons and checked checkboxes inside chat UI:

```css
/* Button — use --ao-chat-brand directly */
.my-chat-component .btn--primary {
  background-color: var(--ao-chat-brand);
  border-color: var(--ao-chat-brand);
}

.my-chat-component .btn--primary:hover {
  background-color: color-mix(in srgb, var(--ao-chat-brand) 85%, black);
}

/* Checkbox — override checked state */
.my-chat-component .checkbox__input:checked + .checkbox__indicator {
  background: var(--ao-chat-brand);
  border-color: var(--ao-chat-brand);
}
```

---

## Setup Checklist

When building a new chat page or template:

1. **Set `--ao-chat-brand`** on the chat container (or inherit from a parent)
2. **Call `initBrandTheme(el)`** on the container after DOM ready
3. **Re-call** after theme toggle or accent colour change
4. **Link `SourcesLink.css`** — it contains the `[data-brand-theme]` `color-mix()` blocks
   that redefine `--ao-chat-msg-bg` and `--ao-chat-msg-text`
5. **Use `--ao-chat-brand`** (not `--ao-surface-brand`) for any accent-coloured element

---

## File Reference

| File | Purpose |
|---|---|
| `src/utils/brand-colors.js` | `initBrandTheme(el)` — luminance detection, sets `data-brand-theme` |
| `src/components/SourcesLink/SourcesLink.css` | `[data-brand-theme]` blocks with `color-mix()` formulas |
| `css/tokens-chat.css` | Static fallback values — **designer reference only, not source of truth** |
| `src/components/MessageBubble/MessageBubble.css` | Uses `--ao-chat-msg-bg` / `--ao-chat-msg-text` |
| `src/patterns/MessageInput/MessageInput.css` | Send button uses `--ao-chat-brand` |
| `src/patterns/Modal/Modal.css` | Feedback modal buttons/checkboxes use `--ao-chat-brand` |

---

## Common Mistakes

- Using `--ao-btn-primary-bg` for a chat send button — this resolves to `--ao-surface-brand`
  (fixed), not the accent colour
- Not setting `data-brand-theme` — the `color-mix()` overrides don't activate, so the
  static fallback tokens from `tokens-chat.css` show instead
- Using the hex values from `tokens-chat.css` (`#f0f3ff`, `#0f406b`) as if they're correct —
  they're only correct for the default blue brand
