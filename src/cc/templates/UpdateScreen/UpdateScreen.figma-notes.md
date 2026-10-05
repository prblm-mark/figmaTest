# UpdateScreen (CC) — Figma Notes

`/control/update` on the v3 framework, for **TASK-470993** (Lynx / Luismi, `no-design`).
Classic source: `AfcControl/CC/Update.cfm` on affino.com.

## Figma Node

**None.** The task is labelled `no-design`: the screen is assembled from existing, Figma-built parts
on the ControlScreen shell, so there's no frame to build from. Mark approved a v3 demo (2026-10-02) so
the backend has a concrete target, and approved confirmation before destructive actions.

## Composition

| Part | From | Notes |
|---|---|---|
| Shell | ControlScreen (cloned from ControlHub.html) | Breadcrumb Zone Selector › System › Update; header title only, no actions |
| Warning | Alert `--warning` (`--fixed` in full width) | Merges classic's two texts: run when usage is low, plus how long updates take |
| Result banner | Alert `--success` / `--danger` | "&lt;update type&gt; successful / failed", classic's own wording (`sUpdateType`) |
| Groups | RecordSection (`--full` in full width) | Classic's two blank "delimiter" rows become two sections. **Titles "Updates" / "Maintenance" are proposals.** Classic has none |
| Rows | FieldRow `--paragraph` + a third `<dd class="cc-update__run">` | Label = action, value = classic description (+ extras), trailing Button |
| Actions | Button `--secondary --sm` | "Open" + external-link (new tab) for Release Notes / Updater; "Run" for the rest |
| Counts | Badge `--sm --neutral` | Skins count, Guest / Bot cache counts, CDN version |
| Zone | Select `sel__control--sm`, `size-2` wide | Clear Cache only. Sits **inline beside Run** with no visible label (`aria-label="Zone to clear"`), Flowbite-style (designer, 2026-10-02; was stacked under the text with a "Zone" label). Re-counts the badges |
| Confirm | Modal `--sm` | System, Re-Initialize, Clear Cache, CDN Files, Reset Scheduled Tasks |

## Running state (designer, 2026-10-02)

While an action runs, its row shows a status block under the description, and every other Run button is
disabled so two updates can't overlap.

| Actions | Shows | Cancel |
|---|---|---|
| Update All Skins, Update Internal Links (`data-update-total`) | Spinner `--sm --brand` + "Updating skins… 34 of 128" + progress bar | Yes: Run becomes **Cancel** |
| The other eight | Spinner + "Running…" | No: each is a single server step, with nothing to stop part-way |

- **Progress bar:** RoomCard's Figma-built bar, token for token (`spacing-2` tall, `radius-full`, `surface-contrast` track,
  `surface-brand` fill). The fill eases with `--ai-transition-default`, and doesn't under reduced motion.
- **Outcome banners:** success "… successful · 128 of 128 skins updated."; cancel (Alert `--warning`) "… cancelled · 34 of 128 skins
  updated."; failure (Alert `--danger`) "… failed · 384 of 640 links updated before it stopped."
- **a11y:** the status block is `role="status"`, the row gets `aria-busy`, the Cancel button is labelled "Cancel Update All Skins", and
  focus returns to the button when the job ends.

## Rows (classic order and copy)

| Key (`uKey`) | Label | SSC | Kind | Confirm |
|---|---|---|---|---|
| releasenotes | Release Notes | 2 | open (new tab) | — |
| updater | Affino Updater | 2 | open (new tab) | — |
| system | System | 1 | run | ✓ |
| designelements | Design Elements | 1 | run | — |
| skins | Update All Skins | 1 | popup | — |
| ReInitialize | Re-Initialize | 1 | run | ✓ |
| ClearGuestCache | Clear Cache | 1 | popup | ✓ |
| cdn | CDN Files | 1 | run | ✓ |
| RegionsAndCities | Regions and Cities | 1 | run | — |
| ResetScheduledTasks | Reset Scheduled Tasks | 1 | run | ✓ |
| UpdateInternalLinks | Update Internal Links | 1 | popup | — |
| UpdateAIPrompts | Update AI Prompts | 1 | run | — |

Classic also adds **Update Zone Skins** when reached with `?Action=UpdateZoneSkins&ZoneCode=n`, and
auto-opens the skins popup for `Action=UpdateAllSkins` / `UpdateZoneSkins`. Both are kept for the backend
(see Backend), but not drawn.

## Layout values (all borrowed, no new tokens)

| Property | Token | Borrowed from |
|---|---|---|
| Page gap | `spacing-5` (0 in full width) | RecordScreen card gap |
| Row value column gap | `spacing-3` | FieldRow stacked label → value gap |
| Count badges gap | `spacing-2` | `.field-row__tags` |
| Zone select width | `size-2` (160px) | — |
| Action column gap (select ↔ Run) | `spacing-3` | the value column's gap |
| Card border / shadow | `border/card`, `shadow/2xs` (standard only) | The CC top-level card rule |

## Backend (`TODO(backend:UpdateScreen)`, manifest `update-actions`)

- Run → `GET {thisDoc}?uKey=<key>&update=1`; the server renders the result banner.
- Popups stay dialogs: `DC_UpdateSkins.cfm?clearcache=1[&ZoneCode=]`, `ClearGuestCache.cfm?ZoneCode=`,
  `UpdateInternalLinksPopup.cfm`.
- Rows render only when the user's SSC list contains `data-ssc`.
- Counts are live: skins assigned to channels, `PageCache` Guest / Bot, `Site.CDNVersion`. The zone re-count
  goes via `PageCache.cfc?method=GetClearCacheCount&zonecode=` → `{GUESTCOUNT, BOTCOUNT}`.
- CDN bumps `Site.CDNVersion`, then reloads with `?clearcache=1`.
- **Flag:** classic's inline `uKey=ClearGuestCache` branch runs `DELETE FROM PageCache` with no zone filter,
  while the popup path takes the zone. Keep the zone-aware path.
- Confirmation before the five destructive actions is **new behaviour** and needs Luismi's agreement.
- **Progress + cancel is new and needs two endpoints:** a status feed for the long jobs (skins, internal links),
  e.g. `GET …/status?job=<id>` → `{done, total, state}`, polled; and `POST …/cancel?job=<id>`, which stops after the
  current item and reports `done`. Classic runs these in Boxy popups, so v3 shows the progress inline instead.

## Demo switches

`?fail=<key>` previews a failure for that action (progressive ones stop at about 60%). `?ssc=1` previews a user without SSC 2 (hides Release
Notes / Updater).
