# /build-prototype

Build a multi-screen prototype from a written description using the design system, then push
all screens as frames to Figma.

Usage: `/build-prototype <description of the flow>`

This is the **Code → Figma** direction. It is the opposite of `/build-component` (Figma → Code).
No Figma source is needed — start from a written description and use existing components + tokens.

---

## Key principles

- **Reuse, don't build.** Every UI element must come from the existing component library
  (`src/components/` and `src/patterns/`). If a required element doesn't exist as a component,
  stop and use `/build-component` to build it first.
- **Tokens only.** All CSS values must use `--ai-*` tokens. Same rules as component building.
  The one standing exception: card drop-shadows may use the pre-approved raw value
  `0 0 20px rgba(0, 0, 0, 0.05), 0 2px 2px rgba(0, 0, 0, 0.1)` until shadow tokens exist.
- **Real screens, not demos.** Prototype pages look like product screens — centred card or
  full-page layout — not the component-demo wrapper style used in `<Name>.html` demo files.
- **One file per screen.** Each screen in the flow gets its own `.html` file. Shared layout
  and prototype-specific styles go in a single `<PrototypeName>.css` file.

---

## Process (follow every step in order)

### 1. Plan the screens

Read the description and produce a screen list before writing any code:

```
Flow: Two-step Registration
Screens:
  1. step-1.html — Account credentials (email, password, confirm password)
  2. step-2.html — Profile details (name, company, job title)
Shared: Registration.css
```

For each screen, list:
- The existing components it uses (e.g. Input, Button, Header)
- Any prototype-only UI elements needed (e.g. step indicator, progress bar)
- Navigation links between screens (which button goes where)

Check `src/components/` and `src/patterns/` for every component listed. If any is missing,
**stop and build it first** using `/build-component` before continuing.

### 2. Confirm with the user

Present the screen list and component inventory. Ask:
- Is the screen list correct? Any screens to add or remove?
- Are there any content/copy requirements?

Do not write any files until the user confirms.

### 3. Build the files

**Directory:** `src/prototypes/<PrototypeName>/`

**CSS (`<PrototypeName>.css`):**
- Prototype-specific layout only — page centering, card wrapper, progress indicators, etc.
- All component styles come from the component CSS files (linked in each HTML page)
- Never duplicate or override component styles — compose them
- Use only `--ai-*` tokens (see CLAUDE.md §2 for the full token reference)
- BEM naming for any new prototype-specific elements (e.g. `.reg-steps`, `.reg-card`)

**HTML (one per screen):**
- `<!doctype html>` with `lang="en"`
- `<meta charset="utf-8">` and `<meta name="viewport" ...>`
- Dark mode toggle script **before** any `<link>` stylesheets (prevents FOUC):
  `<script src="../../components/dark-mode-toggle.js"></script>`
- Link `../../styles/base.css` first, then component CSS files, then the prototype CSS
- Component CSS link paths:
  - `../../components/<Name>/<Name>.css` for component-tier
  - `../../patterns/<Name>/<Name>.css` for pattern-tier
- Semantic HTML for page structure
- Navigation between screens via `onclick="location.href='step-N.html'"` on buttons
- Lucide CDN script at the bottom: `<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>`
- `<script>lucide.createIcons();</script>` immediately after

**Never add the capture script to the HTML source.** It is injected temporarily during
capture only (Step 5) and removed immediately after (Step 6).

### 4. Start the dev server

Check if the dev server is already running:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/
```

If it returns 200, it's running. Note the port.
If not, start it:
```bash
npm start
```

Check the output for the actual port (may be 8081 if 8080 is taken). Verify each screen
loads with a 200 response before proceeding.

### 5. Capture all screens to Figma

**Step 5a — Generate one capture ID per screen (all upfront):**

Call `generate_figma_design` once per screen with `outputMode: "existingFile"` and
`fileKey: "Lus07xi8pPXLN87sQIyrEt"` (the Affino AI / Design System file).

Each call returns a unique `captureId`. Record all of them before proceeding.
Never reuse a capture ID across screens.

**Step 5b — Inject the capture script into all HTML files:**

For each screen, add this line immediately after the `<meta name="viewport">` tag:
```html
<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
```

**Step 5c — Open all screens simultaneously:**

One `open` command per screen, each with its own capture hash:
```
http://localhost:<port>/src/prototypes/<Name>/step-N.html#figmacapture=<captureId>&figmaendpoint=https%3A%2F%2Fmcp.figma.com%2Fmcp%2Fcapture%2F<captureId>%2Fsubmit&figmadelay=1000
```

Run all `open` commands in a single Bash call (chain with `&&`).

**Step 5d — Poll until all captures complete:**

Wait 6 seconds, then call `generate_figma_design` with each `captureId`.
Any that return `pending` or `processing`: wait 5 seconds and poll again.
Any that return `completed`: record the Figma node URL.
Repeat until ALL captures are `completed`.

Never generate a new capture ID while polling an existing one.
Never stop after only 1–2 polls — keep going until every screen is confirmed `completed`.

### 6. Remove capture scripts

For every HTML file that had the capture script injected, remove it:
```html
<!-- Remove this line: -->
<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
```

Do this for ALL screens in a single operation. Do not leave capture scripts in the source.

### 7. Report

Output a summary:
```
Prototype: Registration (2 screens)

Screen                   Figma URL
──────────────────────   ─────────────────────────────────────────────
Step 1 — Account         https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt?node-id=XXXX
Step 2 — Profile         https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt?node-id=YYYY

Files: src/prototypes/Registration/
```

---

## File structure reference

```
src/prototypes/
└── <PrototypeName>/
    ├── <PrototypeName>.css    shared prototype layout styles
    ├── step-1.html            screen 1
    ├── step-2.html            screen 2
    └── ...                   one file per screen
```

---

## Token reference (quick)

Full tables in CLAUDE.md §2. Most-used in prototypes:

| Need | Token |
|---|---|
| Page background | `--ai-surface-secondary` |
| Card background | `--ai-surface-primary` |
| Card radius | `--ai-radius-lg` |
| Card padding | `--ai-spacing-7` (32px) |
| Card width | `--ai-size-7` (384px) — or wider for multi-column layouts |
| Heading | `--ai-font-fluid-xl` + `--ai-font-bold` + `--ai-font-title` |
| Body text | `--ai-font-fixed-xs` + `--ai-font-regular` + `--ai-font-body` |
| Spacing between fields | `--ai-spacing-5` (16px) |
| Action row gap | `--ai-spacing-3` (8px) |

---

## Common patterns

### Step indicator (numbered dots + connecting line)

```html
<nav class="proto-steps" aria-label="Progress">
  <div class="proto-step proto-step--complete">
    <div class="proto-step__dot"><i data-lucide="check" aria-hidden="true"></i></div>
    <span class="proto-step__label">Step 1</span>
  </div>
  <div class="proto-steps__line" aria-hidden="true"></div>
  <div class="proto-step proto-step--active">
    <div class="proto-step__dot" aria-current="step">2</div>
    <span class="proto-step__label">Step 2</span>
  </div>
</nav>
```

```css
.proto-steps { display: flex; align-items: flex-start; margin-bottom: var(--ai-spacing-7); }
.proto-step { display: flex; flex-direction: column; align-items: center; gap: var(--ai-spacing-2); }
.proto-step__dot {
  width: var(--ai-spacing-7); height: var(--ai-spacing-7);
  border-radius: var(--ai-radius-full);
  background: var(--ai-surface-primary); border: 1px solid var(--ai-border-secondary);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--ai-font-body); font-size: var(--ai-font-fixed-xs);
  font-weight: var(--ai-font-semibold); color: var(--ai-text-contrast);
}
.proto-step__dot [data-lucide] { width: var(--ai-icon-size-sm); height: var(--ai-icon-size-sm); }
.proto-step--active .proto-step__dot { background: var(--ai-surface-brand); border-color: var(--ai-surface-brand); color: var(--ai-btn-primary-text); }
.proto-step--complete .proto-step__dot { background: var(--ai-surface-success); border-color: var(--ai-surface-success); color: var(--ai-btn-primary-text); }
.proto-step__label { font-family: var(--ai-font-body); font-size: var(--ai-font-fixed-xxs); font-weight: var(--ai-font-medium); color: var(--ai-text-contrast); }
.proto-step--active .proto-step__label, .proto-step--complete .proto-step__label { color: var(--ai-text-primary); }
.proto-steps__line { flex: 1; height: 1px; background: var(--ai-border-secondary); margin-top: var(--ai-spacing-5); }
```

### Centred card page

```css
body {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--ai-surface-secondary); padding: var(--ai-spacing-6);
}
.proto-card {
  background: var(--ai-surface-primary); border-radius: var(--ai-radius-lg);
  padding: var(--ai-spacing-7); width: var(--ai-size-7); max-width: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05), 0 2px 2px rgba(0, 0, 0, 0.1);
}
```

### Screen-to-screen navigation

```html
<!-- Navigate forward -->
<button class="btn btn--primary" onclick="location.href='step-2.html'; return false;">
  Continue <i data-lucide="arrow-right" aria-hidden="true"></i>
</button>

<!-- Navigate back -->
<button class="btn btn--tertiary" onclick="location.href='step-1.html'">
  <i data-lucide="arrow-left" aria-hidden="true"></i> Back
</button>
```
