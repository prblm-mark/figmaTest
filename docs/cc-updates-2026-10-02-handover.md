# Control Centre design updates: handover, 1–2 October 2026

**From:** Mark (design), via Shaz · **To:** Luismi / Lynx (backend)
**Repo:** `prblm-mark/figmaTest`, branch `main`. Covers every commit from `0a27e8bda` to the commit
that adds this file, made after the record-screens v1 handover (`b160f6f49`, see
[`record-screens-handover.md`](record-screens-handover.md), sent as TASK-527675).

**What this is.** A design pass across the CC shell, the four listing screens, the six record screens
and the Seating Planner: a new Orders totals panel, one card treatment (border + shadow) everywhere,
full-width and dark-mode fixes, two token changes, a new `border/card` token, and one behaviour change
(full width closes the sidebar menu). **Lynx: please bring the live pages in line with all of it.** §2
lists the files, §3 the changes, §4 how to check each one, and §5 what needs backend data.

The demo is the source of truth, ahead of Figma, as agreed on TASK-446102. Run
`npm install && npm run tokens && npm start`, then open the URLs in §4.

---

## 1. Rules that come with this pass

1. **Two border tokens, one rule.** Top-level panels use `--ai-border-card`, and so do their own inner
   dividers. Cards INSIDE a panel keep `--ai-border-secondary`, which is deliberately more prominent.
   The two are identical except in **CC dark**, where card is Grey/750 `#293548` and secondary is
   Grey/700 `#334155`. So in CC dark the nested cards must look a touch brighter than the panel around
   them. That's intended; please don't "fix" it.
2. **Card shadow.** Top-level cards carry `--ai-shadow-2xs` in standard width and **none in full width**.
   Nested cards keep their own Figma shadows. The one exception is ViewerItem, which now has no shadow.
3. **Full width is flat.** No scroll shadows of any kind in full width. Standard width shows
   `--ai-shadow-sm` under the header once the page scrolls.
4. **Money is GBP-first.** Pound-sterling Lucide icons (`receipt-pound-sterling`, `badge-pound-sterling`);
   `receipt` and `dollar-sign` are not used. £ is always the headline figure, and other currencies follow.
5. As before: tokens only (`--ai-*`), container queries not `matchMedia`, and the record-screen HTML is
   **generated**. Edit `record_markup.py` and run `python3 _generate.py`, never the HTML.

---

## 2. Files to port

| File | What changed |
|---|---|
| `FigmaTokens/Semantic/*.tokens.json` (all 6) | New `border/card`. CCDark: `cc/header/secondary-bg` → Grey/800, `surface/extra-minimal` → Grey/750, `button/secondary-border` → Grey/600 |
| `css/tokens*.css` | **Generated.** Regenerate with `npm run tokens` from the JSON above; don't hand-copy |
| `src/cc/templates/ControlScreen/ControlScreen.css` | Shell: full-width scroll line, scrollbar track rule, dark chrome fixes, header-group scroll shadow, full-width icon swap |
| `src/cc/templates/ControlScreen/control-width.js` | Scroll state (`.cc-control__chrome--scrolled`), and `trigger:'toggle'` on the `cc:width` event |
| `src/cc/patterns/SidebarMenu/sidebar-menu.js` | Closes the menu when full width is switched on |
| `src/cc/templates/ListingScreen/ListingScreen.css` / `.html` / `.js` | Orders totals panel, card border + shadow, surface-minimal inputs, full-width totals strip |
| `src/patterns/StatCard/StatCard.css` | New **Size=Xl** variant (code-first, all tokens) |
| `src/cc/templates/RecordScreen/RecordScreen.css` | Card border + shadow on tabs, sections and FactPanels, and the section header divider |
| `src/cc/templates/RecordScreen/record_markup.py` → `_generate.py` | Solid StatCards in the Performance panel (the regenerated HTML is committed) |
| `src/cc/patterns/PerformanceSummary/PerformanceSummary.html` | Solid StatCards (pattern demo) |
| `src/cc/components/ViewerItem/ViewerItem.css` | Shadow removed |
| `src/cc/templates/SeatingPlanner/SeatingPlanner.css` | Card border + shadow, surface-minimal search, shell right padding, full-width/dark fixes |
| Every CC page's rail markup (13 screens) | Full width and Minimise have separate buttons, each carrying two icons |

---

## 3. The changes

### 3.1 Tokens (Figma, 2 Oct)

| Token | Mode | Was | Now |
|---|---|---|---|
| `components/cc/header/secondary-bg` (`--cc-header-secondary-bg`) | CCDark | Grey/700 `#334155` | **Grey/800 `#1E293B`** |
| `surface/extra-minimal` (`--ai-surface-extra-minimal`) | CCDark | Grey/700 `#334155` | **Grey/750 `#293548`**. Text-contrast and brand text on it now pass AA |
| `components/global/button/secondary-border` (`--ai-btn-secondary-border`) | CCDark | Grey/500 `#64748B` | **Grey/600 `#475569`** |
| **NEW** `border/card` (`--ai-border-card`) | all | — | = `border/secondary` in every mode **except CCDark: Grey/750 `#293548`** |

The button border change makes icon-only secondary buttons noticeably fainter in CC dark (1.93:1 on a card).
That's a designer decision, flagged for the record.

### 3.2 CC shell, every CC screen

- **Rail icons:** Full width has its own button (`unfold-horizontal` / `fold-horizontal` when on). Minimise
  is back beside it for the condensed view (`fold-vertical` / `unfold-vertical`), visual only (see §5).
- **Full width closes the sidebar menu.** Switching full width ON from the rail closes any open menu panel,
  docked or flyout. Loading a page already in full width leaves it alone, and switching back re-opens nothing.
- **Scroll state.** `control-width.js` sets `.cc-control__chrome--scrolled` whenever the page's `scrollTop > 0`.
  - Standard width: the header group gets `--ai-shadow-sm` (only when it contains a `.cc-header`).
  - Full width: a 1px `--ai-border-secondary` line appears under the flush chrome instead, drawn as a
    shadow so nothing shifts.
- **Full-width scrollbar:** the page scrollbar's track gets a 1px left rule. WebKit/Blink draw it with
  `::-webkit-scrollbar` at `--ai-spacing-4`, and Firefox keeps `scrollbar-color`.
- **Dark mode, full width:** a left rule on the content column (between the menu and the content), a rule
  under the top nav, and no 1px side padding on the chrome.
- **Dark mode, standard width:** a `spacing-px` gap in `.cc-header-group` draws the line between the top nav
  and the header, and there is no rule under the header (neither the chrome's border nor the RecordHeader's).
- **Page padding:** every CC screen sits 24 / 27 (left / right incl. the 15px scrollbar gutter) at desktop and
  12 / 15 when narrow. The Seating Planner was 24 / 39 and now matches.

### 3.3 Listing screens (Orders, Articles, Article Archive, Media Items)

- **Orders totals panel** (replaces the one-line "Paid Orders Inc Tax: Order Total – … / Payment Total – …"):
  - Two **StatCard Xl** tiles, solid fill: **Order total** (blue, `receipt-pound-sterling`) and **Payments
    received** (jade, `badge-pound-sterling`). The meta line reads "Paid orders · inc tax".
  - GBP is the headline value with a "GBP" unit. Other currencies sit in a ruled breakdown beside it, and
    drop beneath it below 768px.
  - In full width the panel is a flush strip: no outer card, a rule between the tiles and one beneath.
  - Data contract: §5.
- **Cards:** the FilterBar, Datatables and the totals tiles get `--ai-border-card` on their outer edge and
  `--ai-shadow-2xs`, with none in full width.
- **Inputs on `--ai-surface-minimal`:** the saved-views trigger, the search / new-view inputs in the
  FilterBar's top row, and the rows-per-page select. The filter-picker inputs are unchanged.

### 3.4 StatCard: new Size=Xl (code-first)

A grid: head (48px icon block + title / meta) over the value (+ unit), with the breakdown beside it.

| | Desktop | Narrow (`cs-page` ≤ 767) |
|---|---|---|
| Padding | `spacing-5` | `spacing-4` |
| Icon block | `spacing-9`, icon `icon-size-lg` | `spacing-8`, icon `icon-size-md` |
| Value | `font-fixed-xl` bold | `font-fixed-lg` |
| Title ↔ meta gap | `0` (the text column's gap is removed on Xl only) | `0` |

The full spec is in `src/patterns/StatCard/StatCard.figma-notes.md`. StatCard's default border is
`border/secondary`; a screen sets `border/card` where the tile is top-level, as Orders does.

### 3.5 Record screens (View / Edit / Steps, all six)

- **Cards:** RecordTabs, every RecordSection and the sidebar FactPanels get `--ai-border-card` + `--ai-shadow-2xs`,
  in standard width only.
  - In full width the tabs and sections stay flush rules.
  - FactPanels keep `border/card` in full width but drop the shadow.
- **Section header divider:** `.record-section__header` uses `--ai-border-card` in standard width.
- **Performance panel:** the three StatCards are **solid** fill (no `--soft`). The accounts box, chart and StatCards
  inside it stay on `border/secondary` (in-panel).
- **ViewerItem:** no shadow, and the border stays `border/secondary`.

### 3.6 Seating Planner

- **Cards:** the event header, room bar, Tables sheet, Table Detail and empty-state card get `--ai-border-card` +
  `--ai-shadow-2xs` in standard width, along with the event header's `.seating-header__bar` divider.
  - The pinned room bar's `.is-stuck` `shadow-sm` still wins.
  - Room / Table / Attendee cards stay on `border/secondary`.
- **Search:** "Find a table" sits on `--ai-surface-minimal`.
- **Scroll shadow:** the shell's header-group scroll shadow no longer doubles the planner's own chrome shadow.
- **Full width:**
  - no scroll shadows (the chrome's `.is-scrolled` and the room bar's `.is-stuck` are both off);
  - in dark, the event bar's and stuck room bar's top borders are transparent, so there is a single rule under the nav;
  - the page scrollbar's track is `--ai-surface-primary`, matching the sheets.

---

## 4. How to check it

Base URL `http://localhost:8080/src/cc/templates/`. Add `?template=full` for full width and `&theme=dark` for dark.

| Check | URL | Expect |
|---|---|---|
| Totals panel | `ListingScreen/ListingScreen.html` | Two solid tiles, £ headline, USD/EUR beside it; stacked below 768 |
| Totals, full width | `…ListingScreen.html?template=full` | Flush strip, divider between the tiles, no shadow |
| Card border, CC dark | `…ListingScreen.html?theme=dark` | Card edges `#293548`; the FilterBar's inner row divider `#334155` |
| Scroll shadow | any screen, standard, scroll | `shadow-sm` under the header; gone at the top |
| Full-width scroll | any screen, `?template=full`, scroll | 1px line under the header, no shadow |
| Menu closes | any screen with the menu open → rail Full width | Menu panel closes; toggling back doesn't re-open it |
| Dark standard header | `ControlScreen/ControlScreen.html?theme=dark` | 1px line between the top nav and the header, none under the header |
| Record cards | `RecordScreen/ArticleView.html?theme=dark` | Sections/panels `#293548` + shadow; Performance StatCards solid, nested boxes `#334155` |
| Planner padding | `SeatingPlanner/SeatingPlanner.html?state=plan` | Content 24 left / 27 right |
| Planner full, dark | `…?state=plan&template=full&theme=dark` | One rule under the nav, no shadow on scroll, scrollbar track the panel colour |

---

## 5. Needs backend

| Marker | Needs |
|---|---|
| `listing-orders-totals` (new) | Return totals with the rows payload, over the **same filtered set**: `{ totals:{ scope:'paid', incTax:bool, order:[{currency,amount}], payment:[{currency,amount}] } }`, **GBP first**. Render GBP as the headline, the rest as breakdown items; a currency with no figure is omitted. **Exclude Tax** flips `incTax` and the meta line from "inc tax" to "ex tax". Format server-side or pass ISO codes for `Intl.NumberFormat`. |
| `minimise` (split out 1 Oct) | The rail Minimise button is visual only. Toggle `data-layout="minimised"` on the shell (tokens exist in `css/tokens-minimised.css`), set `aria-pressed`, persist per user. |
| `full-width-preference` | Unchanged: the per-viewer choice is localStorage today; a server-side per-user preference is the backend item. |

Full contracts are in `HANDOVER.md` and `docs/handover-manifest.json`.

---

## 6. Known / for design

- **Figma is behind the code:**
  - ViewerItem (`3865:1977`) still has its shadow.
  - StatCard Size=Xl and the Orders panel exist only as captures (Prototypes page `3956:1383`, `3957:1383`,
    `3958:1383`), which predate the later polish.
  - Build from the demo.
- **Seating Planner Control button:** it ships marked active while its menu panel is hidden, so the first click
  appears to do nothing. That's existing behaviour, untouched.
- **Full-width empty states (planner):** the no-event and no-plan screens keep 24px padding around their centred card
  in full width (24 / 36). That's deliberate; Figma only draws the plan view in full width.

Questions back to Mark via Shaz.
