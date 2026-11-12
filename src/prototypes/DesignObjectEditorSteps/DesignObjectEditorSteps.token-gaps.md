# Design Object Editor (steps) — token gaps

Every colour, size, spacing, radius and font value here is an existing `--ao-*` token. These are
the remaining points for the design owner to review:

| What | Where | Note |
|---|---|---|
| Baseline is reconstructed, not copied | whole `BASELINE` block | Lion's redesign was not deployed on 2026-11-10 (DO 99 opened a half-rendered older editor), so the baseline was rebuilt from the 2026-11-09 visit: class names, field lists, menu items and screenshots. Spacing and size values are matched by eye, not read from Luismi's CSS. Re-check against lion once his build is back up. |
| Tool buttons copy the full prototype's `.doe-ibtn--sm` | Step 1, `.cc-p-doe--s1 .cc-p-doe__tool` | 24px box, `--ao-border-primary` border, `--ao-radius-sm`, 12px icon. Generic surface/border tokens, so they may want their own component tokens if they stay. |
| Design-object purple, script orange | Step 1 icons, Step 4 "Used in" badge | `--ao-accent-purple-*` / `--ao-accent-orange-*` used as semantic roles, same as the full prototype. |
| `text-transform: uppercase` | `.cc-p-doe__psub`, `.cc-p-doe__pick-cat` | Small group labels. No token involved. |
| Wrap removed from the baseline | `rowPropsPanel()` and the step-6 row panel | Deliberate difference from lion: Row Properties on lion still has a **Wrap** checkbox, but it is deprecated (Mark, 2026-11-10), so neither the baseline nor any step offers it. |
| Narrow-cell floor uses a spacing token | Step 6, `--doe-cell-floor` | `--ao-spacing-13` (5rem) is used as a width because no `--ao-size-*` step is that small (the scale starts at 8rem). The comparison floor is `calc(var(--ao-spacing-5) * 16)` = 16rem; there is no 16rem size token (15rem / 17.5rem either side). The 160px compact threshold is a raw container-query value, because `@container` can't read a custom property. |
