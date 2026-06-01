# /lucide-fill

Generate a filled (solid) version of a Lucide icon by adding
`fill="currentColor"` to the source SVG, and save it to
`tools/lucide-filled/<name>.svg` so the designer can drop it into Figma.

Background: Lucide icons are stroke-only by default. The Lucide Solid
project (https://lucide.dev/guide/solid/advanced/filled-icons) shows that
adding `fill="currentColor"` alongside the existing `stroke="currentColor"`
fills the icon's enclosed regions while keeping the crisp stroke edges. This
skill applies that transformation to the source SVG so the same effect
shows up wherever the SVG is dropped — including Figma.

Usage:
- `/lucide-fill <icon-name>` — single icon (kebab-case)
- `/lucide-fill <name1>,<name2>,<name3>` — bulk (comma-separated, no spaces)

## Process

For each icon name:

1. **Fetch the source SVG** from
   `https://unpkg.com/lucide-static@latest/icons/<name>.svg`. This is the
   official Lucide icon source — the same SVG the runtime renders.
2. **Verify the fetch** — if the response is 404, report the failure with a
   suggestion to check the spelling against `https://lucide.dev/icons` and
   stop. Do NOT silently emit an empty file.
3. **Transform** the SVG: every Lucide source SVG carries `fill="none"` on
   the root `<svg>` element. **Replace** that string with
   `fill="currentColor"` — do not insert a second `fill` attribute, since
   SVG parsers are inconsistent about duplicate-attribute precedence and
   Figma's importer in particular tends to honour the later one (which
   would silently keep the icon as outline-only). Keep the existing
   `stroke="currentColor"` and all other attributes. Do NOT modify path
   data or stroke-related attributes (`stroke-width`, `stroke-linecap`,
   `stroke-linejoin`).
4. **Closed-path heuristic** — scan the SVG for SVG closepath commands
   (`Z` OR `z` — Lucide source uses lowercase `z` predominantly) or
   `<circle>` / `<rect>` / `<polygon>` / `<ellipse>` elements. If none of
   these are present (i.e. the icon is purely open polylines like
   `chevron-right` or `arrow-up`), warn the user that the resulting
   filled icon will look identical to the outline version — but still
   write the file. The user is the judge.

   In Bash, restrict the grep to closepath patterns inside path data so
   class names like `lucide-zap` / `lucide-zoom-in` don't false-positive:
   `grep -qE '([Zz]"|<circle|<rect|<polygon|<ellipse)'` — the `[Zz]"`
   matches a closepath command at the end of a `d="…"` path attribute.
5. **Save** to `tools/lucide-filled/<name>.svg` (create the directory if it
   doesn't exist). Overwrite if it already exists.
6. **Report**: print the absolute path of the generated file. If running on
   macOS, optionally `open tools/lucide-filled/` to surface the directory in
   Finder so the designer can drag-and-drop into Figma.

## Implementation hints

- Use `curl -fsSL` so a 404 returns a non-zero exit code instead of writing
  an empty file. Capture the body to a variable, validate it starts with
  `<svg `, then write to disk.
- The simplest reliable transformation is `sed 's|fill="none"|fill="currentColor"|'`.
  Lucide source SVGs always include the literal substring `fill="none"`
  exactly once (on the root element), so a single replace is sufficient
  and idempotent. Do NOT try to insert after `<svg ` — Lucide's source
  formats the opening tag with newlines between attributes, so a naïve
  pattern misses.
- For bulk input, split on `,` and run the steps above in a single Bash
  call (a `for name in ...; do … done` loop) so the user gets one
  consolidated success/failure report. Use a portable splitter like
  `for NAME in $(echo "$INPUT" | tr ',' ' '); do …` rather than
  `read -ra` — the system shell here is zsh, which doesn't support
  bash's `read -ra` syntax. If you need bash-only features, wrap the
  whole block in `bash -c '…'`.

## Notes for the user

- Only icons with closed shapes (star, heart, bookmark, bell, circle-check,
  flag, square, circle, etc.) benefit visually from the fill. Open-polyline
  icons (chevrons, arrows) won't change.
- The output directory `tools/lucide-filled/` is tracked in git so the
  designer can grab the assets via the repo. Adjust if you'd rather have
  them in `refs/` (gitignored) — change the destination path in this file.
- Once imported into Figma, the designer should add the filled icon as a
  new variant on the existing Lucide icon component (e.g. `Style: Outline |
  Filled`) rather than as a separate component, so consumers can switch
  between outline and filled via a Figma property.
