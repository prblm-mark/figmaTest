# Capture runbook — one phase of PLAN.md

Figma file `Lus07xi8pPXLN87sQIyrEt`. Dev server `npm start` → http://localhost:8080 (start it if
`curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/index.html` isn't 200).
Never capture dark. Never edit files under src/. One Chrome tab only.

## 0. Before you start
- Read `tools/capture/PLAN.md` for this phase's states.
- Figma: create the phase's page right after the last screen page under "——— Screens ———"
  (if it doesn't exist yet). Note its page id.
- Chrome MCP: `tabs_context_mcp {createIfEmpty:true}` → use that tab for everything.

## 1. For each state × width (1728 always; 390 unless the state is desktop-only, e.g. Full width)
Do states in rounds of 4 captures to keep processing overlapped:
1. `generate_figma_design {fileKey, nodeId: <page id>}` → capture ID.
2. Navigate the tab to
   `http://localhost:8080/tools/capture/harness.html?src=<URL-encoded /src/... path incl. its own ?query>&w=<1728|390>[&do=<steps>][&tall=0][&settle=<ms>]`
   `#figmacapture=<ID>&figmaendpoint=https%3A%2F%2Fmcp.figma.com%2Fmcp%2Fcapture%2F<ID>%2Fsubmit%3FbindVariables%3Dtrue&figmadelay=1500`
   - `do=` steps (`;`-separated, URL-encode the whole value): `click:<sel>`, `clickall:<sel>|<n>`,
     `type:<sel>=<text>`, `cls:<sel>=+a,-b`, `attr:<sel>=<a>=<v>`, `wait:<ms>`, `eval:<js>`.
   - ALWAYS add `&title=<URL-encoded "Screen · State · Desktop|Mobile">` — the frame lands
     with that name, so there is no guessing which capture is which (Phase 1 had to match
     frames by width/order/height because every capture of a page shares its title).
   - Modal / overlay states: add `&tall=0` (viewport-height frame).
   - Dropdowns/menus: the capture does NOT keep z-index — an open menu can land UNDER later
     content (Phase 1: Edit Columns menu under the table). After post-processing, screenshot
     every overlay state; if it's buried, move the menu node to the frame root
     (`layoutPositioning='ABSOLUTE'`, same absolute x/y) in both Light and Dark.
   - Mobile: many desktop controls are hidden at 390 (search field, some menus). If the
     state can't be shown on mobile, capture desktop only and say so in the report.
   - Dry-run an UNTESTED interactive state first WITHOUT the hash, then read
     `document.getElementById('status').textContent` — "NOT FOUND: <sel>" means fix the selector.
3. Wait 14 s before navigating to the next capture (lets capture.js submit).
4. When the round is submitted, poll: list the page's top-level frames with use_figma
   (status from generate_figma_design lags by a minute; a new frame named
   "<page title> — Affino Control Centre" means it landed). Captures take ~60–90 s.

## 2. Post-process EVERY landed frame
Read `tools/capture/postprocess.figma.js`, replace `__FRAME__` with the frame id and `__NAME__`
with `"<Screen> · <State> · <Desktop|Mobile>"`, and run it with `use_figma`. It returns
`{light, dark, size, remapped, stripped, pins, missing, logos}`.
- `missing` must be `{}` — otherwise list the names in the report.
- Desktop size must be 1728 wide, mobile 390 wide.

## 3. Lay out the page
Rows = states in PLAN.md order; columns: Desktop Light (x=0) · Desktop Dark (x=1888) ·
Mobile Light (x=3936) · Mobile Dark (x=4486). Row gap 400 below the tallest frame in the row.
Add a text label (Inter Semi Bold 48, bound to text/primary) 160 above each row: "<Screen> · <State>".

## 4. Finish
- Screenshot ONE dark desktop frame and ONE dark mobile frame at scale ~0.3 and look for anything
  light-on-light / broken.
- Navigate the tab to `http://localhost:8080/tools/capture/harness.html?restore=1`, then close the tab.
- Report: page id, states captured, any failures (state + reason), any `missing` variables,
  anything that looked wrong in the dark check. Do NOT retry a failing state more than twice.
