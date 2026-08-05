# /build-prototype

Build a prototype from a description (or reference image) using the design system, then push
all screens as frames to Figma.

**Figma push is MANDATORY — never skip it, never wait for the user to ask.**

Usage: `/build-prototype <description of the flow>`

This is the **Code → Figma** direction. It is the opposite of `/build-component` (Figma → Code).
No Figma source is needed — start from a written description and use existing components + tokens.

**If this run was started by `/hub-job` (unattended):**

- **There is no token STOP in this workflow.** A missing token is recorded in
  `<Name>.token-gaps.md` and the build continues (see Key principles, tier 2). Do **not** escalate a
  token gap from a prototype job — a prototype exists to produce the design decision, so blocking on
  one would stall the pipeline on every genuinely novel design. This is deliberately the opposite of
  `/build-component`, where the decision already exists and the stops are hard.
- **The Step 0 hard stop is the one real stop, and it goes to the requester**, not the design owner.
  A brief asking for a gallery of a component that already exists is a brief-quality problem, not a
  design decision: `send_message` to the requester, mark the job blocked, and do not file a
  `needs-design-decision` task. See `.claude/commands/hub-job.md` § Step 3.
- **Prototypes are committed on `proto/*` branches** in a hub job (never to `main`) — the next
  stage's agent cannot refine what exists only on one machine.
- The `<Name>.token-gaps.md` file must be listed in the completion report and the PR body. It is the
  design owner's review list; an unreported gaps file is the same as a silently guessed value.

**This process also applies to ad-hoc prototype builds** (e.g. user asks "build me a duration
picker prototype" without invoking the skill). If you are building any prototype in
`src/prototypes/`, follow this process — especially Steps 4–7 (Figma push).

---

## Step 0 — HARD STOP: Is this actually a prototype request?

**Before doing ANYTHING else, check whether the request is for a prototype at all.**

A prototype is a **flow / screen / composition** that combines two or more components into a
real product context. A prototype is **NOT** a gallery of one component's variants — that is
what the component's own `<Name>.html` demo file is for.

**Hard stop rule — refuse to proceed if any of these are true:**

1. **The request names a single component that already exists in `src/components/<Name>/`.**
   The component's `<Name>.html` IS the gallery. Building a parallel
   `src/prototypes/<Name>s/` (often pluralised) duplicates work, drifts CSS, and will be
   rejected. Examples that should trigger the stop: "build a Badges prototype" (Badge exists),
   "build a Buttons gallery" (Button exists), "build an Alerts prototype" (Alert exists).

2. **The proposed prototype directory name is the plural of a component name.**
   `src/prototypes/Badges/`, `src/prototypes/Buttons/`, `src/prototypes/Modals/` — the
   plural-of-component name is itself the warning sign.

3. **The brief is a list of variants of one component** (e.g. "show all the colour/size/icon/
   dismissible variations") rather than a flow/screen/composition.

If any of the above are true, **STOP and ask the user**:

> "The {ComponentName} component already exists at `src/components/{ComponentName}/` — its
> `{ComponentName}.html` demo IS the variant gallery. A separate `src/prototypes/{Plural}/`
> would duplicate that work. Do you want me to:
> - **Update the existing component demo** (`src/components/{ComponentName}/{ComponentName}.html`)?
> - **Build a real prototype** that composes {ComponentName} alongside other components into a flow/screen?
> - Something else?"

Wait for confirmation. Never silently build a prototype that mirrors an existing component.

**This rule has been broken more than once** — most recently, a `src/prototypes/Badges/`
gallery was built right after the Badge component itself, exactly duplicating the Badge demo.
Saved as feedback memory `feedback_no_prototype_after_component.md`.

If a prototype request passes Step 0, continue to Key principles below.

---

## Key principles

- **Reuse first, then build with tokens.** Check `src/components/` and `src/patterns/` for
  existing components. If one exists, use it. If it doesn't exist and this is a **full component
  build**, stop and use `/build-component`. If this is a **prototype-only build** (quick
  exploration, not a production component), build the element inline in the prototype CSS
  using design system tokens — do not create files in `src/components/`.
- **Use an existing token wherever one exists — then record the gaps and keep going.**
  A prototype is the thing that *produces* a design decision, so it must not block waiting for one.
  There is **no token STOP in this workflow** (unlike `/build-component`, where the decision has
  already been made and the stops are hard). Three tiers:

  1. **A token exists for this value → use it.** Non-negotiable, and not merely a style rule — see
     "Why tier 1 is non-negotiable" below. Applies to every colour, spacing, radius, font size,
     font weight, font family, line height and icon size, in reused components *and* new
     prototype-only elements.
  2. **No token exists → write the raw value and log it.** Append an entry to
     `src/prototypes/<Name>/<Name>.token-gaps.md`: property, value, element/selector, and what the
     value is *for* (the design intent, not just the number). Then carry on. Do not pause, do not
     ask, do not approximate to a near-miss token to avoid the entry — a wrong token binding is
     worse than an honest gap, because it survives re-tokenisation looking correct.
  3. **Pre-approved raw values** — no log entry needed:
     - Card drop-shadows: `0 0 20px rgba(0, 0, 0, 0.05), 0 2px 2px rgba(0, 0, 0, 0.1)`
     - Border widths (`1px`, `2px`) — optical values, keep as `px`

  The gaps file travels with the prototype (and its PR) as the design owner's review list, and is
  the input to the eventual `/build-component` build — where every gap must be resolved to a token
  or an explicit approval before any component CSS is written.

- **Why tier 1 is non-negotiable.** `generate_figma_design` resolves `var(--ai-*)` to raw values
  during capture, and the Re-tokenise plugin rebinds them afterwards **by value matching only**
  (`inferredVariables`, then hex→variable and float→variable maps; ambiguous matches are skipped —
  see `figma-plugin-retokenise/README.md`). So a value that matches an existing token round-trips
  back to a proper binding, and a value that doesn't **stays raw in Figma permanently.**
  Re-tokenise repairs bindings lost in capture; it cannot invent tokens for novel values. Using an
  existing token where one exists is what makes re-tokenising work at all.

- **Never add new design system tokens.** Prototype CSS may only use `--ai-*` tokens that
  already exist. Do not add new `--ai-*` CSS variables to support prototype elements.
  Recording a gap is **not** minting a token — tier 2 logs the need and moves on; only the design
  owner decides whether a token gets created.
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
`fileKey: "Lus07xi8pPXLN87sQIyrEt"` (the Affino AI / Design System file), plus the `nodeId` of the
destination page — **which page depends on who is running this**:

| Who is building | Destination page | `nodeId` |
|---|---|---|
| **Mark** (this repo, attended) | Prototypes | `2025:803` |
| **The spec team** (Hub-built, e.g. Quang) | Spec Team | `3273:4346` |
| *(superseded versions, moved by hand)* | Spec Team Archive | `3273:4717` |

Both pages live in the same file. **Never cross them.** Mark's page is his working area and the spec
team's output landing in it — or vice versa — makes it impossible to tell reviewed work from
incoming drafts.

**Use the colon form in the API call.** A Figma URL writes the page as `?node-id=3273-4346` with a
hyphen; `generate_figma_design` takes `3273:4346` with a colon. Copying the hyphenated form straight
out of the URL bar is the easy mistake here.

**CAPTURE VIEWPORT WIDTHS — fixed, not whatever the window happens to be.**

| Version | Width | Why |
|---|---|---|
| **Desktop** | **1600px** | Mark, 2026-08-05: fits inside the **Control Centre interface** when composing refined mockups, so a captured frame drops straight into the CC chrome without rescaling |
| **Mobile** | **390px** | iPhone 14/15/16 logical width — the middle of the real range (360 small Android · 375 SE/mini · 412 large Android · 430 Pro Max) |

The capture takes its viewport from the **real Chrome window**, so set the bounds before opening the
capture URL and restore them afterwards:

```bash
osascript -e 'tell application "Google Chrome" to get bounds of front window'   # record first
# desktop: width 1600 · mobile: width 390 — keep the same x/y so the window does not jump
osascript -e 'tell application "Google Chrome" to set bounds of front window to {X, Y, X+1600, Y2}'
# … capture, poll to completion …
osascript -e 'tell application "Google Chrome" to set bounds of front window to {ORIGINAL}'
```

**Headless Chrome cannot be used for this** — it floors the viewport at 500px, so a narrower
`--window-size` crops rather than re-lays-out. Mobile widths are only real in the actual browser. (For
*measuring* a phone layout without capturing, pin the page in a fixed-width iframe and read inside it
with `--allow-file-access-from-files`.)

Desktop and mobile of the same screen are two frames, so their `<title>`s **must differ** — suffix
`· Desktop` / `· Mobile`. Identical titles are what silently destroyed four frames on 2026-07-27.

**Every capture needs a unique, versioned `<title>` — this protects existing frames.** Frame names
come from the document `<title>`, and title identity is **neither a reliable update mechanism nor a
reliable hazard**: on 2026-07-27 a second capture at another viewport *silently destroyed* four
existing frames; on 2026-07-29 re-captures cleanly replaced theirs; on 2026-07-31 ~20 re-captures each
minted a new node. The tool exposes no control over which happens.

So name every screen distinctly, including a version:

```
<TASK-CODE> — <Prototype> — <screen> — v<n>
e.g.  TASK-12345 — CheckoutFlow — step-2 — v3
```

Bump `v<n>` on every re-push; never reuse a title to "update in place". The highest version is
current. Marking the previous one superseded (`[superseded] …`, or moving it to the **Spec Team
Archive** page, `3273:4717`) is a separate manual step — capture cannot rename or move existing nodes. **Nothing
is ever deleted automatically**, because a designer's in-Figma edits exist nowhere else.

For a variant of the same screen (mobile/desktop, light/dark), the titles must differ too — that is
exactly what destroyed the 27 July frames. Suffix the `<title>` (`… · Mobile`) and revert afterwards.

If a brief does not make clear which of the two applies, treat it as Mark's page only when this
command was invoked interactively. A Hub-dispatched job always targets **Spec Team** — see
`.claude/commands/hub-job.md` § Step 4.

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

### 6b. Rebind colours to Semantic — MANDATORY, every push

**A capture binds colours by resolved VALUE, never by token name.** The browser turns
`var(--ai-surface-error)` into `rgb(220,38,38)` before the page is serialised, so neither the capture
nor the Re-tokenise plugin ever sees which token it was. Value is lossy three ways:

- Every **Semantic** variable *aliases* a Primitive, so a semantic and its primitive resolve to the
  same hex — nothing in a value comparison can prefer the semantic layer.
- **One hex spans FAMILIES.** `#67676C` is `--ai-text-contrast` *and* `--ai-icon-secondary`; `#212123`
  is `--ai-text-primary` *and* `--ai-icon-primary`. Only the node says which is meant, so the script
  picks the family from node type + property: TEXT fill → `text/*`, vector fill **or stroke** →
  `icon/*`, other fill → `surface/*`, other stroke → `border/*`.
- Many semantics share one hex *within* a family too — `#FFFFFF` is surface-primary, -elevated-1 and
  -elevated-2. Those need an `OVERRIDES` entry citing the CSS line, or they are reported, not bound.

**Two traps this covers, both found the hard way:**

- **Lucide icons are STROKED vectors, not filled.** A fills-only pass misses every icon — 144 of them
  on one frame, 120 sitting on the `VP/500` primitive.
- **"Already on Semantic" is NOT good enough.** 16 icon strokes were bound to
  `components/chat/…/chat-sidebar-text` — semantic, and the wrong family. The check is whether the
  bound name starts with the family the node calls for.

Measured on `3281:2` (2026-08-05): **79 of 576 colour bindings landed on `Primitives`/`Colours`.**
Those do not follow theme modes, so the frame breaks in dark. This is not an occasional glitch — expect
it on every capture.

**Run it for every frame you push:**

```bash
node scripts/gen-figma-rebind.mjs <nodeId>            # dry run — changes nothing
node scripts/gen-figma-rebind.mjs <nodeId> --apply    # after reading the dry run
```

The generator parses `css/tokens.css` into a hex → token map and emits a `use_figma` payload that
audits the frame **by collection** and rebinds anything off Semantic. Then:

1. **Read the dry run's `UNRESOLVED` list before applying.** Each entry is a colour the map cannot
   settle, because more than one `--ai-*` token shares that hex.
2. **Resolve each one from the prototype's own CSS**, which is the only authoritative source — e.g.
   `.sp-dot--vip { background: var(--ai-surface-neutral) }` settles `#2E2E32` that value matching
   offered fifteen candidates for. Add it to `OVERRIDES` in the generator with the CSS line cited.
3. **Never guess an ambiguous colour.** If the CSS does not settle it, leave it bound to the primitive
   and report it. A wrong semantic looks correct forever; a primitive at least looks wrong in dark.
   **This is not a design decision and must not be escalated as one** — it is a binding question, and
   the answer either exists in the CSS or the prototype has a real token gap worth recording in
   `<Name>.token-gaps.md`.
4. Apply, and check the payload's own re-audit: `nonSemanticRemaining` must be `0`.

**Do not run the Re-tokenise plugin for colour.** Its colour pass matches by value and cannot beat the
CSS-derived map; on a `bindVariables=true` capture it has nothing to add. Re-tokenise is still the right
tool for the **dimensional** properties — radius, padding, gap, stroke weight — which the capture leaves
entirely unbound and where numeric values collide far less than colours do.

### 7. Report

Output a summary and remind the user to re-tokenise:
```
Prototype: Registration (2 screens)

Screen                   Figma URL
──────────────────────   ─────────────────────────────────────────────
Step 1 — Account         https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt?node-id=XXXX
Step 2 — Profile         https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt?node-id=YYYY

Files: src/prototypes/Registration/

Token gaps: 3 recorded → src/prototypes/Registration/Registration.token-gaps.md
  padding: 10px      .reg-card__footer     tighter footer rhythm than spacing-3
  color: #2E4A7D     .reg-card__accent     step-indicator accent, no brand token
  width: 288px       .reg-card             fixed card width (layout, pre-approved)

Colour bindings (step 6b): 412 paints · 412 on Semantic · 0 remaining off it
  rebound  surface/neutral 25 · surface/error 21 · surface/success 18
  UNRESOLVED  none

⚠ Run the Re-tokenise plugin for the DIMENSIONAL properties only — radius,
  padding, gap, stroke weight, which the capture leaves unbound:
  select the frame → Plugins → Development → Re-tokenise
  Colours are already handled by step 6b. Do not use the plugin for colour: it
  matches by value and cannot beat the CSS-derived map.
```

**Always list the token gaps in the report** (or state "Token gaps: none"). They are the design
owner's review list and the input to the later `/build-component` build, where they populate the
`## Token Gaps` section of `<Name>.figma-notes.md`. A gap that is recorded but never surfaced is
functionally a guessed value.

**Always list the step 6b colour-binding result too**, including `UNRESOLVED: none` when there is
nothing outstanding. Silence reads as "handled" — and the first audit of `3281:2` reported
"576 bound, 0 unbound", which looked perfect while 79 of them sat on the wrong collection. Report the
count that matters: how many are **on Semantic**, and how many are not.

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
